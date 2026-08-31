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
 * Nothing to purge afterwards: the media hook stamps `?v=<filesize>` on every
 * URL, so new bytes arrive on a URL nothing has cached. `finish()` still
 * revalidates the blog tags, because the author card is rendered into the
 * cached post pages.
 */

import fs from 'node:fs'
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

const verdict = await replaceMediaBytes(ctx, {
  file: avatar.filename,
  fromPath: file,
  tags: ['posts', 'blog-hub'],
})
console.log(`  ${verdict}`)

await finish(ctx)
process.exit(0)
