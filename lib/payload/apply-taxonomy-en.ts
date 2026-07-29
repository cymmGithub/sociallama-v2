/**
 * Apply the English category and author content from `taxonomy.en.json`
 * (change `add-english-blog`, task 6.3).
 *
 *   bun run payload:apply:taxonomy-en            dry run
 *   bun run payload:apply:taxonomy-en --apply    …and write
 *   …--prod                                      target production
 *
 * ## Why this script exists
 *
 * Task 6.3 authored this content by hand, directly against the rehearsal
 * database, and committed `taxonomy.en.json` so it could be re-applied
 * elsewhere. Nothing ever consumed that file. So the prod cutover ran
 * `translate:post` and `translate:alt`, both of which project a committed file
 * onto whatever database they are pointed at, and silently did nothing for
 * categories and authors — because for those there was no writer, only a note.
 *
 * The visible symptom was an author card with a name and a link and no
 * description, and an English blog hub with zero category links. Neither
 * failed loudly: `author-card.tsx` guards `{author.role && …}` and
 * `resolveCategory` returns null unless BOTH title and slug are present, so the
 * missing data degraded into absence rather than an error. The end-to-end case
 * "every category the hub links to actually resolves" passed the whole time,
 * vacuously, over an empty list.
 *
 * Hence a script rather than a repeat of hand-editing: content that lives in
 * exactly one database is content that gets left behind, and this file is the
 * only reason the loss was recoverable at all.
 */

import { readFile } from 'node:fs/promises'

const APPLY = process.argv.includes('--apply')
const FILE = 'content/posts/taxonomy.en.json'

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:apply:taxonomy-en --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

interface Taxonomy {
  categories: Record<string, { title: string; slug: string }>
  authors: Record<string, { role: string; bio: string }>
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`${APPLY ? 'Writing to' : 'Dry run against'}: ${dbHost}\n`)

const taxonomy = JSON.parse(await readFile(FILE, 'utf8')) as Taxonomy

/** Polish is the identity both maps key on, so read it explicitly. */
const READ = { locale: 'pl', fallbackLocale: false, depth: 0 } as const

let written = 0
let missing = 0

// —— categories ————————————————————————————————————————————————————————
const categories = await payload.find({
  collection: 'categories',
  limit: 0,
  pagination: false,
  ...READ,
})

for (const [plSlug, en] of Object.entries(taxonomy.categories)) {
  const doc = categories.docs.find((d) => d.slug === plSlug)
  if (!doc) {
    console.error(`  ✗ category ${plSlug}: no Polish row`)
    missing += 1
    continue
  }
  console.log(
    `  ${APPLY ? '→' : '·'} category ${plSlug} → ${en.title} (/${en.slug})`
  )
  if (APPLY) {
    await payload.update({
      collection: 'categories',
      id: doc.id,
      locale: 'en',
      data: { title: en.title, slug: en.slug },
    })
    written += 1
  }
}

// —— authors ———————————————————————————————————————————————————————————
// Keyed by `name`, which is deliberately NOT localized — it is the same string
// in both locales and so is the only stable identity available here.
const authors = await payload.find({
  collection: 'authors',
  limit: 0,
  pagination: false,
  ...READ,
})

for (const [name, en] of Object.entries(taxonomy.authors)) {
  const doc = authors.docs.find((d) => d.name === name)
  if (!doc) {
    console.error(`  ✗ author ${name}: no row`)
    missing += 1
    continue
  }
  console.log(`  ${APPLY ? '→' : '·'} author ${name} → ${en.role}`)
  if (APPLY) {
    await payload.update({
      collection: 'authors',
      id: doc.id,
      locale: 'en',
      data: { role: en.role, bio: en.bio },
    })
    written += 1
  }
}

console.log(
  `\n${written} ${APPLY ? 'written' : 'to write'}, ${missing} missing.` +
    (APPLY ? '' : ' Dry run — re-run with --apply to write.')
)
process.exit(missing === 0 ? 0 : 1)
