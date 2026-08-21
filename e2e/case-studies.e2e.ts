import { expect, type Locator, type Page, test } from '@playwright/test'
import { foldDiacritics } from '@/lib/blog/search'
import type { CaseStudySearchCopy } from '@/lib/content/case-studies'
import { caseStudySearch as searchPl } from '@/lib/content/case-studies'
import { caseStudySearch as searchEn } from '@/lib/content/case-studies.en'
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
  },
  {
    locale: 'EN',
    hub: '/en/case-studies',
    prefix: '/en/case-studies/',
    copy: searchEn,
  },
] satisfies {
  locale: string
  hub: string
  prefix: string
  copy: CaseStudySearchCopy
}[]

/** Card images, the requests the "clear costs nothing" claim is about. */
function trackImageRequests(page: Page): string[] {
  const urls: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('/_next/image') || url.includes('/api/media/file')) {
      urls.push(url)
    }
  })
  return urls
}

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

      const cards = page.locator(`main a[href^="${prefix}"]`)
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
