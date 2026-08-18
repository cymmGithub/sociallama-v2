/**
 * Re-upload client logos into the media collection after the source files under
 * `public/case-studies/<slug>/` changed (transparency / trimming pass).
 *
 * UPDATES the existing media document rather than delete+recreate: case studies
 * reference `client.logo` by id, so deleting would null those relations. An
 * update swaps the file (and regenerates size variants) with the id intact.
 *
 * Run:  bun ./lib/payload/refresh-case-study-logos.ts            (dev DB)
 *       bun ./lib/payload/refresh-case-study-logos.ts --prod     (DATABASE_URL_PROD)
 *
 * `--prod` needs BLOB_READ_WRITE_TOKEN — see scripts/case-studies/reseed-prod.sh
 * for why (without it the bytes land on local disk while prod rows point at
 * files that don't exist).
 *
 * ONE RUN IS ENOUGH — it used to need two, and the reason is worth keeping.
 * Payload's `getSafeFileName` bumps a name while `docWithFilenameExists` is
 * true, and that check does NOT exclude the document being updated, so
 * re-uploading `x.png` onto the doc that already owns `x.png` yields `x-1.png`.
 * Running again restored it, which is where "run it twice" came from — but the
 * parity is PER ROW, not global: a row whose name is changing (`<slug>-logo.png`
 * → `<slug>-logo-mono.png`) lands clean on the first pass and would be bumped by
 * a second. Counting runs cannot satisfy both, so the loop below re-uploads only
 * the rows that actually came back bumped. Verify with:
 *   filenames matching /-\d+\.png$/ should be 0.
 */

import fs from 'node:fs'
import path from 'node:path'

const isProd = process.argv.includes('--prod')
if (isProd) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('--prod requires DATABASE_URL_PROD in .env.local')
  }
  // The Blob token lives as BLOB_READ_WRITE_TOKEN_PROD so that a plain `bun dev`
  // cannot reach the production store: payload.config.ts enables the Blob plugin
  // whenever BLOB_READ_WRITE_TOKEN is set, so keeping it in .env.local silently
  // pointed every local upload at production. Map it for this one process, the
  // same way DATABASE_URL_PROD is mapped.
  if (process.env.BLOB_READ_WRITE_TOKEN_PROD) {
    process.env.BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN_PROD
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      '--prod requires BLOB_READ_WRITE_TOKEN_PROD, or the new logo bytes would be ' +
        'written to local disk while prod rows point at files that do not exist.'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

// Only the slugs named on the command line, or every logo on disk.
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const root = 'public/case-studies'
// Prefer the monochrome re-cut from `scripts/client-logos/pipeline.py
// --case-studies`, falling back to the colour original where none was produced.
// The colour originals stay in the repo either way — for several clients they
// are the only copy held, and the pipeline reads them as a source.
const logos = fs
  .readdirSync(root)
  .filter((slug) => only.length === 0 || only.includes(slug))
  .map((slug) => {
    const mono = path.join(root, slug, `${slug}-logo-mono.png`)
    const colour = path.join(root, slug, `${slug}-logo.png`)
    const filePath = fs.existsSync(mono) ? mono : colour
    // The media row is still named after the COLOUR original — that is what
    // was seeded — so the lookup keys off that stem even when the bytes being
    // uploaded come from the mono file and rename the row.
    return { slug, filePath, stem: `${slug}-logo` }
  })
  .filter((l) => fs.existsSync(l.filePath))

console.log(`Refreshing ${logos.length} logos in: ${dbHost}`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

/**
 * Remove the blobs at the exact keys Payload will write for `filename` — the
 * original plus its `-WxH` size variants. The Vercel Blob adapter refuses to
 * overwrite ("This blob already exists"), so an in-place file swap has to clear
 * the old keys first. Same approach as migrate-wp.ts's deleteStaleBlobs.
 */
async function deleteStaleBlobs(filename: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return // local-disk uploads overwrite fine
  }
  const { del, list } = await import('@vercel/blob')
  const dot = filename.lastIndexOf('.')
  const base = dot > 0 ? filename.slice(0, dot) : filename
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const variant = new RegExp(`^${escaped}-\\d+x\\d+\\.[a-z0-9]{2,5}$`, 'i')
  const { blobs } = await list({ prefix: base, token })
  const suffixed = new RegExp(`^${escaped}(-\\d+)?\\.[a-z0-9]{2,5}$`, 'i')
  const stale = blobs.filter(
    (b) => suffixed.test(b.pathname) || variant.test(b.pathname)
  )
  if (stale.length > 0) {
    await del(
      stale.map((b) => b.url),
      { token }
    )
  }
}

/**
 * Find the media row a study's logo actually lives in.
 *
 * The filename stem is a guess, and it is wrong often enough to matter:
 * `pracuj-pl`'s row is named `pracuj.png`. The study's own `client.logo`
 * relation is authoritative, so ask that first and keep the stem match only as a
 * fallback for a row that exists but nothing references.
 */
async function findLogoDoc(
  study: { client?: { logo?: unknown } } | undefined,
  stem: string
) {
  const related = study?.client?.logo
  if (typeof related === 'number' || typeof related === 'string') {
    return await payload.findByID({
      collection: 'media',
      id: related,
      depth: 0,
    })
  }
  const found = await payload.find({
    collection: 'media',
    where: { filename: { like: stem } },
    limit: 5,
    depth: 0,
  })
  return found.docs[0] ?? null
}

let updated = 0
let created = 0
let missing = 0
for (const { slug, filePath, stem } of logos) {
  const filename = path.basename(filePath)
  const studies = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const study = studies.docs[0]
  const doc = await findLogoDoc(study, stem)

  if (doc) {
    // Only the keys this run will write. The colour original's blobs are left in
    // place on purpose: dev and prod share one blob store, so deleting
    // `<slug>-logo.png` from a dev run would blank the logos prod still serves.
    // They orphan when prod is refreshed too — sweep them then, not here.
    await deleteStaleBlobs(filename)
    let result = await payload.update({
      collection: 'media',
      id: doc.id,
      filePath,
      data: {},
    })
    // Re-upload if the name got bumped (see the header). One retry always
    // settles it: the bump only happens when the row already owned the clean
    // name, and it no longer does.
    if (result.filename !== filename) {
      await deleteStaleBlobs(filename)
      result = await payload.update({
        collection: 'media',
        id: doc.id,
        filePath,
        data: {},
      })
    }
    updated++
    console.log(
      `  ~ ${result.filename} (id ${doc.id})` +
        (result.filename === filename ? '' : '  !! still bumped')
    )
    continue
  }

  // No row at all. `skibooking` is the case this exists for: it had no logo
  // asset, so the card fell back to the client name as text. Create the media
  // row and attach it, rather than leaving the one study that needed this change
  // most as the only one it did not reach.
  if (!study) {
    console.log(`  ? no case study or media row for ${filename} — skipped`)
    missing++
    continue
  }
  const client = (study as { client: { name: string } }).client
  // The same clear-then-write the update branch does, for the same reason: the
  // Blob adapter refuses to overwrite. It is needed on this path too because dev
  // and prod share one store, so a dev run of this script has already written
  // this exact key — the create fails even though no media ROW owns the name.
  // The identical bytes go straight back to the same deterministic key, so a dev
  // row pointing at it keeps resolving.
  await deleteStaleBlobs(filename)
  const media = await payload.create({
    collection: 'media',
    filePath,
    data: { alt: `Logo ${client.name}` },
  })
  await payload.update({
    collection: 'case-studies',
    id: study.id,
    // Spread the existing group: a partial group write can drop its siblings,
    // and `about` is localized — read back under the default locale and written
    // straight back, it is a no-op there and leaves the other locale alone.
    data: { client: { ...client, logo: media.id } },
  })
  created++
  console.log(`  + ${filename} (id ${media.id}) → ${slug}.client.logo`)
}

console.log(`Done. updated=${updated} created=${created} missing=${missing}`)
if (isProd) {
  console.log(
    'Writes bypass the deployed app cache — redeploy or revalidate to surface them.'
  )
}
process.exit(0)
