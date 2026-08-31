import type { CollectionConfig } from 'payload'
import { checkAvatarDimensions } from '@/lib/payload/author-avatar-rules'
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
          'Kwadratowe zdjęcie profilowe, min. 256×256 px. Bez niego pokażemy inicjał.',
      },
      /*
       * "Kwadratowe" was only ever a note here, and a note is not a gate: the
       * first non-square upload (324×276, added through the admin panel) was
       * squeezed into the avatar circle and read as a bad photograph rather
       * than a bad fit. The rule lives in author-avatar-rules.ts so it can be
       * tested without booting Payload; this reads the media row it points at,
       * because the dimensions are on the upload, not on this field.
       */
      validate: async (
        value: unknown,
        { req }: { req: { payload?: unknown } }
      ) => {
        if (!value) {
          return true
        }
        const id =
          typeof value === 'object' ? (value as { id?: unknown }).id : value
        // biome-ignore lint/suspicious/noExplicitAny: Payload's request type is enormous and unexported here
        const payload = (req as any)?.payload
        if (!payload) {
          return true
        }
        const media = await payload.findByID({
          collection: 'media',
          id,
          depth: 0,
          overrideAccess: true,
        })
        return checkAvatarDimensions(media ?? {}) ?? true
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
