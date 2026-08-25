/**
 * Blog-post importer — creates/updates a PL draft from authored sources.
 *
 *   bun run payload:import:post <slug>            dev DB, draft
 *   bun run payload:import:post <slug> --publish  …and publish it
 *   bun run payload:import:post <slug> --prod     production
 *
 * Reads `content/posts/<slug>/post.json` (metadata) and `source.pl.md`
 * (markdown body), converts the markdown to Lexical with the project's own
 * editor config, resolves category and author in the TARGET database — ids
 * differ per environment, so both are keyed by slug/name, never by id — and
 * upserts the post as a DRAFT in locale `pl`. Idempotent by slug: re-running
 * updates the same draft.
 *
 * The cover goes through media-ops (the one sanctioned media write path) when
 * `post.json` names a file that exists on disk; a missing file skips the
 * cover with a note, so text can land before the artwork is finished.
 *
 * Publishing stays a manual per-post action in the admin panel — this script
 * never publishes, so it needs no revalidation of its own (the publish hook
 * does that). EN rides the existing pipeline afterwards:
 * `payload:translate:post --extract` → author draft.en.json → `--apply`.
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import { begin, finish, uploadMedia } from '@/lib/payload/media-ops'

interface PostMeta {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  /** Empty/absent = Social Lama (the brand), per the collection's convention. */
  authorName?: string
  publishedAt: string
  seo?: { metaTitle?: string; metaDescription?: string }
  cover?: { file: string; altPl: string; altEn: string }
}

const IS_PROD = process.argv.includes('--prod')
const PUBLISH = process.argv.includes('--publish')
const slugArg = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'))
if (!slugArg) {
  throw new Error('usage: import-post.ts <slug> [--prod]')
}

const dir = `content/posts/${slugArg}`
const meta = JSON.parse(fs.readFileSync(`${dir}/post.json`, 'utf8')) as PostMeta
const markdown = fs.readFileSync(`${dir}/source.pl.md`, 'utf8')

if (meta.slug !== slugArg) {
  throw new Error(`post.json says slug ${meta.slug}, directory says ${slugArg}`)
}
// The title lives in its own field; an H1 in the body would render twice.
if (/^# /m.test(markdown)) {
  throw new Error('source.pl.md contains an H1 — the title field owns the H1')
}

// begin() routes --prod through targetProdEnv and refuses a prod run while
// media/ holds dev files, exactly the guards this write needs.
const ctx = await begin({
  script: 'import-post',
  prod: IS_PROD,
  apply: true,
  host: 'https://sociallama-v2.vercel.app',
})
const { payload } = ctx

const editorConfig = await editorConfigFactory.default({
  config: payload.config,
})
const content = convertMarkdownToLexical({ editorConfig, markdown })

const category = (
  await payload.find({
    collection: 'categories',
    where: { slug: { equals: meta.categorySlug } },
    locale: 'pl',
    limit: 1,
    overrideAccess: true,
  })
).docs[0]
if (!category) {
  throw new Error(`no category with slug "${meta.categorySlug}" in this DB`)
}

let authorId: number | undefined
if (meta.authorName) {
  const author = (
    await payload.find({
      collection: 'authors',
      where: { name: { equals: meta.authorName } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]
  if (!author) {
    throw new Error(`no author named "${meta.authorName}" in this DB`)
  }
  authorId = author.id
}

let coverId: number | undefined
if (meta.cover && fs.existsSync(meta.cover.file)) {
  const { doc, created } = await uploadMedia(ctx, {
    file: path.basename(meta.cover.file),
    fromPath: meta.cover.file,
    altPl: meta.cover.altPl,
    altEn: meta.cover.altEn,
  })
  coverId = doc.id
  console.log(
    `cover: ${doc.filename} (media ${doc.id}, ${created ? 'created' : 'already present'})`
  )
} else if (meta.cover) {
  console.log(`cover: ${meta.cover.file} not on disk yet — skipped`)
}

const data = {
  _status: 'draft' as const,
  title: meta.title,
  slug: meta.slug,
  excerpt: meta.excerpt,
  publishedAt: meta.publishedAt,
  category: category.id,
  ...(authorId ? { author: authorId } : {}),
  ...(coverId ? { cover: coverId } : {}),
  ...(meta.seo ? { seo: meta.seo } : {}),
  content,
}

const existing = (
  await payload.find({
    collection: 'posts',
    where: { slug: { equals: meta.slug } },
    locale: 'pl',
    draft: true,
    limit: 1,
    overrideAccess: true,
  })
).docs[0]

let postId: number
if (existing) {
  await payload.update({
    collection: 'posts',
    id: existing.id,
    locale: 'pl',
    draft: true,
    data,
    overrideAccess: true,
  })
  postId = existing.id
  console.log(`updated draft #${existing.id} "${meta.slug}"`)
} else {
  const doc = await payload.create({
    collection: 'posts',
    locale: 'pl',
    draft: true,
    data,
    overrideAccess: true,
  })
  postId = doc.id
  console.log(`created draft #${doc.id} "${meta.slug}"`)
}

if (PUBLISH) {
  await payload.update({
    collection: 'posts',
    id: postId,
    locale: 'pl',
    draft: false,
    data: { _status: 'published' },
    overrideAccess: true,
  })
  ctx.tags.add('posts')
  ctx.tags.add('blog-hub')
  ctx.tags.add(`post:${meta.slug}`)
  console.log(`published #${postId}`)
}

await finish(ctx)
if (!PUBLISH) {
  console.log(
    '\nDraft only — review it in the admin panel (Wpisy) and publish from there.'
  )
}
process.exit(0)
