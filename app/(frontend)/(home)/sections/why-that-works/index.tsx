'use client'

import cn from 'clsx'
import { ProgressText } from '@/components/effects/progress-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { whyThatWorks } from '@/lib/content/home'
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

// Team roster as a grid of medallion portraits. Order is not meaningful —
// portraits are decorative (the group label carries the meaning) — so this is
// just the filename list; adding or removing a member is a one-line edit.
const TEAM = [
  'avatar-01.webp',
  'avatar-02.webp',
  'avatar-03.webp',
  'avatar-04.webp',
  'avatar-05.webp',
  'avatar-06.webp',
  'avatar-07.webp',
  'avatar-08.webp',
  'avatar-09.webp',
  'avatar-10.webp',
  'avatar-11.webp',
  'Agnieszka-sl.webp',
] as const

// Credential cards sitting inline in the mosaic. Aspect ratios are the marks'
// intrinsic pixel ratios so the cards frame them without distortion; marks
// render unmodified (objectFit contain, no recolor or crop).
const CERTS = [
  {
    src: '/assets/certs/dimaq.png',
    alt: 'Certyfikat DIMAQ professional',
    ar: '347 / 143',
  },
  {
    src: '/assets/certs/meta.png',
    alt: 'Certyfikat Meta Small Business Academy',
    ar: '627 / 345',
  },
] as const

export function WhyThatWorks() {
  const bottomRef = useReveal<HTMLDivElement>()

  return (
    <section className={s.section} id="o-nas">
      <h2 className={s.heading}>
        <ProgressText start="top bottom" end="center center" onChange={fill}>
          {whyThatWorks.heading.join(' ')}
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
          {whyThatWorks.manifesto.strong}
        </ProgressText>{' '}
        <ProgressText
          className={cn(s.manifestoPart, s.muted)}
          start="top bottom"
          end="center center"
        >
          {whyThatWorks.manifesto.muted}
        </ProgressText>
      </p>

      {/* Claim → evidence → invitation: the manifesto states it, the team
          grid on the plum stage proves it, the closing copy + CTA invite. */}
      <div ref={bottomRef} className={s.bottom}>
        {/* Team grid mosaic on the shared plum grain stage (same recipe as the
            services and how-it-works panels). Twelve medallion portraits, then
            the two credentials as inline cream cards. Portraits are decorative
            (no name→photo mapping); the group label carries the meaning. */}
        <div
          data-reveal-item
          className={s.stage}
          role="group"
          aria-label="Zespół Social Lama"
        >
          <div className={s.mosaic}>
            {TEAM.map((file) => (
              <div key={file} className={s.tile}>
                <Image
                  src={`/assets/team/${file}`}
                  alt=""
                  fill
                  mobileSize="30vw"
                  desktopSize="16vw"
                />
              </div>
            ))}
            <span className={s.certLabel}>Certyfikaty</span>
            {CERTS.map((c) => (
              <div key={c.src} className={s.cert}>
                <div className={s.certMedia} style={{ '--ar': c.ar }}>
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    objectFit="contain"
                    mobileSize="45vw"
                    desktopSize="18vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.copy}>
          <p className={s.para}>
            <ProgressText
              className={s.manifestoPart ?? ''}
              start="top bottom"
              end="center center"
            >
              {whyThatWorks.support.strong}
            </ProgressText>{' '}
            <ProgressText
              className={cn(s.manifestoPart, s.muted)}
              start="top bottom"
              end="center center"
            >
              {whyThatWorks.support.muted}
            </ProgressText>
          </p>
          <span data-reveal-item>
            <Link className={s.link} href={whyThatWorks.link.href}>
              {whyThatWorks.link.label}
            </Link>
          </span>
        </div>
      </div>
    </section>
  )
}
