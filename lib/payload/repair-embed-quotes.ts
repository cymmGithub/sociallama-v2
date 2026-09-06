/**
 * Content repair for imported Instagram/TikTok embed leftovers — run with
 * `bun run payload:repair:embed-quotes` (dry run) and again with `--apply` to
 * write. Add `--prod` to target the production database, and
 * `--revalidate <baseUrl>` (or REVALIDATE_BASE_URL) so the deployed pages
 * stop serving the old body.
 *
 * What it fixes and why is in embed-quote-rules.ts; this file only walks the
 * posts. Both locales are repaired, each read with `fallbackLocale: false`
 * so an untranslated post is never written back as a copy of the other one.
 *
 * A quote is only rewritten when the rule finds the embed's primary link
 * (post permalink for Instagram, creator profile for TikTok); anything else
 * is reported and left alone. Idempotent: a repaired quote reports `clean`.
 */

import {
  type LexicalNode,
  nodeText,
  repairEmbedQuote,
} from '@/lib/payload/embed-quote-rules'

const APPLY = process.argv.includes('--apply')
const LOCALES = ['pl', 'en'] as const

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:repair:embed-quotes --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`${APPLY ? 'Applying to' : 'Dry run against'}: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

let repaired = 0
let skipped = 0
// Cache tags are keyed by the slug of the locale that was requested, so both
// locales' slugs are collected; the summary counts documents, not locales.
const touchedSlugs = new Set<string>()
const touchedIds = new Set<number | string>()

for (const locale of LOCALES) {
  const posts = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    limit: 0,
    pagination: false,
    depth: 0,
    locale,
    fallbackLocale: false,
  })

  for (const post of posts.docs) {
    const root = (
      post.content as { root?: { children?: LexicalNode[] } } | null
    )?.root
    const children = root?.children
    if (!children) {
      continue
    }

    const replacements = new Map<number, LexicalNode>()
    children.forEach((node, i) => {
      const result = repairEmbedQuote(node, locale)
      if (result.verdict === 'no-primary-link') {
        skipped++
        console.log(
          `! #${post.id} ${post.slug} [${locale}] [${i}] — SKIPPED: ${result.kind} quote without its primary link: ${nodeText(node).trim().slice(0, 90)}`
        )
      } else if (result.verdict === 'repair') {
        replacements.set(i, result.node)
      }
    })

    if (replacements.size === 0) {
      continue
    }
    repaired += replacements.size
    touchedSlugs.add(post.slug as string)
    touchedIds.add(post.id)

    console.log(
      `+ #${post.id} ${post.slug} [${locale}] — ${replacements.size} quote(s):`
    )
    for (const [i, node] of replacements) {
      const before = nodeText(children[i] as LexicalNode)
        .replace(/\s+/g, ' ')
        .trim()
      console.log(`    [${i}] "${before.slice(0, 70)}" → "${nodeText(node)}"`)
    }

    if (!APPLY) {
      continue
    }

    const newChildren = children.map((node, i) => replacements.get(i) ?? node)
    await payload.update({
      collection: 'posts',
      id: post.id,
      locale,
      data: {
        content: {
          ...post.content,
          root: { ...root, children: newChildren },
        },
      },
    })
    console.log('    → updated')
  }
}

console.log(
  `\n${repaired} quote(s) in ${touchedIds.size} post(s) ${APPLY ? 'repaired' : 'would be repaired'}` +
    (skipped ? `, ${skipped} skipped (see above)` : '') +
    (APPLY ? '' : '. Re-run with --apply to write.')
)

// A database write alone does not change what visitors see: the collection's
// afterChange revalidateTag is a no-op outside a Next request scope (see
// apply-case-study-imagery.ts for the full story). Expire the tags here.
if (APPLY && touchedSlugs.size > 0) {
  const tags = ['posts', ...[...touchedSlugs].sort().map((s) => `post:${s}`)]
  const query = tags.map((t) => `tag=${encodeURIComponent(t)}`).join('&')
  const flagIdx = process.argv.indexOf('--revalidate')
  const base = (
    flagIdx === -1 ? process.env.REVALIDATE_BASE_URL : process.argv[flagIdx + 1]
  )?.replace(/\/$/, '')
  const secret = process.env.REVALIDATE_SECRET

  if (!(base && secret)) {
    const why = base ? 'REVALIDATE_SECRET is not set' : 'no revalidation target'
    console.log(
      `\n! Deployed pages still show the old quotes — ${why}.\n` +
        '  The database is correct; the cache is not. Run:\n\n' +
        `  curl -X POST -H "x-revalidate-secret: $REVALIDATE_SECRET" \\\n` +
        `    "${base ?? '<baseUrl>'}/api/revalidate?${query}"\n`
    )
  } else {
    const res = await fetch(`${base}/api/revalidate?${query}`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    const body = await res.text()
    console.log(
      res.ok
        ? `\n+ revalidated ${tags.length} tag(s) on ${base}\n  ${body}`
        : `\n! revalidation failed (HTTP ${res.status}) on ${base}\n  ${body}`
    )
    if (!res.ok) process.exit(1)
  }
}

process.exit(0)
