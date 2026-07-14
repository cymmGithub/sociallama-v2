'use client'

import cn from 'clsx'
import { ProgressText } from '@/components/effects/progress-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { whyThatWorks } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './why-that-works.module.css'

// Scrub each word from faint to full as the heading passes through the
// viewport. "WHY" fills to the ink text color; "THAT WORKS" reveals the
// grain-gradient clipped inside the letters (why-manifesto-gradient) — the
// gradient image lives on the ProgressText wrapper so it runs continuously
// across words and line wraps, and each non-WHY word goes transparent-fill
// to expose it. Opacity carries the fill-in reading for both.
function fill(node: HTMLSpanElement, active: boolean) {
  if (node.textContent === 'WHY') {
    node.style.color = 'var(--color-secondary)'
  } else {
    node.classList.add(s.gradientWord ?? '')
  }
  node.style.opacity = active ? '1' : '0.2'
}

export function WhyThatWorks() {
  const bottomRef = useReveal<HTMLDivElement>()

  return (
    <section className={s.section} id="o-nas">
      <h2 className={s.heading}>
        <ProgressText
          className={s.headingFill ?? ''}
          start="top bottom"
          end="center center"
          onChange={fill}
        >
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
        <div data-reveal-item className={s.media}>
          <Image
            src="/assets/why-team.jpg"
            alt="Zespół agencji Social Lama"
            fill
            objectFit="cover"
            mobileSize="100vw"
            desktopSize="45vw"
          />
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
