import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { BrandBelt } from '@/components/ui/brand-belt'
import { contactMeta } from '@/lib/content/contact'
import { clients } from '@/lib/content/home'
import { ContactForm } from './contact-form'
import { ContactHero } from './contact-hero'
import { ContactMetrics } from './contact-metrics'
import { DarkChrome } from './dark-chrome'
import s from './kontakt.module.css'

/*
 * Contact page (add-contact-page). Dark-canvas contact page served at /kontakt
 * — the header CTA target and the legacy WP /kontakt URL both resolve here.
 * Renders inside <Wrapper theme="plum-deep"> (cream-on-dark chrome + Lenis for
 * the marquee's scroll-velocity coupling); the near-black ground and orange
 * accent band are painted by the scoped kontakt.module.css.
 */

export const metadata: Metadata = {
  title: contactMeta.title,
  description: contactMeta.description,
  alternates: { canonical: '/kontakt' },
}

export default function ContactPage() {
  return (
    <Wrapper theme="plum-deep">
      <div className={s.page}>
        <DarkChrome />
        <ContactHero />
        <div className={s.formSection}>
          <ContactForm />
        </div>
        {/* Brand marquee between the form and the numbers (user decision
            2026-07-17) — a plain scrolling logo belt, dark variant. The gate
            keeps the belt from being frosted by the viewport-bottom BlurEdge
            while it's on screen (see components/layout/blur-edge). */}
        <div className={s.brands} data-blur-edge-gate>
          <BrandBelt
            logos={clients.map((client) => ({
              name: client.name,
              src: client.logo,
            }))}
          />
        </div>
        <ContactMetrics />
      </div>
    </Wrapper>
  )
}
