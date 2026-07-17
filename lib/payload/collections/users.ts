import type { CollectionConfig } from 'payload'

/**
 * Editor accounts. Auth-enabled: this collection gates the admin panel.
 * Public routes never require authentication.
 */
export const users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Użytkownik',
    plural: 'Użytkownicy',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Administracja',
  },
  fields: [
    {
      name: 'name',
      label: 'Imię i nazwisko',
      type: 'text',
    },
  ],
}
