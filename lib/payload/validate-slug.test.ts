/**
 * Unit tests for the per-locale reserved-slug rules (lib/payload/validate-slug.ts).
 *
 * Run with: bun test lib/payload/validate-slug.test.ts
 *
 * The cases that matter are the asymmetric ones. The two locales have
 * different URL shapes, so a slug that is fatal in one is ordinary in the
 * other, and getting the direction backwards produces a silently unroutable
 * post rather than an error: a Polish post slugged `blog` never renders, and
 * neither does an English post slugged `page`.
 */

import { describe, expect, it } from 'bun:test'
import type { PayloadRequest } from 'payload'
import { validatePostSlug } from '@/lib/payload/validate-slug'

/** validatePostSlug only ever reads `req.locale`. */
const opts = (locale?: 'pl' | 'en') =>
  ({ req: { locale } as PayloadRequest }) as Parameters<
    typeof validatePostSlug
  >[1]

const validate = (value: string, locale?: 'pl' | 'en') =>
  validatePostSlug(value, opts(locale))

describe('validatePostSlug — format', () => {
  it('accepts a lowercase hyphenated slug in either locale', () => {
    expect(validate('linkedin-premium-czy-warto', 'pl')).toBe(true)
    expect(validate('is-linkedin-premium-worth-it', 'en')).toBe(true)
  })

  it('rejects uppercase, spaces, and doubled hyphens', () => {
    for (const bad of ['Wielka-Litera', 'ze spacja', 'podwojny--myslnik']) {
      expect(validate(bad, 'pl')).not.toBe(true)
    }
  })

  it('rejects an empty slug', () => {
    expect(validate('', 'pl')).not.toBe(true)
  })
})

describe('validatePostSlug — reserved, per locale', () => {
  it('reserves Polish root-level routes for Polish posts', () => {
    for (const taken of ['blog', 'category', 'kontakt', 'admin']) {
      expect(validate(taken, 'pl')).not.toBe(true)
    }
  })

  it('reserves `en`, the root of the English tree', () => {
    // app/(frontend-en)/en/page.tsx has always shadowed this one.
    expect(validate('en', 'pl')).not.toBe(true)
  })

  it('does not apply the Polish root-level list to English posts', () => {
    // English posts live at /en/blog/{slug}; nothing they could collide with
    // sits at the root, so these are ordinary English words again.
    for (const fine of ['blog', 'kontakt', 'admin', 'case-studies', 'en']) {
      expect(validate(fine, 'en')).toBe(true)
    }
  })

  it('reserves the static siblings of /en/blog/[slug] for English posts', () => {
    // /en/blog/page/[number] and /en/blog/category/[category] both win over
    // the dynamic segment.
    expect(validate('page', 'en')).not.toBe(true)
    expect(validate('category', 'en')).not.toBe(true)
  })

  it('treats a missing locale as Polish, the default locale', () => {
    expect(validate('blog', undefined)).not.toBe(true)
  })
})
