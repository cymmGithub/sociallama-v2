import cn from 'clsx'
import type { CSSProperties, ReactNode } from 'react'
import { PostRichText } from '@/app/(frontend)/[slug]/rich-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import {
  type LocalizedCaseStudies,
  PLATFORM_NAMES,
} from '@/lib/content/case-studies'
import { EN_HOME, type Locale, PL_HOME } from '@/lib/i18n/slug-map'
import {
  groupResults,
  type LeadMetric,
  leadMetrics,
  normalizePlatform,
  platformsOf,
  splitValue,
} from '@/lib/payload/case-study-scoreboard'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy, SocialPlatform } from '@/payload-types'
import { MetricValue } from '../metric-value'
import { BrandIcon, hasBrandIcon } from './brand-icons'
import s from './case-study.module.css'
import { CaseStudyJsonLd } from './json-ld'
import { type RailSection, SectionRail } from './section-rail'

/**
 * The full case-study article, shared by the Polish (`/case-studies/[slug]`) and
 * English (`/en/case-studies/[slug]`) detail pages. Study fields come from
 * Payload (locale-resolved by the page); the page furniture — section headings,
 * breadcrumb, CTA — comes from `chrome`, and `basePath` / `contactHref` localize
 * the internal links.
 */

/**
 * The hero's board: the cover under the brand stage, carrying the numbers.
 *
 * It is the page's proof, moved above the fold and ahead of the two prose
 * sections that used to bury it — and it is the page's only copy of the cover.
 * The full-width 16:9 photograph that used to sit under the hero is gone; a
 * 448px board is a smaller LCP image for the same picture, and the numbers now
 * have somewhere to live that is not a grid of orange tiles a screen further
 * down.
 *
 * A study with no cover still renders the board, on the plum ground alone.
 */
function Scoreboard({
  cover,
  leads,
  locale,
}: {
  cover: ReturnType<typeof resolveMedia>
  leads: LeadMetric[]
  locale: Locale
}) {
  const [lead, ...rest] = leads
  // Two, not "the rest": three small numerals under a large one stops reading
  // as a hierarchy and starts reading as a table. The results ledger below is
  // where every group gets its say.
  const secondary = rest.slice(0, 2)

  return (
    <div className={s.scoreboard}>
      {cover?.url && (
        <span className={s.scoreboardCover}>
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            objectFit="cover"
            mobileSize="100vw"
            desktopSize="42vw"
            preload
          />
        </span>
      )}
      {lead && (
        <div className={s.scoreFigures}>
          <div
            className={s.scoreLead}
            style={
              {
                '--len': splitValue(lead.value).numeral.length,
              } as CSSProperties
            }
          >
            <MetricValue
              animate
              className={s.scoreLeadValue}
              locale={locale}
              noteClassName={s.scoreNote}
              value={lead.value}
            />
            <p className={s.scoreLabel}>
              {lead.platform && (
                <BrandIcon className={s.scoreMark} platform={lead.platform} />
              )}
              {lead.label} · {lead.metric}
            </p>
          </div>
          {secondary.length > 0 && (
            <div className={s.scoreRest}>
              {secondary.map((item) => (
                <div className={s.scoreSmall} key={item.label}>
                  <MetricValue
                    animate
                    className={s.scoreSmallValue}
                    locale={locale}
                    noteClassName={s.scoreNote}
                    value={item.value}
                  />
                  <p className={s.scoreLabel}>
                    {item.platform && (
                      <BrandIcon
                        className={s.scoreMark}
                        platform={item.platform}
                      />
                    )}
                    {item.label} · {item.metric}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** One label/value line of the hero's meta rail. */
interface MetaRow {
  key: string
  label: string
  value: ReactNode
}

export function CaseStudyArticle({
  study,
  platforms,
  chrome,
  basePath,
  contactHref,
  locale,
}: {
  study: CaseStudy
  platforms: SocialPlatform[]
  chrome: LocalizedCaseStudies['caseStudyChrome']
  basePath: string
  contactHref: string
  locale: Locale
}) {
  // Match a result group's label to its CMS-held logo (by key or name). Only
  // the ledger's group headings use this now, and only for groups the brand-
  // icon set has no mark for — the meta rail and the scoreboard are brand
  // marks or nothing.
  const platformLogos = new Map<string, ReturnType<typeof resolveMedia>>()
  for (const platform of platforms) {
    const media = resolveMedia(platform.logo)
    if (media) {
      platformLogos.set(normalizePlatform(platform.key), media)
      platformLogos.set(normalizePlatform(platform.name), media)
    }
  }

  // Embedded rich text may link out to posts and categories, so it takes the
  // BLOG prefixes for this locale, not the case-study `basePath` above.
  const postBase = locale === 'en' ? '/en/blog' : ''
  const categoryBase = locale === 'en' ? '/en/blog/category' : '/category'
  // A body link with no resolvable target falls back to this locale's home.
  // `/` and `/en` are different sites; the Polish one renders as lang="pl".
  const linkFallback = locale === 'en' ? EN_HOME : PL_HOME

  const logo = resolveMedia(study.client.logo)
  const cover = resolveMedia(study.cover)
  const resultGroups = groupResults(study.results)
  const leads = leadMetrics(study.results)
  const studyPlatforms = platformsOf(study.results)
  const gallery = (study.gallery ?? [])
    .map((item) => resolveMedia(item))
    .filter((media): media is NonNullable<typeof media> => media !== null)
  const approach = study.approach ?? []
  // "What we did", as close as the model gets to it: the pillars' own campaign
  // hashtags, deduplicated because a study may run two pillars under one tag.
  const scope = [
    ...new Set(
      approach
        .map((pillar) => pillar.tag)
        .filter((tag): tag is string => Boolean(tag))
    ),
  ]

  const hasClient = Boolean(study.client.about)
  const hasChallenge = Boolean(study.challenge)
  const hasResults = resultGroups.length > 0
  const hasApproach = approach.length > 0
  const hasGallery = gallery.length > 0

  // The rail lists what rendered, in page order — never a link to a section
  // this study does not have.
  const railSections: RailSection[] = [
    hasClient && { id: 'nasz-klient', label: chrome.sections.client },
    hasChallenge && { id: 'wyzwanie', label: chrome.sections.challenge },
    hasResults && { id: 'wyniki', label: chrome.sections.results },
    hasApproach && { id: 'podejscie', label: chrome.sections.approach },
    hasGallery && { id: 'galeria', label: chrome.sections.gallery },
  ].filter((section): section is RailSection => Boolean(section))

  const metaRows: MetaRow[] = (
    [
      studyPlatforms.length > 0 && {
        key: 'platforms',
        label: chrome.meta.platforms,
        value: (
          <span className={s.metaMarks}>
            {studyPlatforms.map((platform) => (
              <span className={s.metaMark} key={platform}>
                <BrandIcon className={s.metaMarkIcon} platform={platform} />
                {PLATFORM_NAMES[platform]}
              </span>
            ))}
          </span>
        ),
      },
      study.tags &&
        study.tags.length > 0 && {
          key: 'industry',
          label: chrome.meta.industry,
          value: study.tags.join(' · '),
        },
      scope.length > 0 && {
        key: 'scope',
        label: chrome.meta.scope,
        value: scope.join(' · '),
      },
    ] as (MetaRow | false)[]
  ).filter((row): row is MetaRow => row !== false)

  return (
    <>
      <CaseStudyJsonLd
        study={study}
        coverUrl={cover?.url}
        basePath={basePath}
        locale={locale}
      />
      <article className={s.article}>
        <header className={s.hero}>
          <div className={s.heroTitle}>
            <nav className={s.breadcrumb} aria-label={chrome.breadcrumbAria}>
              <Link href={basePath}>{chrome.listingLabel}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{study.client.name}</span>
            </nav>

            <div className={s.heroClient}>
              {logo?.url ? (
                <span className={s.clientLogo}>
                  <Image
                    src={logo.url}
                    alt={logo.alt}
                    width={logo.width ?? 120}
                    height={logo.height ?? 40}
                  />
                </span>
              ) : (
                <span className={s.clientName}>{study.client.name}</span>
              )}
            </div>

            <h1 className={s.title}>{caseStudyHeadline(study.title)}</h1>
            {study.excerpt && <p className={s.lead}>{study.excerpt}</p>}
          </div>

          <Scoreboard cover={cover} leads={leads} locale={locale} />

          {metaRows.length > 0 && (
            <dl className={s.metaRail}>
              {metaRows.map((row) => (
                <div className={s.metaRow} key={row.key}>
                  <dt className={s.metaLabel}>{row.label}</dt>
                  <dd className={s.metaValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <div className={s.body}>
          <SectionRail
            aria={chrome.rail.aria}
            label={chrome.rail.label}
            sections={railSections}
          />

          <div className={s.bodyColumn}>
            {study.client.about && (
              <section className={s.section} aria-labelledby="nasz-klient">
                <h2 className={s.sectionTitle} id="nasz-klient">
                  {chrome.sections.client}
                </h2>
                <div className={s.prose}>
                  <PostRichText
                    basePath={postBase}
                    categoryPath={categoryBase}
                    fallbackHref={linkFallback}
                    locale={locale}
                    data={study.client.about}
                    unoptimized={false}
                  />
                </div>
              </section>
            )}

            {study.challenge && (
              <section className={s.section} aria-labelledby="wyzwanie">
                <h2 className={s.sectionTitle} id="wyzwanie">
                  {chrome.sections.challenge}
                </h2>
                <div className={s.prose}>
                  <PostRichText
                    basePath={postBase}
                    categoryPath={categoryBase}
                    fallbackHref={linkFallback}
                    locale={locale}
                    data={study.challenge}
                    unoptimized={false}
                  />
                </div>
              </section>
            )}

            {hasResults && (
              <section className={s.section} aria-labelledby="wyniki">
                <h2 className={s.sectionTitle} id="wyniki">
                  {chrome.sections.results}
                </h2>
                {/* The ledger. Each group leads with one large numeral and
                    carries the rest small — the orange tiles that used to give
                    30 comments the same weight as 432 616 views are gone. */}
                <div className={s.results}>
                  {resultGroups.map((group) => {
                    const platformKey = normalizePlatform(group.label)
                    const platformLogo = platformLogos.get(platformKey)
                    const [lead, ...rest] = group.items
                    return (
                      <div key={group.label} className={s.ledgerGroup}>
                        <h3 className={s.ledgerGroupTitle}>
                          {/* Prefer the full-color brand mark; fall back to the
                              CMS logo only for groups we ship no icon for. */}
                          <BrandIcon
                            platform={platformKey}
                            className={s.platformLogo}
                          />
                          {!hasBrandIcon(platformKey) && platformLogo?.url && (
                            <Image
                              className={s.platformLogo}
                              src={platformLogo.url}
                              alt=""
                              width={platformLogo.width ?? 24}
                              height={platformLogo.height ?? 24}
                            />
                          )}
                          {group.label}
                        </h3>
                        {lead && (
                          <div
                            className={s.ledgerLead}
                            style={
                              {
                                // Only the lead scales with its own length —
                                // the small numerals are one fixed size, so a
                                // row of them stays a row.
                                '--len': splitValue(lead.value).numeral.length,
                              } as CSSProperties
                            }
                          >
                            <MetricValue
                              animate
                              className={s.ledgerLeadValue}
                              locale={locale}
                              noteClassName={s.ledgerNote}
                              value={lead.value}
                            />
                            <span className={s.ledgerLeadMetric}>
                              {lead.metric}
                            </span>
                          </div>
                        )}
                        {rest.length > 0 && (
                          <div className={s.ledgerRest}>
                            {rest.map((item) => (
                              <div
                                className={s.ledgerItem}
                                key={`${item.metric}-${item.value}`}
                              >
                                <MetricValue
                                  animate
                                  className={s.ledgerItemValue}
                                  locale={locale}
                                  noteClassName={s.ledgerNote}
                                  value={item.value}
                                />
                                <span className={s.ledgerItemMetric}>
                                  {item.metric}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {hasApproach && (
              <section className={s.section} aria-labelledby="podejscie">
                <h2 className={s.sectionTitle} id="podejscie">
                  {chrome.sections.approach}
                </h2>
                <div className={s.pillars}>
                  {approach.map((pillar) => {
                    const pillarMedia = (pillar.media ?? [])
                      .map((item) => resolveMedia(item))
                      .filter(
                        (media): media is NonNullable<typeof media> =>
                          media !== null
                      )
                    return (
                      <div
                        key={pillar.id ?? pillar.heading}
                        className={cn(
                          s.pillar,
                          pillarMedia.length === 0 && s.pillarSolo
                        )}
                      >
                        <div className={s.pillarText}>
                          {pillar.tag && (
                            <span className={s.pillarTag}>{pillar.tag}</span>
                          )}
                          <h3 className={s.pillarHeading}>{pillar.heading}</h3>
                          {pillar.body && (
                            <div className={s.pillarBody}>
                              <PostRichText
                                basePath={postBase}
                                categoryPath={categoryBase}
                                data={pillar.body}
                                fallbackHref={linkFallback}
                                locale={locale}
                                unoptimized={false}
                              />
                            </div>
                          )}
                        </div>
                        {pillarMedia.length > 0 && (
                          <div className={s.pillarMedia}>
                            {pillarMedia.map((media) => (
                              <div
                                key={media.id}
                                className={cn(
                                  s.shot,
                                  // Phone lane only for real portraits: a
                                  // 1230×1232 square (polomarket-sprzedaz-1) is
                                  // a rounding artefact, not a phone, and 4:5
                                  // posts sit at 0.8.
                                  (media.width ?? 1) / (media.height ?? 1) <
                                    0.9 && s.shotPortrait
                                )}
                              >
                                <Image
                                  src={media.url ?? ''}
                                  alt={media.alt}
                                  width={media.width ?? 800}
                                  height={media.height ?? 600}
                                  mobileSize="80vw"
                                  desktopSize="30vw"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {hasGallery && (
              <section className={s.section} aria-labelledby="galeria">
                <h2 className={s.sectionTitle} id="galeria">
                  {chrome.sections.gallery}
                </h2>
                <div className={s.gallery}>
                  {gallery.map((media) => (
                    <div key={media.id} className={s.galleryItem}>
                      <Image
                        src={media.url ?? ''}
                        alt={media.alt}
                        width={media.width ?? 800}
                        height={media.height ?? 600}
                        mobileSize="100vw"
                        desktopSize="42vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <aside className={s.cta}>
          <p className={s.ctaTitle}>{chrome.cta.title}</p>
          <p className={s.ctaText}>{chrome.cta.text}</p>
          <div className={s.ctaActions}>
            <Link className={s.ctaPrimary} href={contactHref}>
              {chrome.cta.primary}
            </Link>
          </div>
        </aside>
      </article>
    </>
  )
}
