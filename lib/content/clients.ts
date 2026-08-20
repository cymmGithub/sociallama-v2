import type { Testimonial } from './home'

/**
 * The homepage client roster — the brands approved for the belt in the
 * `TOP MARKI na strone główną` set.
 *
 * These fields are locale-invariant (design D6): a brand name is a proper noun,
 * the logo file is one asset, and a case-study slug is the same URL segment in
 * both locales. Duplicating 23 logo paths and 16 slugs across `home.ts` and
 * `home.en.ts` would only create room for silent drift — and a wrong slug fails
 * as a 404, not as a type error. The per-locale copy that *does* differ (the
 * numbers sentence, the one testimonial) lives in the locale modules, keyed by
 * `key` below.
 *
 * Logos are produced by `scripts/client-logos/pipeline.py` — see
 * `assets-src/client-logos/README.md` before adding a brand.
 */
/**
 * Industry tag. Exists for one reason: the belt may not place two brands of the
 * same industry next to each other, and that rule is only expressible with the
 * data (`clients.test.ts` enforces it). Declared as a closed set so a typo
 * reads as a new industry to the compiler rather than to nobody — an untyped
 * `'dewelooper'` would silently satisfy the adjacency check.
 */
export type ClientIndustry =
  | 'agd'
  | 'deweloper'
  | 'edukacja'
  | 'elektronika'
  | 'energetyka'
  | 'fmcg'
  | 'gastronomia'
  | 'handel'
  | 'horeca'
  | 'hr'
  | 'instytucja'
  | 'kultura'
  | 'logistyka'
  | 'motoryzacja'
  | 'rozrywka'
  | 'zdrowie'

export interface ClientBrand {
  /** Stable key: names the logo file and keys this brand's per-locale copy. */
  key: ClientKey
  /** Brand name, used as the logo's alt text. */
  name: string
  logo: string
  /** Required — see `ClientIndustry`. An untagged brand would be a hole in the
   *  adjacency rule, so the field is not optional. */
  industry: ClientIndustry
  /** Slug of this brand's published case study, if it has one. Drives both the
   *  card's CTA and the choice between a quote card and a numbers card. */
  caseStudySlug?: string
}

// Authored `as const` so the keys stay literal for `ClientKey` below, then
// re-exported through `ClientBrand[]` so consumers see one uniform shape rather
// than a 31-member union in which the bare-logo brands lack `caseStudySlug`.
//
// Order is alphabetical by key *except* for one deliberate relocation —
// `belvedere` after `imid` — which breaks the only same-industry adjacency the
// alphabetical order produced (it sat beside Burger King, the other
// `gastronomia` brand). Do not re-sort: `clients.test.ts` fails if any two
// neighbours (including the last→first seam, which the belt's repeated track
// makes real) share an `industry`.
const ROSTER = [
  {
    key: 'asus',
    name: 'ASUS',
    logo: '/assets/clients/asus.png',
    industry: 'elektronika',
    caseStudySlug: 'asus',
  },
  {
    key: 'burger-king',
    name: 'Burger King',
    logo: '/assets/clients/burger-king.png',
    industry: 'gastronomia',
  },
  {
    key: 'dpd',
    name: 'DPD',
    logo: '/assets/clients/dpd.png',
    industry: 'logistyka',
  },
  {
    key: 'engie',
    name: 'ENGIE',
    logo: '/assets/clients/engie.png',
    industry: 'energetyka',
    caseStudySlug: 'engie',
  },
  {
    key: 'fm-logistics',
    name: 'FM Logistic',
    logo: '/assets/clients/fm-logistics.png',
    industry: 'logistyka',
    caseStudySlug: 'fm-logistics',
  },
  {
    key: 'imid',
    name: 'Instytut Matki i Dziecka',
    logo: '/assets/clients/imid.png',
    industry: 'zdrowie',
    caseStudySlug: 'imid-cmv',
  },
  // Moved off its alphabetical slot: it sat beside Burger King, the other
  // restaurant brand. Here it is flanked by healthcare and home robotics.
  {
    key: 'belvedere',
    name: 'Belvedere',
    logo: '/assets/clients/belvedere.png',
    industry: 'gastronomia',
    caseStudySlug: 'belvedere',
  },
  {
    key: 'irobot',
    name: 'iRobot',
    logo: '/assets/clients/irobot.png',
    industry: 'agd',
    caseStudySlug: 'irobot',
  },
  {
    key: 'julius-meinl',
    name: 'Julius Meinl',
    logo: '/assets/clients/julius-meinl.png',
    industry: 'horeca',
    caseStudySlug: 'julius-meinl',
  },
  {
    key: 'jw-construction',
    name: 'JW Construction',
    logo: '/assets/clients/jw-construction.png',
    industry: 'deweloper',
    caseStudySlug: 'jw-construction',
  },
  {
    key: 'kcpu',
    name: 'KCPU',
    logo: '/assets/clients/kcpu.png',
    industry: 'instytucja',
  },
  {
    key: 'lg-electronics',
    name: 'LG Electronics',
    logo: '/assets/clients/lg-electronics.png',
    industry: 'elektronika',
  },
  // Chocolate Story — the mark the belt shows is the script wordmark, but the
  // company name stays the accessible one.
  {
    key: 'manufaktura-czekolady',
    name: 'Manufaktura Czekolady',
    logo: '/assets/clients/manufaktura-czekolady.png',
    industry: 'fmcg',
  },
  {
    key: 'medicover',
    name: 'Medicover',
    logo: '/assets/clients/medicover.png',
    industry: 'zdrowie',
  },
  {
    key: 'polomarket',
    name: 'POLOmarket',
    logo: '/assets/clients/polomarket.png',
    industry: 'handel',
    caseStudySlug: 'polomarket',
  },
  {
    key: 'pracuj-pl',
    name: 'Pracuj.pl',
    logo: '/assets/clients/pracuj-pl.png',
    industry: 'hr',
    caseStudySlug: 'pracuj-pl',
  },
  {
    key: 'produkty-cukiernicze-brzesc',
    name: 'Brześć',
    logo: '/assets/clients/produkty-cukiernicze-brzesc.png',
    industry: 'fmcg',
    caseStudySlug: 'produkty-cukiernicze-brzesc',
  },
  {
    key: 'rabkoland',
    name: 'Rabkoland',
    logo: '/assets/clients/rabkoland.png',
    industry: 'rozrywka',
    caseStudySlug: 'rabkoland',
  },
  {
    key: 'riviera',
    name: 'Centrum Riviera',
    logo: '/assets/clients/riviera.png',
    industry: 'handel',
    caseStudySlug: 'riviera',
  },
  {
    key: 'skrzat',
    name: 'Skrzat',
    logo: '/assets/clients/skrzat.png',
    industry: 'kultura',
    caseStudySlug: 'skrzat',
  },
  {
    key: 'toms',
    name: 'Toms',
    logo: '/assets/clients/toms.png',
    industry: 'fmcg',
  },
  // Akademia Finansów i Biznesu Vistula, the university — not the menswear
  // brand of the same name. The logo and the case study are the university's,
  // so the accessible name says so rather than leaving it ambiguous.
  {
    key: 'vistula',
    name: 'Akademia Vistula',
    logo: '/assets/clients/vistula.png',
    industry: 'edukacja',
    caseStudySlug: 'vistula',
  },
  // One entry for both Volvo marks in the approved set — Dom Volvo and Volvo
  // Car Warszawa share the `volvo` case study. It renders the annotated Dom
  // Volvo mark rather than the global VOLVO wordmark: we ran the dealer
  // accounts, and the bare wordmark claims the parent brand. The name follows
  // the mark, because it is the alt text for it.
  {
    key: 'volvo',
    name: 'Dom Volvo',
    // `?v=2`: the file's annotation was corrected in place (2026-08-20 review),
    // and Vercel's image-optimizer cache keys on the URL alone — a bare path
    // keeps serving the old artwork for up to a day (the /assets max-age) after
    // a byte replacement. Bump the version whenever the file's CONTENT changes.
    logo: '/assets/clients/volvo.png?v=2',
    industry: 'motoryzacja',
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
