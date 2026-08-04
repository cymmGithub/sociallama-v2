import { Image } from '@/components/ui/image'
import { SocialLinks } from '@/components/ui/social-links'
import { type LocalizedONas, oNasHero } from '@/lib/content/o-nas'
import s from './hero.module.css'

/*
 * /o-nas hero — aligned to the homepage hero (user decision 2026-07-20): solid
 * plum ground (the plum theme primary, no gradient), the same display type
 * scale (small white line above a huge contrast/orange line), and the same
 * outline-circle social row — reusing the shared `SocialLinks` row as the
 * homepage and footer. The llama cutout bleeds to the band's
 * bottom-right edge in place of the homepage's scrubbed clip.
 */
export function OnasHero({
  content = oNasHero,
}: {
  content?: LocalizedONas['oNasHero']
}) {
  return (
    <section className={s.hero} data-theme="plum" data-onas-section="hero">
      <div className={s.inner}>
        <div className={s.copy}>
          <h1 className={s.headline}>
            <span className={s.lineSmall}>{content.kicker}</span>
            <span className={s.lineBig}>{content.heading}</span>
          </h1>

          <SocialLinks
            className={s.socials}
            linkClassName={s.social}
            iconClassName={s.socialIcon}
          />
        </div>

        <div className={s.llama}>
          <Image
            className={s.llamaImg}
            src="/o-nas/hero-llama.png"
            alt={content.llamaAlt}
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
