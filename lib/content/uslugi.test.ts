/**
 * The SEO landings' invariants — the ones the type system cannot see.
 *
 * A landing lives under `/uslugi/<slug>` but is deliberately NOT a service: it
 * targets a search phrase the seven-entry roster has no page for, and it must
 * stay out of every surface that presents the brand's offer. The type system
 * can't express "absent from navigation", and the failure is silent — an
 * eighth tile appears in the mega-menu and nothing goes red — so it is asserted
 * here instead.
 *
 * Run with: bun test lib/content/uslugi.test.ts
 */

import { describe, expect, test } from 'bun:test'
import { isPosterId } from '@/components/sections/service-posters/ids'
import { wpRedirects } from '../wp-redirects'
import * as homeEn from './home.en'
import * as home from './home'
import { STARTING_PRICE } from './pricing'
import {
  faqItemsOf,
  SERVICES,
  seoLandings,
  serviceNav,
  USLUGI_PAGES,
} from './uslugi'
import {
  SERVICES as SERVICES_EN,
  seoLandings as seoLandingsEn,
  serviceNav as serviceNavEn,
} from './uslugi.en'

const [LANDING] = seoLandings
const [LANDING_EN] = seoLandingsEn
if (!LANDING_EN) {
  throw new Error('uslugi.en.ts declares no SEO landing to pair against')
}

/* Widened deliberately. The Polish module is `as const`, so its slugs carry
   literal types; `expect(literal).toBe(widened)` then fails to typecheck
   because the matcher pins its argument to the received value's type. */
const PL_SLUG: string = LANDING.slug
const PL_PAIR: string = LANDING.pairSlug
const LANDING_PATH: string = `/uslugi/${LANDING.slug}`
const LANDING_PATH_EN = `/en/services/${LANDING_EN.slug}`

/** Every href a navigation surface offers, in one flat list per locale. */
function navHrefs(): string[] {
  return [
    ...home.menu.columns.flatMap((column) => [
      ...column.items.map((item) => item.href),
      ...(column.more ? [column.more.href] : []),
    ]),
    ...home.menu.utility.map((item) => item.href),
    ...home.services.items.map((item) => item.link.href),
    ...serviceNav.map((item) => item.href),
  ]
}

function navHrefsEn(): string[] {
  return [
    ...homeEn.menu.columns.flatMap((column) => [
      ...column.items.map((item) => item.href),
      ...(column.more ? [column.more.href] : []),
    ]),
    ...homeEn.menu.utility.map((item) => item.href),
    ...homeEn.services.items.map((item) => item.link.href),
    ...serviceNavEn.map((item) => item.href),
  ]
}

describe('the roster is untouched by the landings', () => {
  test('both locales still carry exactly seven services', () => {
    expect(SERVICES.length).toBe(7)
    expect(SERVICES_EN.length).toBe(7)
  })

  test('no landing has leaked into the roster', () => {
    const landingIds = new Set<string>(seoLandings.map((l) => l.id))
    expect(SERVICES.filter((service) => landingIds.has(service.id))).toEqual([])
    expect(SERVICES_EN.filter((service) => landingIds.has(service.id))).toEqual(
      []
    )
  })

  /*
   * The surfaces that enumerate the offer: the overlay menu's USŁUGI column,
   * the homepage services section, and the derived `serviceNav`. The hero
   * rotator is not among them because it carries words, not links — there is
   * no href for a landing to leak into.
   */
  test('no navigation surface links a landing', () => {
    const landingPaths = seoLandings.map((landing) => `/uslugi/${landing.slug}`)
    for (const href of navHrefs()) {
      expect(landingPaths).not.toContain(href)
    }
    const landingPathsEn = seoLandingsEn.map(
      (landing) => `/en/services/${landing.slug}`
    )
    for (const href of navHrefsEn()) {
      expect(landingPathsEn).not.toContain(href)
    }
  })
})

describe('the landing pairs across locales', () => {
  test('the two halves point at each other', () => {
    expect(LANDING_EN.id).toBe(LANDING.id)
    expect(LANDING_EN.slug).toBe(PL_PAIR)
    expect(LANDING_EN.pairSlug).toBe(PL_SLUG)
  })

  test('the id is the Polish slug, as for every service', () => {
    expect(PL_SLUG).toBe(LANDING.id)
  })

  /*
   * The id is what pairs the hub card's poster with the page hero's
   * (`usluga-<id>`), and `isPosterId` is what decides the card gets artwork at
   * all. Drop the id from POSTER_IDS and the hub silently falls back to a text
   * card and the morph stops pairing — no error, just a duller page.
   */
  test('the landing has an authored poster, in both locales', () => {
    expect(isPosterId(LANDING.id)).toBe(true)
    expect(isPosterId(LANDING_EN.id)).toBe(true)
  })
})

describe('the landing targets its cluster', () => {
  test('the Polish title and H1 both lead with the head phrase', () => {
    const HEAD = 'Prowadzenie social media'
    expect(LANDING.meta.title.startsWith(HEAD)).toBe(true)
    const hero = LANDING.sections[0]
    expect(hero.kind).toBe('hero')
    expect((hero as { title: string }).title.startsWith(HEAD)).toBe(true)
  })

  /*
   * Scope, then price, then the FAQ — the order the spec requires. Asserted as
   * relative positions rather than fixed indices, so a section added between
   * them (a proof card, say) does not fail a test about sequence.
   */
  test('scope precedes pricing precedes the FAQ', () => {
    const kinds = LANDING.sections.map((section) => section.kind)
    expect(kinds.indexOf('checklist')).toBeGreaterThan(-1)
    expect(kinds.indexOf('banner')).toBeGreaterThan(kinds.indexOf('checklist'))
    expect(kinds.indexOf('faq')).toBeGreaterThan(kinds.indexOf('banner'))
  })

  /*
   * Two FAQ questions used to echo a section heading word for word — the
   * pricing banner's "Ile kosztuje…" and the scope checklist's "Co
   * obejmuje…". Those sections answer them in the open; the accordion asked
   * them again behind a <details>, grinding both topics twice on one page.
   *
   * Asserted against every heading rather than those two strings, so a
   * section added later cannot quietly reintroduce the pattern, and so the
   * rule reads the same in both locales.
   */
  test('no FAQ question echoes a heading from its own page', () => {
    const normalize = (text: string) => text.trim().toLowerCase()
    for (const landing of [LANDING, LANDING_EN]) {
      const headings = landing.sections
        .map((section) => (section as { heading?: string }).heading)
        .filter((heading) => typeof heading === 'string')
        .map(normalize)
      const questions = faqItemsOf(landing.sections)
      expect(questions.length).toBeGreaterThan(0)
      for (const item of questions) {
        expect(headings).not.toContain(normalize(item.question))
      }
    }
  })
})

/*
 * The spec requires the landing's starting price to match the homepage FAQ's.
 * Both read `STARTING_PRICE`, so this asserts the wiring rather than the digits
 * — a copy edit that retypes the number instead of interpolating it is exactly
 * what this catches, because the figure would then no longer move with the
 * constant.
 */
describe('one price figure, quoted in four places', () => {
  const priceOf = (text: string) => text.includes(`${STARTING_PRICE} `)

  test('both homepage FAQ pricing answers quote it', () => {
    expect(priceOf(home.faq.items[0].answer)).toBe(true)
    expect(priceOf(homeEn.faq.items[0]?.answer ?? '')).toBe(true)
  })

  test('both landings quote it in their pricing band', () => {
    for (const landing of [LANDING, LANDING_EN]) {
      const banner = landing.sections.find(
        (section) => section.kind === 'banner'
      )
      expect(banner).toBeDefined()
      expect(priceOf((banner as { body: string }).body)).toBe(true)
    }
  })
})

/*
 * The homepage's pricing answer is the landing's other inbound link (the
 * `/uslugi` index is the first). Without it the landing is reachable only from
 * the sitemap.
 */
describe('the landing is not an orphan', () => {
  test('the homepage FAQ pricing answer links it, in both locales', () => {
    // Widened before comparing — `home.ts` is `as const`, so its href is a
    // literal type and the matcher would pin the expectation to it.
    const plHref: string | undefined = home.faq.items[0].link?.href
    expect(plHref).toBe(LANDING_PATH)
    expect(homeEn.faq.items[0]?.link?.href).toBe(LANDING_PATH_EN)
  })

  /*
   * The six legacy platform-offer URLs were retargeted at the landing, so its
   * slug is now load-bearing outside the app: rename it and those 301s point
   * into a 404 with nothing else on the site to notice. `e2e/wp-redirects` runs
   * the same pairing over HTTP; this is the half that runs in `bun test`.
   */
  test('the legacy /oferta/<platform> redirects point at a page that exists', () => {
    const slugs = new Set(USLUGI_PAGES.map((page) => `/uslugi/${page.slug}`))
    const platformOffers = wpRedirects.filter((rule) =>
      rule.source.startsWith('/oferta/')
    )
    expect(platformOffers.length).toBe(6)
    for (const rule of platformOffers) {
      expect(rule.destination).toBe(LANDING_PATH)
      expect(slugs.has(rule.destination)).toBe(true)
    }
  })
})
