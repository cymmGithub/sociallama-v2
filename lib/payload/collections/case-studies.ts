import type { CollectionConfig } from 'payload'
import {
  revalidateCaseStudyAfterChange,
  revalidateCaseStudyAfterDelete,
} from '@/lib/payload/revalidate'
import { validatePostSlug } from '@/lib/payload/validate-slug'

/**
 * Case studies, served at `/case-studies/{slug}`. Mirrors the `posts`
 * collection's conventions (drafts + versions, Polish admin, `seo` group,
 * media uploads) but with structured fields specific to a case study:
 * a client, per-platform `results` metrics, and an image gallery.
 *
 * Only published studies are publicly readable; every public query in
 * lib/payload/queries.ts additionally constrains `_status` (the Local API
 * runs with overrideAccess: true, so access control alone does not filter).
 */
export const caseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: {
    singular: 'Case study',
    plural: 'Case studies',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    group: 'Treść',
    preview: (doc) =>
      typeof doc?.slug === 'string' && doc.slug.length > 0
        ? `/api/preview?path=${encodeURIComponent(`/case-studies/${doc.slug}`)}`
        : null,
  },
  versions: {
    drafts: {
      validate: true,
    },
  },
  hooks: {
    afterChange: [revalidateCaseStudyAfterChange],
    afterDelete: [revalidateCaseStudyAfterDelete],
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
          'Adres case study: sociallama.pl/case-studies/{slug}. Małe litery, cyfry i myślniki.',
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
        description: 'Decyduje o kolejności na liście case studies.',
      },
    },
    {
      name: 'client',
      label: 'Klient',
      type: 'group',
      fields: [
        {
          name: 'name',
          label: 'Nazwa klienta',
          type: 'text',
          required: true,
        },
        {
          name: 'logo',
          label: 'Logo klienta',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'about',
          label: 'O kliencie',
          type: 'richText',
          admin: {
            description: 'Sekcja „Nasz klient” — kim jest marka.',
          },
        },
      ],
    },
    {
      name: 'tags',
      label: 'Tagi',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Słowa kluczowe pokazywane w nagłówku, np. „Rekrutacja”.',
      },
    },
    {
      name: 'period',
      label: 'Okres współpracy',
      type: 'text',
      admin: {
        description: 'Np. „Marzec 2024 – obecnie”.',
      },
    },
    {
      name: 'excerpt',
      label: 'Zajawka',
      type: 'textarea',
      admin: {
        description:
          'Krótki opis pokazywany na kartach i w wynikach wyszukiwania.',
      },
    },
    {
      name: 'cover',
      label: 'Okładka',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'challenge',
      label: 'Wyzwanie',
      type: 'richText',
    },
    {
      // The decks structure the work as content pillars (hashtag + heading +
      // copy + the creatives that ran under it) — the field models that
      // directly instead of a flat rich text + detached gallery.
      name: 'approach',
      label: 'Podejście (filary treści)',
      type: 'array',
      labels: {
        singular: 'Filar',
        plural: 'Filary',
      },
      fields: [
        {
          name: 'tag',
          label: 'Hashtag / etykieta',
          type: 'text',
          admin: { description: 'Np. „#HUMOR” — kampanijny hashtag filaru.' },
        },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          label: 'Treść',
          type: 'richText',
        },
        {
          name: 'media',
          label: 'Kreacje',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description:
              'Zrzuty kreacji z kampanii (posty, kadry wideo) pokazywane obok treści.',
          },
        },
      ],
    },
    {
      name: 'results',
      label: 'Wyniki',
      type: 'array',
      labels: {
        singular: 'Wynik',
        plural: 'Wyniki',
      },
      admin: {
        description:
          'Metryki pogrupowane po platformie — renderowane jako kafelki.',
      },
      fields: [
        {
          name: 'platform',
          label: 'Platforma',
          type: 'text',
          required: true,
          admin: {
            description: 'Np. „YouTube”, „TikTok”, „Volvo Car Warszawa”.',
          },
        },
        {
          name: 'metric',
          label: 'Metryka',
          type: 'text',
          required: true,
          admin: { description: 'Np. „Wyświetlenia”.' },
        },
        {
          name: 'value',
          label: 'Wartość',
          type: 'text',
          required: true,
          admin: { description: 'Np. „11 mln”, „+7,9 tys.”.' },
        },
      ],
    },
    {
      name: 'gallery',
      label: 'Galeria',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'Wybrane materiały z kampanii. Alt tekst pochodzi z pliku.',
      },
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
            description: 'Domyślnie: tytuł case study.',
          },
        },
        {
          name: 'metaDescription',
          label: 'Meta opis',
          type: 'textarea',
          admin: {
            description: 'Domyślnie: zajawka case study.',
          },
        },
        {
          name: 'ogImage',
          label: 'Obraz udostępniania (OG)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Domyślnie: okładka case study.',
          },
        },
      ],
    },
  ],
}
