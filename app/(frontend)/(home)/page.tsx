import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Wrapper } from '@/components/layout/wrapper'
import { FaqJsonLd, WebSiteJsonLd } from '@/components/seo/structured-data'
import * as pl from '@/lib/content/home'
import { APP_DESCRIPTION, OG_BASE } from '@/lib/content/site'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { getLatestPost } from '@/lib/payload/queries'
import { Chapters } from './chapters'
import { BigMarquee } from './sections/big-marquee'
import { ClientLogos } from './sections/client-logos'
import { Faq } from './sections/faq'
import { Hero } from './sections/hero'
import heroStyles from './sections/hero/hero.module.css'
import { HowItWorks } from './sections/how-it-works'
import { JoinCta } from './sections/join-cta'
import { NewsLama } from './sections/news-lama'
import { NewsLamaSkeleton } from './sections/news-lama/skeleton'
import { toNewsLamaPost } from './sections/news-lama/to-news-lama-post'
import { Services } from './sections/services'
import { Testimonial } from './sections/testimonial'
import { WhyThatWorks } from './sections/why-that-works'

export const metadata: Metadata = {
  title: 'Strategy that works',
  description: APP_DESCRIPTION,
  alternates: alternatesForPath('/'),
  openGraph: {
    title: 'Strategy that works',
    description:
      'Kompleksowa obsługa marek w social mediach: strategia, content, sprzedaż, kreacje i wideo.',
    type: 'website',
    ...OG_BASE,
  },
}

/**
 * The only CMS-dependent slice of the homepage, isolated behind Suspense so
 * the rest of the page prerenders into the static shell. With the fetch
 * awaited at the page root instead, every cold/expired ISR render held the
 * ENTIRE body (hero included) hostage to the Payload→Neon roundtrip — PSI
 * measured it as a ~4.5s LCP resource-load delay (2026-07-29 audit).
 */
async function HomeNews() {
  // Prerenderable on purpose: findLatestPost is 'use cache' with
  // cacheLife('max'), so the news bakes into the build and "/" serves as
  // pure static — the only serving class Vercel's cold-PoP path doesn't
  // buffer (a PPR resume and time-based ISR both measured ~4s document,
  // 2026-07-30). Freshness comes from revalidateTag('posts') on publish.
  // Latest published post for NewsLAMA; the section is omitted entirely
  // when no post exists.
  const latestPost = await getLatestPost()
  const newsPost = latestPost ? toNewsLamaPost(latestPost, '') : null
  return newsPost ? (
    <NewsLama content={pl.news} locale="pl" post={newsPost} />
  ) : null
}

export default function HomePage() {
  return (
    <>
      <WebSiteJsonLd />
      <FaqJsonLd items={pl.faq.items} path="/" />
      <Wrapper theme="plum">
        <Chapters>
          {/* Chapter 1 — plum. Hero + logo belt compose the first viewport as
            a plain flex column in normal document flow (hero-intro-montage).
            On short viewports the column grows past 100svh (hero keeps its
            min-height floor) and the belt drops below the fold. */}
          <div className={heroStyles.column}>
            <Hero content={pl.hero} />
            <ClientLogos
              clients={pl.clients}
              heading={pl.clientsHeading}
              cardCta={pl.clientCardCta}
            />
          </div>
          {/* Chapter 2 — cream */}
          {/* biome-ignore lint/complexity/noUselessFragments: load-bearing — each fragment groups its sections into a single Chapters child (children[index] maps to a chapter) */}
          <>
            <WhyThatWorks content={pl.whyThatWorks} />
            <Services content={pl.services} />
            <HowItWorks content={pl.howItWorks} />
            <BigMarquee />
          </>
          {/* Chapter 3 — plum-deep */}
          {/* biome-ignore lint/complexity/noUselessFragments: load-bearing — each fragment groups its sections into a single Chapters child (children[index] maps to a chapter) */}
          <>
            <Testimonial
              content={pl.testimonials}
              labels={pl.testimonialLabels}
            />
            <Faq content={pl.faq} />
            <JoinCta content={pl.joinCta} />
            <Suspense fallback={<NewsLamaSkeleton heading={pl.news.heading} />}>
              <HomeNews />
            </Suspense>
          </>
        </Chapters>
      </Wrapper>
    </>
  )
}
