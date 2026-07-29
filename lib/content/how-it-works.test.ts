import { describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { howItWorks as plHowItWorks } from './home'
import { howItWorks as enHowItWorks } from './home.en'

const ROOT = join(import.meta.dir, '..', '..')
const SECTION = join(
  ROOT,
  'app',
  '(frontend)',
  '(home)',
  'sections',
  'how-it-works'
)

const LOCALES = [
  ['pl', plHowItWorks],
  ['en', enHowItWorks],
] as const

/** Every string anywhere in a content tree, including accessible labels. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) allStrings(item, out)
  else if (value && typeof value === 'object')
    for (const item of Object.values(value)) allStrings(item, out)
  return out
}

/*
 * Nothing in this section may be dated: absolute dates age the page the moment
 * it is read, and the source decks are already older than the current year, so
 * an accurate date would also read as stale. Elapsed time is a duration.
 *
 * This is enforced mechanically because it is exactly the kind of rule that
 * leaks — during the mock build it caught a screen-reader label and a footer
 * credit that a read-through had missed.
 */
const YEAR = /\b(?:19|20)\d{2}\b/
const NUMERIC_DATE = /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/

/* Polish months decline, and JavaScript's `\b` is ASCII-only — it does not fire
   after `ń`, so `styczeń\b` silently never matches. Boundaries are therefore
   explicit letter lookarounds. Stems stay narrow on purpose: a loose `mar\w*`
   would flag "marka", which is all over this content. */
const L = 'a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ'
const PL_MONTHS = new RegExp(
  `(?<![${L}])(?:stycz(?:eń|nia|niu)|lut(?:y|ego|ym)|marzec|marc(?:a|u)|kwiecień|kwietni(?:a|u)|maj(?:a|u)?|czerwiec|czerwc(?:a|u)|lipiec|lipc(?:a|u)|sierp(?:ień|nia|niu)|wrze(?:sień|śnia|śniu)|paździer(?:nik|nika|niku)|listopad(?:a|zie)?|grud(?:zień|nia|niu))(?![${L}])`,
  'i'
)

/* English "May" is a modal verb far more often than a month, so it counts only
   when it sits next to a number — everything else matches on the name alone. */
const EN_MONTHS =
  /\b(?:january|february|march|april|june|july|august|september|october|november|december)\b|\bmay\b(?=\s+\d)|\d\s+may\b/i

function assertUndated(label: string, text: string) {
  expect(`${label}: ${text}`).not.toMatch(YEAR)
  expect(`${label}: ${text}`).not.toMatch(NUMERIC_DATE)
  expect(`${label}: ${text}`).not.toMatch(PL_MONTHS)
  expect(`${label}: ${text}`).not.toMatch(EN_MONTHS)
}

describe('how-it-works proof content', () => {
  test.each(LOCALES)('%s: nothing is dated', (locale, content) => {
    for (const text of allStrings(content)) assertUndated(locale, text)
  })

  /* The component carries no copy of its own (homepage spec), so a literal
     here would be both a content leak and a way around the check above. */
  test('the section component carries no dated string literals', () => {
    const source = readFileSync(join(SECTION, 'index.tsx'), 'utf8')
    const literals = source.match(/'[^'\n]*'|"[^"\n]*"/g) ?? []
    for (const literal of literals) {
      // Path segments and hex colors are not prose; only check real words.
      if (!/[a-ząćęłńóśźż]{3}/i.test(literal)) continue
      expect(`index.tsx ${literal}`).not.toMatch(NUMERIC_DATE)
      expect(`index.tsx ${literal}`).not.toMatch(PL_MONTHS)
    }
  })

  test.each(
    LOCALES
  )('%s: the five step sentences are untouched', (_, content) => {
    expect(content.steps).toHaveLength(5)
    expect(content.steps.map((step) => step.number)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
    ])
  })

  test('the Polish step sentences are verbatim', () => {
    expect(plHowItWorks.steps.map((step) => step.text)).toEqual([
      'Określamy Twoje cele, potrzeby i możliwości podczas warsztatów strategicznych.',
      'Przygotowujemy indywidualną strategię i rozpoczynamy komunikację.',
      'Proaktywnie rekomendujemy nowe rozwiązania i możliwości.',
      'Analizujemy wyniki i wprowadzamy niezbędne zmiany.',
      'Raportujemy nasze działania.',
    ])
  })

  /* One headline, one sentence, one link — the budget is part of the spec,
     because the density this replaced is what got cut. */
  test.each(
    LOCALES
  )('%s: supporting sentences stay inside budget', (_, content) => {
    for (const step of content.steps) {
      const say = step.proof.say
        .map((part) => (typeof part === 'string' ? part : part.figure))
        .join('')
      expect(say.trim().split(/\s+/).length).toBeLessThanOrEqual(25)
    }
  })

  /* With the exhibits removed (user decision, 2026-07-29) the figures in the
     copy are the whole of the evidence, and the deep link is the only route
     back to the client report that holds them — so it is load-bearing rather
     than decorative. Step 05 addresses the reader, so it carries neither. */
  test.each(
    LOCALES
  )('%s: client evidence is named and linked', (_, content) => {
    for (const step of content.steps.slice(0, 4)) {
      expect(step.proof.client).toBeString()
      expect(step.proof.href).toBeString()
    }
    expect(content.steps[4]?.proof.client).toBeUndefined()
    expect(content.steps[4]?.proof.href).toBeUndefined()
  })

  test('every proof card wordmark exists', () => {
    for (const [, content] of LOCALES) {
      for (const step of content.steps) {
        if (!step.proof.client) continue
        const mark = `/case-studies/${step.proof.client}/${step.proof.client}-logo-mono.png`
        expect(existsSync(join(ROOT, 'public', mark))).toBe(true)
      }
    }
  })

  /* A grouped number split across two lines reads as two numbers. Figures are
     their own inline element inside a wrapping paragraph, so the group
     separator has to be non-breaking. */
  test.each(LOCALES)('%s: grouped numbers cannot wrap', (_, content) => {
    for (const step of content.steps) {
      for (const part of step.proof.say) {
        if (typeof part === 'string') continue
        if (!/\d/.test(part.figure)) continue
        expect(`figure ${JSON.stringify(part.figure)}`).not.toMatch(/\d ? \d/)
      }
      expect(`title ${step.proof.title}`).not.toMatch(/\d \d/)
    }
  })

  test('both locales point at the same case-study sections', () => {
    expect(enHowItWorks.steps.map((step) => step.proof.href)).toEqual(
      plHowItWorks.steps.map((step) => step.proof.href)
    )
  })
})
