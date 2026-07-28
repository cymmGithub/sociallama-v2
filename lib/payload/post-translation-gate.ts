/**
 * The mechanical gate between a translation and the database (design D4).
 *
 * Pure functions, no I/O, so the batch workflow and the verifier run the SAME
 * code and cannot disagree about what a defect is — the discipline
 * `post-formatting-rules.ts` already established for the repair scripts.
 *
 * It checks only what a machine can check with certainty: that the English
 * tree has the same shape as the Polish one, that the markup is grammar and
 * nothing but grammar, and that a slug is usable as a URL. Whether the English
 * is any *good* is a separate job, done by a fresh agent that never saw the
 * translation being produced.
 *
 * Two severities, and the distinction is deliberate:
 *   error — refuse the write. A structural claim is provably false.
 *   warn  — write, but surface it. Something is suspicious, not wrong.
 *
 * Polish diacritics are the canonical `warn`. "Łukasz Płociński", "Pracuj.pl"
 * and Polish place names survive translation legitimately, and the glossary
 * rule requires it, so a hard reject would contradict the brief. Flagging what
 * falls outside an allowlist is the most a machine can honestly assert.
 */

import { MAX_HEADING_LENGTH } from '@/lib/payload/post-formatting-rules'
import {
  type Projection,
  type ProjNode,
  parse,
  project,
  runsOf,
} from '@/lib/payload/post-projection'
import {
  RESERVED_EN_POST_SLUGS,
  RESERVED_SLUGS,
} from '@/lib/payload/reserved-slugs'

export interface Finding {
  level: 'error' | 'warn'
  /** Where it is, in terms a human can act on: `block 4`, `slug`, `title`. */
  where: string
  message: string
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const POLISH_DIACRITIC = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/
const TAG = /<(\/?)(b|i|s|u|code|sub|sup|br|tab|z|a\d+)\/?>/g

const error = (where: string, message: string): Finding => ({
  level: 'error',
  where,
  message,
})
const warn = (where: string, message: string): Finding => ({
  level: 'warn',
  where,
  message,
})

/** Every tag in a projection string, in order, as written. */
function tagsOf(markup: string): string[] {
  return [...markup.matchAll(TAG)].map((match) => match[0])
}

const EMPHASIS = /<\/?(?:b|i|s|u|code|sub|sup)>/g

/**
 * The run's *structural* shape: line breaks, tabs, zero-length nodes and link
 * boundaries, with each stretch of prose collapsed to a single `·`.
 *
 * The tag-sequence check alone cannot see a `<br/>` that moved from the middle
 * of a run to its start — the sequence of tags is identical either way, since
 * it orders tags only against each other. Interleaving a marker for prose is
 * what makes position checkable when the prose itself has changed length and
 * wording.
 *
 * Emphasis is deliberately stripped first. Where a bold run sits relative to
 * the words IS a translation decision — English moves it — whereas a line
 * break is authored structure and must not move. Task 8.4 asks for positions
 * of `<br/>`/`<tab/>` and presence of `<aN>`, and this is exactly that.
 */
function structuralShape(markup: string): string {
  const withoutEmphasis = markup.replace(EMPHASIS, '')
  const tokens: string[] = []
  let cursor = 0
  for (const match of withoutEmphasis.matchAll(TAG)) {
    if (withoutEmphasis.slice(cursor, match.index).trim() !== '') {
      tokens.push('·')
    }
    tokens.push(match[0])
    cursor = (match.index ?? 0) + match[0].length
  }
  if (withoutEmphasis.slice(cursor).trim() !== '') {
    tokens.push('·')
  }
  return tokens.join(' ')
}

/**
 * The translated markup for ONE run, against the Polish projection it came
 * from.
 *
 * The tag sequence has to match exactly — same tags, same order, same count.
 * That is a stronger claim than "balanced and grammar-only", and it is the
 * right one: a translator may reorder words freely, but reordering emphasis
 * relative to a line break, or dropping a link, changes the document rather
 * than the language.
 */
export function checkRunMarkup(
  source: Projection,
  translated: string,
  where: string
): Finding[] {
  const findings: Finding[] = []

  // Parsing is itself the balance/grammar check: `parse` throws on an
  // unclosed tag, crossed tags, an unescaped `<`, or a tag outside the
  // grammar. Running it here means the gate rejects what the writer would
  // have choked on later.
  try {
    parse({ ...source, text: translated })
  } catch (cause) {
    return [error(where, `markup will not parse: ${(cause as Error).message}`)]
  }

  const before = tagsOf(source.text)
  const after = tagsOf(translated)

  if (before.join(' ') !== after.join(' ')) {
    findings.push(
      error(
        where,
        `tag sequence changed:\n      PL: ${before.join(' ') || '(none)'}\n      EN: ${after.join(' ') || '(none)'}`
      )
    )
  }

  // Named separately from the sequence check so a report says WHICH link went
  // missing rather than only that something moved.
  source.links.forEach((_, index) => {
    const open = (translated.match(new RegExp(`<a${index}>`, 'g')) ?? []).length
    if (open !== 1) {
      findings.push(
        error(where, `<a${index}> appears ${open} time(s), expected exactly 1`)
      )
    }
  })

  const invented = after
    .filter((tag) => /^<a\d+>$/.test(tag))
    .map((tag) => Number(tag.slice(2, -1)))
    .filter((index) => index >= source.links.length)
  for (const index of invented) {
    findings.push(error(where, `<a${index}> has no link in the source`))
  }

  const shapeBefore = structuralShape(source.text)
  const shapeAfter = structuralShape(translated)
  if (shapeBefore !== shapeAfter) {
    findings.push(
      error(
        where,
        `line breaks or links moved:\n      PL: ${shapeBefore || '(prose only)'}\n      EN: ${shapeAfter || '(prose only)'}`
      )
    )
  }

  if (translated.trim() === '' && source.text.trim() !== '') {
    findings.push(error(where, 'translated to nothing'))
  }

  return findings
}

/**
 * The English body tree against the Polish one.
 *
 * Compares what translation must never change: how many runs there are, which
 * node each run hangs off, and every structural node between them — uploads by
 * media id, headings by tag, in document order.
 */
export function checkTree(pl: ProjNode, en: ProjNode): Finding[] {
  const findings: Finding[] = []

  const plRuns = runsOf(pl)
  const enRuns = runsOf(en)
  if (plRuns.length !== enRuns.length) {
    findings.push(
      error(
        'body',
        `${plRuns.length} translatable run(s) in Polish, ${enRuns.length} in English`
      )
    )
  }

  /** Structural spine: every non-inline node, by type and identity. */
  const spine = (root: ProjNode): string[] => {
    const out: string[] = []
    const walk = (node: ProjNode) => {
      for (const child of node.children ?? []) {
        const type = String(child.type)
        if (type === 'upload') {
          out.push(`upload:${String(child.value)}`)
        } else if (type === 'heading') {
          out.push(`heading:${String(child.tag)}`)
        } else if (type === 'horizontalrule') {
          out.push('hr')
        } else if (type === 'list') {
          out.push(`list:${String(child.listType ?? '')}`)
        } else if (type === 'quote' || type === 'listitem') {
          out.push(type)
        }
        walk(child)
      }
    }
    walk(root)
    return out
  }

  const plSpine = spine(pl)
  const enSpine = spine(en)
  if (plSpine.join(' | ') !== enSpine.join(' | ')) {
    const at = plSpine.findIndex((entry, index) => entry !== enSpine[index])
    findings.push(
      error(
        'body',
        `structure diverges at position ${at === -1 ? plSpine.length : at}: ` +
          `PL ${plSpine[at] ?? '(end)'} vs EN ${enSpine[at] ?? '(end)'}`
      )
    )
  }

  // Run-for-run markup, which also catches a link or line break that moved
  // WITHIN a run rather than between runs.
  const limit = Math.min(plRuns.length, enRuns.length)
  for (let index = 0; index < limit; index += 1) {
    const plRun = plRuns[index]
    const enRun = enRuns[index]
    if (!(plRun && enRun)) {
      continue
    }
    const plNodes = (plRun.parent.children ?? []).slice(plRun.start, plRun.end)
    const enNodes = (enRun.parent.children ?? []).slice(enRun.start, enRun.end)
    findings.push(
      ...checkRunMarkup(project(plNodes), project(enNodes).text, `run ${index}`)
    )
  }

  return findings
}

/** An English post slug: URL-safe, unused, and not shadowed by a route. */
export function checkSlug(
  slug: string,
  options: { takenBy?: string | undefined; polishSlug?: string } = {}
): Finding[] {
  const findings: Finding[] = []
  if (!slug) {
    return [error('slug', 'missing')]
  }
  if (!SLUG_PATTERN.test(slug)) {
    findings.push(
      error('slug', `"${slug}" is not URL-safe (lowercase, digits, hyphens)`)
    )
  }
  if (RESERVED_EN_POST_SLUGS.includes(slug)) {
    findings.push(
      error(
        'slug',
        `"${slug}" is a static sibling of /en/blog/[slug] and would never render`
      )
    )
  }
  if (options.takenBy && options.takenBy !== options.polishSlug) {
    findings.push(
      error('slug', `"${slug}" is already used by ${options.takenBy}`)
    )
  }
  if (options.polishSlug && slug === options.polishSlug) {
    findings.push(
      warn('slug', `unchanged from Polish ("${slug}") — is it really English?`)
    )
  }
  // Not an error: the Polish list describes root-level collisions, which an
  // /en/blog-namespaced slug cannot have. Worth saying out loud all the same.
  if (RESERVED_SLUGS.includes(slug)) {
    findings.push(
      warn('slug', `"${slug}" is reserved in Polish; harmless here, but odd`)
    )
  }
  return findings
}

/** Headings the table-of-contents rail has to survive (`post-formatting-rules`). */
export function checkHeadings(root: ProjNode): Finding[] {
  const findings: Finding[] = []
  let index = 0
  const walk = (node: ProjNode) => {
    for (const child of node.children ?? []) {
      if (child.type === 'heading') {
        const text = textOf(child)
        if (text.length > MAX_HEADING_LENGTH) {
          findings.push(
            error(
              `heading ${index}`,
              `${text.length} chars, over the ${MAX_HEADING_LENGTH} limit: "${text.slice(0, 60)}…"`
            )
          )
        }
        if (text.trim() === '') {
          findings.push(error(`heading ${index}`, 'empty'))
        }
        index += 1
      }
      walk(child)
    }
  }
  walk(root)
  return findings
}

/** Concatenated text of a node's descendants. */
export function textOf(node: ProjNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }
  return (node.children ?? []).map(textOf).join('')
}

/**
 * Polish left in English prose — a warning, never a rejection.
 *
 * Proper nouns survive translation by design, so the allowlist carries the
 * glossary and the author names. Anything outside it is reported for a human,
 * because "this word has an ogonek" is evidence, not proof.
 */
export function checkDiacritics(
  text: string,
  allowlist: readonly string[],
  where: string
): Finding[] {
  const allowed = new Set(allowlist.map((entry) => entry.toLowerCase()))
  const suspects = new Set<string>()
  for (const word of text.split(/[\s,.;:!?()„“”"'’—–-]+/)) {
    if (!(word && POLISH_DIACRITIC.test(word))) {
      continue
    }
    if (allowed.has(word.toLowerCase())) {
      continue
    }
    // A word inside an allowlisted phrase ("Łączy nas piłka") is covered too.
    if ([...allowed].some((entry) => entry.includes(word.toLowerCase()))) {
      continue
    }
    suspects.add(word)
  }
  return suspects.size === 0
    ? []
    : [
        warn(
          where,
          `Polish outside the allowlist: ${[...suspects].slice(0, 12).join(', ')}`
        ),
      ]
}

/** Did anything refuse the write? */
export function hasErrors(findings: readonly Finding[]): boolean {
  return findings.some((finding) => finding.level === 'error')
}

/** One-line-per-finding report, for a console or a STATUS.md row. */
export function formatFindings(findings: readonly Finding[]): string {
  return findings
    .map((f) => `  ${f.level === 'error' ? '✗' : '!'} ${f.where}: ${f.message}`)
    .join('\n')
}
