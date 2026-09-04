import { Wrapper } from '@/components/layout/wrapper'
import { INDUSTRY_OPTIONS as industriesPl } from '@/lib/content/branze'
import { INDUSTRY_OPTIONS as industriesEn } from '@/lib/content/branze.en'
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'
import type { CaseStudy } from '@/payload-types'
import { BrandIconSprite } from './[slug]/brand-icons'
import s from './case-studies.module.css'
import { CaseStudyCard } from './case-study-card'
import { CaseStudyRow } from './case-study-row'
import {
  CaseStudySearch,
  CaseStudySearchInput,
  CaseStudySearchStatus,
  Filtered,
  IndustryRail,
  type IndustryRailItem,
  ViewPane,
  ViewToggle,
} from './hub-search'
import { CaseStudiesListingJsonLd } from './listing-json-ld'
import { caseStudySearchEntries, industryCounts } from './search'

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
  const entries = caseStudySearchEntries(studies)
  // Counted here, at build, and passed down as props — see `industryCounts`
  // for why they must not move while the visitor filters. The rail lists the
  // categories in `branze.ts` order and drops the ones no study has, so
  // `Finanse` and `Moda` (pages without case studies) never offer the visitor
  // an empty grid.
  const counts = industryCounts(entries)
  const options = locale === 'en' ? industriesEn : industriesPl
  const railItems: IndustryRailItem[] = options
    .filter((option) => (counts.get(option.id) ?? 0) > 0)
    .map((option) => ({
      id: option.id,
      // The rail is the one surface tight enough to need the short name.
      label: option.shortLabel ?? option.label,
      count: counts.get(option.id) ?? 0,
      href: option.href,
    }))

  return (
    <Wrapper theme="cream">
      {/* Once, outside both view panes — the marks are `<use>` references. */}
      <BrandIconSprite />
      <CaseStudiesListingJsonLd
        studies={studies}
        basePath={basePath}
        locale={locale}
        name={content.metaTitle}
        description={content.metaDescription}
      />
      <CaseStudySearch entries={entries} locale={locale}>
        <section className={s.listing}>
          <header className={s.header}>
            <div className={s.headerText}>
              <h1 className={s.heading}>{content.heading}</h1>
              <p className={s.subhead}>{content.subhead}</p>
            </div>
            {/* Nothing to filter when the collection is empty, and the field
                would read as broken next to the "coming soon" state. */}
            {studies.length > 0 && <CaseStudySearchInput />}
          </header>

          {studies.length > 0 ? (
            <div className={s.hub}>
              <IndustryRail items={railItems} total={studies.length} />

              <div className={s.hubMain}>
                <div className={s.hubBar}>
                  <ViewToggle />
                </div>

                {/* Both views render, and the toggle hides one. Switching
                    therefore never unmounts a card and never refetches an
                    image — the same bargain the filters make. */}
                <ViewPane view="grid">
                  <div className={s.grid}>
                    {studies.map((study) => (
                      <Filtered key={study.id} slug={study.slug}>
                        <CaseStudyCard
                          study={study}
                          basePath={basePath}
                          readLabel={content.cardRead}
                          locale={locale}
                        />
                      </Filtered>
                    ))}
                  </div>
                </ViewPane>

                <ViewPane view="ledger">
                  <div className={s.rows}>
                    {studies.map((study) => (
                      <Filtered key={study.id} slug={study.slug}>
                        <CaseStudyRow
                          study={study}
                          basePath={basePath}
                          readLabel={content.cardRead}
                          locale={locale}
                        />
                      </Filtered>
                    ))}
                  </div>
                </ViewPane>

                <CaseStudySearchStatus />
              </div>
            </div>
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
