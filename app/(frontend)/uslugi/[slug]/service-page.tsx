'use client'

import cn from 'clsx'
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Compass,
  HeartHandshake,
  Lightbulb,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  PenTool,
  Rocket,
  Search,
  ShoppingCart,
  Sparkles,
  Target,
  Users,
  Video as VideoIcon,
} from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import type { LocalizedUslugi, ServiceSection } from '@/lib/content/uslugi'
import { useReveal } from '@/lib/hooks/use-reveal'
import type { Localized } from '@/lib/i18n/parity'
import s from './service.module.css'

/*
 * Shared service-page renderer (design D1). Each service declares an ordered
 * `sections` array; this component renders them in order from a fixed set of
 * primitives. Imported by the PL (`/uslugi/[slug]`) and EN
 * (`/en/services/[slug]`) routes, which supply the locale-correct service,
 * chrome, and case-study base path.
 *
 * `Localized` widens each section's `kind` literal to `string`, so sections are
 * narrowed by property presence, not by `kind`.
 */

// Chrome shape is structurally identical across locales (uslugi.ts / uslugi.en.ts).
type Chrome = LocalizedUslugi['chrome']
// Widen the hand-written section union directly (not `typeof SERVICES`, whose
// empty `clips: []` literal would bottom the showreel out at `never[]`). Both
// the narrow PL sections and the widened EN sections are assignable to this.
type Section = Localized<ServiceSection>

/** A blog post surfaced under a platform section (design D5). Server-fetched,
 *  passed in as plain serializable data. */
export interface RelatedPost {
  slug: string
  title: string
  category?: string
}

export interface ServicePageProps {
  /**
   * The service's ordered sections. Typed as the widened (`Localized`) element
   * so both the narrow PL data and the widened EN data are assignable — the
   * renderer needs only the sections, not the whole `Service`.
   */
  sections: readonly Section[]
  chrome: Chrome
  /** Locale-correct case-study base (`/case-studies` or `/en/case-studies`). */
  caseStudyBase: string
  /**
   * Related posts keyed by platform, server-fetched for the CONTENT page's
   * platform sections (design D5). Omitted on locales without a blog (EN) and
   * for platforms with no matches — the block then simply doesn't render.
   */
  relatedByPlatform?: Record<string, readonly RelatedPost[]>
}

// —— Section-primitive view shapes (widened; the renderer narrows structurally) ——

interface HeroData {
  title: string
  intro: string
}
interface PlatformData {
  platform: string
  name: string
  copy: string
  cube?: string
  dashboard?: { src: string; alt: string; width: number; height: number }
}
interface TriptychData {
  kicker: string
  items: readonly { icon: string; title: string; body: string }[]
}
interface PartnerData {
  partner: string
  name: string
  logo?: string
  tagline?: string
  copy: string
  href: string
  image?: { src: string; alt: string; width: number; height: number }
  video?: { src: string; mobileSrc?: string; poster: string; alt: string }
}
interface ShowreelData {
  kicker: string
  clips: readonly { src: string; poster: string; alt: string }[]
}
interface ProofData {
  kicker: string
  heading: string
  cases: readonly {
    slug: string
    kicker: string
    title: string
    logo?: string
  }[]
}

// —— Lucide icon registry (repo rule: lucide only, never raw glyphs) ———————————

const ICONS: Record<string, LucideIcon> = {
  Search,
  Compass,
  Rocket,
  Target,
  ShoppingCart,
  BarChart3,
  PenTool,
  Video: VideoIcon,
  Sparkles,
  ClipboardCheck,
  Lightbulb,
  MessageSquare,
  Users,
  Megaphone,
  HeartHandshake,
}

// —— Hero ——————————————————————————————————————————————————————————————————————

/*
 * The shared multi-armed llama render is extracted from Figma once and shared by
 * every service page (design D3). Until it lands the hero renders llama-less on
 * flat plum (scaffold-with-omission). Flip this on and drop the PNG in when the
 * asset is delivered.
 */
const HERO_LLAMA: string | null = null

function Hero({ data, chrome }: { data: HeroData; chrome: Chrome }) {
  return (
    <section className={s.hero} data-theme="plum">
      <div className={s.heroInner}>
        <p className={s.breadcrumb}>{chrome.sectionLabel}</p>
        <div
          className={s.heroBody}
          data-has-llama={HERO_LLAMA ? '' : undefined}
        >
          <div className={s.heroCopy}>
            <h1 className={s.heroTitle}>
              {data.title}
              <span className={s.dot} aria-hidden="true">
                .
              </span>
            </h1>
            <p className={s.heroLead}>{data.intro}</p>
          </div>
          {HERO_LLAMA && (
            <div className={s.heroLlama} aria-hidden="true">
              <Image
                src={HERO_LLAMA}
                alt=""
                width={640}
                height={720}
                objectFit="contain"
                preload
                desktopSize="40vw"
                mobileSize="70vw"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// —— Platforms (CONTENT cubes; Sprzedaż dashboards) ————————————————————————————

function PlatformMedia({ item }: { item: PlatformData }) {
  if (item.cube) {
    return (
      <div className={s.platformCube} data-cube={item.cube}>
        <Image
          src={item.cube}
          alt=""
          width={520}
          height={520}
          objectFit="contain"
          desktopSize="34vw"
          mobileSize="60vw"
        />
      </div>
    )
  }
  if (item.dashboard) {
    return (
      <div className={s.platformDashboard}>
        <Image
          src={item.dashboard.src}
          alt={item.dashboard.alt}
          width={item.dashboard.width}
          height={item.dashboard.height}
          objectFit="contain"
          desktopSize="42vw"
          mobileSize="90vw"
        />
      </div>
    )
  }
  return null
}

function RelatedPosts({
  posts,
  kicker,
}: {
  posts: readonly RelatedPost[]
  kicker: string
}) {
  return (
    <div className={s.related}>
      <p className={s.relatedKicker}>{kicker}</p>
      <ul className={s.relatedList}>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link className={s.relatedItem} href={`/${post.slug}`}>
              {post.category && (
                <span className={s.relatedCategory}>{post.category}</span>
              )}
              <span className={s.relatedTitle}>{post.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PlatformBlock({
  item,
  index,
  related,
  relatedKicker,
}: {
  item: PlatformData
  index: number
  related?: readonly RelatedPost[] | undefined
  relatedKicker: string
}) {
  const ref = useReveal<HTMLDivElement>()
  const hasMedia = Boolean(item.cube || item.dashboard)

  return (
    <div
      ref={ref}
      className={cn(s.platform, !hasMedia && s.platformCopyOnly)}
      data-flip={index % 2 === 1 ? '' : undefined}
    >
      <div className={s.platformCopy} data-reveal-item>
        <h3 className={s.platformName}>{item.name}</h3>
        <p className={s.platformText}>{item.copy}</p>
        {/* Related posts — omitted entirely when there are no matches (D5). */}
        {related && related.length > 0 && (
          <RelatedPosts posts={related} kicker={relatedKicker} />
        )}
      </div>
      {hasMedia && (
        <div className={s.platformMedia} data-reveal-item>
          <PlatformMedia item={item} />
        </div>
      )}
    </div>
  )
}

function Platforms({
  items,
  relatedByPlatform,
  relatedKicker,
}: {
  items: readonly PlatformData[]
  relatedByPlatform?: Record<string, readonly RelatedPost[]> | undefined
  relatedKicker: string
}) {
  return (
    <section className={s.platforms} data-theme="cream">
      <div className={s.platformsInner}>
        {items.map((item, index) => (
          <PlatformBlock
            key={item.platform}
            item={item}
            index={index}
            related={relatedByPlatform?.[item.platform]}
            relatedKicker={relatedKicker}
          />
        ))}
      </div>
    </section>
  )
}

// —— Triptych (numbered brand-native cards, o-nas card language — design D4) ——

function Triptych({ data }: { data: TriptychData }) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className={s.triptych} data-theme="cream">
      <div ref={ref} className={s.triptychInner}>
        <p className={s.kicker}>{data.kicker}</p>
        <ol className={s.cards}>
          {data.items.map((item, index) => {
            const Icon = ICONS[item.icon] ?? Sparkles
            return (
              <li key={item.title} data-reveal-item className={s.card}>
                <div className={s.cardHead}>
                  <span className={s.cardNum}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={s.cardIcon}>
                    <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </div>
                <h3 className={s.cardTitle}>{item.title}</h3>
                <p className={s.cardBody}>{item.body}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

// —— Partner (Good One siblings: DIEA / Folks / TymKor) ————————————————————————

/**
 * Full-bleed cinematic cover — the partner's showreel plays as an ambient muted
 * loop behind a dark scrim, with the partner's branding overlaid (DIEA on
 * Kreacje). Echoes the partner's own identity (a warm gold accent for DIEA).
 */
function PartnerCover({
  data,
  video,
  chrome,
}: {
  data: PartnerData
  video: NonNullable<PartnerData['video']>
  chrome: Chrome
}) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className={s.partnerCover} data-partner={data.partner}>
      <div className={s.partnerCoverMedia} aria-hidden="true">
        <Video
          src={video.src}
          {...(video.mobileSrc ? { mobileSrc: video.mobileSrc } : {})}
          poster={video.poster}
          alt={video.alt}
          className={s.partnerCoverVideo}
        />
        <div className={s.partnerCoverScrim} />
      </div>
      <div ref={ref} className={s.partnerCoverInner}>
        <p className={s.partnerKicker} data-reveal-item>
          {chrome.partnerKicker}
        </p>
        {data.logo ? (
          <span className={s.partnerLogo} data-reveal-item>
            <Image
              src={data.logo}
              alt={data.name}
              width={319}
              height={104}
              objectFit="contain"
            />
          </span>
        ) : (
          <p className={s.partnerWordmark} data-reveal-item>
            {data.name}
          </p>
        )}
        {data.tagline && (
          <p className={s.partnerTagline} data-reveal-item>
            {data.tagline}
          </p>
        )}
        <p className={s.partnerCoverText} data-reveal-item>
          {data.copy}
        </p>
      </div>
    </section>
  )
}

function Partner({ data, chrome }: { data: PartnerData; chrome: Chrome }) {
  const ref = useReveal<HTMLDivElement>()

  if (data.video) {
    return <PartnerCover data={data} video={data.video} chrome={chrome} />
  }

  return (
    <section className={s.partner} data-theme="plum">
      <div ref={ref} className={s.partnerInner}>
        <div className={s.partnerCopy} data-reveal-item>
          <p className={s.partnerKicker}>{chrome.partnerKicker}</p>
          <p className={s.partnerName}>{data.name}</p>
          <p className={s.partnerText}>{data.copy}</p>
          <Link className={s.partnerCta} href={data.href}>
            {chrome.ctaButton}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {data.image && (
          <div className={s.partnerMedia} data-reveal-item>
            <Image
              src={data.image.src}
              alt={data.image.alt}
              width={data.image.width}
              height={data.image.height}
              objectFit="cover"
              desktopSize="46vw"
              mobileSize="90vw"
            />
          </div>
        )}
      </div>
    </section>
  )
}

// —— Showreel (reuses the Video primitive; omits itself when no clips) —————————

function Showreel({ data }: { data: ShowreelData }) {
  const ref = useReveal<HTMLDivElement>()
  if (data.clips.length === 0) {
    return null
  }

  return (
    <section className={s.showreel} data-theme="cream">
      <div ref={ref} className={s.showreelInner}>
        <p className={s.kicker}>{data.kicker}</p>
        <div className={s.showreelGrid}>
          {data.clips.map((clip) => (
            <div key={clip.src} data-reveal-item className={s.showreelClip}>
              <Video
                src={clip.src}
                poster={clip.poster}
                alt={clip.alt}
                className={s.showreelVideo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// —— Proof (case-study cards reusing existing assets) —————————————————————————

function Proof({
  data,
  chrome,
  caseStudyBase,
}: {
  data: ProofData
  chrome: Chrome
  caseStudyBase: string
}) {
  const ref = useReveal<HTMLDivElement>()
  if (data.cases.length === 0) {
    return null
  }

  return (
    <section className={s.proof} data-theme="cream">
      <div ref={ref} className={s.proofInner}>
        <div className={s.proofHead}>
          <p className={s.kicker}>{data.kicker}</p>
          <h2 className={s.proofHeading}>{data.heading}</h2>
        </div>
        <div className={s.proofCards}>
          {data.cases.map((item) => (
            <Link
              key={item.slug}
              data-reveal-item
              className={s.caseCard}
              href={`${caseStudyBase}/${item.slug}`}
            >
              <span className={s.caseCardKicker}>{item.kicker}</span>
              <span className={s.caseCardTitle}>{item.title}</span>
              {item.logo && (
                <span className={s.caseCardLogo}>
                  {/* Logos are locale-independent public assets, not prefixed. */}
                  <Image
                    src={item.logo}
                    alt=""
                    width={140}
                    height={44}
                    objectFit="contain"
                  />
                </span>
              )}
              <span className={s.caseCardCta}>
                {chrome.proofCta}
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// —— Closing CTA (mirrors the branze CTA card) ————————————————————————————————

function CtaBand({ chrome }: { chrome: Chrome }) {
  return (
    <section className={s.ctaBand} data-theme="cream">
      <div className={s.cta}>
        <p className={s.ctaEyebrow}>{chrome.ctaEyebrow}</p>
        <h2 className={s.ctaTitle}>{chrome.ctaHeadline}</h2>
        <p className={s.ctaText}>{chrome.ctaText}</p>
        <div className={s.ctaActions}>
          <Link className={s.ctaPrimary} href={chrome.ctaHref}>
            {chrome.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  )
}

// —— Composition ———————————————————————————————————————————————————————————————

export function ServicePage({
  sections,
  chrome,
  caseStudyBase,
  relatedByPlatform,
}: ServicePageProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${index}`
        if ('intro' in section) {
          return <Hero key={key} data={section as HeroData} chrome={chrome} />
        }
        if ('cases' in section) {
          return (
            <Proof
              key={key}
              data={section as ProofData}
              chrome={chrome}
              caseStudyBase={caseStudyBase}
            />
          )
        }
        if ('clips' in section) {
          return <Showreel key={key} data={section as ShowreelData} />
        }
        if ('partner' in section) {
          return (
            <Partner key={key} data={section as PartnerData} chrome={chrome} />
          )
        }
        if ('items' in section && 'kicker' in section) {
          return <Triptych key={key} data={section as TriptychData} />
        }
        if ('items' in section) {
          return (
            <Platforms
              key={key}
              items={(section as { items: readonly PlatformData[] }).items}
              relatedByPlatform={relatedByPlatform}
              relatedKicker={chrome.relatedKicker}
            />
          )
        }
        return null
      })}
      <CtaBand chrome={chrome} />
    </>
  )
}
