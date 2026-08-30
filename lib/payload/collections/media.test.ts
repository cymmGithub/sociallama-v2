/**
 * The media serving policy: where an image URL points, and whether the pieces
 * that implement it still agree with each other.
 *
 * Worth testing because the failure modes are quiet. If `serveMediaFromBlob`
 * rewrote `url` but missed `sizes`, every page would still render correctly —
 * listing cards and OG tags would just keep going through `/api/media/file/…`,
 * which is the route this whole change exists to stop paying for. And if the
 * blob host in next.config.ts drifted from the one the token derives, the
 * redirect for already-indexed image URLs would point at a store that isn't
 * there, while everything rendered fresh stayed fine.
 *
 * Run with: bun test lib/payload/collections/media.test.ts
 */

import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CollectionAfterReadHook } from 'payload'
import { BLOB_HOST, BLOB_ORIGIN } from '@/lib/blob-store'
import { media, serveMediaFromBlob } from './media'

const REPO_ROOT = join(import.meta.dir, '..', '..', '..')

/**
 * The store's write token, wherever this run can see one. `bun test` sets
 * NODE_ENV=test and Bun then skips `.env.local`, so the file is read directly
 * rather than trusted to be in the environment.
 */
function writeToken(): string | undefined {
  const fromEnv =
    process.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN_PROD
  if (fromEnv) {
    return fromEnv
  }
  try {
    return readFileSync(join(REPO_ROOT, '.env.local'), 'utf8')
      .match(/^BLOB_READ_WRITE_TOKEN(?:_PROD)?=(.+)$/m)?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '')
  } catch {
    return undefined
  }
}

/** Call an afterRead hook with the one argument it reads. */
function read(hook: CollectionAfterReadHook, doc: unknown) {
  return hook({ doc } as unknown as Parameters<CollectionAfterReadHook>[0])
}

describe('serveMediaFromBlob', () => {
  const doc = () => ({
    filename: 'fb-ads.jpg',
    filesize: 90210,
    url: '/api/media/file/fb-ads.jpg',
    thumbnailURL: '/api/media/file/fb-ads-480x300.jpg',
    sizes: {
      thumbnail: { url: '/api/media/file/fb-ads-480x300.jpg', filesize: 11 },
      card: { url: '/api/media/file/fb-ads-1024x640.jpg', filesize: 22 },
      og: { url: '/api/media/file/fb-ads-1200x630.jpg', filesize: 33 },
    },
  })

  test('moves the original, the thumbnail and every size onto the CDN', () => {
    const result = read(serveMediaFromBlob(BLOB_ORIGIN), doc()) as ReturnType<
      typeof doc
    >

    expect(result.url).toBe(`${BLOB_ORIGIN}/fb-ads.jpg?v=90210`)
    expect(result.thumbnailURL).toBe(
      `${BLOB_ORIGIN}/fb-ads-480x300.jpg?v=90210`
    )
    // Each variant is versioned by its own byte count, not the original's.
    expect(result.sizes.thumbnail.url).toBe(
      `${BLOB_ORIGIN}/fb-ads-480x300.jpg?v=11`
    )
    // The card size is what every listing renders and the og size is what
    // Google and Facebook fetch: between them they are most of the traffic.
    expect(result.sizes.card.url).toBe(
      `${BLOB_ORIGIN}/fb-ads-1024x640.jpg?v=22`
    )
    expect(result.sizes.og.url).toBe(`${BLOB_ORIGIN}/fb-ads-1200x630.jpg?v=33`)
  })

  test('a byte replacement under the same filename changes the URL', () => {
    // The whole point of the version. `replaceMediaBytes` keeps the filename
    // and the row id, so without this the re-cut URL is byte-identical to the
    // one browsers already hold under `max-age=31536000` — and no purge
    // reaches the Blob store's CDN.
    const before = read(serveMediaFromBlob(BLOB_ORIGIN), {
      url: '/api/media/file/kbp-cover-3.jpg',
      filesize: 100,
    }) as { url: string }
    const after = read(serveMediaFromBlob(BLOB_ORIGIN), {
      url: '/api/media/file/kbp-cover-3.jpg',
      filesize: 101,
    }) as { url: string }

    expect(after.url).not.toBe(before.url)
  })

  test('falls back to a bare URL when the size is unknown', () => {
    const result = read(serveMediaFromBlob(BLOB_ORIGIN), {
      url: '/api/media/file/fb-ads.jpg',
      filesize: null,
    }) as { url: string }

    expect(result.url).toBe(`${BLOB_ORIGIN}/fb-ads.jpg`)
  })

  test('passes the encoded filename through untouched', () => {
    // Payload and the blob adapter both encodeURIComponent the basename, so
    // swapping the origin is enough — re-deriving the key would risk drift.
    const result = read(serveMediaFromBlob(BLOB_ORIGIN), {
      url: '/api/media/file/moje%20zdj%C4%99cie.jpg',
    }) as { url: string }

    expect(result.url).toBe(`${BLOB_ORIGIN}/moje%20zdj%C4%99cie.jpg`)
  })

  test('leaves a URL that is not the proxy route alone', () => {
    const result = read(serveMediaFromBlob(BLOB_ORIGIN), {
      url: 'https://cdn.shopify.com/whatever.jpg',
    }) as { url: string }

    expect(result.url).toBe('https://cdn.shopify.com/whatever.jpg')
  })

  test('is inert without an origin, so local dev still serves from disk', () => {
    const result = read(serveMediaFromBlob(null), doc()) as ReturnType<
      typeof doc
    >

    expect(result.url).toBe('/api/media/file/fb-ads.jpg')
    expect(result.sizes.card.url).toBe('/api/media/file/fb-ads-1024x640.jpg')
  })

  test('tolerates a document with no file', () => {
    expect(() =>
      read(serveMediaFromBlob(BLOB_ORIGIN), { url: null, sizes: null })
    ).not.toThrow()
  })

  test('is wired onto the collection', () => {
    expect(media.hooks?.afterRead).toHaveLength(1)
  })
})

describe('the pieces of the policy agree with each other', () => {
  const nextConfig = readFileSync(join(REPO_ROOT, 'next.config.ts'), 'utf8')
  const robots = readFileSync(join(REPO_ROOT, 'app', 'robots.ts'), 'utf8')
  const storeId = writeToken()
    ?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]
    ?.toLowerCase()

  test('next.config.ts takes the host from lib/blob-store, not its own copy', () => {
    // Two literals is how the redirect ends up pointing at a store that was
    // rotated months ago, with nothing failing until someone follows an old
    // image URL out of Google's index.
    expect(nextConfig).toContain("import { BLOB_HOST } from './lib/blob-store'")
    expect(nextConfig).not.toMatch(/blob\.vercel-storage\.com/)
  })

  test.skipIf(!storeId)(
    'BLOB_HOST is the store the write token points at',
    () => {
      expect(BLOB_HOST).toBe(`${storeId}.public.blob.vercel-storage.com`)
    }
  )

  test('the retired proxy route redirects permanently to that host', () => {
    expect(nextConfig).toContain("source: '/api/media/file/:file*'")
    expect(nextConfig).toContain('destination: `https://${BLOB_HOST}/:file*`')
    expect(nextConfig).toContain('permanent: true')
  })

  test('robots.txt still lets crawlers reach the redirect', () => {
    // The allow reads moot now that no image lives under /api/media/ — but
    // dropping it would put every already-indexed image URL behind the /api/
    // disallow, and Google would never see the 308.
    expect(robots).toContain("'/api/media/'")
  })
})
