import type { CollectionConfig } from 'payload'
import { validatePostSlug } from '@/lib/payload/validate-slug'

/**
 * Blog posts, served at root-level `/{slug}` URLs (exact parity with the
 * live WordPress site). Drafts + versions are enabled: only published posts
 * are publicly readable; editors see everything in the admin panel.
 * Field shape mirrors what the WordPress import (migrate-wp-content) needs.
 */
export const posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Wpis',
    plural: 'Wpisy',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Treść',
  },
  versions: {
    // validate: true — Payload skips field validation on draft saves by
    // default, which would let a draft claim a reserved slug (e.g. `blog`)
    // and only fail at publish. Validate every save instead.
    drafts: {
      validate: true,
    },
  },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  fields: [
    {
      name: 'title',
      label: 'Tytuł',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (adres URL)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validatePostSlug,
      admin: {
        position: 'sidebar',
        description:
          'Adres wpisu: sociallama.pl/{slug}. Małe litery, cyfry i myślniki.',
      },
    },
    {
      name: 'category',
      label: 'Kategoria',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      label: 'Data publikacji',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMMM yyyy HH:mm',
        },
        description: 'Decyduje o kolejności na liście wpisów.',
      },
    },
    {
      name: 'excerpt',
      label: 'Zajawka',
      type: 'textarea',
      admin: {
        description:
          'Krótki opis pokazywany na kartach wpisów i w wynikach wyszukiwania.',
      },
    },
    {
      name: 'cover',
      label: 'Okładka',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      label: 'Treść',
      type: 'richText',
    },
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          label: 'Meta tytuł',
          type: 'text',
          admin: {
            description: 'Domyślnie: tytuł wpisu.',
          },
        },
        {
          name: 'metaDescription',
          label: 'Meta opis',
          type: 'textarea',
          admin: {
            description: 'Domyślnie: zajawka wpisu.',
          },
        },
        {
          name: 'ogImage',
          label: 'Obraz udostępniania (OG)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Domyślnie: okładka wpisu.',
          },
        },
      ],
    },
  ],
}
