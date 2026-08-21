/**
 * Repoint each approved case study's `cover` at its new image.
 *
 * The decisions behind this table live in the change's `cover-plan.md` (verdict
 * and both before-filenames per study) and `pexels-provenance.md` (source and
 * licence per stock frame). The table is embedded rather than read from those
 * files because the change is archived once it lands, and a maintenance script
 * has to stay runnable and auditable after that.
 *
 * Run:  bun ./lib/payload/apply-cover-refresh.ts             report only
 *       bun ./lib/payload/apply-cover-refresh.ts --apply     dev DB
 *       bun ./lib/payload/apply-cover-refresh.ts --apply --prod
 *
 * Four rules this shares with every case-study maintenance script:
 *
 * - **Key on filename, never media id.** Ids are per-database.
 * - **`cover` is NOT localized** — one write serves both locales — while
 *   `media.alt` IS, so every upload writes PL and EN.
 * - **Report first.** Without `--apply` nothing is written.
 * - **Never delete the old media row.** It is left attached to nothing, so
 *   restoring a cover is a repoint back to the filename in `from`.
 *
 * `from` is a LIST because dev and prod can reference different rows for the
 * same field: produkty-cukiernicze-brzesc points at `-cover-3.jpg` on dev and
 * at `image_crop_1200x800_w1200_q0.9.jpg` on prod. Both are recorded, and a
 * cover matching NEITHER aborts that study rather than overwriting something
 * this plan never looked at — the content moved, and the plan is stale.
 *
 * Every write goes through `media-ops.ts`, which is what makes the stored
 * filename equal the requested one, refuses a production run from a working
 * copy that would rename it, and ends by revalidating the pages it touched.
 * The first run of this script (2026-08-21) predates the module and shipped
 * all 27 production uploads renamed by one index — hence the `stored` field.
 */

import {
  begin,
  finish,
  repointRelation,
  uploadMedia,
  type Verdict,
} from '@/lib/payload/media-ops'

const APPLY = process.argv.includes('--apply')
const IS_PROD = process.argv.includes('--prod')

type Op = {
  slug: string
  /** Acceptable current filenames — dev's and prod's, which can differ. */
  from: string[]
  to: string
  /**
   * The name production ACTUALLY stored, where it differs from `to`.
   *
   * Payload's getSafeFileName checks the local media directory for collisions
   * even when the bytes go to Vercel Blob. The development run of this script
   * wrote every `<slug>-cover-2.jpg` into that directory, so the production
   * run — executed from the same working copy — found all 27 names taken and
   * bumped each index by one. The BYTES are unaffected: they are read from
   * `public/case-studies/<slug>/` by the `to` name, and production serves files
   * byte-identical to the ones this change built.
   *
   * Recorded rather than renamed. Renaming a live row would rewrite the
   * rollback record for no gain, and this field is what lets a re-run report
   * already-done instead of falsely claiming the plan is stale.
   */
  stored?: string
  altPl: string
  altEn: string
}

const OPS: Op[] = [
  {
    slug: 'a1-karting',
    from: ['a1-karting-cover.jpg'],
    to: 'a1-karting-cover-2.jpg',
    stored: 'a1-karting-cover-3.jpg',
    altPl: 'Kierowca w kombinezonie w gokarcie',
    altEn: 'A driver in racing gear in a go-kart',
  },
  {
    slug: 'aquael',
    from: ['aquael-cover.jpg'],
    to: 'aquael-cover-2.jpg',
    stored: 'aquael-cover-3.jpg',
    altPl: 'Rozświetlone akwarium, przed nim sylwetka osoby',
    altEn: 'A lit aquarium with a person silhouetted in front of it',
  },
  {
    slug: 'ariadna',
    from: ['ariadna-cover-2.jpg'],
    to: 'ariadna-cover-3.jpg',
    stored: 'ariadna-cover-4.jpg',
    altPl: 'Dłoń wypełniająca papierową ankietę ołówkiem',
    altEn: 'A hand filling in a paper questionnaire with a pencil',
  },
  {
    slug: 'breville',
    from: ['breville-cover.jpg'],
    to: 'breville-cover-2.jpg',
    stored: 'breville-cover-3.jpg',
    altPl: 'Deser podany na białym talerzu',
    altEn: 'A plated dessert on a white plate',
  },
  {
    slug: 'dynamic-development',
    from: ['dynamic-development-cover.jpg'],
    to: 'dynamic-development-cover-2.jpg',
    stored: 'dynamic-development-cover-3.jpg',
    altPl: 'Rysunki architektoniczne rzutu budynku',
    altEn: 'Architectural floor plan drawings',
  },
  {
    slug: 'engie',
    from: ['engie-cover.jpg'],
    to: 'engie-cover-2.jpg',
    stored: 'engie-cover-3.jpg',
    altPl: 'Turbiny wiatrowe na łące o wschodzie słońca',
    altEn: 'Wind turbines in a meadow at sunrise',
  },
  {
    slug: 'entelo',
    from: ['entelo-cover-3.jpg'],
    to: 'entelo-cover-4.jpg',
    stored: 'entelo-cover-5.jpg',
    altPl: 'Pokój dziecięcy z zielonymi meblami',
    altEn: "A child's room with green furniture",
  },
  {
    slug: 'faktoria-win',
    from: ['faktoria-win-cover-3.jpg'],
    to: 'faktoria-win-cover-4.jpg',
    stored: 'faktoria-win-cover-5.jpg',
    altPl: 'Butelki wina na sklepowych półkach',
    altEn: 'Wine bottles on shop shelves',
  },
  {
    slug: 'fm-logistics',
    from: ['fm-logistics-cover.jpg'],
    to: 'fm-logistics-cover-2.jpg',
    stored: 'fm-logistics-cover-3.jpg',
    altPl: 'Ciężarówka na autostradzie w górskim krajobrazie',
    altEn: 'A truck on a highway in a mountain landscape',
  },
  {
    slug: 'foodsaver',
    from: ['foodsaver-cover.jpg'],
    to: 'foodsaver-cover-2.jpg',
    stored: 'foodsaver-cover-3.jpg',
    altPl: 'Zbliżenie świeżych owoców: truskawki, maliny, jabłko i mango',
    altEn:
      'A close-up of fresh fruit — strawberries, raspberries, apple and mango',
  },
  {
    slug: 'irobot',
    from: ['irobot-cover.jpg'],
    to: 'irobot-cover-2.jpg',
    stored: 'irobot-cover-3.jpg',
    altPl: 'Robot sprzątający na dywanie obok stolika z przekąskami',
    altEn: 'A robot vacuum on a rug beside a coffee table with snacks',
  },
  {
    slug: 'julius-meinl',
    from: ['julius-meinl-cover-2.jpg'],
    to: 'julius-meinl-cover-3.jpg',
    stored: 'julius-meinl-cover-4.jpg',
    altPl: 'Zbliżenie palonych ziaren kawy',
    altEn: 'A close-up of roasted coffee beans',
  },
  {
    slug: 'kbp',
    from: ['kbp-cover.jpg'],
    to: 'kbp-cover-2.jpg',
    stored: 'kbp-cover-3.jpg',
    altPl: 'Publiczność na sali konferencyjnej',
    altEn: 'An audience in a conference hall',
  },
  {
    slug: 'kohersen',
    from: ['kohersen-cover.jpg'],
    to: 'kohersen-cover-2.jpg',
    stored: 'kohersen-cover-3.jpg',
    altPl: 'Danie podane na białym talerzu',
    altEn: 'A plated dish on a white plate',
  },
  {
    slug: 'kontigo',
    from: ['kontigo-cover-5.jpg'],
    to: 'kontigo-cover-6.jpg',
    stored: 'kontigo-cover-7.jpg',
    altPl: 'Dwie kobiety nakładające krem na twarz',
    altEn: 'Two women applying face cream',
  },
  {
    slug: 'laurastar',
    from: ['laurastar-cover.jpg'],
    to: 'laurastar-cover-2.jpg',
    stored: 'laurastar-cover-3.jpg',
    altPl: 'Parownica do ubrań na łóżku, w tle otwarta garderoba',
    altEn: 'A garment steamer on a bed with an open wardrobe behind it',
  },
  {
    slug: 'mazurska-manufaktura-alkoholi',
    from: ['mazurska-manufaktura-alkoholi-cover.jpg'],
    to: 'mazurska-manufaktura-alkoholi-cover-2.jpg',
    stored: 'mazurska-manufaktura-alkoholi-cover-3.jpg',
    altPl: 'Dwie szklanki whisky na ciemnym blacie',
    altEn: 'Two glasses of whisky on a dark counter',
  },
  {
    slug: 'mercator',
    from: ['mercator-cover.jpg'],
    to: 'mercator-cover-2.jpg',
    stored: 'mercator-cover-3.jpg',
    altPl: 'Pudełka rękawic nitrylowych na biurku',
    altEn: 'Boxes of nitrile gloves on a desk',
  },
  {
    slug: 'n-energia',
    from: ['n-energia-cover.jpg'],
    to: 'n-energia-cover-2.jpg',
    stored: 'n-energia-cover-3.jpg',
    altPl: 'Panele fotowoltaiczne na dachu domu',
    altEn: 'Photovoltaic panels on a house roof',
  },
  {
    slug: 'ozgasl',
    from: ['ozgasl-cover.jpg'],
    to: 'ozgasl-cover-2.jpg',
    stored: 'ozgasl-cover-3.jpg',
    altPl: 'Mechanik przy samochodzie na podnośniku w warsztacie',
    altEn: 'A mechanic working on a car on a lift in a workshop',
  },
  {
    slug: 'personal-effect',
    from: ['personal-effect-cover-3.jpg'],
    to: 'personal-effect-cover-4.jpg',
    stored: 'personal-effect-cover-5.jpg',
    altPl: 'Fotel w spokojnym wnętrzu w ciepłym świetle',
    altEn: 'An armchair in a calm room in warm light',
  },
  {
    slug: 'polomarket',
    from: ['polomarket-cover.jpg'],
    to: 'polomarket-cover-2.jpg',
    stored: 'polomarket-cover-3.jpg',
    altPl: 'Kobieta przy stoisku z warzywami i owocami',
    altEn: 'A woman at a fruit and vegetable stand',
  },
  {
    slug: 'produkty-cukiernicze-brzesc',
    from: [
      'produkty-cukiernicze-brzesc-cover-3.jpg',
      'image_crop_1200x800_w1200_q0.9.jpg',
    ],
    to: 'produkty-cukiernicze-brzesc-cover-4.jpg',
    stored: 'produkty-cukiernicze-brzesc-cover-5.jpg',
    altPl: 'Miska zupy na zastawionym stole',
    altEn: 'A bowl of soup on a laid table',
  },
  {
    slug: 'rabkoland',
    from: ['rabkoland-cover-3.jpg'],
    to: 'rabkoland-cover-4.jpg',
    stored: 'rabkoland-cover-5.jpg',
    altPl: 'Rozświetlona karuzela w parku rozrywki',
    altEn: 'A lit carousel at an amusement park',
  },
  {
    slug: 'skibooking',
    from: ['skibooking-cover.jpg'],
    to: 'skibooking-cover-2.jpg',
    stored: 'skibooking-cover-3.jpg',
    altPl: 'Stok narciarski z wyciągiem i narciarzami',
    altEn: 'A ski slope with a lift and skiers',
  },
  {
    slug: 'skrzat',
    from: ['skrzat-cover.jpg'],
    to: 'skrzat-cover-2.jpg',
    stored: 'skrzat-cover-3.jpg',
    altPl: 'Puste czerwone fotele w sali kinowej',
    altEn: 'Empty red seats in a cinema auditorium',
  },
  {
    slug: 'stadler-form',
    from: ['stadler-form-cover.jpg'],
    to: 'stadler-form-cover-2.jpg',
    stored: 'stadler-form-cover-3.jpg',
    altPl: 'Oczyszczacz powietrza na podłodze studia jogi',
    altEn: 'An air purifier on the floor of a yoga studio',
  },
]

const ctx = await begin({
  script: 'apply-cover-refresh',
  prod: IS_PROD,
  apply: APPLY,
  host: 'https://sociallama-v2.vercel.app',
})

console.log(
  `apply-cover-refresh — ${OPS.length} studies, ${IS_PROD ? 'PRODUCTION' : 'development'} database, ` +
    `${APPLY ? 'APPLYING' : 'report only'}\n`
)

const counts: Record<Verdict, number> = {
  'already-done': 0,
  pending: 0,
  stale: 0,
  missing: 0,
}

for (const op of OPS) {
  const verdict = await repointRelation(ctx, {
    collection: 'case-studies',
    slug: op.slug,
    field: 'cover',
    from: op.from,
    // `stored` is what production actually holds for the 27 rows the first,
    // pre-module run renamed. On prod the target IS that name — the module
    // compares the live value against `to`, so the renamed row must be the
    // target there or every row reads as stale. Dev kept the planned name.
    to: IS_PROD ? (op.stored ?? op.to) : op.to,
    tags: ['case-studies', `case-study:${op.slug}`],
    upload: async () => {
      const { doc, created } = await uploadMedia(ctx, {
        file: IS_PROD ? (op.stored ?? op.to) : op.to,
        fromPath: `public/case-studies/${op.slug}/${op.to}`,
        altPl: op.altPl,
        altEn: op.altEn,
      })
      if (doc && created)
        console.log(`    + uploaded ${doc.filename} (id ${doc.id})`)
      return doc
    },
  })
  counts[verdict]++
}

console.log(
  `\nDone. ${APPLY ? 'applied' : 'pending'}=${counts.pending} ` +
    `already-done=${counts['already-done']} skipped=${counts.stale + counts.missing}`
)
await finish(ctx)
process.exit(0)
