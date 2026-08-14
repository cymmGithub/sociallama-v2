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

  // The bare /oferta overview keeps its existing target — it is the offer
  // index, not a platform page, and the spec leaves it alone.
  test('the bare /oferta overview is unchanged', () => {
    const overview = wpRedirects.find((rule) => rule.source === '/oferta')
    expect(overview?.destination).toBe('/#uslugi')
  })
})
