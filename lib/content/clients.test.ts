import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { CLIENT_ROSTER } from './clients'
import { clients as clientsPl } from './home'
import { clients as clientsEn } from './home.en'

const PUBLIC = join(import.meta.dir, '..', '..', 'public')

/** Brands whose logo opens a card: everything with a published case study. */
const withCaseStudy = CLIENT_ROSTER.filter((brand) => brand.caseStudySlug)

describe('client roster', () => {
  test('keys are unique', () => {
    const keys = CLIENT_ROSTER.map((brand) => brand.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('every logo file exists and is named after its key', () => {
    for (const brand of CLIENT_ROSTER) {
      expect(brand.logo).toBe(`/assets/clients/${brand.key}.png`)
      expect(existsSync(join(PUBLIC, brand.logo))).toBe(true)
    }
  })

  test('every brand carries an industry tag', () => {
    for (const brand of CLIENT_ROSTER) {
      expect(brand.industry).toBeTruthy()
    }
  })

  // The order is no longer alphabetical, so nothing about the file's shape
  // signals that two entries were placed deliberately. This is that signal:
  // re-sorting the roster reintroduces the clusters and fails here. The belt
  // repeats its track, so the last→first seam is an adjacency like any other.
  test('no two adjacent brands share an industry, including the seam', () => {
    const collisions = CLIENT_ROSTER.filter((brand, i) => {
      const next = CLIENT_ROSTER[(i + 1) % CLIENT_ROSTER.length]
      return brand.industry === next?.industry
    }).map((brand) => brand.key)
    expect(collisions).toEqual([])
  })

  // The testimonial slider carries its own entries, independent of the belt
  // roster, so retiring a brand from the belt must not take its logo with it.
  test('logos referenced by the testimonial slider survive', () => {
    for (const file of [
      'irobot.svg',
      'stag.svg',
      'uniphar.png',
      'funtronic.png',
      'aquael.png',
      'intrum.png',
    ]) {
      expect(existsSync(join(PUBLIC, 'assets', 'clients', file))).toBe(true)
    }
  })
})

describe('client belt copy', () => {
  test('both locales cover exactly the same brands', () => {
    expect(Object.keys(clientsEn).sort()).toEqual(Object.keys(clientsPl).sort())
  })

  test('every copy key is a roster key', () => {
    const keys = new Set<string>(CLIENT_ROSTER.map((brand) => brand.key))
    for (const key of Object.keys(clientsPl)) {
      expect(keys).toContain(key)
    }
  })

  // A brand with a case study but no card is a dead end: the logo has a real
  // destination and nothing that offers it to the reader.
  test.each(
    withCaseStudy.map((brand) => brand.key)
  )('%s has card copy in both locales', (key) => {
    for (const copy of [clientsPl, clientsEn] as Record<
      string,
      { numbers?: string; testimonial?: { quote: string } } | undefined
    >[]) {
      const entry = copy[key]
      expect(entry).toBeDefined()
      expect(entry?.numbers ?? entry?.testimonial?.quote).toBeTruthy()
    }
  })

  test('a brand without a case study carries no card copy', () => {
    const bare = CLIENT_ROSTER.filter((brand) => !brand.caseStudySlug)
    for (const brand of bare) {
      expect(clientsPl).not.toHaveProperty(brand.key)
      expect(clientsEn).not.toHaveProperty(brand.key)
    }
  })

  test('no placeholder copy survives', () => {
    const body = JSON.stringify({ clientsPl, clientsEn }).toLowerCase()
    for (const marker of ['lorem ipsum', 'imię nazwisko', 'name surname']) {
      expect(body).not.toContain(marker)
    }
  })
})
