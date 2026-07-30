/**
 * Polish orphan-word audit over the 48 case studies, whose copy lives only in
 * the database — the PL content is not in git, so a bad write has no
 * `git checkout` behind it. That is why `--apply` refuses to run without
 * `--backup <path>`, and why `--restore <path>` exists: the backup holds the
 * exact before/after of every field touched, and restore puts the befores back.
 * That path is tested, not assumed — 2409 gaps, apply, 0, restore, 2409 again.
 *
 *   bun ./lib/payload/audit-case-study-orphans.ts                       # report
 *   bun ./lib/payload/audit-case-study-orphans.ts --apply --backup b.json
 *   bun ./lib/payload/audit-case-study-orphans.ts --restore b.json
 *   bun ./lib/payload/audit-case-study-orphans.ts --json report.json
 *   …add --prod to target DATABASE_URL_PROD.
 *
 * Same rule and same restraint as the static scanner
 * (`lib/scripts/audit-static-orphans.ts`): T1 single-letter gaps inside prose
 * are bound, T2 and T3 and anything shaped like display type are reported.
 *
 * Rich text is resolved a block at a time through `blockNbspLeaves`, so a gap
 * that falls between two text nodes — "…w" in plain text, the next word inside
 * a `<strong>` — is still seen as one gap and written back to the node that
 * owns it.
 *
 * NOTE: writes bypass the deployed app, so revalidation hooks cannot reach the
 * live cache — after running against prod, redeploy or revalidate.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import {
  blockNbspLeaves,
  forEachTextBlock,
  type LexicalNode,
} from '@/lib/payload/post-formatting-rules'
import {
  classify,
  excerptAround,
  findOrphans,
  NBSP,
} from '@/lib/typography/orphan-rules'

// Both modules above are pure rule tables with no Payload import, so hoisting
// them above this block is safe. The env switch still has to precede the
// *dynamic* `@payload-config` import further down: payload.config validates
// DATABASE_URL at import time, so setting it afterwards would be too late.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('--prod requires DATABASE_URL_PROD in .env.local')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const APPLY = process.argv.includes('--apply')
const backupAt = process.argv.indexOf('--backup')
const BACKUP = backupAt === -1 ? undefined : process.argv[backupAt + 1]
const jsonAt = process.argv.indexOf('--json')
const JSON_OUT = jsonAt === -1 ? undefined : process.argv[jsonAt + 1]
const restoreAt = process.argv.indexOf('--restore')
const RESTORE = restoreAt === -1 ? undefined : process.argv[restoreAt + 1]

if (APPLY && !BACKUP) {
  throw new Error(
    '--apply needs --backup <path>: this copy exists only in the database, so ' +
      'the backup is the only way back'
  )
}

interface Change {
  slug: string
  id: string | number
  /** Dotted field path, e.g. `approach[2].body` or `excerpt`. */
  field: string
  before: string
  after: string
}

interface Held {
  slug: string
  field: string
  tier: string
  rule: string
  reason: string
  excerpt: string
}

const changes: Change[] = []
const held: Held[] = []
/** Gap-level count, so this run is comparable with the static scanner's. */
let boundGaps = 0

// ---------------------------------------------------------------------------
// Binding
// ---------------------------------------------------------------------------

/** T1 gaps in prose. Everything else is recorded and left alone. */
function plan(slug: string, field: string, text: string) {
  const hits = findOrphans(text)
  if (hits.length === 0) {
    return []
  }
  const shape = classify(text)
  const keep: typeof hits = []
  for (const hit of hits) {
    if (hit.tier !== 'T1') {
      held.push({
        slug,
        field,
        tier: hit.tier,
        rule: hit.rule,
        reason: `${hit.tier} — report-only tier`,
        excerpt: excerptAround(text, hit),
      })
    } else if (shape !== 'prose') {
      held.push({
        slug,
        field,
        tier: hit.tier,
        rule: hit.rule,
        reason: `${shape} — a bind here moves the break, it does not remove it`,
        excerpt: excerptAround(text, hit),
      })
    } else {
      keep.push(hit)
    }
  }
  return keep
}

/** Binds a plain string field. Returns the new value, or null when unchanged. */
function bindText(slug: string, field: string, text: string): string | null {
  const hits = plan(slug, field, text)
  if (hits.length === 0) {
    return null
  }
  let out = text
  for (const hit of [...hits].sort((a, b) => b.index - a.index)) {
    out = out.slice(0, hit.index) + NBSP + out.slice(hit.index + hit.length)
    boundGaps += 1
  }
  changes.push({ slug, id: '', field, before: text, after: out })
  return out
}

/**
 * Binds every block of a rich-text tree in place. A gap that starts in one text
 * node and ends in another is skipped — there is no single node to write it to.
 */
function bindRichText(slug: string, field: string, root: LexicalNode): boolean {
  let touched = false
  forEachTextBlock(root, (block) => {
    const leaves = blockNbspLeaves(block)
    const texts = leaves.map((leaf) => leaf.text)
    const full = texts.join('')
    if (!full.trim()) {
      return
    }
    const hits = plan(slug, field, full)
    if (hits.length === 0) {
      return
    }

    // Code-unit index → owning leaf, so a gap can be written back to the node
    // it came from. Code units, not code points: an emoji must occupy two slots
    // or every offset after it shifts.
    const owner = new Array<number>(full.length)
    const start = new Array<number>(leaves.length)
    let filled = 0
    for (const [at, leaf] of leaves.entries()) {
      start[at] = filled
      owner.fill(at, filled, filled + leaf.text.length)
      filled += leaf.text.length
    }

    const next = [...texts]
    for (const hit of [...hits].sort((a, b) => b.index - a.index)) {
      const at = owner[hit.index]
      if (at === undefined || owner[hit.index + hit.length - 1] !== at) {
        held.push({
          slug,
          field,
          tier: hit.tier,
          rule: hit.rule,
          reason: 'gap straddles two text nodes — bind in the admin',
          excerpt: excerptAround(full, hit),
        })
        continue
      }
      const leaf = leaves[at]
      if (!(leaf?.mutable && leaf.node)) {
        held.push({
          slug,
          field,
          tier: hit.tier,
          rule: hit.rule,
          reason: 'gap sits in a non-text leaf',
          excerpt: excerptAround(full, hit),
        })
        continue
      }
      const within = hit.index - (start[at] as number)
      const text = next[at] as string
      next[at] = text.slice(0, within) + NBSP + text.slice(within + hit.length)
      boundGaps += 1
    }

    const after = next.join('')
    if (after === full) {
      return
    }
    for (const [at, leaf] of leaves.entries()) {
      const rewritten = next[at]
      if (leaf.node && rewritten !== undefined && rewritten !== leaf.text) {
        leaf.node.text = rewritten
      }
    }
    changes.push({ slug, id: '', field, before: full, after })
    touched = true
  })
  return touched
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

if (RESTORE) {
  const saved = JSON.parse(readFileSync(RESTORE, 'utf8')) as {
    db: string
    docs: { id: string | number; slug: string; before: unknown }[]
  }
  if (saved.db !== dbHost) {
    throw new Error(
      `backup was taken against "${saved.db}" but this run targets "${dbHost}" — refusing`
    )
  }
  for (const doc of saved.docs) {
    await payload.update({
      collection: 'case-studies',
      id: doc.id,
      locale: 'pl',
      data: doc.before as Record<string, unknown>,
    })
    console.log(`  restored ${doc.slug}`)
  }
  console.log(`\nRestored ${saved.docs.length} case studies in ${dbHost}.`)
  process.exit(0)
}

const found = await payload.find({
  collection: 'case-studies',
  limit: 200,
  depth: 0,
  locale: 'pl',
  pagination: false,
})

/** Only the fields a visitor reads. `seo.*` and slugs are never laid out. */
type Doc = Record<string, unknown> & { id: string | number; slug: string }

const backupDocs: {
  id: string | number
  slug: string
  before: Record<string, unknown>
}[] = []
let docsChanged = 0

for (const raw of found.docs as unknown as Doc[]) {
  const slug = raw.slug
  if (raw._status !== 'published') {
    console.log(`  skipped ${slug} — _status is "${String(raw._status)}"`)
    continue
  }
  // Rich text is bound by mutating the tree in place, so the pre-run state has
  // to be captured before the first bind. Reconstructing it afterwards by
  // un-replacing strings does not work: a block's text is the join of its text
  // nodes, and that joined string appears nowhere in the stored JSON.
  const original = JSON.parse(JSON.stringify(raw)) as Doc
  const at = changes.length

  const title = bindText(slug, 'title', String(raw.title ?? ''))
  const excerpt = bindText(slug, 'excerpt', String(raw.excerpt ?? ''))

  const client = raw.client as { about?: { root?: LexicalNode } } | undefined
  const clientAbout = client?.about?.root
  const clientTouched = clientAbout
    ? bindRichText(slug, 'client.about', clientAbout)
    : false

  const challenge = raw.challenge as { root?: LexicalNode } | undefined
  const challengeTouched = challenge?.root
    ? bindRichText(slug, 'challenge', challenge.root)
    : false

  const approach = (raw.approach ?? []) as {
    tag?: string
    heading?: string
    body?: { root?: LexicalNode }
  }[]
  let approachTouched = false
  for (const [index, pillar] of approach.entries()) {
    const heading = bindText(
      slug,
      `approach[${index}].heading`,
      pillar.heading ?? ''
    )
    if (heading !== null) {
      pillar.heading = heading
      approachTouched = true
    }
    if (pillar.body?.root) {
      approachTouched =
        bindRichText(slug, `approach[${index}].body`, pillar.body.root) ||
        approachTouched
    }
  }

  const results = (raw.results ?? []) as { metric?: string }[]
  let resultsTouched = false
  for (const [index, row] of results.entries()) {
    const metric = bindText(slug, `results[${index}].metric`, row.metric ?? '')
    if (metric !== null) {
      row.metric = metric
      resultsTouched = true
    }
  }

  const mine = changes.slice(at)
  if (mine.length === 0) {
    continue
  }
  for (const change of mine) {
    change.id = raw.id
  }
  docsChanged += 1

  // Only the fields that actually changed go into the write and the backup, so
  // a restore cannot resurrect a field this run never looked at.
  const before: Record<string, unknown> = {}
  const after: Record<string, unknown> = {}
  if (title !== null) {
    before.title = original.title
    after.title = title
  }
  if (excerpt !== null) {
    before.excerpt = original.excerpt
    after.excerpt = excerpt
  }
  if (clientTouched) {
    before.client = original.client
    after.client = raw.client
  }
  if (challengeTouched) {
    before.challenge = original.challenge
    after.challenge = raw.challenge
  }
  if (approachTouched) {
    before.approach = original.approach
    after.approach = raw.approach
  }
  if (resultsTouched) {
    before.results = original.results
    after.results = raw.results
  }

  backupDocs.push({ id: raw.id, slug, before })

  if (APPLY) {
    await payload.update({
      collection: 'case-studies',
      id: raw.id,
      locale: 'pl',
      data: { ...after, _status: 'published' },
    })
  }
}

if (APPLY && BACKUP) {
  writeFileSync(
    BACKUP,
    JSON.stringify(
      { db: dbHost, docCount: found.totalDocs, docs: backupDocs },
      null,
      2
    )
  )
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function tally<T>(
  rows: readonly T[],
  of: (row: T) => string
): [string, number][] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = of(row)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

console.log(
  `\n${APPLY ? 'APPLIED' : 'REPORT'} — ${found.totalDocs} case studies in ${dbHost}\n`
)
console.log(`  gaps ${APPLY ? 'bound' : 'bindable'}     ${boundGaps}`)
console.log(`  fields rewritten       ${changes.length}`)
console.log(`  case studies touched   ${docsChanged}`)
console.log(`  gaps held for review   ${held.length}\n`)

console.log('  bindable, by field')
for (const [field, n] of tally(changes, (change) =>
  change.field.replace(/\[\d+\]/, '[n]')
)) {
  console.log(`    ${n.toString().padStart(4)}  ${field}`)
}
console.log('\n  held, by reason')
for (const [reason, n] of tally(held, (row) => row.reason)) {
  console.log(`    ${n.toString().padStart(4)}  ${reason}`)
}
if (JSON_OUT) {
  writeFileSync(
    JSON_OUT,
    JSON.stringify(
      {
        db: dbHost,
        changes: changes.map(({ before, after, ...rest }) => rest),
        held,
      },
      null,
      2
    )
  )
  console.log(`\n  JSON → ${JSON_OUT}`)
}
if (APPLY && BACKUP) {
  console.log(`\n  backup → ${BACKUP}`)
  console.log(
    `  roll back with: bun ./lib/payload/audit-case-study-orphans.ts --restore ${BACKUP}`
  )
}

process.exit(0)
