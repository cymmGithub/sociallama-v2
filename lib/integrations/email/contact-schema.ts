import { z } from 'zod'
import type { LocalizedContact } from '@/lib/content/contact'

export type ContactCopy = LocalizedContact['contactForm']

/**
 * Contact form schema, built per-locale so field-error messages match the
 * submitter's locale.
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
  })
}
