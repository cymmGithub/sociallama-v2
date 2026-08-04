import { expect, test } from '@playwright/test'
import { wpRedirects } from '../lib/wp-redirects'

/**
 * The legacy `/oferta/<platform>` URLs, checked the way the launch-day parity
 * gate checks them: the old URL must answer 301, and what it points at must
 * answer 200.
 *
 * These six carry real rankings on the live WordPress site (`/oferta/facebook/`
 * still ranks for "obsługa facebooka"), and until this change they landed on a
 * homepage anchor. Retargeting them at the landing is only worth anything if
 * the target actually resolves — a slug rename would leave six 301s pointing
 * into a 404 and nothing else on the site would notice.
 *
 * `lib/content/uslugi.test.ts` asserts the same pairing at the content level,
 * which is the check that runs in `bun test`; this one proves the HTTP
 * behaviour the spec is written in terms of.
 */

const platformOffers = wpRedirects.filter((rule) =>
  rule.source.startsWith('/oferta/')
)

test.describe('Legacy /oferta redirects', () => {
  test('there are six of them, all pointing at the landing', () => {
    expect(platformOffers.map((rule) => rule.source).sort()).toEqual([
      '/oferta/facebook',
      '/oferta/instagram',
      '/oferta/linkedin',
      '/oferta/pinterest',
      '/oferta/tiktok',
      '/oferta/twitter',
    ])
    for (const rule of platformOffers) {
      expect(rule.destination).toBe('/uslugi/prowadzenie-social-media')
      expect(rule.statusCode).toBe(301)
    }
  })

  test('each answers 301 and its target answers 200', async ({ request }) => {
    for (const rule of platformOffers) {
      const hop = await request.get(rule.source, { maxRedirects: 0 })
      expect(hop.status(), `${rule.source} status`).toBe(301)
      expect(hop.headers().location, `${rule.source} location`).toContain(
        rule.destination
      )

      const target = await request.get(rule.destination)
      expect(target.status(), `${rule.destination} status`).toBe(200)
    }
  })

  // The bare /oferta overview goes to the hub, not the landing — it is the
  // offer index, not a platform page, so the index is its successor.
  test('the bare /oferta overview targets the hub', () => {
    const overview = wpRedirects.find((rule) => rule.source === '/oferta')
    expect(overview?.destination).toBe('/uslugi')
  })

  /*
   * The rule the whole map is now held to. A fragment in a redirect target is
   * invisible to crawlers, so `/#uslugi` consolidated equity into `/` rather
   * than the section it named — which is what every anchor destination in this
   * file used to do.
   */
  test('no rule anywhere targets a fragment', () => {
    const withFragment = wpRedirects
      .filter((rule) => rule.destination.includes('#'))
      .map((rule) => `${rule.source} → ${rule.destination}`)
    expect(withFragment).toEqual([])
  })

  test('every rule is a 301, and there are still eleven', () => {
    expect(wpRedirects.length).toBe(11)
    expect(wpRedirects.filter((rule) => rule.statusCode !== 301)).toEqual([])
  })
})
