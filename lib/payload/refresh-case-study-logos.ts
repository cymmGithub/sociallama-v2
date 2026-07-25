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
 */

import fs from 'node:fs'
import path from 'node:path'

const isProd = process.argv.includes('--prod')
if (isProd) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('--prod requires DATABASE_URL_PROD in .env.local')
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      '--prod requires BLOB_READ_WRITE_TOKEN, or the new logo bytes would be ' +
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
const logos = fs
  .readdirSync(root)
  .filter((slug) => only.length === 0 || only.includes(slug))
  .map((slug) => path.join(root, slug, `${slug}-logo.png`))
  .filter((p) => fs.existsSync(p))

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

let updated = 0
let missing = 0
for (const filePath of logos) {
  const filename = path.basename(filePath)
  // A previous run may have collided and stored `<base>-1.png`, so match the
  // stem rather than the exact name.
  const stem = filename.replace(/\.png$/, '')
  const found = await payload.find({
    collection: 'media',
    where: { filename: { like: stem } },
    limit: 5,
    depth: 0,
  })
  const doc = found.docs[0]
  if (!doc) {
    console.log(`  ? no media row for ${filename} — skipped`)
    missing++
    continue
  }
  await deleteStaleBlobs(filename)
  await payload.update({
    collection: 'media',
    id: doc.id,
    filePath,
    data: {},
  })
  updated++
  console.log(`  ~ ${filename} (id ${doc.id})`)
}

console.log(`Done. updated=${updated} missing=${missing}`)
if (isProd) {
  console.log(
    'Writes bypass the deployed app cache — redeploy or revalidate to surface them.'
  )
}
process.exit(0)
