import { Marquee } from '@/components/ui/marquee'
import { contactLede, contactMarquee, contactMeta } from '@/lib/content/contact'
import s from './kontakt.module.css'

/**
 * Marquee hero — the homepage BigMarquee treatment (orange fill over
 * outline-stroke, counter-scrolling), fed the contact copy, plus the `↳` lede.
 * Purely decorative marquee, so it is aria-hidden; the lede carries the meaning.
 */
export function ContactHero() {
  return (
    <>
      {/* The marquee is decorative (aria-hidden) — this names the page for AT
          and satisfies the single-h1 a11y gate. */}
      <h1 className="sr-only">{contactMeta.title}</h1>
      <section className={s.hero} aria-hidden="true">
        <Marquee className={s.row} repeat={3} speed={1.2}>
          <span className={s.fill}>
            {contactMarquee.fill}&nbsp;&nbsp;·&nbsp;&nbsp;
          </span>
        </Marquee>
        <Marquee className={s.row} repeat={3} speed={1.2} reversed>
          <span className={s.outline}>
            {contactMarquee.outline}&nbsp;&nbsp;·&nbsp;&nbsp;
          </span>
        </Marquee>
      </section>
      <div className={s.lede}>
        <span className={s.ledeArrow} aria-hidden="true">
          ↳
        </span>
        <p className={s.ledeText}>{contactLede}</p>
      </div>
    </>
  )
}
