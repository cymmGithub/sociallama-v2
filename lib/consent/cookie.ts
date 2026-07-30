/** biome-ignore-all lint/suspicious/noDocumentCookie: the Cookie Store API is
 * async and unavailable in Safari. The consent cookie has a second reader — the
 * inline `<head>` script — which can only use `document.cookie`, and the two
 * readers must agree exactly. One mechanism, deliberately. */

/**
 * The `sl_consent` cookie: shape, versioning, and defensive parsing.
 *
 * First-party, `SameSite=Lax; Secure; Path=/`, 12 months, and deliberately NOT
 * `httpOnly` — two separate client readers need it: the inline `<head>` script
 * in `lib/consent/consent-init.tsx` (before any bundle exists) and this module
 * (after hydration, to drive the UI). It is stored as URI-encoded JSON and is
 * readable in devtools by design: a consent record the visitor cannot inspect
 * is a poor consent record.
 *
 * The head script duplicates the read half of this file in a few lines of
 * hand-written JS. That duplication is intentional and load-bearing — see the
 * comment there before changing the cookie's shape, because there are two
 * readers and only one of them can import anything.
 */

/** Cookie name. Mirrored as a literal in the head script. */
export const CONSENT_COOKIE_NAME = 'sl_consent'

/**
 * Vendor-list version. THIS IS NOT A SCHEMA VERSION — it is the version of the
 * set of vendors in `lib/content/consent.ts` that a visitor consented against.
 *
 * ▸ ADD, REMOVE OR REPURPOSE A VENDOR THERE → BUMP THIS. ◂
 *
 * Every stored decision then fails the version check, is treated as no
 * decision, and every visitor is asked again. Skipping the bump silently
 * applies a consent given for one vendor list to a different one — someone who
 * agreed to Google Analytics would be treated as having agreed to a pixel they
 * were never shown. That is the failure this constant exists to prevent, and
 * it is invisible in testing because everything keeps working.
 *
 * Mirrored as a literal in the head script; bump it in both places.
 */
export const CONSENT_VERSION = 1

/** 12 months, for acceptance and refusal alike (design.md Decision 5). */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

/**
 * A stored decision. `ts` + `v` together are the record of consent: what was
 * agreed to, and when, against a vendor list recoverable from git history.
 *
 * There is no `marketing` field because there is no marketing category. Adding
 * one is a `CONSENT_VERSION` bump, which discards every stored cookie anyway —
 * so the field costs nothing to add later and nothing is gained by reserving it
 * now.
 */
export interface ConsentDecision {
  /** Vendor-list version this decision was made against. */
  v: number
  /** Whether the analytics category was accepted. */
  analytics: boolean
  /** Unix seconds at which the choice was made. */
  ts: number
}

/** Serialize a decision to the cookie's value (URI-encoded JSON). */
export function serializeConsent(decision: ConsentDecision): string {
  return encodeURIComponent(JSON.stringify(decision))
}

/**
 * Parse a raw cookie value into a decision, or `null` for "no decision".
 *
 * Never throws and never falls through to granted. Empty, truncated,
 * hand-edited, wrongly-typed and stale-version values all return `null`, which
 * shows the banner again — the only safe direction to fail in.
 */
export function parseConsent(
  raw: string | null | undefined
): ConsentDecision | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(decodeURIComponent(raw))
  } catch {
    // Malformed percent-encoding or malformed JSON. Both mean "no decision".
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null

  const { v, analytics, ts } = parsed as Record<string, unknown>

  // A decision made against a different vendor list is not a decision about
  // the current one.
  if (v !== CONSENT_VERSION) return null
  if (typeof analytics !== 'boolean') return null
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return null

  return { v, analytics, ts }
}

/**
 * Pull one cookie's value out of a `document.cookie` string.
 *
 * Split on `;` rather than regex-matching the name: a cookie name is a literal
 * here, but the values are attacker-adjacent (anyone can set a cookie on their
 * own browser) and a sloppy pattern can match the tail of a different cookie.
 */
export function cookieValue(
  cookieString: string,
  name: string
): string | undefined {
  for (const part of cookieString.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq).trim() !== name) continue
    return part.slice(eq + 1).trim()
  }
  return undefined
}

/** Read and parse the stored decision. `null` when there is none to honour. */
export function readConsent(): ConsentDecision | null {
  if (typeof document === 'undefined') return null
  return parseConsent(cookieValue(document.cookie, CONSENT_COOKIE_NAME))
}

/**
 * Persist a decision and return what was written.
 *
 * `Secure` is unconditional: browsers treat `http://localhost` as a trustworthy
 * origin, so it does not need relaxing for local development.
 */
export function writeConsent(analytics: boolean): ConsentDecision {
  const decision: ConsentDecision = {
    v: CONSENT_VERSION,
    analytics,
    ts: Math.floor(Date.now() / 1000),
  }

  document.cookie = [
    `${CONSENT_COOKIE_NAME}=${serializeConsent(decision)}`,
    'Path=/',
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    'Secure',
  ].join('; ')

  return decision
}
