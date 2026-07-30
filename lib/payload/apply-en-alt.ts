/**
 * Writes the English `alt` glosses for accepted images that carry meaningful
 * Polish text.
 *
 *   bun run payload:apply:en-alt            dry run
 *   bun run payload:apply:en-alt --apply    write
 *   …--prod                                 against production
 *
 * ## Why this is the fix rather than new artwork
 *
 * Every id here was judged `accept`: the Polish in the picture is real content
 * quoted as source material — a client's campaign creative, a public post, the
 * agency's own account. Design D4 forbids manufacturing an English version of
 * something that was published in Polish, so the English reader's route to the
 * meaning is the alt text, not a different image. Spec R3: "Where an image is
 * accepted with legible Polish text that carries meaning, its English alt SHALL
 * quote that text and follow it with a parenthetical English gloss."
 *
 * ## English only
 *
 * `media.alt` is localized. This writes `locale: 'en'` and never touches the
 * Polish value, which still describes the same picture correctly for a Polish
 * reader.
 *
 * Many of these rows arrived from the WordPress import with a filename as their
 * alt ("Zdj 1", "aaaa", "AdobeStock 1307231344"), so there is usually nothing to
 * append a gloss to — the description is written from scratch.
 */

import { readFile, writeFile } from 'node:fs/promises'

const AUDIT_PATH = 'content/media/image-audit.json'
const GLOSS_PATH = 'content/media/en-alt-glosses.json'
const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error('payload:apply:en-alt --prod requires DATABASE_URL_PROD')
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const glosses = JSON.parse(await readFile(GLOSS_PATH, 'utf8')) as Record<
  string,
  string
>
const audit = JSON.parse(await readFile(AUDIT_PATH, 'utf8')) as {
  images: Record<
    string,
    { verdict: string; glossRequired?: true; altEn: string; filename: string }
  >
}

// Only accepted images get a gloss. A `replace` id would be getting alt for a
// picture that is about to be swapped out.
const rejected: string[] = []
for (const id of Object.keys(glosses)) {
  const entry = audit.images[id]
  if (!entry) {
    rejected.push(`${id}: not in the audit`)
  } else if (entry.verdict !== 'accept') {
    rejected.push(`${id}: verdict is "${entry.verdict}", not "accept"`)
  }
}
if (rejected.length > 0) {
  console.error(
    `Refusing to run:\n${rejected.map((r) => `  ✗ ${r}`).join('\n')}`
  )
  process.exit(1)
}

const flagged = Object.entries(audit.images)
  .filter(([, v]) => v.glossRequired)
  .map(([id]) => id)
const unwritten = flagged.filter((id) => !glosses[id])
if (unwritten.length > 0) {
  console.log(
    `⚠ ${unwritten.length} id(s) flagged glossRequired have no gloss yet: ${unwritten.join(', ')}\n`
  )
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(
  `${APPLY ? 'Writing' : 'DRY RUN — would write'} English alt on: ${dbHost}\n`
)

let written = 0
let unchanged = 0

for (const [id, alt] of Object.entries(glosses)) {
  const entry = audit.images[id]
  if (!entry) {
    continue
  }
  if (entry.altEn === alt) {
    unchanged += 1
    continue
  }
  console.log(`  ${APPLY ? '·' : '?'} ${id} ${entry.filename}`)
  console.log(`      was: ${entry.altEn || '(empty)'}`)
  console.log(`      now: ${alt}`)
  if (APPLY) {
    await payload.update({
      collection: 'media',
      id,
      locale: 'en',
      data: { alt },
    })
    entry.altEn = alt
  }
  written += 1
}

if (APPLY) {
  await writeFile(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`)
  console.log(`\nrefreshed altEn in ${AUDIT_PATH}`)
}

console.log(
  `\n${written} alt value(s) ${APPLY ? 'written' : 'to write'}, ${unchanged} already current` +
    (APPLY ? '' : ' — re-run with --apply')
)

process.exit(0)
