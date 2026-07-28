/**
 * The single definition of "what counts as a formatting defect" in a post
 * body — shared by the verifier (audit-post-formatting.ts), the repair
 * (repair-post-formatting.ts) and the WordPress importer's pre-pass
 * (lib/scripts/wp-html-prepass.ts).
 *
 * It lives in its own module because the two scripts connect to Payload at
 * module load: importing either one to borrow a predicate would open a
 * database connection as a side effect. Everything here is pure, so the
 * thing that fixes and the thing that verifies cannot drift apart
 * (repair-blog-post-formatting design D2).
 *
 * Non-breaking spaces are written `\u00a0` throughout rather than as literal
 * characters — the two are indistinguishable on screen, and a rule that turns
 * on which one a regex holds must not depend on reading them apart.
 *
 * Lexical serializes `format` two different ways and the distinction is
 * load-bearing: on an element node it is an alignment string (`'justify'`,
 * `'center'`, `''`), on a text node it is a style bitmask (1 = bold). Read
 * the wrong one and every bold word looks like an alignment.
 */

export const NBSP = '\u00a0'

/** Text-node `format` bit for bold. */
const IS_BOLD = 1

/** Whitespace including the non-breaking space. */
const ANY_SPACE = /[\s\u00a0]/

/**
 * Structural view of a serialized Lexical node. The library's union type is
 * plugin-dependent; these walks only need type, tag, format, text and
 * children, so reading those shapes structurally keeps them robust against
 * node types this repo has not enabled.
 */
export interface LexicalNode {
  type: string
  tag?: string
  format?: string | number
  text?: string
  children?: LexicalNode[]
}

export function isTextNode(node: LexicalNode): boolean {
  return typeof node.text === 'string'
}

/** Concatenated text of a node and its descendants; a line break reads as one. */
export function nodeText(node: LexicalNode): string {
  if (isTextNode(node)) {
    return node.text ?? ''
  }
  if (node.type === 'linebreak') {
    return '\n'
  }
  return (node.children ?? []).map(nodeText).join('')
}

/** Depth-first walk over every node in the tree, the starting node included. */
export function walkNodes(
  node: LexicalNode,
  visit: (node: LexicalNode) => void
): void {
  visit(node)
  for (const child of node.children ?? []) {
    walkNodes(child, visit)
  }
}

// ---------------------------------------------------------------------------
// Alignment
// ---------------------------------------------------------------------------

/** An element node carrying WordPress's justified alignment. */
export function isJustified(node: LexicalNode): boolean {
  return !isTextNode(node) && node.format === 'justify'
}

/** Deliberate centring — authored intent, counted as a preservation baseline. */
export function isCentered(node: LexicalNode): boolean {
  return !isTextNode(node) && node.format === 'center'
}

// ---------------------------------------------------------------------------
// Spacer paragraphs
// ---------------------------------------------------------------------------

/**
 * Node types a blank paragraph may contain and still be safe to delete.
 * Anything else — an upload, a link, a nested list — means the paragraph
 * carries something the text walk cannot see, so it is never guessed at.
 */
const INERT_CHILD_TYPES = new Set(['text', 'linebreak', 'tab'])

export type SpacerVerdict = 'spacer' | 'content' | 'unclear'

/** Blocks that are pure debris when they hold no visible text. */
const SPACER_BLOCK_TYPES = new Set(['paragraph', 'heading'])

/**
 * `'spacer'` — a block whose entire content is whitespace, line breaks or
 * non-breaking spaces, wrapped in nothing but inline text nodes. WordPress
 * uses these for vertical rhythm; the post template supplies its own.
 *
 * Headings count as well as paragraphs: the corpus carries 11 heading nodes
 * with no text at all, and an empty heading is a spacer that also claims a
 * heading's `margin-top`. `buildToc` already skips them, so removing one
 * cannot shift an anchor.
 *
 * `'unclear'` — blank to the text walk but holding a node type that could
 * render something (an image, a horizontal rule). Reported, never removed.
 *
 * `'content'` — anything with a single visible character.
 */
export function classifySpacerParagraph(node: LexicalNode): SpacerVerdict {
  if (!SPACER_BLOCK_TYPES.has(node.type)) {
    return 'content'
  }
  if (nodeText(node).replace(/[\s\u00a0]/g, '') !== '') {
    return 'content'
  }
  let inert = true
  for (const child of node.children ?? []) {
    walkNodes(child, (descendant) => {
      if (!INERT_CHILD_TYPES.has(descendant.type)) {
        inert = false
      }
    })
  }
  return inert ? 'spacer' : 'unclear'
}

// ---------------------------------------------------------------------------
// Non-breaking spaces
// ---------------------------------------------------------------------------

/** Stands in for a leaf that is not text (an upload, a rule) — never a space. */
const OPAQUE_LEAF = '\uFFFC'

/**
 * One position in a block's text, as seen by the non-breaking-space pass.
 * Immutable leaves — a line break, an inline upload — take part in the
 * analysis so a gap around them is read correctly, but are never rewritten.
 */
export interface NbspLeaf {
  /** The text node to rewrite, or `null` for an immutable leaf. */
  node: LexicalNode | null
  text: string
  mutable: boolean
}

export interface NbspPlan {
  /** New text per leaf, index-aligned with the input. */
  texts: string[]
  /** Non-breaking spaces that were ordinary word spaces. */
  wordSpace: number
  /** Non-breaking spaces used to pad — runs, indents, trailing gaps. */
  padding: number
  /** Non-breaking spaces left alone: Polish short words, digit grouping. */
  preserved: number
}

/**
 * Resolve every non-breaking space in one block of text.
 *
 * The analysis runs over the block's whole text rather than one node at a
 * time, because a gap routinely straddles a node boundary — a bold word
 * followed by a plain node that opens with a non-breaking space is still one
 * word space. Working per node would misread the token before the gap as
 * empty and preserve debris.
 *
 * Each whitespace run containing a non-breaking space resolves one of four
 * ways:
 *
 * - **at the block's edge, or containing a line break** — padding with
 *   nothing left to separate. Dropped: WordPress used it as an indent or a
 *   trailing gap, and unlike an ordinary space a non-breaking one does not
 *   collapse at render, so it shows.
 * - **longer than one character** — a padding run. Collapsed to a single
 *   ordinary space; anything else leaves a visible gap. A non-breaking space
 *   sitting next to a breakable one was never holding anything together.
 * - **a lone non-breaking space between two words** — the word-space case.
 *   Converted only when the token before it is longer than two characters:
 *   in Polish a non-breaking space after a one-letter preposition (`w`, `i`,
 *   `z`, `o`) is correct and deliberate, and the two-letter cases (`na`,
 *   `są`) are ambiguous enough to leave alone (design D3). Digit-grouped
 *   numbers (`106 800`) are preserved whatever the token length — converting
 *   one would let the number wrap in half.
 * - **anything else** — preserved.
 */
export function planNbsp(leaves: NbspLeaf[]): NbspPlan {
  const texts = leaves.map((leaf) => leaf.text)
  const full = texts.join('')
  const plan: NbspPlan = { texts, wordSpace: 0, padding: 0, preserved: 0 }
  if (!full.includes(NBSP)) {
    return plan
  }

  // Code-unit position → leaf index, so a run can be written back to the
  // nodes it came from. Code units rather than code points, because every
  // index here has to line up with `full` — a surrogate pair must occupy two
  // slots or an emoji would shift everything after it.
  const owner = new Array<number>(full.length)
  let filled = 0
  for (const [index, leaf] of leaves.entries()) {
    owner.fill(index, filled, filled + leaf.text.length)
    filled += leaf.text.length
  }
  const isMutable = (at: number) =>
    leaves[owner[at] as number]?.mutable === true

  const out = full.split('')
  const dropped = new Set<number>()

  let cursor = 0
  while (cursor < full.length) {
    if (!ANY_SPACE.test(full[cursor] as string)) {
      cursor++
      continue
    }
    let end = cursor
    while (end < full.length && ANY_SPACE.test(full[end] as string)) {
      end++
    }
    const run = full.slice(cursor, end)
    if (!run.includes(NBSP)) {
      cursor = end
      continue
    }

    const nbspCount = run.split(NBSP).length - 1
    let immutableInRun = false
    for (let at = cursor; at < end; at++) {
      if (!isMutable(at)) {
        immutableInRun = true
      }
    }

    if (cursor === 0 || end === full.length || immutableInRun) {
      for (let at = cursor; at < end; at++) {
        if (isMutable(at)) {
          dropped.add(at)
        }
      }
      plan.padding += nbspCount
    } else if (run.length === 1) {
      const before = /[^\s\u00a0]*$/.exec(full.slice(0, cursor))?.[0] ?? ''
      const after = /^[^\s\u00a0]*/.exec(full.slice(end))?.[0] ?? ''
      const grouped = /\d$/.test(before) && /^\d/.test(after)
      if (grouped || before.length <= 2) {
        plan.preserved++
      } else {
        out[cursor] = ' '
        plan.wordSpace++
      }
    } else {
      let kept = false
      for (let at = cursor; at < end; at++) {
        if (kept) {
          dropped.add(at)
        } else {
          out[at] = ' '
          kept = true
        }
      }
      plan.padding += nbspCount
    }
    cursor = end
  }

  const rebuilt = leaves.map(() => '')
  for (let at = 0; at < full.length; at++) {
    if (dropped.has(at)) {
      continue
    }
    const index = owner[at] as number
    rebuilt[index] = (rebuilt[index] ?? '') + (out[at] ?? '')
  }
  plan.texts = rebuilt
  return plan
}

/** Block types that own a run of text; a gap never spans two of them. */
const TEXT_BLOCK_TYPES = new Set(['paragraph', 'heading', 'quote', 'listitem'])

/**
 * The leaves of one text block, in reading order. Nested blocks are skipped —
 * a list inside a list item is visited as a block of its own, so a gap is
 * never read across the boundary between them.
 */
export function blockNbspLeaves(block: LexicalNode): NbspLeaf[] {
  const leaves: NbspLeaf[] = []
  const collect = (node: LexicalNode) => {
    for (const child of node.children ?? []) {
      if (isTextNode(child)) {
        leaves.push({ node: child, text: child.text ?? '', mutable: true })
      } else if (child.type === 'linebreak') {
        leaves.push({ node: null, text: '\n', mutable: false })
      } else if (TEXT_BLOCK_TYPES.has(child.type)) {
        // Visited as a block of its own.
      } else if (child.children) {
        collect(child)
      } else {
        leaves.push({ node: null, text: OPAQUE_LEAF, mutable: false })
      }
    }
  }
  collect(block)
  return leaves
}

/** Every text-bearing block in the tree, each visited once. */
export function forEachTextBlock(
  root: LexicalNode,
  visit: (block: LexicalNode) => void
): void {
  walkNodes(root, (node) => {
    if (TEXT_BLOCK_TYPES.has(node.type)) {
      visit(node)
    }
  })
}

/** Plan the non-breaking-space fix for one block, changing nothing. */
export function planBlockNbsp(block: LexicalNode): NbspPlan {
  return planNbsp(blockNbspLeaves(block))
}

/** Apply it, rewriting the block's text nodes in place. */
export function applyBlockNbsp(block: LexicalNode): NbspPlan {
  const leaves = blockNbspLeaves(block)
  const plan = planNbsp(leaves)
  leaves.forEach((leaf, index) => {
    const next = plan.texts[index]
    if (leaf.node && typeof next === 'string' && next !== leaf.text) {
      leaf.node.text = next
    }
  })
  return plan
}

// ---------------------------------------------------------------------------
// Headings
// ---------------------------------------------------------------------------

/** Longest a heading may be before it reads as a paragraph (spec). */
export const MAX_HEADING_LENGTH = 85

/** Heading text, whitespace-collapsed — what the reader sees on one line. */
export function headingText(node: LexicalNode): string {
  return nodeText(node)
    .replace(/[\s\u00a0]+/g, ' ')
    .trim()
}

export function headingLevel(node: LexicalNode): number | null {
  if (node.type !== 'heading') {
    return null
  }
  const match = /^h([1-6])$/.exec(node.tag ?? '')
  return match ? Number(match[1]) : null
}

/**
 * A paragraph whose every visible word is bold — WordPress's way of writing a
 * section label without a heading.
 *
 * Two exclusions, both learned from promoting the wrong things: a bold run
 * longer than a heading is allowed to be (`MAX_HEADING_LENGTH`) is emphasis or
 * a whole sentence, not a label — promoting one would manufacture exactly the
 * oversized heading this change exists to remove. And a bold line carrying a
 * URL is an image credit (`źródło: https://…`), which is a caption whatever
 * its length.
 */
export function isBoldPseudoHeading(node: LexicalNode): boolean {
  if (node.type !== 'paragraph') {
    return false
  }
  const text = headingText(node)
  if (text === '' || text.length > MAX_HEADING_LENGTH) {
    return false
  }
  if (/https?:\/\/|www\./i.test(text)) {
    return false
  }
  let allBold = true
  walkNodes(node, (descendant) => {
    if (!isTextNode(descendant) || (descendant.text ?? '').trim() === '') {
      return
    }
    if ((Number(descendant.format ?? 0) & IS_BOLD) === 0) {
      allBold = false
    }
  })
  return allBold
}

/** Lowercased, punctuation-stripped words — the unit both similarity checks use. */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Dice coefficient over word bigrams. A sorting heuristic for the editorial
 * review, never a decision-maker: one genuine heading in the corpus scores
 * 0.25 and a threshold would misfile it (design D7).
 */
export function excerptSimilarity(a: string, b: string): number {
  const bigrams = (text: string) => {
    const list = words(text)
    return list.length < 2
      ? list
      : list.slice(0, -1).map((word, i) => `${word} ${list[i + 1]}`)
  }
  const left = bigrams(a)
  const right = new Set(bigrams(b))
  if (left.length === 0 || right.size === 0) {
    return 0
  }
  const shared = left.filter((bigram) => right.has(bigram)).length
  return (2 * shared) / (left.length + right.size)
}

/**
 * Cut an excerpt back to its last complete sentence.
 *
 * The excerpts were scraped by taking roughly the first 400 characters of each
 * body, which lands mid-sentence 47 times out of 79. The page header renders
 * the excerpt as the lead, so the reader sees a sentence break off — "…i
 * odpowiedziach AI. Jeśli nie masz czasu" — and then meets it again, complete,
 * at the top of the body.
 *
 * Dropping the fragment fixes both: the lead ends where a sentence ends, and
 * the body's opening sentence is no longer a half-echo of it. An excerpt with
 * no sentence end anywhere is returned untouched rather than emptied.
 */
export function trimTrailingFragment(excerpt: string): string {
  const match = /^[\s\S]*[.!?…]["»”)\]]?(?=\s|$)/.exec(excerpt.trimEnd())
  return match ? (match[0] as string).trim() : excerpt.trim()
}

/** Collapse whitespace and non-breaking spaces, for comparing scraped text. */
function flatten(text: string): string {
  return text.replace(/[\s ]+/g, ' ').trim()
}

/**
 * Finish the sentence an excerpt was cut off in, using the body it came from.
 *
 * Cutting *backwards* to the previous full stop was the wrong direction: the
 * half-sentence left behind in the body opens the post out of context. On
 * `google-polaczylo-social-media-z-seo` the excerpt stopped at "Jeśli nie masz
 * czasu" and the body was left starting "Jeśli nie masz czasu ani zasobów,
 * żeby to ogarnąć – Social Lama zrobi to za Ciebie." — a call to action whose
 * "to ogarnąć" refers to sentences that are now only in the header.
 *
 * Extending forwards instead puts the whole intro in the lead, where it reads
 * as written, and leaves the body's copy of it entirely inside the excerpt so
 * the lead-paragraph fix can drop the block outright.
 *
 * Falls back to cutting backwards when the body cannot be matched, or when
 * finishing the sentence would add more than `maxExtension` characters — a
 * scrape that stopped early in a very long sentence should not drag all of it
 * into the teaser.
 */
export function completeExcerpt(
  excerpt: string,
  bodyOpening: string,
  maxExtension = 220
): string {
  const flat = flatten(excerpt)
  if (flat === '' || /[.!?…]["»”)\]]?$/.test(flat)) {
    return flat
  }
  const body = flatten(bodyOpening)
  const anchor = flat.slice(-50)
  const at = body.indexOf(anchor)
  if (at === -1) {
    return trimTrailingFragment(flat)
  }
  const rest = body.slice(at + anchor.length)
  const completion = /^[^.!?…]*[.!?…]["»”)\]]?/.exec(rest)?.[0]
  if (!completion || completion.length > maxExtension) {
    return trimTrailingFragment(flat)
  }
  return `${flat}${completion}`.trim()
}

/**
 * Strip the headings an auto-generated excerpt opens with.
 *
 * The excerpts were scraped from each body's first few hundred characters,
 * headings included — so an excerpt routinely begins with the post's own
 * section labels run together: "Budowanie marki Interakcja z klientami Reklama
 * i promocja … Dziś porozmawiamy o tym, jak…". That is what the card teaser
 * and the meta description show.
 *
 * Removing them leaves the prose that was always meant to be the lead. Unlike
 * `stripDuplicatedPrefix` this cuts exactly at the heading's end and does not
 * back up to a sentence boundary: a label rarely ends in punctuation, and
 * backing up would decline to cut at all.
 */
export function stripLeadingHeadings(
  excerpt: string,
  headings: readonly string[]
): string {
  const simple = (word: string) =>
    word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

  let out = excerpt.trim()
  let cutting = true
  while (cutting) {
    cutting = false
    for (const heading of headings) {
      const headingWords = heading.split(/\s+/).filter(Boolean).map(simple)
      if (headingWords.length === 0) {
        continue
      }
      const pattern = /\S+/g
      const positions: { text: string; at: number }[] = []
      let match = pattern.exec(out)
      while (match !== null) {
        positions.push({ text: match[0], at: match.index })
        match = pattern.exec(out)
      }
      if (positions.length <= headingWords.length) {
        continue
      }
      const matches = headingWords.every(
        (word, i) => simple(positions[i]?.text ?? '') === word
      )
      if (!matches) {
        continue
      }
      const next = positions[headingWords.length]
      if (!next) {
        continue
      }
      out = out.slice(next.at).trim()
      cutting = true
      break
    }
  }
  return out
}

export type IntroTreatment = 'restatement' | 'extended' | 'genuine'

/**
 * How an excerpt-duplicating intro heading is resolved.
 *
 * The excerpts were auto-generated from each post's opening, so nearly every
 * one of these headings is a verbatim prefix of its excerpt. Containment alone
 * therefore proves nothing — a genuine short section label sitting at the top
 * of the body is a prefix too. What separates them is how much of the excerpt
 * the heading accounts for (design D10).
 */
export function classifyIntroHeading(
  heading: string,
  excerpt: string
): IntroTreatment {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const h = normalize(heading)
  const e = normalize(excerpt)
  // Order matters: an exact match satisfies `includes` both ways, so the
  // restatement test has to come first or every one reads as an extension.
  if (e.startsWith(h) && h.length / e.length > 0.8) {
    return 'restatement'
  }
  if (h.includes(e) || h.length > MAX_HEADING_LENGTH) {
    return 'extended'
  }
  return 'genuine'
}

/**
 * Drop the leading words a heading shares with the excerpt, returning what is
 * left to become a paragraph.
 *
 * Matching runs over normalized words but cuts the original string at a word
 * boundary, so punctuation and capitalisation survive intact. The excerpt is
 * stored truncated and often ends mid-word; that simply stops the match, which
 * is the conservative direction — a word too few is kept, never one too many.
 */
/**
 * Remove the first `count` characters of a block's text, in place, keeping
 * every inline node that survives.
 *
 * Rebuilding the block from a plain string instead would flatten the links and
 * bold runs in whatever is kept — tolerable for a heading, not for a paragraph
 * of body copy.
 */
export function trimBlockPrefix(block: LexicalNode, count: number): void {
  let remaining = count
  const leaves: LexicalNode[] = []
  walkNodes(block, (node) => {
    if (isTextNode(node)) {
      leaves.push(node)
    }
  })
  for (const leaf of leaves) {
    if (remaining <= 0) {
      break
    }
    const text = leaf.text ?? ''
    if (text.length <= remaining) {
      remaining -= text.length
      leaf.text = ''
    } else {
      leaf.text = text.slice(remaining)
      remaining = 0
    }
  }

  // Drop the text nodes and inline wrappers left holding nothing.
  const prune = (node: LexicalNode) => {
    if (!node.children) {
      return
    }
    node.children = node.children.filter((child) => {
      prune(child)
      if (isTextNode(child)) {
        return child.text !== ''
      }
      return child.type === 'linebreak' || (child.children?.length ?? 0) > 0
    })
  }
  prune(block)

  const first = (block.children ?? []).find((child) => isTextNode(child))
  if (first) {
    first.text = (first.text ?? '').trimStart()
  }
}

/**
 * How many characters at the start of `text` the excerpt already said — the
 * cut offset shared by the intro-heading and lead-paragraph fixes. Returns 0
 * when nothing is shared and `text.length` when everything is.
 */
export function duplicatedPrefixLength(text: string, excerpt: string): number {
  const kept = stripDuplicatedPrefix(text, excerpt)
  if (kept === text) {
    return 0
  }
  if (kept === '') {
    return text.length
  }
  const at = text.lastIndexOf(kept)
  return at === -1 ? 0 : at
}

export function stripDuplicatedPrefix(
  heading: string,
  excerpt: string
): string {
  const simple = (word: string) =>
    word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

  const headingWords: { text: string; at: number }[] = []
  const pattern = /\S+/g
  let match = pattern.exec(heading)
  while (match !== null) {
    headingWords.push({ text: match[0], at: match.index })
    match = pattern.exec(heading)
  }
  const excerptWords = excerpt.split(/\s+/).filter(Boolean)

  let shared = 0
  while (shared < headingWords.length && shared < excerptWords.length) {
    const fromHeading = headingWords[shared]?.text ?? ''
    const fromExcerpt = excerptWords[shared] ?? ''
    if (simple(fromHeading) !== simple(fromExcerpt)) {
      break
    }
    // A punctuation-only token normalizes to nothing, so two *different* marks
    // would compare equal. Require those to match verbatim — otherwise a lone
    // dash in the excerpt would end the match and leave the rest duplicated.
    if (simple(fromHeading) === '' && fromHeading !== fromExcerpt) {
      break
    }
    shared++
  }
  if (shared === 0) {
    return heading
  }
  // Every word matched: the heading says nothing the excerpt does not, so
  // there is no tail to keep and the caller deletes the block.
  if (shared === headingWords.length) {
    return ''
  }

  // The excerpt is stored truncated, usually mid-sentence, so cutting exactly
  // where it stops leaves the paragraph starting mid-clause ("ani zasobów,
  // żeby to ogarnąć…"). Back up to the last sentence boundary instead. That
  // repeats a few words the header already showed — invisible in practice,
  // and far better than a fragment. With no boundary to back up to, nothing
  // is dropped and the whole heading becomes the paragraph.
  let cut = shared
  while (
    cut > 0 &&
    !/[.!?…:]["»”)]?$/.test(headingWords[cut - 1]?.text ?? '')
  ) {
    cut--
  }
  if (cut === 0) {
    return heading
  }
  const next = headingWords[cut]
  return next ? heading.slice(next.at).trim() : ''
}

/**
 * Re-level a body so its headings start at `h2` and skip nothing.
 *
 * The distinct levels present are mapped in order onto `h2`, then `h3`, and
 * anything deeper is clamped to `h3` — `buildToc` tracks nothing below that,
 * so a fourth level would be invisible in the rail either way. Returns how
 * many headings changed.
 */
export function normalizeHeadingLevels(root: LexicalNode): number {
  const headings: LexicalNode[] = []
  walkNodes(root, (node) => {
    if (headingLevel(node) !== null) {
      headings.push(node)
    }
  })
  const present = [
    ...new Set(headings.map((node) => headingLevel(node) as number)),
  ].sort((a, b) => a - b)
  if (present.length === 0) {
    return 0
  }
  const mapped = new Map<number, number>()

  // A body that opens below its own shallowest level is not describing a
  // hierarchy. Three posts run a series of `h3` sections and then close with a
  // single `h2` ("Wniosek: strategia to klucz do sukcesu") — that `h2` is the
  // last section, not a parent of everything before it. Mapping levels in
  // order would leave the sections as subsections of nothing, so the whole set
  // flattens to `h2` instead.
  const firstLevel = headingLevel(headings[0] as LexicalNode) as number
  if (firstLevel !== present[0]) {
    for (const level of present) {
      mapped.set(level, 2)
    }
  } else {
    present.forEach((level, index) => {
      mapped.set(level, index === 0 ? 2 : 3)
    })
  }

  let changed = 0
  for (const node of headings) {
    const tag = `h${mapped.get(headingLevel(node) as number)}`
    if (node.tag !== tag) {
      node.tag = tag
      changed++
    }
  }
  return changed
}

/**
 * A list holding exactly one short item is not a list — it is a section label
 * WordPress wrapped in `<ol>`/`<ul>` so it would render with a number or a
 * bullet. The corpus has 36 of them across 6 posts, and every one reads as a
 * heading: "Zadbaj o strategię komunikacji", "Zwiększenie sprzedaży". Two of
 * those posts have no other headings at all, so their sections were invisible
 * to the table of contents.
 *
 * Returns the node to put in the list's place, or `null` if this list is a
 * real list. A single item that already holds a heading — WordPress marked up
 * the step as `<li><h2>` in one post — yields that heading, lifted out of the
 * list to where a heading belongs.
 */
export function unwrapLabelList(
  node: LexicalNode,
  tag: string
): LexicalNode | null {
  if (node.type !== 'list') {
    return null
  }
  const items = node.children ?? []
  if (items.length !== 1) {
    return null
  }
  const item = items[0]
  if (!item) {
    return null
  }
  const text = headingText(item)
  if (text === '' || text.length > MAX_HEADING_LENGTH) {
    return null
  }
  // Anything the text walk cannot see — a nested list, an image — means this
  // is carrying more than a label.
  let inertOnly = true
  walkNodes(item, (descendant) => {
    if (
      ![
        'listitem',
        'text',
        'linebreak',
        'link',
        'autolink',
        'heading',
      ].includes(descendant.type)
    ) {
      inertOnly = false
    }
  })
  if (!inertOnly) {
    return null
  }

  const nested = (item.children ?? []).find(
    (child) => headingLevel(child) !== null
  )
  if (nested) {
    return { ...nested, tag }
  }
  return {
    type: 'heading',
    tag,
    format: '',
    children: (item.children ?? []).map((child) =>
      isTextNode(child)
        ? { ...child, format: Number(child.format ?? 0) & ~IS_BOLD }
        : child
    ),
  }
}

/**
 * Turn a bold-paragraph pseudo-heading into a real heading, in place. The bold
 * bit is cleared from its text: headings already render at weight 800, and
 * leaving it would carry WordPress's emphasis into a node that no longer needs
 * it.
 */
export function promoteToHeading(node: LexicalNode, tag: string): void {
  node.type = 'heading'
  node.tag = tag
  node.format = ''
  const paragraphOnly = node as unknown as Record<string, unknown>
  paragraphOnly.textFormat = undefined
  paragraphOnly.textStyle = undefined
  walkNodes(node, (descendant) => {
    if (isTextNode(descendant)) {
      descendant.format = Number(descendant.format ?? 0) & ~IS_BOLD
    }
  })
}

/**
 * A heading that restates the excerpt the page header already renders.
 *
 * The test is prefix alignment, not containment. The excerpts were generated
 * from roughly the first 400 characters of each body, so they *contain* the
 * first real section heading as well as the intro — testing containment
 * flagged those too, and a repair acting on it would delete a genuine heading
 * on every run. The defect is specifically that the body opens by restating
 * the lead, which means one of the two strings starts with the other.
 */
export function duplicatesExcerpt(heading: string, excerpt: string): boolean {
  if (excerpt.trim() === '') {
    return false
  }
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const h = normalize(heading)
  const e = normalize(excerpt)
  if (h === '' || e === '') {
    return false
  }
  return e.startsWith(h) || h.startsWith(e)
}
