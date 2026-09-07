/**
 * Editor-authored blocks through the translation pipeline (design D5).
 *
 * The projection is the only thing that decides what text reaches a translator
 * and what the gate compares. A `block` node's text lives in `fields`, not in
 * children, so `runsOf` — which walks children — sees nothing at all. Without
 * the second kind of run below, an English body would silently keep the Polish
 * caption of every stat and the Polish title of every pillar, and every gate in
 * the chain would call it sound.
 *
 * Run with: bun test lib/payload/post-blocks-translation.test.ts
 */

import { describe, expect, test } from 'bun:test'
import { blockRunsOf, type ProjNode } from '@/lib/payload/post-projection'
import { checkTree, hasErrors } from '@/lib/payload/post-translation-gate'

/** A body with prose and both blocks — the SSI post's shape. */
const body = (): ProjNode => ({
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: 'Wstęp przed liczbą.', format: 0 }],
    },
    {
      type: 'block',
      fields: {
        blockType: 'stat',
        id: '6a9e0000000000000000000a',
        value: '45%',
        caption: 'więcej szans sprzedażowych',
      },
    },
    {
      type: 'block',
      fields: {
        blockType: 'pillars',
        id: '6a9e0000000000000000000b',
        chip: 'maks. 25 pkt',
        items: [
          {
            id: 'r1',
            title: 'Marka osobista',
            description: 'Uzupełnij profil.',
          },
          { id: 'r2', title: 'Właściwi ludzie' },
        ],
      },
    },
  ],
})

const clone = (node: ProjNode): ProjNode => JSON.parse(JSON.stringify(node))

describe('block runs', () => {
  test('project every text field, and nothing that identifies a row', () => {
    expect(
      blockRunsOf(body()).map(({ path, text }) => ({ path, text }))
    ).toEqual([
      { path: 'block.0.fields.caption', text: 'więcej szans sprzedażowych' },
      { path: 'block.0.fields.value', text: '45%' },
      { path: 'block.1.fields.chip', text: 'maks. 25 pkt' },
      {
        path: 'block.1.fields.items.0.description',
        text: 'Uzupełnij profil.',
      },
      { path: 'block.1.fields.items.0.title', text: 'Marka osobista' },
      { path: 'block.1.fields.items.1.title', text: 'Właściwi ludzie' },
    ])
  })

  test('write back into the node the run came from', () => {
    const en = clone(body())
    for (const run of blockRunsOf(en)) {
      if (run.path === 'block.1.fields.items.1.title') {
        run.write('The right people')
      }
    }
    const items = (
      (en.children?.[2]?.fields as { items: { title: string }[] }) ?? {
        items: [],
      }
    ).items
    expect(items[1]?.title).toBe('The right people')
    // The neighbouring row is untouched: paths address a field, not a position
    // in a flat list that a rewrite could shift.
    expect(items[0]?.title).toBe('Marka osobista')
  })
})

describe('the structural gate', () => {
  test('accepts a translation that changed only the block text', () => {
    const en = clone(body())
    for (const run of blockRunsOf(en)) {
      run.write(`EN ${run.text}`)
    }
    expect(hasErrors(checkTree(body(), en))).toBe(false)
  })

  test('reports a pillars item the translation dropped', () => {
    const en = clone(body())
    const fields = en.children?.[2]?.fields as { items: unknown[] }
    fields.items = fields.items.slice(0, 1)

    const findings = checkTree(body(), en)
    expect(hasErrors(findings)).toBe(true)
    expect(findings.map((f) => f.message).join('\n')).toContain('items[2]')
  })

  test('reports a block the translation replaced with another', () => {
    const en = clone(body())
    const block = en.children?.[1]?.fields as { blockType: string }
    block.blockType = 'pillars'
    expect(hasErrors(checkTree(body(), en))).toBe(true)
  })
})
