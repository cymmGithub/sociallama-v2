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

/** The bind the Polish orphan-word rule inserts; not a word change. */
const NBSP = '\u00A0'

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

  /* Compared with non-breaking spaces read as ordinary spaces: the Polish
     orphan-word rule binds a one-letter word to the next one, which changes how
     a sentence may wrap and not one word of what it says. Asserting the raw
     string would make this a whitespace test rather than the content-drift test
     it is meant to be. */
  test('the Polish step sentences are verbatim', () => {
    expect(
      plHowItWorks.steps.map((step) => step.title.replaceAll(NBSP, ' '))
    ).toEqual([
      'Warsztaty strategiczne z klientem',
      'Opracowanie strategii komunikacji oraz tworzenie treści',
      'Analiza wyników',
      'Raportowanie',
      'Proaktywność',
    ])
    expect(
      plHowItWorks.steps.map((step) => step.text.replaceAll(NBSP, ' '))
    ).toEqual([
      'Wspólnie analizujemy potrzeby biznesowe, cele, wyzwania oraz możliwości.',
      'Przekładamy ustalenia na plan działań w formie strategii komunikacji, a następnie realizujemy działania zgodnie z założoną strategią.',
      'Analizujemy wyniki i rekomendujemy wprowadzenie niezbędnych zmian.',
      'Opracowujemy raporty miesięczne oraz półroczne i roczne.',
      'Rekomendujemy nowe możliwości i rozwiązania.',
    ])
  })

  /* One headline, one supporting paragraph, one link — the budget is part of
     the spec, because the density this replaced is what got cut. Raised from 25
     to 40 words for the longer client-supplied copy (proaktywność and analiza
     panels run two sentences each). */
  test.each(
    LOCALES
  )('%s: supporting sentences stay inside budget', (_, content) => {
    for (const step of content.steps) {
      const say = step.proof.say
        .map((part) => (typeof part === 'string' ? part : part.figure))
        .join('')
      expect(say.trim().split(/\s+/).length).toBeLessThanOrEqual(40)
    }
  })

  /* With the exhibits removed (user decision, 2026-07-29) the figures in the
     copy are the whole of the evidence, and the deep link is the only route
     back to the client report that holds them — so it is load-bearing rather
     than decorative. Step 04 (raportowanie) addresses the reader, so it
     carries neither. */
  test.each(
    LOCALES
  )('%s: client evidence is named and linked', (_, content) => {
    for (const [index, step] of content.steps.entries()) {
      if (index === 3) {
        expect(step.proof.client).toBeUndefined()
        expect(step.proof.href).toBeUndefined()
      } else {
        expect(step.proof.client).toBeString()
        expect(step.proof.href).toBeString()
      }
    }
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

  /* The figure row is the panel's fill mechanism, so its shape is part of the
     spec rather than a styling detail: one figure reads as a stray number and
     four stop being scannable at the size that makes lifting them worthwhile. */
  test.each(
    LOCALES
  )('%s: every step carries two or three figures', (_, content) => {
    for (const step of content.steps) {
      expect(step.proof.stats.length).toBeGreaterThanOrEqual(2)
      expect(step.proof.stats.length).toBeLessThanOrEqual(3)
      for (const stat of step.proof.stats) {
        expect(stat.figure.trim()).not.toBe('')
        expect(stat.label.trim()).not.toBe('')
      }
    }
  })

  /* Same rule as the sentence's figures, and it bites harder here: the row's
     cells are ~1/3 of the panel, so a plain space is a likely wrap point. */
  test.each(LOCALES)('%s: row figures cannot wrap', (_, content) => {
    for (const step of content.steps) {
      for (const stat of step.proof.stats) {
        expect(`stat ${JSON.stringify(stat.figure)}`).not.toMatch(/\d ? \d/)
      }
    }
  })

  /* The row restates evidence and never adds any — but that rule is not worth
     asserting mechanically. Half the steps spell their figures as words in the
     copy the row draws from ("Dwa salony, trzy platformy"; "Seventeen months
     later"), so a digit-match check would be an exception list wearing a test's
     clothes. The constraint lives in `Step.proof.stats` and the capability
     spec, and is enforced by review. */

  test('both locales point at the same case-study sections', () => {
    expect(enHowItWorks.steps.map((step) => step.proof.href)).toEqual(
      plHowItWorks.steps.map((step) => step.proof.href)
    )
  })
})
