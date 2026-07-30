import { describe, expect, test } from 'bun:test'
import {
  applyOrphans,
  classify,
  findOrphans,
  isCopyValue,
  NBSP,
} from './orphan-rules'

/** Binds `text` and marks each inserted gap, so an expectation reads as copy. */
function bound(text: string): string {
  return applyOrphans(text, findOrphans(text)).replaceAll(NBSP, '_')
}

/** Just the tiers that fired, in order, for asserting what a rule claimed. */
function tiers(text: string): string[] {
  return findOrphans(text).map((hit) => `${hit.tier}:${hit.token}`)
}

/**
 * Only the single-letter tokens. The T1 cases below all sit in real Polish
 * sentences, which means T2 words like `na` and `za` fire too; asserting on
 * every tier would test T2's word list rather than T1's word boundary.
 */
function t1(text: string): string[] {
  return findOrphans(text)
    .filter((hit) => hit.tier === 'T1')
    .map((hit) => hit.token)
}

describe('T1 — single-letter function words', () => {
  test('binds a single-letter word to the word after it', () => {
    expect(bound('Umiesz się zachować w grupie?')).toBe(
      'Umiesz się zachować w_grupie?'
    )
  })

  test('binds a sentence-initial capital', () => {
    expect(bound('Zrobione. A my robimy swoje')).toBe(
      'Zrobione. A_my robimy swoje'
    )
  })

  test('binds a chain of two, which Polish requires', () => {
    expect(bound('wzrost eksportu i o 50% dziennie')).toBe(
      'wzrost eksportu i_o_50% dziennie'
    )
  })

  test('leaves a feminine suffix alone', () => {
    // `odpowiedzialny/a` is one word. Reading the `a` as standalone and binding
    // it glued a suffix onto the next word.
    expect(t1('będziesz odpowiedzialny/a za wynik')).toEqual([])
  })

  test('leaves the halves of an initialism alone', () => {
    expect(t1('Testy A/B na próbie')).toEqual([])
  })

  test('does not read the `e` in a hyphenated word as a word', () => {
    expect(t1('Wyślij e-mail o dowolnej porze')).toEqual(['o'])
  })

  test('needs something bindable after the gap', () => {
    expect(t1('zdanie kończy się literą w')).toEqual([])
  })
})

describe('gap shapes', () => {
  test('a source line break is a gap, because JSX collapses it to a space', () => {
    expect(
      bound('przyciągają uwagę i\n              prowokują do interakcji')
    ).toBe('przyciągają uwagę i_prowokują do_interakcji')
  })

  test('an existing non-breaking space is not re-bound', () => {
    expect(
      findOrphans(`Zaczynaliśmy od${NBSP}1${NBSP}168 obserwujących`)
    ).toHaveLength(0)
  })
})

describe('tier precedence', () => {
  test('a gap claimed by two rules is reported once, by the stronger tier', () => {
    // `w` (T1) and `we` (T2) both look at "we Wrocławiu"; only one gap exists.
    const hits = findOrphans('siedzibą we Wrocławiu przy ulicy')
    expect(hits.filter((hit) => hit.index === hits[0]?.index)).toHaveLength(1)
  })

  test('hits never overlap, so one pass can apply them all', () => {
    const text = 'Ponad 26 000 000 polubień na Facebooku i o 44% więcej'
    const hits = findOrphans(text)
    for (const [at, hit] of hits.entries()) {
      const next = hits[at + 1]
      if (next) {
        expect(hit.index + hit.length).toBeLessThanOrEqual(next.index)
      }
    }
  })
})

describe('T3 — numbers and abbreviations', () => {
  test('binds a thousands separator', () => {
    expect(bound('1 615 nowych obserwujących w tym roku')).toBe(
      '1_615 nowych obserwujących w_tym roku'
    )
  })

  test('binds a number to its unit', () => {
    expect(tiers('wzrost 6,79 mln wyświetleń łącznie')).toContain('T3:9')
  })

  test('binds an abbreviation to what it qualifies', () => {
    expect(bound('mieści się przy ul. Płockiej')).toBe(
      'mieści się przy ul._Płockiej'
    )
  })
})

describe('classify', () => {
  test('all-caps display type is held back', () => {
    expect(classify('POROZMAWIAJMY O TWOIM BIZNESIE')).toBe('all-caps')
  })

  test('a short label is held back', () => {
    expect(classify('Filmy o AI · YouTube')).toBe('short-label')
  })

  test('a full sentence is prose', () => {
    expect(
      classify('Koszt prowadzenia social media zależy od liczby platform.')
    ).toBe('prose')
  })
})

describe('isCopyValue', () => {
  test('rejects keys that never reach the layout', () => {
    expect(isCopyValue('alt', 'Zespół w biurze')).toBe(false)
    expect(isCopyValue('llamaAlt', 'Lama w kapeluszu')).toBe(false)
    expect(
      isCopyValue('metaDescription', 'Agencja social media w Warszawie')
    ).toBe(false)
  })

  test('rejects paths and urls', () => {
    expect(isCopyValue('body', '/assets/a b.png')).toBe(false)
    expect(isCopyValue('body', 'https://example.pl/a b')).toBe(false)
  })

  test('accepts prose', () => {
    expect(
      isCopyValue('body', 'Prowadzimy social media w kilku branżach')
    ).toBe(true)
  })
})
