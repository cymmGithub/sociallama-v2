import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import {
  getLatestPost,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import type { Post } from '@/payload-types'
import { Chapters } from './chapters'
import { BigMarquee } from './sections/big-marquee'
import { ClientLogos } from './sections/client-logos'
import { Hero } from './sections/hero'
import { HeroTrack } from './sections/hero/track'
import { HowItWorks } from './sections/how-it-works'
import { JoinCta } from './sections/join-cta'
import { NewsLama, type NewsLamaPost } from './sections/news-lama'
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

function toNewsLamaPost(post: Post): NewsLamaPost {
  const cover = resolveMedia(post.cover)
  return {
    title: post.title,
    excerpt: post.excerpt ?? '',
    category: resolveCategory(post.category)?.title ?? '',
    date: post.publishedAt ?? post.createdAt,
    href: `/${post.slug}`,
    cover: cover?.sizes?.card?.url ?? cover?.url ?? '',
    coverAlt: cover?.alt ?? '',
  }
}

export default async function HomePage() {
  // Latest published post for NewsLAMA; the section is omitted entirely
  // when no post exists.
  const latestPost = await getLatestPost()
  const newsPost = latestPost ? toNewsLamaPost(latestPost) : null

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
          {newsPost && <NewsLama post={newsPost} />}
        </>
      </Chapters>
    </Wrapper>
  )
}
