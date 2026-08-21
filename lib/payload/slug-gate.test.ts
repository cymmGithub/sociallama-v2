/**
 * Unit tests for the route status gate.
 *
 * Run with: bun test lib/payload/slug-gate.test.ts
 */

import { describe, expect, mock, test } from 'bun:test'

let draftEnabled = false
const notFoundCalls = { count: 0 }

// `mock.module` replaces the module for the whole test process, so both mocks
// spread the real exports. Replacing them wholesale strips `usePathname` and
// friends and fails every other file that imports them.
const headers = await import('next/headers')
const navigation = await import('next/navigation')

mock.module('next/headers', () => ({
  ...headers,
  draftMode: async () => ({ isEnabled: draftEnabled }),
}))

mock.module('next/navigation', () => ({
  ...navigation,
  notFound: () => {
    notFoundCalls.count += 1
    throw new Error('NEXT_NOT_FOUND')
  },
}))

const { gateOnPublishedSlug } = await import('./slug-gate')

function reset(draft: boolean) {
  draftEnabled = draft
  notFoundCalls.count = 0
}

describe('gateOnPublishedSlug', () => {
  test('lets a published slug through', async () => {
    reset(false)
    await gateOnPublishedSlug('engie', async () => ['engie', 'asus'])
    expect(notFoundCalls.count).toBe(0)
  })

  test('calls notFound for a slug no published document owns', async () => {
    reset(false)
    await expect(
      gateOnPublishedSlug('nope', async () => ['engie'])
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  test('a withdrawn slug is treated as unknown', async () => {
    reset(false)
    // Withdrawal means the row survives but leaves the published list, which is
    // why the gate keys on that list rather than on the document existing.
    await expect(
      gateOnPublishedSlug('adamed', async () => ['engie', 'asus'])
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  test('falls through when nothing is published', async () => {
    reset(false)
    // The empty-collection case: the build prerenders a synthetic placeholder
    // param, and 404ing it above the Suspense boundary crashes the build.
    await gateOnPublishedSlug('placeholder-no-content', async () => [])
    expect(notFoundCalls.count).toBe(0)
  })

  test('draft mode bypasses the gate so preview still renders', async () => {
    reset(true)
    await gateOnPublishedSlug('brand-new-draft', async () => {
      throw new Error('the published-slug query must not run in draft mode')
    })
    expect(notFoundCalls.count).toBe(0)
  })
})
