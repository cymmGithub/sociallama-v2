/**
 * The searchable half of the case-study hub.
 *
 * Worth unit-testing because it fails quietly: a study whose haystack lost a
 * field still renders a perfectly ordinary card, it just stops being findable
 * by the thing the reader remembers about it. The React parts need a renderer;
 * these two functions decide what matches.
 *
 * Run with: bun test "app/(frontend)/case-studies/search.test.ts"
 */

import { describe, expect, test } from 'bun:test'
import type { CaseStudy } from '@/payload-types'
import { caseStudySearchEntries, matchingSlugs } from './search'

/** A study carries far more than the index reads; only these fields matter. */
function study(fields: {
  slug: string
  client: string
  title: string
  tags?: string[] | null
  excerpt?: string | null
}): CaseStudy {
  const { client, ...rest } = fields
  return { ...rest, client: { name: client } } as unknown as CaseStudy
}

const STUDIES = [
  study({
    slug: 'breville',
    client: 'Breville',
    title: 'Breville — kampania z influencerami',
    tags: ['Influencer marketing', 'FMCG'],
    excerpt: 'Ekspresy do kawy i zdrowa żywność w jednym feedzie.',
  }),
  study({
    slug: 'pracuj',
    client: 'Pracuj.pl',
    title: 'Pracuj.pl — #OPENTOWORK',
    tags: ['Employer branding'],
    excerpt: null,
  }),
  study({
    slug: 'volvo',
    client: 'Volvo',
    title: 'Volvo — premiera modelu',
    tags: null,
  }),
]

/** Keyed by slug rather than by index, so reordering STUDIES cannot lie. */
function entryFor(slug: string) {
  const entry = caseStudySearchEntries(STUDIES).find((e) => e.slug === slug)
  if (!entry) throw new Error(`no search entry for ${slug}`)
  return entry
}

describe('caseStudySearchEntries', () => {
  test('folds client name, title, tags and excerpt into one haystack', () => {
    const { haystack } = entryFor('breville')
    expect(haystack).toContain('breville')
    expect(haystack).toContain('influencer marketing')
    expect(haystack).toContain('zdrowa zywnosc')
  })

  test('tolerates a study with no tags and no excerpt', () => {
    const entries = caseStudySearchEntries(STUDIES)
    // The one gap that must not appear: `null` stringified into the haystack,
    // which would make every field-less study match the query "null".
    for (const entry of entries) {
      expect(entry.haystack).not.toContain('null')
    }
    expect(entryFor('volvo').haystack).toBe('volvo volvo — premiera modelu')
  })
})

describe('matchingSlugs', () => {
  const entries = caseStudySearchEntries(STUDIES)
  const match = (query: string) => [...matchingSlugs(entries, query)]

  test('matches a client name', () => {
    expect(match('breville')).toEqual(['breville'])
  })

  test('matches text that only appears in tags', () => {
    expect(match('employer')).toEqual(['pracuj'])
  })

  test('ignores case and Polish diacritics in both directions', () => {
    expect(match('ZYWNOSC')).toEqual(['breville'])
    expect(match('żywność')).toEqual(['breville'])
  })

  test('an all-whitespace query matches everything', () => {
    expect(match('   ')).toHaveLength(STUDIES.length)
    expect(match('')).toHaveLength(STUDIES.length)
  })

  test('a query nothing carries matches nothing', () => {
    expect(match('zzzzz')).toEqual([])
  })

  test('matches the whole phrase, not its words separately', () => {
    expect(match('premiera modelu')).toEqual(['volvo'])
    expect(match('modelu premiera')).toEqual([])
  })
})
