/**
 * Which file a media document renders as.
 *
 * The one that matters is the `unoptimized` branch. When `next/image` is told
 * not to optimize it ships `src` byte for byte, so handing it the original
 * upload is handing the reader whatever came off the photographer's camera —
 * on the blog archive, up to 20.7 MiB at 6240px, as the preloaded LCP element,
 * with a 128 KiB `card` variant sitting beside it in the same row
 * (reduce-media-serving-costs §6). Nothing about that is visible on screen,
 * which is exactly why it needs a test.
 *
 * Run with: bun test lib/payload/media-refs.test.ts
 */

import { describe, expect, test } from 'bun:test'
import type { Media } from '@/payload-types'
import { mediaSource } from './media-refs'

const cover = (extra: Partial<Media> = {}): Media =>
  ({
    id: 1,
    alt: 'Okładka',
    url: '/original.jpg',
    width: 6240,
    height: 4160,
    sizes: {
      thumbnail: { url: '/t.jpg', width: 480, height: 320 },
      card: { url: '/card.jpg', width: 1024, height: 683 },
      og: { url: '/og.jpg', width: 1200, height: 630 },
    },
    ...extra,
  }) as Media

describe('mediaSource', () => {
  test('hands the optimizer the original, which is what it is for', () => {
    expect(mediaSource(cover(), false)).toEqual({
      url: '/original.jpg',
      width: 6240,
      height: 4160,
    })
  })

  test('an unoptimized render takes the generated variant instead', () => {
    expect(mediaSource(cover(), true)).toEqual({
      url: '/card.jpg',
      width: 1024,
      height: 683,
    })
  })

  test('never substitutes `og`, which is cropped to a different frame', () => {
    // 1200×630 by design: using it would silently re-frame the picture.
    const noCard = cover({
      sizes: { og: { url: '/og.jpg', width: 1200, height: 630 } },
    } as Partial<Media>)

    expect(mediaSource(noCard, true)?.url).toBe('/original.jpg')
  })

  test('falls back to the original when the source was too small to resize', () => {
    const small = cover({
      url: '/small.png',
      width: 400,
      height: 300,
      sizes: {},
    })

    expect(mediaSource(small, true)).toEqual({
      url: '/small.png',
      width: 400,
      height: 300,
    })
  })

  test('is null for a missing document or a row with no file', () => {
    expect(mediaSource(null, true)).toBeNull()
    expect(mediaSource(cover({ url: null, sizes: {} }), true)).toBeNull()
  })
})
