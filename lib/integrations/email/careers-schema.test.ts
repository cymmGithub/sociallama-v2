/**
 * Careers application schema — the authoritative gate.
 *
 * These cases are the server half of design D5/D6: the browser check is
 * advisory and trivially bypassed, so every constraint the form advertises has
 * to hold here too, with the error attributed to the right control and worded
 * in the submitter's locale.
 *
 * Run with: bun test lib/integrations/email/careers-schema.test.ts
 */

import { describe, expect, test } from 'bun:test'
import {
  CAREERS_CV_MAX_BYTES,
  careersForm as plForm,
} from '@/lib/content/zostan-lama'
import { careersForm as enForm } from '@/lib/content/zostan-lama.en'
import {
  buildCareersSchema,
  CAREERS_CV_ACCEPT,
  CAREERS_ROLE_VALUES,
} from './careers-schema'

const schema = buildCareersSchema(plForm)

/** A file of an arbitrary declared size — only `size` is ever read. */
function cvFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const valid = {
  name: 'Anna Kowalska',
  email: 'anna@example.com',
  role: 'social-media-specialist',
  message: 'Robię social od sześciu lat.',
  consent: 'on',
  cv: cvFile('cv.pdf', 'application/pdf', 512 * 1024),
}

/** First issue for a field, as `parseFormData` would key it. */
function errorFor(result: ReturnType<typeof schema.safeParse>, field: string) {
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('careers application schema', () => {
  test('accepts a complete application', () => {
    const result = schema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.cv?.name).toBe('cv.pdf')
  })

  test('rejects an application with no CV, attributed to that control', () => {
    const { cv: _dropped, ...withoutCv } = valid
    const result = schema.safeParse(withoutCv)
    expect(result.success).toBe(false)
    expect(errorFor(result, 'cv')).toBe(plForm.errors.cvRequired)
  })

  test('accepts an in-cap PDF and carries it through', () => {
    const result = schema.safeParse({
      ...valid,
      cv: cvFile('cv.pdf', 'application/pdf', 4.9 * 1024 * 1024),
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.cv?.name).toBe('cv.pdf')
  })

  test('rejects an oversized attachment with the size message', () => {
    const result = schema.safeParse({
      ...valid,
      cv: cvFile('cv.pdf', 'application/pdf', CAREERS_CV_MAX_BYTES + 1),
    })
    expect(result.success).toBe(false)
    expect(errorFor(result, 'cv')).toBe(plForm.errors.cvSize)
  })

  test('accepts a file exactly at the cap', () => {
    const result = schema.safeParse({
      ...valid,
      cv: cvFile('cv.pdf', 'application/pdf', CAREERS_CV_MAX_BYTES),
    })
    expect(result.success).toBe(true)
  })

  test('rejects a disallowed type with the type message', () => {
    const result = schema.safeParse({
      ...valid,
      cv: cvFile('cv.exe', 'application/x-msdownload', 2048),
    })
    expect(result.success).toBe(false)
    expect(errorFor(result, 'cv')).toBe(plForm.errors.cvType)
  })

  test('accepts a DOCX whose browser-declared MIME type is empty', () => {
    const result = schema.safeParse({
      ...valid,
      cv: cvFile('cv.docx', '', 2048),
    })
    expect(result.success).toBe(true)
  })

  test('treats an untouched file input as a missing CV, not an empty one', () => {
    // Browsers submit an empty file input as a zero-byte File; some serialise
    // it as an empty string. Neither is an attachment, and with the CV required
    // neither may pass as "the applicant chose not to attach one".
    for (const empty of [cvFile('', '', 0), '']) {
      const result = schema.safeParse({ ...valid, cv: empty })
      expect(result.success).toBe(false)
      expect(errorFor(result, 'cv')).toBe(plForm.errors.cvRequired)
    }
  })

  test('rejects a role outside the open roles and the spontaneous option', () => {
    const result = schema.safeParse({ ...valid, role: 'ceo' })
    expect(result.success).toBe(false)
    expect(errorFor(result, 'role')).toBe(plForm.errors.role)
  })

  test('accepts every advertised role value', () => {
    for (const role of CAREERS_ROLE_VALUES) {
      expect(schema.safeParse({ ...valid, role }).success).toBe(true)
    }
  })

  test('accepts an application that declines the marketing consent', () => {
    const result = schema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.marketingConsent).toBe(false)
  })

  test('records a granted marketing consent', () => {
    const result = schema.safeParse({ ...valid, marketingConsent: 'on' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.marketingConsent).toBe(true)
  })

  test('rejects a missing consent and attributes it to that control', () => {
    const { consent: _dropped, ...withoutConsent } = valid
    const result = schema.safeParse(withoutConsent)
    expect(result.success).toBe(false)
    expect(errorFor(result, 'consent')).toBe(plForm.errors.consent)
  })

  test('rejects a required field left empty, per field', () => {
    const blank = schema.safeParse({
      ...valid,
      name: '   ',
      email: 'nie-adres',
      message: '',
    })
    expect(blank.success).toBe(false)
    expect(errorFor(blank, 'name')).toBe(plForm.errors.name)
    expect(errorFor(blank, 'email')).toBe(plForm.errors.email)
    expect(errorFor(blank, 'message')).toBe(plForm.errors.message)
  })

  test('returns English messages for an English submission', () => {
    const result = buildCareersSchema(enForm).safeParse({
      ...valid,
      role: 'ceo',
      consent: undefined,
    })
    expect(result.success).toBe(false)
    expect(errorFor(result, 'role')).toBe(enForm.errors.role)
    expect(errorFor(result, 'consent')).toBe(enForm.errors.consent)
  })

  test('the accept attribute covers exactly what the schema accepts', () => {
    expect(CAREERS_CV_ACCEPT.split(',')).toEqual([
      '.pdf',
      '.docx',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
  })
})
