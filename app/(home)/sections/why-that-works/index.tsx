'use client'

import { ProgressText } from '@/components/effects/progress-text'
import { Link } from '@/components/ui/link'
import { whyThatWorks } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './why-that-works.module.css'

// Scrub each word from faint ink to full plum (the theme `contrast` token) as
// the heading passes through the viewport.
function fill(node: HTMLSpanElement, active: boolean) {
  node.style.color = active ? 'var(--color-contrast)' : 'var(--color-secondary)'
  node.style.opacity = active ? '1' : '0.2'
}

export function WhyThatWorks() {
  const copyRef = useReveal<HTMLDivElement>()

  return (
    <section className={s.section} id="o-nas">
      <h2 className={s.heading}>
        <ProgressText start="top bottom" end="center center" onChange={fill}>
          {whyThatWorks.heading.join(' ')}
        </ProgressText>
      </h2>

      <div ref={copyRef} className={s.copy}>
        <p data-reveal-item className={s.lead}>
          {whyThatWorks.lead}
        </p>
        {whyThatWorks.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} data-reveal-item className={s.para}>
            {paragraph}
          </p>
        ))}
        <span data-reveal-item>
          <Link className={s.link} href={whyThatWorks.link.href}>
            {whyThatWorks.link.label}
          </Link>
        </span>
      </div>
    </section>
  )
}
