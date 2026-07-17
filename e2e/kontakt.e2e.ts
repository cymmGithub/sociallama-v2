import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { contactForm, contactMetrics } from '../lib/content/contact'
import { clientsHeading } from '../lib/content/home'

/**
 * /kontakt regression suite (add-contact-page). Guards the failures found
 * during implementation:
 * - the legacy 301 shadowing the real route (next.config redirects)
 * - contact CTAs still pointing at the retired /#kontakt anchor
 * - the form kit's callback-ref infinite loop (maximum update depth)
 * - dark chrome leaking onto other pages via Next 16's Activity cache
 * - English fallback validation copy on a Polish form
 */

const DARK_CHROME = 'rgb(22, 18, 22)' // #161216 — kontakt page ground
const PLUM_CHROME = 'rgb(133, 50, 83)' // #853253 — homepage plum theme

/** Generous timeout for assertions that depend on client-side effects: under
 * full-suite parallelism the shared dev server starves hydration well past
 * Playwright's 5s default. */
const HYDRATED = { timeout: 20_000 } as const

/** Wait until the page has hydrated. Lenis (mounted by every Wrapper page)
 * stamps `.lenis` on <html> from a client effect, so its presence proves
 * React effects are running — required before asserting on data-chrome,
 * data-theme, client-side validation, or router navigation. */
async function waitForHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => document.documentElement.className.includes('lenis'),
    undefined,
    { timeout: 30_000 }
  )
}

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
    await page.goto('/')
    await waitForHydration(page)

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

  test('renders all sections without errors, dark chrome, passes a11y', async ({
    page,
  }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/kontakt')
    await waitForHydration(page)

    // Structure: sr-only h1, marquee copy, numbered form, pills, belt, band.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Kontakt' })
    ).toBeAttached()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
    await expect(page.locator('button[aria-pressed]')).toHaveCount(5)
    await expect(
      page.getByRole('heading', { name: clientsHeading })
    ).toBeVisible()
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
    const results = await new AxeBuilder({ page })
      .exclude('[class*="kontakt-module"] [class*="fill"]')
      .exclude('[class*="kontakt-module"] [class*="outline"]')
      .analyze()
    const seriousViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(seriousViolations).toEqual([])
  })

  test('dark chrome does not leak onto other pages (Activity cache)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/kontakt')
    await waitForHydration(page)
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
    // NO reduced-motion emulation: the regression lives in the gsap.from
    // intro tween, which reduced motion skips entirely. Cleanup with kill()
    // instead of revert() left the headline lines stuck at their pre-reveal
    // offset (yPercent 120) whenever the effect re-ran — StrictMode double
    // effects and Next 16 Activity reactivation both do that.
    await page.goto('/kontakt')
    await waitForHydration(page)
    await page.locator('header a[href="/"]').click()
    await expect(page).toHaveURL('/', HYDRATED)

    // Every headline line must settle at rest (intro finishes ~1.8s in),
    // not sit translated below its clip mask.
    await page.waitForFunction(
      () => {
        const lines = document.querySelectorAll('[data-line]')
        return (
          lines.length > 0 &&
          [...lines].every((el) => {
            const t = getComputedStyle(el).transform
            if (t === 'none') return true
            return Math.abs(new DOMMatrixReadOnly(t).m42) < 1
          })
        )
      },
      undefined,
      { timeout: 30_000 }
    )
  })

  test('testimonial rail survives browser back from kontakt', async ({
    page,
  }) => {
    // Browser-back restores the Activity-cached homepage, and the navigation
    // re-injects shared CSS-module sheets (dev). The Image component's reset
    // must never out-cascade the rail's sizing (:where() guard in
    // image.module.css) — the regression blew avatars up to intrinsic size
    // and collapsed the SVG logos to 0.
    await page.goto('/')
    await waitForHydration(page)
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
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/kontakt')
    await waitForHydration(page)

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
