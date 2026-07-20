'use client'

import cn from 'clsx'
import { useEffect, useRef, useState } from 'react'
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

// Team roster as a grid of medallion portraits, in presentation order
// (leadership first). Each portrait reveals its name + role on hover (see
// .caption in the stylesheet); adding or removing a member is a one-line edit.
const TEAM = [
  { file: 'anna-ozga.webp', name: 'Ania Ozga', role: 'Head of Social Media' },
  { file: 'piotrek-zach.webp', name: 'Piotrek Zach', role: 'Project Manager' },
  {
    file: 'emilia-metryka.webp',
    name: 'Emilia Metryka',
    role: 'Social Media Manager',
  },
  {
    file: 'paulina-hildebrand.webp',
    name: 'Paulina Hildebrand',
    role: 'Social Media Manager',
  },
  {
    file: 'magda-rokicka.webp',
    name: 'Magda Rokicka',
    role: 'Social Media Manager',
  },
  {
    file: 'karolina-marcinowska.webp',
    name: 'Karolina Marcinowska',
    role: 'Wideo Content Creator',
  },
  {
    file: 'oliwia-witewska.webp',
    name: 'Oliwia Witewska',
    role: 'Social Media Specialist',
  },
  {
    file: 'martyna-borowik.webp',
    name: 'Martyna Borowik',
    role: 'Senior Social Media Specialist',
  },
  {
    file: 'kornelia-orlik.webp',
    name: 'Kornelia Orlik',
    role: 'Social Media Expert',
  },
  {
    file: 'katarzyna-kaptur.webp',
    name: 'Katarzyna Kaptur',
    role: 'Social Media Expert',
  },
  {
    file: 'agnieszka-klajbert.webp',
    name: 'Agnieszka Klajbert',
    role: 'Senior Social Media Specialist',
  },
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
  // Touch has no hover, so a tap toggles which portrait shows its caption
  // (pointer devices use :hover and ignore this). null = none open.
  const [active, setActive] = useState<string | null>(null)
  const facesRef = useRef<HTMLDivElement>(null)

  // Touch has no blur, so close the open portrait when a tap lands outside the
  // grid (tapping another face is handled by its own button).
  useEffect(() => {
    if (!active) return
    function handlePointerDown(event: PointerEvent) {
      if (!facesRef.current?.contains(event.target as Node)) {
        setActive(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [active])

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
            <div
              ref={facesRef}
              className={s.faces}
              data-active={active ? '' : undefined}
            >
              {TEAM.map((member) => {
                const isActive = active === member.file
                return (
                  <button
                    key={member.file}
                    type="button"
                    className={cn(s.tile, isActive && s.isActive)}
                    aria-pressed={isActive}
                    aria-label={`${member.name}, ${member.role}`}
                    onClick={() =>
                      setActive((cur) =>
                        cur === member.file ? null : member.file
                      )
                    }
                  >
                    <Image
                      src={`/assets/team/${member.file}`}
                      alt=""
                      fill
                      mobileSize="30vw"
                      desktopSize="16vw"
                    />
                    {/* Name + role, shown on hover (pointer) or when tapped
                        active (touch). aria-hidden: the button's aria-label
                        already carries the identity. */}
                    <div className={s.caption} aria-hidden="true">
                      <span className={s.captionName}>{member.name}</span>
                      <span className={s.captionRole}>{member.role}</span>
                    </div>
                  </button>
                )
              })}
            </div>
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
