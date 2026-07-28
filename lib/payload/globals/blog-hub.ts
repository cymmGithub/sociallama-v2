import type {
  GlobalConfig,
  TextFieldSingleValidation,
  UploadFieldSingleValidation,
} from 'payload'
import { revalidateBlogHubAfterChange } from '@/lib/payload/revalidate'

/**
 * Editorial curation for the /blog hub: which post leads the page, what the
 * editors recommend, what is most read, and an optional video spotlight.
 *
 * A global rather than flags on `posts` (design decision 1): array position
 * gives the picks their order for free, "two featured posts" is unrepresentable,
 * and curation lives on one admin screen instead of spread across 79 records.
 *
 * Every slot is optional. The hub falls back to newest-first when a slot is
 * empty and omits the block entirely where there is nothing sensible to show,
 * so an unpopulated global renders a correct page (design decision 2).
 */

/** The video group's shape, for the cross-field validation below. */
interface VideoSlot {
  title?: string | null
  url?: string | null
  poster?: unknown
}

/**
 * True once an editor has touched any of the spotlight's structural fields.
 *
 * `description` and `duration` are deliberately excluded: they degrade softly
 * (a missing paragraph, a missing runtime), so they must not be able to trip
 * the all-or-nothing rule on their own.
 */
function spotlightStarted(siblingData: unknown): boolean {
  const video = siblingData as VideoSlot | undefined
  return Boolean(video?.title || video?.url || video?.poster)
}

const CLEAR_HINT =
  'albo wyczyść całą sekcję — niekompletny spotlight nie trafi na blog.'

const validateVideoTitle: TextFieldSingleValidation = (
  value,
  { siblingData }
) =>
  value || !spotlightStarted(siblingData)
    ? true
    : `Podaj tytuł wideo ${CLEAR_HINT}`

/**
 * The destination must carry its protocol. The site's `Link` decides new-tab
 * behaviour by testing the href for `http(s)://`, so `youtu.be/abc` would not
 * merely look wrong — it would render as an internal route and 404 the reader
 * instead of opening YouTube.
 */
const validateVideoUrl: TextFieldSingleValidation = (
  value,
  { siblingData }
) => {
  if (!value) {
    return spotlightStarted(siblingData)
      ? `Podaj adres wideo ${CLEAR_HINT}`
      : true
  }
  return /^https?:\/\//.test(value)
    ? true
    : 'Adres musi zaczynać się od https:// — bez tego link otworzy się jako podstrona serwisu.'
}

const validateVideoPoster: UploadFieldSingleValidation = (
  value,
  { siblingData }
) =>
  value || !spotlightStarted(siblingData)
    ? true
    : `Dodaj miniaturę ${CLEAR_HINT}`

export const blogHub: GlobalConfig = {
  slug: 'blog-hub',
  label: 'Blog — wybór redakcji',
  admin: {
    group: 'Treść',
    description:
      'Decyduje, co widać na górze /blog. Każde pole jest opcjonalne — puste sloty blog uzupełnia najnowszymi wpisami albo pomija daną sekcję.',
  },
  hooks: {
    afterChange: [revalidateBlogHubAfterChange],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'featured',
      label: 'Wyróżniony wpis',
      type: 'relationship',
      relationTo: 'posts',
      // Curation is per-locale: an English hub must never feature a post that
      // has no English translation. English ships with empty slots and falls
      // back to newest-translated-first, exactly as an empty PL global does.
      localized: true,
      admin: {
        description:
          'Duży wpis otwierający blog. Pusto = najnowszy opublikowany wpis.',
      },
    },
    {
      name: 'picks',
      label: 'Wybór redakcji',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      maxRows: 4,
      localized: true,
      admin: {
        description:
          'Lista obok wyróżnionego wpisu, maksymalnie cztery pozycje — kolejność jak tutaj. Pusto = cztery kolejne najnowsze wpisy.',
      },
    },
    {
      name: 'popular',
      label: 'Najczęściej czytane',
      type: 'relationship',
      relationTo: 'posts',
      localized: true,
      admin: {
        description:
          'Jeden wpis w bloku „Najczęściej czytane”. To wybór redakcji, nie pomiar ruchu. Pusto = cały blok znika.',
      },
    },
    {
      name: 'video',
      label: 'Spotlight wideo',
      type: 'group',
      admin: {
        description:
          'Jedno wideo z naszego kanału. Zostaw puste, żeby ukryć całą sekcję. Link otwiera się w nowej karcie — wideo nie jest osadzane na stronie.',
      },
      fields: [
        {
          name: 'title',
          label: 'Tytuł wideo',
          type: 'text',
          localized: true,
          validate: validateVideoTitle,
        },
        {
          name: 'url',
          label: 'Adres wideo',
          type: 'text',
          validate: validateVideoUrl,
          admin: {
            description: 'Pełny link do YouTube, np. https://youtu.be/...',
          },
        },
        {
          name: 'description',
          label: 'Opis',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Dwa–trzy zdania o tym, co jest w materiale.',
          },
        },
        {
          name: 'duration',
          label: 'Długość',
          type: 'text',
          localized: true,
          admin: {
            description: 'Opcjonalnie, w formacie 8:42.',
          },
        },
        {
          name: 'poster',
          label: 'Miniatura',
          type: 'upload',
          relationTo: 'media',
          validate: validateVideoPoster,
          admin: {
            description:
              'Kadr 16:9 pokazywany zamiast odtwarzacza. Wgrywamy własny, żeby mieć kontrolę nad kompozycją.',
          },
        },
      ],
    },
  ],
}
