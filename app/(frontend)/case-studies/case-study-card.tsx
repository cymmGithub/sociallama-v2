import { ArrowRight } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { caseStudiesListing } from '@/lib/content/case-studies'
import type { Locale } from '@/lib/i18n/slug-map'
import { leadMetrics } from '@/lib/payload/case-study-scoreboard'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import { BrandIcon } from './[slug]/brand-icons'
import s from './case-studies.module.css'
import { MetricValue } from './metric-value'

/**
 * Listing card for /case-studies. Links to the detail page.
 *
 * The stage is the card's board now: the cover fills it instead of floating on
 * it as a framed artefact, and the study's lead metric sits on the gradient's
 * lower half. The excerpt is gone — 47 cards each carrying three lines of
 * summary is 47 paragraphs asking to be read before anything can be compared,
 * where one number per card can be scanned down a column.
 */
export function CaseStudyCard({
  study,
  basePath = '/case-studies',
  readLabel = caseStudiesListing.cardRead,
  locale = 'pl',
}: {
  study: CaseStudy
  basePath?: string
  readLabel?: string
  locale?: Locale
}) {
  const cover = resolveMedia(study.cover)
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url
  const logo = resolveMedia(study.client.logo)
  // The face of the study: results[0], the order an editor chose. One study of
  // the 47 carries no results, and its board simply renders without a numeral
  // — the board keeps its height either way, so the row stays level.
  const [lead] = leadMetrics(study.results)

  return (
    <Link className={s.card} href={`${basePath}/${study.slug}`}>
      <span className={s.cardBoard}>
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
        {lead && (
          <span className={s.cardMetric}>
            <MetricValue
              className={s.cardMetricValue}
              locale={locale}
              noteClassName={s.cardMetricNote}
              value={lead.value}
            />
            <span className={s.cardMetricLabel}>
              {lead.platform && (
                <BrandIcon
                  className={s.cardMetricMark}
                  platform={lead.platform}
                />
              )}
              {lead.label} · {lead.metric}
            </span>
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
