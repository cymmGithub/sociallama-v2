import type { MetadataRoute } from 'next'
import { themes } from '@/styles/colors'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Social Lama',
    short_name: 'Social Lama',
    description:
      'Agencja social media. Kompleksowa obsługa marek w mediach społecznościowych: strategia, content, sprzedaż, kreacje i wideo.',
    start_url: '/',
    display: 'standalone',
    background_color: themes.plum.primary,
    theme_color: themes.plum.primary,
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
