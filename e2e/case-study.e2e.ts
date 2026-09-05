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

/**
 * The scoreboard hero, the section rail and the ledger (case-study-scoreboard).
 *
 * The claims worth a browser rather than a unit test are the ones about the
 * whole page: that the cover appears once and not twice, that the rail reflects
 * THIS study's sections, and that navigating between two studies does not leave
 * the previous page's observer marking a section — Next's Activity keeps the
 * old article mounted, so `#wyniki` briefly exists twice in the document.
 */
for (const { locale, hub, prefix } of HUBS) {
  test.describe(`Case-study scoreboard (${locale})`, () => {
    test(`hero, rail and ledger on the first ${locale} study`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, hub)

      const cards = page.locator(`main a[class*="__card"][href^="${prefix}"]`)
      test.skip(
        (await cards.count()) === 0 && EMPTY_CMS_OK,
        'CI ephemeral DB is unseeded — no case studies to render'
      )

      // The numeral the card promises is the numeral the study opens with.
      const cardNumeral = (
        await cards.locator('[class*="cardMetricValue"]').first().innerText()
      ).trim()
      const href = (await cards.first().getAttribute('href')) as string
      await gotoHydrated(page, href)

      // Ends-with: `[class*="__scoreboard"]` also matches `scoreboardCover`.
      const board = page.locator('[class$="__scoreboard"]')
      await expect(board).toBeVisible()
      expect(
        (await board.locator('[class*="scoreLeadValue"]').innerText()).trim()
      ).toBe(cardNumeral)

      // Exactly one cover on the page: the full-width 16:9 photograph the
      // scoreboard replaced is gone, not merely restyled.
      await expect(board.locator('[class$="scoreboardCover"] img')).toHaveCount(
        1
      )

      // The tiles are gone with it.
      await expect(page.locator('[class*="__tile"]')).toHaveCount(0)
      // Ends-with: `[class*="ledgerGroup"]` also matches `ledgerGroupTitle`.
      const groups = page.locator('[class$="ledgerGroup"]')
      expect(await groups.count()).toBeGreaterThan(0)
      // Every ledger group leads with exactly one large numeral.
      for (let i = 0; i < (await groups.count()); i++) {
        await expect(
          groups.nth(i).locator('[class$="ledgerLeadValue"]')
        ).toHaveCount(1)
      }

      // —— The rail lists the sections this study actually rendered ————————
      const rail = page.locator('nav[class$="__rail"]')
      const railLinks = rail.locator('a')
      // The fragment, not the whole href: `Link` resolves `#wyniki` to
      // `/case-studies/<slug>#wyniki`.
      const ids = await railLinks.evaluateAll((nodes) =>
        nodes.map((node) => (node.getAttribute('href') ?? '').split('#')[1])
      )
      expect(ids.length).toBeGreaterThan(0)
      for (const id of ids) {
        await expect(page.locator(`article [id="${id}"]`)).toHaveCount(1)
      }
      // …and nothing else: a section on the page that the rail skipped would
      // be as wrong as a rail entry with no section.
      const rendered = await page
        .locator('article section[aria-labelledby]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('aria-labelledby') ?? '')
        )
      expect(ids).toEqual(rendered)

      // —— Activating a rail entry takes the page to that section ————————
      //
      // Asserted through the hash and the single current mark, not through
      // "Wyniki is the marked one". Lenis lands a click short of its target on
      // a long page — measured at 630px here and 371px on a blog post, which
      // is the same `scrollTo` call the TOC has always made — so which section
      // the observer then reports is a property of that pre-existing landing,
      // not of this rail. What this change owns is that the click is handled
      // and exactly one entry is ever marked.
      const results = railLinks.filter({ hasText: /Wyniki|Results/ })
      if ((await results.count()) > 0) {
        await results.first().click()
        await expect(page).toHaveURL(/#wyniki$/)
      }
      await expect(rail.locator('a[aria-current]')).toHaveCount(1)

      // —— study → hub → study leaves no second current link ——————————————
      // Activity keeps the previous article mounted, so a rail that resolved
      // its targets through `document` would mark the old page's headings.
      await gotoHydrated(page, hub)
      const second = (await cards.nth(1).getAttribute('href')) ?? href
      await gotoHydrated(page, second)
      await expect(page.locator('nav[class$="__rail"]:visible')).toHaveCount(1)
      await expect(
        page.locator('nav[class$="__rail"]:visible a[aria-current]')
      ).toHaveCount(1)
    })
  })
}
