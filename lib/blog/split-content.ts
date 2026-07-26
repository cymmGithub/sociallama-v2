import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { countTrackedHeadings, type TocEntry } from '@/lib/blog/toc'

/**
 * Splits a post body so the in-article CTA can land mid-read rather than after
 * the last paragraph, as the reviewed mock shows.
 *
 * `headingsBefore` is the count of tracked headings in the first half: the
 * second `PostRichText` resumes its heading index there, which is what keeps
 * anchors aligned with the table-of-contents walk across the split (design D1).
 *
 * Returns `after: null` when the body is too short to cut — then the caller
 * renders one body and puts the CTA at the end.
 */

export interface SplitBody {
  before: SerializedEditorState
  after: SerializedEditorState | null
  headingsBefore: number
}

interface RootLike {
  children?: unknown[]
}

/**
 * Tracked-heading position of the Nth `h2`, which is where the CTA cut belongs.
 * Counting `h3`s would drop the CTA between an `h2` and its own subsection,
 * interrupting a section instead of following a finished one.
 *
 * Returns 0 when the post has fewer than N `h2`s, which leaves the body whole.
 */
export function ctaSplitOrdinal(
  toc: readonly TocEntry[],
  nthHeading: number
): number {
  let seen = 0
  for (const [index, entry] of toc.entries()) {
    if (entry.level !== 2) {
      continue
    }
    seen += 1
    if (seen === nthHeading) {
      return index + 1
    }
  }
  return 0
}

export function splitBeforeHeading(
  content: SerializedEditorState,
  ordinal: number
): SplitBody {
  const root = content.root as unknown as RootLike
  const children = root.children ?? []

  // Ordinal 0 means "don't cut" — without this guard the loop would match on
  // the very first heading-bearing block.
  if (ordinal < 1) {
    return { before: content, after: null, headingsBefore: 0 }
  }

  let seen = 0
  let cut = -1
  for (const [index, child] of children.entries()) {
    const headings = countTrackedHeadings(child)
    if (headings > 0) {
      seen += headings
      if (seen >= ordinal) {
        cut = index
        break
      }
    }
  }

  // No Nth heading, or it's the very first block (nothing to read before the
  // CTA) — leave the body whole.
  if (cut <= 0) {
    return { before: content, after: null, headingsBefore: 0 }
  }

  const head = children.slice(0, cut)
  const tail = children.slice(cut)

  return {
    before: {
      ...content,
      root: { ...root, children: head },
    } as unknown as SerializedEditorState,
    after: {
      ...content,
      root: { ...root, children: tail },
    } as unknown as SerializedEditorState,
    headingsBefore: head.reduce<number>(
      (total, child) => total + countTrackedHeadings(child),
      0
    ),
  }
}
