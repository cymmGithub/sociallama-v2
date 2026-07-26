/**
 * One-off content migration for the imported WordPress guest posts — run with
 * `bun run payload:backfill:authors` (dry run) and again with `--apply`
 * to write. Add `--prod` to target the production database.
 *
 * Each guest post ends with four leftover WordPress nodes that the new author
 * card now replaces:
 *
 *   1. paragraph  "Tekst powstał we współpracy z <agencją SEOFLY>, a autorem
 *                  jest Łukasz Płociński."
 *   2. quote      a link to seofly.pl/zespol/<author>/   (oEmbed fallback)
 *   3. paragraph  empty
 *   4. paragraph  the raw .../embed/#?secret=… URL       (unresolved oEmbed)
 *
 * The script sets `author` on those posts and strips the trailing block. It is
 * idempotent: posts already migrated no longer match, and Payload versioning
 * keeps the pre-cleanup body recoverable.
 */

// Marks the file as a module. Every import here is dynamic — the DB env has
// to be set before payload.config is evaluated — so there is nothing static
// for TypeScript to infer module-ness from, and top-level await would error.
export {}

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:backfill:authors --prod requires DATABASE_URL_PROD'
    )
  }
  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname
console.log(`${APPLY ? 'Applying to' : 'Dry run against'}: ${dbHost}\n`)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

/** The guest author every matched post is attributed to. */
const AUTHOR_NAME = 'Łukasz Płociński'
/** Sentence fragment that marks the imported byline paragraph. */
const BYLINE_MARKER = 'a autorem jest'
/** Author-profile links WordPress left behind (profile page + oEmbed URL). */
const PROFILE_URL_MARKER = 'seofly.pl/zespol/'

type LexicalNode = {
  type: string
  children?: LexicalNode[]
  text?: string
  fields?: { url?: string }
}

/** All text inside a node, flattened. */
function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }
  return (node.children ?? []).map(nodeText).join('')
}

/** Every link href inside a node. */
function nodeUrls(node: LexicalNode): string[] {
  const own = node.fields?.url ? [node.fields.url] : []
  return own.concat((node.children ?? []).flatMap(nodeUrls))
}

function isBylineParagraph(node: LexicalNode): boolean {
  return node.type === 'paragraph' && nodeText(node).includes(BYLINE_MARKER)
}

/**
 * Is this node part of the leftover author block — i.e. safe to drop along
 * with the byline? Only blank nodes and nodes whose sole content is an author
 * link qualify; anything with real prose stops the cleanup.
 */
function isDroppableTailNode(node: LexicalNode): boolean {
  if (nodeText(node).trim() === '') {
    return true
  }
  const urls = nodeUrls(node)
  return urls.length > 0 && urls.every((u) => u.includes(PROFILE_URL_MARKER))
}

/**
 * Spacing the byline block leaned on. Dropped too, so a post ends on its last
 * real paragraph instead of a dangling rule or a run of empty ones.
 */
function isTrailingFiller(node: LexicalNode): boolean {
  return node.type === 'horizontalrule' || nodeText(node).trim() === ''
}

const payload = await getPayload({ config })

const author = (
  await payload.find({
    collection: 'authors',
    where: { name: { equals: AUTHOR_NAME } },
    limit: 1,
  })
).docs[0]

if (!author) {
  throw new Error(
    `Author "${AUTHOR_NAME}" not found — run payload:seed:authors first.`
  )
}
console.log(`Author: ${author.name} (#${author.id})\n`)

const posts = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
  limit: 0,
  pagination: false,
  depth: 0,
})

let matched = 0

for (const post of posts.docs) {
  const root = (post.content as { root?: { children?: LexicalNode[] } } | null)
    ?.root
  const children = root?.children
  if (!children) {
    continue
  }

  const bylineIndex = children.findIndex(isBylineParagraph)
  if (bylineIndex === -1) {
    continue
  }

  // Everything after the byline must be droppable, or we bail rather than
  // guess — real closing prose would otherwise be deleted.
  const tail = children.slice(bylineIndex + 1)
  const blockers = tail.filter((n) => !isDroppableTailNode(n))
  if (blockers.length > 0) {
    console.log(
      `! #${post.id} ${post.slug} — SKIPPED: ${blockers.length} non-droppable node(s) after the byline:`
    )
    for (const b of blockers) {
      console.log(`    ${b.type}: ${nodeText(b).slice(0, 120)}`)
    }
    continue
  }

  matched++
  let cutIndex = bylineIndex
  while (
    cutIndex > 0 &&
    isTrailingFiller(children[cutIndex - 1] as LexicalNode)
  ) {
    cutIndex--
  }

  const removed = children.length - cutIndex
  console.log(
    `+ #${post.id} ${post.slug} — set author, drop last ${removed} node(s):`
  )
  for (const node of children.slice(cutIndex)) {
    const text = nodeText(node).trim()
    console.log(`    ${node.type}: ${text.slice(0, 100) || '(empty)'}`)
  }

  if (!APPLY) {
    continue
  }

  await payload.update({
    collection: 'posts',
    id: post.id,
    data: {
      author: author.id,
      content: {
        ...post.content,
        root: { ...root, children: children.slice(0, cutIndex) },
      },
    },
  })
  console.log('    → updated')
}

console.log(
  `\n${matched} post(s) ${APPLY ? 'migrated' : 'would be migrated'}. ${
    APPLY ? '' : 'Re-run with --apply to write.'
  }`
)
process.exit(0)
