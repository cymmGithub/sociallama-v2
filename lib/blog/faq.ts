import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { countTrackedHeadings } from '@/lib/blog/toc'

/**
 * The FAQ closer, detected by shape rather than declared by an editor
 * (design D4).
 *
 * Three consumers read one answer: the renderer turns the section into
 * `details`/`summary` pairs, `json-ld.tsx` emits `FAQPage` from the same pairs,
 * and the table of contents opens the right disclosure before it jumps. If they
 * detected separately they would disagree the day a post's shape drifted, and
 * the JSON-LD would claim questions the page does not show — which is exactly
 * the kind of structured-data lie that costs a rich result.
 *
 * ## Why the rule is strict
 *
 * The alternative was a loose one: "a heading mentioning pytania/FAQ opens an
 * accordion". Measured against the 81 published posts that also catches
 * `jak-angazowac-na-facebooku…`, whose closing section is prose with images
 * under `h3`s — folding it into disclosures would hide the article's ending
 * behind six closed rows. So the rule is: the LAST `h2` starts with `FAQ`, and
 * from there to the end of the body there is nothing but `h3`+paragraph pairs.
 * Anything else renders exactly as it does today.
 *
 * Detection is per rendered locale: an English body whose heading was
 * translated to something else simply renders plain, which is a degradation
 * rather than a break.
 */

/** Structural view of a serialized node — the same shape `toc.ts` walks. */
export interface FaqNode {
  type?: string
  tag?: string
  text?: string
  children?: FaqNode[]
}

export interface FaqPair {
  /** The `h3` node, rendered inside the `summary`. */
  question: FaqNode
  /** The answer paragraph, rendered as the disclosure's content. */
  answer: FaqNode
  /** Plain text, for the `FAQPage` structured data. */
  questionText: string
  answerText: string
}

export interface FaqSection {
  /** Index in `root.children` of the `h2` that opens the section. */
  index: number
  /**
   * Tracked headings before that `h2`. The table-of-contents array is built
   * over the WHOLE body, so this is where the section's own slugs start:
   * `toc[headingOffset]` is the `h2`, and one entry follows per question.
   */
  headingOffset: number
  /** The `h2`'s own text — the editor's wording, never a label we invent. */
  headingText: string
  pairs: FaqPair[]
}

/** Concatenated text of a node's descendants, whitespace-collapsed. */
function nodeText(node: FaqNode): string {
  const parts: string[] = []
  const collect = (current: FaqNode) => {
    if (typeof current.text === 'string') {
      parts.push(current.text)
    }
    for (const child of current.children ?? []) {
      collect(child)
    }
  }
  collect(node)
  return parts.join('').replace(/\s+/g, ' ').trim()
}

const isHeading = (node: FaqNode, tag: 'h2' | 'h3') =>
  node.type === 'heading' && node.tag === tag

export function detectFaq(content: SerializedEditorState): FaqSection | null {
  const children = ((content.root as unknown as FaqNode).children ??
    []) as FaqNode[]

  // The last `h2` in the body, wherever it sits. Searching for "an h2 starting
  // with FAQ" instead would accept a post that carries an FAQ in the middle and
  // more article after it, and the disclosures would swallow a section the
  // reader is still meant to read straight through.
  let index = -1
  for (let i = children.length - 1; i >= 0; i -= 1) {
    const child = children[i]
    if (child && isHeading(child, 'h2')) {
      index = i
      break
    }
  }

  const heading = index === -1 ? undefined : children[index]
  const headingText = heading ? nodeText(heading) : ''
  if (!/^FAQ/i.test(headingText)) {
    return null
  }

  const pairs: FaqPair[] = []
  for (let i = index + 1; i < children.length; i += 2) {
    const question = children[i]
    const answer = children[i + 1]
    if (
      !(question && answer && isHeading(question, 'h3')) ||
      answer.type !== 'paragraph'
    ) {
      return null
    }
    const questionText = nodeText(question)
    if (!questionText) {
      return null
    }
    pairs.push({
      question,
      answer,
      questionText,
      answerText: nodeText(answer),
    })
  }

  if (pairs.length === 0) {
    return null
  }

  // Same predicate the table-of-contents walk uses, so the slug offset cannot
  // drift from it — an `h2` the walk skipped (empty text) must not be counted
  // here either.
  let headingOffset = 0
  for (const child of children.slice(0, index)) {
    headingOffset += countTrackedHeadings(child)
  }

  return { index, headingOffset, headingText, pairs }
}

/**
 * The body with its FAQ section cut off, for the ordinary rich-text render.
 *
 * The section is rendered by `PostFaq` instead, because a `details` has to wrap
 * two SIBLING nodes — the `h3` and its paragraph — and a Lexical converter only
 * ever sees one node at a time. Cutting here keeps the anchor bookkeeping
 * sound: the FAQ is always the tail, so every heading index before it is
 * unchanged.
 */
export function bodyWithoutFaq(
  content: SerializedEditorState,
  section: FaqSection
): SerializedEditorState {
  const root = content.root as unknown as { children?: unknown[] }
  return {
    ...content,
    root: {
      ...root,
      children: (root.children ?? []).slice(0, section.index),
    },
  } as unknown as SerializedEditorState
}
