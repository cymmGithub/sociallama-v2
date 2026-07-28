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
  duplicatesExcerpt,
  headingLevel,
  headingText,
  isBoldPseudoHeading,
  type LexicalNode,
  normalizeHeadingLevels,
  promoteToHeading,
  stripDuplicatedPrefix,
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
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt : ''
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

  // --- 3. Image credits ------------------------------------------------------
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

  // --- 4. Oversized headings -------------------------------------------------
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

  // --- 4. Re-level ----------------------------------------------------------
  const moved = normalizeHeadingLevels(root)
  if (moved > 0) {
    relevelled += moved
    notes.push(`${moved} heading(s) re-levelled`)
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
    data: { content: content as never },
  })
  console.log('    → updated')
}

console.log(
  `\n${changedPosts} post(s) ${APPLY ? 'changed' : 'would change'}: ` +
    `${intros} intro heading(s), ${promoted} promoted, ` +
    `${shortened} shortened, ${credits} image credit(s), ${relevelled} re-levelled` +
    (skipped ? `, ${skipped} override(s) skipped (see above)` : '') +
    (APPLY ? '' : '. Re-run with --apply to write.')
)
process.exit(0)
