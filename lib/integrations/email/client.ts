import { Resend } from 'resend'
import { env } from '@/lib/env'

/**
 * Resend client for form-email delivery.
 *
 * Built from `RESEND_API_KEY`. Returns `null` (and logs once) when
 * unconfigured so the form actions can fail gracefully — never throw — and
 * the pages still render. The client is cached across invocations; Fluid
 * Compute reuses the instance between requests.
 */

// `undefined` = not yet resolved; `null` = resolved-but-unconfigured.
let cached: Resend | null | undefined

export function getResend(): Resend | null {
  if (cached !== undefined) return cached

  if (!env.RESEND_API_KEY) {
    console.warn(
      '[email] Resend not configured (need RESEND_API_KEY) — form delivery disabled'
    )
    cached = null
    return cached
  }

  cached = new Resend(env.RESEND_API_KEY)
  return cached
}
