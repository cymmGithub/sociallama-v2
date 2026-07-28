/**
 * Blog post translation, PL → EN (design D3/D4/D7).
 *
 *   bun run payload:translate:post --extract [slug…]   PL → draft.pl.json
 *   bun run payload:translate:post [slug…]             draft.en.json → dry run
 *   bun run payload:translate:post [slug…] --apply     …and write
 *   …--prod                                            target production
 *   …--revalidate https://…                            invalidate that deployment's cache
 *
 * Two modes, because the translation itself happens between them: `--extract`
 * writes what needs translating, something or someone fills in the English,
 * and the write mode gates it and puts it in the database.
 *
 * ## Disk is the source of truth, not the database
 *
 * `content/posts/<slug>/draft.pl.json` and `draft.en.json` are the artefacts.
 * The database write is a projection of the English file, never the other way
 * round, so a lost or expired database costs a re-run rather than the work.
 * That is not hypothetical: the rehearsal branch this batch runs against
 * expires within a day.
 *
 * ## What it does and does not touch
 *
 * Only the text inside a run changes. Uploads, horizontal rules, list
 * structure, link `fields` (including internal document relations), heading
 * tags and every node's own properties are carried across by construction —
 * the walk assigns text, and nothing else. That is why the structural gate can
 * be an assertion rather than a repair.
 *
 * Ambiguity is reported and the whole post skipped, never guessed at, the way
 * `repair-post-formatting.ts:163-168` handles it. A post that gates clean is
 * written whole; a post that does not is left exactly as it was.
 *
 * ## No `draft: true`
 *
 * The English text lands on the PUBLISHED version (design D7). All 79 posts are
 * published and the collection has drafts enabled, so a draft write would file
 * the translation where the live page never reads it — it would appear to work
 * and change nothing.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  nodesOf,
  type ProjNode,
  parse,
  project,
  replaceRun,
  runsOf,
} from '@/lib/payload/post-projection'
import {
  checkDiacritics,
  checkHeadings,
  checkSlug,
  checkTree,
  type Finding,
  formatFindings,
  hasErrors,
  textOf,
} from '@/lib/payload/post-translation-gate'

const EXTRACT = process.argv.includes('--extract')
const APPLY = process.argv.includes('--apply')

/**
 * Deployment whose cache to invalidate after writing (design D12).
 *
 * This script writes straight to the database, which is outside any Next
 * request scope — `revalidateTag` throws there and `lib/payload/revalidate.ts`
 * swallows it, so the data changes and the deployed pages keep serving the old
 * cache for `cacheLife('days')`. Without this step the spot-checks that follow
 * a wave read a stale page and report the translations as missing, sending
 * someone to debug a translation engine that worked.
 *
 * Not needed when verifying with a fresh local build, which reads the database
 * directly — hence a flag rather than a requirement.
 */
const REVALIDATE = (() => {
  const index = process.argv.indexOf('--revalidate')
  return index === -1 ? null : process.argv[index + 1]
})()
const CONTENT_DIR = 'content/posts'

/** Proper nouns that survive translation; seeds the diacritic soft-flag. */
const ALLOWLIST_FILE = 'content/posts/glossary.json'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:translate:post --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

/** Positional arguments are slugs; everything with a leading dash is a flag. */
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))

interface Draft {
  /** Polish slug — the identity that ties the two files together. */
  source: string
  postId: number
  title: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  /** English slug. Absent in the PL draft, required in the EN one. */
  slug?: string
  runs: { index: number; parent: string; text: string }[]
}

const looksStub = (value?: string) =>
  !value || value.trim() === '' || value.trim().toUpperCase() === 'TODO'

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

function modeLabel(): string {
  if (EXTRACT) {
    return 'Extracting from'
  }
  return APPLY ? 'Writing to' : 'Dry run against'
}

console.log(`${modeLabel()}: ${dbHost}\n`)

const allowlist: string[] = await readFile(ALLOWLIST_FILE, 'utf8')
  .then((raw) => JSON.parse(raw) as string[])
  .catch(() => [])

const found = await payload.find({
  collection: 'posts',
  where:
    requested.length > 0
      ? { slug: { in: requested } }
      : { _status: { equals: 'published' } },
  limit: 0,
  pagination: false,
  depth: 0,
  locale: 'pl',
  fallbackLocale: false,
})

if (requested.length > 0 && found.docs.length !== requested.length) {
  const seen = new Set(found.docs.map((doc) => doc.slug))
  for (const slug of requested.filter((slug) => !seen.has(slug))) {
    console.error(`  ✗ ${slug}: no Polish post`)
  }
}

/** Every English slug already in use, so the gate can spot a collision. */
const takenBy = new Map<string, string>()
if (!EXTRACT) {
  const existing = await payload.find({
    collection: 'posts',
    limit: 0,
    pagination: false,
    depth: 0,
    locale: 'en',
    fallbackLocale: false,
    select: { slug: true },
  })
  for (const doc of existing.docs) {
    if (doc.slug) {
      takenBy.set(doc.slug, String(doc.id))
    }
  }
}

let extracted = 0
let written = 0
let skipped = 0

for (const post of found.docs) {
  const slug = String(post.slug)
  const dir = path.join(CONTENT_DIR, slug)
  const root = (post.content as { root?: ProjNode } | null)?.root

  if (!root) {
    console.error(`  ✗ ${slug}: no body`)
    skipped += 1
    continue
  }

  if (EXTRACT) {
    const draft: Draft = {
      source: slug,
      postId: Number(post.id),
      title: String(post.title ?? ''),
      excerpt: String(post.excerpt ?? ''),
      metaTitle: String(post.seo?.metaTitle ?? ''),
      metaDescription: String(post.seo?.metaDescription ?? ''),
      runs: runsOf(root).map((run, index) => ({
        index,
        parent: String(run.parent.type),
        text: project(nodesOf(run)).text,
      })),
    }
    await mkdir(dir, { recursive: true })
    await writeFile(
      path.join(dir, 'draft.pl.json'),
      `${JSON.stringify(draft, null, 2)}\n`
    )
    console.log(`  · ${slug} → ${draft.runs.length} run(s)`)
    extracted += 1
    continue
  }

  // —— write mode ————————————————————————————————————————————————————————
  const draftPath = path.join(dir, 'draft.en.json')
  const draft = await readFile(draftPath, 'utf8')
    .then((raw) => JSON.parse(raw) as Draft)
    .catch(() => null)

  if (!draft) {
    console.log(`  – ${slug}: no draft.en.json yet`)
    continue
  }

  const findings: Finding[] = []

  // Stub guard, from translate-case-study.ts: a scaffold that was never
  // filled in must not reach the database looking like a translation.
  for (const [field, value] of [
    ['title', draft.title],
    ['excerpt', draft.excerpt],
    ['slug', draft.slug],
  ] as const) {
    if (looksStub(value)) {
      findings.push({
        level: 'error',
        where: field,
        message: 'still a stub',
      })
    }
  }

  const runs = runsOf(root)
  if (draft.runs.length !== runs.length) {
    findings.push({
      level: 'error',
      where: 'body',
      message: `draft has ${draft.runs.length} run(s), the post has ${runs.length}`,
    })
  }

  if (hasErrors(findings)) {
    console.log(`  ✗ ${slug}\n${formatFindings(findings)}`)
    skipped += 1
    continue
  }

  // Deep copy before mutation, so a post that fails the gate is left exactly
  // as it was rather than half-translated.
  const content = JSON.parse(JSON.stringify(post.content)) as { root: ProjNode }
  const copyRuns = runsOf(content.root)

  let broke = false
  for (const [index, run] of copyRuns.entries()) {
    const translated = draft.runs[index]?.text
    if (translated === undefined) {
      findings.push({
        level: 'error',
        where: `run ${index}`,
        message: 'missing from the draft',
      })
      broke = true
      break
    }
    const source = project(nodesOf(run))
    try {
      replaceRun(run, parse({ ...source, text: translated }))
    } catch (cause) {
      findings.push({
        level: 'error',
        where: `run ${index}`,
        message: (cause as Error).message,
      })
      broke = true
      break
    }
  }

  if (!broke) {
    findings.push(
      ...checkTree(root, content.root),
      ...checkSlug(String(draft.slug), {
        // `takenBy` holds the owning post's ID, so it has to be compared with
        // THIS post's ID. Comparing it with the Polish slug never matched,
        // which made a second run refuse every post it had already written —
        // the script was not idempotent, and re-running is the normal way to
        // resume a partly-applied wave.
        takenBy:
          takenBy.get(String(draft.slug)) === String(post.id)
            ? undefined
            : takenBy.get(String(draft.slug)),
        polishSlug: slug,
      }),
      ...checkHeadings(content.root),
      ...checkDiacritics(textOf(content.root), allowlist, 'body'),
      ...checkDiacritics(draft.title, allowlist, 'title')
    )
  }

  if (hasErrors(findings)) {
    console.log(`  ✗ ${slug}\n${formatFindings(findings)}`)
    skipped += 1
    continue
  }

  console.log(
    `  ${APPLY ? '→' : '·'} ${slug} → ${draft.slug}  (${runs.length} runs)` +
      (findings.length > 0 ? `\n${formatFindings(findings)}` : '')
  )

  if (APPLY) {
    // The stub guard above already rejected a missing slug; narrowing here
    // states that for the type system rather than asserting it away.
    const enSlug = draft.slug
    if (!enSlug) {
      continue
    }
    const seo = (post.seo ?? {}) as Record<string, unknown>
    await payload.update({
      collection: 'posts',
      id: post.id,
      locale: 'en',
      data: {
        title: draft.title,
        slug: enSlug,
        excerpt: draft.excerpt,
        content: content as never,
        seo: {
          metaTitle: draft.metaTitle || draft.title,
          metaDescription: draft.metaDescription || draft.excerpt,
          // Shared, not localized — passed through explicitly so a partial
          // group write cannot clear it.
          ogImage: seo.ogImage as never,
        },
      },
    })
    takenBy.set(enSlug, String(post.id))
    written += 1
  }
}

if (REVALIDATE && written > 0) {
  const secret = process.env.REVALIDATE_SECRET
  if (secret) {
    const url = new URL('/api/revalidate', REVALIDATE)
    for (const tag of ['posts', 'categories', 'blog-hub']) {
      url.searchParams.append('tag', tag)
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    console.log(
      `\n  ${response.ok ? '✓' : '✗'} revalidated ${url.host}: ${response.status}`
    )
  } else {
    console.error(
      '\n  ! --revalidate needs REVALIDATE_SECRET; cache left stale'
    )
  }
}

if (EXTRACT) {
  console.log(
    `\n${extracted} post(s) extracted to ${CONTENT_DIR}/<slug>/draft.pl.json`
  )
} else {
  console.log(
    `\n${written} written, ${skipped} skipped.` +
      (APPLY ? '' : ' Dry run — re-run with --apply to write.')
  )
}

process.exit(skipped === 0 ? 0 : 1)
