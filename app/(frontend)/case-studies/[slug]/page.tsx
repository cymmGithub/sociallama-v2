import cn from 'clsx'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { PostRichText } from '@/app/(frontend)/[slug]/rich-text'
import { Wrapper } from '@/components/layout/wrapper'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { OG_BASE } from '@/lib/content/site'
import {
  caseStudyHeadline,
  getCaseStudyBySlug,
  getDraftCaseStudyBySlug,
  getPublishedCaseStudySlugs,
  getSocialPlatforms,
  resolveMedia,
} from '@/lib/payload/queries'
import type { CaseStudy } from '@/payload-types'
import s from './case-study.module.css'
import { CountUp } from './count-up'
import { CaseStudyJsonLd } from './json-ld'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedCaseStudySlugs()
  // Cache Components requires a non-empty param set; on an empty CMS prerender
  // one guaranteed-404 path so the build succeeds before seeding.
  if (slugs.length === 0) {
    return [{ slug: 'placeholder-bez-tresci' }]
  }
  return slugs.map((slug) => ({ slug }))
}

async function loadCaseStudy(slug: string): Promise<CaseStudy | null> {
  const { isEnabled: isDraft } = await draftMode()
  return isDraft ? getDraftCaseStudyBySlug(slug) : getCaseStudyBySlug(slug)
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const study = await loadCaseStudy(slug)
  if (!study) {
    return {}
  }

  const title = study.seo?.metaTitle || study.title
  const description = study.seo?.metaDescription || study.excerpt || undefined
  const ogMedia = resolveMedia(study.seo?.ogImage) ?? resolveMedia(study.cover)
  const ogUrl = ogMedia?.sizes?.og?.url ?? ogMedia?.url

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: {
      type: 'article',
      ...OG_BASE,
      title,
      ...(description ? { description } : {}),
      url: `/case-studies/${study.slug}`,
      ...(ogUrl ? { images: [{ url: ogUrl, width: 1200, height: 630 }] } : {}),
      ...(study.publishedAt ? { publishedTime: study.publishedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  }
}

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

/** Normalize a platform label for logo matching: "TikTok" → "tiktok". */
const normalizePlatform = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '')

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const [study, platforms] = await Promise.all([
    loadCaseStudy(slug),
    getSocialPlatforms(),
  ])
  if (!study) {
    notFound()
  }

  // Match a result group's platform to its CMS-held logo (by key or name).
  const platformLogos = new Map<string, ReturnType<typeof resolveMedia>>()
  for (const platform of platforms) {
    const media = resolveMedia(platform.logo)
    if (media) {
      platformLogos.set(normalizePlatform(platform.key), media)
      platformLogos.set(normalizePlatform(platform.name), media)
    }
  }

  const logo = resolveMedia(study.client.logo)
  const cover = resolveMedia(study.cover)
  const resultGroups = groupResults(study.results)
  const gallery = (study.gallery ?? [])
    .map((item) => resolveMedia(item))
    .filter((media): media is NonNullable<typeof media> => media !== null)

  return (
    <Wrapper theme="cream">
      <CaseStudyJsonLd study={study} coverUrl={cover?.url} />
      <article className={s.article}>
        <header className={s.hero}>
          <nav className={s.breadcrumb} aria-label="Ścieżka nawigacji">
            <Link href="/case-studies">Case studies</Link>
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
              Nasz klient
            </h2>
            <div className={s.prose}>
              <PostRichText data={study.client.about} />
            </div>
          </section>
        )}

        {study.challenge && (
          <section className={s.section} aria-labelledby="wyzwanie">
            <h2 className={s.sectionTitle} id="wyzwanie">
              Wyzwanie
            </h2>
            <div className={s.prose}>
              <PostRichText data={study.challenge} />
            </div>
          </section>
        )}

        {study.approach && study.approach.length > 0 && (
          <section className={s.section} aria-labelledby="podejscie">
            <h2 className={s.sectionTitle} id="podejscie">
              Podejście
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

        {resultGroups.length > 0 && (
          <section className={s.section} aria-labelledby="wyniki">
            <h2 className={s.sectionTitle} id="wyniki">
              Wyniki
            </h2>
            <div className={s.results}>
              {resultGroups.map((group) => {
                const platformLogo = platformLogos.get(
                  normalizePlatform(group.platform)
                )
                return (
                  <div key={group.platform} className={s.resultGroup}>
                    <h3 className={s.resultGroupTitle}>
                      {platformLogo?.url && (
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
                    <div className={s.tiles}>
                      {group.items.map((item) => (
                        <div
                          key={`${item.metric}-${item.value}`}
                          className={s.tile}
                        >
                          <CountUp className={s.tileValue} value={item.value} />
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

        {gallery.length > 0 && (
          <section className={s.section} aria-labelledby="galeria">
            <h2 className={s.sectionTitle} id="galeria">
              Galeria
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
          <p className={s.ctaEyebrow}>Twój ruch</p>
          <p className={s.ctaTitle}>Zbudujmy coś podobnego dla Twojej marki</p>
          <p className={s.ctaText}>
            Opowiedz nam o swoim wyzwaniu — pokażemy, jak możemy pomóc.
          </p>
          <div className={s.ctaActions}>
            <Link className={s.ctaPrimary} href="/kontakt">
              Bezpłatna konsultacja
            </Link>
            <Link className={s.ctaSecondary} href="/case-studies">
              Zobacz inne case studies
            </Link>
          </div>
        </aside>
      </article>
    </Wrapper>
  )
}
