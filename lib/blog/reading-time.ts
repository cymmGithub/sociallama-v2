import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Estimated reading time in minutes, computed from the post's own content at
 * render. Deliberately not a CMS field: stored, it would silently drift from an
 * edited body, and an editor would have to remember to update it (design D7).
 */

/** Polish prose, read for comprehension rather than skimmed. */
const WORDS_PER_MINUTE = 200

interface LexicalNodeLike {
  text?: string
  children?: LexicalNodeLike[]
}

export function readingTimeMinutes(content: SerializedEditorState): number {
  let words = 0

  const count = (node: LexicalNodeLike) => {
    if (typeof node.text === 'string') {
      // Whitespace-delimited tokens; a node of pure whitespace contributes none.
      const tokens = node.text.trim()
      if (tokens) {
        words += tokens.split(/\s+/).length
      }
    }
    for (const child of node.children ?? []) {
      count(child)
    }
  }

  count(content.root as unknown as LexicalNodeLike)

  // A three-sentence post still takes a moment to read, so never show "0 min".
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
