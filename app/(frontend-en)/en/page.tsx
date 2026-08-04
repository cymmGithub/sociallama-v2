import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Chapters } from '@/app/(frontend)/(home)/chapters'
import { BigMarquee } from '@/app/(frontend)/(home)/sections/big-marquee'
import { ClientLogos } from '@/app/(frontend)/(home)/sections/client-logos'
import { Faq } from '@/app/(frontend)/(home)/sections/faq'
import { Hero } from '@/app/(frontend)/(home)/sections/hero'
import heroStyles from '@/app/(frontend)/(home)/sections/hero/hero.module.css'
import { HowItWorks } from '@/app/(frontend)/(home)/sections/how-it-works'
import { JoinCta } from '@/app/(frontend)/(home)/sections/join-cta'
import { NewsLama } from '@/app/(frontend)/(home)/sections/news-lama'
import { NewsLamaSkeleton } from '@/app/(frontend)/(home)/sections/news-lama/skeleton'
import { toNewsLamaPost } from '@/app/(frontend)/(home)/sections/news-lama/to-news-lama-post'
import { Services } from '@/app/(frontend)/(home)/sections/services'
import { Testimonial } from '@/app/(frontend)/(home)/sections/testimonial'
import { WhyThatWorks } from '@/app/(frontend)/(home)/sections/why-that-works'
import { Wrapper } from '@/components/layout/wrapper'
import { FaqJsonLd } from '@/components/seo/structured-data'
import * as en from '@/lib/content/home.en'
import { oNasTeamGrid } from '@/lib/content/o-nas.en'
import { APP_DESCRIPTION, OG_BASE } from '@/lib/content/site.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { getLatestPost } from '@/lib/payload/queries'

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
 * The only CMS-dependent slice, Suspense-isolated exactly like the Polish
 * homepage's HomeNews so the hero prerenders into the static shell (see the
 * comment there for the LCP numbers behind this).
 */
async function EnHomeNews() {
  // Prerenderable on purpose, mirroring the Polish HomeNews: the news bakes
  // into the build so /en serves as pure static (see the comment there).
  // Newest TRANSLATED post: `getLatestPost('en')` carries the D6 gate, so the
  // section is omitted entirely until at least one post exists in English —
  // rather than showing a Polish one under English chrome.
  const latestPost = await getLatestPost('en')
  const newsPost = latestPost ? toNewsLamaPost(latestPost, '/en/blog') : null
  return newsPost ? (
    <NewsLama content={en.news} locale="en" post={newsPost} />
  ) : null
}

export default function EnHomePage() {
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
            <WhyThatWorks content={en.whyThatWorks} team={oNasTeamGrid} />
            <Services content={en.services} />
            <HowItWorks
              content={en.howItWorks}
              caseStudyBase="/en/case-studies"
            />
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
            <Suspense fallback={<NewsLamaSkeleton heading={en.news.heading} />}>
              <EnHomeNews />
            </Suspense>
          </>
        </Chapters>
      </Wrapper>
    </>
  )
}
