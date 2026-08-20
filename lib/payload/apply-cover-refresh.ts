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
 */

import { targetProdEnv } from '@/lib/payload/prod-env'

const APPLY = process.argv.includes('--apply')
const IS_PROD = process.argv.includes('--prod')

if (IS_PROD) {
  targetProdEnv('apply-cover-refresh', { blob: true })
}

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

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

/**
 * Clear a filename's objects out of the Blob store, then wait until the store
 * agrees they are gone.
 *
 * Dev and prod share one store, so a dev run of this script has already written
 * the exact key a prod run wants and the upload comes back "already exists"
 * even though no media ROW owns the name. Deleting is not immediately visible
 * to the next put either — the store is eventually consistent — so this polls
 * rather than sleeping a fixed amount.
 */
async function clearBlobs(file: string) {
  const { list, del } = await import('@vercel/blob')
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  const dot = file.lastIndexOf('.')
  const stem = file.slice(0, dot)
  const ext = file.slice(dot)
  const variant = new RegExp(
    `^${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+x\\d+)?${ext.replace('.', '\\.')}$`
  )
  const matching = async () => {
    const { blobs } = await list({ prefix: stem, token })
    return blobs.filter((b) => variant.test(b.pathname))
  }
  const first = await matching()
  if (first.length === 0) return 0
  await del(
    first.map((b) => b.url),
    { token }
  )
  for (let i = 0; i < 20; i++) {
    if ((await matching()).length === 0) return first.length
    await new Promise((r) => setTimeout(r, 500 + i * 250))
    await del(
      (await matching()).map((b) => b.url),
      { token }
    )
  }
  throw new Error(
    `${file}: blob objects still present after 20 delete attempts`
  )
}

/**
 * Upload the file unless a row already owns that filename, and write both
 * locales' alt.
 *
 * Payload's `getSafeFileName` checks the local `media/` directory even when the
 * bytes go to Blob, so a name already on local disk is silently renamed — which
 * is how a dev-then-prod sequence once shipped `-cover-3` where the plan said
 * `-cover-2`. The stored filename is therefore read back off the created doc
 * and reported, rather than assumed to be what was asked for.
 */
async function findOrCreateMedia(op: Op) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: op.to } },
    limit: 1,
    locale: 'pl',
    overrideAccess: true,
  })
  if (existing.docs[0]) return { doc: existing.docs[0], created: false }

  const create = () =>
    payload.create({
      collection: 'media',
      locale: 'pl',
      data: { alt: op.altPl },
      filePath: `public/case-studies/${op.slug}/${op.to}`,
      overrideAccess: true,
    })

  let doc: Awaited<ReturnType<typeof create>> | undefined
  try {
    doc = await create()
  } catch (err) {
    if (!/already exists/i.test(String(err))) throw err
    for (let attempt = 1; attempt <= 5 && !doc; attempt++) {
      const n = await clearBlobs(op.to)
      console.log(
        `    (cleared ${n} shared-store blob object(s), attempt ${attempt})`
      )
      await new Promise((r) => setTimeout(r, attempt * 1500))
      try {
        doc = await create()
      } catch (retryErr) {
        if (!/already exists/i.test(String(retryErr)) || attempt === 5)
          throw retryErr
      }
    }
  }
  if (!doc) throw new Error(`${op.to}: upload never succeeded`)

  // `alt` is required, so a Polish-only upload is an accessibility regression
  // on /en. Separate write because `alt` is localized and `cover` is not.
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'en',
    data: { alt: op.altEn },
    overrideAccess: true,
  })
  return { doc, created: true }
}

let pending = 0
let done = 0
let aborted = 0
const rollback: string[] = []

console.log(
  `apply-cover-refresh — ${OPS.length} studies, ${IS_PROD ? 'PRODUCTION' : 'development'} database, ` +
    `${APPLY ? 'APPLYING' : 'report only'}\n`
)

for (const op of OPS) {
  const found = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: op.slug } },
    limit: 1,
    depth: 1,
    locale: 'pl',
    draft: false,
    overrideAccess: true,
  })
  const study = found.docs[0]
  if (!study) {
    console.log(`  ! ${op.slug}: no such study — skipped`)
    aborted++
    continue
  }

  const cover = study.cover as { id?: number; filename?: string } | null
  const current = cover?.filename ?? null

  if (current === op.to || current === op.stored) {
    done++
    continue
  }
  if (!(current && op.from.includes(current))) {
    // The guard, not a selector: an unexpected cover means the content moved
    // since the plan was written, and overwriting it would destroy a change
    // nobody recorded.
    console.log(
      `  ! ${op.slug}: cover is ${current ?? '(none)'}, expected one of ` +
        `${op.from.join(' | ')} — skipped, the plan is stale for this study`
    )
    aborted++
    continue
  }

  pending++
  console.log(`  ${APPLY ? '~' : 'would'} ${op.slug}: ${current} -> ${op.to}`)
  if (!APPLY) continue

  const { doc, created } = await findOrCreateMedia(op)
  const stored = doc.filename as string
  if (stored !== op.to) {
    console.log(
      `    ! stored as ${stored}, not ${op.to} (getSafeFileName renamed it)`
    )
  }
  if (created) console.log(`    + uploaded ${stored} (id ${doc.id})`)

  await payload.update({
    collection: 'case-studies',
    id: study.id,
    data: { cover: doc.id },
    overrideAccess: true,
  })
  rollback.push(`${op.slug}: ${stored} -> ${current}`)
}

console.log(
  `\nDone. ${APPLY ? 'applied' : 'pending'}=${pending} already-done=${done} skipped=${aborted}`
)
if (rollback.length) {
  console.log('\nRollback — repoint these covers back:')
  for (const line of rollback) console.log(`  ${line}`)
}
if (APPLY && IS_PROD) {
  console.log(
    '\n/api/media/file ships max-age=31536000 and the optimizer keeps year-old ' +
      'variants: run `vercel cache purge --project sociallama-v2 --type cdn -y`, ' +
      'then verify in a real browser (bare curl hits a different Accept-negotiated entry).'
  )
}
process.exit(0)
