import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Locale } from '@/lib/i18n/slug-map'

/**
 * Binds Polish one-letter words to the word that follows them.
 *
 * Polish typography does not allow a line to end on `a i o u w z` — the
 * "sierotka". Measured across the 82 published posts it is the corpus's one
 * real typographic defect: 342 occurrences on a 1280px viewport and 710 on a
 * 390px one, roughly every thirteenth line. Justified prose makes it worse,
 * because the stranded letter sits at the end of a stretched line.
 *
 * CSS cannot express this, so the fix is a non-breaking space, applied at the
 * render boundary rather than to stored content. That choice is what keeps the
 * `FAQPage` JSON-LD, the translation projection (`runsOf` keys off the stored
 * text) and the search index on ordinary spaces — only the DOM gets U+00A0.
 *
 * Polish only. English has no equivalent rule, and of this letter set only "a"
 * is even an English word.
 */

/**
 * A one-letter word, and the single space after it. The lookbehind anchors the
 * letter to a word start so `5 z 10` binds but the `I` of `I. Wstęp` does not,
 * and it is zero-width so consecutive one-letter words (`a i tak`) chain: the
 * `\u00A0` written by the first match still reads as `\s` for the second.
 */
const ORPHAN = /(?<=^|[\s(„"])(?<letter>[aiouwzAIOUWZ]) (?=\S)/g

/** Lexical's `IS_CODE` text-format bit. */
const IS_CODE = 16

export function bindOrphansInText(text: string, locale: Locale): string {
  return locale === 'pl' ? text.replace(ORPHAN, '$<letter>\u00A0') : text
}

/**
 * The same rule over a Lexical body. Returns a copy — the caller's tree is the
 * one Payload cached, and rewriting it in place would leak U+00A0 into every
 * other reader of that object.
 *
 * Block nodes (`stat`, `pillars`) keep their text in `fields`, not in child
 * text nodes, so they are left alone: both render on a short measure that does
 * not justify.
 */
export function bindOrphans<T extends SerializedEditorState>(
  state: T,
  locale: Locale
): T {
  if (locale !== 'pl') {
    return state
  }
  const copy = structuredClone(state)
  walk(copy.root)
  return copy
}

function walk(node: unknown): void {
  if (Array.isArray(node)) {
    for (const child of node) {
      walk(child)
    }
    return
  }
  if (!node || typeof node !== 'object') {
    return
  }
  const record = node as {
    type?: string
    text?: unknown
    format?: unknown
    children?: unknown
  }
  // A non-breaking space inside code is a different character, not typography.
  if (record.type === 'code') {
    return
  }
  if (
    record.type === 'text' &&
    typeof record.text === 'string' &&
    !(Number(record.format) & IS_CODE)
  ) {
    record.text = record.text.replace(ORPHAN, '$<letter>\u00A0')
  }
  walk(record.children)
}
