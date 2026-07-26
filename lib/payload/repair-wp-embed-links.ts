/**
 * One-off content repair for the imported WordPress internal-embed leftovers
 * — run with `bun run payload:repair:embed-links` (dry run) and again with
 * `--apply` to write. Add `--prod` to target the production database.
 *
 * WordPress renders an internal post embed as two elements: a titled
 * permalink (survives conversion as a link, usually inside a `quote`) and an
 * iframe that only JS-hydrates on the live site. The importer used to
 * degrade that iframe into a second, redundant paragraph — a raw
 * `https://sociallama.pl/<slug>/embed/#?secret=…` URL whose href is
 * percent-encoded and resolves relative to the current post, i.e. dead.
 * migrate-wp.ts no longer produces these (see wp-html-prepass.ts); this
 * script removes the ones already imported.
 *
 * Every occurrence found in production has the same local shape:
 *
 *   [i-2] a working link to the same slug, with the real title
 *   [i-1] blank paragraph
 *   [i]   the raw-URL paragraph                    ← deleted
 *   [i+1] blank paragraph (when the raw node isn't the post's last child)
 *
 * Deleting only [i] would leave two adjacent blanks where [i-1] and [i+1]
 * now touch, so [i+1] is dropped too whenever it exists and is blank.
 *
 * A node is only touched when both hold: its text is nothing but the raw
 * embed URL, AND a node within the preceding 3 links to the same slug. Any
 * occurrence failing either check is skipped and reported, never guessed at.
 * Idempotent: a repaired post no longer contains the marker text.
 */

export {}

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(
      'payload:repair:embed-links --prod requires DATABASE_URL_PROD'
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

/** Marks the leftover raw-embed paragraph text. */
const EMBED_MARKER = '/embed/#?secret='
/** `https://sociallama.pl/<slug>/embed/#?secret=…` → `<slug>` */
const SLUG_FROM_TEXT = /sociallama\.pl\/(.+?)\/embed\//

type LexicalNode = {
  type: string
  children?: LexicalNode[]
  text?: string
  fields?: { url?: string }
}

function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }
  return (node.children ?? []).map(nodeText).join('')
}

function nodeUrls(node: LexicalNode): string[] {
  const own = node.fields?.url ? [node.fields.url] : []
  return own.concat((node.children ?? []).flatMap(nodeUrls))
}

/** A node whose ENTIRE text is the raw embed URL — not merely mentioning it. */
function rawEmbedSlug(node: LexicalNode): string | null {
  const text = nodeText(node).trim()
  if (!(text.startsWith('http') && text.includes(EMBED_MARKER))) {
    return null
  }
  if (!/^https?:\/\/\S+$/.test(text)) {
    return null
  }
  return text.match(SLUG_FROM_TEXT)?.[1] ?? null
}

/** Does this node carry a working (non-embed) link to the given slug? */
function linksToSlug(node: LexicalNode, slug: string): boolean {
  return nodeUrls(node).some(
    (url) => !url.includes(EMBED_MARKER) && url.replace(/^\/|\/$/g, '') === slug
  )
}

const payload = await getPayload({ config })

const posts = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
  limit: 0,
  pagination: false,
  depth: 0,
})

let matched = 0
let skipped = 0

for (const post of posts.docs) {
  const root = (post.content as { root?: { children?: LexicalNode[] } } | null)
    ?.root
  const children = root?.children
  if (!children) {
    continue
  }

  const toRemove = new Set<number>()
  let touchedThisPost = false

  children.forEach((node, i) => {
    const slug = rawEmbedSlug(node)
    if (!slug) {
      return
    }

    const partnerIndex = [i - 1, i - 2, i - 3].find(
      (j) => children[j] && linksToSlug(children[j] as LexicalNode, slug)
    )
    if (partnerIndex === undefined) {
      skipped++
      console.log(
        `! #${post.id} ${post.slug} [${i}] — SKIPPED: no working link to "${slug}" in the preceding 3 nodes`
      )
      return
    }

    touchedThisPost = true
    toRemove.add(i)
    const next = children[i + 1]
    if (next && nodeText(next).trim() === '') {
      toRemove.add(i + 1)
    }
  })

  if (!touchedThisPost) {
    continue
  }
  matched++

  console.log(`+ #${post.id} ${post.slug} — drop ${toRemove.size} node(s):`)
  for (const i of [...toRemove].sort((a, b) => a - b)) {
    const node = children[i] as LexicalNode
    const text = nodeText(node).trim()
    console.log(`    [${i}] ${node.type}: ${text.slice(0, 90) || '(empty)'}`)
  }

  if (!APPLY) {
    continue
  }

  const newChildren = children.filter((_, i) => !toRemove.has(i))
  await payload.update({
    collection: 'posts',
    id: post.id,
    data: {
      content: {
        ...post.content,
        root: { ...root, children: newChildren },
      },
    },
  })
  console.log('    → updated')
}

console.log(
  `\n${matched} post(s) ${APPLY ? 'repaired' : 'would be repaired'}` +
    (skipped ? `, ${skipped} occurrence(s) skipped (see above)` : '') +
    (APPLY ? '' : '. Re-run with --apply to write.')
)
process.exit(0)
