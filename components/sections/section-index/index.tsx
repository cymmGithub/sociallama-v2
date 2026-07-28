'use client'

import { ArrowRight } from 'lucide-react'
import { Link } from '@/components/ui/link'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './index.module.css'

/*
 * Section index — the hub layout shared by `/uslugi` and `/branze` (design D2 /
 * O3: a simple card grid). Hero on flat plum followed by one card per item,
 * deriving links from the caller's canonical list. Imported by all four hub
 * routes (PL/EN × services/industries).
 */

/**
 * The chrome slice a hub needs. Structural rather than tied to one content
 * module, so any locale module whose `chrome` carries `sectionLabel` and an
 * `index` block can feed it.
 */
export interface SectionIndexChrome {
  sectionLabel: string
  index: {
    title: string
    intro: string
    cardCta: string
  }
}

/**
 * One card. `summary` is the generic body slot — a service summary or an
 * industry tagline.
 */
export interface SectionIndexItem {
  slug: string
  label: string
  summary: string
}

export interface SectionIndexProps {
  chrome: SectionIndexChrome
  items: readonly SectionIndexItem[]
  /** Locale-correct section base (`/uslugi`, `/en/services`, `/branze`, …). */
  base: string
}

export function SectionIndex({ chrome, items, base }: SectionIndexProps) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <>
      <section className={s.hero} data-theme="plum">
        <div className={s.heroInner}>
          <p className={s.breadcrumb}>{chrome.sectionLabel}</p>
          <h1 className={s.heroTitle}>
            {chrome.index.title}
            <span className={s.dot} aria-hidden="true">
              .
            </span>
          </h1>
          <p className={s.heroLead}>{chrome.index.intro}</p>
        </div>
      </section>

      <section className={s.grid} data-theme="cream">
        <div ref={ref} className={s.gridInner}>
          {items.map((item) => (
            <Link
              key={item.slug}
              data-reveal-item
              className={s.card}
              href={`${base}/${item.slug}`}
            >
              <span className={s.cardLabel}>{item.label}</span>
              <span className={s.cardSummary}>{item.summary}</span>
              <span className={s.cardCta}>
                {chrome.index.cardCta}
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
