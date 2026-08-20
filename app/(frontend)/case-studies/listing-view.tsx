import { Wrapper } from '@/components/layout/wrapper'
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'
import type { CaseStudy } from '@/payload-types'
import s from './case-studies.module.css'
import { CaseStudyCard } from './case-study-card'
import { CaseStudiesListingJsonLd } from './listing-json-ld'

/**
 * Shared `/case-studies` listing, used by both the Polish and English pages.
 * `studies` are locale-resolved by the page; `content` + `basePath` localize the
 * chrome and card links.
 */
export function CaseStudiesListingView({
  studies,
  content,
  basePath,
}: {
  studies: CaseStudy[]
  content: LocalizedCaseStudies['caseStudiesListing']
  basePath: string
}) {
  return (
    <Wrapper theme="cream">
      <CaseStudiesListingJsonLd
        studies={studies}
        basePath={basePath}
        locale={basePath.startsWith('/en') ? 'en' : 'pl'}
        name={content.metaTitle}
        description={content.metaDescription}
      />
      <section className={s.listing}>
        <header className={s.header}>
          <h1 className={s.heading}>{content.heading}</h1>
          <p className={s.subhead}>
            {content.subhead.lead}
            <br />
            {content.subhead.tail}
          </p>
        </header>

        {studies.length > 0 ? (
          <div className={s.grid}>
            {studies.map((study) => (
              <CaseStudyCard
                key={study.id}
                study={study}
                basePath={basePath}
                readLabel={content.cardRead}
              />
            ))}
          </div>
        ) : (
          <div className={s.empty}>
            <p className={s.emptyTitle}>{content.empty.title}</p>
            <p className={s.emptyText}>{content.empty.text}</p>
          </div>
        )}
      </section>
    </Wrapper>
  )
}
