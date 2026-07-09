import { Marquee } from '@/components/ui/marquee'
import { marquee } from '@/lib/content/home'
import s from './big-marquee.module.css'

const [line1, line2] = marquee

export function BigMarquee() {
  return (
    <section className={s.section} aria-hidden="true">
      <Marquee className={s.row} repeat={3} speed={1.2}>
        <span className={s.fill}>{line1}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      </Marquee>
      <Marquee className={s.row} repeat={3} speed={1.2} reversed>
        <span className={s.outline}>{line2}&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      </Marquee>
    </section>
  )
}
