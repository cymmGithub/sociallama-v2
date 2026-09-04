import { ArrowRight } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type { Locale } from '@/lib/i18n/slug-map'
import { leadMetrics, platformsOf } from '@/lib/payload/case-study-scoreboard'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import { BrandIcon } from './[slug]/brand-icons'
import s from './case-studies.module.css'
import { MetricValue } from './metric-value'

/**
 * One study as a ledger row — the hub's second view.
 *
 * Not a re-layout of the card. The row shows what the card has no room for
 * (every group's lead, not just the study's) and drops what a row has no use
 * for (the cover): 47 boards are a portfolio, 47 rows are a table you can read
 * down a column of. That is why both are rendered rather than one being
 * reflowed into the other.
 */
export function CaseStudyRow({
  study,
  basePath,
  readLabel,
  locale,
}: {
  study: CaseStudy
  basePath: string
  readLabel: string
  locale: Locale
}) {
  const logo = resolveMedia(study.client.logo)
  const [lead, ...groups] = leadMetrics(study.results)
  // Two, like the scoreboard. The row has two fixed tracks for them, and a
  // study with four result groups (Motointegrator, Galeria Rondo) would
  // otherwise wrap a third onto a second line and push its own row taller than
  // its neighbours — which is exactly what makes a list stop reading as one.
  // The full set is on the study's own page.
  const rest = groups.slice(0, 2)
  const platforms = platformsOf(study.results)

  return (
    <Link className={s.row} href={`${basePath}/${study.slug}`}>
      <span className={s.rowClient}>
        {logo?.url ? (
          <>
            <Image
              src={logo.url}
              alt={study.client.name}
              width={logo.width ?? 120}
              height={logo.height ?? 40}
            />
            <span className="sr-only">{study.client.name}</span>
          </>
        ) : (
          <span className={s.rowClientName}>{study.client.name}</span>
        )}
      </span>

      <span className={s.rowText}>
        <span className={s.rowTitle}>{caseStudyHeadline(study.title)}</span>
        {study.tags && study.tags.length > 0 && (
          <span className={s.rowTags}>{study.tags.join(' · ')}</span>
        )}
      </span>

      <span className={s.rowLead}>
        {lead && (
          <>
            <MetricValue
              className={s.rowLeadValue}
              locale={locale}
              noteClassName={s.rowNote}
              value={lead.value}
            />
            <span className={s.rowLeadLabel}>
              {lead.label} · {lead.metric}
            </span>
          </>
        )}
      </span>

      <span className={s.rowRest}>
        {rest.map((item) => (
          <span className={s.rowSmall} key={item.label}>
            <MetricValue
              className={s.rowSmallValue}
              locale={locale}
              noteClassName={s.rowNote}
              value={item.value}
            />
            <span className={s.rowSmallLabel}>{item.label}</span>
          </span>
        ))}
      </span>

      <span className={s.rowMarks}>
        {platforms.map((platform) => (
          <BrandIcon className={s.rowMark} key={platform} platform={platform} />
        ))}
      </span>

      <span className={s.rowRead}>
        <span className="sr-only">{readLabel}</span>
        <ArrowRight aria-hidden="true" className={s.rowReadIcon} size={18} />
      </span>
    </Link>
  )
}
