import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { revalidate as shopifyRevalidate } from '@/integrations/shopify/revalidate'
import { env } from '@/lib/env'
import { getClientIP, rateLimit, rateLimiters } from '@/lib/utils/rate-limit'

/**
 * Revalidation endpoint, serving two callers.
 *
 * Shopify webhooks, identified by `x-shopify-topic` or a `secret` query param.
 *
 * Manual invalidation, identified by a `tag` query param. Payload normally
 * revalidates its own tags in-process through collection hooks
 * (lib/payload/revalidate.ts), so the CMS needs nothing here — but those hooks
 * only reach the cache from *inside* the deployed app. A maintenance script
 * writing straight to the production database runs outside any Next request
 * scope, where `revalidateTag` throws and the hook swallows it, so the data
 * changes and the pages keep serving the old cache for `cacheLife('weeks')`.
 * Redeploying fixes it; this exists so redeploying is not the only way.
 */

/** Tags without a per-document suffix (see cacheTag calls in queries.ts). */
const GLOBAL_TAGS = new Set([
  'posts',
  'categories',
  'case-studies',
  'social-platforms',
  'blog-hub',
])

/** Scoped tags, e.g. `case-study:asus` — the prefix must be one of these. */
const SCOPED_PREFIXES = new Set(['post', 'case-study'])

function isKnownTag(tag: string): boolean {
  if (GLOBAL_TAGS.has(tag)) {
    return true
  }
  const separator = tag.indexOf(':')
  if (separator < 1 || separator === tag.length - 1) {
    return false
  }
  return SCOPED_PREFIXES.has(tag.slice(0, separator))
}

/** Length-independent comparison, so a wrong secret leaks nothing by timing. */
function secretMatches(given: string, expected: string): boolean {
  if (given.length !== expected.length) {
    return false
  }
  let diff = 0
  for (let i = 0; i < given.length; i++) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

function manualRevalidate(request: NextRequest): NextResponse {
  const expected = env.REVALIDATE_SECRET
  if (!expected) {
    // Refuse rather than run unauthenticated when the secret is unset.
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET is not configured' },
      { status: 503 }
    )
  }

  const given = request.headers.get('x-revalidate-secret')
  if (!(given && secretMatches(given, expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tags = request.nextUrl.searchParams.getAll('tag')
  // An unknown tag is rejected rather than passed through: revalidating a tag
  // nothing is cached under succeeds silently, and the caller would believe
  // stale pages had been refreshed.
  const unknown = tags.filter((tag) => !isKnownTag(tag))
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: 'Unknown tag', unknown, known: [...GLOBAL_TAGS] },
      { status: 400 }
    )
  }

  for (const tag of tags) {
    // 'max' expires the tag immediately, matching lib/payload/revalidate.ts.
    revalidateTag(tag, 'max')
  }
  return NextResponse.json({ revalidated: tags })
}

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

  // Checked before Shopify: that branch claims any request carrying `secret`,
  // and this one is told apart by `tag`.
  if (request.nextUrl.searchParams.has('tag')) {
    return manualRevalidate(request)
  }

  const isShopifyWebhook =
    request.headers.has('x-shopify-topic') ||
    request.nextUrl.searchParams.has('secret')

  if (isShopifyWebhook) {
    return shopifyRevalidate(request)
  }

  return new Response('Unknown webhook source', { status: 400 })
}
