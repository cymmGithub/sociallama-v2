/**
 * Legacy WordPress redirect generator (migrate-wp-content, task 1.x)
 *
 * Fetches the live Yoast tag + page sitemaps and regenerates the committed
 * redirects module `lib/wp-redirects.ts`:
 *   - `/tag/:slug` → `/blog` blanket 301 (tag pages are thin archives)
 *   - explicit 301 per WP page with a v2 equivalent
 *
 * Pages WITHOUT a v2 equivalent are never silently dropped: they must have
 * an entry in PAGE_DISPOSITIONS below. Record a decision by editing that
 * table and re-running. Pages still `pending` (or missing entirely) are
 * listed in the disposition report and leave the script exiting non-zero —
 * the parity gate would fail on them anyway, this just fails earlier.
 *
 * Run with: bun ./lib/scripts/generate-wp-redirects.ts
 * The WP host is decommissioned after cutover, so this is a run-once tool;
 * the emitted module is the committed artifact, not this script's output.
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WP_ORIGIN = 'https://sociallama.pl'
const ROOT = join(import.meta.dir, '..', '..')
const OUT_MODULE = join(ROOT, 'lib', 'wp-redirects.ts')
const OUT_REPORT = join(
  ROOT,
  'openspec',
  'changes',
  'migrate-wp-content',
  'page-disposition.md'
)

type Disposition =
  /** 301 to a v2 route or homepage anchor. */
  | { kind: 'redirect'; to: string; note: string }
  /** Resolves on v2 as-is (HTTP 200) — no rule emitted. */
  | { kind: 'keep'; note: string }
  /** Explicitly accepted 404 (user decision recorded). */
  | { kind: 'gone'; note: string }
  /** Awaiting a user decision — blocks a clean exit. */
  | { kind: 'pending'; note: string }

/**
 * Disposition per WP page URL (path form, no trailing slash).
 * THIS TABLE IS THE DECISION RECORD required by the seo-url-parity spec:
 * every page-sitemap URL must resolve to redirect/keep/gone before cutover.
 */
const PAGE_DISPOSITIONS: Record<string, Disposition> = {
  '/': { kind: 'keep', note: 'v2 homepage' },
  '/oferta': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'offer overview → services section anchor',
  },
  '/oferta/facebook': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'platform offer page → services section anchor',
  },
  '/oferta/instagram': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'platform offer page → services section anchor',
  },
  '/oferta/linkedin': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'platform offer page → services section anchor',
  },
  '/oferta/tiktok': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'platform offer page → services section anchor',
  },
  '/oferta/twitter': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'platform offer page → services section anchor',
  },
  '/oferta/pinterest': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'platform offer page → services section anchor',
  },
  '/z-lama-warto': {
    kind: 'redirect',
    to: '/#o-nas',
    note: 'why-us page → about section anchor',
  },
  '/kontakt': {
    kind: 'keep',
    note: 'add-contact-page: served by the real v2 /kontakt route (HTTP 200), no longer redirected to the footer anchor',
  },
  '/zostan-lama': {
    kind: 'keep',
    note: 'user decision 2026-07-17: v2 page built from the WP page content',
  },
  '/500-zl-na-reklame': {
    kind: 'redirect',
    to: '/#uslugi',
    note: 'user decision 2026-07-17: obsolete 2017 ad promo → services anchor',
  },
  '/cookie-policy': {
    kind: 'redirect',
    to: '/polityka-prywatnosci',
    note: 'user decision 2026-07-17: cookie info folds into the privacy policy page',
  },
  '/polityka-prywatnosci': {
    kind: 'keep',
    note: 'user decision 2026-07-17: v2 page built from the WP page content (footer already links here)',
  },
}

async function fetchSitemapPaths(sitemap: string): Promise<string[]> {
  const res = await fetch(`${WP_ORIGIN}/${sitemap}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${sitemap}: HTTP ${res.status}`)
  }
  const xml = await res.text()
  const paths: string[] = []
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1] as string)
    if (url.origin !== WP_ORIGIN) continue
    paths.push(url.pathname.replace(/\/$/, '') || '/')
  }
  return paths
}

const [tagPaths, pagePaths] = await Promise.all([
  fetchSitemapPaths('post_tag-sitemap.xml'),
  fetchSitemapPaths('page-sitemap.xml'),
])

if (tagPaths.length === 0 || !tagPaths.every((p) => p.startsWith('/tag/'))) {
  throw new Error(
    `post_tag-sitemap.xml looks wrong: ${tagPaths.length} entries, non-/tag/ paths present`
  )
}

// --- Cross-check dispositions against the live sitemap ----------------------
const unmapped = pagePaths.filter((p) => !(p in PAGE_DISPOSITIONS))
const stale = Object.keys(PAGE_DISPOSITIONS).filter(
  (p) => !pagePaths.includes(p)
)
const pending = pagePaths.filter(
  (p) => PAGE_DISPOSITIONS[p]?.kind === 'pending'
)

// --- Emit the redirects module ----------------------------------------------
const pageRules = pagePaths.flatMap((path) => {
  const disposition = PAGE_DISPOSITIONS[path]
  if (disposition?.kind !== 'redirect') return []
  return [
    `  // ${path}/ — ${disposition.note}\n  { source: '${path}', destination: '${disposition.to}', statusCode: 301 },`,
  ]
})

const module_ = `/**
 * Legacy WordPress URL redirects — GENERATED FILE, do not edit by hand.
 * Regenerate with: bun ./lib/scripts/generate-wp-redirects.ts
 * (dispositions are recorded in that script; the WP host is gone after
 * cutover, so this committed output is the artifact of record).
 *
 * Generated from the live Yoast sitemaps: ${tagPaths.length} tag URLs,
 * ${pagePaths.length} page URLs. \`statusCode: 301\` throughout — Next's
 * \`permanent: true\` would emit 308; the seo-url-parity spec requires 301.
 */

interface WpRedirect {
  source: string
  destination: string
  statusCode: 301
}

export const wpRedirects: WpRedirect[] = [
  // All ${tagPaths.length} /tag/* archive pages are thin content — blanket rule.
  { source: '/tag/:slug', destination: '/blog', statusCode: 301 },
${pageRules.join('\n')}
]
`
writeFileSync(OUT_MODULE, module_)
console.log(`✓ wrote ${OUT_MODULE}`)

// --- Disposition report ------------------------------------------------------
const lines: string[] = [
  '# WP page disposition report',
  '',
  `Generated by \`lib/scripts/generate-wp-redirects.ts\` from the live`,
  `\`page-sitemap.xml\` (${pagePaths.length} URLs). Decisions are recorded in`,
  'the `PAGE_DISPOSITIONS` table in that script; edit and re-run to update.',
  '',
  '| WP URL | Disposition | Detail |',
  '| --- | --- | --- |',
]
for (const path of pagePaths) {
  const d = PAGE_DISPOSITIONS[path]
  if (!d) {
    lines.push(`| \`${path}/\` | ⚠️ UNMAPPED | no disposition entry |`)
    continue
  }
  const detail = d.kind === 'redirect' ? `→ \`${d.to}\` — ${d.note}` : d.note
  const label = {
    redirect: '301',
    keep: '200 (keep)',
    gone: 'accepted 404',
    pending: '❓ PENDING',
  }[d.kind]
  lines.push(`| \`${path}/\` | ${label} | ${detail} |`)
}
if (stale.length > 0) {
  lines.push(
    '',
    `Stale disposition entries (not in sitemap): ${stale.join(', ')}`
  )
}
lines.push('')
writeFileSync(OUT_REPORT, lines.join('\n'))
console.log(`✓ wrote ${OUT_REPORT}`)

// --- Summary -----------------------------------------------------------------
console.log(
  `\nTags: ${tagPaths.length} → blanket /tag/:slug → /blog` +
    `\nPages: ${pagePaths.length} total, ${pageRules.length} redirects, ` +
    `${pending.length} pending, ${unmapped.length} unmapped`
)
if (unmapped.length > 0 || pending.length > 0) {
  console.error(
    '\n✗ Unresolved page dispositions (decide in PAGE_DISPOSITIONS and re-run):'
  )
  for (const p of [...unmapped, ...pending]) {
    console.error(
      `  - ${p}/ ${PAGE_DISPOSITIONS[p] ? `(${(PAGE_DISPOSITIONS[p] as Disposition).note})` : '(no entry)'}`
    )
  }
  process.exit(1)
}
console.log('\n✓ every page URL has a recorded disposition')
