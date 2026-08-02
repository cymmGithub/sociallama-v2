/**
 * String Utilities
 *
 * Helper functions for string manipulation.
 */

/**
 * Converts text to URL-friendly slug format.
 *
 * @param text - Text to convert (must have toString method)
 * @returns URL-safe slug string
 *
 * @example
 * ```ts
 * slugify('Hello World!') // 'hello-world'
 * slugify('Café & Restaurant') // 'cafe-restaurant'
 * ```
 */
export function slugify(text: { toString: () => string }) {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

/**
 * Strip all HTML tags to plain text via a single linear scan.
 *
 * Deliberately NOT a regex replace: `str.replace(/<[^>]*>/g, '')` is an
 * incomplete sanitizer (CodeQL js/incomplete-multi-character-sanitization) that
 * can leave an unterminated `<script` or reassemble a tag from the remainder. A
 * character scan drops everything between `<` and the next `>` in one pass and
 * discards a trailing unterminated tag, so the output can never contain markup.
 *
 * @param input - Possibly-HTML string (e.g. HubSpot rich text)
 * @returns Plain text with all tags removed
 *
 * @example
 * ```ts
 * stripHtmlTags('<p>Hello</p>')  // 'Hello'
 * stripHtmlTags('safe <script')  // 'safe ' (unterminated tag dropped)
 * ```
 */
export function stripHtmlTags(input: string): string {
  let output = ''
  let insideTag = false
  for (const char of input) {
    if (char === '<') {
      insideTag = true
    } else if (char === '>') {
      insideTag = false
    } else if (!insideTag) {
      output += char
    }
  }
  return output
}
