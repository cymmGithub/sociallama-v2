/**
 * Unit tests for the translation gate (lib/payload/post-translation-gate.ts).
 *
 * Run with: bun test lib/payload/post-translation-gate.test.ts
 *
 * A gate is only worth having if it fails. Every case here pairs an acceptable
 * translation with the corresponding defect, because a check that never
 * rejects anything would pass this suite just as happily as a correct one.
 */

import { describe, expect, it } from 'bun:test'
import { type ProjNode, project } from '@/lib/payload/post-projection'
import {
  checkDiacritics,
  checkHeadings,
  checkRunMarkup,
  checkSlug,
  checkTree,
  hasErrors,
} from '@/lib/payload/post-translation-gate'

const text = (value: string, format = 0): ProjNode => ({
  type: 'text',
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const link = (url: string, ...kids: ProjNode[]): ProjNode => ({
  type: 'link',
  fields: { linkType: 'custom', url, newTab: false },
  children: kids,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 3,
})

const para = (...kids: ProjNode[]): ProjNode => ({
  type: 'paragraph',
  children: kids,
})

const errorsOf = (findings: { level: string; message: string }[]) =>
  findings.filter((f) => f.level === 'error').map((f) => f.message)

describe('checkRunMarkup', () => {
  const source = project([
    text('Reklama jest '),
    text('tańsza', 1),
    text(' niż '),
    link('https://ads.google', text('Google Ads')),
    text('.'),
  ])

  it('accepts a faithful translation that reorders words', () => {
    const ok = 'Advertising is <b>cheaper</b> than <a0>Google Ads</a0>.'
    expect(checkRunMarkup(source, ok, 'run 0')).toEqual([])
  })

  it('rejects a dropped link', () => {
    const bad = 'Advertising is <b>cheaper</b> than Google Ads.'
    expect(errorsOf(checkRunMarkup(source, bad, 'run 0')).join()).toMatch(
      /<a0> appears 0 time/
    )
  })

  it('rejects a duplicated link', () => {
    const bad =
      'Advertising is <b>cheaper</b> than <a0>Google</a0> <a0>Ads</a0>.'
    expect(errorsOf(checkRunMarkup(source, bad, 'run 0')).join()).toMatch(
      /appears 2 time/
    )
  })

  it('rejects an invented link', () => {
    const bad =
      'Advertising is <b>cheaper</b> than <a0>Google Ads</a0> and <a1>Meta</a1>.'
    expect(errorsOf(checkRunMarkup(source, bad, 'run 0')).join()).toMatch(
      /<a1> has no link/
    )
  })

  it('rejects dropped emphasis', () => {
    const bad = 'Advertising is cheaper than <a0>Google Ads</a0>.'
    expect(hasErrors(checkRunMarkup(source, bad, 'run 0'))).toBe(true)
  })

  it('rejects emphasis that moved relative to the link', () => {
    // Same tags, different order — a document change dressed as a language one.
    const bad = 'Advertising is cheaper than <a0>Google Ads</a0><b>!</b>'
    expect(errorsOf(checkRunMarkup(source, bad, 'run 0')).join()).toMatch(
      /tag sequence changed/
    )
  })

  it('rejects unparseable markup rather than writing it', () => {
    const bad = 'Advertising is <b>cheaper than <a0>Google Ads</a0>.'
    expect(errorsOf(checkRunMarkup(source, bad, 'run 0')).join()).toMatch(
      /will not parse/
    )
  })

  it('rejects an empty translation of non-empty source', () => {
    expect(errorsOf(checkRunMarkup(source, '', 'run 0')).join()).toMatch(
      /translated to nothing/
    )
  })

  it('holds line breaks in place', () => {
    const withBreak = project([text('a'), { type: 'linebreak' }, text('b')])
    expect(checkRunMarkup(withBreak, 'x<br/>y', 'run 0')).toEqual([])
    expect(hasErrors(checkRunMarkup(withBreak, 'xy', 'run 0'))).toBe(true)
    expect(hasErrors(checkRunMarkup(withBreak, '<br/>xy', 'run 0'))).toBe(true)
  })
})

describe('checkTree', () => {
  const upload = (id: number): ProjNode => ({
    type: 'upload',
    value: id,
    relationTo: 'media',
  })

  const pl: ProjNode = {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h2', children: [text('Nagłówek')] },
      para(text('Treść')),
      upload(7),
      para(text('Więcej')),
    ],
  }

  it('accepts a translation with the same shape', () => {
    const en: ProjNode = {
      type: 'root',
      children: [
        { type: 'heading', tag: 'h2', children: [text('Heading')] },
        para(text('Body')),
        upload(7),
        para(text('More')),
      ],
    }
    expect(checkTree(pl, en)).toEqual([])
  })

  it('rejects a dropped image', () => {
    const en: ProjNode = {
      type: 'root',
      children: [
        { type: 'heading', tag: 'h2', children: [text('Heading')] },
        para(text('Body')),
        para(text('More')),
      ],
    }
    expect(errorsOf(checkTree(pl, en)).join()).toMatch(/structure diverges/)
  })

  it('rejects an image swapped for a different one', () => {
    const en: ProjNode = {
      type: 'root',
      children: [
        { type: 'heading', tag: 'h2', children: [text('Heading')] },
        para(text('Body')),
        upload(9),
        para(text('More')),
      ],
    }
    expect(errorsOf(checkTree(pl, en)).join()).toMatch(
      /upload:7 vs EN upload:9/
    )
  })

  it('rejects a heading demoted to a paragraph, which would kill the ToC', () => {
    const en: ProjNode = {
      type: 'root',
      children: [
        para(text('Heading')),
        para(text('Body')),
        upload(7),
        para(text('More')),
      ],
    }
    expect(hasErrors(checkTree(pl, en))).toBe(true)
  })

  it('rejects a merged paragraph', () => {
    const en: ProjNode = {
      type: 'root',
      children: [
        { type: 'heading', tag: 'h2', children: [text('Heading')] },
        para(text('Body and more')),
        upload(7),
      ],
    }
    expect(errorsOf(checkTree(pl, en)).join()).toMatch(/run\(s\) in Polish/)
  })
})

describe('checkSlug', () => {
  it('accepts an English slug', () => {
    expect(checkSlug('is-linkedin-premium-worth-it')).toEqual([])
  })

  it('rejects a non-URL-safe slug', () => {
    for (const bad of ['Ma Duże Litery', 'ze_spacja', 'czy--warto', 'ę-ą']) {
      expect(hasErrors(checkSlug(bad))).toBe(true)
    }
  })

  it('rejects the static siblings of /en/blog/[slug]', () => {
    expect(hasErrors(checkSlug('page'))).toBe(true)
    expect(hasErrors(checkSlug('category'))).toBe(true)
  })

  it('rejects a slug another post already uses', () => {
    expect(
      errorsOf(checkSlug('taken', { takenBy: 'inny-wpis' })).join()
    ).toMatch(/already used/)
  })

  it('does not reject a post reusing its own slug', () => {
    expect(
      hasErrors(checkSlug('same', { takenBy: 'same', polishSlug: 'same' }))
    ).toBe(false)
  })

  it('warns, but does not reject, an untranslated slug', () => {
    const findings = checkSlug('linkedin-premium', {
      polishSlug: 'linkedin-premium',
    })
    expect(hasErrors(findings)).toBe(false)
    expect(findings.some((f) => f.level === 'warn')).toBe(true)
  })
})

describe('checkHeadings', () => {
  const withHeading = (value: string): ProjNode => ({
    type: 'root',
    children: [{ type: 'heading', tag: 'h2', children: [text(value)] }],
  })

  it('accepts a normal heading', () => {
    expect(checkHeadings(withHeading('Who is behind it?'))).toEqual([])
  })

  it('rejects one past the 85-character limit', () => {
    expect(hasErrors(checkHeadings(withHeading('x'.repeat(86))))).toBe(true)
  })

  it('rejects an empty heading', () => {
    expect(hasErrors(checkHeadings(withHeading('   ')))).toBe(true)
  })
})

describe('checkDiacritics', () => {
  it('says nothing about clean English', () => {
    expect(checkDiacritics('Advertising is cheaper.', [], 'body')).toEqual([])
  })

  it('warns — never rejects — on leftover Polish', () => {
    const findings = checkDiacritics('To jest tłumaczenie.', [], 'body')
    expect(hasErrors(findings)).toBe(false)
    expect(findings[0]?.message).toMatch(/tłumaczenie/)
  })

  it('stays silent on allowlisted proper nouns', () => {
    // The glossary rule requires these to survive, so flagging them would
    // contradict the brief the translator was given.
    expect(
      checkDiacritics(
        'Written by Łukasz Płociński at Pracuj.pl.',
        ['Łukasz', 'Płociński', 'Pracuj.pl'],
        'body'
      )
    ).toEqual([])
  })

  it('covers a word inside an allowlisted phrase', () => {
    expect(
      checkDiacritics(
        'The Łączy nas piłka project',
        ['Łączy nas piłka'],
        'body'
      )
    ).toEqual([])
  })
})
