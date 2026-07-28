import { expect, type Page, test } from '@playwright/test'
import { INDUSTRIES } from '../lib/content/branze'
import { SERVICES } from '../lib/content/uslugi'
import { gotoHydrated } from './helpers'

/**
 * Locale routing regression suite — guards the four failures found in the
 * 2026-07-28 audit:
 *
 * - "Training & Courses" survived in the EN menu and footer after the PL fix
 *   (04efb81) commented it out of `home.ts` only. `home.en.ts` is a parallel
 *   hand-maintained literal, so the link stayed live and pointed at
 *   `/en/training`, which has no route — a 404 in the primary nav.
 * - The header logo hardcoded `href="/"`, so every EN visitor who clicked it
 *   landed on the Polish home.
 * - The PL/EN toggle dropped visitors on the other locale's *home* from every
 *   service and industry page, because `slug-map.ts` carried no pairs for them.
 * - The shared `ErrorView` "Go Home" CTA pointed at the Polish home on EN.
 *
 * The chrome sweep is the general guard: it walks every internal link in the
 * menu overlay and footer of both locales and fails on any that does not
 * resolve. That is what would have caught `/en/training` on the day it shipped.
 */

/**
 * Linked from both menus but not built yet — the index pages are being added
 * separately. Delete these entries when `/branze` and `/en/industries` ship,
 * and flip `hasIndex` in `lib/i18n/slug-map.ts` at the same time.
 */
const PENDING_PAGES = new Set(['/branze', '/en/industries'])

/** Raw hrefs from the always-mounted menu overlay and the footer. */
async function chromeHrefs(page: Page): Promise<string[]> {
  return page
    .locator('#site-menu a[href], footer a[href]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? '')
    )
}

/** Internal, de-duplicated, hash stripped — the set worth requesting. */
function internalPaths(hrefs: string[]): string[] {
  const paths = hrefs
    .filter((href) => href.startsWith('/') && !href.startsWith('//'))
    .map((href) => href.split('#')[0])
    .filter((href): href is string => Boolean(href))
  return [...new Set(paths)]
}

test.describe('Locale routing — chrome links resolve', () => {
  for (const { locale, path } of [
    { locale: 'PL', path: '/' },
    { locale: 'EN', path: '/en' },
  ]) {
    test(`every internal ${locale} chrome link resolves`, async ({ page }) => {
      // A cold dev server compiles each route on first request.
      test.setTimeout(180_000)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, path)

      const paths = internalPaths(await chromeHrefs(page))
      expect(paths.length).toBeGreaterThan(5)

      const broken: string[] = []
      for (const target of paths) {
        if (PENDING_PAGES.has(target)) continue
        const response = await page.request.get(target)
        if (response.status() >= 400) {
          broken.push(`${target} → ${response.status()}`)
        }
      }
      expect(broken).toEqual([])
    })
  }

  test('the retired Training & Courses link is gone from the EN chrome', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/en')

    const hrefs = await chromeHrefs(page)
    expect(hrefs.filter((href) => href.includes('/training'))).toEqual([])
    await expect(page.getByRole('link', { name: /training/i })).toHaveCount(0)
  })

  test('the retired Szkolenia link is gone from the PL chrome', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')

    const hrefs = await chromeHrefs(page)
    expect(hrefs.filter((href) => href.includes('/szkolenia'))).toEqual([])
  })
})

test.describe('Locale routing — header logo', () => {
  test('the logo points at the active locale home', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await gotoHydrated(page, '/en')
    await expect(page.locator('header a').first()).toHaveAttribute(
      'href',
      '/en'
    )

    await gotoHydrated(page, '/')
    await expect(page.locator('header a').first()).toHaveAttribute('href', '/')
  })

  test('clicking the EN logo stays in the EN tree', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/en/about-us')

    await page.locator('header a[href="/en"]').first().click()
    await expect(page).toHaveURL(/\/en$/)
  })
})

test.describe('Locale routing — language toggle', () => {
  // One representative of each shape, plus the two whose slugs are translated
  // (the case the old prefix-swap logic could not express).
  const CASES = [
    { from: '/uslugi', to: '/en/services' },
    { from: '/uslugi/strategia', to: '/en/services/strategy' },
    { from: '/uslugi/kampanie-reklamowe', to: '/en/services/ad-campaigns' },
    { from: '/branze/elektronika-i-agd', to: '/en/industries/electronics' },
    { from: '/branze/rozrywka', to: '/en/industries/entertainment' },
  ]

  for (const { from, to } of CASES) {
    test(`${from} offers ${to}, not the home page`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, from)

      const toEn = page.locator('footer a[hreflang="en"]').first()
      await expect(toEn).toHaveAttribute('href', to)
    })

    test(`${to} offers ${from} back`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, to)

      const toPl = page.locator('footer a[hreflang="pl"]').first()
      await expect(toPl).toHaveAttribute('href', from)
    })
  }

  test('the toggle actually navigates to the twin page', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/uslugi/strategia')

    await page.locator('footer a[hreflang="en"]').first().click()
    await expect(page).toHaveURL(/\/en\/services\/strategy$/)
  })

  // Every service and industry, asserted from the content modules so a new
  // entry that never reaches the slug map fails here as well as in the unit
  // test. Hrefs only — navigating ~38 pages would not pay for itself.
  test('no service or industry falls back to the home page', async ({
    page,
  }) => {
    test.setTimeout(180_000)
    await page.emulateMedia({ reducedMotion: 'reduce' })

    const stranded: string[] = []
    for (const service of SERVICES) {
      await gotoHydrated(page, `/uslugi/${service.slug}`)
      const href = await page
        .locator('footer a[hreflang="en"]')
        .first()
        .getAttribute('href')
      if (href !== `/en/services/${service.pairSlug}`) {
        stranded.push(`/uslugi/${service.slug} → ${href}`)
      }
    }
    for (const industry of INDUSTRIES) {
      await gotoHydrated(page, `/branze/${industry.slug}`)
      const href = await page
        .locator('footer a[hreflang="en"]')
        .first()
        .getAttribute('href')
      if (href !== `/en/industries/${industry.pairSlug}`) {
        stranded.push(`/branze/${industry.slug} → ${href}`)
      }
    }
    expect(stranded).toEqual([])
  })
})
