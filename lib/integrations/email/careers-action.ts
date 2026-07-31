'use server'

import {
  CAREERS_SPONTANEOUS_VALUE,
  type LocalizedCareers,
  careersForm as plForm,
  careersRoles as plRoles,
} from '@/lib/content/zostan-lama'
import {
  careersForm as enForm,
  careersRoles as enRoles,
} from '@/lib/content/zostan-lama.en'
import { env } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import { validateFormWithTurnstile } from '@/lib/integrations/turnstile'
import type { FormState } from '@/lib/types/form'
import { runFormAction } from '@/lib/utils/form-action'
import { buildCareersSchema } from './careers-schema'
import { getEmailTransport } from './transport'

type CareersFormCopy = LocalizedCareers['careersForm']

function localeCopy(locale: Locale): {
  form: CareersFormCopy
  roleLabels: Map<string, string>
} {
  const en = locale === 'en'
  const form = en ? enForm : plForm
  const roles = en ? enRoles : plRoles
  return {
    form,
    roleLabels: new Map([
      ...roles.map((role): [string, string] => [role.id, role.title]),
      [CAREERS_SPONTANEOUS_VALUE, form.fields.role.spontaneous],
    ]),
  }
}

/**
 * `sendCareersApplication` — server action for the `/zostan-lama` and
 * `/en/become-a-lama` application forms.
 *
 * Turnstile → `runFormAction` (rate-limit + Zod) → deliver to `CONTACT_INBOX`
 * with the applicant as `Reply-To` and the CV as an attachment. Deliberately
 * separate from `sendContactEmail` (design D7): the schemas, the subject, the
 * required consent and the rate-limit budget all differ, and a `kind`
 * discriminator on one action would make both paths harder to read.
 *
 * Nothing is persisted — the CV is streamed from `FormData` into the outgoing
 * message and discarded with the request (design D4). Always returns a
 * `FormState`; never throws.
 */
export async function sendCareersApplication(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const locale: Locale = formData.get('locale') === 'en' ? 'en' : 'pl'
  const { form, roleLabels } = localeCopy(locale)

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
    // Its own budget — an exhausted careers limit must not lock the visitor
    // out of the contact form from the same IP.
    rateLimitPrefix: 'careers-application',
    rateLimitMessage: form.messages.rateLimit,
    schema: buildCareersSchema(form),
    formData,
    run: async (input) => {
      const transport = getEmailTransport()
      // Applications go to their own inbox (client decision): a CV is a
      // candidate's personal document and does not belong in the shared
      // sales-lead mailbox. Falls back rather than failing, so a missing value
      // never costs an application — but says so, because a fallback that
      // stays quiet is a fallback nobody notices for months.
      const inbox = env.CAREERS_INBOX ?? env.CONTACT_INBOX
      if (!env.CAREERS_INBOX && env.CONTACT_INBOX) {
        console.warn(
          '[email] CAREERS_INBOX not set — delivering the application to CONTACT_INBOX'
        )
      }
      // Fail-soft SMTP means an unconfigured environment would otherwise
      // accept applications and deliver nothing (design: Risks).
      if (!(transport && inbox)) {
        console.error(
          '[email] careers application not delivered — transport or CONTACT_INBOX missing'
        )
        return { status: 500, message: form.messages.error }
      }

      const roleLabel = roleLabels.get(input.role) ?? input.role
      const attachments = input.cv
        ? [
            {
              filename: input.cv.name,
              content: Buffer.from(await input.cv.arrayBuffer()),
              ...(input.cv.type && { contentType: input.cv.type }),
            },
          ]
        : []

      try {
        await transport.sendMail({
          from: env.SMTP_USER,
          to: inbox,
          replyTo: input.email,
          subject: `${form.email.subjectPrefix}: ${roleLabel} — ${input.name}`,
          text: [
            `${form.email.name}: ${input.name}`,
            `${form.email.email}: ${input.email}`,
            `${form.email.role}: ${roleLabel}`,
            `${form.email.cv}: ${input.cv?.name ?? form.email.none}`,
            `${form.email.consent}: ${form.email.granted}`,
            `${form.email.marketing}: ${
              input.marketingConsent ? form.email.granted : form.email.declined
            }`,
            '',
            `${form.email.message}:`,
            input.message,
          ].join('\n'),
          attachments,
        })
      } catch (error) {
        console.error('[email] careers sendMail failed:', error)
        return { status: 500, message: form.messages.error }
      }

      return { status: 200, message: form.messages.success }
    },
  })
}
