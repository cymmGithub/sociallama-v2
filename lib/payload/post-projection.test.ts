/**
 * Unit tests for the Lexical ⇄ markup projection (lib/payload/post-projection.ts).
 *
 * Run with: bun test lib/payload/post-projection.test.ts
 *
 * The fixtures are the shapes the real corpus actually contains, including the
 * ones design D3 says cannot occur — a quote wrapping paragraphs, a list item
 * holding text beside a nested list, an upload inside a list item. Those are
 * measured facts, not hypotheticals, and they are the cases a naive
 * block-level projection destroys.
 *
 * The round-trip is the property that matters: a grammar that cannot reproduce
 * Polish will not survive English.
 */

import { describe, expect, it } from 'bun:test'
import {
  nodesOf,
  type ProjNode,
  parse,
  project,
  replaceRun,
  runsOf,
} from '@/lib/payload/post-projection'

const text = (
  value: string,
  format = 0,
  extra: Partial<ProjNode> = {}
): ProjNode => ({
  type: 'text',
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
  ...extra,
})

const roundTrips = (nodes: ProjNode[]) =>
  expect(parse(project(nodes))).toEqual(nodes)

describe('project → parse round-trip', () => {
  it('plain text', () => {
    roundTrips([text('Reklama jest tańsza.')])
  })

  it('every single format bit the corpus uses', () => {
    // Measured: 1 BOLD, 2 ITALIC, 4 STRIKE, 8 UNDERLINE occur; 3 and 9 compose.
    for (const format of [0, 1, 2, 4, 8, 3, 9]) {
      roundTrips([text('słowo', format)])
    }
  })

  it('composed bits nest outermost-lowest-bit', () => {
    expect(project([text('x', 3)]).text).toBe('<b><i>x</i></b>')
    expect(project([text('x', 9)]).text).toBe('<b><u>x</u></b>')
  })

  it('an inline emphasis run splitting a sentence', () => {
    roundTrips([
      text('Reklama jest '),
      text('tańsza', 1),
      text(' niż sądzisz.'),
    ])
  })

  it('adjacent nodes of the same format are not merged', () => {
    // The source tree distinguishes them, so the round-trip must too.
    const nodes = [text('a', 1), text('b', 1)]
    expect(project(nodes).text).toBe('<b>a</b><b>b</b>')
    roundTrips(nodes)
  })

  it('a link, with its fields held out of band', () => {
    const nodes: ProjNode[] = [
      text('Więcej w '),
      {
        type: 'link',
        fields: { linkType: 'custom', url: 'https://x.pl', newTab: true },
        children: [text('naszym wpisie')],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 3,
      },
      text('.'),
    ]
    const projection = project(nodes)
    expect(projection.text).toBe('Więcej w <a0>naszym wpisie</a0>.')
    expect(projection.links).toHaveLength(1)
    roundTrips(nodes)
  })

  it('an internal link keeps its document relation verbatim', () => {
    const fields = {
      linkType: 'internal',
      doc: { relationTo: 'posts', value: 42 },
    }
    const nodes: ProjNode[] = [
      {
        type: 'link',
        fields,
        children: [text('tamten wpis')],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 3,
      },
    ]
    expect(project(nodes).links[0]?.fields).toEqual(fields)
    roundTrips(nodes)
  })

  it('an autolink does not come back as a link', () => {
    const nodes: ProjNode[] = [
      {
        type: 'autolink',
        fields: { linkType: 'custom', url: 'https://x.pl' },
        children: [text('https://x.pl')],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ]
    expect(parse(project(nodes))[0]?.type).toBe('autolink')
    roundTrips(nodes)
  })

  it('emphasis inside a link', () => {
    roundTrips([
      {
        type: 'link',
        fields: { linkType: 'custom', url: 'https://x.pl' },
        children: [text('bardzo '), text('ważne', 1)],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 3,
      },
    ])
  })

  it('line breaks, which the corpus has 125 of', () => {
    const nodes = [
      text('pierwsza'),
      { type: 'linebreak', version: 1 },
      text('druga'),
    ]
    expect(project(nodes).text).toBe('pierwsza<br/>druga')
    roundTrips(nodes)
  })

  it('text nodes that omit detail/mode/style keep omitting them', () => {
    // 39 of the corpus's 3,225 text nodes carry none of the three. Emitting
    // defaults would change the stored document on a no-op translation.
    const bare: ProjNode = { type: 'text', text: 'goły', format: 0, version: 1 }
    expect(parse(project([bare]))).toEqual([bare])
  })

  it('a zero-length text node survives, formatted or not', () => {
    // 33 in the corpus — WordPress debris, usually trailing a link. Dropping
    // them would silently edit a third of a percent of the posts and put the
    // English leaf sequence permanently out of step with the Polish one.
    roundTrips([text('link'), text('')])
    expect(project([text('')]).text).toBe('<z/>')
    // One of them carries ITALIC. `<z/>` outside the tags loses it.
    expect(project([text('', 2)]).text).toBe('<i><z/></i>')
    roundTrips([text('', 2)])
  })

  it('markup characters in the source survive escaping', () => {
    roundTrips([text('cena < 100 zł & dostawa')])
  })
})

describe('parse rejects rather than guesses', () => {
  const bad = (text: string) => parse({ text, links: [], meta: [] })

  it('an unclosed tag', () => {
    expect(() => bad('<b>x')).toThrow(/unclosed/)
  })

  it('crossed tags', () => {
    expect(() => bad('<b><i>x</b></i>')).toThrow(/closes/)
  })

  it('a stray angle bracket', () => {
    expect(() => bad('a < b')).toThrow(/unescaped/)
  })

  it('a format bit outside the grammar', () => {
    expect(() => project([text('x', 128)])).toThrow(/unknown format/)
  })

  it('a block node handed to the inline projector', () => {
    expect(() => project([{ type: 'upload', value: 7 }])).toThrow(
      /not an inline/
    )
  })
})

describe('runsOf — the structures D3 says cannot exist', () => {
  const para = (...kids: ProjNode[]): ProjNode => ({
    type: 'paragraph',
    children: kids,
  })

  it('a paragraph of prose is one run', () => {
    const root = { type: 'root', children: [para(text('a'), text('b', 1))] }
    const runs = runsOf(root)
    expect(runs).toHaveLength(1)
    expect(nodesOf(runs[0] as never)).toHaveLength(2)
  })

  it('a quote yields no run of its own — its paragraphs each yield one', () => {
    // 18 paragraphs live inside quotes in the corpus. Projecting the quote as
    // a leaf would flatten them into a single text node.
    const root = {
      type: 'root',
      children: [
        { type: 'quote', children: [para(text('a')), para(text('b'))] },
      ],
    }
    const runs = runsOf(root)
    expect(runs).toHaveLength(2)
    expect(runs.every((run) => run.parent.type === 'paragraph')).toBe(true)
  })

  it('a list item holding text beside a nested list yields a run for the text', () => {
    const root = {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            {
              type: 'listitem',
              children: [
                text('nadrzędny'),
                {
                  type: 'list',
                  children: [
                    { type: 'listitem', children: [text('zagnieżdżony')] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
    const runs = runsOf(root)
    expect(runs).toHaveLength(2)
    expect(nodesOf(runs[0] as never).map((n) => n.text)).toEqual(['nadrzędny'])
    expect(nodesOf(runs[1] as never).map((n) => n.text)).toEqual([
      'zagnieżdżony',
    ])
  })

  it('an upload inside a list item splits the run around it, never drops it', () => {
    const upload = { type: 'upload', value: 7, relationTo: 'media' }
    const root = {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            { type: 'listitem', children: [text('przed'), upload, text('po')] },
          ],
        },
      ],
    }
    const runs = runsOf(root)
    expect(runs).toHaveLength(2)
    // The upload is still exactly where it was.
    expect(root.children[0]?.children?.[0]?.children?.[1]).toBe(upload as never)
  })

  it('replaceRun swaps a run in place without disturbing its siblings', () => {
    const upload = { type: 'upload', value: 7 }
    const root: ProjNode = {
      type: 'root',
      children: [para(text('stary')), upload],
    }
    const runs = runsOf(root)
    replaceRun(runs[0] as never, [text('new')])
    const firstChild = (root.children ?? [])[0]
    expect((firstChild?.children ?? [])[0]?.text).toBe('new')
    expect((root.children ?? [])[1]).toBe(upload)
  })
})
