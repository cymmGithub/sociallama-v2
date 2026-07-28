/**
 * Pre/post-migration baseline for the blog corpus — the evidence that
 * localizing `posts`, `categories`, `authors` and the `blog-hub` global did
 * not lose a single field (change `add-english-blog`, tasks 1.4 / 2.5 / 9.8).
 *
 *   bun run payload:baseline:blog --prod --out <file>     capture
 *   bun run payload:baseline:blog --prod --compare <file> re-read and diff
 *
 * Compare exits non-zero on any difference, so it can gate a migration.
 *
 * Read through the Payload Local API under `locale: 'pl'`, deliberately, and
 * not through SQL: after the migration these fields no longer live in the
 * base table at all — they move to `posts_locales` — so a SQL baseline would
 * have nothing to compare against. The API read is the same on both sides of
 * the migration, which is exactly the property a baseline needs.
 *
 * `fallbackLocale: false` matters for the same reason. With the config's
 * global `fallback: true`, a `pl` value lost by a bad backfill would be
 * silently replaced by… itself (pl is the default locale), or by null; the
 * strict read makes the loss visible instead of plausible.
 *
 * Hashes are per field rather than one digest per post, so a failed compare
 * names the field that moved instead of just the post.
 */

import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const COMPARE = getFlag('--compare')
const OUT = getFlag('--out')

function getFlag(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i === -1 ? undefined : process.argv[i + 1]
}

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:baseline:blog --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

/**
 * Key-sorted JSON. Object key order is an implementation detail of whatever
 * built the document; array order is content. Sorting the first and
 * preserving the second is what makes a hash comparable across a schema
 * change that rebuilds the rows.
 */
function stable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stable)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        // Two-way compare: object keys are unique, so there is no equal case.
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([k, v]) => [k, stable(v)])
    )
  }
  return value
}

/** `null` and `undefined` collapse to one marker: an absent field is absent. */
function sha(value: unknown): string {
  if (value === null || value === undefined) {
    return '∅'
  }
  return createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')
    .slice(0, 16)
}

interface Baseline {
  capturedAt: string
  host: string
  posts: Record<string, Record<string, string>>
  categories: Record<string, Record<string, string>>
  authors: Record<string, Record<string, string>>
  blogHub: Record<string, string>
  counts: Record<string, number>
}

async function capture(): Promise<Baseline> {
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const read = { locale: 'pl', fallbackLocale: false, depth: 0 } as const

  const posts = await payload.find({
    collection: 'posts',
    limit: 0,
    pagination: false,
    sort: 'slug',
    ...read,
  })

  // Version history is part of what the migration must not destroy: the
  // embed-link repair, the formatting repair and the guest-author backfill
  // all live in `_posts_v` and nowhere else.
  const versions = await payload.findVersions({
    collection: 'posts',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  const versionCount = new Map<string, number>()
  for (const v of versions.docs) {
    const parent = String(
      (v as { parent?: unknown }).parent ?? (v as { id?: unknown }).id
    )
    versionCount.set(parent, (versionCount.get(parent) ?? 0) + 1)
  }

  const categories = await payload.find({
    collection: 'categories',
    limit: 0,
    pagination: false,
    sort: 'slug',
    ...read,
  })

  const authors = await payload.find({
    collection: 'authors',
    limit: 0,
    pagination: false,
    sort: 'name',
    ...read,
  })

  const hub = await payload.findGlobal({ slug: 'blog-hub', ...read })

  const seo = (doc: { seo?: unknown }) =>
    (doc.seo ?? {}) as Record<string, unknown>
  const video = (hub.video ?? {}) as Record<string, unknown>

  return {
    capturedAt: new Date().toISOString(),
    host: dbHost,
    counts: {
      posts: posts.docs.length,
      postVersions: versions.docs.length,
      categories: categories.docs.length,
      authors: authors.docs.length,
    },
    posts: Object.fromEntries(
      posts.docs.map((p) => [
        String(p.slug),
        {
          id: String(p.id),
          title: sha(p.title),
          excerpt: sha(p.excerpt),
          content: sha(p.content),
          metaTitle: sha(seo(p).metaTitle),
          metaDescription: sha(seo(p).metaDescription),
          // Shared (unlocalized) fields: the migration must leave these on the
          // base table untouched, so they are asserted too.
          category: String(p.category ?? '∅'),
          author: String(p.author ?? '∅'),
          cover: String(p.cover ?? '∅'),
          ogImage: String(seo(p).ogImage ?? '∅'),
          publishedAt: String(p.publishedAt ?? '∅'),
          status: String((p as { _status?: unknown })._status ?? '∅'),
          versions: String(versionCount.get(String(p.id)) ?? 0),
        },
      ])
    ),
    categories: Object.fromEntries(
      categories.docs.map((c) => [
        String(c.id),
        { title: sha(c.title), slug: String(c.slug) },
      ])
    ),
    authors: Object.fromEntries(
      authors.docs.map((a) => [
        String(a.id),
        {
          name: String(a.name),
          role: sha(a.role),
          bio: sha(a.bio),
          profileUrl: sha(a.profileUrl),
        },
      ])
    ),
    blogHub: {
      featured: String(hub.featured ?? '∅'),
      popular: String(hub.popular ?? '∅'),
      picks: JSON.stringify(hub.picks ?? []),
      videoTitle: sha(video.title),
      videoUrl: sha(video.url),
      videoDescription: sha(video.description),
      videoDuration: sha(video.duration),
      videoPoster: String(video.poster ?? '∅'),
    },
  }
}

/** Flatten to `section/key/field` → value so a diff can be one pass. */
function flatten(b: Baseline): Map<string, string> {
  const out = new Map<string, string>()
  for (const [section, rows] of [
    ['posts', b.posts],
    ['categories', b.categories],
    ['authors', b.authors],
  ] as const) {
    for (const [key, fields] of Object.entries(rows)) {
      for (const [field, value] of Object.entries(fields)) {
        out.set(`${section}/${key}/${field}`, value)
      }
    }
  }
  for (const [k, v] of Object.entries(b.blogHub)) {
    out.set(`blogHub/${k}`, v)
  }
  for (const [k, v] of Object.entries(b.counts)) {
    out.set(`counts/${k}`, String(v))
  }
  return out
}

const current = await capture()

if (COMPARE) {
  const before: Baseline = JSON.parse(await Bun.file(COMPARE).text())
  console.log(
    `Comparing ${dbHost} against baseline from ${before.host} (${before.capturedAt})\n`
  )
  const a = flatten(before)
  const b = flatten(current)
  const failures: string[] = []

  for (const [key, value] of a) {
    if (!b.has(key)) {
      failures.push(`MISSING  ${key} (was ${value})`)
    } else if (b.get(key) !== value) {
      failures.push(`CHANGED  ${key}: ${value} → ${b.get(key)}`)
    }
  }
  for (const key of b.keys()) {
    if (!a.has(key)) {
      failures.push(`ADDED    ${key} (${b.get(key)})`)
    }
  }

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(f)
    }
    console.error(`\n✗ ${failures.length} difference(s) against the baseline.`)
    process.exit(1)
  }
  console.log(
    `✓ identical — ${current.counts.posts} posts, ${current.counts.postVersions} versions, ` +
      `${current.counts.categories} categories, ${current.counts.authors} authors, blog-hub intact.`
  )
  process.exit(0)
} else {
  const target = OUT ?? `content/baselines/blog-${dbHost.split('.')[0]}.json`
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, `${JSON.stringify(current, null, 2)}\n`)
  console.log(
    `Captured ${dbHost} → ${target}\n` +
      `  ${current.counts.posts} posts, ${current.counts.postVersions} versions, ` +
      `${current.counts.categories} categories, ${current.counts.authors} authors`
  )
  process.exit(0)
}
