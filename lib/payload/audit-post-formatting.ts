/**
 * The blog's formatting verifier — run with `bun run
 * payload:audit:post-formatting`, add `--prod` to read the production
 * database and `--detail` for the per-post breakdown.
 *
 * It reads post bodies from Payload rather than from rendered HTML, which is
 * the whole point: it sees drafts, reports against the source of truth rather
 * than one deploy of it, and shares every predicate with
 * repair-post-formatting.ts via post-formatting-rules.ts — so the thing that
 * fixes and the thing that verifies cannot disagree about what a defect is
 * (repair-blog-post-formatting design D2).
 *
 * Two families are reported. The mechanical ones — justified nodes, spacer
 * paragraphs, word-space non-breaking spaces — are what the repair script
 * clears, and go to zero. The structural ones — oversized headings, headings
 * duplicating the excerpt, missing `h2`, `h3` before `h2`, bold-paragraph
 * pseudo-headings, `h4`+ usage — are editorial and go to zero by hand.
 *
 * Centred nodes are counted too, as a preservation baseline: they are
 * authored intent and the repair must leave the count unchanged.
 */

import { buildToc } from '@/lib/blog/toc'
import {
  classifySpacerParagraph,
  duplicatesExcerpt,
  excerptSimilarity,
  forEachTextBlock,
  headingLevel,
  headingText,
  isBoldPseudoHeading,
  isCentered,
  isJustified,
  type LexicalNode,
  MAX_HEADING_LENGTH,
  planBlockNbsp,
  walkNodes,
} from '@/lib/payload/post-formatting-rules'

const DETAIL = process.argv.includes('--detail')

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:audit:post-formatting --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`Auditing post formatting against: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

/** `app/(frontend)/[slug]/page.tsx` renders the rail only at three entries. */
const MIN_TOC_ENTRIES = 3

interface PostFindings {
  slug: string
  status: string
  justify: number
  spacers: number
  unclearSpacers: number
  wordSpaceNbsp: number
  paddingNbsp: number
  preservedNbsp: number
  centered: number
  longHeadings: { level: number; length: number; text: string }[]
  excerptHeading: { similarity: number; text: string } | null
  hasH2: boolean
  h3BeforeH2: boolean
  boldPseudoHeadings: string[]
  deepHeadings: { level: number; text: string }[]
  tocEntries: number
}

const payload = await getPayload({ config })

// No `_status` filter: a draft-only post is a row in `posts` like any other,
// and a defect in an unpublished draft is still a defect (spec: "Verifier
// sees unpublished content").
const posts = await payload.find({
  collection: 'posts',
  limit: 0,
  pagination: false,
  depth: 0,
})

const findings: PostFindings[] = []

for (const post of posts.docs) {
  const content = post.content as { root?: LexicalNode } | null
  const root = content?.root
  if (!root) {
    continue
  }

  const found: PostFindings = {
    slug: post.slug,
    status: post._status ?? 'published',
    justify: 0,
    spacers: 0,
    unclearSpacers: 0,
    wordSpaceNbsp: 0,
    paddingNbsp: 0,
    preservedNbsp: 0,
    centered: 0,
    longHeadings: [],
    excerptHeading: null,
    hasH2: false,
    h3BeforeH2: false,
    boldPseudoHeadings: [],
    deepHeadings: [],
    tocEntries: 0,
  }

  walkNodes(root, (node) => {
    if (isJustified(node)) {
      found.justify++
    }
    const verdict = classifySpacerParagraph(node)
    // Centring an empty paragraph centres nothing: one node in the corpus is
    // a spacer carrying a `center` format, and it leaves with the spacers.
    // The preservation baseline is centred nodes that carry content.
    if (isCentered(node) && verdict !== 'spacer') {
      found.centered++
    }
    if (verdict === 'spacer') {
      found.spacers++
    } else if (verdict === 'unclear') {
      found.unclearSpacers++
    }
    if (isBoldPseudoHeading(node)) {
      found.boldPseudoHeadings.push(headingText(node))
    }
  })

  // Non-breaking spaces are resolved a block at a time, so a gap straddling
  // two text nodes still reads as one. Spacer paragraphs are skipped: their
  // non-breaking spaces leave with the paragraph, and counting them here
  // would double-report the same defect.
  forEachTextBlock(root, (block) => {
    if (classifySpacerParagraph(block) === 'spacer') {
      return
    }
    const plan = planBlockNbsp(block)
    found.wordSpaceNbsp += plan.wordSpace
    found.paddingNbsp += plan.padding
    found.preservedNbsp += plan.preserved
  })

  let seenH2 = false
  for (const node of root.children ?? []) {
    const level = headingLevel(node)
    if (level === null) {
      continue
    }
    const text = headingText(node)
    if (level === 2) {
      seenH2 = true
      found.hasH2 = true
    }
    if (level === 3 && !seenH2) {
      found.h3BeforeH2 = true
    }
    if (level >= 4) {
      found.deepHeadings.push({ level, text })
    }
    if (text.length > MAX_HEADING_LENGTH) {
      found.longHeadings.push({ level, length: text.length, text })
    }
    if (!found.excerptHeading) {
      const excerpt = typeof post.excerpt === 'string' ? post.excerpt : ''
      if (duplicatesExcerpt(text, excerpt)) {
        found.excerptHeading = {
          similarity: excerptSimilarity(text, excerpt),
          text,
        }
      }
    }
  }

  found.tocEntries = buildToc(
    post.content as Parameters<typeof buildToc>[0]
  ).length

  findings.push(found)
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function nodesAndPosts(pick: (found: PostFindings) => number): string {
  const hit = findings.filter((found) => pick(found) > 0)
  const total = hit.reduce((sum, found) => sum + pick(found), 0)
  return `${total} in ${hit.length} post(s)`
}

function detail(
  label: string,
  pick: (found: PostFindings) => number,
  describe?: (found: PostFindings) => string
): void {
  if (!DETAIL) {
    return
  }
  const hit = findings
    .filter((found) => pick(found) > 0)
    .sort((a, b) => pick(b) - pick(a))
  if (hit.length === 0) {
    return
  }
  console.log(`\n${label}`)
  for (const found of hit) {
    console.log(
      `  ${String(pick(found)).padStart(4)}  ${found.slug}${describe ? ` — ${describe(found)}` : ''}`
    )
  }
}

const withoutH2 = findings.filter((found) => !found.hasH2)
const h3First = findings.filter((found) => found.h3BeforeH2)
const withToc = findings.filter((found) => found.tocEntries >= MIN_TOC_ENTRIES)
const excerptHeadings = findings.filter((found) => found.excerptHeading)

console.log(`${findings.length} post(s) read.\n`)
console.log('MECHANICAL (repair-post-formatting clears these)')
console.log(`  justified nodes           ${nodesAndPosts((f) => f.justify)}`)
console.log(`  spacer paragraphs         ${nodesAndPosts((f) => f.spacers)}`)
console.log(
  `  word-space nbsp           ${nodesAndPosts((f) => f.wordSpaceNbsp)}`
)
console.log(
  `  padding nbsp              ${nodesAndPosts((f) => f.paddingNbsp)}`
)
console.log(
  `  blank-but-unclear paras   ${nodesAndPosts((f) => f.unclearSpacers)} (skipped, never removed)`
)
console.log(
  `  nbsp deliberately kept    ${nodesAndPosts((f) => f.preservedNbsp)} — PRESERVE, baseline only`
)
console.log(
  `  centred nodes             ${nodesAndPosts((f) => f.centered)} — PRESERVE, baseline only`
)

console.log('\nSTRUCTURAL (editorial)')
console.log(
  `  headings > ${MAX_HEADING_LENGTH} chars       ${nodesAndPosts((f) => f.longHeadings.length)}`
)
console.log(
  `  headings duplicating the excerpt   ${excerptHeadings.length} post(s)`
)
console.log(`  posts with no h2          ${withoutH2.length}`)
console.log(`  posts opening at h3       ${h3First.length}`)
console.log(
  `  bold pseudo-headings      ${nodesAndPosts((f) => f.boldPseudoHeadings.length)}`
)
console.log(
  `  h4-h6 headings            ${nodesAndPosts((f) => f.deepHeadings.length)}`
)
console.log(
  `  table of contents renders ${withToc.length} / ${findings.length} post(s)`
)

detail('justified nodes', (f) => f.justify)
detail('spacer paragraphs', (f) => f.spacers)
detail('word-space non-breaking spaces', (f) => f.wordSpaceNbsp)
detail('padding non-breaking spaces', (f) => f.paddingNbsp)
detail('blank-but-unclear paragraphs (skipped)', (f) => f.unclearSpacers)
detail('non-breaking spaces deliberately kept', (f) => f.preservedNbsp)
detail('centred nodes (preserve)', (f) => f.centered)
detail(
  `headings over ${MAX_HEADING_LENGTH} characters`,
  (f) => f.longHeadings.length,
  (f) =>
    f.longHeadings
      .map((h) => `h${h.level} ${h.length} chars: ${h.text.slice(0, 70)}…`)
      .join('; ')
)
detail(
  'bold pseudo-headings',
  (f) => f.boldPseudoHeadings.length,
  (f) => f.boldPseudoHeadings.slice(0, 3).join(' | ')
)
detail(
  'h4-h6 headings',
  (f) => f.deepHeadings.length,
  (f) =>
    f.deepHeadings.map((h) => `h${h.level} ${h.text.slice(0, 40)}`).join('; ')
)

if (DETAIL) {
  if (excerptHeadings.length > 0) {
    console.log('\nheadings duplicating the excerpt')
    for (const found of excerptHeadings) {
      const heading = found.excerptHeading
      if (!heading) {
        continue
      }
      console.log(
        `  ${heading.similarity.toFixed(2)}  ${found.slug} (${heading.text.length} chars) — ${heading.text.slice(0, 70)}…`
      )
    }
  }
  if (withoutH2.length > 0) {
    console.log('\nposts with no h2')
    for (const found of withoutH2) {
      console.log(
        `  ${found.slug} — ${found.boldPseudoHeadings.length} bold pseudo-heading(s), toc ${found.tocEntries}`
      )
    }
  }
  if (h3First.length > 0) {
    console.log('\nposts opening at h3')
    for (const found of h3First) {
      console.log(`  ${found.slug}`)
    }
  }
  const drafts = findings.filter((found) => found.status !== 'published')
  if (drafts.length > 0) {
    console.log('\ndraft posts included in the counts above')
    for (const found of drafts) {
      console.log(`  ${found.slug}`)
    }
  }
}

console.log(DETAIL ? '' : '\nRe-run with --detail for the per-post breakdown.')
process.exit(0)
