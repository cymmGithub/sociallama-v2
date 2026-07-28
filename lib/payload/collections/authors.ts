import type { CollectionConfig } from 'payload'
import {
  revalidateAuthorAfterChange,
  revalidateAuthorAfterDelete,
} from '@/lib/payload/revalidate'

/**
 * Named people who write posts — currently guest authors from partner
 * agencies. A post with no author is "authored by Social Lama": the default
 * is the brand Organization, not a row here (see lib/blog/author.ts), so this
 * collection never needs a fake "person" record for the agency itself.
 *
 * No public archive routes: authors surface only as a post byline, the
 * bottom-of-post card, and the `Person` node in a post's JSON-LD.
 */
export const authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: 'Autor',
    plural: 'Autorzy',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'profileUrl'],
    group: 'Treść',
  },
  hooks: {
    afterChange: [revalidateAuthorAfterChange],
    afterDelete: [revalidateAuthorAfterDelete],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Imię i nazwisko',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      label: 'Zdjęcie',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Kwadratowe zdjęcie profilowe. Bez niego pokażemy inicjał.',
      },
    },
    {
      name: 'role',
      label: 'Rola / stanowisko',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Jedna linijka, np. „Specjalista SEO, SEOFLY”. Pokazujemy ją w szynie obok wpisu i w wizytówce autora pod tekstem. Bez niej zostaje samo nazwisko.',
      },
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Dwa–trzy zdania pokazywane w wizytówce autora pod wpisem.',
      },
    },
    {
      name: 'profileUrl',
      label: 'Profil zewnętrzny',
      type: 'text',
      admin: {
        description:
          'Pełny adres profilu autora, np. https://seofly.pl/zespol/… Trafia też do danych strukturalnych (sameAs).',
      },
    },
  ],
}
