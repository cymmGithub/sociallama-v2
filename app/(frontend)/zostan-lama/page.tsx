import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { careersMeta } from '@/lib/content/zostan-lama'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { CareersApply } from './careers-apply'
import { CareersBenefits } from './careers-benefits'
import { CareersHero } from './careers-hero'
import { CareersRoles } from './careers-roles'
import { DarkChrome } from './dark-chrome'
import s from './zostan-lama.module.css'

/*
 * Careers page (redesign-careers-page, direction C). Dark conversion layout
 * served at /zostan-lama — the legacy WP /zostan-lama/ URL redirects here.
 *
 * Renders inside <Wrapper theme="plum-deep"> (cream-on-dark chrome + Lenis for
 * the marquee's scroll-velocity coupling); the near-black ground, the orange
 * benefits band and the plum application band are painted by the scoped
 * zostan-lama.module.css.
 *
 * Band order is ink-deep → orange → plum-deep, and the page ENDS on the form
 * (design D3): nothing may be added below <CareersApply/> — the next element is
 * the site footer.
 */

export const metadata: Metadata = {
  title: careersMeta.title,
  description: careersMeta.description,
  alternates: alternatesForPath('/zostan-lama'),
}

export default function JoinPage() {
  return (
    <Wrapper theme="plum-deep">
      <div className={s.page}>
        <DarkChrome />
        <CareersHero />
        <CareersRoles />
        <CareersBenefits />
        <CareersApply />
      </div>
    </Wrapper>
  )
}
