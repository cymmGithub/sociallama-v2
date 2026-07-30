/**
 * Rendered widow audit: which text blocks end on a lone word, at which widths.
 *
 *   bun ./lib/scripts/audit-rendered-widows.ts                  # every PL route
 *   bun ./lib/scripts/audit-rendered-widows.ts --only /o-nas
 *   bun ./lib/scripts/audit-rendered-widows.ts --json out.json
 *   bun ./lib/scripts/audit-rendered-widows.ts --crops dir/     # one png per finding
 *   PLAYWRIGHT_PORT=3001 bun ./lib/scripts/audit-rendered-widows.ts
 *
 * A widow is a layout fact, not a text fact: the same paragraph is fine at
 * 1440 and broken at 1024. So this measures rather than reads — for every text
 * block it puts a `Range` around each word, reads the rects, and clusters them
 * by vertical position to rebuild the visual lines. `element.getClientRects()`
 * cannot substitute: it returns one box per element for stacked and
 * inline-block content, so a five-line paragraph reports as one line.
 *
 * Words are split on `\S+`, which means a non-breaking space does not split
 * one — so a pair already bound by the orphan-word rule is correctly read as a
 * single unbreakable token rather than counted twice.
 *
 * `prefers-reduced-motion: reduce` is emulated because `use-reveal.ts` renders
 * revealed content visible immediately under it. Without that, half the page is
 * mid-transform and every rect is a lie.
 *
 * Reported findings are candidates, not defects: a one-word last line is
 * correct for a CTA, a badge, a stat label or a marquee. Triage is a separate
 * step.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright'

const PORT = process.env.PLAYWRIGHT_PORT ?? '3000'
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

const argv = process.argv.slice(2)
function flag(name: string): string | undefined {
  const at = argv.indexOf(name)
  return at === -1 ? undefined : argv[at + 1]
}
const ONLY = flag('--only')
const JSON_OUT = flag('--json')
const CROPS = flag('--crops')
/**
 * One page load per viewport instead of one per group. Slower, and the
 * reference the grouped path is checked against: if a component picks its DOM
 * in JS at the 800px line, resizing would not re-run that choice and the two
 * modes would disagree.
 */
const RELOAD_EACH = argv.includes('--reload-each')
/**
 * A candidate fix, injected into every page before measuring, e.g.
 * `--try-css 'p,li{text-wrap:pretty}'`. Nothing in the repo changes, so the
 * "widows remaining after the fix" number is measured rather than predicted.
 */
const TRY_CSS = flag('--try-css')

/**
 * The site's mobile/desktop split is 799.98px, and some components choose their
 * DOM in JS rather than CSS at that line. Viewports are therefore grouped, and
 * a group gets its own page load; inside a group the page is only resized,
 * which reflows text without re-running that choice.
 */
const VIEWPORT_GROUPS = [
  [
    { width: 390, height: 844, label: '390' },
    { width: 768, height: 1024, label: '768' },
  ],
  [
    { width: 1024, height: 900, label: '1024' },
    { width: 1440, height: 900, label: '1440' },
    { width: 1920, height: 1080, label: '1920' },
  ],
] as const

/** Blog routes are out of scope: their text is imported post content. */
const STATIC_ROUTES = [
  '/',
  '/o-nas',
  '/uslugi',
  '/branze',
  '/case-studies',
  '/kontakt',
  '/zostan-lama',
  '/polityka-prywatnosci',
]

/** Index pages whose children are discovered rather than hardcoded. */
const INDEXES = ['/uslugi', '/branze', '/case-studies']

export interface Widow {
  route: string
  viewport: string
  /** A path good enough to find the element again on the same page. */
  selector: string
  tag: string
  /** Class list, which is how a component is recognised during triage. */
  classes: string
  text: string
  /** The words left on the last line. */
  orphan: string
  lines: number
  lastLineWords: number
  /** Last line width ÷ the widest line. Lower is worse. */
  ratio: number
  contentWidth: number
  fontSize: number
  textWrap: string
  textAlign: string
  /** Set when a crop was written. */
  crop?: string
}

// ---------------------------------------------------------------------------
// In-page measurement
// ---------------------------------------------------------------------------

/**
 * Runs inside the page. Returns every text block whose last visual line is a
 * lone word or a stub, having rebuilt the lines from per-word rects.
 */
function measure(): Omit<Widow, 'route' | 'viewport' | 'crop'>[] {
  const BLOCK =
    'p,h1,h2,h3,h4,h5,h6,li,blockquote,figcaption,dd,dt,td,th,summary,label,figure>div'
  const found: Omit<Widow, 'route' | 'viewport' | 'crop'>[] = []
  let mark = 0

  for (const el of Array.from(document.querySelectorAll(BLOCK))) {
    // Measure the innermost block only, or a paragraph inside a list item is
    // counted twice with different geometry.
    if (el.querySelector(BLOCK)) {
      continue
    }
    const style = getComputedStyle(el)
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      Number.parseFloat(style.opacity) < 0.05
    ) {
      continue
    }
    const box = el.getBoundingClientRect()
    if (box.width < 40 || box.height < 6) {
      continue
    }
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
    if (text.split(' ').length < 4) {
      continue
    }

    // A Range per word. `\S+` keeps a non-breaking-space pair as one token,
    // which is exactly how the browser will treat it.
    const words: {
      top: number
      bottom: number
      left: number
      right: number
      text: string
    }[] = []
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const value = node.nodeValue ?? ''
      if (value.trim()) {
        for (const match of value.matchAll(/\S+/g)) {
          const range = document.createRange()
          range.setStart(node, match.index)
          range.setEnd(node, match.index + match[0].length)
          const rect = range.getBoundingClientRect()
          if (rect.width > 0 || rect.height > 0) {
            words.push({
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              text: match[0],
            })
          }
        }
      }
      node = walker.nextNode()
    }
    if (words.length < 4) {
      continue
    }

    // Cluster by vertical position. The tolerance is half a line box, which
    // keeps superscripts and inline icons on their own line rather than
    // inventing one.
    const lines: {
      top: number
      left: number
      right: number
      words: string[]
    }[] = []
    for (const word of words) {
      const slack = Math.max(2, (word.bottom - word.top) * 0.5)
      const line = lines.find(
        (candidate) => Math.abs(candidate.top - word.top) <= slack
      )
      if (line) {
        line.left = Math.min(line.left, word.left)
        line.right = Math.max(line.right, word.right)
        line.words.push(word.text)
      } else {
        lines.push({
          top: word.top,
          left: word.left,
          right: word.right,
          words: [word.text],
        })
      }
    }
    lines.sort((a, b) => a.top - b.top)
    if (lines.length < 2) {
      continue
    }

    const last = lines.at(-1)
    if (!last) {
      continue
    }
    // The widest achieved line, not the element box: padding, `text-align` and
    // an inline `max-width` all make the box wider than the text ever gets.
    const contentWidth = Math.max(
      ...lines.map((line) => line.right - line.left)
    )
    const lastWidth = last.right - last.left
    const ratio = contentWidth > 0 ? lastWidth / contentWidth : 1
    if (last.words.length > 1 && ratio >= 0.22) {
      continue
    }

    mark += 1
    ;(el as HTMLElement).dataset.widowMark = String(mark)
    const nth =
      Array.from(el.parentElement?.children ?? [])
        .filter((sibling) => sibling.tagName === el.tagName)
        .indexOf(el) + 1
    found.push({
      selector: `[data-widow-mark="${mark}"]`,
      tag: `${el.tagName.toLowerCase()}:nth-of-type(${nth})`,
      classes: typeof el.className === 'string' ? el.className : '',
      text,
      orphan: last.words.join(' '),
      lines: lines.length,
      lastLineWords: last.words.length,
      ratio: Math.round(ratio * 1000) / 1000,
      contentWidth: Math.round(contentWidth),
      fontSize: Math.round(Number.parseFloat(style.fontSize)),
      textWrap:
        style.textWrap || style.getPropertyValue('text-wrap-style') || 'auto',
      textAlign: style.textAlign,
    })
  }
  return found
}

// ---------------------------------------------------------------------------
// Driving
// ---------------------------------------------------------------------------

/** Child routes under an index page, read from its own links. */
async function discover(page: Page, index: string): Promise<string[]> {
  await page.goto(`${BASE}${index}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  })
  const hrefs = await page.evaluate(
    (prefix) =>
      Array.from(
        document.querySelectorAll<HTMLAnchorElement>(`a[href^="${prefix}/"]`)
      )
        .map((anchor) => new URL(anchor.href).pathname)
        .filter(
          (path) => path.split('/').length === prefix.split('/').length + 1
        ),
    index
  )
  return [...new Set(hrefs)].sort()
}

/** Fonts loaded and layout quiet, so the rects mean something. */
async function settle(page: Page): Promise<void> {
  if (TRY_CSS) {
    await page.addStyleTag({ content: TRY_CSS })
  }
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(
    () =>
      new Promise<void>((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done()))
      )
  )
}

const browser = await chromium.launch()
const context = await browser.newContext({
  reducedMotion: 'reduce',
  viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()

let routes: string[]
if (ONLY) {
  routes = [ONLY]
} else {
  routes = [...STATIC_ROUTES]
  for (const index of INDEXES) {
    routes.push(...(await discover(page, index)))
  }
  routes = [...new Set(routes)]
}
console.log(
  `${routes.length} routes × ${VIEWPORT_GROUPS.flat().length} viewports against ${BASE}\n`
)

if (CROPS) {
  mkdirSync(CROPS, { recursive: true })
}

const findings: Widow[] = []
let done = 0
let failed = 0

for (const route of routes) {
  const groupsToRun = RELOAD_EACH
    ? VIEWPORT_GROUPS.flat().map((viewport) => [viewport] as const)
    : VIEWPORT_GROUPS
  for (const group of groupsToRun) {
    const first = group[0] as { width: number; height: number; label: string }
    await page.setViewportSize({ width: first.width, height: first.height })
    try {
      await page.goto(`${BASE}${route}`, {
        waitUntil: 'load',
        timeout: 120_000,
      })
    } catch (error) {
      failed += 1
      console.log(
        `  FAILED ${route} @${first.label}: ${String(error).slice(0, 90)}`
      )
      continue
    }
    for (const viewport of group) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await settle(page)
      const measured = await page.evaluate(measure)
      for (const row of measured) {
        const finding: Widow = { route, viewport: viewport.label, ...row }
        if (CROPS) {
          const name = `${route.replace(/\W+/g, '_')}-${viewport.label}-${row.selector.replace(/\D+/g, '')}.png`
          try {
            await page
              .locator(row.selector)
              .screenshot({ path: join(CROPS, name) })
            finding.crop = name
          } catch {
            // Off-screen or detached; the metrics still stand.
          }
        }
        findings.push(finding)
      }
    }
    done += 1
  }
  console.log(
    `  ${route.padEnd(46)} ${findings.filter((f) => f.route === route).length} candidates`
  )
}

await browser.close()

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

/** One row per (selector-shape, text) so a 48-page template counts once. */
function dedupeKey(finding: Widow): string {
  return `${finding.classes}|${finding.tag}|${finding.text}`
}

const groups = new Map<string, Widow[]>()
for (const finding of findings) {
  const key = dedupeKey(finding)
  groups.set(key, [...(groups.get(key) ?? []), finding])
}

console.log(`\n${done} page loads, ${failed} failed`)
console.log(
  `${findings.length} raw candidates → ${groups.size} distinct after dedupe\n`
)

const byViewport = new Map<string, number>()
for (const finding of findings) {
  byViewport.set(finding.viewport, (byViewport.get(finding.viewport) ?? 0) + 1)
}
console.log('  candidates by viewport')
for (const [viewport, count] of [...byViewport].sort(
  (a, b) => Number(a[0]) - Number(b[0])
)) {
  console.log(`    ${String(count).padStart(5)}  ${viewport}px`)
}

const byWrap = new Map<string, number>()
for (const finding of findings) {
  byWrap.set(finding.textWrap, (byWrap.get(finding.textWrap) ?? 0) + 1)
}
console.log('\n  candidates by computed text-wrap')
for (const [wrap, count] of [...byWrap].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(count).padStart(5)}  ${wrap}`)
}

if (JSON_OUT) {
  const collapsed = [...groups.entries()].map(([key, rows]) => ({
    key,
    tag: rows[0]?.tag,
    classes: rows[0]?.classes,
    text: rows[0]?.text,
    textWrap: rows[0]?.textWrap,
    fontSize: rows[0]?.fontSize,
    textAlign: rows[0]?.textAlign,
    occurrences: rows.length,
    routes: [...new Set(rows.map((row) => row.route))],
    viewports: [...new Set(rows.map((row) => row.viewport))].sort(
      (a, b) => Number(a) - Number(b)
    ),
    worst: rows.reduce(
      (low, row) => (row.ratio < low.ratio ? row : low),
      rows[0] as Widow
    ),
  }))
  collapsed.sort((a, b) => a.worst.ratio - b.worst.ratio)
  writeFileSync(
    JSON_OUT,
    JSON.stringify({ base: BASE, findings, collapsed }, null, 2)
  )
  console.log(`\nJSON → ${JSON_OUT}`)
}

process.exit(failed > 0 ? 1 : 0)
