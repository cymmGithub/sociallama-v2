import { Wrapper } from '@/components/layout/wrapper'
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'
import type { CaseStudy } from '@/payload-types'
import s from './case-studies.module.css'
import { CaseStudyCard } from './case-study-card'
import {
  CaseStudySearch,
  CaseStudySearchInput,
  CaseStudySearchStatus,
  Filtered,
} from './hub-search'
import { CaseStudiesListingJsonLd } from './listing-json-ld'
import { caseStudySearchEntries } from './search'

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
  // One derivation for the whole view: the JSON-LD's `inLanguage` and the
  // search copy answer the same question, and the pages already say which
  // locale they are by the path they mount at.
  const locale = basePath.startsWith('/en') ? 'en' : 'pl'

  return (
    <Wrapper theme="cream">
      <CaseStudiesListingJsonLd
        studies={studies}
        basePath={basePath}
        locale={locale}
        name={content.metaTitle}
        description={content.metaDescription}
      />
      <CaseStudySearch
        entries={caseStudySearchEntries(studies)}
        locale={locale}
      >
        <section className={s.listing}>
          <header className={s.header}>
            <div className={s.headerText}>
              <h1 className={s.heading}>{content.heading}</h1>
              <p className={s.subhead}>
                {content.subhead.lead}
                <br />
                {content.subhead.tail}
              </p>
            </div>
            {/* Nothing to filter when the collection is empty, and the field
                would read as broken next to the "coming soon" state. */}
            {studies.length > 0 && <CaseStudySearchInput />}
          </header>

          {studies.length > 0 ? (
            <>
              <div className={s.grid}>
                {studies.map((study) => (
                  <Filtered key={study.id} slug={study.slug}>
                    <CaseStudyCard
                      study={study}
                      basePath={basePath}
                      readLabel={content.cardRead}
                    />
                  </Filtered>
                ))}
              </div>
              <CaseStudySearchStatus />
            </>
          ) : (
            <div className={s.empty}>
              <p className={s.emptyTitle}>{content.empty.title}</p>
              <p className={s.emptyText}>{content.empty.text}</p>
            </div>
          )}
        </section>
      </CaseStudySearch>
    </Wrapper>
  )
}
