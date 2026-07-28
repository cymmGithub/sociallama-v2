/**
 * One-off content repair for the presentational debris the WordPress import
 * left in `posts.content` — run with `bun run payload:repair:post-formatting`
 * (dry run) and again with `--apply` to write. Add `--prod` to target the
 * production database.
 *
 * Three classes, each behind its own flag, all three on when none is given:
 *
 *   --justify   clear a `justify` alignment format from every node type.
 *               `center` is authored intent and is never touched.
 *   --spacers   delete paragraphs whose entire content is whitespace, line
 *               breaks or non-breaking spaces. WordPress used them for
 *               vertical rhythm; the post template supplies its own, so they
 *               arrive as double gaps.
 *   --nbsp      resolve non-breaking spaces: padding runs collapse, word
 *               spaces become ordinary spaces, and the deliberate ones —
 *               after a Polish one-letter preposition, inside a grouped
 *               number — stay.
 *
 * One script rather than three, and one write per post rather than three,
 * because every write is a Payload `update` that bumps the version history
 * (design D4). Every predicate is imported from post-formatting-rules.ts,
 * shared with the verifier, so the two cannot disagree about what a defect
 * is (design D2).
 *
 * Conservative by construction: a paragraph that looks blank but holds a node
 * type the text walk cannot see — an image, a horizontal rule — is reported
 * and skipped, never guessed at. Idempotent: a repaired post has nothing left
 * for any of the three rules to match.
 */

import {
  applyBlockNbsp,
  classifySpacerParagraph,
  forEachTextBlock,
  isJustified,
  type LexicalNode,
  nodeText,
  walkNodes,
} from '@/lib/payload/post-formatting-rules'

const APPLY = process.argv.includes('--apply')
const VERBOSE = process.argv.includes('--verbose')

const requested = {
  justify: process.argv.includes('--justify'),
  spacers: process.argv.includes('--spacers'),
  nbsp: process.argv.includes('--nbsp'),
}
const ALL = !(requested.justify || requested.spacers || requested.nbsp)
const FIX = {
  justify: ALL || requested.justify,
  spacers: ALL || requested.spacers,
  nbsp: ALL || requested.nbsp,
}

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:repair:post-formatting --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
const enabled = Object.entries(FIX)
  .filter(([, on]) => on)
  .map(([name]) => name)
  .join(', ')
console.log(
  `${APPLY ? 'Applying to' : 'Dry run against'}: ${dbHost}\nClasses: ${enabled}\n`
)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

// No `_status` filter — a draft-only post is a row like any other, and its
// body carries the same imported debris.
const posts = await payload.find({
  collection: 'posts',
  limit: 0,
  pagination: false,
  depth: 0,
})

/** Delete spacer paragraphs from every container in the tree, in place. */
function removeSpacers(root: LexicalNode, removed: string[]): number {
  let count = 0
  walkNodes(root, (node) => {
    if (!node.children) {
      return
    }
    node.children = node.children.filter((child) => {
      if (classifySpacerParagraph(child) !== 'spacer') {
        return true
      }
      count++
      removed.push(JSON.stringify(nodeText(child)))
      return false
    })
  })
  return count
}

let changedPosts = 0
let totalJustify = 0
let totalSpacers = 0
let totalWordSpace = 0
let totalPadding = 0
let skipped = 0

for (const post of posts.docs) {
  const original = post.content as { root?: LexicalNode } | null
  if (!original?.root) {
    continue
  }
  // Work on a copy so a dry run cannot leave a mutated object behind, and so
  // the write sends a plain serializable tree.
  const content = JSON.parse(JSON.stringify(original)) as { root: LexicalNode }
  const root = content.root

  let justify = 0
  let spacers = 0
  let wordSpace = 0
  let padding = 0
  const removedText: string[] = []
  const unclear: string[] = []

  walkNodes(root, (node) => {
    if (classifySpacerParagraph(node) === 'unclear') {
      unclear.push((node.children ?? []).map((child) => child.type).join('+'))
    }
  })

  if (FIX.spacers) {
    spacers = removeSpacers(root, removedText)
  }

  if (FIX.justify) {
    walkNodes(root, (node) => {
      if (isJustified(node)) {
        node.format = ''
        justify++
      }
    })
  }

  if (FIX.nbsp) {
    forEachTextBlock(root, (block) => {
      const plan = applyBlockNbsp(block)
      wordSpace += plan.wordSpace
      padding += plan.padding
    })
  }

  for (const shape of unclear) {
    skipped++
    console.log(
      `! #${post.id} ${post.slug} — SKIPPED a blank paragraph holding ${shape || '(nothing)'}: not a spacer, left alone`
    )
  }

  const touched = justify + spacers + wordSpace + padding
  if (touched === 0) {
    continue
  }

  changedPosts++
  totalJustify += justify
  totalSpacers += spacers
  totalWordSpace += wordSpace
  totalPadding += padding

  const parts = [
    justify ? `${justify} justify` : '',
    spacers ? `${spacers} spacer(s)` : '',
    wordSpace ? `${wordSpace} word-space nbsp` : '',
    padding ? `${padding} padding nbsp` : '',
  ].filter(Boolean)
  console.log(`+ #${post.id} ${post.slug} — ${parts.join(', ')}`)

  if (VERBOSE && removedText.length > 0) {
    for (const text of removedText) {
      console.log(`    removed spacer paragraph: ${text}`)
    }
  }

  if (!APPLY) {
    continue
  }

  await payload.update({
    collection: 'posts',
    id: post.id,
    data: { content: content as never },
  })
  console.log('    → updated')
}

console.log(
  `\n${changedPosts} post(s) ${APPLY ? 'repaired' : 'would be repaired'}: ` +
    `${totalJustify} justify, ${totalSpacers} spacer(s), ` +
    `${totalWordSpace} word-space nbsp, ${totalPadding} padding nbsp` +
    (skipped ? `, ${skipped} paragraph(s) skipped (see above)` : '') +
    (APPLY ? '' : '. Re-run with --apply to write.')
)
process.exit(0)
