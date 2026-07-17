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
      admin: {
        description:
          'Opis obrazu dla czytników ekranu i SEO, np. „Lama w okularach przy laptopie".',
      },
    },
  ],
}
