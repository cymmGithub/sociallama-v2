/**
 * URL construction for links inside a post or case-study body.
 *
 * This is the half of `rich-text.tsx` worth unit-testing: every other part
 * needs a Lexical tree and a React renderer, but `linkHref` is a pure function
 * that decides where a reader lands, and it is silently wrong rather than
 * loudly broken when it misfires. A link to the wrong collection still renders
 * as a perfectly ordinary anchor.
 *
 * Run with: bun test "app/(frontend)/[slug]/rich-text.test.ts"
 */

import { describe, expect, test } from 'bun:test'
import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import {
  hrefForRelation,
  linkHref,
  type PostPaths,
} from '@/app/(frontend)/[slug]/rich-text'

const PL: PostPaths = {
  basePath: '',
  categoryPath: '/category',
  fallbackHref: '/',
}
const EN: PostPaths = {
  basePath: '/en/blog',
  categoryPath: '/en/blog/category',
  fallbackHref: '/en',
}

/** Minimal internal-link node; only the fields `linkHref` reads are real. */
const internal = (relationTo: string, slug: string | null) =>
  ({
    fields: {
      linkType: 'internal',
      doc: { relationTo, value: { slug } },
    },
  }) as unknown as SerializedLinkNode

const custom = (url?: string) =>
  ({ fields: { linkType: 'custom', url } }) as unknown as SerializedLinkNode

describe('hrefForRelation', () => {
  test('posts take the locale post prefix', () => {
    expect(hrefForRelation('posts', 'jakis-post', PL, 'pl')).toBe('/jakis-post')
    expect(hrefForRelation('posts', 'some-post', EN, 'en')).toBe(
      '/en/blog/some-post'
    )
  })

  test('categories take the locale category prefix', () => {
    expect(hrefForRelation('categories', 'seo', PL, 'pl')).toBe('/category/seo')
    expect(hrefForRelation('categories', 'seo', EN, 'en')).toBe(
      '/en/blog/category/seo'
    )
  })

  test('case studies get their own prefix, not the post one', () => {
    // The regression this whole function exists for: before it, a case study
    // resolved to `${basePath}/${slug}` — `/en/blog/asus`, a 404 that looks
    // exactly like an article URL.
    expect(hrefForRelation('case-studies', 'asus', PL, 'pl')).toBe(
      '/case-studies/asus'
    )
    expect(hrefForRelation('case-studies', 'asus', EN, 'en')).toBe(
      '/en/case-studies/asus'
    )
  })

  test('collections with no public URL fall back rather than guess', () => {
    // `lexicalEditor()` offers all of these as link targets in the admin UI.
    for (const collection of [
      'authors',
      'media',
      'social-platforms',
      'users',
    ]) {
      expect(hrefForRelation(collection, 'anything', PL, 'pl')).toBe('/')
      expect(hrefForRelation(collection, 'anything', EN, 'en')).toBe('/en')
    }
  })

  test('an unknown future collection falls back, not through', () => {
    expect(hrefForRelation('newsletters', 'x', EN, 'en')).toBe('/en')
  })

  test('the fallback is always same-locale', () => {
    // `/` and `/en` are different sites; the Polish one renders lang="pl", so
    // an English page must never fall back into it.
    expect(hrefForRelation('users', 'x', EN, 'en').startsWith('/en')).toBe(true)
    expect(hrefForRelation('users', 'x', PL, 'pl').startsWith('/en')).toBe(
      false
    )
  })
})

describe('linkHref', () => {
  test('a custom link uses its own URL', () => {
    expect(linkHref(custom('https://example.com'), PL, 'pl')).toBe(
      'https://example.com'
    )
  })

  test('a custom link with no URL falls back', () => {
    expect(linkHref(custom(undefined), EN, 'en')).toBe('/en')
  })

  test('an untranslated target has a null slug and must not build a URL', () => {
    // Under `fallbackLocale: false` this is the common mid-translation case.
    // Building anyway yields `/en/blog/` — the hub, dressed as an article.
    expect(linkHref(internal('posts', null), EN, 'en')).toBe('/en')
  })

  test('an unpopulated relation falls back', () => {
    const node = {
      fields: { linkType: 'internal', doc: { relationTo: 'posts', value: 7 } },
    } as unknown as SerializedLinkNode
    expect(linkHref(node, EN, 'en')).toBe('/en')
  })

  test('a populated post resolves through to the locale prefix', () => {
    expect(linkHref(internal('posts', 'some-post'), EN, 'en')).toBe(
      '/en/blog/some-post'
    )
  })
})
