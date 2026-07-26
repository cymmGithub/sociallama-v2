/**
 * WordPress → Payload content migration (migrate-wp-content, tasks 2.x)
 *
 * Imports every post from the live WP REST API into the Payload `posts`
 * collection via the Local API: title, slug, excerpt, publish date, category,
 * Yoast SEO fields, featured image as cover, and body HTML converted to
 * Lexical with in-content images re-hosted as media uploads (Vercel Blob).
 *
 * Idempotent: posts upsert by slug, media dedup by a filename derived from
 * the WP uploads path (`YYYY-MM-basename` — basenames alone collide across
 * months). Re-run safely after partial failures or converter fixes.
 *
 * Usage:
 *   bun ./lib/scripts/migrate-wp.ts            # dev database
 *   bun ./lib/scripts/migrate-wp.ts --prod     # DATABASE_URL_PROD, no push
 *   bun ./lib/scripts/migrate-wp.ts --only <slug>   # single post
 *
 * Writes an import report to openspec/changes/migrate-wp-content/import-report.md
 * and exits non-zero on hard failures (post fetch/create errors). Unfetchable
 * images are warnings: logged, never silent.
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  htmlToText,
  mediaFilename,
  originalImageUrl,
  prePass,
  UPLOAD_MARKER,
} from './wp-html-prepass'

// Same env decision as lib/payload/seed.ts: must happen before the Payload
// config loads (it validates DATABASE_URL at import time), so all Payload
// imports below are dynamic.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'migrate-wp --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  // Prevent dev-mode schema push from stamping the prod DB as dev-managed.
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const WP_ORIGIN = 'https://sociallama.pl'
const ROOT = join(import.meta.dir, '..', '..')
const REPORT_PATH = join(
  ROOT,
  'openspec',
  'changes',
  'migrate-wp-content',
  'import-report.md'
)
const ONLY_SLUG = (() => {
  const i = process.argv.indexOf('--only')
  return i >= 0 ? process.argv[i + 1] : null
})()

/** Category priority when a WP post carries several: most specific first
 * (WP uses `marketing` as a catch-all on 59/79 posts). Logged per post. */
const CATEGORY_PRIORITY = ['seo', 'reklama', 'social-media', 'marketing']

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`Importing into database: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { convertHTMLToLexical, editorConfigFactory } = await import(
  '@payloadcms/richtext-lexical'
)
// jsdom ships without types (transitive dep, fine for a run-once script);
// this is the exact constructor shape convertHTMLToLexical expects.
// @ts-expect-error jsdom has no bundled or @types declarations
const { JSDOM } = (await import('jsdom')) as unknown as {
  JSDOM: new (html: string) => { window: { document: Document } }
}

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({
  config: payload.config,
})

// ---------------------------------------------------------------------------
// Types and report accumulation
// ---------------------------------------------------------------------------

interface WpPost {
  slug: string
  date_gmt: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  yoast_head_json?: { title?: string; description?: string }
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[]
    'wp:term'?: { slug: string; taxonomy: string }[][]
  }
}

interface PostReport {
  slug: string
  status: 'created' | 'failed' | 'updated'
  category?: string
  multiCategory?: string[]
  notes: string[]
  warnings: string[]
}

const reports: PostReport[] = []
const failedImages = new Set<string>()
let hardFailures = 0

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      await sleep(1000 * 3 ** (attempt - 1))
    }
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'sociallama-v2-migration/1.0' },
      })
      if (res.ok) {
        return res
      }
      // 4xx won't improve on retry
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`HTTP ${res.status}`)
      }
      lastError = new Error(`HTTP ${res.status}`)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

function cleanExcerpt(html: string): string {
  // The WP theme appends a "READ MORE" button link to every excerpt — links
  // have no place in excerpt text, drop them wholesale.
  return htmlToText(html.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, ''))
    .replace(/\s*\[(…|&hellip;)\]\s*$/u, '…')
    .trim()
}

/** Yoast titles end in " - SocialLama"; the v2 layout template re-appends
 * the brand, so the suffix must go or titles double-brand. */
function cleanMetaTitle(title: string): string {
  return title.replace(/\s*-\s*SocialLama\s*$/i, '').trim()
}

// ---------------------------------------------------------------------------
// Media: download from WP, upload to Payload media (dedup by filename)
// ---------------------------------------------------------------------------

const mediaIdBySource = new Map<string, number>()

/** Find-or-create a media doc for a WP image URL. Returns null (and logs)
 * when the image cannot be fetched — never throws. */
async function ensureMedia(
  sourceUrl: string,
  alt: string
): Promise<number | null> {
  const cached = mediaIdBySource.get(sourceUrl)
  if (cached !== undefined) {
    return cached
  }

  const findByFilename = async (name: string) => {
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: name } },
      limit: 1,
    })
    return found.docs[0]
  }

  let filename = mediaFilename(originalImageUrl(sourceUrl))
  let existingDoc = await findByFilename(filename)
  if (!existingDoc) {
    // jpg/jpeg twins with the same stem (WP has `x.jpg` and `x.jpeg` in the
    // same month) collide in Blob: Payload names both twins' resize variants
    // `stem-WxH.jpg`. Shift the later twin to a distinct stem — the rule is
    // symmetric and re-derivable, so re-runs find the shifted doc again.
    const dot = filename.lastIndexOf('.')
    const stem = filename.slice(0, dot)
    const ext = filename.slice(dot + 1).toLowerCase()
    const TWIN_EXTS: Record<string, string> = { jpeg: 'jpg', jpg: 'jpeg' }
    const twinExt = TWIN_EXTS[ext] ?? null
    if (twinExt && (await findByFilename(`${stem}.${twinExt}`))) {
      filename = `${stem}-${ext}.${ext}`
      existingDoc = await findByFilename(filename)
    }
  }
  if (existingDoc) {
    mediaIdBySource.set(sourceUrl, existingDoc.id)
    return existingDoc.id
  }

  let res: Response
  try {
    res = await fetchWithRetry(originalImageUrl(sourceUrl))
  } catch {
    try {
      // Original-size guess failed — fall back to the referenced URL as-is.
      res = await fetchWithRetry(sourceUrl)
    } catch {
      failedImages.add(sourceUrl)
      return null
    }
  }

  const data = Buffer.from(await res.arrayBuffer())
  // The Blob store is shared across all Neon DB branches, and this plugin
  // version cannot overwrite existing blobs — so a file uploaded by a run
  // against another branch (e.g. dev run before the prod run) collides here.
  // Reaching this point means no media doc owns `filename` in the target DB,
  // so any blob at these keys is stale for this DB: delete before creating.
  // Content is byte-identical (same WP source), so other branches' docs keep
  // resolving to the same URLs.
  await deleteStaleBlobs(filename)
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: res.headers.get('content-type') ?? 'image/jpeg',
      name: filename,
      size: data.byteLength,
    },
  })
  mediaIdBySource.set(sourceUrl, doc.id)
  await sleep(150) // throttle against the WP host
  return doc.id
}

/** Remove blobs at the exact keys Payload will write for `filename`: the
 * original plus its `-WxH` size variants (thumbnail/card/og). */
async function deleteStaleBlobs(filename: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return // local-disk uploads (no Blob configured) overwrite fine
  }
  const { del, list } = await import('@vercel/blob')
  const dot = filename.lastIndexOf('.')
  const base = dot > 0 ? filename.slice(0, dot) : filename
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Variants can carry a DIFFERENT extension than the original (Payload
  // normalizes `.jpeg` originals to `.jpg` variants), so match any ext.
  // Stems are unique per doc (YYYY-MM-name, twins disambiguated), so this
  // never touches another doc's files.
  const variantPattern = new RegExp(
    `^${escaped}-\\d+x\\d+\\.[a-z0-9]{2,5}$`,
    'i'
  )
  const { blobs } = await list({ prefix: base, token })
  const stale = blobs.filter(
    (b) => b.pathname === filename || variantPattern.test(b.pathname)
  )
  if (stale.length > 0) {
    await del(
      stale.map((b) => b.url),
      { token }
    )
  }
}

// ---------------------------------------------------------------------------
// Lexical post-processing (task 2.4)
// ---------------------------------------------------------------------------

interface LexicalNode {
  [key: string]: unknown
  children?: LexicalNode[]
  text?: string
  type: string
}

function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }
  return (node.children ?? []).map(nodeText).join('')
}

/** Replace marker paragraphs with upload nodes; drop markers whose image
 * could not be fetched. Mutates and returns the node list. */
function replaceMarkers(
  nodes: LexicalNode[],
  mediaIdByKey: Map<string, number>,
  warnings: string[]
): LexicalNode[] {
  const result: LexicalNode[] = []
  for (const node of nodes) {
    const marker = nodeText(node).trim().match(UPLOAD_MARKER)
    if (marker) {
      const key = marker[1] as string
      const mediaId = mediaIdByKey.get(key)
      if (mediaId === undefined) {
        warnings.push(`image dropped (unfetchable): ${key}`)
        continue
      }
      result.push({
        fields: null,
        format: '',
        relationTo: 'media',
        type: 'upload',
        value: mediaId,
        version: 3,
      })
      continue
    }
    if (node.children) {
      node.children = replaceMarkers(node.children, mediaIdByKey, warnings)
    }
    result.push(node)
  }
  return result
}

// ---------------------------------------------------------------------------
// Import pipeline
// ---------------------------------------------------------------------------

async function fetchAllPosts(): Promise<WpPost[]> {
  const posts: WpPost[] = []
  for (let page = 1; ; page++) {
    const res = await fetchWithRetry(
      `${WP_ORIGIN}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1`
    )
    const batch = (await res.json()) as WpPost[]
    posts.push(...batch)
    if (batch.length < 100) {
      return posts
    }
  }
}

const categoriesResult = await payload.find({
  collection: 'categories',
  limit: 100,
})
const categoryIdBySlug = new Map(
  categoriesResult.docs.map((c) => [c.slug, c.id])
)
for (const slug of CATEGORY_PRIORITY) {
  if (!categoryIdBySlug.has(slug)) {
    throw new Error(
      `Category "${slug}" missing — run \`bun run payload:seed\` first`
    )
  }
}

console.log('Fetching posts from WP REST API…')
const allPosts = await fetchAllPosts()
const wpPosts = ONLY_SLUG
  ? allPosts.filter((p) => p.slug === ONLY_SLUG)
  : allPosts
if (ONLY_SLUG && wpPosts.length === 0) {
  throw new Error(`--only ${ONLY_SLUG}: no such slug on the WP site`)
}
console.log(`${wpPosts.length} post(s) to import\n`)

for (const [index, wpPost] of wpPosts.entries()) {
  const report: PostReport = {
    slug: wpPost.slug,
    status: 'failed',
    notes: [],
    warnings: [],
  }
  reports.push(report)
  const progress = `[${index + 1}/${wpPosts.length}]`

  try {
    const title = htmlToText(wpPost.title.rendered).trim()

    // Category: most specific of the post's WP categories (all four are
    // seeded with WP-matching slugs).
    const wpCategories = (wpPost._embedded?.['wp:term'] ?? [])
      .flat()
      .filter((t) => t.taxonomy === 'category')
      .map((t) => t.slug)
    const categorySlug =
      CATEGORY_PRIORITY.find((slug) => wpCategories.includes(slug)) ??
      'marketing'
    report.category = categorySlug
    if (wpCategories.length > 1) {
      report.multiCategory = wpCategories
    }

    // Pre-pass + media phase for in-content images
    const pre = prePass(wpPost.content.rendered, title, WP_ORIGIN)
    report.notes.push(...pre.notes)

    const mediaIdByKey = new Map<string, number>()
    for (const [key, image] of pre.images) {
      const id = await ensureMedia(image.sourceUrl, image.alt)
      if (id !== null) {
        mediaIdByKey.set(key, id)
      }
    }

    // Cover from the embedded featured media
    const featured = wpPost._embedded?.['wp:featuredmedia']?.[0]
    let coverId: number | null = null
    if (featured?.source_url) {
      coverId = await ensureMedia(
        featured.source_url,
        featured.alt_text?.trim() || title
      )
      if (coverId === null) {
        report.warnings.push(`cover unfetchable: ${featured.source_url}`)
      }
    } else {
      report.warnings.push('no featured image on WP')
    }

    // HTML → Lexical, then markers → upload nodes
    const lexical = convertHTMLToLexical({
      editorConfig,
      html: pre.html,
      JSDOM,
    })
    lexical.root.children = replaceMarkers(
      lexical.root.children as LexicalNode[],
      mediaIdByKey,
      report.warnings
    ) as typeof lexical.root.children

    // Conversion audit: compare visible text before/after; a large delta
    // means the converter dropped content (D3).
    const sourceText = htmlToText(pre.html)
      .replace(/@@upload:[^@]+@@/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const lexicalText = nodeText(lexical.root as unknown as LexicalNode)
      .replace(/@@upload:[^@]+@@/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const delta = sourceText.length - lexicalText.length
    if (Math.abs(delta) > Math.max(40, sourceText.length * 0.02)) {
      report.warnings.push(
        `conversion text delta: source ${sourceText.length} chars vs lexical ${lexicalText.length}`
      )
    }

    const data = {
      title,
      slug: wpPost.slug,
      category: categoryIdBySlug.get(categorySlug) as number,
      publishedAt: new Date(`${wpPost.date_gmt}Z`).toISOString(),
      excerpt: cleanExcerpt(wpPost.excerpt.rendered),
      ...(coverId !== null ? { cover: coverId } : {}),
      // biome-ignore lint/suspicious/noExplicitAny: converter emits serialized Lexical JSON; validated by Payload on write
      content: lexical as any,
      seo: {
        ...(wpPost.yoast_head_json?.title
          ? { metaTitle: cleanMetaTitle(wpPost.yoast_head_json.title) }
          : {}),
        ...(wpPost.yoast_head_json?.description
          ? { metaDescription: wpPost.yoast_head_json.description }
          : {}),
      },
      _status: 'published' as const,
    }

    // Upsert by slug (draft: true so an existing draft is found and updated)
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: wpPost.slug } },
      limit: 1,
      draft: true,
    })
    const existingDoc = existing.docs[0]
    if (existingDoc) {
      await payload.update({
        collection: 'posts',
        id: existingDoc.id,
        data,
      })
      report.status = 'updated'
    } else {
      await payload.create({ collection: 'posts', data })
      report.status = 'created'
    }
    console.log(
      `${progress} ${report.status}: ${wpPost.slug}` +
        (report.warnings.length > 0
          ? ` (${report.warnings.length} warning(s))`
          : '')
    )
  } catch (error) {
    hardFailures++
    report.warnings.push(`FAILED: ${String(error)}`)
    console.error(`${progress} FAILED: ${wpPost.slug} — ${String(error)}`)
  }
}

// ---------------------------------------------------------------------------
// Import report (task 2.6)
// ---------------------------------------------------------------------------

const created = reports.filter((r) => r.status === 'created').length
const updated = reports.filter((r) => r.status === 'updated').length
const failed = reports.filter((r) => r.status === 'failed').length

const lines: string[] = [
  '# WP import report',
  '',
  `Run: \`bun ./lib/scripts/migrate-wp.ts${process.argv.includes('--prod') ? ' --prod' : ''}${ONLY_SLUG ? ` --only ${ONLY_SLUG}` : ''}\` against \`${dbHost}\``,
  '',
  `**${wpPosts.length} posts** — ${created} created, ${updated} updated, ${failed} failed. ${mediaIdBySource.size} media ensured, ${failedImages.size} unfetchable image(s).`,
  '',
]
if (failedImages.size > 0) {
  lines.push('## Unfetchable images', '')
  for (const url of failedImages) {
    lines.push(`- ${url}`)
  }
  lines.push('')
}
lines.push('## Per-post detail', '')
for (const r of reports) {
  const flags = [
    r.status,
    r.category,
    r.multiCategory ? `multi-category: [${r.multiCategory.join(', ')}]` : null,
  ].filter(Boolean)
  lines.push(`### ${r.slug}`, '', `- ${flags.join(' · ')}`)
  for (const w of r.warnings) {
    lines.push(`- ⚠️ ${w}`)
  }
  for (const n of r.notes) {
    lines.push(`- ${n}`)
  }
  lines.push('')
}
writeFileSync(REPORT_PATH, lines.join('\n'))

console.log(
  `\n${created} created, ${updated} updated, ${failed} failed, ` +
    `${failedImages.size} unfetchable image(s)` +
    `\nReport: ${REPORT_PATH}`
)
process.exit(hardFailures > 0 ? 1 : 0)
