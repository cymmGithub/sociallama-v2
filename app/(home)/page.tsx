import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { Chapters } from './chapters'
import { BigMarquee } from './sections/big-marquee'
import { ClientLogos } from './sections/client-logos'
import { Hero } from './sections/hero'
import { HowItWorks } from './sections/how-it-works'
import { JoinCta } from './sections/join-cta'
import { NewsLama } from './sections/news-lama'
import { Services } from './sections/services'
import { Testimonial } from './sections/testimonial'
import { WhyThatWorks } from './sections/why-that-works'

export const metadata: Metadata = {
  title: 'Social Lama — Strategy that works',
  description:
    'Agencja social media. Kompleksowa obsługa marek w mediach społecznościowych: strategia, content, sprzedaż, kreacje i wideo.',
  openGraph: {
    title: 'Social Lama — Strategy that works',
    description:
      'Kompleksowa obsługa marek w social mediach: strategia, content, sprzedaż, kreacje i wideo.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <Wrapper theme="plum">
      <Chapters>
        {/* Chapter 1 — plum */}
        <>
          <Hero />
          <ClientLogos />
        </>
        {/* Chapter 2 — cream */}
        <>
          <WhyThatWorks />
          <Services />
          <HowItWorks />
          <BigMarquee />
        </>
        {/* Chapter 3 — plum-deep */}
        <>
          <Testimonial />
          <JoinCta />
          <NewsLama />
        </>
      </Chapters>
    </Wrapper>
  )
}
