import { z } from 'zod'

/**
 * Typed Environment Variables
 *
 * Provides validated, type-safe access to environment variables.
 * Import `env` instead of using `process.env` directly for type safety.
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env'
 *
 * // Type-safe access with IntelliSense
 * const url = env.NEXT_PUBLIC_BASE_URL // string | undefined
 * const databaseUrl = env.DATABASE_URL // string | undefined
 * ```
 */

const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  NEXT_PUBLIC_BASE_URL: z.url().optional(),

  // Payload CMS (Neon Postgres + Vercel Blob)
  DATABASE_URL: z.string().optional(),
  PAYLOAD_SECRET: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Shopify
  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_REVALIDATION_SECRET: z.string().optional(),

  // HubSpot
  HUBSPOT_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_HUBSPOT_PORTAL_ID: z.string().optional(),

  // Mailchimp
  MAILCHIMP_API_KEY: z.string().optional(),
  MAILCHIMP_SERVER_PREFIX: z.string().optional(),
  MAILCHIMP_AUDIENCE_ID: z.string().optional(),

  // Turnstile
  NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY: z.string().optional(),
  CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().optional(),

  // Contact email (SMTP — Google Workspace). Absent → /kontakt renders but
  // cannot deliver; the action fails gracefully. See lib/integrations/email.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  CONTACT_INBOX: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID: z.string().optional(),
  NEXT_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),
})

type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables with full TypeScript IntelliSense.
 *
 * All fields are optional -- integrations check their own requirements
 * via the registry's `isConfigured()`. This object provides type-safe access
 * without runtime validation overhead (parsing happens once at import).
 */
export const env: Env = envSchema.parse(process.env)

/**
 * Canonical base URL for the application.
 *
 * Falls back to `https://localhost:3000` for local development (the dev server
 * supports --https mode). In production, NEXT_PUBLIC_BASE_URL must be set —
 * omitting it causes all canonical URLs, sitemaps, and OG images to resolve
 * to localhost, breaking SEO entirely.
 */
// Trailing slash stripped: consumers join paths as `${APP_BASE_URL}/blog`,
// and a slash-suffixed env value would produce `//blog` URLs.
export const APP_BASE_URL = (
  env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000'
).replace(/\/+$/, '')

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.NEXT_PUBLIC_BASE_URL
) {
  console.warn(
    '[env] NEXT_PUBLIC_BASE_URL is not set in production. ' +
      'Canonical URLs, sitemaps, and OG image paths will resolve to localhost, ' +
      'which harms SEO. Set NEXT_PUBLIC_BASE_URL to your production domain.'
  )
}
