import type { CollectionConfig } from 'payload'
import {
  revalidateCategoryAfterChange,
  revalidateCategoryAfterDelete,
} from '@/lib/payload/revalidate'
import { validatePostSlug } from '@/lib/payload/validate-slug'

/**
 * Post categories. Slugs must match the live WordPress category slugs
 * exactly (`marketing`, `reklama`, `seo`, `social-media`) — the seed script
 * creates those four; category pages render at `/category/{slug}`.
 */
export const categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Kategoria',
    plural: 'Kategorie',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Treść',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCategoryAfterChange],
    afterDelete: [revalidateCategoryAfterDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Nazwa',
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
        description:
          'Adres kategorii: /category/{slug}. Małe litery, cyfry i myślniki.',
      },
    },
  ],
}
