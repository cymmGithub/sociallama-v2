import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import * as home from '@/lib/content/home'
import * as pl from '@/lib/content/o-nas'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { getLatestPost } from '@/lib/payload/queries'
import { BigMarquee } from '../(home)/sections/big-marquee'
import { ClientLogos } from '../(home)/sections/client-logos'
import { JoinCta } from '../(home)/sections/join-cta'
import { NewsLama } from '../(home)/sections/news-lama'
import { toNewsLamaPost } from '../(home)/sections/news-lama/to-news-lama-post'
import { AboutIntro } from './sections/about-intro'
import { GoodOne } from './sections/good-one'
import { OnasHero } from './sections/hero'
import heroStyles from './sections/hero/hero.module.css'
import { Projects } from './sections/projects'
import { Team } from './sections/team'
import { ValuesGrid } from './sections/values-grid'

/*
 * /o-nas (About) page. Unlike the homepage, the design is a sequence of
 * per-section colour BANDS (plum → cream → orange → cream → plum → cream →
 * plum → orange → cream → dark footer), not a 3-chapter morph — so there is no
 * <Chapters> wrapper here; each section paints its own background.
 *
 * New sections (hero, about-intro, values-grid, projects, good-one, team) are
 * colocated. ClientLogos / BigMarquee / JoinCta / NewsLama are REUSED verbatim
 * from the homepage. ClientLogos composes the hero's plum column (like the
 * homepage); the others are wrapped in the data-theme context that makes them
 * resolve the right brand tokens.
 */

export const metadata: Metadata = {
  title: pl.oNasMeta.title,
  description: pl.oNasMeta.description,
  alternates: alternatesForPath('/o-nas'),
}

export default async function ONasPage() {
  const latestPost = await getLatestPost()
  const newsPost = latestPost ? toNewsLamaPost(latestPost, '') : null

  return (
    <Wrapper theme="plum">
      {/* Hero + "ZAUFALI NAM" belt compose the first viewport as one plum
          column — exactly as on the homepage (heroStyles.column). The belt is
          its own sand band inside the plum ground; no data-theme wrapper, so it
          resolves the plum tokens like the homepage. */}
      <div className={heroStyles.column}>
        <OnasHero />
        <ClientLogos
          clients={home.clients}
          heading={home.clientsHeading}
          cardCta={home.clientCardCta}
        />
      </div>
      <AboutIntro content={pl.oNasAbout} />
      <ValuesGrid content={pl.oNasValues} />
      <Projects content={pl.oNasProjects} />
      {/* reused — on the sand light ground with cream tokens (ink outline),
          exactly as on the homepage's cream chapter: no distinct plum band,
          continuous with the projects / GOOD ONE sand sections around it. */}
      <div data-theme="cream" style={{ backgroundColor: 'var(--color-sand)' }}>
        <BigMarquee />
      </div>
      <GoodOne content={pl.oNasGoodOne} />
      <Team content={pl.oNasTeam} />
      {/* reused — JoinCta sits on the same sand ground as the BigMarquee /
          GOOD ONE sand sections above, per request; NewsLama keeps the native
          plum-deep look. */}
      <div
        data-theme="cream"
        style={{
          backgroundColor: 'var(--color-sand)',
          color: 'var(--color-ink)',
        }}
      >
        <JoinCta content={home.joinCta} />
      </div>
      <div data-theme="plum-deep">
        {newsPost && (
          <NewsLama content={home.news} locale="pl" post={newsPost} />
        )}
      </div>
    </Wrapper>
  )
}
