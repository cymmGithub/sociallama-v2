import type { CollectionConfig } from 'payload'
import {
  revalidatePostAfterChange,
  revalidatePostAfterDelete,
} from '@/lib/payload/revalidate'
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
    // Preview button → authenticated draft-mode route → real post template.
    // `locale` is the admin's active locale (Payload passes `req.locale`), and
    // it has to be read: `slug` is localized, so previewing an English draft
    // yields the English slug, which no Polish post carries — `/{en-slug}`
    // would 404 on the Polish route.
    preview: (doc, { locale }) => {
      if (typeof doc?.slug !== 'string' || doc.slug.length === 0) {
        return null
      }
      const path = locale === 'en' ? `/en/blog/${doc.slug}` : `/${doc.slug}`
      return `/api/preview?path=${encodeURIComponent(path)}`
    },
  },
  versions: {
    // validate: true — Payload skips field validation on draft saves by
    // default, which would let a draft claim a reserved slug (e.g. `blog`)
    // and only fail at publish. Validate every save instead.
    drafts: {
      validate: true,
    },
  },
  hooks: {
    afterChange: [revalidatePostAfterChange],
    afterDelete: [revalidatePostAfterDelete],
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
      localized: true,
    },
    {
      name: 'slug',
      label: 'Slug (adres URL)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      // Localized: English posts get real English slugs, so `unique` becomes
      // unique *per locale* — `/{pl-slug}` and `/en/blog/{en-slug}` are
      // independent namespaces.
      localized: true,
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
      name: 'author',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'authors',
      admin: {
        position: 'sidebar',
        description: 'Zostaw puste, jeśli wpis jest autorstwa Social Lamy.',
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
      localized: true,
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
      localized: true,
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
          localized: true,
          admin: {
            description: 'Domyślnie: tytuł wpisu.',
          },
        },
        {
          name: 'metaDescription',
          label: 'Meta opis',
          type: 'textarea',
          localized: true,
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
