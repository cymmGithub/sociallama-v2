/**
 * Polish orphan-word audit over the site's static copy.
 *
 *   bun ./lib/scripts/audit-static-orphans.ts             # report only
 *   bun ./lib/scripts/audit-static-orphans.ts --apply     # bind T1 prose gaps
 *   bun ./lib/scripts/audit-static-orphans.ts --json <p>  # machine-readable
 *
 * Scope is the Polish site copy: `lib/content/*.ts` (the single source of truth
 * — components are forbidden from hardcoding copy) plus the handful of pages
 * that render copy inline anyway. Blog routes are excluded: their visible text
 * is WordPress-imported post content, which has its own pipeline.
 *
 * `--apply` writes only T1 gaps inside prose. Everything else — T2, T3, and any
 * gap inside all-caps display type or a label of five words or fewer — is
 * reported for a human, because binding inside short display type moves a line
 * break instead of removing one.
 *
 * ts-morph is used purely to locate literals. The rewrite is byte surgery on
 * the exact gap, mapped back through the literal's escape sequences, so a
 * string carrying `—` or `\n` is not re-serialized and the diff shows the
 * bind and nothing else.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import { Node, Project, type SourceFile, SyntaxKind } from 'ts-morph'
import {
  classify,
  excerptAround,
  findOrphans,
  isCopyValue,
  type OrphanHit,
  type Shape,
  type Tier,
} from '@/lib/typography/orphan-rules'

const ROOT = process.cwd()

/**
 * Directories are walked, not globbed. `app/(frontend)/**` matches nothing:
 * the parentheses are glob group syntax, so the route group never matches its
 * own directory name and the whole app scans as zero files — which reads as a
 * clean audit rather than an unscanned app. `assertNonEmpty` is the tripwire.
 */
const SCAN: { dir: string; ext: string }[] = [
  { dir: 'lib/content', ext: '.ts' },
  { dir: 'app/(frontend)', ext: '.tsx' },
  { dir: 'components', ext: '.tsx' },
]

/**
 * `*.en.ts` is out of scope — the rule is Polish-only. `site.ts` is excluded
 * whole: every export in it is `<meta>` content, which is never laid out.
 * Blog routes render WordPress-imported post content, which has its own
 * pipeline; their chrome lives in `lib/content/blog.ts`, which stays in scope.
 */
const EXCLUDE =
  /(?:\.(?:en|test|stories)\.(?:ts|tsx)$|lib\/content\/site\.ts$|app\/\(frontend\)\/(?:blog|category|\[slug\])\/)/

/**
 * Property chains that never reach the layout. Matched as a pattern rather than
 * a fixed list because the repo names these objects three ways — `meta`,
 * `oNasMeta`, `metadata` — and a list that held only `metadata` let fifty
 * `<title>` and `<meta name="description">` strings through. A browser title is
 * never wrapped, so a bind in one is diff noise.
 */
const METADATA_KEY =
  /^(?:meta(?:data)?|openGraph|twitter|alternates|seo|robots|verification|icons)$|Meta$|^meta[A-Z]/

/**
 * Rules that `--apply` may write even though they are report-only by default,
 * e.g. `--also-rule postcode`. A Polish postcode must not part from its town,
 * and the two footer addresses are the single most-seen widow on the site — but
 * they read as short labels, so both the tier hold and the shape hold would
 * otherwise block them.
 */
const alsoAt = process.argv.indexOf('--also-rule')
const ALSO_RULE = new Set(
  alsoAt === -1
    ? []
    : (process.argv[alsoAt + 1] ?? '').split(',').filter(Boolean)
)

export interface Finding {
  file: string
  line: number
  column: number
  /** Dotted property path, as close as the AST can name it. */
  path: string
  key: string
  tier: Tier
  rule: string
  shape: Shape
  token: string
  excerpt: string
  /** True when `--apply` would rewrite this gap. */
  actionable: boolean
  /** Why it was held back, when it was. */
  held?: string
}

interface Candidate {
  file: SourceFile
  /** Absolute start of the literal body inside the file. */
  bodyStart: number
  /** Raw body text, quotes excluded. */
  raw: string
  /** Decoded value the reader sees. */
  value: string
  key: string
  path: string
  /** JSX text needs `&nbsp;`; a literal needs ` `. */
  kind: 'literal' | 'jsx'
  /** Set when the node cannot be rewritten safely. */
  blocked?: string
}

// ---------------------------------------------------------------------------
// Escape mapping
// ---------------------------------------------------------------------------

const SIMPLE_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  b: '\b',
  f: '\f',
  v: '\v',
  '0': '\0',
}

/**
 * Decodes a literal body and records, for every value character, where it
 * started in the raw text and how many raw characters it spent. That mapping
 * is what lets a single space be replaced without touching neighbouring
 * escapes.
 */
function decode(raw: string): {
  value: string
  starts: number[]
  lengths: number[]
} {
  let value = ''
  const starts: number[] = []
  const lengths: number[] = []
  let at = 0
  while (at < raw.length) {
    const from = at
    const char = raw[at] as string
    if (char !== '\\') {
      value += char
      at += 1
    } else {
      const next = raw[at + 1] as string
      if (next === 'u' && raw[at + 2] === '{') {
        const close = raw.indexOf('}', at + 3)
        value += String.fromCodePoint(
          Number.parseInt(raw.slice(at + 3, close), 16)
        )
        at = close + 1
      } else if (next === 'u') {
        value += String.fromCharCode(
          Number.parseInt(raw.slice(at + 2, at + 6), 16)
        )
        at += 6
      } else if (next === 'x') {
        value += String.fromCharCode(
          Number.parseInt(raw.slice(at + 2, at + 4), 16)
        )
        at += 4
      } else if (next === '\n') {
        // Line continuation contributes nothing to the value.
        at += 2
        continue
      } else {
        value += SIMPLE_ESCAPES[next] ?? next
        at += 2
      }
    }
    starts.push(from)
    lengths.push(at - from)
  }
  return { value, starts, lengths }
}

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

/** Nearest enclosing property name, looking through arrays and objects. */
function propertyPath(node: Node): {
  key: string
  path: string
  metadata: boolean
} {
  const parts: string[] = []
  let metadata = false
  let cursor: Node | undefined = node
  while (cursor) {
    if (
      Node.isPropertyAssignment(cursor) ||
      Node.isShorthandPropertyAssignment(cursor)
    ) {
      const name = cursor.getName().replace(/^['"`]|['"`]$/g, '')
      parts.unshift(name)
      if (METADATA_KEY.test(name)) {
        metadata = true
      }
    } else if (
      Node.isVariableDeclaration(cursor) ||
      Node.isFunctionDeclaration(cursor)
    ) {
      const name = cursor.getName()
      if (name) {
        parts.unshift(name)
        if (METADATA_KEY.test(name)) {
          metadata = true
        }
      }
    } else if (Node.isJsxAttribute(cursor)) {
      parts.unshift(cursor.getNameNode().getText())
    }
    cursor = cursor.getParent()
  }
  return { key: parts.at(-1) ?? '', path: parts.join('.'), metadata }
}

/** Inside a `cn()`/`clsx()`/`cva()` call, every string is a class name. */
function inClassCall(node: Node): boolean {
  let cursor: Node | undefined = node
  while (cursor) {
    if (Node.isCallExpression(cursor)) {
      const name = cursor.getExpression().getText()
      if (
        name === 'cn' ||
        name === 'clsx' ||
        name === 'cva' ||
        name === 'twMerge'
      ) {
        return true
      }
    }
    cursor = cursor.getParent()
  }
  return false
}

/**
 * Outside `lib/content`, a string has to prove it is Polish before the Polish
 * rule is applied to it. A word count is not proof — it let in six English
 * strings whose stranded "a" ("must be used within a ChromeProvider") is not a
 * sierotka, because English has no such rule. A diacritic is proof.
 */
function looksPolish(value: string): boolean {
  return /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(value)
}

/** Thrown messages are for developers, and are never laid out. */
function inThrow(node: Node): boolean {
  let cursor: Node | undefined = node
  while (cursor) {
    if (Node.isThrowStatement(cursor)) {
      return true
    }
    cursor = cursor.getParent()
  }
  return false
}

function collect(file: SourceFile, isTsx: boolean): Candidate[] {
  const out: Candidate[] = []

  for (const node of [
    ...file.getDescendantsOfKind(SyntaxKind.StringLiteral),
    ...file.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral),
  ]) {
    const { key, path, metadata } = propertyPath(node)
    const value = node.getLiteralValue()
    if (
      metadata ||
      !isCopyValue(key, value) ||
      inClassCall(node) ||
      inThrow(node)
    ) {
      continue
    }
    if (isTsx && !looksPolish(value)) {
      continue
    }
    const text = node.getText()
    out.push({
      file,
      bodyStart: node.getStart() + 1,
      raw: text.slice(1, -1),
      value,
      key,
      path,
      kind: 'literal',
    })
  }

  // A template with `${}` in it cannot be mapped gap-for-gap without splitting
  // the spans, and there are none in scope — reported rather than silently
  // skipped, so a future one is not missed.
  for (const node of file.getDescendantsOfKind(SyntaxKind.TemplateExpression)) {
    const value = node.getText()
    if (!looksPolish(value)) {
      continue
    }
    const { key, path } = propertyPath(node)
    out.push({
      file,
      bodyStart: node.getStart(),
      raw: value,
      value,
      key,
      path,
      kind: 'literal',
      blocked: 'template literal with substitutions — bind by hand',
    })
  }

  if (!isTsx) {
    return out
  }

  for (const node of file.getDescendantsOfKind(SyntaxKind.JsxText)) {
    const raw = node.getText()
    if (!(raw.trim() && looksPolish(raw))) {
      continue
    }
    const { path } = propertyPath(node)
    out.push({
      file,
      bodyStart: node.getStart(),
      raw,
      value: raw,
      key: 'jsx-text',
      path: path || 'jsx-text',
      kind: 'jsx',
      // Entities shift raw offsets away from value offsets.
      ...(raw.includes('&')
        ? { blocked: 'JSX text contains an entity — bind by hand' }
        : {}),
    })
  }

  return out
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

interface Edit {
  start: number
  end: number
  text: string
}

/**
 * Every file in scope, by directory walk. Throws when a directory yields
 * nothing, because a scanner that finds no files reports a clean audit.
 */
function scanPaths(): string[] {
  const out: string[] = []
  for (const { dir, ext } of SCAN) {
    const found = readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter((entry) => entry.endsWith(ext))
      .map((entry) => `${dir}/${entry}`)
      .filter((path) => !EXCLUDE.test(path))
    if (found.length === 0) {
      throw new Error(
        `no ${ext} files under ${dir} — the scan would silently pass`
      )
    }
    out.push(...found)
  }
  return out
}

function main(): void {
  const apply = process.argv.includes('--apply')
  const jsonAt = process.argv.indexOf('--json')
  const jsonPath = jsonAt === -1 ? undefined : process.argv[jsonAt + 1]

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  })
  for (const path of scanPaths()) {
    project.addSourceFileAtPath(path)
  }

  const findings: Finding[] = []
  const editsByFile = new Map<SourceFile, Edit[]>()
  let scanned = 0

  for (const file of project.getSourceFiles()) {
    const path = relative(ROOT, file.getFilePath())
    const isTsx = path.endsWith('.tsx')
    if (EXCLUDE.test(path)) {
      continue
    }
    scanned += 1

    for (const candidate of collect(file, isTsx)) {
      const hits = findOrphans(candidate.value)
      if (hits.length === 0) {
        continue
      }
      const shape = classify(candidate.value)
      const { value: decoded, starts, lengths } = decode(candidate.raw)
      // The offsets are only trustworthy if the decoder reproduces exactly what
      // TypeScript itself read out of the literal. An off-by-one here would
      // write a non-breaking space into the middle of a word, so it is a hard
      // stop rather than a warning.
      if (candidate.kind === 'literal' && decoded !== candidate.value) {
        throw new Error(
          `escape decode mismatch at ${path}:${file.getLineAndColumnAtPos(candidate.bodyStart).line} — ` +
            `${JSON.stringify(decoded.slice(0, 60))} vs ${JSON.stringify(candidate.value.slice(0, 60))}`
        )
      }

      for (const hit of hits) {
        const held = holdReason(hit, shape, candidate)
        const pos = file.getLineAndColumnAtPos(
          candidate.bodyStart + (starts[hit.index] ?? 0)
        )
        findings.push({
          file: path,
          line: pos.line,
          column: pos.column,
          path: candidate.path,
          key: candidate.key,
          tier: hit.tier,
          rule: hit.rule,
          shape,
          token: hit.token,
          excerpt: excerptAround(candidate.value, hit),
          actionable: !held,
          ...(held ? { held } : {}),
        })
        if (held || !apply) {
          continue
        }
        const from = starts[hit.index]
        const lastIndex = hit.index + hit.length - 1
        const to = (starts[lastIndex] ?? 0) + (lengths[lastIndex] ?? 1)
        if (from === undefined) {
          continue
        }
        const edits = editsByFile.get(file) ?? []
        edits.push({
          start: candidate.bodyStart + from,
          end: candidate.bodyStart + to,
          text: candidate.kind === 'jsx' ? '&nbsp;' : '\\u00A0',
        })
        editsByFile.set(file, edits)
      }
    }
  }

  if (apply) {
    write(editsByFile)
  }
  report(findings, scanned, apply)
  if (jsonPath) {
    writeFileSync(jsonPath, JSON.stringify(findings, null, 2))
    console.log(`\nJSON → ${jsonPath}`)
  }
}

/** Why a gap is reported rather than bound. Empty means it is safe to bind. */
function holdReason(
  hit: OrphanHit,
  shape: Shape,
  candidate: Candidate
): string | undefined {
  if (candidate.blocked) {
    return candidate.blocked
  }
  const waived = ALSO_RULE.has(hit.rule)
  if (hit.tier !== 'T1' && !waived) {
    return `${hit.tier} — report-only tier`
  }
  if (shape !== 'prose' && !waived) {
    return `${shape} — a bind here moves the break, it does not remove it`
  }
  // In JSX text a long run is a source line break plus indentation, which the
  // renderer collapses to one space; binding it pulls the pair onto one line
  // and the formatter re-wraps. In a string literal a run longer than one is
  // either a double space or a deliberate `\n`, and neither is ours to decide.
  if (hit.length !== 1 && candidate.kind !== 'jsx') {
    return `whitespace run of ${hit.length} — collapse it by hand first`
  }
  return undefined
}

/** Applies edits back to front so earlier offsets stay valid. */
function write(editsByFile: Map<SourceFile, Edit[]>): void {
  for (const [file, edits] of editsByFile) {
    const path = file.getFilePath()
    let text = readFileSync(path, 'utf8')
    for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
      text = text.slice(0, edit.start) + edit.text + text.slice(edit.end)
    }
    writeFileSync(path, text)
    console.log(
      `  wrote ${edits.length.toString().padStart(3)}  ${relative(ROOT, path)}`
    )
  }
}

function tally<T extends string>(
  rows: readonly Finding[],
  of: (f: Finding) => T
): [T, number][] {
  const counts = new Map<T, number>()
  for (const row of rows) {
    counts.set(of(row), (counts.get(of(row)) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

function report(findings: Finding[], scanned: number, applied: boolean): void {
  const actionable = findings.filter((f) => f.actionable)
  console.log(
    `\n${applied ? 'APPLIED' : 'REPORT'} — ${scanned} files scanned\n`
  )
  console.log(`  total gaps found      ${findings.length}`)
  console.log(
    `  T1 prose (${applied ? 'bound' : 'bindable'})   ${actionable.length}`
  )
  console.log(
    `  held for review       ${findings.length - actionable.length}\n`
  )

  console.log('  by tier / rule')
  for (const [rule, n] of tally(
    findings,
    (f) => `${f.tier} ${f.rule}` as string
  )) {
    console.log(`    ${n.toString().padStart(5)}  ${rule}`)
  }
  console.log('\n  held, by reason')
  for (const [reason, n] of tally(
    findings.filter((f) => !f.actionable),
    (f) => (f.held ?? '') as string
  )) {
    console.log(`    ${n.toString().padStart(5)}  ${reason}`)
  }
  console.log('\n  actionable, by file')
  for (const [file, n] of tally(actionable, (f) => f.file as string)) {
    console.log(`    ${n.toString().padStart(5)}  ${file}`)
  }
  const beside = findings.filter((f) => f.excerpt.includes('⍽')).length
  if (beside > 0) {
    console.log(
      `\n  ${beside} gap(s) sit beside a non-breaking space that is already there`
    )
  }
}

main()
