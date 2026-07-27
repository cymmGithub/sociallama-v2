import { describe, expect, test } from 'bun:test'
import type { SearchEntry } from '@/lib/payload/queries'
import { filterPosts, foldDiacritics } from './search'

const entry = (
  title: string,
  excerpt = '',
  slug = 'x',
  category = 'SEO'
): SearchEntry => ({ slug, title, excerpt, category })

describe('foldDiacritics', () => {
  test('strips the diacritics NFD decomposes', () => {
    expect(foldDiacritics('wpisów')).toBe('wpisow')
    expect(foldDiacritics('ąćęńóśźż')).toBe('acenoszz')
  })

  test('maps ł, which NFD leaves composed', () => {
    expect(foldDiacritics('Łódź')).toBe('lodz')
    expect(foldDiacritics('działa')).toBe('dziala')
  })

  test('folds case', () => {
    expect(foldDiacritics('LinkedIn Premium')).toBe('linkedin premium')
  })
})

describe('filterPosts', () => {
  const index = [
    entry('Ile wpisów robi różnicę', 'Liczby zamiast trendów'),
    entry('Kampania w Łodzi', 'Case study z regionu'),
    entry('Meta Ads w 2026', 'Stawki i benchmarki'),
  ]

  test('matches a diacritic-free query against diacritic content', () => {
    expect(filterPosts(index, 'wpisow').map((p) => p.title)).toEqual([
      'Ile wpisów robi różnicę',
    ])
    expect(filterPosts(index, 'lodzi').map((p) => p.title)).toEqual([
      'Kampania w Łodzi',
    ])
  })

  test('matches the excerpt as well as the title', () => {
    expect(filterPosts(index, 'benchmarki')).toHaveLength(1)
  })

  test('matches a multi-word phrase', () => {
    expect(filterPosts(index, 'meta ads')).toHaveLength(1)
  })

  test('returns everything for an empty or blank query', () => {
    expect(filterPosts(index, '')).toHaveLength(3)
    expect(filterPosts(index, '   ')).toHaveLength(3)
  })

  test('returns nothing when no post matches', () => {
    expect(filterPosts(index, 'tiktok')).toHaveLength(0)
  })

  test('ignores the category, which is index metadata rather than body text', () => {
    expect(filterPosts(index, 'SEO')).toHaveLength(0)
  })
})
