import { z } from 'zod'
import {
  type LocalizedContact,
  contactServices as plServices,
} from '@/lib/content/contact'

// Service `value`s are locale-independent (the checkbox values); only labels
// differ, so the accepted set is the same in both locales.
const SERVICE_VALUES = plServices.map((s) => s.value) as string[]

export type ContactCopy = LocalizedContact['contactForm']

/**
 * Contact form schema, built per-locale so field-error messages match the
 * submitter's locale. `services` arrives as the JSON string emitted by the form
 * kit's CheckboxesField, so we parse it and keep only known service values.
 *
 * It lives here rather than in `action.ts` because a `'use server'` module may
 * only export async functions — and this gate is the authoritative one (the
 * browser check is advisory and trivially bypassed), so it has to be testable.
 */
export function buildContactSchema(form: ContactCopy) {
  return z.object({
    name: z.string().min(1, { error: form.errors.name }),
    email: z.email({ error: form.errors.email }),
    // Optional callback number — no strict regex so international/informal
    // formats are accepted (a rejected valid number is a lost lead). Keyed
    // `phoneNumber` to dodge the form kit's built-in strict `phone` validator.
    phoneNumber: z.string().trim().optional(),
    message: z.string().min(1, { error: form.errors.message }),
    // Browsers submit a checked box as "on" and omit an unchecked one, so the
    // literal covers both refusal and absence — the consent guarantee holds
    // even when the client-side gate is bypassed.
    consent: z.literal('on', { error: form.errors.consent }),
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
