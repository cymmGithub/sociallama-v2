/**
 * Applies the approved case-study imagery audit (change `audit-case-study-imagery`).
 *
 *   bun run payload:apply:case-study-imagery              report only (default)
 *   bun run payload:apply:case-study-imagery --apply      write
 *   bun run payload:apply:case-study-imagery --apply --prod
 *
 * The PLAN below is the change's approved decision list, kept in the repository
 * because it is the only rollback instruction that exists: case-study content
 * lives solely in the database and the Polish drafts are git-ignored, so there
 * is no `git revert` for this. Each row names the media document detached and
 * what replaced it — read backwards, it restores the previous state.
 *
 * ## Detach, never delete
 *
 * Every removal DETACHES the media document from the study; none delete it.
 * Reference counting showed 8 of the 9 are referenced exactly once, so deletion
 * would be permitted by the spec — but the file also lives in Vercel Blob, and
 * deleting it would make the rollback above impossible. Orphaned media rows are
 * reported so cleanup can be a separate, reversible decision.
 *
 * `foodsaver-cover.jpg` is the exception that proves the rule: it is FoodSaver's
 * cover AND a pillar creative on the same study. Only the pillar use is
 * detached, and the document must survive because the cover still points at it.
 *
 * ## Both locales, every time
 *
 * `approach` is a WHOLE-ARRAY localized field, so `pl` and `en` each hold their
 * own copy of the pillars — including their own `media` arrays. A removal
 * written to one locale only would leave the image live on the other language's
 * page. Every edit is therefore applied per locale, and matching is done on
 * media id rather than array index so the two locales cannot drift apart.
 *
 * Writes target the published version (no `draft: true`), because these studies
 * are published and the point is to change what the public page renders.
 */

// Payload's config is imported dynamically (after the --prod env switch below),
// so this marks the file as a module — top-level await needs it.
export {}

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'apply-case-study-imagery --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  // The Blob token lives as BLOB_READ_WRITE_TOKEN_PROD so that a plain `bun dev`
  // cannot reach the production store: payload.config.ts enables the Blob plugin
  // whenever BLOB_READ_WRITE_TOKEN is set, so keeping it in .env.local silently
  // pointed every local upload at production. Map it for this one process, the
  // same way DATABASE_URL_PROD is mapped.
  if (process.env.BLOB_READ_WRITE_TOKEN_PROD) {
    process.env.BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN_PROD
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      '--prod requires BLOB_READ_WRITE_TOKEN_PROD, or the replacement bytes ' +
        'would be written to local disk while prod rows point at files that ' +
        'do not exist.'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

/**
 * Targets are named by FILENAME, never by media id.
 *
 * Media ids are per-database and the sequences are unrelated: the image this
 * plan calls `fm-logistics-gallery-4.jpg` is id 155 on development and 493 in
 * production, and production's id 155 is an unrelated blog photograph. A plan
 * keyed on ids would detach the wrong images from the wrong studies the moment
 * it ran against the second database. Filenames are unique in the media
 * collection, so they identify the same image everywhere; the id is resolved
 * per run and asserted to be unambiguous.
 */
type Op = {
  slug: string
  /** Filename of the media document to detach. */
  file: string
  why: string
  /**
   * Which field holds it. Omitted means `approach[].media`, which is localized
   * and so written per locale. `cover` is NOT localized — one write, and it is
   * always a swap rather than a detach, because a study with no cover would
   * render an empty card on the listing.
   */
  target?: 'cover'
  /** Replacement drawn from the same client's own deck, or null to just detach. */
  replace: { file: string; altPl: string; altEn: string } | null
}

const PLAN: Op[] = [
  {
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-4.jpg',
    why: "Laurastar garment steamer — another client's product photo",
    replace: {
      file: 'fm-logistics-gallery-8.jpg',
      altPl:
        'Post FM Logistic Central Europe na LinkedInie o zrównoważonych magazynach i instalacjach fotowoltaicznych',
      altEn:
        'FM Logistic Central Europe LinkedIn post about sustainable warehousing and photovoltaic installations',
    },
  },
  {
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-5.jpg',
    why: 'Portrait carrying LinkedIn’s #OPENTOWORK frame',
    replace: {
      file: 'fm-logistics-gallery-9.jpg',
      altPl:
        'Grafika FM Logistic z Krystianem Koprowskim, dyrektorem sprzedaży transportu w Polsce, obok posta na LinkedInie',
      altEn:
        'FM Logistic graphic of Krystian Koprowski, Sales Director of Transport in Poland, next to the LinkedIn announcement',
    },
  },
  {
    // Reviewed as keep-with-note (an unbranded portrait), then decided against:
    // in the "Employer branding i pozycjonowanie ekspertów" pillar it sat beside
    // the branded expert card and added nothing the card was not already saying.
    // Detach only — the pillar keeps the card and drops to a single creative.
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-6.jpg',
    why: 'Bare headshot next to the branded expert card; the card carries the pillar alone',
    replace: null,
  },
  {
    slug: 'jw-construction',
    file: 'jw-construction-gallery-1.jpg',
    why: "Deck slide capture with a 'CLICK HERE' badge burnt in",
    replace: {
      file: 'jw-construction-gallery-7.jpg',
      altPl:
        'Kreacja JW Construction dla inwestycji Horizon Gdańsk z hasłem „Zamieszkaj nad morzem”',
      altEn:
        'JW Construction creative for the Horizon Gdansk development, headlined “Live by the sea”',
    },
  },
  {
    slug: 'jw-construction',
    file: 'jw-construction-gallery-3.jpg',
    why: "Deck slide capture with a 'CLICK HERE' badge burnt in",
    replace: {
      file: 'jw-construction-gallery-8.jpg',
      altPl:
        'Kreacja JW Construction promująca program poleceń J.W. Club z hasłem „Polecasz, zyskujesz”',
      altEn:
        'JW Construction creative promoting the J.W. Club referral programme, “Recommend and gain”',
    },
  },
  {
    slug: 'jw-construction',
    file: 'jw-construction-gallery-4.jpg',
    why: "Deck slide capture with a 'CLICK HERE' badge burnt in",
    replace: {
      file: 'jw-construction-gallery-9.jpg',
      altPl:
        'Kreacja JW Construction z pięcioma powodami, dla których warto kupić mieszkanie w Chorzowie',
      altEn:
        'JW Construction creative listing five reasons to buy an apartment in Chorzow',
    },
  },
  {
    slug: 'ariadna',
    file: 'ariadna-gallery-7.jpg',
    why: 'Enlarged notification badge glyph — interface furniture',
    replace: {
      file: 'ariadna-gallery-9.jpg',
      altPl:
        'Kadr z relacji Ariadny — kobieta na kanapie rozwiązuje ankietę w telefonie',
      altEn:
        'Still from an Ariadna story — a woman on a sofa filling in a survey on her phone',
    },
  },
  {
    slug: 'ariadna',
    file: 'ariadna-gallery-8.jpg',
    why: 'Stock business photo; its alt claimed it was Ariadna’s campaign data',
    replace: {
      file: 'ariadna-gallery-10.jpg',
      altPl:
        'Kadr z relacji Ariadny — kobieta prezentuje produkty otrzymane do testowania',
      altEn:
        'Still from an Ariadna story — a woman presenting products received for testing',
    },
  },
  {
    slug: 'faktoria-win',
    file: 'faktoria-win-gallery-1.jpg',
    why: 'Stock couple on white; not the brand’s own „Zgrana Para” models',
    replace: {
      file: 'faktoria-win-gallery-7.png',
      altPl:
        'Trzy wina z oferty Faktorii Win — Harris, Kumala i różowe Wine Grime',
      altEn:
        'Three wines from Faktoria Win’s range — Harris, Kumala and the Wine Grime rosé',
    },
  },
  {
    slug: 'foodsaver',
    file: 'foodsaver-cover.jpg',
    why: 'Same file as the study cover — duplicate use; cover keeps it',
    replace: null,
  },
  {
    // The old cover is an American novelty signpost — New York City, Seattle,
    // "P Town Fire Station" — on a brand that sells tailor-made travel. Not
    // merely generic: it contradicts the positioning, and the place names stay
    // legible even in the 418x199 listing card.
    //
    // The replacement is a frame from Getaway's own published post, cropped past
    // the Instagram header. It qualifies on provenance rather than on what it
    // shows — the spec counts "its own social-media communication" — and it is
    // the only option in the pool that reads well at card size. Hero upscales
    // 2.5x from a 468x262 source, which is accepted: soft, not broken.
    slug: 'getaway',
    file: 'getaway-cover.jpg',
    why: 'American roadside signpost on a tailor-made travel brand',
    target: 'cover',
    replace: {
      file: 'getaway-cover-2.jpg',
      altPl:
        'Kadr z posta Getaway — meander rzeki Kolorado w kanionie Horseshoe Bend',
      altEn:
        'Frame from a Getaway post — the Colorado River meander at Horseshoe Bend',
    },
  },

  /**
   * —— re-crops ——
   *
   * These ten covers were never the wrong SUBJECT, so the imagery audit passed
   * every one of them. They fail a different test: the listing card is 418x199
   * and the hero 1150x646, both landscape, while the sources are portrait or
   * square. `objectFit: cover` then crops wherever it lands — through a headline
   * on Bioagris, through the Facebook group bar on Kontigo, past the face
   * entirely on Adamed.
   *
   * Each replacement is the SAME image recropped to ~1.9:1, deliberately between
   * the card's 2.10 and the hero's 1.78 so neither box eats anything that
   * matters. Crop boxes were set from measured row-brightness profiles, not by
   * eye — three of the first attempts cut exactly what they were meant to save.
   *
   * `n-energia` and `volvo` are knowingly left alone: cropping cannot fix them
   * (Energia's sharp sunflower sits where the black band begins; Volvo's frame is
   * dark and abstract throughout) and neither pool holds a single landscape
   * photograph to swap in. Those two need client-supplied material.
   */
  {
    slug: 'bioagris',
    file: 'bioagris-cover.jpg',
    why: 'Card crop sliced the “PRZYWRÓĆ ŻYCIE” headline in half',
    target: 'cover',
    replace: {
      file: 'bioagris-cover-2.jpg',
      altPl:
        'Dłonie przesypujące żyzną, ciemną glebę w świetle zachodzącego słońca',
      altEn: 'Hands sifting rich dark soil in the light of the setting sun',
    },
  },
  {
    slug: 'kontigo',
    file: 'kontigo-cover.jpg',
    why: 'Facebook group bar was cut through, leaving a clipped “ontigoCLUB”',
    target: 'cover',
    replace: {
      file: 'kontigo-cover-2.jpg',
      altPl:
        'Dwie kobiety w turbanach z ręczników nakładają sobie maseczki kosmetyczne — kadr z okładki grupy KontigoCLUB',
      altEn:
        'Two women in towel turbans applying face masks to each other — from the KontigoCLUB group cover',
    },
  },
  {
    slug: 'produkty-cukiernicze-brzesc',
    file: 'produkty-cukiernicze-brzesc-cover.jpg',
    why: 'Crop clipped the “Wygraj iPhone 11” panel and the corner logo flash',
    target: 'cover',
    replace: {
      file: 'produkty-cukiernicze-brzesc-cover-2.jpg',
      altPl:
        'Opakowanie słomki ptysiowej Pano obok miski pełnej słomki na drewnianym blacie',
      altEn:
        'A pack of Pano choux straws beside a bowl of them on a wooden counter',
    },
  },
  {
    slug: 'galeria-rondo-wiatraczna',
    file: 'galeria-rondo-wiatraczna-cover.jpg',
    why: 'Crop landed on the crowd edge rather than the event itself',
    target: 'cover',
    replace: {
      file: 'galeria-rondo-wiatraczna-cover-2.jpg',
      altPl:
        'Rodziny przy kolorowych stanowiskach warsztatowych podczas eventu w Galerii Rondo Wiatraczna',
      altEn:
        'Families at colourful workshop stations during an event at Galeria Rondo Wiatraczna',
    },
  },
  {
    slug: 'vistula',
    file: 'vistula-cover.jpg',
    why: 'Crop cut through the campaign headline',
    target: 'cover',
    replace: {
      file: 'vistula-cover-2.jpg',
      altPl:
        'Czterech studentów Uczelni Vistula w kreacji kampanii „Why Vistula?”',
      altEn:
        'Four Vistula University students in the “Why Vistula?” campaign creative',
    },
  },
  {
    slug: 'entelo',
    file: 'entelo-cover.jpg',
    why: 'Portrait screenshot letterboxed to a sliver between white bars',
    target: 'cover',
    replace: {
      file: 'entelo-cover-2.jpg',
      altPl:
        'Strona Entelo — Dobre Krzesło na Facebooku z hasłem „Produkujemy meble. Tworzymy przestrzenie. Dbamy o zdrowie.”',
      altEn:
        'The Entelo — Dobre Krzesło Facebook page, headlined “We make furniture. We create spaces. We care about health.”',
    },
  },
  {
    slug: 'adamed',
    file: 'adamed-cover.jpg',
    why: 'Crop landed on a jaw and an ear — the face was outside the frame',
    target: 'cover',
    replace: {
      file: 'adamed-cover-2.jpg',
      altPl:
        'Kobieta z zamkniętymi oczami wdycha powietrze na tle zieleni — kreacja kampanii Adamed „Głęboki oddech”',
      altEn:
        'A woman breathing in with her eyes closed against greenery — from Adamed’s “Głęboki oddech” campaign',
    },
  },
  {
    slug: 'personal-effect',
    file: 'personal-effect-cover.jpg',
    why: 'Crop cut the face off, leaving a torso',
    target: 'cover',
    replace: {
      file: 'personal-effect-cover-2.jpg',
      altPl:
        'Kobieta przy biurku w jasnym wnętrzu — kadr z materiałów Personal Effect',
      altEn:
        'A woman at a desk in a bright interior — from Personal Effect’s own material',
    },
  },
  {
    slug: 'vobis',
    file: 'vobis-cover.jpg',
    why: 'Saw floated over a stadium with the “Krótka piłka” line cropped away, so the pun lost its punchline',
    target: 'cover',
    replace: {
      file: 'vobis-cover-2.jpg',
      altPl:
        'Kreacja Vobis „Krótka piłka” — składana piła Fiskars na tle stadionu piłkarskiego',
      altEn:
        'Vobis “Krótka piłka” creative — a folding Fiskars saw against a football stadium',
    },
  },
  {
    slug: 'asus',
    file: 'asus-cover.jpg',
    why: 'Crop showed a corner of the lid with no context',
    target: 'cover',
    replace: {
      file: 'asus-cover-2.jpg',
      altPl: 'Otwarty laptop ASUS Zenbook S 16 na jasnym tle',
      altEn: 'An open ASUS Zenbook S 16 laptop on a light background',
    },
  },

  /**
   * —— licensed stock, on instruction ——
   *
   * These two are Pexels photographs, which the `case-studies` spec forbids:
   * "Generic stock or library photography standing in for work" SHALL NOT
   * appear. They are here because the recrops could not rescue either cover and
   * neither client's deck holds a usable landscape frame — Getaway's own post
   * frame was only 468x262 and visibly soft at hero size, and Vobis's cover was
   * a Facebook screenshot whose joke died in the crop.
   *
   * Recorded as a deliberate exception rather than smuggled in: the spec and the
   * site now disagree on two covers, and the requirement needs amending to say
   * so, otherwise the next audit will "fix" these straight back.
   *
   * Both were chosen to carry NO third-party marks, which ruled out most of the
   * search results — an HP lid, a Miele oven, Samsung remotes, a Netflix screen,
   * a Coca-Cola can. A competitor's logo on a multi-brand retailer's cover would
   * be worse than the generic photograph.
   *
   * Provenance for the next audit: Pexels photo 2007395 (Getaway) and 6636320
   * (Vobis), cropped to 1600x842.
   */
  {
    slug: 'getaway',
    file: 'getaway-cover-2.jpg',
    why: 'Own-post frame was only 468x262 — visibly soft once the hero upscaled it 2.5x',
    target: 'cover',
    replace: {
      file: 'getaway-cover-3.jpg',
      altPl:
        'Skrzydło samolotu i chmury w zachodzącym słońcu, widok z okna pasażerskiego',
      altEn:
        'An aircraft wing and clouds at sunset, seen from a passenger window',
    },
  },
  {
    slug: 'vobis',
    file: 'vobis-cover-2.jpg',
    why: 'Recrop saved the pun but the source is a Facebook screenshot, not a cover image',
    target: 'cover',
    replace: {
      file: 'vobis-cover-3.jpg',
      altPl:
        'Telewizor na marmurowej ścianie w jasnym salonie, poniżej drewniana szafka RTV',
      altEn:
        'A wall-mounted television on a marble wall in a bright living room, with a wooden media console below',
    },
  },

  /**
   * —— fixing a regression the recrops caused ——
   *
   * Payload skips generating an image size when the source is smaller than the
   * target in BOTH dimensions. The `og` size is 1200x630, and the tall originals
   * cleared it on height alone: `bioagris-cover.jpg` at 648x810 produced an og
   * variant, `adamed-cover.jpg` at 934x1400 likewise.
   *
   * Recropping them into short landscape strips dropped every one below 630 tall
   * while still under 1200 wide, so the og variant stopped being generated. The
   * page then fell back to the original file while STILL declaring
   * `og:image:width 1200` / `og:image:height 630` — metadata that did not match
   * the bytes, on the image every social platform reads.
   *
   * The fix is the same crop rendered at exactly 1200x630, so the size is
   * generated and the declaration is true. Upscales run from 1.11x to 1.85x,
   * checked at 1:1: soft but clean, and an OG image renders near 500px in a feed.
   * The card variant (1024w) now generates too, which it did not before.
   *
   * `galeria-rondo-wiatraczna`, `getaway` and `vobis` are absent from this list —
   * their sources are already 1200px or wider, so their og variants were fine.
   */
  {
    slug: 'bioagris',
    file: 'bioagris-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'bioagris-cover-3.jpg',
      altPl:
        'Dłonie przesypujące żyzną, ciemną glebę w świetle zachodzącego słońca',
      altEn: 'Hands sifting rich dark soil in the light of the setting sun',
    },
  },
  {
    slug: 'kontigo',
    file: 'kontigo-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'kontigo-cover-3.jpg',
      altPl:
        'Dwie kobiety w turbanach z ręczników nakładają sobie maseczki kosmetyczne — kadr z okładki grupy KontigoCLUB',
      altEn:
        'Two women in towel turbans applying face masks to each other — from the KontigoCLUB group cover',
    },
  },
  {
    slug: 'produkty-cukiernicze-brzesc',
    file: 'produkty-cukiernicze-brzesc-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'produkty-cukiernicze-brzesc-cover-3.jpg',
      altPl:
        'Opakowanie słomki ptysiowej Pano obok miski pełnej słomki na drewnianym blacie',
      altEn:
        'A pack of Pano choux straws beside a bowl of them on a wooden counter',
    },
  },
  {
    slug: 'vistula',
    file: 'vistula-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'vistula-cover-3.jpg',
      altPl:
        'Czterech studentów Uczelni Vistula w kreacji kampanii „Why Vistula?”',
      altEn:
        'Four Vistula University students in the “Why Vistula?” campaign creative',
    },
  },
  {
    slug: 'entelo',
    file: 'entelo-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'entelo-cover-3.jpg',
      altPl:
        'Strona Entelo — Dobre Krzesło na Facebooku z hasłem „Produkujemy meble. Tworzymy przestrzenie. Dbamy o zdrowie.”',
      altEn:
        'The Entelo — Dobre Krzesło Facebook page, headlined “We make furniture. We create spaces. We care about health.”',
    },
  },
  {
    slug: 'adamed',
    file: 'adamed-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'adamed-cover-3.jpg',
      altPl:
        'Kobieta z zamkniętymi oczami wdycha powietrze na tle zieleni — kreacja kampanii Adamed „Głęboki oddech”',
      altEn:
        'A woman breathing in with her eyes closed against greenery — from Adamed’s “Głęboki oddech” campaign',
    },
  },
  {
    slug: 'personal-effect',
    file: 'personal-effect-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'personal-effect-cover-3.jpg',
      altPl:
        'Kobieta przy biurku w jasnym wnętrzu — kadr z materiałów Personal Effect',
      altEn:
        'A woman at a desk in a bright interior — from Personal Effect’s own material',
    },
  },
  {
    slug: 'asus',
    file: 'asus-cover-2.jpg',
    why: 'Below 1200x630 in both dimensions, so no og variant was generated',
    target: 'cover',
    replace: {
      file: 'asus-cover-3.jpg',
      altPl: 'Otwarty laptop ASUS Zenbook S 16 na jasnym tle',
      altEn: 'An open ASUS Zenbook S 16 laptop on a light background',
    },
  },
]

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { readFile, writeFile } = await import('node:fs/promises')
const payload = await getPayload({ config })

const ALTS_EN = 'content/media/alts.en.json'
const LOCALES = ['pl', 'en'] as const

/** Unwrap an upload value that may be an id or a populated doc. */
// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
function idOf(v: any): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'object') return v.id ?? null
  return v
}

/**
 * Removes the blob objects for one filename — the original plus the size
 * variants sharp derives from it (`<stem>-<W>x<H>.<ext>`).
 *
 * Needed because the development and production databases share ONE Vercel Blob
 * store (a single BLOB_READ_WRITE_TOKEN). Uploading a file on development
 * therefore creates the blob that the later production run then collides with:
 * Payload's create always uploads, the plugin exposes no `allowOverwrite`, and
 * `addRandomSuffix` would break the filename keying this plan depends on.
 *
 * Clearing and re-uploading is safe here specifically because media URLs are
 * Payload-proxied (`/api/media/file/<filename>`) rather than blob-identity URLs,
 * so the re-upload lands at the same pathname and the development rows keep
 * resolving. Matching is exact rather than by prefix: a `list({prefix})` for
 * `ariadna-gallery-1` would also sweep up `ariadna-gallery-10`.
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
  const { blobs } = await list({ prefix: stem, token })
  const mine = blobs.filter((b) => variant.test(b.pathname))
  if (mine.length > 0)
    await del(
      mine.map((b) => b.url),
      { token }
    )
  return mine.length
}

/** Idempotent upload: reuse the media row if this filename is already in. */
async function findOrCreateMedia(file: string, slug: string, altPl: string) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: file } },
    limit: 1,
    locale: 'pl',
  })
  if (existing.docs[0]) return { doc: existing.docs[0], created: false }
  const create = () =>
    payload.create({
      collection: 'media',
      locale: 'pl',
      data: { alt: altPl },
      filePath: `public/case-studies/${slug}/${file}`,
    })
  try {
    return { doc: await create(), created: true }
  } catch (err) {
    if (!/already exists/i.test(String(err))) throw err
    const n = await clearBlobs(file)
    console.log(`  (cleared ${n} shared-store blob object(s) for ${file})`)
    return { doc: await create(), created: true }
  }
}

let changes = 0
let uploads = 0
const detached: { slug: string; mediaId: number; file: string }[] = []
/** Studies whose cache tags need expiring — only those actually edited. */
const touchedSlugs = new Set<string>()

for (const op of PLAN) {
  const found = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: op.slug } },
    limit: 1,
    draft: true,
    locale: 'pl',
    depth: 0,
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  const base = found.docs[0] as any
  if (!base) {
    console.log(`! ${op.slug}: no document — skipping`)
    continue
  }

  // Resolve the target for THIS database. Ambiguity is fatal rather than
  // best-effort: detaching the wrong media document is not recoverable from the
  // repository, so a duplicate filename must stop the run.
  const target = await payload.find({
    collection: 'media',
    where: { filename: { equals: op.file } },
    limit: 5,
  })
  const targetDoc = target.docs[0]
  if (!targetDoc) {
    console.log(`! ${op.slug}: no media named ${op.file} — skipping`)
    continue
  }
  if (target.totalDocs > 1) {
    throw new Error(
      `${op.file} matches ${target.totalDocs} media documents — refusing to guess which to detach`
    )
  }
  const mediaId = targetDoc.id as number

  // Resolve the replacement first, so both locales reference the same media row.
  let newId: number | null = null
  if (op.replace) {
    if (!APPLY) {
      const probe = await payload.find({
        collection: 'media',
        where: { filename: { equals: op.replace.file } },
        limit: 1,
      })
      newId = probe.docs[0] ? (probe.docs[0].id as number) : null
    } else {
      const { doc, created } = await findOrCreateMedia(
        op.replace.file,
        op.slug,
        op.replace.altPl
      )
      newId = doc.id as number
      if (created) {
        uploads++
        // EN alt is a separate localized write; the media collection makes `alt`
        // required, so a Polish-only upload would be an accessibility regression
        // on /en (design D6).
        await payload.update({
          collection: 'media',
          id: newId,
          locale: 'en',
          data: { alt: op.replace.altEn },
        })
        console.log(`  + uploaded ${op.replace.file} -> media ${newId}`)
      }
    }
  }

  // `cover` is a plain unlocalized upload field, so it takes one write and no
  // locale loop. It is always a swap: dropping a cover would leave a blank card
  // on the listing, which is worse than the image being replaced.
  if (op.target === 'cover') {
    if (idOf(base.cover) !== mediaId) {
      console.log(`  = ${op.slug} [cover]: ${op.file} already replaced`)
    } else if (!op.replace) {
      throw new Error(
        `${op.slug}: a cover op needs a replacement, not a detach`
      )
    } else {
      changes++
      touchedSlugs.add(op.slug)
      const verb = newId === null ? `upload ${op.replace.file}` : String(newId)
      console.log(
        `  ${APPLY ? '~' : 'would'} ${op.slug} [cover]: ${op.file} -> ${verb}`
      )
      if (APPLY) {
        if (newId === null) {
          throw new Error(
            `${op.slug}: replacement ${op.replace.file} has no media id — aborting rather than blanking the cover`
          )
        }
        await payload.update({
          collection: 'case-studies',
          id: base.id,
          data: { cover: newId },
        })
      }
    }
    if (!detached.some((d) => d.mediaId === mediaId)) {
      detached.push({ slug: op.slug, mediaId, file: op.file })
    }
    continue
  }

  for (const locale of LOCALES) {
    const res = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: op.slug } },
      limit: 1,
      draft: true,
      locale,
      fallbackLocale: false,
      depth: 0,
    })
    // biome-ignore lint/suspicious/noExplicitAny: doc shape
    const doc = res.docs[0] as any
    if (!doc?.approach?.length) continue

    let touched = false
    // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
    const approach = doc.approach.map((pillar: any) => {
      const media = pillar.media ?? []
      if (!media.some((m: unknown) => idOf(m) === mediaId)) return pillar
      touched = true
      const next: number[] = []
      for (const m of media) {
        const id = idOf(m)
        if (id !== mediaId) {
          if (id !== null) next.push(id)
          continue
        }
        // Replace in place so the creative keeps its position in the row.
        if (newId !== null && !next.includes(newId)) next.push(newId)
      }
      return { ...pillar, media: next }
    })

    if (!touched) {
      console.log(`  = ${op.slug} [${locale}]: ${op.file} already gone`)
      continue
    }
    changes++
    touchedSlugs.add(op.slug)
    // In a dry run the replacement has not been uploaded yet, so `newId` is
    // null; say so rather than printing "-> null", which reads as if the
    // creative would be dropped.
    let verb = '(detach only)'
    if (op.replace) {
      verb = newId === null ? `-> upload ${op.replace.file}` : `-> ${newId}`
    }
    console.log(
      `  ${APPLY ? '~' : 'would'} ${op.slug} [${locale}]: detach ${mediaId} (${op.file}) ${verb}`
    )
    if (APPLY) {
      if (op.replace && newId === null) {
        throw new Error(
          `${op.slug}: replacement ${op.replace.file} has no media id — aborting rather than dropping the creative`
        )
      }
      await payload.update({
        collection: 'case-studies',
        id: doc.id,
        locale,
        // No `draft: true`: these studies are published and the public page is
        // the thing being corrected.
        // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
        data: { approach } as any,
      })
    }
  }

  if (!detached.some((d) => d.mediaId === mediaId)) {
    detached.push({ slug: op.slug, mediaId, file: op.file })
  }
}

/**
 * —— record the English alts on disk ——
 *
 * `alts.en.json` is keyed by media id, and media ids are per-database: the
 * development and production sequences are completely disjoint (dev id 1 is
 * `tiktok.png`, production id 1 is `blog-1.png`). The committed file tracks
 * PRODUCTION, so appending development ids to it would attach one image's
 * English alt to a different image entirely — and `translate-media-alt.ts`
 * writes from this file back into the database by id, so the corruption would
 * eventually be applied.
 *
 * The guard is therefore ownership, not novelty: an id already present under a
 * DIFFERENT filename proves this file does not describe the database being
 * written, so the file is left alone and the mismatch is reported. The English
 * alt still reaches the database directly on upload, so nothing is lost on
 * development — only the bookkeeping is deferred to the production run.
 */
if (APPLY) {
  const raw = await readFile(ALTS_EN, 'utf8')
  // biome-ignore lint/suspicious/noExplicitAny: on-disk entry shape
  const entries = JSON.parse(raw) as any[]
  const byId = new Map(entries.map((e) => [e.id, e]))
  let added = 0
  let foreign = 0
  for (const op of PLAN) {
    if (!op.replace) continue
    const probe = await payload.find({
      collection: 'media',
      where: { filename: { equals: op.replace.file } },
      limit: 1,
    })
    const id = probe.docs[0]?.id
    if (id === undefined) continue
    const clash = byId.get(id)
    if (clash) {
      if (clash.filename !== op.replace.file) foreign++
      continue
    }
    entries.push({
      id,
      filename: op.replace.file,
      source: op.replace.altPl,
      alt: op.replace.altEn,
    })
    added++
  }
  if (foreign > 0) {
    console.log(
      `\n! ${ALTS_EN} left untouched: ${foreign} of its ids name different files ` +
        'in this database, so it describes another one (it tracks production). ' +
        'English alts were still written straight to the media rows.'
    )
  }
  if (added > 0) {
    entries.sort((a, b) => a.id - b.id)
    await writeFile(ALTS_EN, `${JSON.stringify(entries, null, 2)}\n`)
    console.log(`\n+ ${added} entries appended to ${ALTS_EN}`)
  }
}

// —— reference counts for the detached rows, so deletion stays a separate call ——
console.log('\nDetached media — reference check:')
const allStudies = await payload.find({
  collection: 'case-studies',
  limit: 200,
  draft: true,
  locale: 'pl',
  depth: 0,
})
for (const d of detached) {
  let refs = 0
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  for (const s of allStudies.docs as any[]) {
    if (idOf(s.cover) === d.mediaId) refs++
    if (idOf(s.seo?.ogImage) === d.mediaId) refs++
    if (idOf(s.client?.logo) === d.mediaId) refs++
    for (const g of s.gallery ?? []) if (idOf(g) === d.mediaId) refs++
    for (const p of s.approach ?? []) {
      for (const m of p.media ?? []) if (idOf(m) === d.mediaId) refs++
    }
  }
  const note =
    refs === 0
      ? 'orphaned — safe to delete later, kept so this change stays reversible'
      : `still referenced ${refs}x — MUST NOT be deleted`
  console.log(`  ${d.mediaId} ${d.file.padEnd(32)} ${note}`)
}

console.log(
  `\n${APPLY ? 'Applied' : 'Would apply'}: ${changes} locale-level edits, ` +
    `${uploads} uploads, ${detached.length} media detached, 0 deleted.`
)
if (!APPLY) console.log('Dry run — pass --apply to write.')

/**
 * —— expire the deployed cache ——
 *
 * A database write alone does not change what visitors see. The collection's
 * `afterChange` hook calls `revalidateTag`, but `safeRevalidate` deliberately
 * swallows the throw when there is no Next request scope — which is exactly this
 * script — so the data changes and the pages keep serving the old cache for
 * `cacheLife('days')`. Every removal here stayed invisible on the deployed site
 * until the tags were expired by hand.
 *
 * So the script does it itself rather than trusting anyone to remember. Target
 * comes from `--revalidate <baseUrl>` or REVALIDATE_BASE_URL; with neither, it
 * prints the exact command instead of quietly finishing "successfully" while the
 * public site still shows the images that were just removed.
 */
if (APPLY && touchedSlugs.size > 0) {
  const tags = [
    'case-studies',
    ...[...touchedSlugs].sort().map((s) => `case-study:${s}`),
  ]
  const query = tags.map((t) => `tag=${encodeURIComponent(t)}`).join('&')
  const flagIdx = process.argv.indexOf('--revalidate')
  const base = (
    flagIdx === -1 ? process.env.REVALIDATE_BASE_URL : process.argv[flagIdx + 1]
  )?.replace(/\/$/, '')
  const secret = process.env.REVALIDATE_SECRET

  if (!(base && secret)) {
    const why = base ? 'REVALIDATE_SECRET is not set' : 'no revalidation target'
    console.log(
      `\n! Deployed pages still show the old imagery — ${why}.\n` +
        '  The database is correct; the cache is not. Run:\n\n' +
        `  curl -X POST -H "x-revalidate-secret: $REVALIDATE_SECRET" \\\n` +
        `    "${base ?? '<baseUrl>'}/api/revalidate?${query}"\n`
    )
  } else {
    const res = await fetch(`${base}/api/revalidate?${query}`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    const body = await res.text()
    console.log(
      res.ok
        ? `\n+ revalidated ${tags.length} tag(s) on ${base}\n  ${body}`
        : `\n! revalidation failed (HTTP ${res.status}) on ${base}\n  ${body}\n` +
            '  The database is correct; the deployed pages are stale until this succeeds.'
    )
    // A failed revalidation leaves the site misrepresenting the data, so it is
    // a non-zero exit rather than a note at the bottom of a green run.
    if (!res.ok) process.exit(1)
  }
}

process.exit(0)
