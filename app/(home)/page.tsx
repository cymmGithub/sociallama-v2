import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { Chapters } from './chapters'
import { BigMarquee } from './sections/big-marquee'
import { ClientLogos } from './sections/client-logos'
import { Hero } from './sections/hero'
import { HeroTrack } from './sections/hero/track'
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
        {/* Chapter 1 — plum. Hero + logo belt pin as one viewport-height
            column inside a tall scroll track while the hero clip scrubs
            (hero-scroll-scrub). On mobile and reduced motion the track
            collapses to a single viewport. On short viewports the column
            grows past 100svh (hero keeps its min-height floor) and the belt
            drops below the fold. */}
        <HeroTrack>
          <Hero />
          <ClientLogos />
        </HeroTrack>
        {/* Chapter 2 — cream */}
        {/* biome-ignore lint/complexity/noUselessFragments: load-bearing — each fragment groups its sections into a single Chapters child (children[index] maps to a chapter) */}
        <>
          <WhyThatWorks />
          <Services />
          <HowItWorks />
          <BigMarquee />
        </>
        {/* Chapter 3 — plum-deep */}
        {/* biome-ignore lint/complexity/noUselessFragments: load-bearing — each fragment groups its sections into a single Chapters child (children[index] maps to a chapter) */}
        <>
          <Testimonial />
          <JoinCta />
          <NewsLama />
        </>
      </Chapters>
    </Wrapper>
  )
}
