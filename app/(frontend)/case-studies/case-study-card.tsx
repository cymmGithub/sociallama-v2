import { ArrowRight } from 'lucide-react'
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
  // Headline metric = the first result the editor ordered. There is no
  // "featured" flag on the collection and this change adds no schema, so first
  // stands in for most prominent. 47 of 48 studies carry at least one; the
  // metric row is simply omitted for the one that does not.
  const headline = study.results?.[0]

  return (
    <Link className={s.card} href={`${basePath}/${study.slug}`}>
      <span className={s.cardMedia}>
        <span className={s.cardArtefact}>
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
        {headline && (
          <span className={s.cardMetric}>
            <span className={s.cardMetricValue}>{headline.value}</span>
            <span className={s.cardMetricLabel}>{headline.metric}</span>
          </span>
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
        <span className={s.cardRead}>
          {readLabel}
          <ArrowRight className={s.cardReadIcon} size={16} aria-hidden="true" />
        </span>
      </span>
    </Link>
  )
}
