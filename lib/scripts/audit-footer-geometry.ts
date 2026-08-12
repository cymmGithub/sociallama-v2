/**
 * Footer reveal geometry audit: does the sticky-bottom footer fit its window?
 *
 *   bun ./lib/scripts/audit-footer-geometry.ts                # PL home
 *   bun ./lib/scripts/audit-footer-geometry.ts --path /en
 *   bun ./lib/scripts/audit-footer-geometry.ts --shots dir/   # one png per row
 *   PLAYWRIGHT_PORT=3001 bun ./lib/scripts/audit-footer-geometry.ts
 *
 * The desktop reveal pins the footer with `position: sticky; bottom: 0`, which
 * carries an invariant the CSS cannot state: footer content must fit one
 * viewport. A sticky-bottom box taller than the window necessarily extends past
 * its *top* edge, sliding the wordmark under the fixed header — there is no
 * partial failure mode, so this has to be measured rather than eyeballed.
 *
 * Two numbers do the work. `intrinsic` is the footer's height with the reveal's
 * `min-height: 100dvh` dropped, i.e. what the content actually needs; `rest` is
 * that minus the wordmark, the quantity the wordmark's `max-height` cap has to
 * subtract from the viewport. Both are read with the reveal temporarily off,
 * because while it is on the box always measures exactly 100dvh and tells you
 * nothing about whether it fits.
 *
 * Chromium and WebKit are both run: the bug this was written for reproduced
 * identically in each, and confirming that is what ruled out the usual
 * Safari-only track-sizing suspects.
 *
 * Scrolling goes through the wheel, not `scrollTo` — Lenis intercepts
 * programmatic scrolling, and a settled reveal is the only state worth
 * measuring.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page, webkit } from 'playwright'

const worktreePort = (): string | undefined => {
  const meta = join(
    import.meta.dirname ?? process.cwd(),
    '..',
    '..',
    '.worktree-meta.json'
  )
  if (!existsSync(meta)) return undefined
  try {
    const { port } = JSON.parse(readFileSync(meta, 'utf8'))
    return port ? String(port) : undefined
  } catch {
    return undefined
  }
}

const argv = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const at = argv.indexOf(name)
  return at === -1 ? undefined : argv[at + 1]
}

const PORT = process.env.PLAYWRIGHT_PORT ?? worktreePort() ?? '3000'
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`
const PATHNAME = flag('--path') ?? '/'
const SHOTS = flag('--shots')

/**
 * The four viewports the fix was specified against — a default Safari window on
 * a 1440×900 MacBook is 1440×760, the common case rather than an edge — plus
 * either side of each band's height gate, and the wide/short window where the
 * wordmark cap is the only thing holding the footer inside the viewport.
 *
 * The 800–1199px rows matter more than they look: the two-column block is
 * nearly twice the height of the five-track row, so a threshold tuned on one
 * band is wrong for the other.
 */
const VIEWPORTS = [
  { width: 1280, height: 715 },
  { width: 1440, height: 760 },
  { width: 1440, height: 815 },
  { width: 1512, height: 860 },
  { width: 1728, height: 1085 },
  { width: 1280, height: 699 },
  { width: 1280, height: 700 },
  { width: 2560, height: 720 },
  { width: 800, height: 720 },
  { width: 1024, height: 768 },
  { width: 1199, height: 1199 },
  { width: 1199, height: 1200 },
]

const measure = () => {
  const footer = document.querySelector<HTMLElement>('[data-site-footer]')
  const header = document.querySelector('header')
  if (!(footer && header)) throw new Error('footer or header missing')
  const wordmark = footer.querySelector('svg')
  const list = footer.querySelector('ul[data-cols="2"]')
  const items = list ? [...list.querySelectorAll('li')] : []

  // Sub-column count, read off the rendered geometry rather than the CSS: the
  // whole bug was a declared column count that never materialised.
  const columns = new Set(
    items.map((li) => Math.round(li.getBoundingClientRect().left))
  ).size

  const settled = footer.getBoundingClientRect()
  const wordmarkBox = wordmark?.getBoundingClientRect()
  const headerBox = header.getBoundingClientRect()

  const previous = {
    minHeight: footer.style.minHeight,
    position: footer.style.position,
  }
  footer.style.minHeight = '0px'
  footer.style.position = 'static'
  const intrinsic = footer.getBoundingClientRect().height
  // The links are inline <a>, so scrollWidth/clientWidth read 0 on them —
  // measure the text's own line boxes against the grid cell instead.
  const clipped = items.filter((li) => {
    const link = li.firstElementChild
    if (!link) return false
    const range = document.createRange()
    range.selectNodeContents(link)
    const rects = [...range.getClientRects()]
    return (
      rects.length > 0 &&
      Math.max(...rects.map((rect) => rect.right)) >
        li.getBoundingClientRect().right + 1
    )
  }).length
  const wrapped = items.filter((li) => {
    const link = li.firstElementChild
    if (!link) return false
    const range = document.createRange()
    range.selectNodeContents(link)
    return range.getClientRects().length > 1
  }).length
  footer.style.minHeight = previous.minHeight
  footer.style.position = previous.position

  const wordmarkHeight = wordmarkBox?.height ?? 0
  const position = getComputedStyle(footer).position
  return {
    columns,
    clipped,
    wrapped,
    position,
    settledHeight: Math.round(settled.height),
    intrinsic: Math.round(intrinsic),
    rest: Math.round(intrinsic - wordmarkHeight),
    wordmarkTop: Math.round(wordmarkBox?.top ?? 0),
    wordmarkHeight: Math.round(wordmarkHeight),
    headerBottom: Math.round(headerBox.bottom),
    // Only a defect while the reveal is engaged. Past the height gate the
    // footer is in normal flow, where a wordmark above the viewport top at the
    // page bottom is just content already scrolled past — the reader reaches it
    // on the way down.
    overlap:
      position === 'sticky' && (wordmarkBox?.top ?? 0) < headerBox.bottom,
    // The invariant behind the overlap, checked directly: an engaged reveal
    // whose content is taller than the window has already failed, whatever a
    // single wordmark rect happens to say.
    fits: position !== 'sticky' || intrinsic <= window.innerHeight,
  }
}

const settle = async (page: Page) => {
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 2000)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(1200)
}

if (SHOTS) mkdirSync(SHOTS, { recursive: true })

let failures = 0
for (const [name, engine] of [
  ['chromium', chromium],
  ['webkit', webkit],
] as const) {
  const browser = await engine.launch()
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport })
    await page.goto(`${BASE}${PATHNAME}`, { waitUntil: 'networkidle' })
    await settle(page)
    const r = await page.evaluate(measure)
    let verdict = 'ok'
    if (r.overlap) verdict = 'OVERLAP'
    else if (!r.fits) verdict = 'DOES NOT FIT'
    if (r.overlap || r.clipped > 0 || !r.fits) failures++
    if (SHOTS) {
      writeFileSync(
        join(SHOTS, `${name}-${viewport.width}x${viewport.height}.png`),
        await page.screenshot()
      )
    }
    console.log(
      `${name.padEnd(8)} ${String(viewport.width).padStart(4)}×${String(viewport.height).padEnd(4)} ` +
        `cols=${r.columns} wrapped=${r.wrapped} clipped=${r.clipped} ` +
        `intrinsic=${r.intrinsic} rest=${r.rest} ` +
        `wordmarkTop=${r.wordmarkTop} headerBottom=${r.headerBottom} ` +
        `${r.position} ${verdict}`
    )
    await page.close()
  }
  await browser.close()
}

console.log(
  failures === 0 ? '\nall clear' : `\n${failures} failing viewport(s)`
)
process.exit(failures === 0 ? 0 : 1)
