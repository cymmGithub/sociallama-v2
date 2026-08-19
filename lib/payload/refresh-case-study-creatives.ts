/**
 * Re-upload approach creatives into the media collection after the files under
 * `public/case-studies/<slug>/` changed.
 *
 * Written for the corner-radius re-cut: `mockup_cutout.py` bakes a rounded
 * corner into a mockup's alpha channel, and when `.shot`'s `border-radius`
 * moved to 24px the 53 `round`-mode cuts had to be re-masked to match. Nothing
 * about it is specific to that pass — any change to a creative's bytes needs
 * this to reach the deployed site.
 *
 * UPDATES the existing media document rather than delete+recreate: pillars
 * reference `approach[].media` by id, so deleting would empty those rows.
 *
 * Run:  bun ./lib/payload/refresh-case-study-creatives.ts <paths...>
 *       bun ./lib/payload/refresh-case-study-creatives.ts --prod <paths...>
 *
 * With no paths it refreshes every `*-cut.webp` on disk, which is idempotent but
 * writes ~90 blobs; naming the changed files keeps a run proportionate.
 *
 * Blob keys and the filename bump behave exactly as in refresh-case-study-logos.ts
 * — read that header before touching either.
 */

import fs from 'node:fs'
import path from 'node:path'
import { targetProdEnv } from '@/lib/payload/prod-env'

const isProd = process.argv.includes('--prod')
if (isProd) {
  targetProdEnv('refresh-case-study-creatives', { blob: true })
}

const root = 'public/case-studies'
const named = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const files =
  named.length > 0
    ? named
    : fs.readdirSync(root).flatMap((slug) => {
        const dir = path.join(root, slug)
        return fs.statSync(dir).isDirectory()
          ? fs
              .readdirSync(dir)
              .filter((f) => f.endsWith('-cut.webp'))
              .map((f) => path.join(dir, f))
          : []
      })

const missingOnDisk = files.filter((f) => !fs.existsSync(f))
if (missingOnDisk.length > 0) {
  throw new Error(`not on disk: ${missingOnDisk.join(', ')}`)
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`Refreshing ${files.length} creatives in: ${dbHost}`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

/** See refresh-case-study-logos.ts — the Blob adapter refuses to overwrite. */
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
  const suffixed = new RegExp(`^${escaped}(-\\d+)?\\.[a-z0-9]{2,5}$`, 'i')
  const { blobs } = await list({ prefix: base, token })
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

let updated = 0
let bumped = 0
let missing = 0
for (const filePath of files) {
  const filename = path.basename(filePath)
  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 2,
    depth: 0,
  })
  const doc = found.docs[0]
  if (!doc) {
    // A file on disk that nothing references. Worth naming rather than
    // counting: it means the cut was produced but never seeded.
    console.log(`  ? no media row for ${filename} — skipped`)
    missing++
    continue
  }
  if (found.docs.length > 1) {
    throw new Error(`${filename} matches ${found.docs.length} media rows`)
  }

  await deleteStaleBlobs(filename)
  let result = await payload.update({
    collection: 'media',
    id: doc.id,
    filePath,
    data: {},
  })
  // `getSafeFileName` bumps a name while a row already owns it, and the check
  // does not exclude the row being updated. One retry settles it.
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
  if (result.filename !== filename) {
    bumped++
    console.log(`  ~ ${result.filename} (id ${doc.id})  !! still bumped`)
  } else {
    console.log(`  ~ ${result.filename} (id ${doc.id})`)
  }
}

console.log(`Done. updated=${updated} bumped=${bumped} missing=${missing}`)
if (isProd) {
  console.log(
    'Writes bypass the deployed app cache — redeploy or revalidate to surface them.'
  )
}
process.exit(0)
