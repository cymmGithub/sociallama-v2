/**
 * Run with: bun test lib/payload/embed-quote-rules.test.ts
 *
 * Fixtures are the real shapes read from production on 2026-09-07 (posts 8,
 * 6 and 58), trimmed to the nodes that matter.
 */

import { describe, expect, it } from 'bun:test'
import { type LexicalNode, repairEmbedQuote } from './embed-quote-rules'

const text = (t: string): LexicalNode => ({
  mode: 'normal',
  text: t,
  type: 'text',
  style: '',
  detail: 0,
  format: 0,
  version: 1,
})
const br = (): LexicalNode => ({ type: 'linebreak', version: 1 })
const link = (url: string, label: string): LexicalNode => ({
  id: 'abc',
  type: 'link',
  fields: { url, newTab: true, linkType: 'custom' },
  format: '',
  indent: 0,
  version: 3,
  children: [text(label)],
  direction: null,
})
const paragraph = (children: LexicalNode[], format = ''): LexicalNode => ({
  type: 'paragraph',
  format,
  indent: 0,
  version: 1,
  children,
  direction: null,
  textStyle: '',
  textFormat: 0,
})
const quote = (children: LexicalNode[]): LexicalNode => ({
  type: 'quote',
  format: '',
  indent: 0,
  version: 1,
  children,
  direction: null,
})

const IG_POST =
  'https://www.instagram.com/p/DA8IGsNqmdc/?utm_source=ig_embed&utm_campaign=loading'

const instagramLeftover = quote([
  ...Array.from({ length: 8 }, br),
  text('Wyświetl ten post na Instagramie'),
  ...Array.from({ length: 16 }, br),
  paragraph(
    [link(IG_POST, 'Post udostępniony przez Biżuteria YES (@bizuteriayes)')],
    'center'
  ),
])

const tiktokVideoLeftover = quote([
  link('https://www.tiktok.com/@irobotpolska?refer=embed', '@irobotpolska'),
  paragraph([
    text('Radzi sobie przerażająco dobrze…🎃 *fake blood* '),
    link('https://www.tiktok.com/tag/halloween?refer=embed', '#halloween'),
    text(' '),
    link('https://www.tiktok.com/tag/roomba?refer=embed', '#roomba'),
  ]),
  paragraph([
    link(
      'https://www.tiktok.com/music/dźwięk-oryginalny-7410913599285103392?refer=embed',
      '♬ dźwięk oryginalny – iRobot Polska'
    ),
  ]),
])

const tiktokCreatorLeftover = quote([
  link('https://www.tiktok.com/@pracuj.pl?refer=creator_embed', '@pracuj.pl'),
])

describe('repairEmbedQuote — Instagram', () => {
  it('collapses the linebreak pile to the post link', () => {
    const result = repairEmbedQuote(instagramLeftover, 'pl')
    expect(result.verdict).toBe('repair')
    if (result.verdict !== 'repair') return
    expect(result.node).toEqual(
      quote([
        link(IG_POST, 'Post udostępniony przez Biżuteria YES (@bizuteriayes)'),
      ])
    )
  })

  it('keeps the EN label the WP export already translated', () => {
    const en = quote([
      br(),
      text('View this post on Instagram'),
      paragraph([link(IG_POST, 'A post shared by @agencja_graficzna_diea')]),
    ])
    const result = repairEmbedQuote(en, 'en')
    expect(result.verdict).toBe('repair')
    if (result.verdict !== 'repair') return
    expect(result.node.children?.[0]?.children?.[0]?.text).toBe(
      'A post shared by @agencja_graficzna_diea'
    )
  })

  it('refuses an Instagram quote with only a profile link', () => {
    const profileOnly = quote([
      link('https://www.instagram.com/bizuteriayes/', '@bizuteriayes'),
    ])
    expect(repairEmbedQuote(profileOnly, 'pl')).toEqual({
      verdict: 'no-primary-link',
      kind: 'instagram',
    })
  })
})

describe('repairEmbedQuote — TikTok', () => {
  it('drops caption, hashtags and music, keeps the creator link with a locale label', () => {
    const result = repairEmbedQuote(tiktokVideoLeftover, 'pl')
    expect(result.verdict).toBe('repair')
    if (result.verdict !== 'repair') return
    expect(result.node).toEqual(
      quote([
        link(
          'https://www.tiktok.com/@irobotpolska?refer=embed',
          '@irobotpolska na TikToku'
        ),
      ])
    )
  })

  it('labels a bare creator embed in English for the en locale', () => {
    const result = repairEmbedQuote(tiktokCreatorLeftover, 'en')
    expect(result.verdict).toBe('repair')
    if (result.verdict !== 'repair') return
    expect(result.node.children?.[0]?.children?.[0]?.text).toBe(
      '@pracuj.pl on TikTok'
    )
  })

  it('never picks a music or tag link as the primary one', () => {
    const noProfile = quote([
      paragraph([
        link('https://www.tiktok.com/tag/halloween?refer=embed', '#halloween'),
        link('https://www.tiktok.com/music/x-123?refer=embed', '♬ x'),
      ]),
    ])
    expect(repairEmbedQuote(noProfile, 'pl')).toEqual({
      verdict: 'no-primary-link',
      kind: 'tiktok',
    })
  })
})

describe('repairEmbedQuote — guards', () => {
  it('is idempotent: a repaired quote reports clean', () => {
    const first = repairEmbedQuote(tiktokVideoLeftover, 'pl')
    if (first.verdict !== 'repair') throw new Error('expected repair')
    expect(repairEmbedQuote(first.node, 'pl')).toEqual({
      verdict: 'clean',
      kind: 'tiktok',
    })
  })

  it('leaves an authored quote alone', () => {
    const authored = quote([
      text('Kto ma czas, ten ma pieniądze — '),
      link('https://sociallama.pl/o-nas', 'o nas'),
    ])
    expect(repairEmbedQuote(authored, 'pl')).toEqual({ verdict: 'not-embed' })
  })

  it('leaves a paragraph alone even when it links to Instagram', () => {
    const p = paragraph([link(IG_POST, 'zobacz post')])
    expect(repairEmbedQuote(p, 'pl')).toEqual({ verdict: 'not-embed' })
  })
})
