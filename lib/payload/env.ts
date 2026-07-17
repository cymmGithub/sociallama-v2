import { payloadEnvSchema } from '@/utils/validation'

/**
 * Payload CMS Environment Configuration
 *
 * Unlike the optional integrations (which self-disable via `isConfigured()`),
 * Payload is the app's CMS platform: the blog routes and admin panel cannot
 * function without a database and a secret. A missing variable therefore
 * fails loudly at config load with setup instructions instead of surfacing
 * later as a cryptic connection error.
 */
export function requirePayloadEnv(): {
  databaseUrl: string
  payloadSecret: string
} {
  const result = payloadEnvSchema.safeParse(process.env)

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ')
    throw new Error(
      `[payload] Missing required environment variable(s): ${missing}\n\n` +
        'Setup:\n' +
        '  1. Copy .env.example to .env.local if you have not already\n' +
        '  2. DATABASE_URL   — Postgres connection string (Neon: https://console.neon.tech, or Vercel Marketplace)\n' +
        '  3. PAYLOAD_SECRET — long random string, e.g. `openssl rand -hex 32`\n\n' +
        'On Vercel, set both under Project Settings → Environment Variables.'
    )
  }

  return {
    databaseUrl: result.data.DATABASE_URL,
    payloadSecret: result.data.PAYLOAD_SECRET,
  }
}
