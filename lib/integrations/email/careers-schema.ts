/**
 * Validation schema for the careers application form.
 *
 * Kept out of `careers-action.ts` because that module is `'use server'`, where
 * every export must be an async function — the schema could not be exported,
 * and therefore could not be tested, from inside it.
 *
 * This is the authoritative gate. The browser checks the attachment too
 * (`FileField`), but that layer exists to produce a readable message before an
 * oversized body is spent, not to be trusted (design D5).
 */

import { z } from 'zod'
import {
  CAREERS_CV_MAX_BYTES,
  CAREERS_SPONTANEOUS_VALUE,
  careersRoles,
  type LocalizedCareers,
} from '@/lib/content/zostan-lama'

type CareersFormCopy = LocalizedCareers['careersForm']

/**
 * Accepted CV types, by declared MIME type and by extension — an allowlist, not
 * magic-byte sniffing (design D6). Both are checked because browsers disagree:
 * DOCX frequently arrives with an empty `type` on Linux and Android, and some
 * mail-adjacent clients send `application/octet-stream` for a perfectly good
 * PDF.
 */
const CV_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

const CV_EXTENSIONS = ['.pdf', '.docx'] as const

/** The `accept` attribute for the file input — the same allowlist, verbatim. */
export const CAREERS_CV_ACCEPT = [...CV_EXTENSIONS, ...CV_MIME_TYPES].join(',')

function isAllowedCv(file: File): boolean {
  const name = file.name.toLowerCase()
  const byExtension = CV_EXTENSIONS.some((ext) => name.endsWith(ext))
  const byMime = (CV_MIME_TYPES as readonly string[]).includes(file.type)
  return byExtension || byMime
}

/**
 * Role values the form may submit: every open role's `id` plus the spontaneous
 * option. Locale-independent, so one list serves both locales (same contract as
 * the contact form's service values).
 */
export const CAREERS_ROLE_VALUES: readonly string[] = [
  ...careersRoles.map((role) => role.id),
  CAREERS_SPONTANEOUS_VALUE,
]

/**
 * Per-locale schema, so every field error is returned in the submitter's
 * language. `parseFormData` feeds it the raw `FormData` entries, which means
 * the CV arrives as a `File` and the consent checkbox as the string `"on"` —
 * or is absent entirely when unchecked.
 */
export function buildCareersSchema(form: CareersFormCopy) {
  return z.object({
    name: z.string().trim().min(1, { error: form.errors.name }),
    email: z.email({ error: form.errors.email }),
    role: z.string().refine((value) => CAREERS_ROLE_VALUES.includes(value), {
      error: form.errors.role,
    }),
    message: z.string().trim().min(1, { error: form.errors.message }),
    // Browsers submit a checked box as "on" and omit an unchecked one, so the
    // literal covers both refusal and absence.
    consent: z.literal('on', { error: form.errors.consent }),
    // Optional and deliberately separate from the required one: a marketing
    // permission bundled into the consent you must give to apply would not be
    // freely given. Absent = declined, which is a valid submission.
    marketingConsent: z
      .literal('on')
      .optional()
      .transform((value) => value === 'on'),
    // Required. An untouched file input still submits an entry — a zero-byte
    // `File` in most browsers, an empty string in some — and neither is an
    // attachment, so both normalise to `undefined` and then fail the presence
    // check, rather than passing as "the applicant chose not to attach one".
    cv: z
      .instanceof(File)
      .or(z.string())
      .optional()
      .transform((value) =>
        value instanceof File && value.size > 0 ? value : undefined
      )
      .refine((file) => file !== undefined, {
        error: form.errors.cvRequired,
      })
      .refine((file) => !file || isAllowedCv(file), {
        error: form.errors.cvType,
      })
      .refine((file) => !file || file.size <= CAREERS_CV_MAX_BYTES, {
        error: form.errors.cvSize,
      }),
  })
}

export type CareersApplication = z.infer<ReturnType<typeof buildCareersSchema>>
