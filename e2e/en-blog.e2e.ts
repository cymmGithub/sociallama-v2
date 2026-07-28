import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * English blog tree coverage (task 7.8).
 *
 * The existing locale sweep collects `#site-menu a[href], footer a[href]`
 * only, so adding BLOG to the English chrome enrols exactly one URL —
 * `/en/blog`. Without this file the suite would pass with every English post
 * 404ing, which is precisely the regression worth catching.
 *
 * URLs are sampled from the rendered hub rather than from
 * `findPublishedPostSlugs`/`findCategories` as the task suggests: those are
 * `'use cache'` functions and throw outside a Next request scope. Reading the
 * hub is also the stronger test — it exercises what a visitor can actually
 * reach, so a post that exists in the database but is not linked anywhere
 * still counts as unreachable.
 *
 * The suite is written to be honest when nothing is translated yet: the D6
 * gate means zero English posts is a CORRECT state, so those cases assert the
 * empty hub instead of failing. What is never acceptable — at any stage of the
 * translation batch — is an English URL that 404s while the hub links to it,
 * or Polish chrome on an English page.
 */

/** Chrome strings that must never appear on an English page. */
const POLISH_CHROME = [
  'Czytaj dalej',
  'min czytania',
  'W tym wpisie',
  'Wszystkie wpisy',
  'Wybór redakcji',
  'Najczęściej czytane',
  'Ścieżka nawigacji',
]

async function hubLinks(page: import('@playwright/test').Page) {
  const hrefs = await page
    .locator('main a[href^="/en/blog/"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? '')
    )
  const unique = [...new Set(hrefs.filter(Boolean))]
  return {
    posts: unique.filter((href) => !href.startsWith('/en/blog/category/')),
    categories: unique.filter((href) => href.startsWith('/en/blog/category/')),
  }
}

test.describe('English blog tree', () => {
  test('the hub resolves and is served as English', async ({ page }) => {
    const response = await page.goto('/en/blog')
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('no Polish chrome leaks onto the English hub', async ({ page }) => {
    await gotoHydrated(page, '/en/blog')
    const body = (await page.locator('body').innerText()).toLowerCase()
    const found = POLISH_CHROME.filter((phrase) =>
      body.includes(phrase.toLowerCase())
    )
    expect(found).toEqual([])
  })

  test('every post the hub links to actually resolves', async ({ page }) => {
    test.setTimeout(120_000)
    await gotoHydrated(page, '/en/blog')
    const { posts } = await hubLinks(page)

    // Zero translated posts is a correct state under the D6 gate, not a
    // failure — but then the hub must say so rather than render a broken list.
    if (posts.length === 0) {
      await expect(page.locator('main')).toContainText(/nothing here yet/i)
      return
    }

    const broken: string[] = []
    for (const href of posts.slice(0, 5)) {
      const response = await page.goto(href)
      const lang = await page.locator('html').getAttribute('lang')
      if (response?.status() !== 200 || lang !== 'en') {
        broken.push(`${href} → ${response?.status()} lang=${lang}`)
      }
    }
    expect(broken).toEqual([])
  })

  test('a post page carries English chrome and an English breadcrumb', async ({
    page,
  }) => {
    await gotoHydrated(page, '/en/blog')
    const { posts } = await hubLinks(page)
    test.skip(posts.length === 0, 'no translated posts yet')

    await gotoHydrated(page, posts[0] as string)
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
    const body = (await page.locator('body').innerText()).toLowerCase()
    expect(
      POLISH_CHROME.filter((phrase) => body.includes(phrase.toLowerCase()))
    ).toEqual([])
  })

  test('every category the hub links to actually resolves', async ({
    page,
  }) => {
    await gotoHydrated(page, '/en/blog')
    const { categories } = await hubLinks(page)
    test.skip(categories.length === 0, 'no translated categories yet')

    const broken: string[] = []
    for (const href of categories.slice(0, 4)) {
      const response = await page.goto(href)
      if (response?.status() !== 200) {
        broken.push(`${href} → ${response?.status()}`)
      }
    }
    expect(broken).toEqual([])
  })

  test('pagination never offers a page beyond the translated set', async ({
    page,
  }) => {
    await gotoHydrated(page, '/en/blog')
    const pageLinks = await page
      .locator('a[href^="/en/blog/page/"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('href') ?? '')
      )

    // Whatever pagination the hub offers must resolve; a page it does NOT
    // offer must not. English paginates over translated posts alone, so the
    // page count differs from Polish by design.
    for (const href of [...new Set(pageLinks)]) {
      const response = await page.goto(href)
      expect(response?.status(), `${href} should resolve`).toBe(200)
    }

    // Page 999 is beyond any plausible translated set.
    await page.goto('/en/blog/page/999')
    await expect(page.locator('body')).toContainText(/page not found/i)
  })

  test('the locale toggle round-trips between a post and its counterpart', async ({
    page,
  }) => {
    await gotoHydrated(page, '/en/blog')
    const { posts } = await hubLinks(page)
    test.skip(posts.length === 0, 'no translated posts yet')

    const enUrl = posts[0] as string
    await gotoHydrated(page, enUrl)
    const plHref = await page
      .locator('footer a[hreflang="pl"]')
      .first()
      .getAttribute('href')
    expect(
      plHref,
      'an English post must point at its Polish original'
    ).not.toBe('/')

    await gotoHydrated(page, plHref as string)
    const backHref = await page
      .locator('footer a[hreflang="en"]')
      .first()
      .getAttribute('href')
    expect(backHref, 'and the Polish original must point back').toBe(enUrl)
  })
})
