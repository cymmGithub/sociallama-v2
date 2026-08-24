import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { INDUSTRIES as INDUSTRIES_PL, type Industry } from './branze'
import { INDUSTRIES as INDUSTRIES_EN } from './branze.en'

const PUBLIC = join(import.meta.dir, '..', '..', 'public')

/**
 * A wall tile is a hand-maintained copy of what the case study shows, and the
 * study's imagery lives only in the database (see CLAUDE.md). Nothing links the
 * two, so a repair that re-cuts a file on prod leaves the wall pointing at bytes
 * of a different size while the page still renders. These tests pin the half
 * that IS checkable from the repo: the file is on disk, and the declared
 * dimensions are the file's real ones — an aspect that no longer matches is what
 * squeezes or stretches the tile.
 */

type Creative = { src: string; alt: string; width: number; height: number }

/** Every wall in a locale, keyed by industry id. Proof walls hang off the
 *  featured study, editorial walls off the industry itself (design D1). */
function wallsOf(industries: readonly Industry[]) {
  return industries
    .map((industry) => ({
      id: industry.id,
      creatives: (industry.caseStudy?.creatives ??
        industry.creatives ??
        []) as readonly Creative[],
    }))
    .filter((wall) => wall.creatives.length > 0)
}

const LOCALES = [
  { locale: 'pl', walls: wallsOf(INDUSTRIES_PL) },
  { locale: 'en', walls: wallsOf(INDUSTRIES_EN) },
]

describe.each(LOCALES)('$locale industry walls', ({ walls }) => {
  test('at least one wall is defined', () => {
    expect(walls.length).toBeGreaterThan(0)
  })

  test('every tile exists on disk at its declared size', async () => {
    for (const wall of walls) {
      for (const creative of wall.creatives) {
        // A `?v=N` suffix is a cache-bust for the image optimizer, which keys
        // its variant cache on the URL and so keeps serving the old artwork for
        // 30 days after an in-place byte replacement. The path itself is bare.
        const path = creative.src.replace(/\?.*$/, '')
        const file = join(PUBLIC, path)
        expect(existsSync(file) ? path : `missing: ${path}`).toBe(path)

        const meta = await sharp(file).metadata()
        expect({ src: path, width: meta.width, height: meta.height }).toEqual({
          src: path,
          width: creative.width,
          height: creative.height,
        })
      }
    }
  })

  test('every tile carries alt text', () => {
    for (const wall of walls) {
      for (const creative of wall.creatives) {
        expect(creative.alt.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

// The EN file is a translation of the PL one, not an independent selection: the
// walls drifted apart once already (EN carried a fifth Volvo tile PL had
// dropped), and nothing in the type system pairs them.
test('PL and EN walls reference the same files in the same order', () => {
  const srcs = (walls: ReturnType<typeof wallsOf>) =>
    Object.fromEntries(
      walls.map((wall) => [wall.id, wall.creatives.map((c) => c.src)])
    )
  expect(srcs(wallsOf(INDUSTRIES_EN))).toEqual(srcs(wallsOf(INDUSTRIES_PL)))
})

/**
 * The related-studies row never wraps on desktop, so its budget is one row —
 * six cards (owner call, 2026-08-24). The page component clips at the same
 * number (MAX_RELATED in industry-page.tsx); this pins the content itself, so
 * an overgrown roster fails here instead of being silently truncated there.
 */
describe('related case studies', () => {
  const MAX_RELATED = 6
  for (const [locale, industries] of [
    ['pl', INDUSTRIES_PL],
    ['en', INDUSTRIES_EN],
  ] as const) {
    test(`${locale}: no industry exceeds ${MAX_RELATED} related studies`, () => {
      for (const industry of industries as readonly Industry[]) {
        expect(
          industry.relatedCaseStudies?.length ?? 0,
          `${industry.id} overflows the single-row card budget`
        ).toBeLessThanOrEqual(MAX_RELATED)
      }
    })
  }
})
