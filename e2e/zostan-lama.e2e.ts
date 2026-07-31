import { expect, test } from '@playwright/test'
import { careersForm, careersRoles } from '../lib/content/zostan-lama'
import { careersForm as enForm } from '../lib/content/zostan-lama.en'
import { colors } from '../lib/styles/colors'
import {
  collectPageErrors,
  expectNoSeriousA11yViolations,
  gotoHydrated,
  HYDRATED,
  hexToRgb,
} from './helpers'

/**
 * /zostan-lama regression suite (redesign-careers-page). Guards the failures
 * this change exists to remove, and the ones its own machinery can reintroduce:
 * - the invisible lede (post.module.css `.lead` applied without `.stage`)
 * - a role panel set that shows every role at once, or none
 * - a required CV or consent that does not actually gate the submit
 * - an oversized attachment reaching the runtime instead of a readable message
 * - content sections appearing after the form (the page ends on submit)
 */

const DARK_CHROME = hexToRgb(colors['ink-deep'])
const CV_MAX = 5 * 1024 * 1024

const pdf = (bytes: number) => ({
  name: 'cv.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.alloc(bytes, 0x41),
})

test.describe('Careers page', () => {
  test('legacy WordPress URL still resolves to the page', async ({ page }) => {
    const response = await page.request.get('/zostan-lama/')
    expect(response.status()).toBe(200)
    expect(new URL(response.url()).pathname).toBe('/zostan-lama')
  })

  test('renders every band in order, dark chrome, no errors, passes a11y', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectPageErrors(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/zostan-lama')

    // The decorative marquee is aria-hidden, so this sr-only h1 is what names
    // the page — and there must be exactly one.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Zostań lamą' })
    ).toBeAttached()
    expect(await page.locator('h1').count()).toBe(1)

    // Band order: roles → benefits → form, with nothing after the form.
    const order = await page.evaluate(() => {
      const find = (fragment: string) =>
        document.querySelector(`[class*="${fragment}"]`)
      const roles = find('__roles')
      const benefits = find('__benefits')
      const form = find('__formBand')
      if (!(roles && benefits && form)) return null
      return {
        rolesBeforeBenefits: Boolean(
          roles.compareDocumentPosition(benefits) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ),
        benefitsBeforeForm: Boolean(
          benefits.compareDocumentPosition(form) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ),
        // Whatever follows the form band must be site chrome, not a section.
        nextIsFooter: form.nextElementSibling === null,
      }
    })
    expect(order).toEqual({
      rolesBeforeBenefits: true,
      benefitsBeforeForm: true,
      nextIsFooter: true,
    })

    await expect(page.locator('html')).toHaveAttribute(
      'data-chrome',
      'zostan-lama',
      HYDRATED
    )
    await expect(page.locator('header').first()).toHaveCSS(
      'background-color',
      DARK_CHROME,
      HYDRATED
    )

    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])

    // The marquee rows are aria-hidden brand treatment (orange fill / outline
    // stroke), excluded for the same reason as /kontakt's.
    await expectNoSeriousA11yViolations(page, [
      '[class*="zostan-lama-module"] [class*="fill"]',
      '[class*="zostan-lama-module"] [class*="outline"]',
    ])
  })

  test('the hero lede is visible — the defect this redesign removes', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/zostan-lama')

    // The old page painted this cream on cream. Assert it is both rendered and
    // not the same colour as the ground it sits on.
    const lede = page.locator('[class*="ledeText"]')
    await expect(lede).toBeVisible()
    const { color, background } = await lede.evaluate((el) => ({
      color: getComputedStyle(el).color,
      background: getComputedStyle(document.body).backgroundColor,
    }))
    expect(color).not.toBe(background)
  })

  test('role panels show one role at a time and are keyboard operable', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/zostan-lama')

    const tabs = page.getByRole('tab')
    await expect(tabs).toHaveCount(careersRoles.length)
    await expect(page.getByRole('tabpanel')).toHaveCount(1)

    const first = careersRoles[0]
    const second = careersRoles[1]
    if (!(first && second)) throw new Error('expected two open roles')

    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')

    // Arrow keys move selection and focus within the tablist.
    await tabs.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'false')
    await expect(tabs.nth(1)).toBeFocused()

    // Still exactly one panel exposed, and it is the second role's.
    await expect(page.getByRole('tabpanel')).toHaveCount(1)
    const panelId = await tabs.nth(1).getAttribute('aria-controls')
    await expect(page.getByRole('tabpanel')).toHaveAttribute('id', `${panelId}`)
  })

  test('required consent and CV gate the submit, in Polish', async ({
    page,
  }) => {
    const { pageErrors } = collectPageErrors(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/zostan-lama')

    let posted = false
    page.on('request', (request) => {
      if (request.method() === 'POST') posted = true
    })

    // Invalid email → the localized message, not the kit's "Invalid email".
    await page.locator('input[name="email"]').fill('niepoprawny-adres')
    await expect(page.getByText(careersForm.errors.email)).toBeVisible(HYDRATED)
    await expect(page.getByText(/^Invalid /)).toHaveCount(0)

    await page.locator('input[name="name"]').fill('Test E2E')
    await page.locator('input[name="email"]').fill('e2e@example.com')
    await page.locator('textarea[name="message"]').fill('Kilka zdań o sobie.')

    // No CV, no consent → blocked, attributed to the CV control.
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(careersForm.errors.cvRequired)).toBeVisible()
    expect(posted).toBe(false)

    // Oversized CV → readable size error, still nothing sent. This must never
    // become a runtime 413: the body is rejected before the action is entered.
    await page.locator('input[type="file"]').setInputFiles(pdf(CV_MAX + 1024))
    await expect(page.getByText(careersForm.errors.cvSize)).toBeVisible()
    await page.locator('button[type="submit"]').click()
    expect(posted).toBe(false)

    // In-cap CV, consent still missing → blocked on consent alone.
    await page.locator('input[type="file"]').setInputFiles(pdf(64 * 1024))
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(careersForm.errors.consent)).toBeVisible()
    expect(posted).toBe(false)

    // Marketing consent is optional and must not be required to submit.
    await expect(
      page.locator('input[name="marketingConsent"]')
    ).not.toBeChecked()
    await page.locator('input[name="consent"]').check()
    await page.locator('button[type="submit"]').click()

    // The outcome depends on the environment (SMTP and Turnstile may or may not
    // be configured), so assert a terminal FormState — success or a graceful,
    // localized failure — and no uncaught exception either way.
    const terminal = page
      .getByText(careersForm.messages.success)
      .or(page.getByText(careersForm.messages.error))
      .or(page.getByText(careersForm.messages.security))
      .or(page.getByText(careersForm.messages.rateLimit))
    await expect(terminal.first()).toBeVisible({ timeout: 20_000 })
    expect(posted).toBe(true)
    expect(pageErrors).toEqual([])
  })

  test('the English twin serves the same page with English copy', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectPageErrors(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/en/become-a-lama')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Become a Lama' })
    ).toBeAttached()
    await expect(page.getByRole('tab')).toHaveCount(careersRoles.length)

    // Validation comes back in the submitter's locale, not Polish.
    await page.locator('input[name="email"]').fill('not-an-address')
    await expect(page.getByText(enForm.errors.email)).toBeVisible(HYDRATED)
    await expect(page.getByText(careersForm.errors.email)).toHaveCount(0)

    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])
  })

  test('site chrome links the careers page in both locales', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')
    await expect(
      page.locator('footer a[href="/zostan-lama"]').first()
    ).toBeAttached()

    await gotoHydrated(page, '/en')
    await expect(
      page.locator('footer a[href="/en/become-a-lama"]').first()
    ).toBeAttached()
  })
})
