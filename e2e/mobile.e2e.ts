import { expect, test } from '@playwright/test'
import { consentBanner as bannerPl } from '../lib/content/consent'
import { consentBanner as bannerEn } from '../lib/content/consent.en'
import { collectPageErrors, gotoHydrated, HYDRATED } from './helpers'

/**
 * Mobile lane (add-e2e-monitoring, design D4). Runs ONLY under the
 * mobile-chromium project (@mobile grep); the desktop project excludes these.
 * Curated journeys for what only a mobile viewport can regress — NOT a re-run
 * of the desktop specs, whose viewport-dependent assertions fail on mobile
 * for non-bug reasons.
 */

const LOCALES = [
  { locale: 'PL', home: '/', banner: bannerPl },
  { locale: 'EN', home: '/en', banner: bannerEn },
]

test.describe('Mobile chrome', { tag: ['@mobile', '@monitor'] }, () => {
  for (const { locale, home, banner } of LOCALES) {
    test(`${locale}: the MENU overlay opens and navigates`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, home)

      const toggle = page.locator('button[aria-controls="site-menu"]')
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')

      const overlay = page.locator('#site-menu')
      await expect(overlay).toBeVisible()

      // First menu link that leads somewhere else — the overlay lists the
      // locale's whole nav, so any of them proves the journey.
      const target = overlay
        .locator(`a[href^="/"]:not([href="${home}"])`)
        .first()
      const href = await target.getAttribute('href')
      await target.click()
      await expect(page).toHaveURL(href as string, HYDRATED)
    })

    test(`${locale}: consent accept and reject are inside the viewport and tappable`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await gotoHydrated(page, home)

      const region = page.getByRole('region', { name: banner.regionLabel })
      await expect(region).toBeVisible()

      const viewport = page.viewportSize()
      if (!viewport) throw new Error('mobile project must define a viewport')
      for (const name of [banner.acceptAll, banner.rejectAll]) {
        const button = region.getByRole('button', { name })
        await expect(button).toBeVisible()
        const box = await button.boundingBox()
        expect(box, `${name} has no box`).not.toBeNull()
        if (!box) continue
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
      }
      // Tappable, not merely painted: reject leaves no tracking behind.
      await region.getByRole('button', { name: banner.rejectAll }).click()
      await expect(region).toBeHidden()
    })
  }

  test('the home page renders at mobile width with no errors', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectPageErrors(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')
    await expect(page).toHaveTitle(/.+/)
    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])
  })

  test('the 800px fold is a contract: compact header below, desktop header at it', async ({
    page,
  }) => {
    // Pins the single --mobile/--desktop custom-media breakpoint
    // (lib/styles/css/root.css) every layout hangs on. The observable is the
    // header logo mark: 118×30 in compact chrome, 212×53 in desktop chrome.
    // A postcss custom-media regression (queries dropped or the fold moved)
    // fails on one side of this boundary.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const logo = page.locator('header [class*="logoMark"]').first()

    await page.setViewportSize({ width: 799, height: 852 })
    await gotoHydrated(page, '/')
    await expect(logo).toBeVisible()
    let box = await logo.boundingBox()
    expect(box?.width, 'compact logo at 799px').toBeCloseTo(118, 0)

    await page.setViewportSize({ width: 800, height: 852 })
    box = await logo.boundingBox()
    expect(box?.width, 'desktop logo at 800px').toBeCloseTo(212, 0)
  })
})
