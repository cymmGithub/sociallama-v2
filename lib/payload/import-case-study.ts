/**
 * Case-study importer — sibling of seed-case-studies.ts (design D1).
 *
 * Reads a curated `content/case-studies/<slug>/draft.json` (authored to the
 * iRobot bar in phase 4) and upserts a `case-studies` document:
 *   - locale `pl`, `_status: 'draft'`  (Payload localization allows a PL-only
 *     doc; the static seed's mandatory `en` field cannot — so PL-first studies
 *     land here, not in the seed)
 *   - idempotent by `slug`: re-running UPDATES the existing draft, never dupes
 *
 * Publish is a separate, manual, per-study action taken only after the
 * client-permission gate clears — this script never publishes.
 *
 * Run:  bun ./lib/payload/import-case-study.ts <slug>            (dev DB)
 *       bun ./lib/payload/import-case-study.ts <path/to/draft.json>
 *       bun ./lib/payload/import-case-study.ts <slug> --prod     (DATABASE_URL_PROD)
 *
 * Creatives are read from public/case-studies/<slug>/<file> (same convention as
 * the seeded three). draft.json references files by basename.
 */

import fs from 'node:fs'
import path from 'node:path'

// Env decision before config import (payload.config validates DATABASE_URL at
// import time) — mirrors seed-case-studies.ts.
if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'import-case-study --prod requires DATABASE_URL_PROD in .env.local'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

// —— Lexical helpers (identical shape to seed-case-studies.ts) ————————————————

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

// —— draft.json contract ——————————————————————————————————————————————————————

interface MediaRef {
  file: string
  alt: string
}
interface DraftPillar {
  tag?: string
  heading: string
  body: string[] // paragraphs
  media: MediaRef[]
}
interface Draft {
  slug: string
  clientName: string
  title: string
  excerpt: string
  coverAlt: string
  tags: string[]
  logo?: MediaRef
  cover?: MediaRef
  clientAbout: string[] // paragraphs
  challenge: { intro: string; objectives: string[] }
  pillars: DraftPillar[]
  results: { platform: string; metric: string; value: string }[]
  gallery: MediaRef[]
}

// —— Load + validate the draft ————————————————————————————————————————————————

const arg = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'))
if (!arg) {
  throw new Error(
    'usage: import-case-study.ts <slug|path/to/draft.json> [--prod]'
  )
}
const draftPath = arg.endsWith('.json')
  ? arg
  : `content/case-studies/${arg}/draft.json`
if (!fs.existsSync(draftPath)) {
  throw new Error(`draft not found: ${draftPath}`)
}
const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8')) as Draft

// Refuse to import un-authored stubs — extraction leaves prose as "TODO".
const stubs: string[] = []
const looksStub = (s?: string) => !s || s.trim() === '' || s.trim() === 'TODO'
if (looksStub(draft.title)) stubs.push('title')
if (looksStub(draft.excerpt)) stubs.push('excerpt')
if (looksStub(draft.coverAlt)) stubs.push('coverAlt')
if (looksStub(draft.challenge?.intro)) stubs.push('challenge.intro')
if (!draft.clientAbout?.some((p) => !looksStub(p))) stubs.push('clientAbout')
if (looksStub(draft.cover?.file)) stubs.push('cover.file')
if (stubs.length > 0) {
  throw new Error(
    `draft.json still has un-authored stubs: ${stubs.join(', ')}\n` +
      `Author these to the gold-standard bar before importing (see content/case-studies/RECIPE.md).`
  )
}

const assetDir = `public/case-studies/${draft.slug}`

// —— Upsert ———————————————————————————————————————————————————————————————————

console.log(`Importing "${draft.slug}" (PL draft) into: ${dbHost}`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

async function findOrCreateMedia(file: string, alt: string) {
  const filename = path.basename(file)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(assetDir, filename),
  })
}

// Cover (required by the collection).
const cover = await findOrCreateMedia(draft.cover!.file, draft.coverAlt)

// Optional logo.
let logoId: number | undefined
if (draft.logo && !looksStub(draft.logo.file)) {
  const logo = await findOrCreateMedia(
    draft.logo.file,
    draft.logo.alt || `Logo ${draft.clientName}`
  )
  logoId = logo.id
}

// Gallery.
const gallery: number[] = []
for (const img of draft.gallery ?? []) {
  const doc = await findOrCreateMedia(img.file, img.alt)
  gallery.push(doc.id)
}

// Pillars → approach rows, uploading each pillar's creatives.
const approach: {
  tag?: string
  heading: string
  body: unknown
  media: number[]
}[] = []
for (const pillar of draft.pillars ?? []) {
  const media: number[] = []
  for (const img of pillar.media ?? []) {
    const doc = await findOrCreateMedia(img.file, img.alt)
    media.push(doc.id)
  }
  approach.push({
    ...(pillar.tag ? { tag: pillar.tag } : {}),
    heading: pillar.heading,
    body: richText(...pillar.body.map(para)),
    media,
  })
}

// Challenge: intro paragraph + ordered objectives. Objectives may be empty
// (graceful degradation for credentials-style decks) — then it's intro only.
const challenge =
  draft.challenge.objectives.length > 0
    ? richText(
        para(draft.challenge.intro),
        orderedList(draft.challenge.objectives)
      )
    : richText(para(draft.challenge.intro))

const data = {
  title: draft.title,
  slug: draft.slug,
  client: {
    name: draft.clientName,
    ...(logoId ? { logo: logoId } : {}),
    about: richText(...draft.clientAbout.map(para)),
  },
  tags: draft.tags,
  excerpt: draft.excerpt,
  cover: cover.id,
  challenge,
  approach,
  results: draft.results ?? [],
  gallery,
  _status: 'draft' as const,
}

const existing = await payload.find({
  collection: 'case-studies',
  where: { slug: { equals: draft.slug } },
  limit: 1,
  draft: true,
  locale: 'pl',
})

if (existing.docs[0]) {
  await payload.update({
    collection: 'case-studies',
    id: existing.docs[0].id,
    locale: 'pl',
    draft: true,
    // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical/rows; validated by Payload
    data: data as any,
  })
  console.log(
    `~ updated existing draft: ${draft.slug} (id ${existing.docs[0].id})`
  )
} else {
  const created = await payload.create({
    collection: 'case-studies',
    locale: 'pl',
    draft: true,
    // biome-ignore lint/suspicious/noExplicitAny: hand-built Lexical/rows; validated by Payload
    data: data as any,
  })
  console.log(`+ created draft: ${draft.slug} (id ${created.id})`)
}

console.log('Import complete — study is a PL draft (unpublished).')
process.exit(0)
