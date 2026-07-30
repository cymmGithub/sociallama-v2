import { describe, expect, test } from 'bun:test'
import { consentCategories as pl } from './consent'
import { consentCategories as en } from './consent.en'

/**
 * `Localized<>` enforces that every KEY exists in both locales, but it widens a
 * readonly tuple to a plain array — so it cannot see a category, vendor or
 * cookie that exists on one side and not the other. That gap is exactly where a
 * consent disclosure would rot: the Polish panel offering a category the
 * English one hides, or a cookie declared in one policy and not the other.
 *
 * Identifiers (category ids, cookie names, vendor privacy links) are not copy.
 * They must be identical across locales — except the site's own policy link,
 * which is the one href that genuinely differs per locale.
 */

const ids = (categories: typeof pl | typeof en) =>
  categories.map((category) => category.id)

const cookieNames = (categories: typeof pl | typeof en) =>
  categories.flatMap((category) =>
    category.vendors.flatMap((vendor) =>
      vendor.cookies.map((cookie) => cookie.name)
    )
  )

const vendorNames = (categories: typeof pl | typeof en) =>
  categories.flatMap((category) =>
    category.vendors.map((vendor) => vendor.name)
  )

describe('consent categories parity', () => {
  test('both locales declare the same categories, in the same order', () => {
    expect(ids(en)).toEqual(ids(pl))
  })

  test('both locales declare the same vendors', () => {
    expect(vendorNames(en)).toEqual(vendorNames(pl))
  })

  test('both locales declare the same cookies', () => {
    expect(cookieNames(en)).toEqual(cookieNames(pl))
  })

  test('required-ness is not a translation choice', () => {
    expect(en.map((c) => c.required)).toEqual(pl.map((c) => c.required))
  })

  test('third-party privacy links are identical across locales', () => {
    const external = (categories: typeof pl | typeof en) =>
      categories
        .flatMap((category) => category.vendors.map((v) => v.privacyHref))
        .filter((href) => href.startsWith('http'))

    expect(external(en)).toEqual(external(pl))
  })
})

describe('consent categories shape', () => {
  test.each([
    ['pl', pl],
    ['en', en],
  ])('%s: cookie names are unique', (_locale, categories) => {
    const names = cookieNames(categories)
    expect(new Set(names).size).toBe(names.length)
  })

  test.each([
    ['pl', pl],
    ['en', en],
  ])('%s: exactly one category is required', (_locale, categories) => {
    expect(categories.filter((category) => category.required)).toHaveLength(1)
  })

  test.each([
    ['pl', pl],
    ['en', en],
  ])('%s: every category discloses at least one vendor', (_l, categories) => {
    // A category rendering an empty list is the failure mode the spec calls
    // out. Today the answer is that no such category ships at all.
    for (const category of categories) {
      expect(category.vendors.length).toBeGreaterThan(0)
      for (const vendor of category.vendors) {
        expect(vendor.cookies.length).toBeGreaterThan(0)
      }
    }
  })

  test.each([
    ['pl', pl],
    ['en', en],
  ])('%s: every string is filled in', (_locale, categories) => {
    for (const category of categories) {
      expect(category.name.trim()).not.toBe('')
      expect(category.purpose.trim()).not.toBe('')
      for (const vendor of category.vendors) {
        expect(vendor.provider.trim()).not.toBe('')
        expect(vendor.purpose.trim()).not.toBe('')
        for (const cookie of vendor.cookies) {
          expect(cookie.purpose.trim()).not.toBe('')
          expect(cookie.retention.trim()).not.toBe('')
        }
      }
    }
  })
})
