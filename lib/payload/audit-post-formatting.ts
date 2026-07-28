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
  nodeText,
  planBlockNbsp,
  walkNodes,
} from '@/lib/payload/post-formatting-rules'

const DETAIL = process.argv.includes('--detail')
const REVIEW = process.argv.includes('--review')
const REVIEW_PATH =
  'openspec/changes/repair-blog-post-formatting/heading-review.md'

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

/** `app/(frontend)/[slug]/post-article.tsx` renders the rail only at three entries. */
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
  /** EN only: non-breaking spaces carried over from the Polish source. */
  inheritedNbsp: number
  centered: number
  longHeadings: { level: number; length: number; text: string }[]
  excerptHeading: { similarity: number; text: string } | null
  hasH2: boolean
  h3BeforeH2: boolean
  boldPseudoHeadings: string[]
  deepHeadings: { level: number; text: string }[]
  tocEntries: number
  excerpt: string
  title: string
  /** The blocks right after the first heading — what an "extended" fix promotes. */
  afterFirstHeading: string[]
  /** Section labels in reading order, real and fake, for the review document. */
  outline: {
    index: number
    kind: 'heading' | 'bold'
    level: number | null
    text: string
  }[]
}

/**
 * How an excerpt-duplicating heading should be resolved, proposed from the
 * text alone. A sorting heuristic and nothing more — one genuine heading in
 * the corpus scores 0.25 similarity and a threshold would misfile it, so the
 * review document is where a human confirms or overrides (design D7).
 */
function proposeTreatment(heading: string, excerpt: string): string {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const h = normalize(heading)
  const e = normalize(excerpt)

  // The excerpts were auto-generated from each post's opening, so almost every
  // one of these headings is a prefix of its excerpt. That alone proves
  // nothing: a genuine short section label sitting at the top of the body is a
  // prefix too. What separates them is how much of the excerpt the heading
  // accounts for.
  // Order matters: an exact match satisfies `includes` in both directions, so
  // the restatement test has to come first or every one of them reads as an
  // extension.
  if (e.startsWith(h) && h.length / e.length > 0.8) {
    return 'restatement — the heading is essentially the whole excerpt. Delete the block'
  }
  if (h.includes(e) || h.length > MAX_HEADING_LENGTH) {
    return 'extended — intro prose marked up as a heading. Drop the part the excerpt already says, demote the rest to a paragraph, and promote the section label that follows'
  }
  if (e.startsWith(h)) {
    return 'likely genuine — a short section label that merely opens the body, which is why the auto-generated excerpt starts with it. Keep, and check it reads as a label'
  }
  return 'genuine but overlong — shorten to a label'
}

const payload = await getPayload({ config })

/**
 * Which locale to audit. Without one Payload reads the default, so English
 * content was never examined at all and passed the audit vacuously — the
 * `blog-content-integrity` guarantee was satisfied in name only (design D10).
 *
 * `fallbackLocale: false` matters as much as the locale: with the config's
 * global fallback, an untranslated post would be audited as its Polish self
 * and counted as clean English.
 */
const LOCALE = process.argv.includes('--en') ? 'en' : 'pl'

// No `_status` filter: a draft-only post is a row in `posts` like any other,
// and a defect in an unpublished draft is still a defect (spec: "Verifier
// sees unpublished content").
const posts = await payload.find({
  collection: 'posts',
  limit: 0,
  pagination: false,
  depth: 0,
  locale: LOCALE,
  fallbackLocale: false,
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
    inheritedNbsp: 0,
    centered: 0,
    longHeadings: [],
    excerptHeading: null,
    hasH2: false,
    h3BeforeH2: false,
    boldPseudoHeadings: [],
    deepHeadings: [],
    tocEntries: 0,
    excerpt: typeof post.excerpt === 'string' ? post.excerpt : '',
    title: typeof post.title === 'string' ? post.title : '',
    afterFirstHeading: [],
    outline: [],
  }

  const blocks = root.children ?? []
  const firstHeadingAt = blocks.findIndex((node) => headingLevel(node) !== null)
  if (firstHeadingAt !== -1) {
    found.afterFirstHeading = blocks
      .slice(firstHeadingAt + 1, firstHeadingAt + 4)
      .map((node) => {
        const level = headingLevel(node)
        let kind = node.type
        if (level) {
          kind = `h${level}`
        } else if (isBoldPseudoHeading(node)) {
          kind = 'bold <p>'
        }
        return `${kind}: ${nodeText(node).replace(/\s+/g, ' ').trim().slice(0, 90)}`
      })
      .filter((line) => !line.endsWith(': '))
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
  // Polish only (design D10). The rule requires a non-breaking space after a
  // Polish one- or two-letter word; English has no orphan-word convention of
  // that kind, so running it over English would count "defects" that are not
  // defects and, worse, could not be language-checked if they were repaired.
  // English asserts the opposite instead: no nbsp inherited at Polish
  // positions, which is what `inheritedNbsp` below counts.
  if (LOCALE === 'pl') {
    forEachTextBlock(root, (block) => {
      if (classifySpacerParagraph(block) === 'spacer') {
        return
      }
      const plan = planBlockNbsp(block)
      found.wordSpaceNbsp += plan.wordSpace
      found.paddingNbsp += plan.padding
      found.preservedNbsp += plan.preserved
    })
  } else {
    forEachTextBlock(root, (block) => {
      found.inheritedNbsp += (nodeText(block).match(/\u00a0/g) ?? []).length
    })
  }

  // Every heading in document order, nested ones included. Two posts carry a
  // how-to list whose steps WordPress marked up as headings inside `<li>`;
  // `buildToc` walks the whole tree and counts them, so a structural check
  // reading only root children would report those posts as having no `h2`
  // while the page renders a full table of contents.
  let seenH2 = false
  let index = -1
  walkNodes(root, (node) => {
    index++
    const level = headingLevel(node)
    if (level === null) {
      if (isBoldPseudoHeading(node)) {
        found.outline.push({
          index,
          kind: 'bold',
          level: null,
          text: headingText(node),
        })
      }
      return
    }
    const text = headingText(node)
    found.outline.push({ index, kind: 'heading', level, text })
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
  })

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
  `  nbsp deliberately kept    ${nodesAndPosts((f) => f.preservedNbsp)} — PRESERVE, baseline only`,
  `  nbsp inherited into EN    ${nodesAndPosts((f) => f.inheritedNbsp)} — EN only; Polish orphan-word spacing has no English analogue`
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

// ---------------------------------------------------------------------------
// Review document (--review)
// ---------------------------------------------------------------------------

/**
 * One markdown document covering every post needing editorial work, so the
 * copy is reviewable as a body of work rather than post by post — tone drift
 * across fifty headlines is visible in a list and invisible one at a time
 * (design D6). Every proposal here is a measurement; nothing is applied until
 * the document comes back approved.
 */
function renderReview(): string {
  const lines: string[] = []
  const quote = (text: string) => text.replace(/\|/g, '\\|')

  lines.push('# Heading review — repair-blog-post-formatting')
  lines.push('')
  lines.push(
    'Generated by `bun run payload:audit:post-formatting --review`. Every',
    '**Proposed** line is computed from the text and is a starting point, not a',
    'decision — see design D7. Fill in **Approved** to accept, or write the',
    'replacement you want. No post content is written from this document; the',
    'applying script reads its own tables (design D6).'
  )
  lines.push('')
  lines.push(
    `This is the editorial work still outstanding against **${dbHost}**, not a`,
    'record of what was already done. The decisions that shipped live in',
    '`tasks.md`, and the copy they applied in the `OVERSIZED` and `SECTIONS`',
    'tables in `lib/payload/apply-heading-fixes.ts`. A section reading "Nothing',
    'outstanding" means the repair cleared it.'
  )
  lines.push('')

  /** Header plus either the count line or an explicit all-clear. */
  const section = (title: string, count: number, ...blurb: string[]) => {
    lines.push(`## ${title}`)
    lines.push('')
    if (count === 0) {
      lines.push('Nothing outstanding.')
    } else {
      lines.push(...blurb)
    }
    lines.push('')
  }

  section(
    '1. Headings duplicating the excerpt',
    excerptHeadings.length,
    `${excerptHeadings.length} post(s). The page header already renders the`,
    'excerpt as the lead, so these say the same thing twice.'
  )
  for (const found of excerptHeadings) {
    const heading = found.excerptHeading
    if (!heading) {
      continue
    }
    lines.push(`### ${found.slug}`)
    lines.push('')
    lines.push(`- **Title:** ${quote(found.title)}`)
    lines.push(`- **Excerpt:** ${quote(found.excerpt)}`)
    lines.push(
      `- **Heading** (${heading.text.length} chars, similarity ${heading.similarity.toFixed(2)}): ${quote(heading.text)}`
    )
    lines.push(
      `- **Proposed:** ${proposeTreatment(heading.text, found.excerpt)}`
    )
    if (found.afterFirstHeading.length > 0) {
      lines.push('- **What follows it:**')
      for (const line of found.afterFirstHeading) {
        lines.push(`  - \`${quote(line)}\``)
      }
    }
    lines.push('- **Approved:** ')
    lines.push('')
  }

  section(
    '2. Posts with no `h2`',
    withoutH2.length,
    `${withoutH2.length} post(s). Give each row a level (\`h2\`/\`h3\`), or`,
    '`keep` to leave it as a paragraph. A post listed with no candidates has no',
    'section labels a walk can find — several are short news items that were',
    'read and deliberately left flat, so an empty list here is not a to-do.'
  )
  for (const found of withoutH2) {
    lines.push(`### ${found.slug}`)
    lines.push('')
    lines.push(
      `_${found.outline.length} candidate(s), toc ${found.tocEntries}_`
    )
    lines.push('')
    if (found.outline.length === 0) {
      lines.push(
        '> No section labels found — this post may genuinely have no sections.',
        '> Confirm by reading it.'
      )
      lines.push('')
      continue
    }
    lines.push('| block | current | text | proposed | approved |')
    lines.push('| --- | --- | --- | --- | --- |')
    for (const entry of found.outline) {
      const current = entry.kind === 'bold' ? 'bold `<p>`' : `h${entry.level}`
      const proposed = entry.kind === 'bold' ? 'h2' : `h${entry.level}`
      lines.push(
        `| ${entry.index} | ${current} | ${quote(entry.text)} | ${proposed} | |`
      )
    }
    lines.push('')
  }

  const relevel = findings.filter(
    (found) =>
      found.hasH2 && (found.h3BeforeH2 || found.deepHeadings.length > 0)
  )
  section(
    '3. Hierarchy to re-level',
    relevel.length,
    `${relevel.length} post(s) that do have an \`h2\` but open below it or use`,
    '`h4`–`h6`. `buildToc` tracks only `h2`/`h3`, so anything deeper is invisible',
    'to the rail.'
  )
  for (const found of relevel) {
    lines.push(`### ${found.slug}`)
    lines.push('')
    if (found.h3BeforeH2) {
      lines.push('> Opens at `h3` before its first `h2`.')
      lines.push('')
    }
    lines.push('| block | current | text | proposed | approved |')
    lines.push('| --- | --- | --- | --- | --- |')
    for (const entry of found.outline) {
      const current = entry.kind === 'bold' ? 'bold `<p>`' : `h${entry.level}`
      // A bold label or an h4+ both become h3: the post already has its h2s,
      // and buildToc tracks nothing deeper than h3.
      const tooDeep = entry.level !== null && entry.level >= 4
      const proposed =
        entry.kind === 'bold' || tooDeep ? 'h3' : `h${entry.level}`
      lines.push(
        `| ${entry.index} | ${current} | ${quote(entry.text)} | ${proposed} | |`
      )
    }
    lines.push('')
  }

  const longOnly = findings.filter(
    (found) => found.longHeadings.length > 0 && !found.excerptHeading
  )
  section(
    '4. Oversized headings that do not duplicate the excerpt',
    longOnly.length,
    `${longOnly.length} post(s) with a heading over ${MAX_HEADING_LENGTH}`,
    'characters that is not a restatement of the lead — shorten to a label.'
  )
  for (const found of longOnly) {
    lines.push(`### ${found.slug}`)
    lines.push('')
    for (const heading of found.longHeadings) {
      lines.push(
        `- **h${heading.level}, ${heading.length} chars:** ${quote(heading.text)}`
      )
      lines.push('- **Approved:** ')
    }
    lines.push('')
  }

  return lines.join('\n')
}

if (REVIEW) {
  await Bun.write(REVIEW_PATH, renderReview())
  console.log(`\nReview document written to ${REVIEW_PATH}`)
}

console.log(
  DETAIL || REVIEW
    ? ''
    : '\nRe-run with --detail for the per-post breakdown, or --review to draft the heading document.'
)
process.exit(0)
