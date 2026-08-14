/**
 * Contact form schema — the authoritative gate.
 *
 * The browser-side consent check is advisory and trivially bypassed, so the
 * constraint the form advertises has to hold here too, with the error
 * attributed to the right control and worded in the submitter's locale.
 *
 * Run with: bun test lib/integrations/email/contact-schema.test.ts
 */

import { describe, expect, test } from 'bun:test'
import { contactForm as plForm } from '@/lib/content/contact'
import { contactForm as enForm } from '@/lib/content/contact.en'
import { buildContactSchema } from './contact-schema'

const schema = buildContactSchema(plForm)

const valid = {
  name: 'Anna Kowalska',
  email: 'anna@example.com',
  message: 'Chcemy odświeżyć social media.',
  consent: 'on',
}

/** First issue for a field, as `parseFormData` would key it. */
function errorFor(result: ReturnType<typeof schema.safeParse>, field: string) {
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('contact form schema', () => {
  test('accepts a submission with consent given', () => {
    const result = schema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('rejects a missing consent and attributes it to that control', () => {
    const { consent: _dropped, ...withoutConsent } = valid
    const result = schema.safeParse(withoutConsent)
    expect(result.success).toBe(false)
    expect(errorFor(result, 'consent')).toBe(plForm.errors.consent)
  })

  test('rejects any value other than the browser’s "on"', () => {
    const result = schema.safeParse({ ...valid, consent: 'off' })
    expect(result.success).toBe(false)
    expect(errorFor(result, 'consent')).toBe(plForm.errors.consent)
  })

  test('reports the consent error in the submitter’s locale', () => {
    const result = buildContactSchema(enForm).safeParse({
      ...valid,
      consent: undefined,
    })
    expect(result.success).toBe(false)
    expect(errorFor(result, 'consent')).toBe(enForm.errors.consent)
  })
})
