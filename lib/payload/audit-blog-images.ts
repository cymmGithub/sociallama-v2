/**
 * Builds and refreshes the blog image audit — run with
 * `bun run payload:audit:blog-images`, add `--prod` to read the production
 * database.
 *
 * ## Why a script and not a one-off query
 *
 * The audit's value is that it survives this change (localize-blog-image-text
 * spec, "Every image on an English blog surface carries a recorded verdict").
 * A committed artifact keyed by media id means a third locale inspects only
 * the ids it has not seen, instead of re-running 261 judgements.
 *
 * So this script is **merge-only**: it re-derives the reachability set from
 * the database and folds it into the existing file, never overwriting a
 * verdict that a human already recorded. Ids that disappear from the corpus
 * are kept and flagged `stale`, because deleting them would silently discard
 * the reasoning behind them.
 *
 * ## The field is `cover`
 *
 * An earlier scoping pass read `coverImage`, which does not exist on the
 * collection. Payload returns `undefined` for an unknown field rather than
 * throwing, so the pass reported 183 images and looked complete while missing
 * every one of the 79 covers. The count assertion at the end exists to make
 * that class of mistake loud: covers are counted separately and compared
 * against the number of English posts.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import {
  type LexicalNode,
  walkNodes,
} from '@/lib/payload/post-formatting-rules'

const AUDIT_PATH = 'content/media/image-audit.json'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:audit:blog-images --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(`Enumerating English blog images against: ${dbHost}\n`)

type Role = 'cover' | 'body' | 'og'
type Verdict = 'unreviewed' | 'accept' | 'crop' | 'replace' | 'recreate'

interface Entry {
  filename: string
  url: string
  width: number | null
  height: number | null
  /** Which surfaces reach this image. An id used twice is inspected once. */
  roles: Role[]
  /** Polish slugs — the stable identity; the English slug is a translation. */
  posts: string[]
  altPl: string
  altEn: string
  verdict: Verdict
  reason: string
  /** Set when a previously audited id is no longer reachable. */
  stale?: true
}

const READ = { depth: 0, fallbackLocale: false } as const

/**
 * Reachability is defined by the English post, not the Polish one: an
 * untranslated post renders nowhere in English, so its images are out of
 * scope (design "Non-Goals": localizing images that Polish posts alone use).
 */
const published = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
  limit: 0,
  pagination: false,
  locale: 'pl',
  ...READ,
})

/** id → {role → true}, plus the posts that reach it. */
const found = new Map<string, { roles: Set<Role>; posts: Set<string> }>()

const record = (raw: unknown, role: Role, slug: string): void => {
  const id =
    typeof raw === 'object' && raw !== null
      ? String((raw as { id?: unknown }).id ?? '')
      : String(raw ?? '')
  if (!id || id === 'null' || id === 'undefined') {
    return
  }
  const hit = found.get(id) ?? {
    roles: new Set<Role>(),
    posts: new Set<string>(),
  }
  hit.roles.add(role)
  hit.posts.add(slug)
  found.set(id, hit)
}

let englishPosts = 0
let postsWithCover = 0

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

  const enRoot = (en?.content as { root?: LexicalNode } | null)?.root
  if (!(en?.title && enRoot && en._status === 'published')) {
    continue
  }
  englishPosts += 1

  if (en.cover) {
    postsWithCover += 1
  }
  record(en.cover, 'cover', slug)
  record((en.seo as { ogImage?: unknown } | null)?.ogImage, 'og', slug)

  // Upload nodes are not localized, but read the English tree anyway: it is
  // the tree the English page actually renders, and a translation that
  // dropped or added an image would otherwise go unnoticed here.
  walkNodes(enRoot, (node) => {
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
    record(upload.value, 'body', slug)
  })
}

console.log(`${englishPosts} published English posts`)
console.log(`${found.size} distinct media ids reachable\n`)

/** Existing verdicts survive; this script never overwrites a human judgement. */
const previous: Record<string, Entry> = await readFile(AUDIT_PATH, 'utf8')
  .then((raw) => (JSON.parse(raw) as { images: Record<string, Entry> }).images)
  .catch(() => ({}))

const ids = [...found.keys()]
const media = await payload.find({
  collection: 'media',
  where: { id: { in: ids } },
  limit: 0,
  pagination: false,
  locale: 'en',
  depth: 0,
})
const mediaPl = await payload.find({
  collection: 'media',
  where: { id: { in: ids } },
  limit: 0,
  pagination: false,
  locale: 'pl',
  depth: 0,
})
const altPlById = new Map(
  mediaPl.docs.map((doc) => [String(doc.id), String(doc.alt ?? '')])
)
const byId = new Map(media.docs.map((doc) => [String(doc.id), doc]))

const images: Record<string, Entry> = {}

// The file cannot express design D3's covers-first ordering: media ids are
// integer-like strings, and JavaScript emits those in ascending numeric order
// whatever order they were inserted in. Covers-first is therefore an ordering
// of the *review*, applied by filtering on `roles`, not of the artifact.
for (const id of ids) {
  const hit = found.get(id)!
  const doc = byId.get(id)
  const prior = previous[id]
  images[id] = {
    filename: String(doc?.filename ?? '(missing media row)'),
    url: String(doc?.url ?? ''),
    width: (doc?.width as number | null) ?? null,
    height: (doc?.height as number | null) ?? null,
    roles: [...hit.roles].sort(),
    posts: [...hit.posts].sort(),
    altPl: altPlById.get(id) ?? '',
    altEn: String(doc?.alt ?? ''),
    verdict: prior?.verdict ?? 'unreviewed',
    reason: prior?.reason ?? '',
  }
}

// Keep ids that fell out of the corpus rather than dropping their verdicts.
for (const [id, entry] of Object.entries(previous)) {
  if (!images[id]) {
    images[id] = { ...entry, stale: true }
  }
}

await mkdir('content/media', { recursive: true })
await writeFile(AUDIT_PATH, `${JSON.stringify({ images }, null, 2)}\n`)

const covers = ids.filter((id) => found.get(id)!.roles.has('cover'))
const bodies = ids.filter((id) => !found.get(id)!.roles.has('cover'))
const missing = ids.filter((id) => !byId.has(id))
const unreviewed = Object.values(images).filter(
  (e) => !e.stale && e.verdict === 'unreviewed'
).length

console.log(`covers          ${covers.length}`)
console.log(`in-body / og    ${bodies.length}`)
console.log(`unreviewed      ${unreviewed}`)
if (missing.length > 0) {
  console.log(
    `\n⚠ ${missing.length} referenced ids have no media row: ${missing.join(', ')}`
  )
}
// Distinct cover ids can legitimately be fewer than posts (a shared cover),
// so the guard is on posts that resolved no cover at all — the signal the
// `coverImage` mistake would have produced.
if (postsWithCover < englishPosts) {
  console.log(
    `\n⚠ ${englishPosts - postsWithCover} English posts resolved no cover — check the field name before trusting this scope.`
  )
}
console.log(`\nwrote ${AUDIT_PATH}`)

// Payload holds the connection pool open; without this the script sits at 100%
// done and never returns, which reads as a hang.
process.exit(0)
