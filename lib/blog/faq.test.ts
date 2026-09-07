/**
 * FAQ-shape detection (design D4).
 *
 * The fixtures are the shapes the corpus actually has, read off the published
 * bodies: `reklama-na-facebooku` closes with `FAQ – często zadawane pytania`
 * and three `h3`+paragraph pairs and nothing after them, and
 * `jak-angazowac-na-facebooku…` closes with a section that LOOKS like one —
 * `h3`s with answers under them — but is prose with images and a heading that
 * never says FAQ. Only the first may become disclosures; folding the second
 * would hide the article's ending behind closed rows.
 *
 * Run with: bun test lib/blog/faq.test.ts
 */

import { describe, expect, test } from 'bun:test'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { detectFaq } from '@/lib/blog/faq'

const h = (tag: 'h2' | 'h3', text: string) => ({
  type: 'heading',
  tag,
  children: [{ type: 'text', text }],
})
const p = (text: string) => ({
  type: 'paragraph',
  children: [{ type: 'text', text }],
})
const img = { type: 'upload', relationTo: 'media', value: 7 }

const body = (children: unknown[]) =>
  ({ root: { type: 'root', children } }) as unknown as SerializedEditorState

/** `reklama-na-facebooku`, from its 62nd child on. */
const FAQ_TAIL = [
  h('h2', 'Czy reklama na Facebooku nadal się opłaca?'),
  p('Reklama na Facebooku nadal się opłaca, gdy ma jasny cel.'),
  h('h2', 'Podsumowanie'),
  p('Reklama na Facebooku to narzędzie do pozyskiwania klientów.'),
  h('h2', 'FAQ – często zadawane pytania'),
  h('h3', 'Ile kosztuje reklama na Facebooku?'),
  p('Reklama może startować od około 20–30 zł dziennie.'),
  h('h3', 'Jak zrobić reklamę na Facebooku?'),
  p('Trzeba mieć fanpage, konto reklamowe i dostęp do Menedżera Firmy.'),
  h('h3', 'Czy promowanie postów wystarczy?'),
  p('Promowanie postów wystarcza do prostego zwiększenia zasięgu.'),
]

describe('strict-shape FAQ detection', () => {
  test('finds the closing section and every pair, in document order', () => {
    const faq = detectFaq(body([p('Wstęp.'), ...FAQ_TAIL]))

    expect(faq?.index).toBe(5)
    expect(faq?.pairs.map((pair) => pair.questionText)).toEqual([
      'Ile kosztuje reklama na Facebooku?',
      'Jak zrobić reklamę na Facebooku?',
      'Czy promowanie postów wystarczy?',
    ])
    expect(faq?.pairs[0]?.answerText).toStartWith('Reklama może startować')
  })

  test('reports the tracked headings before it, so the slugs line up', () => {
    // Two `h2`s precede the FAQ heading in the fixture above.
    expect(detectFaq(body([p('Wstęp.'), ...FAQ_TAIL]))?.headingOffset).toBe(2)
  })

  test('an English heading works the same way', () => {
    const faq = detectFaq(
      body([
        p('Intro.'),
        h('h2', 'FAQ — frequently asked questions'),
        h('h3', 'What does it cost?'),
        p('From about 20–30 zł a day while testing.'),
      ])
    )
    expect(faq?.pairs).toHaveLength(1)
  })

  test('a last section that never says FAQ renders plain', () => {
    // `jak-angazowac-na-facebooku…`: the loose "mentions pytania" rule would
    // have swallowed this one.
    expect(
      detectFaq(
        body([
          p('Wstęp.'),
          h('h2', 'Głosowanie reakcjami i pytania angażujące'),
          h('h3', 'Ankieta w relacji'),
          p('Zapytaj wprost.'),
        ])
      )
    ).toBeNull()
  })

  test('an image inside the section renders plain', () => {
    expect(
      detectFaq(
        body([
          h('h2', 'FAQ – często zadawane pytania'),
          h('h3', 'Ile to kosztuje?'),
          p('Od 20 zł.'),
          img,
        ])
      )
    ).toBeNull()
  })

  test('a second answer paragraph renders plain', () => {
    expect(
      detectFaq(
        body([
          h('h2', 'FAQ – często zadawane pytania'),
          h('h3', 'Ile to kosztuje?'),
          p('Od 20 zł.'),
          p('Ale zależy od branży.'),
        ])
      )
    ).toBeNull()
  })

  test('an FAQ that is not the last section renders plain', () => {
    expect(
      detectFaq(
        body([
          h('h2', 'FAQ – często zadawane pytania'),
          h('h3', 'Ile to kosztuje?'),
          p('Od 20 zł.'),
          h('h2', 'Podsumowanie'),
          p('Koniec.'),
        ])
      )
    ).toBeNull()
  })

  test('a heading with no pairs after it renders plain', () => {
    expect(
      detectFaq(body([h('h2', 'FAQ – często zadawane pytania')]))
    ).toBeNull()
  })
})
