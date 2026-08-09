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

  test('every testimonial wordmark is centred under the rail', async ({
    page,
  }) => {
    // The six wordmarks share one grid cell sized to the widest of them, and a
    // replaced element with an intrinsic ratio resolves `justify-self: normal`
    // to `start` — so the narrow marks (STAG, Aquael at 76px against
    // Uniphar's 123px) left-aligned instead of sitting between the rules.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')

    // `div` matters: the wordmarks carry `captionLogo`, so a bare
    // [class*="caption"] matches them too and the locator is not strict.
    const caption = page.locator(
      'div[class*="testimonial-module"][class*="caption"]'
    )
    const logos = caption.locator('img[class*="captionLogo"]')
    await expect(logos).toHaveCount(6)

    // The marks are lazy and far below the fold. Unloaded they all fall back
    // to the same 180×56 placeholder ratio, so every width would match and the
    // assertion below would pass without ever proving anything — load them
    // first and require the real, differing intrinsic widths.
    await page.evaluate(async () => {
      const imgs = Array.from(
        document.querySelectorAll<HTMLImageElement>('img[class*="captionLogo"]')
      )
      for (const img of imgs) img.loading = 'eager'
      await Promise.all(
        imgs.map(
          (img) =>
            img.complete ||
            new Promise((resolve) => {
              img.onload = resolve
              img.onerror = resolve
            })
        )
      )
    })

    const boxes = await logos.evaluateAll((nodes) =>
      nodes.map((node) => {
        const r = node.getBoundingClientRect()
        return {
          alt: (node as HTMLImageElement).alt,
          centre: r.x + r.width / 2,
          width: r.width,
        }
      })
    )
    expect(
      new Set(boxes.map((b) => Math.round(b.width))).size,
      'wordmarks loaded at their own intrinsic widths'
    ).toBeGreaterThan(1)

    const capBox = await caption.boundingBox()
    const capCentre = (capBox?.x ?? 0) + (capBox?.width ?? 0) / 2
    for (const { alt, centre } of boxes) {
      expect(centre, `${alt} wordmark centred`).toBeCloseTo(capCentre, 0)
    }
  })

  test('picking a cropped rail chip never scrolls the rail off-centre', async ({
    page,
  }) => {
    // The slot model parks rows outside the rail's window on purpose, so the
    // rail overflows. Under `overflow: hidden` that is still a scroll
    // container: clicking a chip cropped at the edge focused it, the UA
    // scrolled it into view, and the whole strip stayed half a chip
    // off-centre for good — taking the wordmark caption's alignment with it.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')

    const rail = page.locator('[role="tablist"]')
    const tabs = rail.locator('[role="tab"]')

    // Jump two at a time, never one. A neighbour (slot ±1) sits fully inside
    // the window, so clicking it scrolls nothing and the bug stays hidden —
    // only a chip parked at the cropped ±2 slot triggers the scroll-into-view.
    for (const i of [2, 4, 0, 2, 4, 0]) {
      await expect(tabs.nth(i)).toHaveAttribute('data-slot', /^-?2$/)
      await tabs.nth(i).click()
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true')

      const scroll = await rail.evaluate((node) => ({
        left: node.scrollLeft,
        top: node.scrollTop,
      }))
      expect(scroll, `rail unscrolled after picking chip ${i}`).toEqual({
        left: 0,
        top: 0,
      })

      const railBox = await rail.boundingBox()
      const activeBox = await tabs.nth(i).boundingBox()
      expect(
        (activeBox?.x ?? 0) + (activeBox?.width ?? 0) / 2,
        `chip ${i} centred in the rail`
      ).toBeCloseTo((railBox?.x ?? 0) + (railBox?.width ?? 0) / 2, 0)
    }
  })
})
