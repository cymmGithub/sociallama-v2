import cn from 'clsx'
import { PostRichText } from '@/app/(frontend)/[slug]/rich-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'
import type { Locale } from '@/lib/i18n/slug-map'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import s from './case-study.module.css'
import { CaseStudyJsonLd } from './json-ld'
import { ResultsNotifications } from './results-notifications'

/**
 * The full case-study article, shared by the Polish (`/case-studies/[slug]`) and
 * English (`/en/case-studies/[slug]`) detail pages. Study fields come from
 * Payload (locale-resolved by the page); the page furniture — section headings,
 * breadcrumb, CTA — comes from `chrome`, and `basePath` / `contactHref` localize
 * the internal links. (Notification app icons are inline brand marks in the
 * results component — the CMS `social-platforms` logos are plum-toned site
 * marks, wrong vocabulary for an app tile.)
 */
export function CaseStudyArticle({
  study,
  chrome,
  basePath,
  contactHref,
  locale,
}: {
  study: CaseStudy
  chrome: LocalizedCaseStudies['caseStudyChrome']
  basePath: string
  contactHref: string
  locale: Locale
}) {
  const logo = resolveMedia(study.client.logo)
  const cover = resolveMedia(study.cover)
  const gallery = (study.gallery ?? [])
    .map((item) => resolveMedia(item))
    .filter((media): media is NonNullable<typeof media> => media !== null)

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
          <nav className={s.breadcrumb} aria-label={chrome.breadcrumbAria}>
            <Link href={basePath}>{chrome.listingLabel}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{study.client.name}</span>
          </nav>

          <div className={s.heroMeta}>
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
            {study.period && <span className={s.period}>{study.period}</span>}
          </div>

          <h1 className={s.title}>{caseStudyHeadline(study.title)}</h1>
          {study.excerpt && <p className={s.lead}>{study.excerpt}</p>}

          {study.tags && study.tags.length > 0 && (
            <ul className={s.tags}>
              {study.tags.map((tag) => (
                <li key={tag} className={s.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        {cover?.url && (
          <div className={s.cover}>
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              objectFit="cover"
              mobileSize="100vw"
              desktopSize="72vw"
              preload
            />
          </div>
        )}

        {study.client.about && (
          <section className={s.section} aria-labelledby="nasz-klient">
            <h2 className={s.sectionTitle} id="nasz-klient">
              {chrome.sections.client}
            </h2>
            <div className={s.prose}>
              <PostRichText data={study.client.about} />
            </div>
          </section>
        )}

        {study.challenge && (
          <section className={s.section} aria-labelledby="wyzwanie">
            <h2 className={s.sectionTitle} id="wyzwanie">
              {chrome.sections.challenge}
            </h2>
            <div className={s.prose}>
              <PostRichText data={study.challenge} />
            </div>
          </section>
        )}

        {/* Results directly after the challenge (order decision 2026-07-23):
            the payoff numbers land before the how-we-did-it story. */}
        {(study.results ?? []).length > 0 && (
          <section className={s.section} aria-labelledby="wyniki">
            <h2 className={s.sectionTitle} id="wyniki">
              {chrome.sections.results}
            </h2>
            <ResultsNotifications
              results={(study.results ?? []).map((result) => ({
                platform: result.platform,
                metric: result.metric,
                value: result.value,
              }))}
              coverUrl={cover?.sizes?.card?.url ?? cover?.url ?? undefined}
              strings={chrome.resultsBand}
            />
          </section>
        )}

        {study.approach && study.approach.length > 0 && (
          <section className={s.section} aria-labelledby="podejscie">
            <h2 className={s.sectionTitle} id="podejscie">
              {chrome.sections.approach}
            </h2>
            <div className={s.pillars}>
              {study.approach.map((pillar) => {
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
                          <PostRichText data={pillar.body} />
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
                              (media.height ?? 0) > (media.width ?? 1) &&
                                s.shotPortrait
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

        {gallery.length > 0 && (
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

        <aside className={s.cta}>
          <p className={s.ctaEyebrow}>{chrome.cta.eyebrow}</p>
          <p className={s.ctaTitle}>{chrome.cta.title}</p>
          <p className={s.ctaText}>{chrome.cta.text}</p>
          <div className={s.ctaActions}>
            <Link className={s.ctaPrimary} href={contactHref}>
              {chrome.cta.primary}
            </Link>
            <Link className={s.ctaSecondary} href={basePath}>
              {chrome.cta.secondary}
            </Link>
          </div>
        </aside>
      </article>
    </>
  )
}
