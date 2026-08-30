import type { CollectionAfterReadHook, CollectionConfig } from 'payload'
import { BLOB_ORIGIN } from '@/lib/blob-store'
import { env } from '@/lib/env'
import type { Media } from '@/payload-types'

/** Payload's own upload route, the prefix every generated `url` carries. */
const PROXY_PREFIX = '/api/media/file/'

/**
 * Null without a token: local dev keeps its uploads on disk, and the proxy
 * route is then the real serving path rather than a cost.
 */
const ORIGIN = env.BLOB_READ_WRITE_TOKEN ? BLOB_ORIGIN : null

/**
 * Point every media URL at the Blob CDN instead of `/api/media/file/…`.
 *
 * That route is Payload's upload handler: on every edge-cache miss it runs a
 * `payload.find()` by filename before handing back the bytes — a Neon wake to
 * serve a public, immutable file, and roughly half of all function
 * invocations (reduce-media-serving-costs). Sound because this collection is
 * explicitly public: `read: () => true` below.
 *
 * This belongs to the storage plugin, which has a `disablePayloadAccessControl`
 * option for exactly this — but `@payloadcms/storage-vercel-blob` (3.88.0,
 * latest) forwards only `alwaysInsertFields`, `collections` and
 * `useCompositePrefixes` to `cloudStoragePlugin`, so the option never reaches
 * the code that reads it. Verified against the live store: the flag changes
 * nothing. Reaching the plugin directly would mean hand-rolling the adapter,
 * which the package does not export — a fork of the upload and delete paths to
 * fix a read-time string.
 *
 * So we rewrite the string. A collection hook runs after every field hook, so
 * this wins over both Payload's URL generator and the plugin's; and because it
 * transforms the value they produced rather than re-deriving it from
 * `filename`, the blob key matches byte for byte (same `encodeURIComponent`).
 * Blob keys are flat — no collection prefix — so only the origin changes.
 *
 * `sizes` matters as much as `url`: listing cards render `sizes.card`, OG tags
 * render `sizes.og`. Rewriting only the original would leave most of the
 * traffic on the proxy and the saving would not show up.
 *
 * Each URL carries `?v=<filesize>`, and that is not decoration. Media bytes are
 * replaced in place, under the same filename and the same row id
 * (`replaceMediaBytes` in lib/payload/media-ops.ts) — so without a version the
 * URL after a re-cut is identical to the one every browser and CDN already
 * holds, with `max-age=31536000` on it. `vercel cache purge` cannot help: it
 * clears this project's CDN, and these bytes now come from the Blob store's
 * own. Vercel's documented answer for updated blob content is a unique query
 * parameter, which is also what `public/` assets use here (`?v=N`, see
 * next.config.ts). Filesize rather than `updatedAt`, so that editing alt text
 * does not churn every image URL on the site; the Blob store ignores unknown
 * query parameters, and `/_next/image` keys on the full URL, so one version
 * refreshes both paths at once.
 *
 * Inbound links to the old URLs keep working through the permanent redirect in
 * next.config.ts.
 */
export function serveMediaFromBlob(
  origin: string | null
): CollectionAfterReadHook {
  const toBlobUrl = (url: string, filesize: number | null | undefined) => {
    if (!url.startsWith(PROXY_PREFIX)) {
      return url
    }
    const key = url.slice(PROXY_PREFIX.length)
    return filesize ? `${origin}/${key}?v=${filesize}` : `${origin}/${key}`
  }

  return ({ doc }) => {
    if (!origin) {
      return doc
    }
    const file = doc as Media
    if (typeof file.url === 'string') {
      file.url = toBlobUrl(file.url, file.filesize)
    }
    if (typeof file.thumbnailURL === 'string') {
      file.thumbnailURL = toBlobUrl(file.thumbnailURL, file.filesize)
    }
    for (const size of Object.values(file.sizes ?? {})) {
      if (size && typeof size.url === 'string') {
        // Each variant carries its own byte count: a re-cut that changes the
        // original changes every derived size too.
        size.url = toBlobUrl(size.url, size.filesize)
      }
    }
    return doc
  }
}

/**
 * Media library. Files live in Vercel Blob (see the vercelBlobStorage plugin
 * in payload.config.ts); sharp generates the sizes below on upload.
 */
export const media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Plik',
    plural: 'Media',
  },
  admin: {
    group: 'Treść',
  },
  access: {
    // Images are embedded in public pages; the files themselves are public.
    read: () => true,
  },
  hooks: {
    afterRead: [serveMediaFromBlob(ORIGIN)],
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
      },
      {
        name: 'card',
        width: 1024,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Tekst alternatywny',
      type: 'text',
      required: true,
      /**
       * Alt text is prose, and prose in the wrong language is an accessibility
       * failure rather than a cosmetic one: a screen reader announces it with
       * the page's `lang`, so a Polish string on an `<html lang="en">` page is
       * read out by an English speech synthesizer as noise.
       *
       * The global `fallback: true` keeps every untranslated image describable
       * — a Polish description beats no description, which is what an empty
       * `alt` on a content image means (WCAG 1.1.1). Blog pages are the
       * exception: they read with `fallbackLocale: false` for the design D6
       * gate, and that propagates into `depth`-populated media, so there `alt`
       * really can arrive null. Render sites guard for it; `payload-types`
       * still declares it `string` and cannot be relied on.
       */
      localized: true,
      admin: {
        description:
          'Opis obrazu dla czytników ekranu i SEO, np. „Lama w okularach przy laptopie".',
      },
    },
  ],
}
