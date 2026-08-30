/**
 * The Vercel Blob store that serves uploaded media.
 *
 * The host is the store id — the middle segment of `BLOB_READ_WRITE_TOKEN`
 * (`vercel_blob_rw_<store id>_<random>`) — under
 * `.public.blob.vercel-storage.com`, which is how
 * `@payloadcms/storage-vercel-blob` builds it. It is a public URL, not a
 * secret.
 *
 * Written once, here, rather than derived from the token: `next.config.ts`
 * needs the host at config time to build a redirect, and parsing it out of the
 * token there would make the host itself conditional on an environment
 * variable. A literal cannot come out wrong. Whether that redirect is
 * *registered* is a separate question, and that one does follow the token —
 * see `MEDIA_ON_BLOB` in next.config.ts. Rotating the store is a deliberate
 * one-line edit here; media.test.ts checks this value against the token
 * wherever one is present.
 *
 * No imports on purpose: `next.config.ts` loads this outside the `@/` alias.
 */
export const BLOB_HOST = 'cqipbump8rt7fbr0.public.blob.vercel-storage.com'

export const BLOB_ORIGIN = `https://${BLOB_HOST}`
