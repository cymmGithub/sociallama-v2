'use client'

import cn from 'clsx'
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Compass,
  Globe,
  HeartHandshake,
  Lightbulb,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  PenTool,
  Rocket,
  Search,
  ShoppingCart,
  Sparkles,
  Target,
  Users,
  Video as VideoIcon,
  Wallet,
} from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { SocialGlyph } from '@/components/ui/social-glyph'
import { Video } from '@/components/ui/video'
import type { SocialIconName } from '@/lib/content/socials'
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
 * `Localized` widens each section's `kind` literal to `string`, so TypeScript
 * can't narrow the union. Sections are therefore dispatched on `kind` at
 * runtime and cast per branch (design D8) — never by property presence, which
 * would be order-dependent and silently breakable as kinds are added.
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
   * Locale-correct post base, joined as `${postBase}/${slug}`. Polish posts
   * sit at the root for WordPress parity, so PL passes the empty string;
   * English posts are namespaced, so EN passes `/en/blog`.
   */
  postBase: string
  /**
   * Related posts keyed by platform, server-fetched for the CONTENT page's
   * platform sections (design D5). Omitted for platforms with no matches, and
   * for a locale with no translated posts — the block then simply doesn't
   * render.
   */
  relatedByPlatform?: Record<string, readonly RelatedPost[]>
  /**
   * Posts for a `posts` section, server-fetched by category (design D5).
   * Omitted when the locale's data declares no such section, or when nothing
   * matches — either way it can't render.
   */
  topicalPosts?: readonly RelatedPost[]
}

// —— Section-primitive view shapes (widened; the renderer narrows structurally) ——

interface CtaData {
  label: string
  href: string
}
interface HeroData {
  title: string
  intro: string
  cta?: CtaData
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
  unnumbered?: boolean
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
    /** Carried by the logo's `alt` — the title no longer names the client. */
    brand: string
    logo?: string
  }[]
}
interface ChecklistData {
  kicker: string
  heading: string
  intro?: string
  items: readonly string[]
  media?: { src: string; alt: string; width: number; height: number }
  backdrop?: { src: string; mobileSrc?: string; poster: string; alt: string }
}
interface TimelineData {
  kicker: string
  heading: string
  steps: readonly { title: string; body: string }[]
}
interface BannerData {
  heading: string
  body: string
  cta: CtaData
}
interface LogoStripData {
  heading: string
  logos: readonly { name: string; icon: SocialIconName }[]
}
interface PostsData {
  kicker: string
  heading: string
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
  Wallet,
  Globe,
  MousePointerClick,
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
            {/* Optional — heroes declared without a CTA render exactly as before. */}
            {data.cta && (
              <Link className={s.heroCta} href={data.cta.href}>
                {data.cta.label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
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
      <div className={s.platformCube}>
        <Image
          src={item.cube}
          alt=""
          width={780}
          height={663}
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
  postBase,
}: {
  posts: readonly RelatedPost[]
  kicker: string
  postBase: string
}) {
  return (
    <div className={s.related}>
      <p className={s.relatedKicker}>{kicker}</p>
      <ul className={s.relatedList}>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link className={s.relatedItem} href={`${postBase}/${post.slug}`}>
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
  postBase,
}: {
  item: PlatformData
  index: number
  related?: readonly RelatedPost[] | undefined
  relatedKicker: string
  postBase: string
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
          <RelatedPosts
            posts={related}
            kicker={relatedKicker}
            postBase={postBase}
          />
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
  postBase,
}: {
  items: readonly PlatformData[]
  relatedByPlatform?: Record<string, readonly RelatedPost[]> | undefined
  relatedKicker: string
  postBase: string
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
            postBase={postBase}
          />
        ))}
      </div>
    </section>
  )
}

// —— Triptych (brand-native cards, o-nas card language — design D4) ————————————

function Triptych({ data }: { data: TriptychData }) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className={s.triptych} data-theme="cream">
      <div ref={ref} className={s.triptychInner}>
        <p className={s.kicker}>{data.kicker}</p>
        {/* The column count is data-driven: three stays three, four lays out
            2×2 until there's room for a single row of four (task 3.6). */}
        <ol className={s.cards} data-count={data.items.length}>
          {data.items.map((item, index) => {
            const Icon = ICONS[item.icon] ?? Sparkles
            return (
              <li key={item.title} data-reveal-item className={s.card}>
                <div className={s.cardHead}>
                  {/* Ordinals imply sequence. Parallel capabilities (the
                      ad-campaigns tiles) opt out; the icon then sits alone at
                      the head's start, which `space-between` already gives. */}
                  {!data.unnumbered && (
                    <span className={s.cardNum}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
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

// —— Partner (Good One siblings: DIEA / Folks / SEOFly / TymKor) ——————————————

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
          <span
            className={s.partnerLockup}
            data-reveal-item
            role="img"
            aria-label={`${data.name} × Social Lama`}
          >
            <Image
              className={s.lockupPartner}
              src={data.logo}
              alt=""
              width={319}
              height={104}
              objectFit="contain"
            />
            <span className={s.lockupX} aria-hidden="true">
              ×
            </span>
            <Image
              className={s.lockupLama}
              src="/assets/sociallama-logo-light.svg"
              alt=""
              width={105}
              height={73}
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
                  {/* Logos are locale-independent public assets, not prefixed.
                      The card is a single link, so its accessible name is built
                      from its contents — and the title no longer names the
                      client. This `alt` is what keeps the client in that name. */}
                  <Image
                    src={item.logo}
                    alt={item.brand}
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

// —— Checklist (ticked deliverables; graphic optional — task 3.1) ——————————————

function Checklist({ data }: { data: ChecklistData }) {
  const ref = useReveal<HTMLDivElement>()
  const { backdrop } = data

  return (
    <section
      className={s.checklist}
      /* The backdrop variant runs dark, so it opts out of the cream palette
         the same way the partner cover does — by carrying no theme at all. */
      data-theme={backdrop ? undefined : 'cream'}
      data-backdrop={backdrop ? '' : undefined}
    >
      {backdrop && (
        <div className={s.checklistBackdrop} aria-hidden="true">
          <Video
            src={backdrop.src}
            {...(backdrop.mobileSrc ? { mobileSrc: backdrop.mobileSrc } : {})}
            poster={backdrop.poster}
            alt={backdrop.alt}
            className={s.checklistBackdropVideo}
          />
          <div className={s.checklistScrim} />
        </div>
      )}
      <div
        ref={ref}
        className={s.checklistInner}
        data-has-media={data.media ? '' : undefined}
      >
        <div className={s.checklistCopy} data-reveal-item>
          <p className={s.kicker}>{data.kicker}</p>
          <h2 className={s.sectionHeading}>{data.heading}</h2>
          {data.intro && <p className={s.checklistIntro}>{data.intro}</p>}
          <ul className={s.checks}>
            {data.items.map((item) => (
              <li key={item} className={s.check}>
                <span className={s.checkMark} aria-hidden="true">
                  <Check size={15} strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Media is optional and currently unsourced on Strategia. Absent, the
            grid collapses to a single column — no empty frame, no placeholder. */}
        {data.media && (
          <div className={s.checklistMedia} data-reveal-item>
            <Image
              src={data.media.src}
              alt={data.media.alt}
              width={data.media.width}
              height={data.media.height}
              objectFit="contain"
              desktopSize="42vw"
              mobileSize="90vw"
            />
          </div>
        )}
      </div>
    </section>
  )
}

// —— Timeline (ordered process; the sequencing is the point — task 3.2) ————————

function Timeline({ data }: { data: TimelineData }) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className={s.timeline} data-theme="cream">
      <div ref={ref} className={s.timelineInner}>
        <p className={s.kicker}>{data.kicker}</p>
        <h2 className={s.sectionHeading}>{data.heading}</h2>
        <ol className={s.steps}>
          {data.steps.map((step, index) => (
            <li key={step.title} data-reveal-item className={s.step}>
              <span className={s.stepMarker} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// —— Banner (highlighted offer band; Strategia + Audyt — design D3) ————————————

function Banner({ data }: { data: BannerData }) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className={s.banner} data-theme="plum">
      <div ref={ref} className={s.bannerInner}>
        <div className={s.bannerCopy} data-reveal-item>
          <h2 className={s.bannerHeading}>{data.heading}</h2>
          <p className={s.bannerText}>{data.body}</p>
        </div>
        <div className={s.bannerAction} data-reveal-item>
          <Link className={s.bannerCta} href={data.cta.href}>
            {data.cta.label}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// —— Logo strip (audited platforms; existing marks only — task 3.4) ————————————

function LogoStrip({ data }: { data: LogoStripData }) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className={s.logoStrip} data-theme="cream">
      <div ref={ref} className={s.logoStripInner}>
        <h2 className={s.logoStripHeading}>{data.heading}</h2>
        <ul className={s.logos}>
          {data.logos.map((logo) => (
            <li key={logo.name} data-reveal-item>
              {/* Marks only, no names and no separators (client direction).
                  Inline glyphs on currentColor take the band's ink colour,
                  exactly like the footer social set. */}
              <SocialGlyph
                name={logo.icon}
                label={logo.name}
                className={s.logoMark}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// —— Topical posts (blog links by category; omits when empty — design D5) ——————

function TopicalPosts({
  data,
  posts,
  postBase,
}: {
  data: PostsData
  posts: readonly RelatedPost[]
  postBase: string
}) {
  const ref = useReveal<HTMLDivElement>()
  // Graceful omission: no matches means no heading either (D5). This also makes
  // the section a no-op in EN, which never passes posts.
  if (posts.length === 0) {
    return null
  }

  return (
    <section className={s.posts} data-theme="cream">
      <div ref={ref} className={s.postsInner}>
        <p className={s.kicker}>{data.kicker}</p>
        <h2 className={s.sectionHeading}>{data.heading}</h2>
        <ul className={s.postCards}>
          {posts.map((post) => (
            <li key={post.slug} data-reveal-item>
              <Link className={s.postCard} href={`${postBase}/${post.slug}`}>
                {post.category && (
                  <span className={s.postCategory}>{post.category}</span>
                )}
                <span className={s.postTitle}>{post.title}</span>
                <span className={s.postCta} aria-hidden="true">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// —— Closing CTA (mirrors the branze CTA card) ————————————————————————————————

function CtaBand({ chrome }: { chrome: Chrome }) {
  return (
    <section className={s.ctaBand} data-theme="cream">
      <div className={s.cta}>
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
  postBase,
  relatedByPlatform,
  topicalPosts,
}: ServicePageProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${index}`
        // Dispatch on the declared kind, not on property presence (design D8).
        // `Localized` widens `kind` to `string`, so TypeScript can't narrow the
        // union for us — hence the per-branch casts, unchanged from before.
        switch (section.kind) {
          case 'hero':
            return <Hero key={key} data={section as HeroData} chrome={chrome} />
          case 'platforms':
            return (
              <Platforms
                key={key}
                items={(section as { items: readonly PlatformData[] }).items}
                relatedByPlatform={relatedByPlatform}
                relatedKicker={chrome.relatedKicker}
                postBase={postBase}
              />
            )
          case 'triptych':
            return <Triptych key={key} data={section as TriptychData} />
          case 'partner':
            return (
              <Partner
                key={key}
                data={section as PartnerData}
                chrome={chrome}
              />
            )
          case 'showreel':
            return <Showreel key={key} data={section as ShowreelData} />
          case 'proof':
            return (
              <Proof
                key={key}
                data={section as ProofData}
                chrome={chrome}
                caseStudyBase={caseStudyBase}
              />
            )
          case 'checklist':
            return <Checklist key={key} data={section as ChecklistData} />
          case 'timeline':
            return <Timeline key={key} data={section as TimelineData} />
          case 'banner':
            return <Banner key={key} data={section as BannerData} />
          case 'logoStrip':
            return <LogoStrip key={key} data={section as LogoStripData} />
          case 'posts':
            return (
              <TopicalPosts
                key={key}
                data={section as PostsData}
                posts={topicalPosts ?? []}
                postBase={postBase}
              />
            )
          default:
            return null
        }
      })}
      <CtaBand chrome={chrome} />
    </>
  )
}
