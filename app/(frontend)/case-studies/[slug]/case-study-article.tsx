import cn from 'clsx'
import type { CSSProperties } from 'react'
import { PostRichText } from '@/app/(frontend)/[slug]/rich-text'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'
import { EN_HOME, type Locale, PL_HOME } from '@/lib/i18n/slug-map'
import { caseStudyHeadline, resolveMedia } from '@/lib/payload/queries'
import type { CaseStudy, SocialPlatform } from '@/payload-types'
import { BrandIcon, hasBrandIcon } from './brand-icons'
import s from './case-study.module.css'
import { CountUp } from './count-up'
import { CaseStudyJsonLd } from './json-ld'

/** Group per-platform metrics for tile rendering, preserving order. */
function groupResults(results: CaseStudy['results']) {
  const groups: {
    platform: string
    items: { metric: string; value: string }[]
  }[] = []
  for (const result of results ?? []) {
    let group = groups.find((g) => g.platform === result.platform)
    if (!group) {
      group = { platform: result.platform, items: [] }
      groups.push(group)
    }
    group.items.push({ metric: result.metric, value: result.value })
  }
  return groups
}

/**
 * Split `count` metrics into rows of at most `max`, as evenly as the count
 * allows, so a group never ends on a stranded tile: five metrics are 3+2, not
 * 4+1. Row lengths land in 1–4, and every one of those divides the 12 tracks
 * `.tiles` lays down, so each row fills the measure exactly.
 */
function rowPlan(count: number, max: number) {
  const rows = Math.ceil(count / max)
  const base = Math.floor(count / rows)
  const wide = count % rows
  return Array.from({ length: rows }, (_, i) => (i < wide ? base + 1 : base))
}

/** Each tile's column span on that 12-track grid, in render order. */
const tileSpans = (count: number, max: number) =>
  rowPlan(count, max).flatMap((length) =>
    Array.from({ length }, () => 12 / length)
  )

/** Normalize a platform label for logo matching: "TikTok" → "tiktok". */
const normalizePlatform = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * The full case-study article, shared by the Polish (`/case-studies/[slug]`) and
 * English (`/en/case-studies/[slug]`) detail pages. Study fields come from
 * Payload (locale-resolved by the page); the page furniture — section headings,
 * breadcrumb, CTA — comes from `chrome`, and `basePath` / `contactHref` localize
 * the internal links.
 */
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
  // Match a result group's platform to its CMS-held logo (by key or name).
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
              <PostRichText
                basePath={postBase}
                categoryPath={categoryBase}
                fallbackHref={linkFallback}
                locale={locale}
                data={study.client.about}
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
              />
            </div>
          </section>
        )}

        {resultGroups.length > 0 && (
          <section className={s.section} aria-labelledby="wyniki">
            <h2 className={s.sectionTitle} id="wyniki">
              {chrome.sections.results}
            </h2>
            <div className={s.results}>
              {resultGroups.map((group) => {
                const platformKey = normalizePlatform(group.platform)
                const platformLogo = platformLogos.get(platformKey)
                // Four tiles a row on desktop, two on mobile — but balanced, so
                // the last row is never a lone tile against an empty measure.
                const spanMobile = tileSpans(group.items.length, 2)
                // Except when the group holds a single metric. Stretching that
                // one across the measure only moves the emptiness inside the
                // tile, where the orange fill makes it read louder than the gap
                // ever did — "77 tys. / Widzów" is 13 characters holding up a
                // 1152px bar. It keeps a normal tile's width instead.
                const spanDesktop = tileSpans(group.items.length, 4).map(
                  (span) => (span === 12 ? 4 : span)
                )
                // The tile's own width decides how big its number may be, and
                // the group's longest value decides for all of them, so the
                // numbers in a row stay one size. See .tileValue.
                const longest = Math.max(
                  ...group.items.map((item) => item.value.length)
                )
                return (
                  <div key={group.platform} className={s.resultGroup}>
                    <h3 className={s.resultGroupTitle}>
                      {/* Prefer the full-color brand mark; fall back to the CMS
                          logo only for platforms we don't ship an icon for. */}
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
                      {group.platform}
                    </h3>
                    <div
                      className={s.tiles}
                      style={{ '--len': longest } as CSSProperties}
                    >
                      {group.items.map((item, index) => (
                        <div
                          key={`${item.metric}-${item.value}`}
                          className={s.tile}
                          style={
                            {
                              '--span-d': spanDesktop[index],
                              '--span-m': spanMobile[index],
                            } as CSSProperties
                          }
                        >
                          <CountUp
                            className={s.tileValue}
                            value={item.value}
                            locale={locale}
                          />
                          <span className={s.tileMetric}>{item.metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
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
                          <PostRichText
                            basePath={postBase}
                            categoryPath={categoryBase}
                            data={pillar.body}
                            fallbackHref={linkFallback}
                            locale={locale}
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
