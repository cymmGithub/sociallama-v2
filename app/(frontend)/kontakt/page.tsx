import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { BrandBelt } from '@/components/ui/brand-belt'
import { CLIENT_ROSTER } from '@/lib/content/clients'
import { contactMeta } from '@/lib/content/contact'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { ContactForm } from './contact-form'
import { ContactHero } from './contact-hero'
import { ContactMetrics } from './contact-metrics'
import { ContactSteps } from './contact-steps'
import { DarkChrome } from './dark-chrome'
import s from './kontakt.module.css'

/*
 * Contact page (add-contact-page). Dark-canvas contact page served at /kontakt
 * — the header CTA target and the legacy WP /kontakt URL both resolve here.
 * Renders inside <Wrapper theme="plum-deep"> (cream-on-dark chrome + smooth
 * scrolling); the near-black ground and orange accent band are painted by the
 * scoped kontakt.module.css.
 */

export const metadata: Metadata = {
  title: contactMeta.title,
  description: contactMeta.description,
  alternates: alternatesForPath('/kontakt'),
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
        <ContactSteps />
        {/* Brand marquee between the form and the numbers (user decision
            2026-07-17) — a plain scrolling logo belt, dark variant. */}
        <div className={s.brands}>
          <BrandBelt
            logos={CLIENT_ROSTER.map((client) => ({
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
