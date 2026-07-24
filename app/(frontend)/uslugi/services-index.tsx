'use client'

import { ArrowRight } from 'lucide-react'
import { Link } from '@/components/ui/link'
import type { LocalizedUslugi, Service } from '@/lib/content/uslugi'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './index.module.css'

/*
 * `/uslugi` index (design D2 / O3: a simple six-card grid). Hero on flat plum
 * followed by one card per service, deriving links from the canonical list.
 * Imported by the PL (`/uslugi`) and EN (`/en/services`) routes.
 */

type Chrome = LocalizedUslugi['chrome']

export interface ServicesIndexProps {
  chrome: Chrome
  services: readonly Pick<Service, 'slug' | 'label' | 'summary'>[]
  /** Locale-correct service base (`/uslugi` or `/en/services`). */
  base: string
}

export function ServicesIndex({ chrome, services, base }: ServicesIndexProps) {
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
          {services.map((service) => (
            <Link
              key={service.slug}
              data-reveal-item
              className={s.card}
              href={`${base}/${service.slug}`}
            >
              <span className={s.cardLabel}>{service.label}</span>
              <span className={s.cardSummary}>{service.summary}</span>
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
