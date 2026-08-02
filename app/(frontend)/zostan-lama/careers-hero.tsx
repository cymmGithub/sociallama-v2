import { CornerDownRight } from 'lucide-react'
import { Marquee } from '@/components/ui/marquee'
import {
  careersLede as careersLedeDefault,
  careersMarquee as careersMarqueeDefault,
  careersMeta as careersMetaDefault,
  type LocalizedCareers,
} from '@/lib/content/zostan-lama'
import { careersMarqueeOutlinePaths } from '@/lib/wordmark-paths'
import s from './zostan-lama.module.css'

/**
 * Marquee hero — the /kontakt treatment (orange fill over outline stroke,
 * counter-scrolling), fed the careers copy, plus the lede.
 *
 * The marquee is decorative and aria-hidden, so the `sr-only` h1 is what names
 * the page for assistive technology and satisfies the single-h1 gate. The lede
 * carries the meaning — and, unlike the page this replaces, it is legible: cream
 * at 84% on the near-black ground, not cream on cream.
 *
 * Motion: <Marquee/> animates on rAF via tempus at a constant speed; it
 * self-disables under `prefers-reduced-motion`, so the rows sit still rather
 * than needing a duplicate static branch here.
 */
export function CareersHero({
  meta = careersMetaDefault,
  marquee = careersMarqueeDefault,
  lede = careersLedeDefault,
  outlinePath = careersMarqueeOutlinePaths.pl,
}: {
  meta?: LocalizedCareers['careersMeta']
  marquee?: LocalizedCareers['careersMarquee']
  lede?: LocalizedCareers['careersLede']
  /** Locale-correct merged-union path for the outline row (default PL). */
  outlinePath?: { viewBox: string; d: string }
}) {
  return (
    <>
      <h1 className="sr-only">{meta.title}</h1>
      <section className={s.hero} aria-hidden="true">
        <Marquee className={s.row} repeat={3} speed={1.2}>
          <span className={s.fill}>
            {marquee.text}&nbsp;&nbsp;·&nbsp;&nbsp;
          </span>
        </Marquee>
        {/* Outline row is a single merged-union SVG (lib/wordmark-paths.ts):
            the glyphs are boolean-unioned so tight tracking has no crossing or
            doubled strokes. The path bakes in the trailing "  ·  " separator so
            the tile repeats seamlessly. */}
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
      <div className={s.inner}>
        <div className={s.lede}>
          <CornerDownRight className={s.ledeArrow} aria-hidden="true" />
          <p className={s.ledeText}>{lede.text}</p>
        </div>
      </div>
    </>
  )
}
