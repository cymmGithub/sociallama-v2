import { Marquee } from '@/components/ui/marquee'
import { marquee } from '@/lib/content/home'
import { marqueeOutlinePath } from '@/lib/wordmark-paths'
import s from './big-marquee.module.css'

const [line1] = marquee

export function BigMarquee() {
  return (
    <section className={s.section} aria-hidden="true">
      <Marquee className={s.row} repeat={3} speed={1.2}>
        <span className={s.fill}>{line1}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      </Marquee>
      {/* Outline row is a single merged-outline SVG (glyphs boolean-unioned in
          lib/scripts/gen-wordmark.py). Stroking one merged silhouette avoids the
          crossing/doubled strokes that plain outlined text showed at this tight
          tracking. The tile's viewBox width includes the trailing "  ·  " so the
          Marquee repeats it seamlessly. */}
      <Marquee className={s.row} repeat={3} speed={1.2} reversed>
        <svg
          className={s.outline}
          viewBox={marqueeOutlinePath.viewBox}
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true"
        >
          <path d={marqueeOutlinePath.d} vectorEffect="non-scaling-stroke" />
        </svg>
      </Marquee>
    </section>
  )
}
