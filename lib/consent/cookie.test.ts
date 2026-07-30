import { describe, expect, test } from 'bun:test'
import {
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  type ConsentDecision,
  cookieValue,
  parseConsent,
  serializeConsent,
} from './cookie'

/**
 * The consent cookie is the one place where a bug is silent AND legally
 * material: a parser that throws takes the head script down with it, and a
 * parser that guesses grants consent nobody gave. Both failure directions are
 * covered here, and the malformed cases assert "no decision" rather than
 * "no throw" — not throwing while returning something truthy would be worse
 * than crashing.
 */

const decision: ConsentDecision = {
  v: CONSENT_VERSION,
  analytics: true,
  ts: 1_753_000_000,
}

describe('serializeConsent / parseConsent', () => {
  test('round-trips every field', () => {
    expect(parseConsent(serializeConsent(decision))).toEqual(decision)
  })

  test('round-trips a refusal, which is a decision like any other', () => {
    const refusal: ConsentDecision = { ...decision, analytics: false }
    expect(parseConsent(serializeConsent(refusal))).toEqual(refusal)
  })

  test('survives the URI encoding it is stored under', () => {
    // A cookie value containing a raw `;` or `,` would truncate the header.
    expect(serializeConsent(decision)).not.toContain(';')
    expect(serializeConsent(decision)).not.toContain(',')
  })
})

describe('version mismatch', () => {
  test('a decision from a previous vendor list is not a decision', () => {
    const stale = serializeConsent({ ...decision, v: CONSENT_VERSION - 1 })
    expect(parseConsent(stale)).toBeNull()
  })

  test('a decision from a future vendor list is not a decision either', () => {
    const future = serializeConsent({ ...decision, v: CONSENT_VERSION + 1 })
    expect(parseConsent(future)).toBeNull()
  })
})

describe('malformed input is never consent', () => {
  const junk: [label: string, raw: string | null | undefined][] = [
    ['undefined', undefined],
    ['null', null],
    ['empty string', ''],
    ['not JSON at all', 'hello'],
    ['truncated JSON', '%7B%22v%22%3A1%2C%22analytics%22'],
    ['a JSON array', encodeURIComponent('[]')],
    ['a JSON string', encodeURIComponent('"granted"')],
    ['JSON null', encodeURIComponent('null')],
    ['a number', encodeURIComponent('42')],
    ['no version', encodeURIComponent(JSON.stringify({ analytics: true }))],
    [
      'analytics as a string',
      encodeURIComponent(
        JSON.stringify({ v: CONSENT_VERSION, analytics: 'true', ts: 1 })
      ),
    ],
    [
      'analytics missing',
      encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, ts: 1 })),
    ],
    [
      'timestamp as a string',
      encodeURIComponent(
        JSON.stringify({ v: CONSENT_VERSION, analytics: true, ts: 'now' })
      ),
    ],
    [
      'timestamp NaN once round-tripped',
      encodeURIComponent(
        JSON.stringify({ v: CONSENT_VERSION, analytics: true, ts: Number.NaN })
      ),
    ],
    ['unescaped percent sign', '%'],
    ['lone surrogate escape', '%E0%A4%A'],
  ]

  for (const [label, raw] of junk) {
    test(`${label} parses as no decision, without throwing`, () => {
      expect(() => parseConsent(raw)).not.toThrow()
      expect(parseConsent(raw)).toBeNull()
    })
  }
})

describe('cookieValue', () => {
  test('finds the consent cookie among others', () => {
    const jar = `foo=1; ${CONSENT_COOKIE_NAME}=${serializeConsent(decision)}; bar=2`
    expect(parseConsent(cookieValue(jar, CONSENT_COOKIE_NAME))).toEqual(
      decision
    )
  })

  test('does not match a cookie whose name merely ends with ours', () => {
    // `not_sl_consent` shares our suffix. A regex on the bare name would match
    // it, and its value is entirely under a visitor's control.
    const jar = `not_${CONSENT_COOKIE_NAME}=${serializeConsent(decision)}`
    expect(cookieValue(jar, CONSENT_COOKIE_NAME)).toBeUndefined()
  })

  test('returns undefined when the cookie is absent', () => {
    expect(cookieValue('foo=1; bar=2', CONSENT_COOKIE_NAME)).toBeUndefined()
  })

  test('handles an empty jar', () => {
    expect(cookieValue('', CONSENT_COOKIE_NAME)).toBeUndefined()
  })
})
