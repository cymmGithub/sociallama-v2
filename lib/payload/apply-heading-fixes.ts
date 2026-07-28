/**
 * Applies the approved editorial fixes from `heading-review.md` — run with
 * `bun run payload:apply:heading-fixes` (dry run) and again with `--apply` to
 * write. Add `--prod` to target the production database.
 *
 * Phase 7 of repair-blog-post-formatting. Every transformation was proposed in
 * the review document and approved. The only authored copy is the eight
 * shortened labels in OVERSIZED, spelled out below so they are reviewable in
 * the diff rather than buried in a database.
 *
 * Per post, in one pass and one write:
 *
 *   1. Bold-paragraph pseudo-headings become real headings.
 *   2. The intro heading, when it restates the excerpt the page header already
 *      renders. A restatement is deleted outright; intro prose marked up as a
 *      heading keeps whatever the excerpt does not already say and becomes a
 *      paragraph; a genuine short label is left alone.
 *   3. Headings carrying a URL are image credits, and become paragraphs.
 *   4. Headings too long to be labels, one reading each.
 *   5. The whole tree is re-levelled to start at `h2` and skip nothing.
 *
 * The order of 1 and 2 is load-bearing: on six posts the intro label was
 * itself a bold paragraph, so checking the intro first found no heading at all
 * and only a second run would catch what promotion had just created.
 *
 * Step 5 is what makes step 2 safe. Several posts carry exactly one `h2` — the
 * bloated intro one — with every real section beneath it at `h3`. Removing
 * that heading without re-levelling would leave a post with no `h2` at all,
 * which is worse than where it started. Doing both in the same pass is why
 * this is one script and not a sequence of them.
 *
 * Idempotent: a repaired post has no excerpt-duplicating heading, no bold
 * pseudo-heading and no gap in its levels, so a second run matches nothing.
 */

import {
  classifyIntroHeading,
  completeExcerpt,
  duplicatedPrefixLength,
  duplicatesExcerpt,
  headingLevel,
  headingText,
  isBoldPseudoHeading,
  type LexicalNode,
  nodeText,
  normalizeHeadingLevels,
  promoteToHeading,
  stripDuplicatedPrefix,
  stripLeadingHeadings,
  trimBlockPrefix,
  unwrapLabelList,
  walkNodes,
} from '@/lib/payload/post-formatting-rules'

const APPLY = process.argv.includes('--apply')

/**
 * Headings too long to be labels, resolved one at a time because each needs a
 * reading. `rewrite: null` means the text was never a heading at all and is
 * demoted to a paragraph instead of being shortened.
 *
 * The first three came from section 4 of the review document. The rest only
 * became visible after the intro and re-level passes ran — they sat inside
 * posts whose *first* heading was the reported one, or were `h4`/`h6` at the
 * time the document was generated.
 */
const OVERSIZED: { slug: string; match: string; rewrite: string | null }[] = [
  {
    slug: 'trendy-social-media-2021',
    match: 'Nowość social media 2021',
    rewrite: 'Większa monetyzacja i szybsza dystrybucja contentu',
  },
  {
    slug: 'jak-przygotowac-swiateczna-kampanie-marketingowa-w-social-mediach',
    match: 'Świąteczna kampania marketingowa w mediach społecznościowych',
    rewrite: 'Świąteczna kampania – docieraj do zainteresowanych odbiorców',
  },
  {
    // A 591-character h4 about Canva — prose, never a heading.
    slug: 'aktualne-wymiary-grafik-na-facebooku',
    match: 'Warto pamiętać, że przygotowując grafiki w aktualnych wymiarach',
    rewrite: null,
  },
  {
    // Two questions crammed into one heading; the second carries the section.
    slug: 'pinterest-dla-e-commerce',
    match: 'Jak zmienia się portal Pineterest?',
    rewrite: 'Dlaczego Pinterest to dobre miejsce dla e-commerce?',
  },
  {
    // Question plus an imperative — the question is the label.
    slug: 'jak-sprzedawac-w-social-mediach-podczas-black-friday',
    match: 'Kiedy ruszyć z kampanią na Black Friday? Rozplanuj',
    rewrite: 'Kiedy ruszyć z kampanią na Black Friday?',
  },
  {
    slug: 'employee-advocacy-jak-mowic-o-pracy-po-swojemu-i-dlaczego-warto',
    match: 'Coraz częściej słyszy się o employee advocacy',
    rewrite: 'Czym jest employee advocacy?',
  },
  {
    // A genuine FAQ question, just written long.
    slug: 'dlaczego-moj-instagram-nie-jest-indeksowany-przez-google',
    match: '🔒Czy moje prywatne lub osobiste konto',
    rewrite: '🔒Czy prywatne konto będzie widoczne w Google?',
  },
  {
    // Intro prose marked up as the opening heading; a real heading follows it.
    slug: 'jak-dostosowac-profil-do-nowego-formatu-zdjec-na-instagramie',
    match: 'Obecnie platforma wprowadziła nowy format',
    rewrite: null,
  },
]

/**
 * Sections for the seven legacy posts that had no `h2` but enough material to
 * carry one, approved 2026-07-28. Eleven of these labels already existed in
 * the prose and are only lifted out of it (`cut`); the rest name paragraphs
 * that are already on the page. No new prose is written anywhere.
 *
 * The ten shorter posts — 37 to 213 words, mostly 2017 news about features
 * that have since been discontinued — are deliberately left alone. Reaching
 * three sections there would mean inventing content about dead products, and
 * a table of contents over four paragraphs reads worse, not better.
 *
 * `cut` splits a label off the front of its paragraph; without it the heading
 * is inserted before (or after) the anchor block. `at` matches the start of
 * the target's text.
 */
interface SectionEdit {
  slug: string
  at: string
  heading: string
  cut?: string
  where?: 'after'
  tag?: string
}

const SECTIONS: SectionEdit[] = [
  // Podsumowanie konferencji F8 — five labels already inline as "Grupy – …".
  {
    slug: 'najwazniejsze-nowosci-na-facebooku-messengerze-i-instagramie-zapowiedziane-na-konferencji-f8',
    at: 'Założyciel Facebooka postanowił wypowiedzieć wojnę Tinderowi',
    heading: 'Facebook Dating',
  },
  {
    slug: 'najwazniejsze-nowosci-na-facebooku-messengerze-i-instagramie-zapowiedziane-na-konferencji-f8',
    at: 'Eliminowanie fake newsów',
    heading: 'Eliminowanie fake newsów',
    cut: 'Eliminowanie fake newsów – ',
  },
  {
    slug: 'najwazniejsze-nowosci-na-facebooku-messengerze-i-instagramie-zapowiedziane-na-konferencji-f8',
    at: 'Grupy –',
    heading: 'Grupy',
    cut: 'Grupy – ',
  },
  {
    slug: 'najwazniejsze-nowosci-na-facebooku-messengerze-i-instagramie-zapowiedziane-na-konferencji-f8',
    at: 'Instagram –',
    heading: 'Instagram',
    cut: 'Instagram – ',
  },
  {
    slug: 'najwazniejsze-nowosci-na-facebooku-messengerze-i-instagramie-zapowiedziane-na-konferencji-f8',
    at: 'Messenger –',
    heading: 'Messenger',
    cut: 'Messenger – ',
  },
  {
    slug: 'najwazniejsze-nowosci-na-facebooku-messengerze-i-instagramie-zapowiedziane-na-konferencji-f8',
    at: 'Ostatnia, ale nie mniej interesująca informacja',
    heading: 'Oculus GO – Facebook w VR',
  },

  // Wizerunek sportowca — one heading per section, not per brand: the five
  // brand labels are a list inside the first section.
  {
    slug: 'wizeruneksportowca',
    at: 'Lewandowski wystąpił już w reklamach takich marek',
    heading: 'W reklamach jakich marek wystąpił Lewandowski?',
  },
  {
    slug: 'wizeruneksportowca',
    at: 'Jaka jest na to reakcja odbiorców?',
    heading: 'Jak reagują odbiorcy?',
  },
  {
    slug: 'wizeruneksportowca',
    at: 'Co na to eksperci?',
    heading: 'Co na to eksperci?',
    cut: 'Co na to eksperci? ',
  },
  {
    slug: 'wizeruneksportowca',
    at: 'Z zupełnie innym przypadkiem mamy do czynienia',
    heading: 'Wizerunek bez zgody – przypadek Platformy Obywatelskiej',
  },

  // Rebranding Instagrama.
  {
    slug: 'logo-wizerunek-firmy',
    at: 'Ian Spalter, dyrektor artystyczny Instagrama',
    heading: 'Dlaczego Instagram zmienił logo?',
  },
  {
    slug: 'logo-wizerunek-firmy',
    at: 'Ian Spalter, dyrektor artystyczny Instagrama',
    heading: 'Jak wyglądała nowa identyfikacja?',
    where: 'after',
  },
  {
    slug: 'logo-wizerunek-firmy',
    at: 'Gdybyśmy mieli ocenić już teraz',
    heading: 'Czy rebranding się udał?',
  },

  // Polecenia zamiast recenzji. "Rewolucja na Facebooku?" is deliberately NOT
  // promoted: it is the post's entire excerpt, so a heading saying the same
  // thing puts it on screen twice. The header carries it as the lead and the
  // lead-paragraph step drops the body's copy; the three headings below are
  // enough for the rail.
  {
    slug: 'polecenia-zamiast-recenzji-duza-zmiana-na-facebooku',
    at: 'Faktycznie wchodząc na fanpage danego miejsca',
    heading: 'Jak działają polecenia?',
  },
  {
    slug: 'polecenia-zamiast-recenzji-duza-zmiana-na-facebooku',
    at: 'Tak wydarzyło się w przypadku naszej grupy Good One',
    heading: 'Kiedy system zawodzi – polecenie z Pakistanu',
  },
  {
    slug: 'polecenia-zamiast-recenzji-duza-zmiana-na-facebooku',
    at: '✓ Zmienić szablon i usunąć kartę z recenzjami',
    heading: 'Co możesz z tym zrobić?',
  },

  // Nowy regulamin Facebooka.
  {
    slug: 'nowy-regulamin-facebooka-cenzura-czy-rozwoj-portalu',
    at: 'Rzeczywiście znalazły się wśród nich takie słowa',
    heading: 'Jakie słowa trafiły na listę?',
  },
  {
    slug: 'nowy-regulamin-facebooka-cenzura-czy-rozwoj-portalu',
    at: 'Część istotnych punktów regulaminu pozostaje bez zmian',
    heading: 'Co pozostało bez zmian?',
  },
  {
    slug: 'nowy-regulamin-facebooka-cenzura-czy-rozwoj-portalu',
    at: 'Nowy regulamin podkreśla jednak, że algorytm',
    heading: 'Algorytm ma czytać kontekst',
  },
  {
    slug: 'nowy-regulamin-facebooka-cenzura-czy-rozwoj-portalu',
    at: 'Dokument podkreśla także szczególną ochronę nieletnich',
    heading: 'Ochrona nieletnich i walka z fake newsami',
  },

  // Social media a polski futbol — a narrative, so the headings mark its beats.
  {
    slug: 'social-media-futbol',
    at: 'Od kilku lat zaczęły pojawiać się zakulisowe materiały',
    heading: 'Kto stoi za komunikacją polskiego futbolu?',
  },
  {
    slug: 'social-media-futbol',
    at: 'Komunikacja w internecie stała się czymś oczywistym',
    heading: 'Kibic dostaje informacje z pierwszej ręki',
  },
  {
    slug: 'social-media-futbol',
    at: 'Grzegorze Krychowiak, obecnie zawodnik francuskiego PSG',
    heading: 'Krychowiak kontra Boniek – riposty, które budują wizerunek',
  },
  {
    slug: 'social-media-futbol',
    at: 'W modowe zamieszanie z Krychowiakiem zaangażował się',
    heading: 'Dystans do siebie jako strategia',
  },

  // Moderacja — the LAMA acronym becomes the table of contents.
  {
    slug: 'nie-boj-sie-odpisac-jak-z-powodzeniem-moderowac-fanpage',
    at: 'Impreza. Ktoś właśnie, ze szklanką w dłoni',
    heading: 'Dlaczego warto odpisywać?',
  },
  {
    slug: 'nie-boj-sie-odpisac-jak-z-powodzeniem-moderowac-fanpage',
    at: 'Nasze socialowe stadko lubi',
    heading: 'Moderacja w stylu LAMA',
  },
  {
    slug: 'nie-boj-sie-odpisac-jak-z-powodzeniem-moderowac-fanpage',
    at: 'L – long-term relationship',
    heading: 'L – long-term relationship',
    cut: 'L – long-term relationship – ',
    tag: 'h3',
  },
  {
    slug: 'nie-boj-sie-odpisac-jak-z-powodzeniem-moderowac-fanpage',
    at: 'A – awareness',
    heading: 'A – awareness',
    cut: 'A – awareness – ',
    tag: 'h3',
  },
  {
    slug: 'nie-boj-sie-odpisac-jak-z-powodzeniem-moderowac-fanpage',
    at: 'M – maybe?',
    heading: 'M – maybe? Eksperymentujmy',
    cut: 'M – maybe? …eksperymentujmy! ',
    tag: 'h3',
  },
  {
    slug: 'nie-boj-sie-odpisac-jak-z-powodzeniem-moderowac-fanpage',
    at: 'A – award',
    heading: 'A – award',
    cut: 'A – award – ',
    tag: 'h3',
  },
]

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:apply:heading-fixes --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(
  `${APPLY ? 'Applying to' : 'Dry run against'}: ${dbHost}\nSource: heading-review.md (approved)\n`
)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

const posts = await payload.find({
  collection: 'posts',
  limit: 0,
  pagination: false,
  depth: 0,
})

/** Replace a node's entire text with one plain text child. */
function setText(node: LexicalNode, text: string): void {
  node.children = [{ type: 'text', text, format: 0 } as LexicalNode]
}

/** A fresh heading node carrying one line of plain text. */
function headingNode(text: string, tag: string): LexicalNode {
  return {
    type: 'heading',
    tag,
    format: '',
    children: [{ type: 'text', text, format: 0 } as LexicalNode],
  }
}

/** Turn a heading node into an ordinary paragraph, keeping its children. */
function demoteToParagraph(node: LexicalNode): void {
  node.type = 'paragraph'
  node.format = ''
  // `delete` rather than `= undefined`: a serialized paragraph has no `tag`
  // key at all, and writing one back as undefined would put `"tag": null` in
  // the JSON column.
  delete (node as { tag?: string }).tag
}

let changedPosts = 0
let intros = 0
let promoted = 0
let unwrapped = 0
let excerpts = 0
let leadsDeleted = 0
let leadsTrimmed = 0
let sections = 0
let relevelled = 0
let shortened = 0
let credits = 0
let skipped = 0

for (const post of posts.docs) {
  const original = post.content as { root?: LexicalNode } | null
  if (!original?.root) {
    continue
  }
  const content = JSON.parse(JSON.stringify(original)) as { root: LexicalNode }
  const root = content.root
  const rawExcerpt = typeof post.excerpt === 'string' ? post.excerpt : ''
  // Finish the sentence the scrape cut off, before anything reads the excerpt.
  // It stopped mid-sentence on 47 posts; completing it from the body puts the
  // whole intro in the header where it reads as written, and leaves the body's
  // copy entirely inside the excerpt so the lead-paragraph step can drop the
  // block rather than leave half a thought behind.
  const bodyOpening = (root.children ?? [])
    .slice(0, 8)
    .map((node) => nodeText(node))
    .join(' ')
  let excerpt = completeExcerpt(rawExcerpt, bodyOpening)
  const notes: string[] = []

  // --- 1. Bold pseudo-headings ---------------------------------------------
  // Before the intro step, not after: on 6 posts the intro label was itself a
  // bold paragraph, so checking the intro first found no heading at all and
  // only the *next* run would catch the one promotion had just created. That
  // is what made an earlier version non-idempotent.
  const hasRealHeading = (root.children ?? []).some(
    (node) => headingLevel(node) !== null
  )
  let promotedHere = 0
  // Root-level blocks only. A bold run inside a list item is emphasis on a
  // step, not a section label — promoting those put `h2`s inside `<li>`s and
  // left two posts with headings that existed only in nested positions, so
  // the body had no top-level `h2` at all.
  for (const node of root.children ?? []) {
    if (!isBoldPseudoHeading(node)) {
      continue
    }
    // With no real heading anywhere these labels are the top level; otherwise
    // they sit beneath the headings that already exist. The re-level step
    // below fixes up either way, so this only has to get the ordering right.
    promoteToHeading(node, hasRealHeading ? 'h3' : 'h2')
    promotedHere++
  }
  if (promotedHere > 0) {
    promoted += promotedHere
    notes.push(`${promotedHere} bold paragraph(s) → headings`)
  }

  // Single-item lists used as section labels. One level below the labels
  // above where those exist — in `lejek-marketingowy` the bold labels are the
  // sections and these are the numbered points inside them — and the top
  // level where the post has nothing else, which is how two posts with no
  // headings at all get their sections back.
  const labelTag = hasRealHeading || promotedHere > 0 ? 'h3' : 'h2'
  let unwrappedHere = 0
  root.children = (root.children ?? []).map((node) => {
    const heading = unwrapLabelList(node, labelTag)
    if (!heading) {
      return node
    }
    unwrappedHere++
    return heading
  })
  if (unwrappedHere > 0) {
    unwrapped += unwrappedHere
    notes.push(`${unwrappedHere} single-item list(s) → headings`)
  }

  // --- 2. Intro heading -----------------------------------------------------
  const blocks = root.children ?? []
  const firstHeadingAt = blocks.findIndex((node) => headingLevel(node) !== null)
  const firstHeading = firstHeadingAt === -1 ? null : blocks[firstHeadingAt]

  if (firstHeading) {
    const text = headingText(firstHeading)
    if (duplicatesExcerpt(text, excerpt)) {
      const treatment = classifyIntroHeading(text, excerpt)
      if (treatment === 'restatement') {
        root.children = blocks.filter((_, i) => i !== firstHeadingAt)
        intros++
        notes.push(`intro heading deleted (restates the excerpt)`)
      } else if (treatment === 'extended') {
        const tail = stripDuplicatedPrefix(text, excerpt)
        if (tail === '') {
          root.children = blocks.filter((_, i) => i !== firstHeadingAt)
          notes.push('intro heading deleted (entirely inside the excerpt)')
        } else {
          demoteToParagraph(firstHeading)
          setText(firstHeading, tail)
          notes.push(
            `intro heading → paragraph, ${text.length - tail.length} duplicated chars dropped`
          )
        }
        intros++
      }
    }
  }

  // --- 3. Lead paragraph -----------------------------------------------------
  // The page header renders the excerpt as the lead, and on 38 posts the body
  // then opens by saying it again — verbatim on 20 of them. Same defect as the
  // intro heading, one node further down, so it takes the same cut: drop the
  // sentences the header already showed, delete the block if nothing is left.
  // `trimBlockPrefix` rather than a rewrite, so links and bold in the surviving
  // text are not flattened.
  const leadIndex = (root.children ?? []).findIndex(
    (node) => nodeText(node).trim() !== '' || headingLevel(node) !== null
  )
  const lead = leadIndex === -1 ? null : root.children?.[leadIndex]
  if (lead && lead.type === 'paragraph' && excerpt.trim() !== '') {
    const raw = nodeText(lead)
    const cut = duplicatedPrefixLength(raw.replace(/\s+/g, ' ').trim(), excerpt)
    if (cut > 0) {
      if (cut >= raw.trim().length) {
        root.children = (root.children ?? []).filter((_, i) => i !== leadIndex)
        leadsDeleted++
        notes.push('lead paragraph deleted (the header already renders it)')
      } else {
        trimBlockPrefix(lead, cut)
        leadsTrimmed++
        notes.push(`lead paragraph trimmed of ${cut} duplicated chars`)
      }
    }
  }

  // --- 4. Image credits ------------------------------------------------------
  // A heading carrying a URL is an image credit — `źródło: https://…` — which
  // WordPress marked up as a heading for the size. A rule rather than an
  // override, because a re-import would bring more of them.
  walkNodes(root, (node) => {
    if (headingLevel(node) === null) {
      return
    }
    if (!/https?:\/\/|www\./i.test(headingText(node))) {
      return
    }
    demoteToParagraph(node)
    credits++
    notes.push('image credit heading → paragraph')
  })

  // --- 5. Oversized headings -------------------------------------------------
  for (const override of OVERSIZED.filter((o) => o.slug === post.slug)) {
    let done = false
    // Already applied on an earlier run. Either the rewritten label is
    // present, or — for the demote case — the text now sits in a paragraph,
    // where no heading match can ever find it again.
    const alreadyDone = (root.children ?? []).some((node) => {
      if (override.rewrite !== null) {
        return headingText(node) === override.rewrite
      }
      return (
        headingLevel(node) === null &&
        headingText(node).startsWith(override.match)
      )
    })
    walkNodes(root, (node) => {
      if (done || alreadyDone || headingLevel(node) === null) {
        return
      }
      if (!headingText(node).startsWith(override.match)) {
        return
      }
      if (override.rewrite === null) {
        demoteToParagraph(node)
        notes.push('oversized heading → paragraph (it was prose)')
      } else {
        setText(node, override.rewrite)
        notes.push(`heading shortened to "${override.rewrite}"`)
      }
      shortened++
      done = true
    })
    if (!(done || alreadyDone)) {
      skipped++
      console.log(
        `! #${post.id} ${post.slug} — SKIPPED oversized-heading fix: no heading starting "${override.match.slice(0, 40)}…"`
      )
    }
  }

  // --- 5b. Approved sections for the legacy posts ----------------------------
  // After the lead-paragraph step, so the anchors match the text as it will
  // ship. Re-running is a no-op: a heading that already carries the approved
  // text means this edit has been applied.
  for (const edit of SECTIONS.filter((entry) => entry.slug === post.slug)) {
    const kids: LexicalNode[] = root.children ?? []
    const already = kids.some(
      (node) =>
        headingLevel(node) !== null && headingText(node) === edit.heading
    )
    if (already) {
      continue
    }
    const index = kids.findIndex((node) => nodeText(node).startsWith(edit.at))
    if (index === -1) {
      skipped++
      console.log(
        `! #${post.id} ${post.slug} — SKIPPED section "${edit.heading}": no block starting "${edit.at.slice(0, 40)}…"`
      )
      continue
    }
    const target = kids[index] as LexicalNode
    const tag = edit.tag ?? 'h2'

    if (edit.cut) {
      const raw = nodeText(target)
      if (!raw.startsWith(edit.cut)) {
        skipped++
        console.log(
          `! #${post.id} ${post.slug} — SKIPPED section "${edit.heading}": block does not open with the label`
        )
        continue
      }
      if (raw.trim().length === edit.cut.trim().length) {
        // The whole block was the label — it becomes the heading.
        promoteToHeading(target, tag)
        setText(target, edit.heading)
      } else {
        trimBlockPrefix(target, edit.cut.length)
        kids.splice(index, 0, headingNode(edit.heading, tag))
      }
    } else {
      kids.splice(
        edit.where === 'after' ? index + 1 : index,
        0,
        headingNode(edit.heading, tag)
      )
    }
    root.children = kids
    sections++
    notes.push(`section "${edit.heading}"`)
  }

  // --- 6. Re-level ----------------------------------------------------------
  const moved = normalizeHeadingLevels(root)
  if (moved > 0) {
    relevelled += moved
    notes.push(`${moved} heading(s) re-levelled`)
  }

  // --- 7. Excerpt ------------------------------------------------------------
  // Last, so it sees the final headings. The excerpts were scraped from each
  // body's opening with the headings left in, so seven of them begin with the
  // post's own section labels — one leads with five of them run together
  // before reaching a sentence. Those labels are genuine headings, so the
  // duplication is the excerpt's fault, not theirs. This is the only field
  // outside `content` the change writes.
  const headings: string[] = []
  walkNodes(root, (node) => {
    if (headingLevel(node) !== null) {
      headings.push(headingText(node))
    }
  })
  excerpt = stripLeadingHeadings(excerpt, headings)
  const excerptChanged =
    rawExcerpt.trim() !== '' && excerpt !== rawExcerpt.trim()
  if (excerptChanged) {
    excerpts++
    notes.push(`excerpt ${rawExcerpt.trim().length} → ${excerpt.length} chars`)
  }

  if (notes.length === 0) {
    continue
  }
  changedPosts++
  console.log(`+ #${post.id} ${post.slug} — ${notes.join('; ')}`)

  if (!APPLY) {
    continue
  }
  await payload.update({
    collection: 'posts',
    id: post.id,
    data: {
      content: content as never,
      ...(excerptChanged ? { excerpt } : {}),
    },
  })
  console.log('    → updated')
}

console.log(
  `\n${changedPosts} post(s) ${APPLY ? 'changed' : 'would change'}: ` +
    `${intros} intro heading(s), ${promoted} promoted, ${unwrapped} list label(s), ` +
    `${shortened} shortened, ${credits} image credit(s), ${relevelled} re-levelled, ` +
    `${excerpts} excerpt(s), ${leadsDeleted} lead para deleted, ${leadsTrimmed} trimmed, ` +
    `${sections} section(s)` +
    (skipped ? `, ${skipped} override(s) skipped (see above)` : '') +
    (APPLY ? '' : '. Re-run with --apply to write.')
)
process.exit(0)
