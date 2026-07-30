/**
 * Polish orphan-word ("sierotka") typography rules.
 *
 * Polish typesetting forbids leaving a short function word alone at the end of
 * a line. The blog import pipeline already encodes this as design D10
 * (`lib/payload/audit-post-formatting.ts`), but only to decide which inherited
 * WordPress non-breaking spaces are legitimate — it never inserts any. Nothing
 * applied the rule to the site's own copy, so this module is the inserting
 * half, shared by the static scanner and the case-study scanner.
 *
 * Three tiers, because they carry very different confidence:
 *
 *   T1  single-letter function words (a i o u w z) — a hard rule.
 *   T2  two-letter function words — standard practice, but `to`/`co`/`by` are
 *       also pronouns and verbs, so the diff inflates for arguable gain.
 *   T3  numbers ↔ units/currency, thousands separators, abbreviations. Same
 *       non-breaking mechanism, a different rule. `lib/content/home.ts`
 *       already does this by hand in four `figure` values and nowhere else.
 *
 * Tier is only half the decision. `classify` is the other half: the rule is a
 * body-copy rule, and forcing a bind inside a three-word display headline
 * ("KREACJE I WIDEO") does not remove a bad break, it manufactures one by
 * pushing a word down. Only `prose` is safe to rewrite unattended.
 */

/** Written as an escape, always: a raw U+00A0 is invisible in review. */
export const NBSP = '\u00A0'

export type Tier = 'T1' | 'T2' | 'T3'

/** How a string wraps, which decides whether a bind helps or hurts. */
export type Shape = 'prose' | 'all-caps' | 'short-label'

export interface OrphanHit {
  tier: Tier
  /** Which rule matched, for grouping the report. */
  rule: string
  /** Index of the whitespace run to replace, within the string. */
  index: number
  /** Length of that run. Anything but 1 is an anomaly worth seeing. */
  length: number
  /** The token that would be stranded at the line end. */
  token: string
}

interface Rule {
  tier: Tier
  rule: string
  re: RegExp
  /** 1-based capture group holding the stranded token. */
  token: number
  /** 1-based capture group holding the whitespace run. */
  space: number
}

/** Two-letter function words. Deliberately excludes `on`/`my`/`ty`/`no`. */
const T2_WORDS = 'bo|by|co|do|ku|na|od|po|we|za|ze|że|ni|aż|iż|to'

/**
 * Units and currencies that must not part from their number. `dni` and `lat`
 * were added after the audit: `3 dni` split across a line break in both job ads
 * on /zostan-lama and the rule could not see it.
 */
const UNITS =
  '%|zł|PLN|EUR|USD|mln|mld|tys\\.?|proc\\.?|r\\.|godz\\.?|min\\.?|sek\\.?|km|kg|cm|mm|szt\\.?|os\\.?|pkt|dni|dzień|lat|lata|€|\\$'

/**
 * Abbreviations that must not part from what they qualify. `art`, `ust`, `lit`
 * and `pkt` were added after the audit: legal citations of the form
 * `art. 7 ust. 3 RODO` are all over the privacy policy and none were visible.
 */
const ABBREV =
  'np|tj|ok|tzn|itd|itp|nr|ul|al|św|dr|prof|inż|mgr|art|ust|lit|pkt|m\\.in'

/**
 * What may not sit immediately before a function word for it to count as a
 * standalone word. Letters and digits are obvious; the punctuation is not.
 * `odpowiedzialny/a za:` puts a feminine suffix exactly where a lookbehind of
 * letters alone reads a standalone `a`, and binding it glues the suffix to the
 * following word. `A/B`, `i/lub`, `e-mail` and `m.in` set the same trap.
 *
 * A sentence-initial function word is unaffected: "…tak. A my…" has a space
 * between the period and the `A`, so the character tested is the space.
 */
const NOT_WORD_START = "(?<![\\p{L}\\p{N}/\\-.'’‘])"

/**
 * The gap is any whitespace except a non-breaking space, rather than a plain
 * space, because JSX prose is source-wrapped: the gap after "…uwagę i" is a
 * newline plus indentation, which JSX collapses to one space at render time.
 * Matching only " " misses every orphan a source line break made, which in a
 * hand-written page is most of them.
 */
const GAP = '([^\\S\\u00A0]+)'

// The lookahead is there because a bind only means something before a token
// that could otherwise have started the next line.
const RULES: Rule[] = [
  {
    tier: 'T1',
    rule: 'single-letter',
    re: new RegExp(
      `${NOT_WORD_START}([aiouwzAIOUWZ])${GAP}(?=[\\p{L}\\p{N}„“”"'(])`,
      'dgu'
    ),
    token: 1,
    space: 2,
  },
  {
    tier: 'T2',
    rule: 'two-letter',
    re: new RegExp(
      `${NOT_WORD_START}(${T2_WORDS})${GAP}(?=[\\p{L}\\p{N}])`,
      'dgiu'
    ),
    token: 1,
    space: 2,
  },
  {
    tier: 'T3',
    rule: 'thousands',
    re: new RegExp(`(\\d)${GAP}(?=\\d{3}(?!\\d))`, 'dg'),
    token: 1,
    space: 2,
  },
  {
    tier: 'T3',
    rule: 'number-unit',
    re: new RegExp(`(\\d)${GAP}(?=(?:${UNITS})(?![\\p{L}]))`, 'dgu'),
    token: 1,
    space: 2,
  },
  {
    // A Polish postcode belongs to its town: "53-135 Wrocław" split across a
    // line break reads as two separate facts. The footer address does exactly
    // this at every viewport.
    tier: 'T3',
    rule: 'postcode',
    re: new RegExp(`(\\d{2}-\\d{3})${GAP}(?=\\p{Lu})`, 'dgu'),
    token: 1,
    space: 2,
  },
  {
    tier: 'T3',
    rule: 'abbreviation',
    re: new RegExp(
      `${NOT_WORD_START}(${ABBREV})\\.${GAP}(?=[\\p{L}\\p{N}])`,
      'dgu'
    ),
    token: 1,
    space: 2,
  },
]

/** T1 outranks T3 outranks T2 when two rules claim the same gap. */
const PRECEDENCE: Record<Tier, number> = { T1: 0, T3: 1, T2: 2 }

/**
 * Every gap in `text` that a tier would bind, one hit per gap — the strongest
 * tier wins a contested gap, so hits never overlap and can be applied in one
 * pass.
 */
export function findOrphans(text: string): OrphanHit[] {
  const byGap = new Map<number, OrphanHit>()
  for (const { tier, rule, re, token, space } of RULES) {
    // Regex literals with `g` carry state; each rule is reused across
    // thousands of strings, so reset rather than trust the previous caller.
    re.lastIndex = 0
    for (const match of text.matchAll(re)) {
      const at = match.indices?.[space]
      if (!at) {
        continue
      }
      const [index, end] = at
      const hit: OrphanHit = {
        tier,
        rule,
        index,
        length: end - index,
        token: match[token] as string,
      }
      const held = byGap.get(index)
      if (!held || PRECEDENCE[tier] < PRECEDENCE[held.tier]) {
        byGap.set(index, hit)
      }
    }
  }
  return [...byGap.values()].sort((a, b) => a.index - b.index)
}

/** `text` with each hit's whitespace run replaced by one non-breaking space. */
export function applyOrphans(text: string, hits: readonly OrphanHit[]): string {
  let out = text
  for (const hit of [...hits].sort((a, b) => b.index - a.index)) {
    out = out.slice(0, hit.index) + NBSP + out.slice(hit.index + hit.length)
  }
  return out
}

/**
 * How the string wraps. `all-caps` and `short-label` are display type whose
 * line breaks the layout — or a designer — already governs; binding inside
 * them moves a break rather than removing one, so they are reported, never
 * rewritten unattended.
 */
export function classify(text: string): Shape {
  const trimmed = text.trim()
  if (!/[a-ząćęłńóśźż]/.test(trimmed)) {
    return 'all-caps'
  }
  if (trimmed.split(/\s+/).length <= 5) {
    return 'short-label'
  }
  return 'prose'
}

/** Keys whose values are never read as prose by a sighted visitor. */
const NON_COPY_KEYS = new Set([
  'href',
  'src',
  'poster',
  'logo',
  'icon',
  'image',
  'photo',
  'slug',
  'caseStudySlug',
  'pairSlug',
  'key',
  'id',
  'video',
  'clip',
  'className',
  'class',
  'metaTitle',
  'metaDescription',
])

/**
 * Whether a `key: value` pair is visible copy. `alt` is excluded on purpose:
 * it is never laid out, so a bind there is diff noise rather than typography.
 */
export function isCopyValue(key: string, value: string): boolean {
  if (NON_COPY_KEYS.has(key) || key.toLowerCase().endsWith('alt')) {
    return false
  }
  if (!value.includes(' ')) {
    return false
  }
  return !/^(?:https?:|\/|#|mailto:|tel:)/.test(value)
}

/** The gap in context, non-breaking spaces made visible for the report. */
export function excerptAround(text: string, hit: OrphanHit, pad = 34): string {
  const from = Math.max(0, hit.index - pad)
  const to = Math.min(text.length, hit.index + hit.length + pad)
  const body = text
    .slice(from, to)
    .replace(/\u00A0/g, '⍽')
    .replace(/\s+/g, ' ')
  return `${from > 0 ? '…' : ''}${body}${to < text.length ? '…' : ''}`
}
