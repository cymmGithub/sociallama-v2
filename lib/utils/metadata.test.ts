import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import type { Locale } from '@/lib/i18n/slug-map'
import { brandOgImages, careersOgImages, rootOpenGraph } from './metadata'

const ROOT = join(import.meta.dir, '..', '..')

/**
 * The OG cards that are FILES IN THIS REPO.
 *
 * Post and case-study cards are excluded on purpose: those resolve from the
 * database (`seo.ogImage ?? cover`), so nothing about them is checkable from a
 * checkout. What is checkable is the handful of cards the metadata builders
 * name as literal paths — and their failure mode is silent in a way a rendered
 * page never is. A renamed or deleted card leaves every `<meta og:image>` in
 * place, pointing at a 404 that no page, test or build ever requests: the tag
 * is only ever fetched by a scraper on someone else's server, and by then the
 * unfurl is already broken and cached against the URL.
 *
 * A wrong-SIZED card fails even more quietly. The dimensions are declared in
 * the builder, not read from the file, so a replacement at 1080×1080 keeps
 * announcing 1200×630 and every platform crops it to something nobody chose.
 */

/** Both halves of `Locale`, so a third locale cannot be added untested. */
const LOCALES: Locale[] = ['pl', 'en']

/** Facebook's recommended size, and what every builder declares. */
const OG_SIZE = { width: 1200, height: 630 }

/**
 * Every card a builder can emit, deduped by URL — `rootOpenGraph` hands back
 * the brand card, so both locales' roots collapse onto the one entry.
 */
const CARDS = [
  ...brandOgImages('brand'),
  ...LOCALES.flatMap((locale) => careersOgImages(locale, 'careers')),
  ...LOCALES.flatMap((locale) => rootOpenGraph(locale).images),
].filter(
  (card, i, all) => all.findIndex((other) => other.url === card.url) === i
)

/**
 * Where a public URL's bytes actually live. `public/` for most, `app/` for the
 * brand card — it is a Next file-convention asset (`app/opengraph-image.jpg`)
 * served from the route root, so a `public/`-only lookup would report the
 * site's primary card missing.
 */
function fileFor(url: string): string | null {
  const pathname = url.split('?')[0] ?? ''
  return (
    [join(ROOT, 'public', pathname), join(ROOT, 'app', pathname)].find(
      existsSync
    ) ?? null
  )
}

describe('OG cards declared in the metadata builders', () => {
  test('the brand and careers cards are all present', () => {
    // Three: the brand card plus one careers card per locale. A number rather
    // than a lower bound, so dropping a locale's card fails here.
    expect(CARDS).toHaveLength(3)
  })

  test.each(CARDS)('$url exists on disk at its declared size', async (card) => {
    const file = fileFor(card.url)
    expect(file).not.toBeNull()

    const { width, height } = await sharp(file as string).metadata()
    expect({ width, height }).toEqual({
      width: card.width,
      height: card.height,
    })
    expect({ width, height }).toEqual(OG_SIZE)
  })

  test.each(CARDS)('$url carries a version query', (card) => {
    /*
     * `?v=N` is not decoration. Facebook and LinkedIn cache a scraped card
     * against its URL, so replacing the bytes at a stable path leaves every
     * already-shared link unfurling the OLD artwork indefinitely — a deploy
     * does not reach it and neither does a CDN purge. Bumping the query is the
     * only lever, and a card that ships without one has no lever to bump.
     */
    expect(card.url).toMatch(/\?v=\d+$/)
  })

  test.each(CARDS)('$url declares alt text', (card) => {
    expect(card.alt.trim()).not.toBe('')
  })
})
