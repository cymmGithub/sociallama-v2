import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '@/lib/env'

/**
 * Nodemailer SMTP transport for contact-form delivery (Google Workspace).
 *
 * Built from `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`. Returns
 * `null` (and logs once) when unconfigured so the contact action can fail
 * gracefully — never throw — and the page still renders. The transport is
 * cached across invocations; Fluid Compute reuses the instance, keeping the
 * SMTP connection warm between requests.
 */

// `undefined` = not yet resolved; `null` = resolved-but-unconfigured.
let cached: Transporter | null | undefined

export function getEmailTransport(): Transporter | null {
  if (cached !== undefined) return cached

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env
  if (!(SMTP_HOST && SMTP_USER && SMTP_PASS)) {
    console.warn(
      '[email] SMTP not configured (need SMTP_HOST, SMTP_USER, SMTP_PASS) — contact delivery disabled'
    )
    cached = null
    return cached
  }

  const port = Number(SMTP_PORT ?? '587')
  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    // 465 = implicit TLS; 587 = STARTTLS (nodemailer upgrades automatically).
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return cached
}
