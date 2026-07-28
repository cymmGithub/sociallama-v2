import type { Metadata } from 'next'
import { Chapters } from '@/app/(frontend)/(home)/chapters'
import { BigMarquee } from '@/app/(frontend)/(home)/sections/big-marquee'
import { ClientLogos } from '@/app/(frontend)/(home)/sections/client-logos'
import { Faq } from '@/app/(frontend)/(home)/sections/faq'
import { Hero } from '@/app/(frontend)/(home)/sections/hero'
import heroStyles from '@/app/(frontend)/(home)/sections/hero/hero.module.css'
import { HowItWorks } from '@/app/(frontend)/(home)/sections/how-it-works'
import { JoinCta } from '@/app/(frontend)/(home)/sections/join-cta'
import {
  NewsLama,
  type NewsLamaPost,
} from '@/app/(frontend)/(home)/sections/news-lama'
import { Services } from '@/app/(frontend)/(home)/sections/services'
import { Testimonial } from '@/app/(frontend)/(home)/sections/testimonial'
import { WhyThatWorks } from '@/app/(frontend)/(home)/sections/why-that-works'
import { Wrapper } from '@/components/layout/wrapper'
import { FaqJsonLd } from '@/components/seo/structured-data'
import * as en from '@/lib/content/home.en'
import { APP_DESCRIPTION, OG_BASE } from '@/lib/content/site.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import {
  getLatestPost,
  resolveCategory,
  resolveMedia,
} from '@/lib/payload/queries'
import type { Post } from '@/payload-types'

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

/**
 * English view-model. The Polish builder hardcodes `/${post.slug}`, the
 * root-level shape English does not use, so the href is built here instead of
 * being shared.
 */
function toEnNewsLamaPost(post: Post): NewsLamaPost {
  const cover = resolveMedia(post.cover)
  return {
    title: post.title,
    excerpt: post.excerpt ?? '',
    category: resolveCategory(post.category)?.title ?? '',
    date: post.publishedAt ?? post.createdAt,
    href: `/en/blog/${post.slug}`,
    cover: cover?.sizes?.card?.url ?? cover?.url ?? '',
    coverAlt: cover?.alt ?? '',
  }
}

export default async function EnHomePage() {
  // Newest TRANSLATED post: `getLatestPost('en')` carries the D6 gate, so the
  // section is omitted entirely until at least one post exists in English —
  // rather than showing a Polish one under English chrome.
  const latestPost = await getLatestPost('en')
  const newsPost = latestPost ? toEnNewsLamaPost(latestPost) : null

  return (
    <>
      <FaqJsonLd items={en.faq.items} path="/en" />
      <Wrapper theme="plum">
        <Chapters>
          <div className={heroStyles.column}>
            <Hero content={en.hero} />
            <ClientLogos
              clients={en.clients}
              heading={en.clientsHeading}
              cardCta={en.clientCardCta}
              caseStudyBase="/en/case-studies"
            />
          </div>
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
            <Faq content={en.faq} />
            <JoinCta content={en.joinCta} />
            {newsPost && (
              <NewsLama content={en.news} locale="en" post={newsPost} />
            )}
          </>
        </Chapters>
      </Wrapper>
    </>
  )
}
