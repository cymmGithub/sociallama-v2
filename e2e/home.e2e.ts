import { expect, test } from '@playwright/test'
import { themes } from '../lib/styles/colors'
import {
  collectPageErrors,
  expectNoSeriousA11yViolations,
  gotoHydrated,
  hexToRgb,
} from './helpers'

test.describe('Home page smoke', () => {
  test('hero has its own opaque plum ground (no morph-layer bleed)', async ({
    page,
  }) => {
    // The hero video is grade-matched to plum and stays pinned past the point
    // where the chapter observer flips the SHARED background to cream. The
    // hero must paint its own opaque plum so the video never composites onto
    // the cream chapter (which read as a detached plum rectangle). Guard the
    // computed background — deterministic, no scroll/timing dependence.
    await gotoHydrated(page, '/')
    // The hero is the <section>; the track/sticky/video wrappers share the
    // hero-module prefix, so scope to the section element.
    const hero = page.locator('section[class*="hero-module"]').first()
    await expect(hero).toBeAttached()
    // --color-plum-hero, the plum theme ground
    await expect(hero).toHaveCSS(
      'background-color',
      hexToRgb(themes.plum.primary)
    )
  })

  test('renders, has no console errors, passes a11y', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectPageErrors(page)

    // Reduced motion keeps the scan deterministic: the global --reduced-motion
    // rule neutralizes transitions, the testimonial autoplay never schedules,
    // and the chapter background snaps instead of morphing.
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await gotoHydrated(page, '/')

    // `networkidle` never settles here — the WebGL scene and the dev HMR
    // socket keep the connection busy — so anchor on web assertions instead.
    // Page renders: assert a non-empty document title (auto-waits).
    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('body')).toBeVisible()

    // No console errors or uncaught exceptions during load
    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])

    // Settle the page into its final visual state (design D3 of
    // openspec/changes/fix-brand-metadata-and-a11y): instant-scroll through
    // the document so scroll reveals fire and scrubs complete, then stay at
    // the bottom — scrub opacity is a pure function of scroll position, so
    // returning to the top would re-dim the ghost text.
    await page.evaluate(async () => {
      const step = window.innerHeight
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      window.scrollTo(0, document.body.scrollHeight)
    })
    await page.waitForTimeout(1000)

    // The homepage background is one fixed layer that recolors per scroll
    // chapter, so axe would measure every transparent section against the
    // chapter the scroll landed on — not the ground the user sees behind it
    // in view. Paint each chapter wrapper with its own theme ground
    // (scan-only) so contrast is measured against the true in-view color.
    await page.addStyleTag({
      content: `
        [data-chapter="0"] { background-color: ${themes.plum.primary}; }
        [data-chapter="1"] { background-color: ${themes.cream.primary}; }
        [data-chapter="2"] { background-color: ${themes['plum-deep'].primary}; }
      `,
    })

    // Basic a11y: scoped to critical + serious violations only.
    // Exclusions are the documented decorative/brand exceptions from design
    // D2/D2a (openspec/changes/fix-brand-metadata-and-a11y/design.md):
    // - progress-text: scroll-scrub ghost words — intentionally dim until
    //   lit; the same text reaches full contrast during scroll.
    // - orange display headlines + big-marquee fill: "…THAT WORKS"/"…IT
    //   WORKS" render bold orange by brand rule (user decision 2026-07-14);
    //   the adjacent Polish subheads carry the information.
    // - testimonial queue cards: dimmed upcoming entries reach full contrast
    //   when active; aria-labels name each entry for AT users.
    await expectNoSeriousA11yViolations(page, [
      '[class*="progress-text-module"]',
      '[class*="how-it-works-module"] [class*="headingLine"]:last-child',
      '[class*="big-marquee-module"] [class*="fill"]',
      '[class*="testimonial-module"] [class*="client"]',
    ])
  })
})
