/**
 * Post-build guard for the pure-static serving class of the marketing pages.
 *
 * `findLatestPost` opts out of time-based revalidation by passing Next's
 * INFINITE_CACHE sentinel (0xfffffffe) to cacheLife() — the profiles cap at
 * 'max' = 30d, which keeps a route ISR-class, and Vercel's cold-PoP path for
 * ISR routes buffers the whole document (~3-5s; 2026-07-30 audit). Next
 * NORMALIZES the sentinel to `revalidate: false` in the prerender manifest,
 * but that normalization is internal behavior, not documented API — so a Next
 * upgrade could silently drop it, and the only symptom would be cold-request
 * latency nobody sees locally. This asserts the OUTCOME after every build:
 * if a guarded route regains a finite revalidate, the build fails loudly.
 *
 * When Next ships an official "on-demand revalidation only" cache profile,
 * swap the sentinel for it in lib/payload/queries.ts — this check stays valid
 * as-is either way.
 */

const GUARDED_ROUTES = ['/', '/en', '/o-nas', '/en/about-us']

const manifestPath = new URL(
  '../../.next/prerender-manifest.json',
  import.meta.url
).pathname

const manifest = (await Bun.file(manifestPath).json()) as {
  routes: Record<string, { initialRevalidateSeconds?: number | false }>
}

const broken = GUARDED_ROUTES.filter(
  (route) => manifest.routes[route]?.initialRevalidateSeconds !== false
)

if (broken.length > 0) {
  for (const route of broken) {
    const value = manifest.routes[route]?.initialRevalidateSeconds
    console.error(
      `[check-prerender] ${route} is no longer pure static ` +
        `(initialRevalidateSeconds=${JSON.stringify(value)}, expected false). ` +
        'The INFINITE_CACHE sentinel in lib/payload/queries.ts findLatestPost ' +
        'stopped normalizing to `revalidate: false` — likely a Next upgrade. ' +
        'Cold-PoP requests will buffer the whole document again.'
    )
  }
  process.exit(1)
}

console.log(
  `[check-prerender] ${GUARDED_ROUTES.join(', ')} are pure static (revalidate: false)`
)
