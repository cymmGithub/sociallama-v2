/**
 * Points English post bodies at English-language screenshots.
 *
 *   bun run payload:repoint:en-images            dry run
 *   bun run payload:repoint:en-images --apply    write
 *   …--prod                                      against production
 *
 * ## Why this can exist at all
 *
 * `posts.content` is `localized: true`, so the English body is an independent
 * Lexical tree and its `upload` nodes may point at a different media row than
 * the Polish body's. That is what makes per-locale screenshots possible with no
 * schema change: the English post gets an English capture, the Polish post
 * keeps its Polish one, and neither is wrong for its reader.
 *
 * `cover` and `seo.ogImage` are NOT localized. They are shared, so the same
 * trick does not work there — see the audit's `blockedBy` entries. This script
 * refuses to touch either, because doing so would silently change the Polish
 * page (design D5).
 *
 * ## A NEW row, not a replaced file
 *
 * Task 3.4 says to replace the file on the existing row so every post updates
 * together. That is right for a shared cover and exactly backwards here:
 * overwriting the row would push the English screenshot onto the Polish post
 * too. So each capture is uploaded as a new row and only the English tree is
 * repointed.
 *
 * ## No `draft: true`
 *
 * Same reason as translate-post.ts: all 79 posts are published and the
 * collection has drafts enabled, so a draft write files the change where the
 * live page never reads it — it looks like it worked and changes nothing.
 */

import { readFile, writeFile } from 'node:fs/promises'
import {
  type LexicalNode,
  walkNodes,
} from '@/lib/payload/post-formatting-rules'
import { targetProdEnv } from '@/lib/payload/prod-env'

const AUDIT_PATH = 'content/media/image-audit.json'
const MAP_PATH = 'content/media/en-replacements.json'
const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  targetProdEnv('payload:repoint:en-images', { blob: true })
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

interface Replacement {
  /** Path to the English-locale capture, relative to the repo root. */
  file: string
  /** English alt for the new row. The Polish row keeps its own. */
  alt: string
}

const replacements: Record<string, Replacement> = await readFile(
  MAP_PATH,
  'utf8'
)
  .then((raw) => JSON.parse(raw) as Record<string, Replacement>)
  .catch(() => ({}))

if (Object.keys(replacements).length === 0) {
  console.log(
    `No replacements in ${MAP_PATH}. Add entries keyed by the ORIGINAL media id:\n` +
      '  { "49": { "file": "captures/fb-support-01.png", "alt": "…" } }\n' +
      'The capture list is in content/media/en-capture-brief.md.'
  )
  process.exit(0)
}

const audit = JSON.parse(await readFile(AUDIT_PATH, 'utf8')) as {
  images: Record<
    string,
    {
      roles: string[]
      verdict: string
      blockedBy?: string
      posts: string[]
      enMediaId?: string
    }
  >
}

// Guard before touching the database: only ids the audit judged `replace`, only
// in-body ones, and never a blocked cover.
const rejected: string[] = []
for (const id of Object.keys(replacements)) {
  const entry = audit.images[id]
  if (!entry) {
    rejected.push(`${id}: not in the audit`)
  } else if (entry.verdict !== 'replace') {
    rejected.push(`${id}: verdict is "${entry.verdict}", not "replace"`)
  } else if (entry.roles.includes('cover') || entry.roles.includes('og')) {
    rejected.push(
      `${id}: used as ${entry.roles.join('/')} — cover and ogImage are shared across locales, so repointing would change the Polish page`
    )
  } else if (entry.blockedBy) {
    rejected.push(`${id}: blocked by ${entry.blockedBy}`)
  }
}
if (rejected.length > 0) {
  console.error(
    `Refusing to run:\n${rejected.map((r) => `  ✗ ${r}`).join('\n')}`
  )
  process.exit(1)
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(
  `${APPLY ? 'Repointing' : 'DRY RUN — would repoint'} English post images on: ${dbHost}\n`
)

const READ = { depth: 0, fallbackLocale: false } as const

const published = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
  limit: 0,
  pagination: false,
  locale: 'pl',
  ...READ,
  select: { slug: true },
})

/** originalId → newly created media id. */
const created = new Map<string, string>()
let repointedNodes = 0
let touchedPosts = 0

for (const [originalId, spec] of Object.entries(replacements)) {
  if (!APPLY) {
    created.set(originalId, `(new row for ${spec.file})`)
    continue
  }
  const row = await payload.create({
    collection: 'media',
    locale: 'en',
    data: { alt: spec.alt },
    filePath: spec.file,
  })
  created.set(originalId, String(row.id))
  console.log(`  + media ${row.id} ← ${spec.file}`)
}

for (const pl of published.docs) {
  const slug = String(pl.slug)
  const en = (
    await payload.find({
      collection: 'posts',
      where: { id: { equals: pl.id } },
      limit: 1,
      locale: 'en',
      ...READ,
    })
  ).docs[0]

  const root = (en?.content as { root?: LexicalNode } | null)?.root
  if (!(en?.title && root && en._status === 'published')) {
    continue
  }

  // Mutating the tree read back from Payload is safe: it is a fresh plain
  // object per find(), not a shared cache entry.
  const hits: string[] = []
  walkNodes(root, (node) => {
    if (node.type !== 'upload') {
      return
    }
    const upload = node as LexicalNode & {
      relationTo?: string
      value?: unknown
    }
    if (upload.relationTo && upload.relationTo !== 'media') {
      return
    }
    const current =
      typeof upload.value === 'object' && upload.value !== null
        ? String((upload.value as { id?: unknown }).id ?? '')
        : String(upload.value ?? '')
    const newId = created.get(current)
    if (!newId) {
      return
    }
    hits.push(`${current} → ${newId}`)
    if (APPLY) {
      upload.value = newId
    }
  })

  if (hits.length === 0) {
    continue
  }
  touchedPosts += 1
  repointedNodes += hits.length
  console.log(`  ${APPLY ? '·' : '?'} ${slug}: ${hits.join(', ')}`)

  if (APPLY) {
    await payload.update({
      collection: 'posts',
      id: pl.id,
      locale: 'en',
      data: { content: en.content as never },
    })
  }
}

if (APPLY) {
  for (const [originalId, newId] of created) {
    // The guard above already rejected any id missing from the audit, so this
    // is a type narrowing rather than a real branch.
    const entry = audit.images[originalId]
    if (entry) {
      entry.enMediaId = newId
    }
  }
  await writeFile(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`)
  console.log(`\nrecorded enMediaId for ${created.size} ids in ${AUDIT_PATH}`)
}

console.log(
  `\n${repointedNodes} upload node(s) across ${touchedPosts} English post(s)` +
    (APPLY ? '' : ' — re-run with --apply to write')
)

process.exit(0)
