'use client'

import type { LocalizedHome } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './faq.module.css'

/**
 * Homepage FAQ — a numbered hairline ledger, one row per question.
 *
 * Built on native <details>/<summary> rather than components/ui/accordion
 * (design.md Decision 1): <details> renders its contents into the served HTML
 * whether open or closed, so every answer is retrievable by crawlers and answer
 * engines without JavaScript. That property is the entire point of the section,
 * so it is not traded for a client-side primitive — which is also unused
 * everywhere else in the app.
 *
 * No `name` attribute on the rows: they open independently (Decision 4).
 * Grouping them would auto-close a row above the one being opened and yank the
 * page under the reader's cursor.
 */
export function Faq({ content }: { content: LocalizedHome['faq'] }) {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className={s.section} aria-label={content.ariaLabel}>
      <div className={s.head}>
        <p className={s.eyebrow}>{content.eyebrow}</p>
        <h2 className={s.heading}>
          {content.heading.map((line) => (
            <span key={line} className={s.headingLine}>
              {line}
            </span>
          ))}
        </h2>
      </div>

      <div data-reveal-item className={s.list}>
        {content.items.map((item, index) => (
          // Row 01 ships open — the price answer, the most-wanted one, and it
          // stops the section reading as a wall of unexplained headings.
          <details key={item.question} className={s.item} open={index === 0}>
            <summary className={s.summary}>
              <span className={s.number}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={s.question}>{item.question}</span>
              <span aria-hidden="true" className={s.sign} />
            </summary>
            <p className={s.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
