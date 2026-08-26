'use server'

import { contactForm as plForm } from '@/lib/content/contact'
import { contactForm as enForm } from '@/lib/content/contact.en'
import { env } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import { validateFormWithTurnstile } from '@/lib/integrations/turnstile'
import type { FormState } from '@/lib/types/form'
import { runFormAction } from '@/lib/utils/form-action'
import { getResend } from './client'
import { buildContactSchema } from './contact-schema'

/**
 * `sendContactEmail` — server action for the `/kontakt` and `/en/contact` forms.
 * Validate Turnstile → `runFormAction` (rate-limit + Zod) → send the submission
 * to `CONTACT_INBOX` with the submitter as `Reply-To`. The optional `locale`
 * hidden field selects validation / status / email-label strings (design D7);
 * defaults to Polish. Always returns a `FormState`; never throws.
 */
export async function sendContactEmail(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const locale: Locale = formData.get('locale') === 'en' ? 'en' : 'pl'
  const form = locale === 'en' ? enForm : plForm

  // validateTurnstile handles the unconfigured case itself: fail open in
  // development (no widget, no token), fail closed in production.
  const turnstile = await validateFormWithTurnstile(formData)
  if (!turnstile.isValid) {
    return {
      status: 400,
      message: form.messages.security,
      fieldErrors: {
        turnstile: turnstile.errors[0] ?? 'security_verification_required_',
      },
    }
  }

  return runFormAction({
    rateLimitPrefix: 'contact-email',
    rateLimitMessage: form.messages.rateLimit,
    schema: buildContactSchema(form),
    formData,
    run: async (input) => {
      const resend = getResend()
      const from = env.EMAIL_FROM
      const inbox = env.CONTACT_INBOX
      // EMAIL_FROM is part of the guard: Resend rejects sends from unverified
      // addresses, so a missing sender must fail the submission, not fall back.
      if (!(resend && from && inbox)) {
        console.error(
          '[email] contact submission not delivered — Resend client, EMAIL_FROM or CONTACT_INBOX missing'
        )
        return { status: 500, message: form.messages.error }
      }

      try {
        // Resend reports API-level failures via `error`, not by throwing — an
        // unchecked result would read a rejected send as success.
        const { error } = await resend.emails.send({
          from,
          to: inbox,
          replyTo: input.email,
          subject: `${form.email.subjectPrefix} — ${input.name}`,
          text: [
            `${form.email.name}: ${input.name}`,
            `${form.email.email}: ${input.email}`,
            `${form.email.phone}: ${input.phoneNumber || form.email.none}`,
            `${form.email.consent}: ${form.email.granted}`,
            '',
            `${form.email.message}:`,
            input.message,
            '',
            // Verbatim snapshot of what was agreed to — the email is the only
            // record of the submission, and the on-page wording can change.
            `${form.email.consentBody}:`,
            `${form.consent.text}${form.consent.linkLabel}.`,
          ].join('\n'),
        })
        if (error) {
          console.error('[email] send rejected:', error)
          return { status: 500, message: form.messages.error }
        }
      } catch (error) {
        console.error('[email] send failed:', error)
        return { status: 500, message: form.messages.error }
      }

      return { status: 200, message: form.messages.success }
    },
  })
}
