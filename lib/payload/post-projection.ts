/**
 * Lexical ⇄ inline-markup projection, the translation engine's core (design D3).
 *
 * Translation happens over a *run of inline nodes* rendered as a short markup
 * string, never over individual text nodes. 802 of the corpus's 3,225 text
 * nodes exist only because a bold or italic run splits a sentence; handed to a
 * translator one at a time they carry no sentence context, and Polish is
 * inflected and free-word-order while English reorders — so the translator
 * could not know where the emphasis belongs.
 *
 * ## Why runs, and not D3's "blocks"
 *
 * D3 defines the unit as a block (`paragraph`, `heading`, `listitem`, `quote`)
 * and states that such a block contains only inline leaves — that `upload` and
 * `horizontalrule` "never enter the projection". Measured against all 79 posts,
 * that is false for 31 nodes: 18 `paragraph`s live inside a `quote`, 5
 * `heading`s and 2 `upload`s inside a `listitem`, and 4 `listitem`s inside a
 * nested `list`. Ten parents mix inline and block children outright.
 *
 * So a `quote` is a *container* of paragraphs, and a `listitem` is sometimes
 * one too. Projecting either as a leaf would flatten its children away.
 *
 * The unit here is therefore a **maximal run of adjacent inline children**.
 * A paragraph of prose is one run, exactly as D3 intended; a quote yields no
 * run of its own and its paragraphs each yield one; a list item holding text
 * plus a nested list yields a run for the text and recurses into the list.
 * The corpus contains 1,875 such runs.
 *
 * ## What is carried out of band
 *
 * Each link node is held aside whole (minus its children) and restored by tag
 * index, so `fields` — including `linkType: 'internal'` document relations —
 * plus `id` and `type` come back exactly as they were. Each text node is held
 * aside the same way, minus the `text` and `format` the markup encodes, and
 * restored positionally.
 *
 * Holding the WHOLE node is the point. Enumerating `detail`/`mode`/`style` was
 * the first attempt, and the corpus rejected it on 194 of 1,875 runs: 39 text
 * nodes omit `version`, and links carry an `id`, so a fixed template invented
 * properties that were never there. No text node in the corpus carries a
 * non-default `detail`, `mode` or `style` — but plenty omit them, and a
 * round-trip has to preserve absent-versus-default.
 *
 * ## Grammar
 *
 *   <b> <i> <s> <u> <code> <sub> <sup>   format bits, outermost = lowest bit
 *   <aN>…</aN>                            link, N indexes the out-of-band table
 *   <br/>  <tab/>                         inline leaves, counted and positioned
 *   <z/>                                  a zero-length text node
 *   &lt; &amp;                             the only escapes
 *
 * `<z/>` exists because the corpus contains 33 text nodes whose `text` is the
 * empty string — WordPress-import debris, usually trailing a link. They render
 * as nothing and mean nothing, but they are nodes, and dropping them would
 * make the round-trip lose one node in 33 runs and put the English leaf
 * sequence permanently out of step with the Polish one. Tokenising costs the
 * translator a marker to leave alone; dropping would cost a silent structural
 * edit to a third of a percent of the corpus.
 *
 * Anything else is a parse failure rather than a silent pass-through, so a
 * translator inventing markup is caught by the gate instead of reaching the
 * database.
 */

/** Lexical's text format bits, low to high. Order IS the nesting order. */
const FORMAT_TAGS: readonly { bit: number; tag: string }[] = [
  { bit: 1, tag: 'b' },
  { bit: 2, tag: 'i' },
  { bit: 4, tag: 's' },
  { bit: 8, tag: 'u' },
  { bit: 16, tag: 'code' },
  { bit: 32, tag: 'sub' },
  { bit: 64, tag: 'sup' },
]

const ALL_BITS = FORMAT_TAGS.reduce((sum, entry) => sum + entry.bit, 0)

/** Node types that participate in a run. Everything else ends one. */
export const INLINE_TYPES = new Set([
  'text',
  'link',
  'autolink',
  'linebreak',
  'tab',
])

export interface ProjNode {
  type?: string
  text?: string
  format?: number | string
  detail?: number
  mode?: string
  style?: string
  fields?: unknown
  children?: ProjNode[]
  [key: string]: unknown
}

/**
 * Everything a source text node carried that the markup does NOT encode.
 *
 * Stored as the whole node minus `text` and `format`, rather than an
 * enumeration of `detail`/`mode`/`style`. Enumerating was the first attempt
 * and the corpus rejected it: some text nodes omit `version`, and links carry
 * an `id`, so a fixed template silently invented properties on 194 of 1,875
 * runs. Copying the rest of the node cannot drift as the editor's schema
 * changes.
 */
type NodeRest = Record<string, unknown>

export interface Projection {
  /** The translatable string. */
  text: string
  /**
   * Each link node minus its children, indexed by the N in `<aN>` — so
   * `fields` (including `linkType: 'internal'` document relations), `id` and
   * `type` all return exactly as they were.
   */
  links: NodeRest[]
  /** Each text node minus `text`/`format`, in document order. */
  meta: NodeRest[]
}

function escapeMarkup(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function unescapeMarkup(value: string): string {
  return value.replace(/&lt;/g, '<').replace(/&amp;/g, '&')
}

/** The source node minus the keys `omit` names. */
function rest(node: ProjNode, omit: readonly string[]): NodeRest {
  const out: NodeRest = {}
  for (const [key, value] of Object.entries(node)) {
    if (!omit.includes(key)) {
      out[key] = value
    }
  }
  return out
}

/**
 * Render a run of inline nodes to markup.
 *
 * Adjacent nodes sharing a format are deliberately NOT merged: the source tree
 * distinguishes them and a round-trip has to reproduce it.
 */
export function project(nodes: readonly ProjNode[]): Projection {
  const links: NodeRest[] = []
  const meta: NodeRest[] = []

  const render = (list: readonly ProjNode[]): string => {
    let out = ''
    for (const node of list) {
      switch (node.type) {
        case 'text': {
          const format = typeof node.format === 'number' ? node.format : 0
          if ((format & ~ALL_BITS) !== 0) {
            throw new Error(`unknown format bits in ${format}`)
          }
          meta.push(rest(node, ['text', 'format']))
          const open = FORMAT_TAGS.filter((entry) => format & entry.bit)
          // An empty node still gets wrapped: the corpus has one carrying
          // ITALIC, and `<z/>` outside the tags would come back unformatted.
          const body =
            (node.text ?? '') === '' ? '<z/>' : escapeMarkup(node.text ?? '')
          out += `${open.map((e) => `<${e.tag}>`).join('')}${body}${[...open]
            .reverse()
            .map((e) => `</${e.tag}>`)
            .join('')}`
          break
        }
        case 'link':
        case 'autolink': {
          const index = links.length
          links.push(rest(node, ['children']))
          out += `<a${index}>${render(node.children ?? [])}</a${index}>`
          break
        }
        case 'linebreak':
          out += '<br/>'
          break
        case 'tab':
          out += '<tab/>'
          break
        default:
          throw new Error(`not an inline node: ${String(node.type)}`)
      }
    }
    return out
  }

  return { text: render(nodes), links, meta }
}

const TOKEN =
  /<(?<closing>\/?)(?<formatTag>b|i|s|u|code|sub|sup)>|<(?<leaf>br|tab|z)\/>|<a(?<openLink>\d+)>|<\/a(?<closeLink>\d+)>|(?<chunk>[^<]+)|(?<stray><)/g

/**
 * Markup back to Lexical nodes.
 *
 * Metadata is restored positionally. A translation legitimately changes how
 * many text nodes a run contains — English moves the emphasis — so when the
 * counts differ the first source node's metadata is used as the template
 * rather than misaligning the rest.
 */
export function parse(projection: Projection): ProjNode[] {
  const { text, links, meta } = projection
  const root: ProjNode[] = []
  /** Open element stack: format bits accumulate, links capture children. */
  const stack: { tag: string; out: ProjNode[]; format: number }[] = [
    { tag: '', out: root, format: 0 },
  ]
  let textIndex = 0

  const top = () => {
    const entry = stack.at(-1)
    if (!entry) {
      throw new Error('projection: stack underflow')
    }
    return entry
  }

  for (const match of text.matchAll(TOKEN)) {
    const { closing, formatTag, leaf, openLink, closeLink, chunk, stray } =
      match.groups ?? {}

    if (stray) {
      throw new Error(`projection: unescaped "<" at ${match.index}`)
    }

    if (formatTag) {
      if (closing) {
        const entry = top()
        if (entry.tag !== formatTag) {
          throw new Error(
            `projection: </${formatTag}> closes <${entry.tag || 'nothing'}>`
          )
        }
        stack.pop()
      } else {
        const bit = FORMAT_TAGS.find((e) => e.tag === formatTag)?.bit ?? 0
        stack.push({
          tag: formatTag,
          out: top().out,
          format: top().format | bit,
        })
      }
      continue
    }

    if (leaf === 'z') {
      // A zero-length text node: consumes a meta slot exactly as a non-empty
      // one does, so later nodes stay aligned with their source.
      const source = meta[textIndex] ?? meta[0] ?? { type: 'text' }
      textIndex += 1
      top().out.push({ ...source, text: '', format: top().format })
      continue
    }

    if (leaf) {
      top().out.push({ type: leaf === 'br' ? 'linebreak' : 'tab', version: 1 })
      continue
    }

    if (openLink !== undefined) {
      const index = Number(openLink)
      const source = links[index]
      if (!source) {
        throw new Error(`projection: <a${index}> has no link in the table`)
      }
      const node: ProjNode = { ...source, children: [] }
      top().out.push(node)
      stack.push({
        tag: `a${index}`,
        out: node.children as ProjNode[],
        format: 0,
      })
      continue
    }

    if (closeLink !== undefined) {
      const entry = top()
      if (entry.tag !== `a${closeLink}`) {
        throw new Error(`projection: </a${closeLink}> closes <${entry.tag}>`)
      }
      stack.pop()
      continue
    }

    if (chunk) {
      // Positional restore. A translation legitimately changes how many text
      // nodes a run holds — English moves the emphasis — so when it runs past
      // the source count the first node's properties are the template rather
      // than misaligning the rest.
      const source = meta[textIndex] ?? meta[0] ?? { type: 'text' }
      textIndex += 1
      top().out.push({
        ...source,
        text: unescapeMarkup(chunk),
        format: top().format,
      })
    }
  }

  if (stack.length !== 1) {
    throw new Error(`projection: ${stack.length - 1} unclosed tag(s)`)
  }
  return root
}

export interface Run {
  /** The node whose children the run belongs to. */
  parent: ProjNode
  /** Index of the run's first child. */
  start: number
  /** One past the run's last child. */
  end: number
}

/**
 * Every maximal run of adjacent inline children in the tree, in document
 * order. Runs of pure whitespace are included — dropping them would shift
 * every later index.
 */
export function runsOf(root: ProjNode): Run[] {
  const runs: Run[] = []
  const walk = (node: ProjNode) => {
    const children = node.children ?? []
    let start: number | null = null
    children.forEach((child, index) => {
      if (INLINE_TYPES.has(String(child.type))) {
        if (start === null) {
          start = index
        }
        return
      }
      if (start !== null) {
        runs.push({ parent: node, start, end: index })
        start = null
      }
      walk(child)
    })
    if (start !== null) {
      runs.push({ parent: node, start, end: children.length })
    }
  }
  walk(root)
  return runs
}

/** The nodes a run covers. */
export function nodesOf(run: Run): ProjNode[] {
  return (run.parent.children ?? []).slice(run.start, run.end)
}

/** Replace a run's nodes in place. Lengths may differ. */
export function replaceRun(run: Run, nodes: ProjNode[]): void {
  const children = run.parent.children
  if (!children) {
    throw new Error('projection: run parent has no children')
  }
  children.splice(run.start, run.end - run.start, ...nodes)
}
