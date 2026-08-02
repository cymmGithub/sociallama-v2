import { expect, type Page, test } from '@playwright/test'
import { STATIC_PAGES } from '../lib/static-routes'

import { EMPTY_CMS_OK, gotoHydrated } from './helpers'

/**
 * Polish blog tree coverage (add-e2e-monitoring). Mirrors en-blog.e2e.ts —
 * URLs are sampled from the rendered hub, because that is what a visitor can
 * actually reach and because the Payload query helpers are `'use cache'`
 * functions that throw outside a request scope.
 *
 * Two deliberate differences from the English suite:
 * - Post URLs are ROOT-LEVEL (`/{slug}`, WordPress parity), so hub post links
 *   cannot be recognized by prefix. They are the single-segment hrefs in
 *   <main> that are not app routes — RESERVED_SLUGS guarantees a post slug
 *   can never collide with one, so the exclusion list is exactly
 *   the STATIC_PAGES PL paths plus the locale root.
 * - There is NO legitimate empty state — with one environment exception. The
 *   Polish blog always has published posts, so a hub rendering zero post
 *   links is a failure everywhere content exists: the seeded local dev DB
 *   and the live target. CI's ephemeral Postgres is migrated but unseeded,
 *   so there (and only there) the content-dependent cases skip.
 */

const APP_PATHS = new Set([
  ...STATIC_PAGES.map((page) => page.pl),
  '/en',
  '/uslugi',
  '/branze',
])

async function hubLinks(page: Page) {
  const hrefs = await page
    .locator('main a[href^="/"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? '')
    )
  const unique = [...new Set(hrefs.filter(Boolean))]
  return {
    posts: unique.filter(
      (href) => /^\/[^/]+$/.test(href) && !APP_PATHS.has(href)
    ),
    categories: unique.filter((href) => href.startsWith('/category/')),
    pages: unique.filter((href) => href.startsWith('/blog/page/')),
  }
}

test.describe('Polish blog tree', { tag: '@monitor' }, () => {
  test('the hub resolves, is Polish, and lists posts (empty hub = failure)', async ({
    page,
  }) => {
    const response = await page.goto('/blog')
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl')

    const { posts } = await hubLinks(page)
    test.skip(
      posts.length === 0 && EMPTY_CMS_OK,
      'CI ephemeral DB is unseeded — no PL posts to assert on'
    )
    // Unlike /en/blog there is no zero-translation fixture here: the Polish
    // blog is the primary tree and always has content.
    expect(posts, 'the PL hub must link at least one post').not.toEqual([])
  })

  test('a hub post resolves at its root-level URL and renders an article', async ({
    page,
  }) => {
    await gotoHydrated(page, '/blog')
    const { posts } = await hubLinks(page)
    test.skip(
      posts.length === 0 && EMPTY_CMS_OK,
      'CI ephemeral DB is unseeded — no PL posts to assert on'
    )
    expect(posts).not.toEqual([])

    const href = posts[0] as string
    // WordPress-parity guarantee: no /blog/ prefix on post URLs.
    expect(href).toMatch(/^\/[^/]+$/)

    const response = await page.goto(href)
    expect(response?.status(), `${href} should resolve`).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
    await expect(
      page.locator('nav[aria-label="Ścieżka nawigacji"]')
    ).toBeVisible()
    await expect(page.locator('article h1').first()).not.toBeEmpty()
  })

  test('every category the hub links to resolves', async ({ page }) => {
    test.setTimeout(120_000)
    await gotoHydrated(page, '/blog')
    const { posts, categories } = await hubLinks(page)
    test.skip(
      posts.length === 0 && EMPTY_CMS_OK,
      'CI ephemeral DB is unseeded — no categories to assert on'
    )
    // Four fixed categories, seeded with the WordPress import — a hub with
    // posts but no category rows is incoherent.
    expect(categories).not.toEqual([])

    const broken: string[] = []
    for (const href of categories.slice(0, 4)) {
      const response = await page.goto(href)
      if (response?.status() !== 200) {
        broken.push(`${href} → ${response?.status()}`)
      }
    }
    expect(broken).toEqual([])
  })

  test('pagination is honest: offered pages resolve, page 999 is not found', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await gotoHydrated(page, '/blog')
    const { pages } = await hubLinks(page)

    for (const href of pages) {
      const response = await page.goto(href)
      expect(response?.status(), `${href} should resolve`).toBe(200)
    }

    await page.goto('/blog/page/999')
    await expect(page.locator('body')).toContainText(
      /nie znaleziono|not found/i
    )
  })
})
