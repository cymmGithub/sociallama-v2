import type { CollectionConfig } from 'payload'
import { INDUSTRY_OPTIONS } from '@/lib/content/branze'
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
    // Drag-and-drop reordering only works within one page of the list view, so
    // the whole roster has to fit on it.
    pagination: {
      defaultLimit: 50,
    },
    preview: (doc) =>
      typeof doc?.slug === 'string' && doc.slug.length > 0
        ? `/api/preview?path=${encodeURIComponent(`/case-studies/${doc.slug}`)}`
        : null,
  },
  /**
   * Manual running order, set by dragging rows in the admin list. The listing
   * at /case-studies renders this order verbatim, so it is the editorial
   * ranking of the portfolio — the strongest brands lead.
   *
   * It replaces a `-publishedAt` sort that never meant anything: the bulk
   * import left every study stamped with the minute the script wrote it, so
   * the page was ordered by import sequence. `publishedAt` still feeds
   * `datePublished` in the JSON-LD and is otherwise unused.
   *
   * Payload stores this as a hidden `_order` fractional index, so a drag
   * rewrites one row rather than renumbering the rest.
   */
  orderable: true,
  defaultSort: '_order',
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
      localized: true,
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
          localized: true,
          admin: {
            description: 'Sekcja „Nasz klient” — kim jest marka.',
          },
        },
      ],
    },
    {
      /**
       * The study's industry — one of the branże the site publishes, or one of
       * the categories waiting for a page (`PENDING_INDUSTRIES`).
       *
       * A closed list rather than a free tag, and NOT localized: it stores the
       * branża's own `id`, which is the same in both locales, so the Polish and
       * English hubs filter and count identically. `tags` stays what it is —
       * three free descriptive labels for the card.
       */
      name: 'industry',
      label: 'Branża',
      type: 'select',
      options: INDUSTRY_OPTIONS.map((option) => ({
        label: option.label,
        value: option.id,
      })),
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Decyduje, pod którą branżą case study pojawia się w filtrze na liście /case-studies. Jedna branża na case study.',
      },
    },
    {
      name: 'tags',
      label: 'Tagi',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: {
        description: 'Słowa kluczowe pokazywane w nagłówku, np. „Rekrutacja”.',
      },
    },
    {
      name: 'excerpt',
      label: 'Zajawka',
      type: 'textarea',
      localized: true,
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
      localized: true,
    },
    {
      // The decks structure the work as content pillars (hashtag + heading +
      // copy + the creatives that ran under it) — the field models that
      // directly instead of a flat rich text + detached gallery.
      name: 'approach',
      label: 'Podejście (filary treści)',
      type: 'array',
      // Whole-array localization (not per-subfield): each locale carries its own
      // pillars; the EN seed pass references the same media so creatives are shared.
      localized: true,
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
      localized: true,
      labels: {
        singular: 'Wynik',
        plural: 'Wyniki',
      },
      admin: {
        description:
          'Pierwszy wynik jest twarzą case study: liczba na karcie na liście i duża liczba w nagłówku strony. Pierwszy wynik każdej grupy jest liczbą wiodącą tej grupy. Kolejność ma znaczenie.',
      },
      fields: [
        {
          name: 'platform',
          label: 'Platforma',
          type: 'text',
          required: true,
          admin: {
            description:
              'Nazwa grupy wyników. Dokładna nazwa platformy („Facebook”, „Instagram”, „TikTok”, „LinkedIn”, „YouTube”) dodaje jej logo i wlicza case study do filtra na liście. Każda inna etykieta — marka, kanał, wydarzenie („Volvo Car Warszawa”, „Beesfund”, „Strona WWW”) — jest w porządku: grupa renderuje się normalnie, tylko bez logo i bez filtra. Dopisek przy nazwie platformy („Facebook (grupa)”) też liczy się jako inna etykieta.',
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
          localized: true,
          admin: {
            description: 'Domyślnie: tytuł case study.',
          },
        },
        {
          name: 'metaDescription',
          label: 'Meta opis',
          type: 'textarea',
          localized: true,
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
