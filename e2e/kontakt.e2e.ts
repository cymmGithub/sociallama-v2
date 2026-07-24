import { expect, test } from '@playwright/test'
import { contactForm, contactMetrics } from '../lib/content/contact'
import { clients } from '../lib/content/home'
import { colors, themes } from '../lib/styles/colors'
import {
  collectPageErrors,
  expectNoSeriousA11yViolations,
  gotoHydrated,
  HYDRATED,
  hexToRgb,
} from './helpers'

/**
 * /kontakt regression suite (add-contact-page). Guards the failures found
 * during implementation:
 * - the legacy 301 shadowing the real route (next.config redirects)
 * - contact CTAs still pointing at the retired /#kontakt anchor
 * - the form kit's callback-ref infinite loop (maximum update depth)
 * - dark chrome leaking onto other pages via Next 16's Activity cache
 * - English fallback validation copy on a Polish form
 */

// Kontakt page / footer dark ground — the shared --color-ink-deep swatch.
const DARK_CHROME = hexToRgb(colors['ink-deep'])
const PLUM_CHROME = hexToRgb(themes.plum.primary)

test.describe('Kontakt page', () => {
  test('legacy /kontakt URL serves the page directly (no 301)', async ({
    page,
  }) => {
    const response = await page.request.get('/kontakt', { maxRedirects: 0 })
    expect(response.status()).toBe(200)
  })

  test('all homepage contact CTAs point at /kontakt, none at /#kontakt', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')

    // The retired footer-anchor target must not linger anywhere.
    await expect(page.locator('a[href="/#kontakt"]')).toHaveCount(0)

    // Header CTA + join-CTA button + both footer KONTAKT links.
    expect(
      await page.locator('a[href="/kontakt"]').count()
    ).toBeGreaterThanOrEqual(4)

    // The header CTA actually navigates there.
    await page.locator('header a[href="/kontakt"]').click()
    await expect(page).toHaveURL('/kontakt', HYDRATED)
    await expect(page).toHaveTitle(/Kontakt/)
  })

  test('navigating to /kontakt from a scrolled homepage lands at the top', async ({
    page,
  }) => {
    // Regression: the custom <Link> uses scroll={false} and Lenis carries its
    // scroll position across route changes, so /kontakt opened at the previous
    // page's offset (e.g. mid-metrics) instead of the top. No reduced-motion
    // emulation — the bug is motion-independent and it disables wheel scroll.
    await gotoHydrated(page, '/')

    // Scroll the homepage into its lower sections by driving Lenis with wheel
    // events (root mode listens on window). Keep the offset within /kontakt's
    // scrollable range so a preserved position would be observable, not clamped.
    await page.evaluate(async () => {
      let guard = 0
      while (window.scrollY < 900 && guard++ < 300) {
        window.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: 250,
            bubbles: true,
            cancelable: true,
          })
        )
        await new Promise((r) => setTimeout(r, 12))
      }
    })
    await expect
      .poll(() => page.evaluate(() => window.scrollY), HYDRATED)
      .toBeGreaterThan(500)

    // Trigger client-side nav to /kontakt. At this mid-scroll offset every
    // /kontakt link is unclickable — the sticky header hides on scroll-down and
    // the footer's links sit behind #main-content (footer-reveal) until the very
    // bottom — so an actionable click times out. dispatchEvent fires the Link's
    // client navigation directly, bypassing occlusion; the scroll-reset behavior
    // this test guards is what matters, not the link's hit-testability.
    await page.locator('a[href="/kontakt"]').last().dispatchEvent('click')
    await expect(page).toHaveURL('/kontakt', HYDRATED)

    // The new route must open at the top, not at the carried-over offset.
    await expect
      .poll(() => page.evaluate(() => window.scrollY), HYDRATED)
      .toBeLessThan(10)
  })

  test('renders all sections without errors, dark chrome, passes a11y', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectPageErrors(page)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/kontakt')

    // Structure: sr-only h1, marquee copy, numbered form, pills, belt, band.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Kontakt' })
    ).toBeAttached()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
    await expect(page.locator('button[aria-pressed]')).toHaveCount(5)
    // Brand belt: plain scrolling logos, no heading. The aria-hidden marquee
    // clones drop out of the a11y tree, so this matches the one live logo.
    const firstClient = clients[0]
    if (!firstClient) throw new Error('clients fixture is empty')
    await expect(page.getByRole('img', { name: firstClient.name })).toBeVisible(
      HYDRATED
    )
    for (const metric of contactMetrics) {
      await expect(page.getByText(metric.value, { exact: true })).toBeVisible()
    }

    // Dark chrome is active on this page (header paints the page ground).
    await expect(page.locator('html')).toHaveAttribute(
      'data-chrome',
      'kontakt',
      HYDRATED
    )
    await expect(page.locator('header').first()).toHaveCSS(
      'background-color',
      DARK_CHROME,
      HYDRATED
    )

    // Guards the form-kit ref-loop regression (maximum update depth) and any
    // other client crash on mount.
    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])

    // A11y (critical + serious). Exclusions mirror home.e2e.ts's documented
    // brand exceptions: the decorative marquee rows are aria-hidden brand
    // treatment (orange fill / outline stroke), not informational text.
    await expectNoSeriousA11yViolations(page, [
      '[class*="kontakt-module"] [class*="fill"]',
      '[class*="kontakt-module"] [class*="outline"]',
    ])
  })

  test('dark chrome does not leak onto other pages (Activity cache)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/kontakt')
    await expect(page.locator('html')).toHaveAttribute(
      'data-chrome',
      'kontakt',
      HYDRATED
    )

    // Client-nav home. Next 16 keeps the kontakt DOM mounted (Activity
    // back/forward cache), which is exactly why a :has(.page) CSS approach
    // regressed: the attribute must be gone and the header plum again.
    await page.locator('header a[href="/"]').click()
    await expect(page).toHaveURL('/', HYDRATED)
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-chrome',
      HYDRATED
    )
    // toHaveCSS retries — covers the 900ms background transition.
    await expect(page.locator('header').first()).toHaveCSS(
      'background-color',
      PLUM_CHROME,
      HYDRATED
    )
  })

  test('hero headline survives kontakt → home navigation', async ({ page }) => {
    // Guards client-nav reactivation (Next 16 Activity cache): the hero
    // headline must render visibly after navigating back home, not sit hidden.
    // The gsap.from intro tween this used to guard (kill() vs revert() left the
    // lines stuck at yPercent 120) was removed with the scroll-unlink rework —
    // the headline now renders statically, so this asserts the live behaviour
    // instead of the retired [data-line] transform-settle.
    await gotoHydrated(page, '/kontakt')
    await page.locator('header a[href="/"]').click()
    await expect(page).toHaveURL('/', HYDRATED)

    const headline = page.locator('h1', { hasText: 'WORKS' })
    await expect(headline).toBeVisible()
  })

  test('testimonial rail survives browser back from kontakt', async ({
    page,
  }) => {
    // Browser-back restores the Activity-cached homepage, and the navigation
    // re-injects shared CSS-module sheets (dev). The Image component's reset
    // must never out-cascade the rail's sizing (:where() guard in
    // image.module.css) — the regression blew avatars up to intrinsic size
    // and collapsed the SVG logos to 0.
    await gotoHydrated(page, '/')
    await page.locator('header a[href="/kontakt"]').click()
    await expect(page).toHaveURL('/kontakt', HYDRATED)
    await page.goBack()
    await expect(page).toHaveURL('/', HYDRATED)

    const avatar = page
      .locator('[class*="testimonial-module"] [class*="__avatar"]')
      .first()
    await expect(avatar).toBeAttached()
    await expect
      .poll(async () => (await avatar.boundingBox())?.width ?? 0, HYDRATED)
      .toBeLessThanOrEqual(70)
    expect((await avatar.boundingBox())?.width ?? 0).toBeGreaterThan(20)

    const logo = page
      .locator('[class*="testimonial-module"] [class*="__logo"]')
      .first()
    expect((await logo.boundingBox())?.width ?? 0).toBeGreaterThan(0)
  })

  test('validates in Polish and reaches a terminal submit state', async ({
    page,
  }) => {
    const { pageErrors } = collectPageErrors(page)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/kontakt')

    // Invalid email → the localized client-side message, not "Invalid email".
    await page.locator('input[name="email"]').fill('niepoprawny-adres')
    await expect(page.getByText(contactForm.errors.email)).toBeVisible(HYDRATED)
    await expect(page.getByText(/^Invalid /)).toHaveCount(0)

    // Valid fill-in → submit. The outcome depends on the environment (SMTP
    // and Turnstile may or may not be configured), so assert a terminal
    // FormState is reached — success or a graceful, localized error — and no
    // uncaught exception either way.
    await page.locator('input[name="name"]').fill('Test E2E')
    await page.locator('input[name="email"]').fill('e2e@example.com')
    await page
      .locator('textarea[name="message"]')
      .fill('Wiadomość testowa z suite e2e.')
    await page.locator('button[type="submit"]').click()

    const terminal = page
      .getByText(contactForm.messages.success)
      .or(page.getByText(contactForm.messages.error))
      .or(page.getByText(contactForm.messages.security))
      .or(page.getByText(contactForm.messages.rateLimit))
    await expect(terminal.first()).toBeVisible({ timeout: 15_000 })
    expect(pageErrors).toEqual([])
  })
})
