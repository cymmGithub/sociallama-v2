import type { Locale } from '@/lib/i18n/slug-map'
import { splitValue } from '@/lib/payload/case-study-scoreboard'
import { CountUp } from './[slug]/count-up'

/**
 * One metric value, set as a numeral with its parenthetical on a second line.
 *
 * Four surfaces show a value — the scoreboard, the results ledger, the hub
 * card and the hub's ledger row — and all four hit the same problem:
 * `432 616 (+1 380%)` is two facts in one string, and set as one it either
 * wraps mid-value or shrinks the numeral to fit the delta.
 *
 * Split, the visible parts become presentational and the full stored string
 * is restored as the metric's accessible name. That is why the two visible
 * spans are `aria-hidden` and a `sr-only` copy carries the original: a screen
 * reader that heard "432 616" then "+1 380%" as separate strings would be
 * hearing something the page does not say, and the animated numeral is not
 * worth announcing either way.
 *
 * A value with no parenthetical takes none of that machinery — it is one
 * span, announced as itself.
 */
export function MetricValue({
  value,
  locale,
  animate = false,
  className,
  noteClassName,
}: {
  value: string
  locale: Locale
  /** Count up from zero the first time it scrolls into view (detail page). */
  animate?: boolean
  /** The numeral's own typography; also the wrapper for the two lines. */
  className: string | undefined
  /** The secondary line. Its colour is per-surface — the plum stage and the
   *  cream ledger do not share an accent — so the caller names it. */
  noteClassName?: string | undefined
}) {
  const { numeral, note } = splitValue(value)

  return (
    <>
      <span className={className} {...(note ? { 'aria-hidden': true } : {})}>
        {animate ? (
          <CountUp className={undefined} value={numeral} locale={locale} />
        ) : (
          numeral
        )}
        {note && <span className={noteClassName}>{note}</span>}
      </span>
      {note && <span className="sr-only">{value}</span>}
    </>
  )
}
