import type { MetadataRoute } from 'next'
import { APP_BASE_URL } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Images no longer live here: uploads are served straight from the
      // Vercel Blob CDN (see next.config.ts). The allow stays because
      // /api/media/file/* is still indexed from before the move and now 308s
      // to the blob host — under the bare /api/ Disallow a crawler would never
      // fetch those URLs and so would never see the redirect. More-specific
      // Allow wins over the Disallow.
      allow: ['/', '/api/media/'],
      disallow: ['/api/'],
    },
    sitemap: `${APP_BASE_URL}/sitemap.xml`,
  }
}
