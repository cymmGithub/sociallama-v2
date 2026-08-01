import { expect, type Page, test } from '@playwright/test'
import { waitForHydration } from './helpers'

/**
 * Tier-1 "every user path" coverage (add-e2e-monitoring): whatever the
 * sitemap publishes must actually work. The URL set is read from
 * /sitemap.xml at run time, so a newly published post or case study is
 * covered with no change to this file — and a page that ships broken fails
 * here the day it enters the sitemap.
 *
 * The sitemap carries the CANONICAL host (NEXT_PUBLIC_BASE_URL), which is not
 * necessarily the host under test: pre-cutover the live target is a
 * vercel.app domain, locally it is a dev server. Only pathnames are kept and
 * re-joined onto the run's baseURL — crawling the <loc> URLs verbatim would
 * silently test the wrong deployment.
 *
 * Against CI's empty database this degrades gracefully to the static routes;
 * against the live CMS it visits everything published. The count is logged
 * each run, never capped.
 */

/** Console-error patterns known to be benign. Empty by design — add an entry
 * only with a comment naming the emitting source and why it cannot be fixed. */
const CONSOLE_ALLOWLIST: RegExp[] = []

/** Generous per-URL budget: a cold dev server compiles each route on first
 * request, and the remote target pays real network latency. */
const PER_URL_TIMEOUT = 20_000

/** URLs per page before it is closed and replaced. One page reused across the
 * whole crawl exhausts the renderer on the media-heavy case studies —
 * ERR_INSUFFICIENT_RESOURCES, then failed chunk loads, then a hydration
 * timeout — which reads as a site bug but is purely crawl-harness debt. */
const PAGE_RECYCLE_EVERY = 15

test.describe('Sitemap crawl', { tag: ['@monitor', '@slow'] }, () => {
  test('every sitemap URL responds 200, hydrates, and logs no console errors', async ({
    context,
    request,
  }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const xml = await response.text()

    const paths = [
      ...new Set(
        [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
          .map((match) => match[1] ?? '')
          .filter(Boolean)
          .map((loc) => new URL(loc).pathname)
      ),
    ]
    // A sitemap without at least the static routes means the sitemap itself
    // is broken — fail loudly rather than green-crawling nothing.
    expect(paths.length).toBeGreaterThanOrEqual(6)
    console.log(`sitemap crawl: visiting ${paths.length} URLs`)
    test.setTimeout(paths.length * PER_URL_TIMEOUT)

    // Errors are attributed to the URL being visited when they fire, and
    // collected across the whole crawl so ONE run reports EVERY broken URL —
    // no fail-fast on the third entry of sixty.
    const failures: string[] = []
    let current = ''

    const freshPage = async (): Promise<Page> => {
      const page = await context.newPage()
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return
        const text = msg.text()
        if (CONSOLE_ALLOWLIST.some((pattern) => pattern.test(text))) return
        failures.push(`${current} → console error: ${text}`)
      })
      page.on('pageerror', (error) => {
        failures.push(`${current} → page error: ${error.message}`)
      })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      return page
    }

    let page = await freshPage()
    let visited = 0

    for (const path of paths) {
      if (visited > 0 && visited % PAGE_RECYCLE_EVERY === 0) {
        await page.close()
        page = await freshPage()
      }
      visited++
      current = path
      try {
        const res = await page.goto(path, {
          waitUntil: 'domcontentloaded',
          timeout: PER_URL_TIMEOUT,
        })
        if (res?.status() !== 200) {
          failures.push(`${path} → HTTP ${res?.status() ?? 'no response'}`)
          continue
        }
        // Lenis mounting proves client effects ran — the page is not a shell.
        await waitForHydration(page)
      } catch (error) {
        failures.push(`${path} → ${(error as Error).message.split('\n')[0]}`)
      }
    }

    expect(failures).toEqual([])
  })
})
