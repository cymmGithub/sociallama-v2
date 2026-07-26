import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { slugifyHeading } from '@/lib/blog/heading-slug'

/**
 * The post's table of contents, built server-side from the serialized Lexical
 * state. This walk is the single owner of heading anchors: it slugifies each
 * heading once, and `PostRichText` assigns the i-th slug to the i-th tracked
 * heading it renders (design D1). Nothing else slugifies post headings.
 *
 * `h4` and deeper are excluded — rare in the imported WordPress bodies, and a
 * three-level rail reads as a wall (design D3).
 */

export interface TocEntry {
  level: 2 | 3
  text: string
  slug: string
}

/**
 * Structural view of a serialized Lexical node. The library's union type is
 * plugin-dependent; the walk only needs children, heading tag, and text, so
 * reading those shapes structurally keeps it robust against unknown nodes.
 */
interface LexicalNodeLike {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNodeLike[]
}

/** Concatenated text of a node's descendants, whitespace-collapsed. */
function nodeText(node: LexicalNodeLike): string {
  const parts: string[] = []
  const collect = (current: LexicalNodeLike) => {
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

/**
 * The one rule for "does this heading get an entry?" — shared by the walk and
 * by the renderer's index counter. Both MUST use it: if the renderer counted a
 * heading the walk skipped (an empty `h2`, say), every slug after it would
 * shift by one and the anchors would silently point at the wrong sections.
 *
 * Returns `null` for anything untracked: non-headings, `h1`/`h4`+, and
 * headings with no text to link to.
 */
export function trackedHeading(
  node: unknown
): { level: 2 | 3; text: string } | null {
  const candidate = node as LexicalNodeLike
  if (candidate.type !== 'heading') {
    return null
  }
  if (candidate.tag !== 'h2' && candidate.tag !== 'h3') {
    return null
  }
  const text = nodeText(candidate)
  return text ? { level: candidate.tag === 'h2' ? 2 : 3, text } : null
}

/**
 * How many tracked headings live in this subtree. Used to work out the heading
 * index a second `PostRichText` must resume from when the body is split around
 * the in-article CTA — same predicate as the walk, so the split can't shift
 * anchors.
 */
export function countTrackedHeadings(node: unknown): number {
  const candidate = node as LexicalNodeLike
  if (candidate.type === 'heading') {
    return trackedHeading(candidate) ? 1 : 0
  }
  let total = 0
  for (const child of candidate.children ?? []) {
    total += countTrackedHeadings(child)
  }
  return total
}

export function buildToc(content: SerializedEditorState): TocEntry[] {
  const entries: TocEntry[] = []
  const seen = new Set<string>()

  const walk = (node: LexicalNodeLike) => {
    if (node.type === 'heading') {
      const tracked = trackedHeading(node)
      if (tracked) {
        entries.push({ ...tracked, slug: slugifyHeading(tracked.text, seen) })
      }
      // Never descend into a heading — a nested heading isn't a thing, and
      // recursing would risk counting its text twice.
      return
    }
    for (const child of node.children ?? []) {
      walk(child)
    }
  }

  walk(content.root as unknown as LexicalNodeLike)
  return entries
}
