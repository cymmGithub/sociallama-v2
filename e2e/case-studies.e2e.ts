import { expect, type Locator, type Page, test } from '@playwright/test'
import { BLOB_HOST } from '@/lib/blob-store'
import { foldDiacritics } from '@/lib/blog/search'
import { INDUSTRY_KEYS } from '@/lib/content/branze'
import type {
  CaseStudySearchCopy,
  LocalizedCaseStudies,
} from '@/lib/content/case-studies'
import {
  caseStudiesListing as listingPl,
  caseStudySearch as searchPl,
} from '@/lib/content/case-studies'
import {
  caseStudiesListing as listingEn,
  caseStudySearch as searchEn,
} from '@/lib/content/case-studies.en'
import { collectPageErrors, EMPTY_CMS_OK, gotoHydrated } from './helpers'

/**
 * The `/case-studies` hub filter (add-case-study-hub-search).
 *
 * Nothing here hardcodes a brand: the queries are read off the rendered cards,
 * so the spec follows whatever is published instead of going stale the next
 * time the portfolio is reordered. The blog's search has no e2e today, so this
 * is new coverage rather than a mirror of an existing spec.
 */

const HUBS = [
  {
    locale: 'PL',
    hub: '/case-studies',
    prefix: '/case-studies/',
    copy: searchPl,
    listing: listingPl,
  },
  {
    locale: 'EN',
    hub: '/en/case-studies',
    prefix: '/en/case-studies/',
    copy: searchEn,
    listing: listingEn,
  },
] satisfies {
  locale: string
  hub: string
  prefix: string
  copy: CaseStudySearchCopy
  listing: LocalizedCaseStudies['caseStudiesListing']
}[]

/**
 * Card images, the requests the "clear costs nothing" claim is about.
 *
 * Three shapes, because one image can take any of them: the optimizer, the
 * Blob CDN (where uploads live once a write token is configured — so this is
 * the deployed shape, while a token-less local run still sees the third), and
 * Payload's retired proxy route.
 */
function trackImageRequests(page: Page): string[] {
  const urls: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (
      url.includes('/_next/image') ||
      url.includes(BLOB_HOST) ||
      url.includes('/api/media/file')
    ) {
      urls.push(url)
    }
  })
  return urls
}

/**
 * The grid's cards, and the ledger's rows, told apart by their own class.
 *
 * Both link to `/case-studies/<slug>`, so a plain href locator now matches 94
 * anchors on one page — the count `total` used to mean. The class is the only
 * thing that distinguishes them.
 */
const gridCards = (page: Page, prefix: string) =>
  page.locator(`main a[class*="__card"][href^="${prefix}"]`)

const ledgerRows = (page: Page, prefix: string) =>
  page.locator(`main a[class*="__row"][href^="${prefix}"]`)

/** Every card's text, hidden ones excluded by `display: none` on the veil. */
async function visibleCardText(cards: Locator): Promise<string[]> {
  return (await cards.evaluateAll((nodes) =>
    nodes
      .filter((node) => (node as HTMLElement).offsetParent !== null)
      .map((node) => node.textContent ?? '')
  )) as string[]
}

for (const { locale, hub, prefix, copy } of HUBS) {
  test.describe(`Case-study hub search (${locale})`, () => {
    test(`filters the grid, empties, and restores on ${hub}`, async ({
      page,
    }) => {
      const { consoleErrors, pageErrors } = collectPageErrors(page)
      const imageRequests = trackImageRequests(page)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, hub)

      const cards = gridCards(page, prefix)
      const total = await cards.count()
      test.skip(
        total === 0 && EMPTY_CMS_OK,
        'CI ephemeral DB is unseeded — no case studies to filter'
      )
      expect(total).toBeGreaterThan(1)

      const search = page.getByRole('searchbox', { name: copy.label })
      await expect(search).toHaveAttribute('placeholder', copy.placeholder)

      // Everything already fetched at this point is what clearing must not
      // fetch again.
      const beforeFiltering = new Set(imageRequests)
      const requestsAtRest = imageRequests.length
      // Without this the refetch assertion below passes on an empty list, and
      // says nothing. Exactly how it would fail if the images moved to a host
      // `trackImageRequests` does not know about.
      expect(requestsAtRest).toBeGreaterThan(0)

      // —— A client's own name narrows the grid ——————————————————————————
      const firstCard = cards.first()
      const client = await firstCard
        .locator('[class$="cardLogo"] img')
        .getAttribute('alt')
      expect(client).toBeTruthy()

      await search.fill(client as string)
      await expect(firstCard).toBeVisible()
      const clientMatches = await cards.evaluateAll(
        (nodes) =>
          nodes.filter((node) => (node as HTMLElement).offsetParent !== null)
            .length
      )
      expect(clientMatches).toBeGreaterThan(0)
      expect(clientMatches).toBeLessThan(total)

      // —— A tag narrows it to cards that carry that tag ————————————————
      // Ends-with, not contains: `cardTags` is the row, `cardTag` one pill.
      const tag = await page.locator('[class$="cardTag"]').first().innerText()
      await search.fill(tag)
      const tagged = await visibleCardText(cards)
      expect(tagged.length).toBeGreaterThan(0)
      expect(tagged.length).toBeLessThan(total)
      for (const text of tagged) {
        expect(foldDiacritics(text)).toContain(foldDiacritics(tag))
      }

      // —— Nonsense empties the grid and says so ————————————————————————
      await search.fill('qqzzxx')
      await expect(cards.first()).toBeHidden()
      expect(await visibleCardText(cards)).toEqual([])
      await expect(page.getByText(copy.emptyTitle)).toBeAttached()
      await expect(page.locator('p[aria-live="polite"]')).toHaveText(
        copy.results(0)
      )

      // —— Clearing restores the portfolio, and costs nothing ————————————
      await page.getByRole('button', { name: copy.clear }).click()
      await expect(search).toHaveValue('')
      expect((await visibleCardText(cards)).length).toBe(total)
      await expect(page.locator('p[aria-live="polite"]')).toHaveText('')

      // Filtering hides cards, it does not unmount them: no image the page had
      // already fetched may be fetched a second time.
      const refetched = imageRequests
        .slice(requestsAtRest)
        .filter((url) => beforeFiltering.has(url))
      expect(refetched).toEqual([])

      // Resource 400s are excluded, not asserted away lightly: this hub asks
      // for ~96 images in one paint (a cover and a logo per study), which
      // trips the dev rate limiter (60 req/60s) — the optimizer then surfaces
      // the 429 as a 400. The untouched `case-study.e2e.ts` fails the same way
      // on the same page, so it is the environment, not the filter. Everything
      // a client component can actually break still fails this spec.
      expect(
        consoleErrors.filter(
          (error) => !error.startsWith('Failed to load resource')
        )
      ).toEqual([])
      expect(pageErrors).toEqual([])
    })
  })
}

/**
 * The industry rail, the view toggle and how they compose with the search
 * (case-study-scoreboard).
 *
 * As above, nothing hardcodes a brand or a count: the rail's own numbers are
 * checked against the cards that survive selecting them, so the spec follows
 * the portfolio rather than a snapshot of it.
 */
for (const { locale, hub, prefix, copy, listing } of HUBS) {
  test.describe(`Case-study hub industry rail and views (${locale})`, () => {
    test(`filters, composes and toggles on ${hub}`, async ({ page }) => {
      const { consoleErrors, pageErrors } = collectPageErrors(page)
      const imageRequests = trackImageRequests(page)
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, hub)

      const cards = gridCards(page, prefix)
      const total = await cards.count()
      test.skip(
        total === 0 && EMPTY_CMS_OK,
        'CI ephemeral DB is unseeded — no case studies to filter'
      )

      const rail = page.getByRole('navigation', {
        name: listing.filters.label,
      })
      const chips = rail.getByRole('button')
      const listed = await chips.evaluateAll((nodes) =>
        nodes.map((node) => (node.textContent ?? '').trim())
      )
      // `Wszystkie` plus at most one entry per industry the taxonomy knows.
      expect(listed.length).toBeGreaterThan(1)
      expect(listed.length).toBeLessThanOrEqual(INDUSTRY_KEYS.length + 1)
      expect(listed[0]).toContain(listing.filters.all)

      // —— Every listed count equals the cards that survive selecting it ——
      // This is the honest reading of "Motoryzacja 4", and it is also the
      // check that an industry with no studies is never offered: a chip whose
      // count did not match would either strand the visitor on an empty grid
      // or lie about the portfolio.
      const railCount = await chips.count()
      for (let i = 1; i < railCount; i++) {
        const chip = chips.nth(i)
        const text = (await chip.innerText()).trim()
        const claimed = Number(text.split(/\s+/).at(-1))
        expect(claimed).toBeGreaterThan(0)
        await chip.click()
        await expect(chip).toHaveAttribute('aria-pressed', 'true')
        expect((await visibleCardText(cards)).length).toBe(claimed)
        await expect(page.locator('p[aria-live="polite"]')).toHaveText(
          copy.results(claimed)
        )
      }

      // —— Industry ANDs with the search ————————————————————————————————
      const narrow = chips.nth(1)
      await narrow.click()
      const inIndustry = await visibleCardText(cards)
      const search = page.getByRole('searchbox', { name: copy.label })
      // The client's own name, read off a card that survived the industry —
      // a card's full text is one unbroken string and matches nothing.
      const client = await cards
        .locator('visible=true')
        .first()
        .locator('[class$="cardLogo"] img')
        .getAttribute('alt')
      expect(client).toBeTruthy()
      await search.fill(client as string)
      const both = await visibleCardText(cards)
      expect(both.length).toBeGreaterThan(0)
      expect(both.length).toBeLessThanOrEqual(inIndustry.length)

      // —— An empty intersection keeps the industry selected ————————————
      await search.fill('qqzzxx')
      expect(await visibleCardText(cards)).toEqual([])
      await expect(page.getByText(copy.emptyTitle)).toBeAttached()
      await expect(narrow).toHaveAttribute('aria-pressed', 'true')

      await search.fill('')
      await chips.first().click()
      expect((await visibleCardText(cards)).length).toBe(total)

      // —— The ledger shows the same set, and costs nothing ————————————
      const beforeToggle = new Set(imageRequests)
      const requestsAtRest = imageRequests.length
      expect(requestsAtRest).toBeGreaterThan(0)

      await page.getByRole('button', { name: listing.views.ledger }).click()
      expect((await visibleCardText(ledgerRows(page, prefix))).length).toBe(
        total
      )

      // Switching introduces no image the grid had not already asked for.
      //
      // Deliberately phrased as "no NEW url" rather than "no repeated url",
      // which is what the search spec above can assert. The difference is
      // real: filtering reveals nothing, so nothing loads, while the toggle
      // un-hides lazy `<img>`s that never loaded — and those hit the browser
      // cache only if the response was cacheable. Locally every
      // `/api/media/file/*` is a 500, which is not, so they repeat here and
      // would not on a deployed build. A new URL, though, would mean the rows
      // ask for a different image than the cards — the regression this is for.
      const introduced = imageRequests
        .slice(requestsAtRest)
        .filter((url) => !beforeToggle.has(url))
      expect(introduced).toEqual([])

      // —— No toggle on a phone ————————————————————————————————————————
      await page.setViewportSize({ width: 390, height: 844 })
      await expect(
        page.getByRole('group', { name: listing.views.label })
      ).toHaveCount(0)

      // Resource 400s excluded for the same reason as the spec above: this hub
      // asks for ~96 images in one paint and trips the dev rate limiter.
      expect(
        consoleErrors.filter(
          (error) => !error.startsWith('Failed to load resource')
        )
      ).toEqual([])
      expect(pageErrors).toEqual([])
    })
  })
}
