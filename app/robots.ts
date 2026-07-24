import type { MetadataRoute } from 'next'
import { APP_BASE_URL } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Allow the media route (uploads live under /api/media/file/…) so Google
      // can fetch cover images for Image indexing and Article rich results;
      // more-specific Allow wins over the /api/ Disallow.
      allow: ['/', '/api/media/'],
      disallow: ['/api/'],
    },
    sitemap: `${APP_BASE_URL}/sitemap.xml`,
  }
}
