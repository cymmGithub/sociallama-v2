import type { NextRequest } from 'next/server'
import { revalidate as shopifyRevalidate } from '@/integrations/shopify/revalidate'
import { getClientIP, rateLimit, rateLimiters } from '@/lib/utils/rate-limit'

/**
 * Webhook revalidation endpoint. Currently serves Shopify webhooks only —
 * Payload (the CMS) revalidates its own cache tags in-process via
 * collection hooks (lib/payload/revalidate.ts), no webhook needed.
 */
export async function POST(request: NextRequest) {
  // Rate limit to prevent cache flooding
  const ip = getClientIP(request)
  const rateLimitResult = rateLimit(`revalidate:${ip}`, rateLimiters.standard)

  if (!rateLimitResult.success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': String(rateLimitResult.resetIn),
      },
    })
  }

  const isShopifyWebhook =
    request.headers.has('x-shopify-topic') ||
    request.nextUrl.searchParams.has('secret')

  if (isShopifyWebhook) {
    return shopifyRevalidate(request)
  }

  return new Response('Unknown webhook source', { status: 400 })
}
