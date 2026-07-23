import type { Metadata } from 'next'
import { ContactForm } from '@/app/(frontend)/kontakt/contact-form'
import { ContactHero } from '@/app/(frontend)/kontakt/contact-hero'
import { ContactMetrics } from '@/app/(frontend)/kontakt/contact-metrics'
import { ContactSteps } from '@/app/(frontend)/kontakt/contact-steps'
import { DarkChrome } from '@/app/(frontend)/kontakt/dark-chrome'
import s from '@/app/(frontend)/kontakt/kontakt.module.css'
import { Wrapper } from '@/components/layout/wrapper'
import { BrandBelt } from '@/components/ui/brand-belt'
import * as en from '@/lib/content/contact.en'
import { clients } from '@/lib/content/home.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { contactMarqueeOutlinePaths } from '@/lib/wordmark-paths'

export const metadata: Metadata = {
  title: en.contactMeta.title,
  description: en.contactMeta.description,
  alternates: alternatesForPath('/en/contact'),
}

export default function EnContactPage() {
  // English contact page: the Polish dark-canvas composition fed English content;
  // the form posts with locale="en" so the server action returns English
  // validation, toasts, and lead-email labels (design D7).
  return (
    <Wrapper theme="plum-deep">
      <div className={s.page}>
        <DarkChrome />
        <ContactHero
          meta={en.contactMeta}
          marquee={en.contactMarquee}
          lede={en.contactLede}
          outlinePath={contactMarqueeOutlinePaths.en}
        />
        <div className={s.formSection}>
          <ContactForm
            form={en.contactForm}
            services={en.contactServices}
            locale="en"
          />
        </div>
        <ContactSteps head={en.contactStepsHead} steps={en.contactSteps} />
        <div className={s.brands} data-blur-edge-gate>
          <BrandBelt
            logos={clients.map((client) => ({
              name: client.name,
              src: client.logo,
            }))}
          />
        </div>
        <ContactMetrics
          head={en.contactMetricsHead}
          metrics={en.contactMetrics}
        />
      </div>
    </Wrapper>
  )
}
