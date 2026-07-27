import { expect, test } from '@playwright/test'
import { CLIENT_ROSTER } from '../lib/content/clients'
import { gotoHydrated, HYDRATED } from './helpers'

const withCaseStudy = CLIENT_ROSTER.filter((brand) => brand.caseStudySlug)

test.describe('Client belt', () => {
  // The roster's slugs are the one part of the belt that fails silently: a wrong
  // `caseStudySlug` type-checks and 404s at runtime. Only the running app knows
  // which studies are published, so the check lives here rather than in a unit
  // test.
  test('every case-study CTA resolves to a published study', async ({
    request,
  }) => {
    for (const brand of withCaseStudy) {
      for (const base of ['/case-studies', '/en/case-studies']) {
        const url = `${base}/${brand.caseStudySlug}`
        const response = await request.get(url)
        expect(response.status(), `${brand.key} -> ${url}`).toBe(200)
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
