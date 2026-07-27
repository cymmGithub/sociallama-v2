import type { Testimonial } from './home'

/**
 * The homepage client roster — the brands approved for the belt in the
 * `TOP MARKI na strone główną` set.
 *
 * These fields are locale-invariant (design D6): a brand name is a proper noun,
 * the logo file is one asset, and a case-study slug is the same URL segment in
 * both locales. Duplicating 31 logo paths and 22 slugs across `home.ts` and
 * `home.en.ts` would only create room for silent drift — and a wrong slug fails
 * as a 404, not as a type error. The per-locale copy that *does* differ (the
 * numbers sentence, the one testimonial) lives in the locale modules, keyed by
 * `key` below.
 *
 * Logos are produced by `scripts/client-logos/pipeline.py` — see
 * `assets-src/client-logos/README.md` before adding a brand.
 */
export interface ClientBrand {
  /** Stable key: names the logo file and keys this brand's per-locale copy. */
  key: ClientKey
  /** Brand name, used as the logo's alt text. */
  name: string
  logo: string
  /** Slug of this brand's published case study, if it has one. Drives both the
   *  card's CTA and the choice between a quote card and a numbers card. */
  caseStudySlug?: string
}

// Authored `as const` so the keys stay literal for `ClientKey` below, then
// re-exported through `ClientBrand[]` so consumers see one uniform shape rather
// than a 31-member union in which the bare-logo brands lack `caseStudySlug`.
const ROSTER = [
  {
    key: 'a1-karting',
    name: 'A1 Karting',
    logo: '/assets/clients/a1-karting.png',
    caseStudySlug: 'a1-karting',
  },
  {
    key: 'asus',
    name: 'ASUS',
    logo: '/assets/clients/asus.png',
    caseStudySlug: 'asus',
  },
  {
    key: 'burger-king',
    name: 'Burger King',
    logo: '/assets/clients/burger-king.png',
  },
  {
    key: 'dolina-charlotty',
    name: 'Dolina Charlotty',
    logo: '/assets/clients/dolina-charlotty.png',
    caseStudySlug: 'dolina-charlotty',
  },
  { key: 'dpd', name: 'DPD', logo: '/assets/clients/dpd.png' },
  {
    key: 'dynamic-development',
    name: 'Dynamic Development',
    logo: '/assets/clients/dynamic-development.png',
    caseStudySlug: 'dynamic-development',
  },
  {
    key: 'ed-invest',
    name: 'ED Invest',
    logo: '/assets/clients/ed-invest.png',
    caseStudySlug: 'ed-invest',
  },
  {
    key: 'engie',
    name: 'ENGIE',
    logo: '/assets/clients/engie.png',
    caseStudySlug: 'engie',
  },
  {
    key: 'fm-logistics',
    name: 'FM Logistic',
    logo: '/assets/clients/fm-logistics.png',
    caseStudySlug: 'fm-logistics',
  },
  {
    key: 'galeria-rondo-wiatraczna',
    name: 'Galeria Rondo Wiatraczna',
    logo: '/assets/clients/galeria-rondo-wiatraczna.png',
    caseStudySlug: 'galeria-rondo-wiatraczna',
  },
  {
    key: 'home-invest',
    name: 'Home Invest',
    logo: '/assets/clients/home-invest.png',
  },
  {
    key: 'imid',
    name: 'Instytut Matki i Dziecka',
    logo: '/assets/clients/imid.png',
    caseStudySlug: 'imid-cmv',
  },
  {
    key: 'irobot',
    name: 'iRobot',
    logo: '/assets/clients/irobot.png',
    caseStudySlug: 'irobot',
  },
  {
    key: 'julius-meinl',
    name: 'Julius Meinl',
    logo: '/assets/clients/julius-meinl.png',
    caseStudySlug: 'julius-meinl',
  },
  {
    key: 'jw-construction',
    name: 'JW Construction',
    logo: '/assets/clients/jw-construction.png',
    caseStudySlug: 'jw-construction',
  },
  { key: 'kcpu', name: 'KCPU', logo: '/assets/clients/kcpu.png' },
  {
    key: 'lg-electronics',
    name: 'LG Electronics',
    logo: '/assets/clients/lg-electronics.png',
  },
  {
    key: 'manufaktura-czekolady',
    name: 'Manufaktura Czekolady',
    logo: '/assets/clients/manufaktura-czekolady.png',
  },
  {
    key: 'medicover',
    name: 'Medicover',
    logo: '/assets/clients/medicover.png',
  },
  {
    key: 'mercator',
    name: 'Mercator Medical',
    logo: '/assets/clients/mercator.png',
    caseStudySlug: 'mercator',
  },
  {
    key: 'motointegrator',
    name: 'Motointegrator',
    logo: '/assets/clients/motointegrator.png',
    caseStudySlug: 'motointegrator',
  },
  {
    key: 'oryginalny-sok',
    name: 'Oryginalny Sok',
    logo: '/assets/clients/oryginalny-sok.png',
  },
  {
    key: 'polomarket',
    name: 'POLOmarket',
    logo: '/assets/clients/polomarket.png',
    caseStudySlug: 'polomarket',
  },
  {
    key: 'pracuj-pl',
    name: 'Pracuj.pl',
    logo: '/assets/clients/pracuj-pl.png',
    caseStudySlug: 'pracuj-pl',
  },
  {
    key: 'produkty-cukiernicze-brzesc',
    name: 'Brześć',
    logo: '/assets/clients/produkty-cukiernicze-brzesc.png',
    caseStudySlug: 'produkty-cukiernicze-brzesc',
  },
  {
    key: 'rabkoland',
    name: 'Rabkoland',
    logo: '/assets/clients/rabkoland.png',
    caseStudySlug: 'rabkoland',
  },
  {
    key: 'riviera',
    name: 'Centrum Riviera',
    logo: '/assets/clients/riviera.png',
    caseStudySlug: 'riviera',
  },
  {
    key: 'skrzat',
    name: 'Skrzat',
    logo: '/assets/clients/skrzat.png',
    caseStudySlug: 'skrzat',
  },
  { key: 'toms', name: 'Toms', logo: '/assets/clients/toms.png' },
  // Akademia Finansów i Biznesu Vistula, the university — not the menswear
  // brand of the same name. The logo and the case study are the university's,
  // so the accessible name says so rather than leaving it ambiguous.
  {
    key: 'vistula',
    name: 'Akademia Vistula',
    logo: '/assets/clients/vistula.png',
    caseStudySlug: 'vistula',
  },
  // One entry for both Volvo marks in the approved set — Dom Volvo and Volvo
  // Car Warszawa share the `volvo` case study.
  {
    key: 'volvo',
    name: 'VOLVO',
    logo: '/assets/clients/volvo.png',
    caseStudySlug: 'volvo',
  },
] as const

export type ClientKey = (typeof ROSTER)[number]['key']

export const CLIENT_ROSTER: readonly ClientBrand[] = ROSTER

/**
 * What a brand's hover card says, in one locale. Which card opens is derived
 * from which of these is present (design D5), so the invalid states — a quote
 * card with no quote, a numbers card with no figure — cannot be expressed:
 *
 * - `testimonial` → quote card
 * - `numbers` only → figure card
 * - neither → bare logo, no card
 *
 * Every brand with a `caseStudySlug` needs one or the other, or its logo is a
 * dead end; `lib/content/clients.test.ts` asserts that.
 */
export interface ClientCardCopy {
  /** One sentence built around this brand's headline case-study figure. */
  numbers?: string
  /** Up to three supporting figures shown as rows under the sentence, so the
   *  card carries real substance rather than a single line. Deliberately *not*
   *  the metric the sentence already names — these add to it. A study with few
   *  reported metrics shows fewer rows rather than padding. */
  metrics?: ClientMetric[]
  testimonial?: Testimonial
}

export interface ClientMetric {
  /** Metric and the channel it happened on, e.g. `Polubienia · TikTok`. */
  label: string
  value: string
}

/** Per-locale belt copy, keyed by roster key. */
export type ClientCopy = Partial<Record<ClientKey, ClientCardCopy>>
