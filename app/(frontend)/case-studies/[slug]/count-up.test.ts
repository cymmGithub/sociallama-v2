import { describe, expect, it } from 'bun:test'
import { parseValue } from './count-up'

/**
 * The count-up animation re-formats the metric each frame, so a parse that
 * loses precision silently changes the published figure once the tile scrolls
 * into view — the server-rendered value is correct, the settled one is not.
 *
 * `render` reproduces what CountUp shows at t=1 (the settled value). Every
 * case here asserts the settled value equals the authored string.
 */
function render(value: string, locale: 'pl' | 'en'): string | null {
  const parsed = parseValue(value, locale)
  if (!parsed) {
    return null
  }
  const format = new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-US', {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals,
  })
  // `pl-PL` groups with a non-breaking space (U+00A0) where the authored
  // strings use a plain one. That is correct Polish typography and predates
  // this component, so it is normalized away rather than asserted on.
  return `${parsed.prefix}${format.format(parsed.number)}${parsed.suffix}`.replace(
    / /g,
    ' '
  )
}

describe('parseValue — Polish values', () => {
  it('keeps a comma decimal and its precision', () => {
    expect(render('1,28 mln', 'pl')).toBe('1,28 mln')
    expect(render('4,38 mln', 'pl')).toBe('4,38 mln')
  })

  it('keeps space-grouped integers', () => {
    expect(render('788 753', 'pl')).toBe('788 753')
    expect(render('59 575', 'pl')).toBe('59 575')
  })

  it('keeps prefixes and unit suffixes', () => {
    expect(render('+7,9 tys.', 'pl')).toBe('+7,9 tys.')
    expect(render('306% rocznego KPI', 'pl')).toBe('306% rocznego KPI')
  })
})

describe('parseValue — English values', () => {
  // Each of these settled on a wrong figure before the locale fix: the decimal
  // count was derived from a comma, so a period decimal counted as zero places.
  it('keeps a period decimal and its precision', () => {
    expect(render('1.28M', 'en')).toBe('1.28M')
    expect(render('3.7M', 'en')).toBe('3.7M')
    expect(render('552.1k', 'en')).toBe('552.1k')
    expect(render('2.6M', 'en')).toBe('2.6M')
  })

  it('keeps comma-grouped integers', () => {
    expect(render('59,575', 'en')).toBe('59,575')
    expect(render('788,753', 'en')).toBe('788,753')
  })

  // Previously NaN: `.replace(',', '.')` replaced only the first comma, so
  // "1,280,673" parsed as Number("1.280,673").
  it('handles multi-group thousands without producing NaN', () => {
    expect(render('1,280,673', 'en')).toBe('1,280,673')
    expect(render('24,511%', 'en')).toBe('24,511%')
  })

  it('handles grouping and a decimal together', () => {
    expect(render('1,280.5', 'en')).toBe('1,280.5')
  })

  it('keeps prefixes and unit suffixes', () => {
    expect(render('+7.9k', 'en')).toBe('+7.9k')
    expect(render('20.58% (+7.98 pp)', 'en')).toBe('20.58% (+7.98 pp)')
    expect(render('306% of annual KPI', 'en')).toBe('306% of annual KPI')
  })
})

describe('parseValue — non-numeric input', () => {
  it('returns null so CountUp leaves the value untouched', () => {
    expect(parseValue('n/a', 'en')).toBeNull()
    expect(parseValue('', 'pl')).toBeNull()
  })
})
