import { expect, test } from '@playwright/test'
import { collectPageErrors, EMPTY_CMS_OK, gotoHydrated } from './helpers'

/**
 * Case-study detail render coverage (add-e2e-monitoring). The client-belt
 * suite already proves the roster's CTA slugs return HTTP 200; nothing until
 * now proved a detail page actually RENDERS — these are the richest pages on
 * the site (galleries, per-platform results, approach media) and a data or
 * hydration regression there returned 200 all the same. Sampled from the hub
 * so the covered study follows whatever is published, with no fixture slug to
 * go stale.
 */

const HUBS = [
  { locale: 'PL', hub: '/case-studies', prefix: '/case-studies/' },
  { locale: 'EN', hub: '/en/case-studies', prefix: '/en/case-studies/' },
]

test.describe('Case-study detail', { tag: '@monitor' }, () => {
  for (const { locale, hub, prefix } of HUBS) {
    test(`the first ${locale} study renders its article, not just a 200`, async ({
      page,
    }) => {
      const { consoleErrors, pageErrors } = collectPageErrors(page)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, hub)

      // The hub must list at least one study — an empty listing is a
      // regression everywhere content exists (seeded local dev DB, live);
      // only CI's unseeded ephemeral DB legitimately renders none.
      const cards = page.locator(`main a[href^="${prefix}"]`)
      const count = await cards.count()
      test.skip(
        count === 0 && EMPTY_CMS_OK,
        'CI ephemeral DB is unseeded — no case studies to render'
      )
      expect(count).toBeGreaterThan(0)

      const href = await cards.first().getAttribute('href')
      await gotoHydrated(page, href as string)

      // Real render: non-empty title and the article's sections attached.
      await expect(page.locator('article h1').first()).not.toBeEmpty()
      expect(await page.locator('article section').count()).toBeGreaterThan(0)

      // EN detail pages must keep internal navigation in the /en tree.
      if (locale === 'EN') {
        await expect(page.locator('main a[href="/case-studies"]')).toHaveCount(
          0
        )
      }

      expect(consoleErrors).toEqual([])
      expect(pageErrors).toEqual([])
    })
  }
})
