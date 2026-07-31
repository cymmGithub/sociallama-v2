import type { Metadata } from 'next'
import { CareersApply } from '@/app/(frontend)/zostan-lama/careers-apply'
import { CareersBenefits } from '@/app/(frontend)/zostan-lama/careers-benefits'
import { CareersHero } from '@/app/(frontend)/zostan-lama/careers-hero'
import { CareersRoles } from '@/app/(frontend)/zostan-lama/careers-roles'
import { DarkChrome } from '@/app/(frontend)/zostan-lama/dark-chrome'
import s from '@/app/(frontend)/zostan-lama/zostan-lama.module.css'
import { Wrapper } from '@/components/layout/wrapper'
import * as en from '@/lib/content/zostan-lama.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { careersMarqueeOutlinePaths } from '@/lib/wordmark-paths'

/*
 * English careers page — the Polish composition fed English content. The form
 * posts with locale="en", so the server action returns English validation
 * messages, toasts and lead-email labels.
 *
 * Imports the careers route's own module, NOT another route's: the defect this
 * change removes was `post.module.css` applied outside the class it composes
 * with, which rendered this page's lede cream-on-cream too.
 */

export const metadata: Metadata = {
  title: en.careersMeta.title,
  description: en.careersMeta.description,
  alternates: alternatesForPath('/en/become-a-lama'),
}

export default function EnJoinPage() {
  return (
    <Wrapper theme="plum-deep">
      <div className={s.page}>
        <DarkChrome />
        <CareersHero
          meta={en.careersMeta}
          marquee={en.careersMarquee}
          lede={en.careersLede}
          outlinePath={careersMarqueeOutlinePaths.en}
        />
        <CareersRoles roles={en.careersRoles} label={en.careersRolesLabel} />
        <CareersBenefits benefits={en.careersBenefits} />
        <CareersApply
          form={en.careersForm}
          roles={en.careersRoles}
          locale="en"
        />
      </div>
    </Wrapper>
  )
}
