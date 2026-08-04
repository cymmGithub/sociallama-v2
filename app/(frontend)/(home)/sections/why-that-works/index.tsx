'use client'

import cn from 'clsx'
import { ArrowRight, ChevronsRight } from 'lucide-react'
import { ProgressText } from '@/components/effects/progress-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type { LocalizedHome } from '@/lib/content/home'
import type { TeamGridMember } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './why-that-works.module.css'

// Scrub each word from faint to full as the heading passes through the
// viewport. "WHY" fills to the ink text color; "THAT WORKS" fills to flat
// orange. Opacity carries the fill-in reading for both.
function fill(node: HTMLSpanElement, active: boolean) {
  if (node.textContent === 'WHY') {
    node.style.color = 'var(--color-secondary)'
  } else {
    node.style.color = 'var(--color-orange)'
  }
  node.style.opacity = active ? '1' : '0.2'
}

// Credential cards sitting inline in the mosaic. Aspect ratios are the marks'
// intrinsic pixel ratios so the cards frame them without distortion; marks
// render unmodified (objectFit contain, no recolor or crop).
const CERTS = [
  { id: 'dimaq', src: '/assets/certs/dimaq.png', ar: '347 / 143' },
  { id: 'meta', src: '/assets/certs/meta.png', ar: '627 / 345' },
] as const

export function WhyThatWorks({
  content,
  team,
}: {
  content: LocalizedHome['whyThatWorks']
  /** Grid roster projected from the /o-nas slider (`oNasTeamGrid`) — one
   *  member list, one client-curated order, two surfaces. */
  team: readonly TeamGridMember[]
}) {
  const bottomRef = useReveal<HTMLDivElement>()

  return (
    <section className={s.section} id="o-nas">
      <h2 className={s.heading}>
        <ProgressText start="top bottom" end="center center" onChange={fill}>
          {content.heading.join(' ')}
        </ProgressText>
      </h2>

      {/* Manifesto statement at display scale (Azurio treatment): bold ink
          opening flowing into a muted gray closer, one paragraph, words
          developing from faint to full with scroll. */}
      <p className={s.manifesto}>
        <ProgressText
          className={s.manifestoPart ?? ''}
          start="top bottom"
          end="center center"
        >
          {content.manifesto.strong}
        </ProgressText>{' '}
        <ProgressText
          className={cn(s.manifestoPart, s.muted)}
          start="top bottom"
          end="center center"
        >
          {content.manifesto.muted}
        </ProgressText>
      </p>

      {/* Claim → evidence → invitation: the manifesto states it, the team
          grid proves it, the closing copy + CTA invite. */}
      <div ref={bottomRef} className={s.bottom}>
        {/* Team grid straight on the sand ground. Each tile fills its
            gradient container with the member's transparent head+torso cutout
            (shared with the /o-nas slider) and a standing name + role label. */}
        <div
          data-reveal-item
          className={s.stage}
          role="group"
          aria-label={content.teamLabel}
        >
          <ul className={s.faces}>
            {team.map((member) => {
              const cutout = (
                <Image
                  src={`/o-nas/slider/${member.cut}`}
                  alt=""
                  fill
                  objectFit="cover"
                  mobileSize="46vw"
                  desktopSize="22vw"
                />
              )
              return (
                <li key={member.cut} className={s.tile}>
                  {cutout}
                  <div className={s.caption}>
                    <span className={s.captionName}>{member.name}</span>
                    <span className={s.captionRole}>{member.role}</span>
                  </div>
                  {/* Deep link into the /o-nas slider, keyed by the cutout slug
                    the two surfaces share — never by index, so a reorder of
                    either surface can't break the link. The whole tile is the
                    target: an inset overlay rather than a wrapper around the
                    caption, so the caption keeps its own layout and the link's
                    accessible name stays the member, not the tile's text. */}
                  <Link
                    className={s.tileLink}
                    href={`${content.memberLink.hrefBase}?lama=${member.cut.replace('.png', '')}#zespol`}
                    aria-label={`${content.memberLink.label}: ${member.name}`}
                  >
                    <ArrowRight className={s.tileArrow} aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
            {/* CTA tile closing the desktop grid's rectangle (16th cell of
                4x4) and ending the mobile rail. Same tile shell as the
                members, copy instead of a cutout; the arrow is part of the
                label, so unlike the member tiles' hover-only affordance it
                stays visible on touch. */}
            <li className={cn(s.tile, s.moreTile)}>
              <Link
                className={s.moreLink}
                href={`${content.memberLink.hrefBase}${content.moreCard.anchor}`}
              >
                <span className={s.moreLabel}>{content.moreCard.label}</span>
                <ArrowRight className={s.moreArrow} aria-hidden="true" />
              </Link>
            </li>
          </ul>
          {/* Swipe hint for the mobile rail (user decision 2026-08-04):
              passive chevrons below the tiles — outside them so they cannot
              read as a tappable control — that CSS fades out once the rail is
              actually swiped. Hidden on desktop with the grid presentation. */}
          <ChevronsRight className={s.railHint} aria-hidden="true" />
        </div>
        <div className={s.copy}>
          <p className={s.para}>
            <ProgressText
              className={s.manifestoPart ?? ''}
              start="top bottom"
              end="center center"
            >
              {content.support.strong}
            </ProgressText>{' '}
            <ProgressText
              className={cn(s.manifestoPart, s.muted)}
              start="top bottom"
              end="center center"
            >
              {content.support.muted}
            </ProgressText>
          </p>
          <span data-reveal-item>
            <Link className={s.link} href={content.link.href}>
              {content.link.label}
            </Link>
          </span>

          {/* Credentials sit under the CTA in the copy column — unmodified cert
              marks (trademark hygiene: objectFit contain, no recolor/crop). */}
          <div data-reveal-item className={s.certs}>
            <div className={s.certCards}>
              {CERTS.map((c) => (
                <div key={c.src} className={s.cert}>
                  <div className={s.certMedia} style={{ '--ar': c.ar }}>
                    <Image
                      src={c.src}
                      alt={content.certAlt[c.id]}
                      fill
                      objectFit="contain"
                      mobileSize="45vw"
                      desktopSize="18vw"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className={s.certsCaption}>{content.certsLabel}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
