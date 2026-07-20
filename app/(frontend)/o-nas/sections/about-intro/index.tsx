'use client'

import cn from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { oNasAbout } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './about-intro.module.css'

/*
 * About-intro band ("COŚ O LAMIE") — cream chapter of /o-nas.
 *
 * Two columns: a framed illustration (left) and the agency statement (right).
 * The illustration asset is not in yet, so the left cell renders a 1:1
 * placeholder box carrying `data-onas-img="cos-o-lamie"` — swap the whole box
 * for the real PNG later.
 *
 * data-theme="cream" is required, not decorative: the page mounts inside
 * <Wrapper theme="plum">, so without it --color-secondary would resolve to
 * cream and the ink copy would disappear on the cream band.
 *
 * Entrance uses the shared reveal primitive: the ref goes on the section, and
 * the figure/heading/body/CTA carry data-reveal-item to stagger in.
 */
export function AboutIntro() {
  const revealRef = useReveal<HTMLElement>()

  return (
    <section
      ref={revealRef}
      data-theme="cream"
      data-onas-section="about-intro"
      data-reveal-style="wipe"
      className={s.section}
    >
      <div className={s.inner}>
        <div data-reveal-item className={s.figure}>
          <Image
            className={s.illustration}
            src="/o-nas/cos-o-lamie.png"
            alt="Ilustracja stadka lam Social Lamy w drewnianej ramce"
            aspectRatio={749 / 802}
            block
            desktopSize="40vw"
            mobileSize="80vw"
          />
        </div>

        <div className={s.copy}>
          <h2 data-reveal-item className={s.heading}>
            <span className={s.lead}>{oNasAbout.headingLead}</span>
            <span className={cn('h2', s.rest)}>{oNasAbout.headingRest}</span>
          </h2>

          <p data-reveal-item className={s.body}>
            {oNasAbout.body}
          </p>

          <div data-reveal-item className={s.ctaRow}>
            <Link className={s.cta} href={oNasAbout.cta.href}>
              <span className={s.ctaLabel}>{oNasAbout.cta.label}</span>
              <ArrowUpRight className={s.ctaIcon} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
