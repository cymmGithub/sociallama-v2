import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import s from './case-studies.module.css'

/** Listing card for /case-studies. Links to the detail page. */
export function CaseStudyCard({ study }: { study: CaseStudy }) {
  const cover = resolveMedia(study.cover)
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url

  return (
    <Link className={s.card} href={`/case-studies/${study.slug}`}>
      <span className={s.cardMedia}>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={cover?.alt ?? ''}
            fill
            objectFit="cover"
            mobileSize="100vw"
            desktopSize="33vw"
          />
        )}
      </span>
      <span className={s.cardBody}>
        <span className={s.cardClient}>{study.client.name}</span>
        <span className={s.cardTitle}>{caseStudyHeadline(study.title)}</span>
        {study.excerpt && (
          <span className={s.cardExcerpt}>{study.excerpt}</span>
        )}
        <span className={s.cardRead}>ZOBACZ CASE STUDY</span>
      </span>
    </Link>
  )
}
