import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { socials } from '@/lib/content/home'
import { oNasHero } from '@/lib/content/o-nas'
import s from './hero.module.css'

/*
 * /o-nas hero — aligned to the homepage hero (user decision 2026-07-20): solid
 * plum ground (the plum theme primary, no gradient), the same display type
 * scale (small white line above a huge contrast/orange line), and the same
 * outline-circle social row — reusing the shared `socials` source + mask-image
 * recipe as the homepage and footer. The llama cutout bleeds to the band's
 * bottom-right edge in place of the homepage's scrubbed clip.
 */
export function OnasHero() {
  return (
    <section className={s.hero} data-theme="plum" data-onas-section="hero">
      <div className={s.inner}>
        <div className={s.copy}>
          <h1 className={s.headline}>
            <span className={s.lineSmall}>{oNasHero.kicker}</span>
            <span className={s.lineBig}>{oNasHero.heading}</span>
          </h1>

          <ul className={s.socials}>
            {socials.map((social) => (
              <li key={social.label}>
                <Link
                  className={s.social}
                  href={social.href}
                  aria-label={social.label}
                >
                  <span
                    aria-hidden="true"
                    className={s.socialIcon}
                    style={{
                      maskImage: `url(${social.icon})`,
                      WebkitMaskImage: `url(${social.icon})`,
                    }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.llama}>
          <Image
            className={s.llamaImg}
            src="/o-nas/hero-llama.png"
            alt="Lama Social Lamy w beżowym płaszczu, machająca do kamery"
            fill
            objectFit="contain"
            desktopSize="45vw"
            mobileSize="72vw"
            preload
          />
        </div>
      </div>
    </section>
  )
}
