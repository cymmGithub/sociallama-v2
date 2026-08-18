/**
 * Applies the final pre-launch verification imagery plan (change
 * `apply-final-verification-feedback`, Asana 1217405077214092).
 *
 *   bun run payload run lib/payload/apply-final-verification-imagery.ts            report only
 *   bun run payload run lib/payload/apply-final-verification-imagery.ts --apply    write
 *   ... --apply --prod                                                             production
 *
 * Sibling of `apply-case-study-imagery.ts` and bound by the same rules — the
 * PLAN below is the approved per-image decision list (the full verdict table,
 * keeps included, lives in the change's `imagery-plan.md`):
 *
 *   - Targets are named by FILENAME, never media id: ids are per-database
 *     (`fm-logistics-gallery-4.jpg` is 155 on development and 493 in
 *     production), so a plan keyed on ids would detach the wrong images the
 *     moment it ran against the second database. Filenames are unique in the
 *     media collection; the id is resolved per run and ambiguity is fatal.
 *   - Detach, never delete. Removed media documents stay in the collection and
 *     in Blob, so this PLAN read backwards is the rollback instruction — the
 *     only one that exists, because case-study content is DB-only.
 *   - `approach` is a WHOLE-ARRAY localized field: every pillar edit is written
 *     to `pl` and `en` separately, matching entries by media id, never index.
 *   - Writes target the published version (no `draft: true`) — these studies
 *     are published and the public page is the thing being corrected.
 *
 * Beyond its sibling this script knows two more moves:
 *
 *   - `add`: files appended after a swapped position (Pracuj's EDU/FUNNY
 *     pillars grew from the client's new material — 2 and 3 creatives where
 *     the audit left 1 and 2).
 *   - `pillar`: removes one whole approach pillar per locale, matched by its
 *     own tag in each locale. Exists for iRobot's `#DLAKAŻDEGO`/`#FOREVERYONE`:
 *     the seed edit alone cannot reach the database, because
 *     `seed-case-studies.ts` is skip-if-exists (design decision 5).
 *
 * Anonymized swaps (`copyAlt`) carry the original document's PL and EN alt
 * onto the replacement — the image still shows the same content, only with
 * avatars blurred, names pseudonymized, or status bars cropped (spec: third-
 * party identities in screenshots are anonymized, not removed).
 */

// Payload's config is imported dynamically (after the --prod env switch below),
// so this marks the file as a module — top-level await needs it.
export {}

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'apply-final-verification-imagery --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      '--prod requires BLOB_READ_WRITE_TOKEN, or the new media bytes would be ' +
        'written to local disk while prod rows point at files that do not exist.'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

type Replacement =
  | { file: string; altPl: string; altEn: string; copyAlt?: never }
  | { file: string; copyAlt: true; altPl?: never; altEn?: never }

type Op =
  | {
      kind: 'swap'
      slug: string
      file: string
      why: string
      to: Replacement
      /** Extra files appended right after the swapped position (same pillar). */
      add?: { file: string; altPl: string; altEn: string }[]
    }
  | { kind: 'detach'; slug: string; file: string; why: string }
  | {
      kind: 'cover'
      slug: string
      file: string
      why: string
      to: { file: string; altPl: string; altEn: string }
    }
  | {
      kind: 'pillar'
      slug: string
      /** The pillar's tag in each locale — matched per locale, never by index. */
      tag: { pl: string; en: string }
      why: string
    }

const PLAN: Op[] = [
  // —— vistula ——————————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'vistula',
    file: 'vistula-gallery-7.jpg',
    why: 'Moderation thread named a real commenter; pseudonymized (P 2026-08-18)',
    to: { file: 'vistula-gallery-7-anon.jpg', copyAlt: true },
  },
  // —— volvo ————————————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'volvo',
    file: 'volvo-vcw-post.jpg',
    why: 'Status-bar clock + agency employee account in the likes line',
    to: { file: 'volvo-vcw-post-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'volvo',
    file: 'volvo-vcw-goracy.jpg',
    why: 'Status-bar clock + agency employee account in the likes line',
    to: { file: 'volvo-vcw-goracy-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'volvo',
    file: 'volvo-dom-savedate.jpg',
    why: 'Status-bar clock',
    to: { file: 'volvo-dom-savedate-anon.jpg', copyAlt: true },
  },
  {
    kind: 'detach',
    slug: 'volvo',
    file: 'volvo-event-safety.jpg',
    why: 'Two uncleared faces are the subject of the frame (A; call delegated by P)',
  },
  {
    kind: 'swap',
    slug: 'volvo',
    file: 'volvo-konkurs-podium.jpg',
    why: 'Children on the podium (A: remove; E: use contest material instead)',
    to: {
      file: 'volvo-konkurs-warsztat.jpg',
      altPl:
        'Stół warsztatowy akcji „Volvo oczami dzieci” — kredki, farby i powstający rysunek w salonie Dom Volvo',
      altEn:
        'Craft table at the "Volvo through children\'s eyes" contest — crayons, watercolours and a drawing in progress at the Dom Volvo showroom',
    },
  },
  // —— engie ————————————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'engie',
    file: 'engie-gallery-1.jpg',
    why: 'Status-bar clock',
    to: { file: 'engie-gallery-1-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'engie',
    file: 'engie-gallery-2.jpg',
    why: 'Status-bar clock',
    to: { file: 'engie-gallery-2-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'engie',
    file: 'engie-gallery-3.jpg',
    why: 'Status-bar clock',
    to: { file: 'engie-gallery-3-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'engie',
    file: 'engie-gallery-4.jpg',
    why: "Agency employee's face blurred (P 2026-08-18: blur, keep the photo)",
    to: { file: 'engie-gallery-4-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'engie',
    file: 'engie-gallery-5.jpg',
    why: 'Status-bar clock',
    to: { file: 'engie-gallery-5-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'engie',
    file: 'engie-gallery-6.jpg',
    why: 'Status-bar clock',
    to: { file: 'engie-gallery-6-anon.jpg', copyAlt: true },
  },
  // —— fm-logistics —————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-1.jpg',
    why: 'FM employee portrait (A: remove; E+P: approved Pexels stock, provenance in pexels-provenance.md)',
    to: {
      file: 'fm-logistics-lider-1.jpg',
      altPl:
        'Kurier z tabletem przy furgonetce pełnej paczek (zdjęcie ilustracyjne, Pexels)',
      altEn:
        'Courier with a tablet by a van full of parcels (stock photo, Pexels)',
    },
  },
  {
    kind: 'swap',
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-2.jpg',
    why: "Replaced with the client's own post named for the pillar (E); clock goes with it",
    to: {
      file: 'fm-logistics-greensupply-1.png',
      altPl:
        'Zrzut posta FM Logistic Central Europe o ekspansji na trasie Polska–Czechy',
      altEn:
        'FM Logistic Central Europe post on the Poland–Czech Republic expansion',
    },
  },
  {
    kind: 'swap',
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-8.jpg',
    why: 'Second cross-docking graphic swapped (E); clock and named reaction line go with it',
    to: {
      file: 'fm-logistics-crossdock-2.png',
      altPl:
        'Zrzut posta FM Logistic Central Europe o logistyce farmaceutycznej',
      altEn: 'FM Logistic Central Europe post on pharma logistics',
    },
  },
  {
    kind: 'swap',
    slug: 'fm-logistics',
    file: 'fm-logistics-gallery-9.jpg',
    why: 'Advocacy graphic with an employee portrait and name (A: remove; E+P: approved Pexels stock)',
    to: {
      file: 'fm-logistics-employerbranding-1.jpg',
      altPl:
        'Pracownik magazynu w kamizelce między regałami (zdjęcie ilustracyjne, Pexels)',
      altEn:
        'Warehouse worker in a gilet among storage racks (stock photo, Pexels)',
    },
  },
  // —— belvedere ————————————————————————————————————————————————————————————
  {
    kind: 'detach',
    slug: 'belvedere',
    file: 'belvedere-gallery-2.jpg',
    why: 'Chef portrait (A: remove); the pillar drops to its remaining creatives',
  },
  // —— irobot ———————————————————————————————————————————————————————————————
  {
    kind: 'pillar',
    slug: 'irobot',
    tag: { pl: '#DLAKAŻDEGO', en: '#FOREVERYONE' },
    why: 'Pillar deleted per E; seed already edited, but the seed is skip-if-exists',
  },
  {
    kind: 'swap',
    slug: 'irobot',
    file: 'irobot-gallery-3.jpg',
    why: 'Clock inside the phone mockup',
    to: { file: 'irobot-gallery-3-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'irobot',
    file: 'irobot-gallery-6.jpg',
    why: 'Clock inside the phone mockup',
    to: { file: 'irobot-gallery-6-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'irobot',
    file: 'irobot-gallery-1.jpg',
    why: 'Edukacja i technologia creatives swapped (E)',
    to: {
      file: 'irobot-edukacja-1.png',
      altPl:
        'Kreacja iRobot z pytaniem „Czy pies może się stresować… sprzątaniem?”',
      altEn: 'iRobot creative asking whether dogs get stressed by vacuuming',
    },
  },
  {
    kind: 'swap',
    slug: 'irobot',
    file: 'irobot-gallery-2.jpg',
    why: 'Edukacja i technologia creatives swapped (E)',
    to: {
      file: 'irobot-edukacja-2.png',
      altPl: 'Zrzut posta iRobot Polska prezentującego Roombę MAX 705 Combo',
      altEn: 'iRobot Polska post introducing the Roomba MAX 705 Combo',
    },
  },
  {
    kind: 'swap',
    slug: 'irobot',
    file: 'irobot-gallery-4.jpg',
    why: 'Horizontal slot: sharpest of the three YT candidates at rendered size (E)',
    to: {
      file: 'irobot-innowacja-1.png',
      altPl:
        'Kadr z filmu YouTube „Find Your Roomba” — widzowie oglądają spot o robocie dla właścicieli psów',
      altEn:
        'Frame from the "Find Your Roomba" YouTube video about a robot for dog owners',
    },
  },
  // —— julius-meinl —————————————————————————————————————————————————————————
  {
    kind: 'cover',
    slug: 'julius-meinl',
    file: 'julius-meinl-cover.jpg',
    why: 'P 2026-08-18: cover becomes the Julius Meinl logotype',
    to: {
      file: 'julius-meinl-cover-2.jpg',
      altPl: 'Logotyp Julius Meinl',
      altEn: 'Julius Meinl logo',
    },
  },
  {
    kind: 'swap',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-1.jpg',
    why: 'Creative with an agency employee (A); P assigned the cup photo here',
    to: {
      file: 'julius-meinl-szkolenia-1.png',
      altPl:
        'Czerwona filiżanka Julius Meinl ze spodkiem na słonecznym tarasie',
      altEn: 'Red Julius Meinl cup and saucer on a sunny terrace',
    },
  },
  {
    kind: 'detach',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-2.jpg',
    why: 'Second creative with an agency employee; P supplied one file — the pillar shortens',
  },
  {
    kind: 'swap',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-5.jpg',
    why: 'Two recognizable people at the stand (A)',
    to: {
      file: 'julius-meinl-eventy-1.png',
      altPl:
        'Grafika zapowiadająca polski finał Julius Meinl Barista Cup 2026 — plaża, piłka siatkowa i filiżanka espresso',
      altEn:
        'Announcement graphic for the Polish final of the Julius Meinl Barista Cup 2026 — beach volleyball and an espresso cup',
    },
  },
  {
    kind: 'swap',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-6.jpg',
    why: 'Event photo with recognizable people (A); replaced with a people-free frame from the client video',
    to: {
      file: 'julius-meinl-eventy-2.jpg',
      altPl: 'Stoisko baristyczne Julius Meinl na zawodach Barista Cup 2026',
      altEn: 'Julius Meinl barista stand at the Barista Cup 2026',
    },
  },
  {
    kind: 'swap',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-7.jpg',
    why: 'P 2026-08-18: the lifestyle pillar gets the two named files',
    to: {
      file: 'julius-meinl-lifestyle-1.png',
      altPl:
        'Kreacja Julius Meinl porównująca marketing millenialsów i generacji Z',
      altEn: 'Julius Meinl creative comparing millennial and Gen Z marketing',
    },
  },
  {
    kind: 'swap',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-8.jpg',
    why: 'P 2026-08-18: the lifestyle pillar gets the two named files',
    to: {
      file: 'julius-meinl-lifestyle-2.png',
      altPl:
        'Dwie filiżanki Julius Meinl na stoliku — kreacja „ona mówi, ona słucha”',
      altEn:
        'Two Julius Meinl cups on a café table — the "she talks, she listens" creative',
    },
  },
  {
    kind: 'detach',
    slug: 'julius-meinl',
    file: 'julius-meinl-gallery-9.jpg',
    why: "Plantation worker's face; the file once meant for this slot moved to #LIFESTYLE (P)",
  },
  // —— riviera ——————————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'riviera',
    file: 'riviera-gallery-2.jpg',
    why: 'Post header tags a third party by full name; pseudonymized (found at rendered-page verification)',
    to: { file: 'riviera-gallery-2-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'riviera',
    file: 'riviera-gallery-3.jpg',
    why: 'Cropped so the player bar and the former employee are out of frame (E)',
    to: { file: 'riviera-gallery-3-anon.jpg', copyAlt: true },
  },
  {
    kind: 'detach',
    slug: 'riviera',
    file: 'riviera-gallery-4.jpg',
    why: 'The "pan" graphic at the wzruszające-wideo section (E: remove)',
  },
  {
    kind: 'swap',
    slug: 'riviera',
    file: 'riviera-gallery-6.jpg',
    why: "Private account's story: face, avatar and nick blurred (flagged by us; anonymization line per P)",
    to: { file: 'riviera-gallery-6-anon.jpg', copyAlt: true },
  },
  // —— jw-construction ——————————————————————————————————————————————————————
  {
    kind: 'cover',
    slug: 'jw-construction',
    file: 'jw-construction-cover.jpg',
    why: 'E: swap the main photo; P 2026-08-18: approved Pexels stock, developer theme',
    to: {
      file: 'jw-construction-cover-2.jpg',
      altPl:
        'Szklane balkony nowoczesnego budynku mieszkalnego (zdjęcie ilustracyjne, Pexels)',
      altEn:
        'Glass balconies of a modern residential building (stock photo, Pexels)',
    },
  },
  {
    kind: 'detach',
    slug: 'jw-construction',
    file: 'jw-construction-gallery-2.jpg',
    why: 'Ekspercki-content graphic (E: remove)',
  },
  {
    kind: 'detach',
    slug: 'jw-construction',
    file: 'jw-construction-gallery-6.jpg',
    why: 'Identyfikacja wizualna: right one dropped, left stays enlarged (E)',
  },
  // —— polomarket ———————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'polomarket',
    file: 'polomarket-gallery-1.jpg',
    why: 'Moderation thread: avatar blurred, commenter pseudonymized consistently (P)',
    to: { file: 'polomarket-gallery-1-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'polomarket',
    file: 'polomarket-gallery-2.jpg',
    why: 'Moderation thread: avatar blurred, commenter pseudonymized consistently (P)',
    to: { file: 'polomarket-gallery-2-anon.jpg', copyAlt: true },
  },
  {
    kind: 'swap',
    slug: 'polomarket',
    file: 'polomarket-gallery-3.jpg',
    why: 'Zwiększanie-zaangażowania graphic swapped (A/E)',
    to: {
      file: 'polomarket-sprzedaz-1.png',
      altPl: 'Zrzut posta POLOmarket z gazetką „HITY na niedzielę handlową”',
      altEn: 'POLOmarket post with the "Sunday trading hits" leaflet',
    },
  },
  // —— pracuj-pl ————————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'pracuj-pl',
    file: 'pracuj-pl-ar-grid.jpg',
    why: 'Status-bar clock cropped (P)',
    to: { file: 'pracuj-pl-ar-grid-anon.jpg', copyAlt: true },
  },
  {
    kind: 'detach',
    slug: 'pracuj-pl',
    file: 'pracuj-pl-ar-creator.jpg',
    why: '„Dziewczyna po prawej” — P 2026-08-18: remove; the pillar keeps the grid',
  },
  {
    kind: 'swap',
    slug: 'pracuj-pl',
    file: 'pracuj-pl-edu.jpg',
    why: 'EDU creatives replaced with the client-supplied set (E); clock goes with it',
    to: {
      file: 'pracuj-pl-edu-1.png',
      altPl:
        'Kreacja edukacyjna Pracuj.pl z maskotką surykatki — „Słowa kluczowe: jak je znaleźć w ogłoszeniu?”',
      altEn:
        'Pracuj.pl educational creative with the meerkat mascot — how to find keywords in a job ad',
    },
    add: [
      {
        file: 'pracuj-pl-edu-2.png',
        altPl:
          'Kreacja edukacyjna Pracuj.pl z maskotką surykatki — „AI zastąpiło rekruterów?”',
        altEn:
          'Pracuj.pl educational creative with the meerkat mascot — has AI replaced recruiters?',
      },
    ],
  },
  {
    kind: 'swap',
    slug: 'pracuj-pl',
    file: 'pracuj-pl-humor-cat.jpg',
    why: 'FUNNY creatives replaced with the client-supplied set (E); clock goes with it',
    to: {
      file: 'pracuj-pl-funny-1.png',
      altPl:
        'Humorystyczna kreacja Pracuj.pl — „Posadziliśmy go w kącie, bo źle się zachowywał w pracy”',
      altEn:
        'Pracuj.pl humorous creative — sat in the corner for misbehaving at work',
    },
  },
  {
    kind: 'swap',
    slug: 'pracuj-pl',
    file: 'pracuj-pl-humor-pov.jpg',
    why: 'FUNNY creatives replaced with the client-supplied set (E); clock goes with it',
    to: {
      file: 'pracuj-pl-funny-2.png',
      altPl: 'Humorystyczna kreacja Pracuj.pl z bobrem w koszulce pracuj.pl',
      altEn: 'Pracuj.pl humorous creative with the beaver mascot',
    },
    add: [
      {
        file: 'pracuj-pl-funny-3.png',
        altPl:
          'Humorystyczna kreacja Pracuj.pl — kolega w pracy widziany przez „kraty” z widelca',
        altEn:
          'Pracuj.pl humorous creative — a coworker seen through fork "bars"',
      },
    ],
  },
  // —— asus —————————————————————————————————————————————————————————————————
  {
    kind: 'detach',
    slug: 'asus',
    file: 'asus-gallery-2.jpg',
    why: 'Three visible faces (A/E: remove remaining wizerunek graphics)',
  },
  {
    kind: 'swap',
    slug: 'asus',
    file: 'asus-gallery-4.jpg',
    why: 'Copywriter graphic cropped to the bare creative — post text dropped (E)',
    to: { file: 'asus-gallery-4-anon.jpg', copyAlt: true },
  },
  // —— imid-cmv —————————————————————————————————————————————————————————————
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-1.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive) — filenames match the pillar',
    to: {
      file: 'imid-cmv-edu-1.jpg',
      altPl: 'Kreacja kampanii CMV — „Czy CMV jest wirusem dziedzicznym?”',
      altEn: 'CMV campaign creative — is CMV hereditary?',
    },
  },
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-2.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive)',
    to: {
      file: 'imid-cmv-edu-2.jpg',
      altPl:
        'Kreacja kampanii CMV — „90% kobiet w wieku rozrodczym jest zarażona wirusem cytomegalii”',
      altEn:
        'CMV campaign creative — 90% of women of childbearing age carry cytomegalovirus',
    },
  },
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-3.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive)',
    to: {
      file: 'imid-cmv-walacyklowir-1.jpg',
      altPl:
        'Kreacja kampanii CMV — „Immunoglobuliny czy walacyklowir — jaką terapię wybrać przy leczeniu cytomegalii w ciąży?”',
      altEn:
        'CMV campaign creative — immunoglobulins or valacyclovir for treating CMV in pregnancy?',
    },
  },
  {
    kind: 'detach',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-4.jpg',
    why: 'Drive brought one creative for this pillar; the shorter section beats a substitute',
  },
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-5.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive)',
    to: {
      file: 'imid-cmv-zaufanie-1.jpg',
      altPl: 'Kreacja kampanii edukacyjnej o mądrym wyborze terapii CMV',
      altEn: 'CMV awareness creative on choosing the therapy wisely',
    },
  },
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-6.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive)',
    to: {
      file: 'imid-cmv-zaufanie-2.png',
      altPl:
        'Kreacja kampanii CMV z cytatem ginekologa i odesłaniem do artykułu na wyborcza.pl',
      altEn:
        'CMV campaign creative quoting a gynaecologist, pointing to a wyborcza.pl article',
    },
  },
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-7.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive)',
    to: {
      file: 'imid-cmv-dialog-1.png',
      altPl:
        'Kreacja zapraszająca do grupy na Facebooku „Cytomegalia — leczenie wirusa CMV w ciąży”',
      altEn:
        'Creative inviting to the Facebook group on treating CMV in pregnancy',
    },
  },
  {
    kind: 'swap',
    slug: 'imid-cmv',
    file: 'imid-cmv-gallery-8.jpg',
    why: 'Creatives swapped for the client-supplied set (Drive)',
    to: {
      file: 'imid-cmv-dialog-2.jpg',
      altPl: 'Baner badania klinicznego POL PRENATAL CMV',
      altEn: 'POL PRENATAL CMV clinical study banner',
    },
  },
]

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const LOCALES = ['pl', 'en'] as const

/** Unwrap an upload value that may be an id or a populated doc. */
// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
function idOf(v: any): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'object') return v.id ?? null
  return v
}

/**
 * Same shared-Blob-store collision handling as `apply-case-study-imagery.ts` —
 * dev and prod share one BLOB_READ_WRITE_TOKEN, so the dev upload creates the
 * blob the prod run then collides with. Exact-match clearing, never by prefix.
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
async function findOrCreateMedia(
  file: string,
  slug: string,
  altPl: string,
  altEn: string
) {
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
  let doc: Awaited<ReturnType<typeof create>>
  try {
    doc = await create()
  } catch (err) {
    if (!/already exists/i.test(String(err))) throw err
    const n = await clearBlobs(file)
    console.log(`  (cleared ${n} shared-store blob object(s) for ${file})`)
    doc = await create()
  }
  // EN alt is a separate localized write; `alt` is required, so a Polish-only
  // upload would be an accessibility regression on /en.
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'en',
    data: { alt: altEn },
  })
  return { doc, created: true }
}

/** PL + EN alts of an existing media row, for `copyAlt` swaps. */
async function altsOf(mediaId: number): Promise<{ pl: string; en: string }> {
  const out = { pl: '', en: '' }
  for (const locale of LOCALES) {
    const res = await payload.find({
      collection: 'media',
      where: { id: { equals: mediaId } },
      limit: 1,
      locale,
      fallbackLocale: false,
    })
    // biome-ignore lint/suspicious/noExplicitAny: doc shape
    out[locale] = ((res.docs[0] as any)?.alt as string) ?? ''
  }
  if (!out.en) out.en = out.pl
  return out
}

/** Fatal-on-ambiguity filename -> media doc resolution. */
async function resolveTarget(slug: string, file: string) {
  const target = await payload.find({
    collection: 'media',
    where: { filename: { equals: file } },
    limit: 5,
  })
  if (target.totalDocs > 1) {
    throw new Error(
      `${file} matches ${target.totalDocs} media documents — refusing to guess`
    )
  }
  const doc = target.docs[0]
  if (!doc) {
    console.log(`! ${slug}: no media named ${file} — skipping`)
    return null
  }
  return doc
}

let changes = 0
let uploads = 0
const detached: { slug: string; mediaId: number; file: string }[] = []
const touchedSlugs = new Set<string>()
/** New uploads this run, for the alts.en.json bookkeeping below. */
const uploaded: { file: string; altPl: string; altEn: string }[] = []

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

  // —— whole-pillar removal, matched per locale by the pillar's own tag ——————
  if (op.kind === 'pillar') {
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
      const tag = op.tag[locale]
      // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
      const idx = (doc?.approach ?? []).findIndex((p: any) => p.tag === tag)
      if (idx === -1) {
        console.log(`  = ${op.slug} [${locale}]: pillar ${tag} already gone`)
        continue
      }
      changes++
      touchedSlugs.add(op.slug)
      // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
      const pillar = doc.approach[idx] as any
      for (const m of pillar.media ?? []) {
        const id = idOf(m)
        if (id !== null && !detached.some((d) => d.mediaId === id)) {
          detached.push({ slug: op.slug, mediaId: id, file: `(pillar ${tag})` })
        }
      }
      console.log(
        `  ${APPLY ? '~' : 'would'} ${op.slug} [${locale}]: remove pillar ${tag} ` +
          `(${(pillar.media ?? []).length} media detached with it)`
      )
      if (APPLY) {
        const approach = doc.approach
          .filter((_: unknown, i: number) => i !== idx)
          // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
          .map((p: any) => ({
            ...p,
            media: (p.media ?? [])
              .map(idOf)
              .filter((v: number | null) => v !== null),
          }))
        await payload.update({
          collection: 'case-studies',
          id: doc.id,
          locale,
          // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
          data: { approach } as any,
        })
      }
    }
    continue
  }

  const targetDoc = await resolveTarget(op.slug, op.file)
  if (!targetDoc) continue
  const mediaId = targetDoc.id as number

  // Resolve replacements (and any appended files) before touching locales, so
  // both locales reference the same media rows.
  let newId: number | null = null
  const addIds: number[] = []
  if (op.kind === 'swap' || op.kind === 'cover') {
    const alts =
      op.kind === 'swap' && op.to.copyAlt
        ? await altsOf(mediaId)
        : { pl: op.to.altPl as string, en: op.to.altEn as string }
    if (!APPLY) {
      const probe = await payload.find({
        collection: 'media',
        where: { filename: { equals: op.to.file } },
        limit: 1,
      })
      newId = probe.docs[0] ? (probe.docs[0].id as number) : null
    } else {
      const { doc, created } = await findOrCreateMedia(
        op.to.file,
        op.slug,
        alts.pl,
        alts.en
      )
      newId = doc.id as number
      if (created) {
        uploads++
        uploaded.push({ file: op.to.file, altPl: alts.pl, altEn: alts.en })
        console.log(`  + uploaded ${op.to.file} -> media ${newId}`)
      }
    }
  }
  if (op.kind === 'swap' && op.add) {
    for (const extra of op.add) {
      if (!APPLY) {
        const probe = await payload.find({
          collection: 'media',
          where: { filename: { equals: extra.file } },
          limit: 1,
        })
        if (probe.docs[0]) addIds.push(probe.docs[0].id as number)
      } else {
        const { doc, created } = await findOrCreateMedia(
          extra.file,
          op.slug,
          extra.altPl,
          extra.altEn
        )
        addIds.push(doc.id as number)
        if (created) {
          uploads++
          uploaded.push(extra)
          console.log(`  + uploaded ${extra.file} -> media ${doc.id}`)
        }
      }
    }
  }

  // —— cover: unlocalized, one write, always a swap ——————————————————————————
  if (op.kind === 'cover') {
    if (idOf(base.cover) !== mediaId) {
      console.log(`  = ${op.slug} [cover]: ${op.file} already replaced`)
    } else {
      changes++
      touchedSlugs.add(op.slug)
      const verb = newId === null ? `upload ${op.to.file}` : String(newId)
      console.log(
        `  ${APPLY ? '~' : 'would'} ${op.slug} [cover]: ${op.file} -> ${verb}`
      )
      if (APPLY) {
        if (newId === null) {
          throw new Error(
            `${op.slug}: replacement ${op.to.file} has no media id — aborting rather than blanking the cover`
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

  // —— pillar-media detach / swap, per locale, matched by id —————————————————
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
        // Replace in place so the creative keeps its position in the row, then
        // append any additional files right after it.
        if (newId !== null && !next.includes(newId)) next.push(newId)
        for (const extra of addIds) {
          if (!next.includes(extra)) next.push(extra)
        }
      }
      return { ...pillar, media: next }
    })

    if (!touched) {
      console.log(`  = ${op.slug} [${locale}]: ${op.file} already gone`)
      continue
    }
    changes++
    touchedSlugs.add(op.slug)
    let verb = '(detach only)'
    if (op.kind === 'swap') {
      verb = newId === null ? `-> upload ${op.to.file}` : `-> ${newId}`
      if (op.add?.length) verb += ` +${op.add.length} appended`
    }
    console.log(
      `  ${APPLY ? '~' : 'would'} ${op.slug} [${locale}]: detach ${mediaId} (${op.file}) ${verb}`
    )
    if (APPLY) {
      if (op.kind === 'swap' && newId === null) {
        throw new Error(
          `${op.slug}: replacement ${op.to.file} has no media id — aborting rather than dropping the creative`
        )
      }
      await payload.update({
        collection: 'case-studies',
        id: doc.id,
        locale,
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
 * Same ownership guard as `apply-case-study-imagery.ts`: `alts.en.json` is
 * keyed by media id and tracks PRODUCTION, so entries are only appended when
 * the id is free — an id already naming a different file proves this database
 * is not the one the file describes. The English alt still reaches the
 * database directly on upload either way.
 */
if (APPLY && uploaded.length > 0) {
  const { readFile, writeFile } = await import('node:fs/promises')
  const ALTS_EN = 'content/media/alts.en.json'
  const raw = await readFile(ALTS_EN, 'utf8')
  // biome-ignore lint/suspicious/noExplicitAny: on-disk entry shape
  const entries = JSON.parse(raw) as any[]
  const byId = new Map(entries.map((e) => [e.id, e]))
  let added = 0
  let foreign = 0
  for (const u of uploaded) {
    const probe = await payload.find({
      collection: 'media',
      where: { filename: { equals: u.file } },
      limit: 1,
    })
    const id = probe.docs[0]?.id
    if (id === undefined) continue
    const clash = byId.get(id)
    if (clash) {
      if (clash.filename !== u.file) foreign++
      continue
    }
    entries.push({ id, filename: u.file, source: u.altPl, alt: u.altEn })
    added++
  }
  if (foreign > 0) {
    console.log(
      `\n! ${ALTS_EN} left untouched for ${foreign} upload(s): those ids name ` +
        'different files in this database (the file tracks production). ' +
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
 * Same contract as `apply-case-study-imagery.ts`: the collection's
 * `afterChange` revalidation cannot fire from a script (no Next request
 * scope), so the cache is expired here — or the exact command is printed, and
 * a failed revalidation exits non-zero rather than reading as a green run.
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
    if (!res.ok) process.exit(1)
  }
}

process.exit(0)
