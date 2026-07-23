'use client'

import cn from 'clsx'
import { ProgressText } from '@/components/effects/progress-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { type LocalizedHome, whyThatWorks } from '@/lib/content/home'
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

// Team roster as a grid of full-bleed portrait tiles, in presentation order
// (leadership first). Each tile fills its gradient container with the member's
// transparent head+torso cutout (shared with the /o-nas slider) and carries a
// standing name + role label. Adding or removing a member is a one-line edit.
const TEAM = [
  {
    cut: 'anna-ozga.png',
    name: 'Ania Ozga',
    role: 'Head of Social Media',
  },
  {
    cut: 'martyna-borowik.png',
    name: 'Martyna Borowik',
    role: 'Senior Social Media Specialist',
  },
  {
    cut: 'agnieszka-klajbert.png',
    name: 'Agnieszka Klajbert',
    role: 'Senior Social Media Specialist',
  },
  {
    cut: 'piotr-zach.png',
    name: 'Piotrek Zach',
    role: 'Project Manager',
  },
  {
    cut: 'emilia-metryka.png',
    name: 'Emilia Metryka',
    role: 'Social Media Manager',
  },
  {
    cut: 'paulina-hildebrand.png',
    name: 'Paulina Hildebrand',
    role: 'Social Media Manager',
  },
  {
    cut: 'magda-rokicka.png',
    name: 'Magda Rokicka',
    role: 'Social Media Manager',
  },
  {
    cut: 'kornelia-orlik.png',
    name: 'Kornelia Orlik',
    role: 'Social Media Expert',
  },
  {
    cut: 'katarzyna-kaptur.png',
    name: 'Katarzyna Kaptur',
    role: 'Social Media Expert',
  },
  {
    cut: 'oliwia-witewska.png',
    name: 'Oliwia Witewska',
    role: 'Social Media Specialist',
  },
  {
    cut: 'karolina-marcinowska.png',
    name: 'Karolina Marcinowska',
    role: 'Wideo Content Creator',
  },
  {
    cut: 'przemyslaw-swiercz.png',
    name: 'Przemysław Świercz',
    role: 'Fullstack Developer',
  },
] as const

// Credential cards sitting inline in the mosaic. Aspect ratios are the marks'
// intrinsic pixel ratios so the cards frame them without distortion; marks
// render unmodified (objectFit contain, no recolor or crop).
const CERTS = [
  { id: 'dimaq', src: '/assets/certs/dimaq.png', ar: '347 / 143' },
  { id: 'meta', src: '/assets/certs/meta.png', ar: '627 / 345' },
] as const

export function WhyThatWorks({
  content = whyThatWorks,
}: {
  content?: LocalizedHome['whyThatWorks']
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
          grid on the plum stage proves it, the closing copy + CTA invite. */}
      <div ref={bottomRef} className={s.bottom}>
        {/* Team grid on the shared plum grain stage. Each tile fills its
            gradient container with the member's transparent head+torso cutout
            (shared with the /o-nas slider) and a standing name + role label. */}
        <div
          data-reveal-item
          className={s.stage}
          role="group"
          aria-label={content.teamLabel}
        >
          <ul className={s.faces}>
            {TEAM.map((member) => (
              <li key={member.cut} className={s.tile}>
                <Image
                  src={`/o-nas/slider/${member.cut}`}
                  alt=""
                  fill
                  objectFit="cover"
                  mobileSize="46vw"
                  desktopSize="22vw"
                />
                <div className={s.caption}>
                  <span className={s.captionName}>{member.name}</span>
                  <span className={s.captionRole}>{member.role}</span>
                </div>
              </li>
            ))}
          </ul>
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
          </div>
        </div>
      </div>
    </section>
  )
}
