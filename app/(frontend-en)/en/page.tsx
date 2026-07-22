import type { Metadata } from 'next'
import { Chapters } from '@/app/(frontend)/(home)/chapters'
import { BigMarquee } from '@/app/(frontend)/(home)/sections/big-marquee'
import { ClientLogos } from '@/app/(frontend)/(home)/sections/client-logos'
import { Hero } from '@/app/(frontend)/(home)/sections/hero'
import { HeroTrack } from '@/app/(frontend)/(home)/sections/hero/track'
import { HowItWorks } from '@/app/(frontend)/(home)/sections/how-it-works'
import { JoinCta } from '@/app/(frontend)/(home)/sections/join-cta'
import { Services } from '@/app/(frontend)/(home)/sections/services'
import { Testimonial } from '@/app/(frontend)/(home)/sections/testimonial'
import { WhyThatWorks } from '@/app/(frontend)/(home)/sections/why-that-works'
import { Wrapper } from '@/components/layout/wrapper'
import * as en from '@/lib/content/home.en'
import { APP_DESCRIPTION, OG_BASE } from '@/lib/content/site.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'

export const metadata: Metadata = {
  title: 'Strategy that works',
  description: APP_DESCRIPTION,
  alternates: alternatesForPath('/en'),
  openGraph: {
    title: 'Strategy that works',
    description:
      'Full-service brand management on social media: strategy, content, sales, creative, and video.',
    type: 'website',
    ...OG_BASE,
  },
}

export default function EnHomePage() {
  // English homepage: the Polish composition, fed English content, minus the
  // NewsLAMA section (blog stays Polish-only — the EN chrome omits it too).
  return (
    <Wrapper theme="plum">
      <Chapters>
        <HeroTrack>
          <Hero content={en.hero} />
          <ClientLogos
            clients={en.clients}
            heading={en.clientsHeading}
            cardCta={en.clientCardCta}
          />
        </HeroTrack>
        {/* biome-ignore lint/complexity/noUselessFragments: load-bearing — each fragment groups its sections into a single Chapters child (children[index] maps to a chapter) */}
        <>
          <WhyThatWorks content={en.whyThatWorks} />
          <Services content={en.services} />
          <HowItWorks content={en.howItWorks} />
          <BigMarquee />
        </>
        {/* biome-ignore lint/complexity/noUselessFragments: load-bearing — each fragment groups its sections into a single Chapters child (children[index] maps to a chapter) */}
        <>
          <Testimonial
            content={en.testimonials}
            labels={en.testimonialLabels}
          />
          <JoinCta content={en.joinCta} />
        </>
      </Chapters>
    </Wrapper>
  )
}
