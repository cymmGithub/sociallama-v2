'use client'

import cn from 'clsx'
import { oNasValues } from '@/lib/content/o-nas'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './values-grid.module.css'

/*
 * VALUES band (orange chapter). A 3-column grid of the seven oNasValues.items
 * arranged around the central "THAT WORKS / WITH SOCIAL LAMA" wordmark, per the
 * mock:
 *   left   = Partnerstwo · Eksperckość · Kompleksowość    (items 0, 3, 5)
 *   center = Proaktywne · [wordmark]                       (item 1)
 *   right  = Skupienie · Indywidualne · Transparentność    (items 2, 4, 6)
 *
 * Solid orange with ink text (brand tokens, not theme tokens). Entrance is the
 * useReveal primitive (each value block + the wordmark carries data-reveal-item).
 */

const { center, items } = oNasValues

const leftItems = [items[0], items[3], items[5]]
const rightItems = [items[2], items[4], items[6]]
const centerTop = items[1]

const words = [...center.lead.split(' '), ...center.rest.split(' ')]

type ValueContent = { title: string; body: string }

function Value({ title, body }: ValueContent) {
  return (
    <div data-reveal-item className={s.value}>
      <h3 className={s.valueTitle}>{title}</h3>
      <p className={s.valueBody}>{body}</p>
    </div>
  )
}

export function ValuesGrid() {
  const gridRef = useReveal<HTMLDivElement>()

  return (
    <section className={s.section} data-onas-section="values-grid">
      <div ref={gridRef} data-reveal-style="wipe" className={s.grid}>
        {/* Left column */}
        <div className={s.col}>
          {leftItems.map((item) => (
            <Value key={item.title} {...item} />
          ))}
        </div>

        {/* Center column: value + wordmark */}
        <div className={cn(s.col, s.colCenter)}>
          <Value {...centerTop} />

          <div className={s.wordmark}>
            {words.map((word) => (
              <span key={word} data-reveal-item className={s.wordLine}>
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className={s.col}>
          {rightItems.map((item) => (
            <Value key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
