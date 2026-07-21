import type { CollectionConfig } from 'payload'
import {
  revalidatePlatformAfterChange,
  revalidatePlatformAfterDelete,
} from '@/lib/payload/revalidate'

/**
 * Reusable social-platform logos (TikTok, YouTube, …) held in the CMS so any
 * surface can look one up by `key` and render its mark. Used by the case-study
 * results section to prefix each per-platform heading with its logo.
 */
export const socialPlatforms: CollectionConfig = {
  slug: 'social-platforms',
  labels: {
    singular: 'Platforma społecznościowa',
    plural: 'Platformy społecznościowe',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key'],
    group: 'Ustawienia',
  },
  hooks: {
    afterChange: [revalidatePlatformAfterChange],
    afterDelete: [revalidatePlatformAfterDelete],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Nazwa',
      type: 'text',
      required: true,
      admin: { description: 'Wyświetlana nazwa, np. „TikTok”.' },
    },
    {
      name: 'key',
      label: 'Klucz',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Identyfikator do dopasowania (małe litery, bez spacji), np. „tiktok”.',
      },
    },
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
