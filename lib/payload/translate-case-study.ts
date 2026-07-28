/**
 * Case-study EN translator — sibling of import-case-study.ts (design D1/D2).
 *
 * The PL importer's staging (`content/case-studies/<slug>/draft.json`) is
 * git-ignored and did not survive its worktree, so the live document is the
 * only remaining source of the authored Polish prose. This script therefore
 * runs in two modes:
 *
 *   --extract <slug...|--all>   read the live PL document(s) and write
 *                               `content/case-studies/<slug>/draft.pl.json`
 *                               (plain strings) plus a `draft.en.json` stub
 *                               for authoring. Never clobbers an existing
 *                               draft.en.json.
 *
 *   <slug...>                   read the authored `draft.en.json` and write it
 *                               to the document's `en` locale, reusing each
 *                               pillar's media from the PL `approach` by index.
 *
 * The EN write deliberately omits `draft: true` (design D5): every imported
 * study is already published, so a draft-targeted write would land in a draft
 * version while the live /en page kept falling back to Polish. This mirrors
 * seed-case-studies.ts's EN pass, which updates the published doc directly.
 *
 * Idempotent by slug: re-running updates the same document's `en` locale,
 * never creates a document and never uploads media.
 *
 * Run:  bun ./lib/payload/translate-case-study.ts --extract riviera
 *       bun ./lib/payload/translate-case-study.ts riviera
 *       bun ./lib/payload/translate-case-study.ts --extract --all
 *       bun ./lib/payload/translate-case-study.ts riviera --prod
 */

import fs from 'node:fs'
import path from 'node:path'

// Env decision before config import (payload.config validates DATABASE_URL at
// import time) — mirrors import-case-study.ts.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'translate-case-study --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

// —— Lexical helpers (identical shape to import-case-study.ts) ————————————————

function text(value: string) {
  return {
    type: 'text',
    text: value,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function block(type: string, children: unknown[], extra = {}) {
  return {
    type,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    ...extra,
  }
}

const para = (value: string) => block('paragraph', [text(value)])

const orderedList = (items: string[]) =>
  block(
    'list',
    items.map((value, i) => block('listitem', [text(value)], { value: i + 1 })),
    { listType: 'number', tag: 'ol', start: 1 }
  )

const richText = (...blocks: unknown[]) => ({ root: block('root', blocks) })

// —— Lexical helpers, inverted (design D1) ————————————————————————————————————
// The stored node set is exactly what the helpers above emit — root, paragraph,
// list/listitem, text — so unwrapping is a direct inverse, not a general parse.

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
}

/** Concatenate every text node under `node` (paragraphs may split on format runs). */
function textOf(node: LexicalNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.children ?? []).map(textOf).join('')
}

/** Paragraph strings directly under a richText root. */
function paragraphsOf(field: { root?: LexicalNode } | null | undefined) {
  return (field?.root?.children ?? [])
    .filter((n) => n.type === 'paragraph')
    .map(textOf)
    .filter((s) => s.trim() !== '')
}

/** List-item strings under a richText root (the challenge's ordered objectives). */
function listItemsOf(field: { root?: LexicalNode } | null | undefined) {
  return (field?.root?.children ?? [])
    .filter((n) => n.type === 'list')
    .flatMap((list) => (list.children ?? []).map(textOf))
    .filter((s) => s.trim() !== '')
}

// —— draft.pl.json / draft.en.json contract (task 1.1) ————————————————————————
// Assets are absent by design: translation never touches media, logo or cover.
// `challenge.intro` carries paragraphs joined by a blank line so a multi-
// paragraph intro round-trips; on write it splits back into separate blocks.

interface TranslationPillar {
  tag?: string
  heading: string
  body: string[] // paragraphs
}
interface TranslationPayload {
  slug: string
  clientName: string
  title: string
  excerpt: string
  tags: string[]
  clientAbout: string[] // paragraphs
  challenge: { intro: string; objectives: string[] }
  pillars: TranslationPillar[]
  results: { platform: string; metric: string; value: string }[]
}

const PARA_SEP = '\n\n'

// —— CLI ——————————————————————————————————————————————————————————————————————

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))
const slugArgs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const isExtract = flags.includes('--extract')
const isAll = flags.includes('--all')

if (!isAll && slugArgs.length === 0) {
  throw new Error(
    'usage: translate-case-study.ts [--extract] <slug...> [--prod]\n' +
      '       translate-case-study.ts --extract --all [--prod]'
  )
}
if (isAll && !isExtract) {
  throw new Error('--all is only supported with --extract')
}

const dir = (slug: string) => `content/case-studies/${slug}`
const plPath = (slug: string) => path.join(dir(slug), 'draft.pl.json')
const enPath = (slug: string) => path.join(dir(slug), 'draft.en.json')

// —— Payload ——————————————————————————————————————————————————————————————————

console.log(
  `${isExtract ? 'Extracting PL source from' : 'Writing EN translations to'}: ${dbHost}`
)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
async function findDoc(slug: string): Promise<any> {
  const res = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    locale: 'pl',
    depth: 0, // keep media/logo as IDs so they can be written straight back
  })
  const doc = res.docs[0]
  if (!doc) throw new Error(`no case-studies document for slug "${slug}"`)
  return doc
}

const looksStub = (s?: string) => !s || s.trim() === '' || s.trim() === 'TODO'

// —— Mode: extract ————————————————————————————————————————————————————————————

// biome-ignore lint/suspicious/noExplicitAny: hand-walked Payload doc shape
function toPayload(doc: any): TranslationPayload {
  const intro = paragraphsOf(doc.challenge).join(PARA_SEP)
  return {
    slug: doc.slug,
    clientName: doc.client?.name ?? '',
    title: doc.title ?? '',
    excerpt: doc.excerpt ?? '',
    tags: doc.tags ?? [],
    clientAbout: paragraphsOf(doc.client?.about),
    challenge: { intro, objectives: listItemsOf(doc.challenge) },
    // biome-ignore lint/suspicious/noExplicitAny: array row shape
    pillars: (doc.approach ?? []).map((p: any) => ({
      ...(p.tag ? { tag: p.tag } : {}),
      heading: p.heading ?? '',
      body: paragraphsOf(p.body),
    })),
    // biome-ignore lint/suspicious/noExplicitAny: array row shape
    results: (doc.results ?? []).map((r: any) => ({
      platform: r.platform,
      metric: r.metric,
      value: r.value,
    })),
  }
}

/** The EN stub keeps structure and untranslatable values, blanks the prose. */
function toStub(pl: TranslationPayload): TranslationPayload {
  return {
    slug: pl.slug,
    clientName: pl.clientName, // brand name — rarely translated
    title: 'TODO',
    excerpt: 'TODO',
    tags: pl.tags.map(() => 'TODO'),
    clientAbout: pl.clientAbout.map(() => 'TODO'),
    challenge: {
      intro: 'TODO',
      objectives: pl.challenge.objectives.map(() => 'TODO'),
    },
    pillars: pl.pillars.map((p) => ({
      ...(p.tag ? { tag: p.tag } : {}),
      heading: 'TODO',
      body: p.body.map(() => 'TODO'),
    })),
    // `value` is a figure, not prose — carried over for per-study D3 review.
    results: pl.results.map((r) => ({
      platform: r.platform,
      metric: 'TODO',
      value: r.value,
    })),
  }
}

async function extract(slug: string) {
  const doc = await findDoc(slug)
  const pl = toPayload(doc)
  fs.mkdirSync(dir(slug), { recursive: true })
  fs.writeFileSync(plPath(slug), `${JSON.stringify(pl, null, 2)}\n`)

  let stubNote = 'draft.en.json exists — left untouched'
  if (!fs.existsSync(enPath(slug))) {
    fs.writeFileSync(enPath(slug), `${JSON.stringify(toStub(pl), null, 2)}\n`)
    stubNote = 'draft.en.json stub written'
  }
  console.log(
    `  ~ ${slug}: ${pl.pillars.length} pillars, ${pl.results.length} results — ${stubNote}`
  )
}

// —— Mode: translate ——————————————————————————————————————————————————————————

async function translate(slug: string) {
  const file = enPath(slug)
  if (!fs.existsSync(file)) {
    throw new Error(
      `translation not found: ${file}\nRun with --extract ${slug} first, then author it.`
    )
  }
  const en = JSON.parse(fs.readFileSync(file, 'utf8')) as TranslationPayload

  // Refuse un-authored stubs — same guard as the PL importer.
  const stubs: string[] = []
  if (looksStub(en.title)) stubs.push('title')
  if (looksStub(en.excerpt)) stubs.push('excerpt')
  if (looksStub(en.challenge?.intro)) stubs.push('challenge.intro')
  if (!en.clientAbout?.some((p) => !looksStub(p))) stubs.push('clientAbout')
  if (en.tags?.some(looksStub)) stubs.push('tags')
  en.pillars?.forEach((p, i) => {
    if (looksStub(p.heading)) stubs.push(`pillars[${i}].heading`)
    if (p.body?.some(looksStub)) stubs.push(`pillars[${i}].body`)
  })
  en.results?.forEach((r, i) => {
    if (looksStub(r.metric)) stubs.push(`results[${i}].metric`)
  })
  if (stubs.length > 0) {
    throw new Error(
      `${file} still has un-authored stubs: ${stubs.join(', ')}\n` +
        `Author these to the EN voice bar (see the iRobot/Pracuj/Volvo entries in seed-case-studies.ts).`
    )
  }

  const doc = await findDoc(slug)

  // Pillar count must line up — media is matched by index, so a mismatch would
  // silently pair English copy with the wrong creatives.
  if (en.pillars.length !== (doc.approach ?? []).length) {
    throw new Error(
      `${slug}: pillar count mismatch — draft.en.json has ${en.pillars.length}, ` +
        `the PL document has ${(doc.approach ?? []).length}. Re-extract and re-author.`
    )
  }

  const approach = en.pillars.map((pillar, i) => ({
    ...(pillar.tag ? { tag: pillar.tag } : {}),
    heading: pillar.heading,
    body: richText(...pillar.body.map(para)),
    media: doc.approach[i]?.media ?? [], // reused by index — never re-uploaded
  }))

  const challenge =
    en.challenge.objectives.length > 0
      ? richText(
          ...en.challenge.intro.split(PARA_SEP).map(para),
          orderedList(en.challenge.objectives)
        )
      : richText(...en.challenge.intro.split(PARA_SEP).map(para))

  await payload.update({
    collection: 'case-studies',
    id: doc.id,
    locale: 'en',
    // No `draft: true` — design D5.
    data: {
      title: en.title,
      client: {
        // Non-localized siblings carried through unchanged, as the seed does.
        name: doc.client?.name,
        ...(doc.client?.logo ? { logo: doc.client.logo } : {}),
        about: richText(...en.clientAbout.map(para)),
      },
      tags: en.tags,
      excerpt: en.excerpt,
      challenge,
      approach,
      results: en.results,
      // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical/rows; validated by Payload
    } as any,
  })
  console.log(`  + EN translation: ${slug} (id ${doc.id})`)
}

// —— Run ——————————————————————————————————————————————————————————————————————

let slugs = slugArgs
if (isAll) {
  const all = await payload.find({
    collection: 'case-studies',
    limit: 200,
    draft: true,
    locale: 'pl',
    depth: 0,
  })
  // biome-ignore lint/suspicious/noExplicitAny: doc shape
  slugs = (all.docs as any[]).map((d) => d.slug).sort()
  console.log(`--all: ${slugs.length} documents`)
}

for (const slug of slugs) {
  if (isExtract) await extract(slug)
  else await translate(slug)
}

console.log(isExtract ? 'Extract complete.' : 'Translation complete.')
process.exit(0)
