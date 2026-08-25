import { expect, type Page, test } from '@playwright/test'
import { CONSENT_COOKIE_NAME } from '../lib/consent/cookie'
import {
  consentBanner as bannerPl,
  consentCategories as categoriesPl,
  consentSettings as settingsPl,
  consentTrigger as triggerPl,
} from '../lib/content/consent'
import {
  consentBanner as bannerEn,
  consentCategories as categoriesEn,
  consentSettings as settingsEn,
  consentTrigger as triggerEn,
} from '../lib/content/consent.en'
import { gotoHydrated } from './helpers'

/**
 * Cookie consent — the behaviour the ePrivacy obligation actually turns on.
 *
 * ── ON THE GOOGLE TAG ─────────────────────────────────────────────────────
 * `NEXT_PUBLIC_GOOGLE_ANALYTICS` is set only on Vercel Production, by design,
 * so a dev server loads no Google tag and NO `_ga` cookie can ever appear here.
 * That makes the refusal assertions strong (nothing to write) and the
 * acceptance ones weak (nothing to observe) — asserting `_ga` appears on accept
 * would need a real measurement id and network egress.
 *
 * So the acceptance path is asserted where the guarantee actually lives:
 * `dataLayer` command order. That is what decides whether Google measures a
 * visit as consented, and it is fully observable without a property. Where a
 * measurement id IS configured, the cookie-set assertions tighten automatically
 * — see `analytics cookie surface` below.
 * ──────────────────────────────────────────────────────────────────────────
 */

type Locale = 'pl' | 'en'

const LOCALES = [
  {
    locale: 'pl' as Locale,
    path: '/',
    banner: bannerPl,
    settings: settingsPl,
    trigger: triggerPl,
    categories: categoriesPl,
  },
  {
    locale: 'en' as Locale,
    path: '/en',
    banner: bannerEn,
    settings: settingsEn,
    trigger: triggerEn,
    categories: categoriesEn,
  },
]

/** Every cookie name the site declares, `_ga_*` wildcards expanded to a regex. */
const DECLARED = categoriesPl.flatMap((category) =>
  category.vendors.flatMap((vendor) =>
    vendor.cookies.map(
      (cookie) =>
        new RegExp(
          `^${cookie.name.replace(/[.]/g, '\\.').replace(/\*/g, '.*')}$`
        )
    )
  )
)

async function consentCookie(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.find((cookie) => cookie.name === CONSENT_COOKIE_NAME)
}

/** The stored decision, decoded. `undefined` when nothing has been chosen. */
async function storedDecision(page: Page) {
  const cookie = await consentCookie(page)
  if (!cookie) return undefined
  return JSON.parse(decodeURIComponent(cookie.value)) as {
    v: number
    analytics: boolean
    ts: number
  }
}

/** `dataLayer` as an array of plain arrays — `arguments` objects don't cross. */
async function dataLayer(page: Page): Promise<unknown[][]> {
  return page.evaluate(() =>
    (window.dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>)
    )
  )
}

async function gaCookies(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.filter((cookie) => cookie.name.startsWith('_ga'))
}

test.describe('Cookie consent', () => {
  for (const {
    locale,
    path,
    banner,
    settings,
    trigger,
    categories,
  } of LOCALES) {
    test.describe(`${locale.toUpperCase()} locale`, () => {
      test('a first-time visitor sees the banner and is not tracked', {
        tag: '@monitor',
      }, async ({ page }) => {
        test.setTimeout(120_000)
        await gotoHydrated(page, path)

        const region = page.getByRole('region', { name: banner.regionLabel })
        await expect(region).toBeVisible()
        // Copy renders in this locale, not the other one.
        await expect(region).toContainText(banner.headingBefore)
        // The heading's noun is carried by an icon on screen; the word itself
        // is rendered visually-hidden so the sentence is whole when spoken.
        await expect(region).toContainText(banner.headingIcon)

        expect(await gaCookies(page)).toEqual([])
        expect(await consentCookie(page)).toBeUndefined()
      })

      test('refusal and acceptance are equally reachable and equally sized', {
        tag: '@monitor',
      }, async ({ page }) => {
        test.setTimeout(120_000)
        await gotoHydrated(page, path)

        const region = page.getByRole('region', { name: banner.regionLabel })
        const accept = region.getByRole('button', { name: banner.acceptAll })
        const reject = region.getByRole('button', { name: banner.rejectAll })

        // Both directly present — refusal is not behind the settings panel.
        await expect(accept).toBeVisible()
        await expect(reject).toBeVisible()

        // "Same size and prominence, differing only in fill." Assert the box,
        // not the intent: a padding tweak that quietly shrinks refusal is
        // exactly the regression this catches.
        const acceptBox = await accept.boundingBox()
        const rejectBox = await reject.boundingBox()
        expect(acceptBox).not.toBeNull()
        expect(rejectBox).not.toBeNull()
        expect(rejectBox?.width).toBeCloseTo(acceptBox?.width ?? 0, 0)
        expect(rejectBox?.height).toBeCloseTo(acceptBox?.height ?? 0, 0)

        // Everything that carries visual weight is compared between the two
        // rather than pinned to a literal — a restyle is allowed to change the
        // type scale, but never to change it for only one of them.
        for (const property of [
          'font-size',
          'font-weight',
          'letter-spacing',
          'text-transform',
          'padding-top',
          'padding-bottom',
          'padding-left',
          'padding-right',
        ]) {
          const [acceptValue, rejectValue] = await Promise.all([
            accept.evaluate(
              (node, p) => getComputedStyle(node).getPropertyValue(p),
              property
            ),
            reject.evaluate(
              (node, p) => getComputedStyle(node).getPropertyValue(p),
              property
            ),
          ])
          expect(
            rejectValue,
            `${property} differs between accept and reject`
          ).toBe(acceptValue)
        }
      })

      test('there is no ambiguous exit', { tag: '@monitor' }, async ({
        page,
      }) => {
        test.setTimeout(120_000)
        await gotoHydrated(page, path)

        const region = page.getByRole('region', { name: banner.regionLabel })
        // Three controls exactly: accept, reject, settings. No close/X.
        await expect(region.getByRole('button')).toHaveCount(3)

        // Scrolling is not consent.
        await page.mouse.wheel(0, 1200)
        await expect(region).toBeVisible()
        expect(await consentCookie(page)).toBeUndefined()
      })

      test('refusal is recorded and honoured across a reload', {
        tag: '@monitor',
      }, async ({ page }) => {
        test.setTimeout(120_000)
        await gotoHydrated(page, path)

        const region = page.getByRole('region', { name: banner.regionLabel })
        await region.getByRole('button', { name: banner.rejectAll }).click()
        await expect(region).toBeHidden()

        expect(await storedDecision(page)).toMatchObject({ analytics: false })
        expect(await gaCookies(page)).toEqual([])

        await gotoHydrated(page, path)
        await expect(
          page.getByRole('region', { name: banner.regionLabel })
        ).toBeHidden()
        expect(await gaCookies(page)).toEqual([])

        // The head script re-applied the refusal from the cookie, synchronously.
        const layer = await dataLayer(page)
        const updates = layer.filter(
          (entry) => entry[0] === 'consent' && entry[1] === 'update'
        )
        expect(updates).toHaveLength(1)
        expect(updates[0]?.[2]).toMatchObject({ analytics_storage: 'denied' })
      })

      test('acceptance takes effect without a reload', async ({ page }) => {
        test.setTimeout(120_000)
        await gotoHydrated(page, path)

        const region = page.getByRole('region', { name: banner.regionLabel })
        await region.getByRole('button', { name: banner.acceptAll }).click()
        await expect(region).toBeHidden()

        expect(await storedDecision(page)).toMatchObject({ analytics: true })

        // No navigation between the click and this assertion: the consent
        // update has to reach `dataLayer` on the live page.
        const layer = await dataLayer(page)
        const granted = layer.filter(
          (entry) =>
            entry[0] === 'consent' &&
            entry[1] === 'update' &&
            (entry[2] as Record<string, string>)?.analytics_storage ===
              'granted'
        )
        expect(granted.length).toBeGreaterThan(0)

        await gotoHydrated(page, path)
        await expect(
          page.getByRole('region', { name: banner.regionLabel })
        ).toBeHidden()
      })

      test('the footer control reopens the panel showing stored choices', async ({
        page,
      }) => {
        test.setTimeout(120_000)
        await gotoHydrated(page, path)
        await page
          .getByRole('region', { name: banner.regionLabel })
          .getByRole('button', { name: banner.acceptAll })
          .click()

        // The withdrawal path: footer control, on a page with a decision made.
        await page.getByRole('button', { name: trigger }).click()

        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        await expect(dialog).toContainText(settings.title)

        const optional = categories.filter((category) => !category.required)
        for (const category of optional) {
          // Reflects what is stored — accepted above, so on.
          await expect(
            dialog.getByRole('switch', { name: category.name })
          ).toBeChecked()
        }

        // The necessary category offers no control at all — not a disabled one.
        const necessary = categories.filter((category) => category.required)
        for (const category of necessary) {
          await expect(
            dialog.getByRole('switch', { name: category.name })
          ).toHaveCount(0)
        }
        await expect(dialog.getByRole('switch')).toHaveCount(optional.length)

        // Withdrawal actually withdraws.
        for (const category of optional) {
          await dialog.getByRole('switch', { name: category.name }).click()
        }
        await dialog.getByRole('button', { name: settings.save }).click()
        await expect(dialog).toBeHidden()
        expect(await storedDecision(page)).toMatchObject({ analytics: false })
      })

      test('the banner does not displace page content', {
        tag: '@monitor',
      }, async ({ page }) => {
        test.setTimeout(120_000)

        // Measured against the same page in the same state, with and without
        // the bar — the only difference is the banner's presence, so any
        // movement is attributable to it and nothing else.
        await gotoHydrated(page, path)
        await page
          .getByRole('region', { name: banner.regionLabel })
          .getByRole('button', { name: banner.rejectAll })
          .click()
        await gotoHydrated(page, path)

        const footerTrigger = page.getByRole('button', { name: trigger })
        const settled = await footerTrigger.boundingBox()
        const settledHeight = await page.evaluate(
          () => document.documentElement.scrollHeight
        )

        await page.context().clearCookies()
        await gotoHydrated(page, path)
        await expect(
          page.getByRole('region', { name: banner.regionLabel })
        ).toBeVisible()

        expect(await footerTrigger.boundingBox()).toEqual(settled)
        expect(
          await page.evaluate(() => document.documentElement.scrollHeight)
        ).toBe(settledHeight)
      })
    })
  }

  test('consent defaults are the first thing queued, before any tag config', {
    tag: '@monitor',
  }, async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const layer = await dataLayer(page)
    const first = layer[0]
    expect(first?.[0]).toBe('consent')
    expect(first?.[1]).toBe('default')
    expect(first?.[2]).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    })

    // Whatever else is queued, nothing configures a tag before the defaults.
    const configIndex = layer.findIndex((entry) => entry[0] === 'config')
    if (configIndex !== -1) expect(configIndex).toBeGreaterThan(0)
  })

  test('the consent-default script precedes the Google tag in the document', {
    tag: '@monitor',
  }, async ({ page }) => {
    test.setTimeout(120_000)
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
    const html = (await response?.text()) ?? ''

    const consentAt = html.indexOf('id="sl-consent-init"')
    expect(consentAt).toBeGreaterThan(-1)
    expect(consentAt).toBeLessThan(html.indexOf('</head>'))

    // Each Google loader is checked independently: production may carry the
    // direct tag, the GTM container, or both.
    const tagAt = html.indexOf('googletagmanager.com/gtag/js')
    if (tagAt !== -1) {
      expect(consentAt).toBeLessThan(tagAt)
      expect(consentAt).toBeLessThan(html.indexOf('id="sl-ga-config"'))
    }
    const gtmAt = html.indexOf('googletagmanager.com/gtm.js')
    if (gtmAt !== -1) {
      expect(consentAt).toBeLessThan(gtmAt)
      expect(consentAt).toBeLessThan(html.indexOf('id="sl-gtm-init"'))
    }
    if (tagAt === -1 && gtmAt === -1) {
      // No id configured — which is itself the guarantee that a preview or
      // dev server cannot pollute the property.
      expect(html).not.toContain('gtag/js')
    }
  })

  /**
   * The policy-vs-reality check, split by which half can actually run here.
   * Both directions matter — a policy listing cookies the site does not set is
   * as wrong as one omitting cookies it does — but only the first is observable
   * without a measurement id, and burying it inside a skipped test would hide a
   * passing assertion behind a "skipped" label.
   */
  async function acceptAllAndVisitPolicy(page: Page) {
    await gotoHydrated(page, '/')
    await page
      .getByRole('region', { name: bannerPl.regionLabel })
      .getByRole('button', { name: bannerPl.acceptAll })
      .click()
    await gotoHydrated(page, '/polityka-prywatnosci')
    return page.context().cookies()
  }

  test('no cookie is set that the policy does not declare', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const observed = await acceptAllAndVisitPolicy(page)

    // Catches a vendor added to the site without a policy entry — the failure
    // that no amount of proofreading reliably finds.
    for (const cookie of observed) {
      expect(
        DECLARED.some((pattern) => pattern.test(cookie.name)),
        `cookie "${cookie.name}" is set but not declared in lib/content/consent.ts`
      ).toBe(true)
    }
  })

  test('every cookie the policy declares is actually set', async ({ page }) => {
    test.setTimeout(120_000)
    const observed = await acceptAllAndVisitPolicy(page)

    // The other direction — catches a policy entry for a vendor that was
    // removed. Only meaningful once the Google tag is genuinely loaded, which
    // by design happens only where a measurement id is configured.
    const content = await page.content()
    test.skip(
      !(
        content.includes('googletagmanager.com/gtag/js') ||
        content.includes('googletagmanager.com/gtm.js')
      ),
      'no Google tag configured — Google cookies cannot appear'
    )
    for (const pattern of DECLARED) {
      expect(
        observed.some((cookie) => pattern.test(cookie.name)),
        `no cookie matching ${pattern} was set, but the policy declares one`
      ).toBe(true)
    }
  })
})
