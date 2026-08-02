import type { Metadata } from 'next'
import { BigMarquee } from '@/app/(frontend)/(home)/sections/big-marquee'
import { ClientLogos } from '@/app/(frontend)/(home)/sections/client-logos'
import { JoinCta } from '@/app/(frontend)/(home)/sections/join-cta'
import { AboutIntro } from '@/app/(frontend)/o-nas/sections/about-intro'
import { GoodOne } from '@/app/(frontend)/o-nas/sections/good-one'
import { OnasHero } from '@/app/(frontend)/o-nas/sections/hero'
import heroStyles from '@/app/(frontend)/o-nas/sections/hero/hero.module.css'
import { Projects } from '@/app/(frontend)/o-nas/sections/projects'
import { Team } from '@/app/(frontend)/o-nas/sections/team'
import { ValuesGrid } from '@/app/(frontend)/o-nas/sections/values-grid'
import { Wrapper } from '@/components/layout/wrapper'
import * as home from '@/lib/content/home.en'
import * as en from '@/lib/content/o-nas.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'

export const metadata: Metadata = {
  title: en.oNasMeta.title,
  description: en.oNasMeta.description,
  alternates: alternatesForPath('/en/about-us'),
}

export default function EnAboutPage() {
  // English About page: the Polish band sequence fed English content. The reused
  // homepage sections (ClientLogos, JoinCta) take English home copy; NewsLAMA is
  // omitted.
  return (
    <Wrapper theme="plum">
      {/* Hero + client belt compose the first viewport as one plum column,
          mirroring /o-nas (heroStyles.column). The belt is its own sand band
          inside the plum ground; no data-theme wrapper. */}
      <div className={heroStyles.column}>
        <OnasHero content={en.oNasHero} />
        <ClientLogos
          clients={home.clients}
          heading={home.clientsHeading}
          cardCta={home.clientCardCta}
          caseStudyBase="/en/case-studies"
        />
      </div>
      <AboutIntro content={en.oNasAbout} />
      <ValuesGrid content={en.oNasValues} />
      <Projects content={en.oNasProjects} />
      <div data-theme="cream" style={{ backgroundColor: 'var(--color-sand)' }}>
        <BigMarquee />
      </div>
      <GoodOne content={en.oNasGoodOne} />
      <Team content={en.oNasTeam} />
      <div
        data-theme="cream"
        style={{
          backgroundColor: 'var(--color-sand)',
          color: 'var(--color-ink)',
        }}
      >
        <JoinCta content={home.joinCta} />
      </div>
    </Wrapper>
  )
}
