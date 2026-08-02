/**
 * Next.js Request Proxy
 *
 * Handles cross-cutting concerns for incoming requests, before route matching.
 *
 * Customize:
 * - Rate limiting: Adjust rateLimiters config per route pattern
 * - Auth: Add token/session validation before route matching
 * - Logging: Add request logging for observability
 * - CORS: Add custom CORS headers for API routes
 *
 * Note: Security headers are configured in next.config.ts (static, no need for proxy)
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getClientIP, rateLimit, rateLimiters } from '@/lib/utils/rate-limit'

export function proxy(request: NextRequest) {
  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIP(request)
    const result = rateLimit(`api:${ip}`, rateLimiters.relaxed)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.resetIn),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  // The body only ever acts on /api/* (rate limiting) — matching page routes
  // would bill a proxy invocation per HTML request just to NextResponse.next().
  // Widen the matcher if auth/logging/CORS concerns are added above.
  matcher: ['/api/:path*'],
}
