import { expect, type Page, test } from '@playwright/test'
import { EMPTY_CMS_OK, gotoHydrated } from './helpers'

/**
 * Reading enhancements on a post page: FAQ disclosures, jumping into a closed
 * one, and the quote toolbar (blog-reading-enhancements).
 *
 * All three are client behaviour over server-detected structure, which is
 * exactly what unit tests cannot reach: `lib/blog/faq.ts` is proven against
 * fixtures, but whether the `details` a jump targets actually opens depends on
 * Lenis, on the anchor sitting on the `details` rather than the `h3`, and on
 * hydration having run.
 *
 * The post is named rather than discovered, because the assertion is about a
 * SHAPE only some posts have — four of the 82 published, all of them closing
 * with an `h2` that starts with FAQ. A discovery pass would silently degrade
 * to testing nothing the day the shape changed; a named post with a skip says
 * so out loud.
 */

const FAQ_POST = '/reklama-na-facebooku'

/** The FAQ disclosures — the body's only `details`; the mobile table of
 *  contents is a sibling of it, not a descendant. */
const disclosures = (page: Page) => page.locator('[data-post-body] details')

async function gotoFaqPost(page: Page) {
  await gotoHydrated(page, FAQ_POST)
  const count = await disclosures(page).count()
  test.skip(
    count === 0,
    EMPTY_CMS_OK
      ? 'CI ephemeral DB is unseeded — no post body to assert on'
      : `${FAQ_POST} no longer closes with a strict-shape FAQ section`
  )
  return count
}

test.describe('post FAQ disclosures', () => {
  test('start closed, and opening one reveals only that answer', async ({
    page,
  }) => {
    const count = await gotoFaqPost(page)
    const items = disclosures(page)

    for (let index = 0; index < count; index += 1) {
      await expect(items.nth(index)).not.toHaveAttribute('open', /.*/)
    }

    await items.first().locator('summary').click()
    await expect(items.first()).toHaveAttribute('open', /.*/)
    await expect(items.nth(1)).not.toHaveAttribute('open', /.*/)

    // Closing again is the browser's own behaviour, and nothing in the page
    // may take it over — a disclosure that only opens is a worse wall than
    // the plain headings it replaced.
    await items.first().locator('summary').click()
    await expect(items.first()).not.toHaveAttribute('open', /.*/)
  })

  test('the questions carry the anchors the table of contents links to', async ({
    page,
  }) => {
    await gotoFaqPost(page)
    const id = await disclosures(page).first().getAttribute('id')
    expect(id).toBeTruthy()
    // The project `Link` resolves an in-page hash against the current path, so
    // the rail's hrefs are `/{slug}#anchor` rather than bare fragments.
    await expect(page.locator(`a[href$="#${id}"]`).first()).toHaveCount(1)
  })

  test('a table-of-contents jump into a closed question opens it and lands clear of the header', async ({
    page,
  }) => {
    await gotoFaqPost(page)
    const target = disclosures(page).last()
    const id = await target.getAttribute('id')

    await page.locator(`a[href$="#${id}"]`).first().click()
    await expect(target).toHaveAttribute('open', /.*/)

    /*
     * Landed below the fixed header and inside the viewport.
     *
     * Deliberately not pixel-exact against `scroll-margin-top`. A Lenis jump on
     * this page settles a few hundred pixels short of the mark while body
     * images are still resolving — measured identically on a plain `h2` anchor,
     * which nothing in this change touches, so pinning the exact offset here
     * would assert a pre-existing imprecision rather than this behaviour.
     */
    await expect
      .poll(
        () =>
          target.evaluate((el) => {
            const offset = Number.parseFloat(
              getComputedStyle(el).scrollMarginTop || '0'
            )
            const { top } = el.getBoundingClientRect()
            return top >= offset - 2 && top < window.innerHeight
          }),
        { timeout: 15_000 }
      )
      .toBe(true)
  })
})

test.describe('quote sharing', () => {
  test('selecting body text offers the toolbar, and collapsing closes it', async ({
    page,
  }) => {
    await gotoHydrated(page, FAQ_POST)

    const selected = await page.evaluate(() => {
      const body = document.querySelector('[data-post-body]')
      if (!body) {
        return null
      }
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode
        if ((node.textContent ?? '').trim().length > 60) {
          const range = document.createRange()
          range.setStart(node, 0)
          range.setEnd(node, 40)
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
          return range.toString()
        }
      }
      return null
    })
    test.skip(!selected, 'no post body long enough to quote')

    // Named by their accessible labels, which is also the assertion that the
    // icon-only controls have one at all.
    const copy = page.getByRole('button', { name: 'Kopiuj cytat' })
    await expect(copy).toBeVisible()
    await expect(page.getByRole('link', { name: /na X$/ })).toBeVisible()

    await page.evaluate(() => window.getSelection()?.removeAllRanges())
    await expect(copy).toHaveCount(0)
  })
})
