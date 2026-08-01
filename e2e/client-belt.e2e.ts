import { expect, test } from '@playwright/test'
import { CLIENT_ROSTER } from '../lib/content/clients'
import { EMPTY_CMS_OK, gotoHydrated, HYDRATED } from './helpers'

const withCaseStudy = CLIENT_ROSTER.filter((brand) => brand.caseStudySlug)

test.describe('Client belt', { tag: '@monitor' }, () => {
  // The roster's slugs are the one part of the belt that fails silently: a wrong
  // `caseStudySlug` type-checks and 404s at runtime. Only the running app knows
  // which studies are published, so the check lives here rather than in a unit
  // test.
  test('every case-study CTA resolves to a published study', async ({
    request,
  }) => {
    // The status alone proves nothing on this route: it has a loading.tsx,
    // so the shell streams with a committed HTTP 200 BEFORE notFound()
    // throws — a deleted study still answers 200 with the 404 UI in the
    // body. Only a real detail render produces an <article> element, so
    // that is the assertion. (This is also why the check must skip on CI's
    // unseeded DB: it used to fake-pass there on exactly those streamed
    // 200-with-404-body responses.)
    test.skip(EMPTY_CMS_OK, 'CI ephemeral DB is unseeded — no studies exist')
    for (const brand of withCaseStudy) {
      for (const base of ['/case-studies', '/en/case-studies']) {
        const url = `${base}/${brand.caseStudySlug}`
        const response = await request.get(url)
        expect(response.status(), `${brand.key} -> ${url}`).toBe(200)
        const html = await response.text()
        expect(
          html.includes('<article'),
          `${brand.key} -> ${url} answered 200 without an article body (deleted or unpublished study)`
        ).toBe(true)
      }
    }
  })

  test('the whole roster renders on the homepage', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/')
    const belt = page.locator('section[class*="client-logos-module"]').first()
    await expect(belt).toBeAttached()
    for (const brand of CLIENT_ROSTER) {
      // The marquee renders an aria-hidden clone for the seamless loop, so the
      // accessible name matches exactly one live logo.
      await expect(belt.getByRole('img', { name: brand.name })).toBeVisible(
        HYDRATED
      )
    }
  })

  test('the English belt links into the English routes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoHydrated(page, '/en')
    const belt = page.locator('section[class*="client-logos-module"]').first()
    await expect(belt.locator('a[href^="/case-studies/"]')).toHaveCount(0)
    await expect(
      belt.locator('a[href^="/en/case-studies/"]').first()
    ).toBeAttached()
  })
})
