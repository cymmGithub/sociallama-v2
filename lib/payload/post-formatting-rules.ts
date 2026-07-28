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

/**
 * `'spacer'` — a paragraph whose entire content is whitespace, line breaks or
 * non-breaking spaces, wrapped in nothing but inline text nodes. WordPress
 * uses these for vertical rhythm; the post template supplies its own.
 *
 * `'unclear'` — blank to the text walk but holding a node type that could
 * render something (an image, a horizontal rule). Reported, never removed.
 *
 * `'content'` — anything with a single visible character.
 */
export function classifySpacerParagraph(node: LexicalNode): SpacerVerdict {
  if (node.type !== 'paragraph') {
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
 * section label without a heading. Long bold runs are emphasis, not labels,
 * so the length ceiling keeps a bolded sentence out of the set.
 */
export function isBoldPseudoHeading(node: LexicalNode): boolean {
  if (node.type !== 'paragraph') {
    return false
  }
  const text = headingText(node)
  if (text === '' || text.length > 120) {
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

/** Does either string contain the other, ignoring case and punctuation? */
export function containsEitherWay(a: string, b: string): boolean {
  const left = words(a).join(' ')
  const right = words(b).join(' ')
  if (left === '' || right === '') {
    return false
  }
  return left.includes(right) || right.includes(left)
}

/** A heading that restates the excerpt the page header already renders. */
export function duplicatesExcerpt(heading: string, excerpt: string): boolean {
  if (excerpt.trim() === '') {
    return false
  }
  return (
    containsEitherWay(heading, excerpt) ||
    excerptSimilarity(heading, excerpt) >= 0.6
  )
}
