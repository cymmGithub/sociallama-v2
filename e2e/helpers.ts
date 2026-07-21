import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Generous timeout for assertions that depend on client-side effects: under
 * full-suite parallelism the shared dev server starves hydration well past
 * Playwright's 5s default. */
export const HYDRATED = { timeout: 20_000 } as const

/** `#rrggbb` → `rgb(r, g, b)` as Playwright's `toHaveCSS` reports colors —
 * lets specs assert theme tokens from `lib/styles/colors` instead of
 * hand-copied literals. */
export function hexToRgb(hex: string): string {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

/** Wait until the page has hydrated. Lenis (mounted by every Wrapper page)
 * stamps `.lenis` on <html> from a client effect, so its presence proves
 * React effects are running — required before asserting on data-chrome,
 * data-theme, client-side validation, or router navigation. */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.className.includes('lenis'),
    undefined,
    { timeout: 30_000 }
  )
}

/** Navigate, then wait for hydration — without blocking on the `load` event.
 * The homepage's hero video + WebGL scene keep resources loading, so Playwright's
 * default goto (`waitUntil: 'load'`) can exceed the test timeout on a slow CI
 * runner. Anchor on `domcontentloaded` (the SSR HTML is fully parsed) and then
 * `waitForHydration` (Lenis mounted) — the signal the interactions actually need. */
export async function gotoHydrated(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await waitForHydration(page)
}

/** Collect console errors and uncaught exceptions from registration onward;
 * assert the returned arrays are empty at the point the test cares about. */
export function collectPageErrors(page: Page): {
  consoleErrors: string[]
  pageErrors: string[]
} {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  return { consoleErrors, pageErrors }
}

/** Axe scan scoped to critical + serious violations. `exclude` carries each
 * spec's documented decorative/brand exceptions. */
export async function expectNoSeriousA11yViolations(
  page: Page,
  exclude: string[] = []
) {
  let builder = new AxeBuilder({ page })
  for (const selector of exclude) {
    builder = builder.exclude(selector)
  }
  const results = await builder.analyze()
  const seriousViolations = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  )
  expect(seriousViolations).toEqual([])
}
