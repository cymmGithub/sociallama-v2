import type { CollectionConfig } from 'payload'

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
