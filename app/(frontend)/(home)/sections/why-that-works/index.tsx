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

// Scatter placement for the team stage stickers: percentages of the media
// box, per-item tilt within ±6°, visible size variance (13–17% widths), a
// loose two-row cluster across the stage's upper two-thirds. Presentation,
// not content — tuned visually against desktop and ~343px mobile widths.
const TEAM_SCATTER = [
  { x: '3.5%', y: '13%', w: '15%', r: '-5deg' },
  { x: '21%', y: '8%', w: '13%', r: '4deg' },
  { x: '37%', y: '15%', w: '16%', r: '-3deg' },
  { x: '56%', y: '7%', w: '14%', r: '6deg' },
  { x: '73%', y: '14%', w: '15%', r: '-4deg' },
  { x: '8%', y: '37%', w: '14%', r: '5deg' },
  { x: '26%', y: '43%', w: '16%', r: '-6deg' },
  { x: '45%', y: '36%', w: '13%', r: '3deg' },
  { x: '61%', y: '44%', w: '15%', r: '-2deg' },
  { x: '79%', y: '38%', w: '14%', r: '5deg' },
] as const

// Credential chips along the stage bottom. Aspect ratios are the marks'
// intrinsic pixel ratios so the chips frame them without distortion.
const CERT_CHIPS = [
  {
    src: '/assets/certs/dimaq.png',
    alt: 'Certyfikat DIMAQ professional',
    ar: '347 / 143',
    r: '-2deg',
  },
  {
    src: '/assets/certs/meta.png',
    alt: 'Certyfikat Meta Small Business Academy',
    ar: '627 / 345',
    r: '3deg',
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

      {/* Supporting row: team photo left, remaining copy right. The paragraphs
          repeat the manifesto's two-tone treatment at reading scale. */}
      <div ref={bottomRef} className={s.bottom}>
        {/* Team stage: grain-gradient backdrop with scattered avatar stickers
            and credential chips. Individual portraits are decorative (no
            name→photo mapping); the group label carries the meaning. */}
        <div
          data-reveal-item
          className={s.media}
          role="group"
          aria-label="Zespół Social Lama"
        >
          {TEAM_SCATTER.map((p, i) => (
            <div
              key={p.x}
              className={s.avatar}
              style={{ '--x': p.x, '--y': p.y, '--w': p.w, '--r': p.r }}
            >
              <Image
                src={`/assets/team/avatar-${String(i + 1).padStart(2, '0')}.webp`}
                alt=""
                fill
                mobileSize="15vw"
                desktopSize="8vw"
              />
            </div>
          ))}
          <div className={s.chips}>
            {CERT_CHIPS.map((c) => (
              <div key={c.src} className={s.chip} style={{ '--r': c.r }}>
                <div className={s.chipMedia} style={{ '--ar': c.ar }}>
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    objectFit="contain"
                    mobileSize="30vw"
                    desktopSize="14vw"
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
