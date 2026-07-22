import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { caseStudiesListing } from '@/lib/content/case-studies'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import s from './case-studies.module.css'

/** Listing card for /case-studies. Links to the detail page. */
export function CaseStudyCard({
  study,
  basePath = '/case-studies',
  readLabel = caseStudiesListing.cardRead,
}: {
  study: CaseStudy
  basePath?: string
  readLabel?: string
}) {
  const cover = resolveMedia(study.cover)
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url
  const logo = resolveMedia(study.client.logo)

  return (
    <Link className={s.card} href={`${basePath}/${study.slug}`}>
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
        {logo?.url ? (
          <span className={s.cardLogo}>
            <Image
              src={logo.url}
              alt={study.client.name}
              width={logo.width ?? 120}
              height={logo.height ?? 40}
            />
            <span className="sr-only">{study.client.name}</span>
          </span>
        ) : (
          <span className={s.cardClient}>{study.client.name}</span>
        )}
        <span className={s.cardTitle}>{caseStudyHeadline(study.title)}</span>
        {study.excerpt && (
          <span className={s.cardExcerpt}>{study.excerpt}</span>
        )}
        {study.tags && study.tags.length > 0 && (
          <span className={s.cardTags}>
            {study.tags.map((tag) => (
              <span key={tag} className={s.cardTag}>
                {tag}
              </span>
            ))}
          </span>
        )}
        <span className={s.cardRead}>{readLabel}</span>
      </span>
    </Link>
  )
}
