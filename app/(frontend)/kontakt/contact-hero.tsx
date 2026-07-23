import { CornerDownRight } from 'lucide-react'
import { Marquee } from '@/components/ui/marquee'
import {
  contactLede as contactLedeDefault,
  contactMarquee as contactMarqueeDefault,
  contactMeta as contactMetaDefault,
  type LocalizedContact,
} from '@/lib/content/contact'
import { contactMarqueeOutlinePaths } from '@/lib/wordmark-paths'
import s from './kontakt.module.css'

/**
 * Marquee hero — the homepage BigMarquee treatment (orange fill over
 * outline-stroke, counter-scrolling), fed the contact copy, plus the lede.
 * Purely decorative marquee, so it is aria-hidden; the lede carries the meaning.
 */
export function ContactHero({
  meta = contactMetaDefault,
  marquee = contactMarqueeDefault,
  lede = contactLedeDefault,
  outlinePath = contactMarqueeOutlinePaths.pl,
}: {
  meta?: LocalizedContact['contactMeta']
  marquee?: LocalizedContact['contactMarquee']
  lede?: LocalizedContact['contactLede']
  /** Locale-correct merged-union path for the outline row (default PL). */
  outlinePath?: { viewBox: string; d: string }
}) {
  return (
    <>
      {/* The marquee is decorative (aria-hidden) — this names the page for AT
          and satisfies the single-h1 a11y gate. */}
      <h1 className="sr-only">{meta.title}</h1>
      <section className={s.hero} aria-hidden="true">
        <Marquee className={s.row} repeat={3} speed={1.2}>
          <span className={s.fill}>
            {marquee.fill}&nbsp;&nbsp;·&nbsp;&nbsp;
          </span>
        </Marquee>
        {/* Outline row is a single merged-union SVG (lib/wordmark-paths.ts) — the
            glyphs are boolean-unioned so tight tracking has no crossing/doubled
            strokes, matching the homepage marquee. The path bakes in the
            trailing "  ·  " separator so the tile repeats seamlessly. */}
        <Marquee className={s.row} repeat={3} speed={1.2} reversed>
          <svg
            className={s.outline}
            viewBox={outlinePath.viewBox}
            preserveAspectRatio="xMinYMid meet"
            aria-hidden="true"
          >
            <path d={outlinePath.d} vectorEffect="non-scaling-stroke" />
          </svg>
        </Marquee>
      </section>
      <div className={s.lede}>
        <CornerDownRight className={s.ledeArrow} aria-hidden="true" />
        <p className={s.ledeText}>
          {lede.text}
          <strong className={s.ledeCta}>{lede.cta}</strong>.
        </p>
      </div>
    </>
  )
}
