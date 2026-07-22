'use server'

import { z } from 'zod'
import {
  type LocalizedContact,
  contactForm as plForm,
  contactServices as plServices,
} from '@/lib/content/contact'
import {
  contactForm as enForm,
  contactServices as enServices,
} from '@/lib/content/contact.en'
import { env } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import { validateFormWithTurnstile } from '@/lib/integrations/turnstile'
import type { FormState } from '@/lib/types/form'
import { runFormAction } from '@/lib/utils/form-action'
import { getEmailTransport } from './transport'

// Service `value`s are locale-independent (the checkbox values); only labels
// differ, so the accepted set is the same in both locales.
const SERVICE_VALUES = plServices.map((s) => s.value) as string[]

type ContactCopy = LocalizedContact['contactForm']

function localeCopy(locale: Locale): {
  form: ContactCopy
  serviceLabels: Map<string, string>
} {
  const en = locale === 'en'
  const services = en ? enServices : plServices
  return {
    form: en ? enForm : plForm,
    serviceLabels: new Map(services.map((s) => [s.value, s.label])),
  }
}

/**
 * Contact form schema, built per-locale so field-error messages match the
 * submitter's locale. `services` arrives as the JSON string emitted by the form
 * kit's CheckboxesField, so we parse it and keep only known service values.
 */
function buildContactSchema(form: ContactCopy) {
  return z.object({
    name: z.string().min(1, { error: form.errors.name }),
    email: z.email({ error: form.errors.email }),
    // Optional callback number — no strict regex so international/informal
    // formats are accepted (a rejected valid number is a lost lead). Keyed
    // `phoneNumber` to dodge the form kit's built-in strict `phone` validator.
    phoneNumber: z.string().trim().optional(),
    message: z.string().min(1, { error: form.errors.message }),
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
}

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
  const { form, serviceLabels } = localeCopy(locale)

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
      const transport = getEmailTransport()
      const inbox = env.CONTACT_INBOX
      if (!(transport && inbox)) {
        console.error(
          '[email] contact submission not delivered — transport or CONTACT_INBOX missing'
        )
        return { status: 500, message: form.messages.error }
      }

      const services = input.services.length
        ? input.services.map((v) => serviceLabels.get(v) ?? v).join(', ')
        : form.email.none

      try {
        await transport.sendMail({
          from: env.SMTP_USER,
          to: inbox,
          replyTo: input.email,
          subject: `${form.email.subjectPrefix} — ${input.name}`,
          text: [
            `${form.email.name}: ${input.name}`,
            `${form.email.email}: ${input.email}`,
            `${form.email.phone}: ${input.phoneNumber || form.email.none}`,
            `${form.email.services}: ${services}`,
            '',
            `${form.email.message}:`,
            input.message,
          ].join('\n'),
        })
      } catch (error) {
        console.error('[email] sendMail failed:', error)
        return { status: 500, message: form.messages.error }
      }

      return { status: 200, message: form.messages.success }
    },
  })
}
