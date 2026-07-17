'use server'

import { z } from 'zod'
import { contactForm, contactServices } from '@/lib/content/contact'
import { env } from '@/lib/env'
import { validateFormWithTurnstile } from '@/lib/integrations/turnstile'
import type { FormState } from '@/lib/types/form'
import { runFormAction } from '@/lib/utils/form-action'
import { getEmailTransport } from './transport'

const SERVICE_VALUES = contactServices.map((s) => s.value) as string[]
const SERVICE_LABELS = new Map<string, string>(
  contactServices.map((s) => [s.value, s.label])
)

/**
 * Contact form schema. `services` arrives as the JSON string emitted by the
 * form kit's CheckboxesField, so we parse it and keep only known service
 * values.
 */
const contactSchema = z.object({
  name: z.string().min(1, { error: contactForm.errors.name }),
  email: z.email({ error: contactForm.errors.email }),
  message: z.string().min(1, { error: contactForm.errors.message }),
  services: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw) return [] as string[]
      try {
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed)) return [] as string[]
        return parsed.filter(
          (v): v is string =>
            typeof v === 'string' && SERVICE_VALUES.includes(v)
        )
      } catch {
        return [] as string[]
      }
    }),
})

/**
 * `sendContactEmail` — server action for the `/kontakt` form. Mirrors
 * `mailchimpContactAction`: validate Turnstile → `runFormAction` (rate-limit +
 * Zod) → send the submission to `CONTACT_INBOX` with the submitter as
 * `Reply-To`. Always returns a `FormState`; never throws.
 */
export async function sendContactEmail(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  // validateTurnstile handles the unconfigured case itself: fail open in
  // development (no widget, no token), fail closed in production.
  const turnstile = await validateFormWithTurnstile(formData)
  if (!turnstile.isValid) {
    return {
      status: 400,
      message: contactForm.messages.security,
      fieldErrors: {
        turnstile: turnstile.errors[0] ?? 'security_verification_required_',
      },
    }
  }

  return runFormAction({
    rateLimitPrefix: 'contact-email',
    rateLimitMessage: contactForm.messages.rateLimit,
    schema: contactSchema,
    formData,
    run: async (input) => {
      const transport = getEmailTransport()
      const inbox = env.CONTACT_INBOX
      if (!(transport && inbox)) {
        console.error(
          '[email] contact submission not delivered — transport or CONTACT_INBOX missing'
        )
        return { status: 500, message: contactForm.messages.error }
      }

      const services = input.services.length
        ? input.services.map((v) => SERVICE_LABELS.get(v) ?? v).join(', ')
        : '—'

      try {
        await transport.sendMail({
          from: env.SMTP_USER,
          to: inbox,
          replyTo: input.email,
          subject: `Nowa wiadomość z formularza — ${input.name}`,
          text: [
            `Imię: ${input.name}`,
            `E-mail: ${input.email}`,
            `Zainteresowania: ${services}`,
            '',
            'Wiadomość:',
            input.message,
          ].join('\n'),
        })
      } catch (error) {
        console.error('[email] sendMail failed:', error)
        return { status: 500, message: contactForm.messages.error }
      }

      return { status: 200, message: contactForm.messages.success }
    },
  })
}
