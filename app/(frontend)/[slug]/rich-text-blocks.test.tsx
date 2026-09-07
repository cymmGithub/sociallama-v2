/**
 * The two editor-authored blocks, rendered.
 *
 * The field names in `rich-text.tsx` are declared by hand — Payload types a
 * Lexical body as an untyped tree, so nothing in the compiler connects them to
 * the block configs in `lib/payload/blocks/post-blocks.ts`. A rename on either
 * side would type-check and render an empty card. This is the only thing that
 * catches it.
 *
 * Run with: bun test "app/(frontend)/[slug]/rich-text-blocks.test.tsx"
 */

import { describe, expect, test } from 'bun:test'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { render } from '@testing-library/react'
import { pillarsBlock, statBlock } from '@/lib/payload/blocks/post-blocks'
import { PostRichText } from './rich-text'

/** Field names the block configs actually declare, for the contract check. */
const fieldNames = (block: typeof statBlock) =>
  block.fields.map((field) => ('name' in field ? field.name : ''))

const block = (fields: Record<string, unknown>) => ({
  type: 'block',
  version: 2,
  format: '',
  fields,
})

const body = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      block({
        blockType: 'stat',
        value: '45%',
        caption: 'więcej szans sprzedażowych',
      }),
      block({
        blockType: 'pillars',
        chip: 'maks. 25 pkt',
        items: [
          { title: 'Marka osobista', description: 'Uzupełnij profil.' },
          { title: 'Właściwi ludzie', description: 'Szukaj świadomie.' },
        ],
      }),
      block({
        blockType: 'pillars',
        items: [{ title: 'Bez plakietki' }, { title: 'I bez opisu' }],
      }),
    ],
  },
} as unknown as SerializedEditorState

const { container } = render(
  <PostRichText
    basePath=""
    categoryPath="/category"
    data={body}
    fallbackHref="/"
    locale="pl"
    unoptimized={true}
  />
)

const cards = [...container.querySelectorAll('ol > li')]

describe('post body blocks', () => {
  test('the stat aside shows the value and its caption', () => {
    const aside = container.querySelector('aside')
    expect(aside?.textContent).toBe('45%więcej szans sprzedażowych')
  })

  test('pillars render one numbered card per item, in array order', () => {
    expect(cards).toHaveLength(4)
    expect(cards[0]?.textContent).toStartWith('1Marka osobista')
    expect(cards[1]?.textContent).toStartWith('2Właściwi ludzie')
    // The second block restarts at 1 — the ordinal is the item's position in
    // its own block, not a running count down the page.
    expect(cards[2]?.textContent).toStartWith('1Bez plakietki')
  })

  test('the chip appears on every card of the block that sets one', () => {
    expect(cards[0]?.textContent).toContain('maks. 25 pkt')
    expect(cards[1]?.textContent).toContain('maks. 25 pkt')
  })

  test('a block without a chip renders no chip element, not an empty one', () => {
    // Two children: the ordinal and the title. Nothing else.
    expect(cards[2]?.children).toHaveLength(2)
    expect(cards[2]?.textContent).toBe('1Bez plakietki')
  })

  test('the rendered field names are the ones the blocks declare', () => {
    expect(fieldNames(statBlock)).toEqual(['value', 'caption'])
    expect(fieldNames(pillarsBlock)).toEqual(['items', 'chip'])
  })
})
