'use client'

import { Image } from '@/components/ui/image'
import { oNasGoodOne } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './good-one.module.css'

/*
 * "JESTEŚMY CZĘŚCIĄ GOOD ONE" band (/o-nas). Cream band, two columns: the Good
 * One group wheel on the left, the intro copy on the right.
 *
 * The wheel is a SINGLE finished PNG (it already carries every logo, label,
 * spoke, and the center mark), so nothing radial is rebuilt in code here — the
 * left cell is just one image slot (data-onas-img="good-one-wheel"), rendered
 * as a subtle 1:1 placeholder until the asset is dropped in.
 *
 * data-theme="cream" resolves ink text + plum contrast against the explicit
 * cream ground (the section sits between two plum bands on the page).
 */
export function GoodOne() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section
      className={s.section}
      data-theme="cream"
      data-onas-section="good-one"
    >
      <div ref={ref} data-reveal-style="wipe" className={s.inner}>
        <div data-reveal-item className={s.wheel}>
          <Image
            className={s.wheelImg}
            src="/o-nas/good-one-wheel.png"
            alt="Grupa Good One: Good One PR, SEOFLY, Folks, TymKor media, Diea i Social Lama"
            aspectRatio={971 / 831}
            block
            desktopSize="45vw"
            mobileSize="90vw"
            unoptimized
          />
        </div>

        <div data-reveal-item className={s.copy}>
          <p className={s.eyebrow}>{oNasGoodOne.heading}</p>
          <h2 className={`h2 ${s.title}`}>{oNasGoodOne.headingAccent}</h2>
          <p className={s.body}>{oNasGoodOne.body}</p>
        </div>
      </div>
    </section>
  )
}
