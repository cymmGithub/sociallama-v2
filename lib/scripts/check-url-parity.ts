/**
 * Launch-day URL parity gate (migrate-wp-content, task 4.1)
 *
 * Fetches every URL from the live WordPress site's Yoast sitemaps (posts,
 * pages, categories, tags) and requests each against a target deployment.
 * A URL passes when its redirect chain (followed within the target, max 5
 * hops) ends in HTTP 200 — so posts/hub/categories pass directly and legacy
 * tag/page URLs pass via their 301s. Any 404 (or dead redirect) fails the
 * gate and the script exits non-zero. This is the launch blocker: run it
 * against the preview deployment before DNS cutover, and again after the
 * final pre-cutover re-import.
 *
 * Usage:
 *   bun ./lib/scripts/check-url-parity.ts <target-base-url>
 *   bun ./lib/scripts/check-url-parity.ts https://sociallama-v2-xyz.vercel.app
 *
 * For password-protected preview deployments, set
 * VERCEL_AUTOMATION_BYPASS_SECRET in the environment — it is sent as the
 * protection-bypass header.
 */

const WP_ORIGIN = 'https://sociallama.pl'
const SITEMAPS = [
  'post-sitemap.xml',
  'page-sitemap.xml',
  'category-sitemap.xml',
  'post_tag-sitemap.xml',
]
const CONCURRENCY = 8
const MAX_HOPS = 5

const baseArg = process.argv[2]
if (!baseArg) {
  console.error(
    'Usage: bun ./lib/scripts/check-url-parity.ts <target-base-url>'
  )
  process.exit(2)
}
const BASE = baseArg.replace(/\/+$/, '')

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const headers: Record<string, string> = {
  'user-agent': 'sociallama-v2-parity-gate/1.0',
  ...(bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {}),
}

interface UrlResult {
  chain: string[]
  finalStatus: number
  path: string
  sitemap: string
}

async function fetchSitemapPaths(sitemap: string): Promise<string[]> {
  const res = await fetch(`${WP_ORIGIN}/${sitemap}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch live ${sitemap}: HTTP ${res.status}`)
  }
  const xml = await res.text()
  const paths: string[] = []
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1] as string)
    if (url.origin !== WP_ORIGIN) continue
    paths.push(url.pathname)
  }
  return paths
}

/** Follow the redirect chain within the target; return statuses and hops. */
async function checkUrl(path: string, sitemap: string): Promise<UrlResult> {
  const chain: string[] = []
  let url = `${BASE}${path}`
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const res = await fetch(url, { headers, redirect: 'manual' })
    chain.push(`${res.status} ${new URL(url).pathname}`)
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) {
        return { chain, finalStatus: res.status, path, sitemap }
      }
      url = new URL(location, url).href
      // A redirect off the target (e.g. an external destination) counts as
      // resolving — we only gate the target's own surface.
      if (!url.startsWith(BASE)) {
        chain.push(`→ external ${url}`)
        return { chain, finalStatus: 200, path, sitemap }
      }
      continue
    }
    return { chain, finalStatus: res.status, path, sitemap }
  }
  return { chain, finalStatus: 508, path, sitemap }
}

console.log(`Parity gate: live sitemaps → ${BASE}\n`)

const urls: { path: string; sitemap: string }[] = []
for (const sitemap of SITEMAPS) {
  const paths = await fetchSitemapPaths(sitemap)
  console.log(`${sitemap}: ${paths.length} URLs`)
  urls.push(...paths.map((path) => ({ path, sitemap })))
}
console.log(`\nChecking ${urls.length} URLs (concurrency ${CONCURRENCY})…\n`)

const results: UrlResult[] = []
let cursor = 0
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < urls.length) {
      const item = urls[cursor++]
      if (!item) break
      results.push(await checkUrl(item.path, item.sitemap))
    }
  })
)

const failures = results.filter((r) => r.finalStatus !== 200)
const redirected = results.filter(
  (r) => r.finalStatus === 200 && r.chain.length > 1
)
const direct = results.filter(
  (r) => r.finalStatus === 200 && r.chain.length === 1
)

console.log(
  `✓ ${direct.length} direct 200, ✓ ${redirected.length} resolved via redirect, ✗ ${failures.length} failing\n`
)

if (failures.length > 0) {
  console.error('Failing URLs:')
  for (const f of failures.sort((a, b) => a.path.localeCompare(b.path))) {
    console.error(`  ✗ [${f.sitemap}] ${f.path} — ${f.chain.join(' → ')}`)
  }
  console.error(
    `\n✗ Parity gate FAILED: ${failures.length} URL(s) do not resolve.`
  )
  process.exit(1)
}
console.log(
  '✓ Parity gate PASSED: every live sitemap URL resolves on the target.'
)

// Top-level await requires module context.
export {}
