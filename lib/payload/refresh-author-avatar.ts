/**
 * Put new bytes behind an author's existing avatar, keeping the media row.
 *
 *   bun run payload:refresh:author-avatar "<name>" <file>          dry run, dev
 *   bun run payload:refresh:author-avatar "<name>" <file> --apply
 *   …--prod                                                        production
 *
 * The row is found through the AUTHOR, never by guessing a filename: a person
 * added through the admin panel owns whatever name their upload happened to
 * carry (prod has `katarzyna-kaptur-headshot-blog.png` where the repo asset is
 * `katarzyna-kaptur.png`), and those names differ per environment exactly the
 * way ids do. Replacing bytes in place keeps the id the author relation points
 * at, which delete-and-recreate would strand.
 *
 * Payload names the stored object after the SOURCE FILE'S BASENAME, not after
 * the row being updated, so the bytes are staged through a temp copy named for
 * the row. Skipping that step cost a production incident: the source was
 * `katarzyna-kaptur.png` against a row named
 * `katarzyna-kaptur-headshot-blog.png`, `clearBlobs` removed the row's real
 * object, and the upload then landed under `katarzyna-kaptur-1.png` because
 * `getSafeFileName` bumps a name it thinks is taken. Every other
 * `replaceMediaBytes` caller happens to pass a path whose basename already
 * equals the row's filename, which is why the trap was invisible.
 *
 * Nothing to purge afterwards: the media hook stamps `?v=<filesize>` on every
 * URL, so new bytes arrive on a URL nothing has cached. `finish()` still
 * revalidates the blog tags, because the author card is rendered into the
 * cached post pages.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { begin, finish, replaceMediaBytes } from '@/lib/payload/media-ops'

const APPLY = process.argv.includes('--apply')
const IS_PROD = process.argv.includes('--prod')
const [name, file] = process.argv.slice(2).filter((a) => !a.startsWith('--'))

if (!(name && file)) {
  throw new Error(
    'usage: refresh-author-avatar.ts "<author name>" <file> [--apply] [--prod]'
  )
}
if (!fs.existsSync(file)) {
  throw new Error(`${file} is not on disk`)
}

const ctx = await begin({
  script: 'refresh-author-avatar',
  prod: IS_PROD,
  apply: APPLY,
  host: 'https://sociallama-v2.vercel.app',
})

const author = (
  await ctx.payload.find({
    collection: 'authors',
    where: { name: { equals: name } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
).docs[0]
if (!author) {
  throw new Error(`no author named "${name}" in this database`)
}

const avatar = author.avatar as { id: number; filename: string } | null
if (!avatar?.filename) {
  throw new Error(`author "${name}" has no avatar to replace`)
}
console.log(`${name} (#${author.id}) → media ${avatar.id} ${avatar.filename}`)

// Stage under the row's own filename — see the header. A no-op copy when the
// two already agree, which is the only case the shared helper was built for.
const staged = path.join(
  fs.mkdtempSync(path.join(os.tmpdir(), 'author-avatar-')),
  avatar.filename
)
fs.copyFileSync(file, staged)

try {
  const verdict = await replaceMediaBytes(ctx, {
    file: avatar.filename,
    fromPath: staged,
    tags: ['posts', 'blog-hub'],
  })
  console.log(`  ${verdict}`)
} finally {
  fs.rmSync(path.dirname(staged), { recursive: true, force: true })
}

await finish(ctx)
process.exit(0)
