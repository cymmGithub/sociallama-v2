'use client'

import cn from 'clsx'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Marquee } from '@/components/ui/marquee'
import type {
  Industry,
  IndustryCreative,
  LocalizedBranze,
} from '@/lib/content/branze'
import { usePreferredReducedMotion } from '@/lib/hooks'
import { useReveal } from '@/lib/hooks/use-reveal'
import {
  HUB_BACK_TRANSITION,
  POSTER_MORPH_SHARE,
} from '@/lib/utils/view-transitions'
import s from './industry.module.css'

/*
 * Shared industry-page template (design D2). One component, two data-driven
 * variants — an entry with a `caseStudy` block renders the proof layout
 * (mock C), otherwise the editorial layout (mock B). Both open with the hero
 * then the `IndustryBrief` (design 2026-07-23). Imported by the PL
 * (`/branze/[slug]`) and EN (`/en/industries/[slug]`) routes, which supply the
 * locale-correct content, chrome, and case-study base path.
 */

// Chrome shape is structurally identical across locales (branze.ts / branze.en.ts).
type Chrome = LocalizedBranze['chrome']

export interface IndustryPageProps {
  industry: Industry
  chrome: Chrome
  /**
   * Locale-correct industries hub (`/branze` or `/en/industries`), behind the
   * hero's back link. A deterministic destination rather than `history.back()`
   * so deep-linked visitors — who have no in-site history — can still go up.
   */
  hubHref: string
  /** Locale-correct case-study base (`/case-studies` or `/en/case-studies`). */
  caseStudyBase: string
}

/**
 * Related-card logo path, with a per-slug cache-bust. Vercel's image-optimizer
 * cache keys on the URL alone, so after an in-place byte replacement a bare
 * path keeps serving the old artwork for the full variant TTL. Bump a slug's
 * entry whenever its file's CONTENT changes (volvo's annotation and breville's
 * colour mark, 2026-08-20 review) — only bumped slugs re-optimize.
 */
const LOGO_V: Record<string, string> = {
  volvo: '?v=2',
  breville: '?v=2',
  // 2026-08-24: boards trimmed down to the mark itself — ozgasl was an
  // 800×800 square with 240px transparent bands, kohersen/foodsaver sat on
  // opaque white 2:1 boards, stadler-form carried 144px transparent bands.
  // Each rendered taller than its visible mark and threw the card row off.
  ozgasl: '?v=2',
  kohersen: '?v=2',
  foodsaver: '?v=2',
  'stadler-form': '?v=2',
}
const studyLogoSrc = (slug: string) =>
  `/case-studies/${slug}/${slug}-logo.png${LOGO_V[slug] ?? ''}`

/** Most related-study cards a page shows — the single desktop row's budget. */
export const MAX_RELATED = 6

/* Keyword marquee — shared by both layouts (a proof page can carry one too). */
function IndustryMarquee({ industry }: { industry: Industry }) {
  if (!industry.marquee || industry.marquee.length === 0) {
    return null
  }
  return (
    <section className={s.marquee} data-theme="plum" aria-hidden="true">
      <Marquee className={s.marqueeRow} repeat={3} speed={1.1}>
        <span className={s.marqueeFill}>
          {industry.marquee.map((word) => (
            <span key={word}>
              {word}
              <span className={s.marqueeSep}>·</span>
            </span>
          ))}
        </span>
      </Marquee>
    </section>
  )
}

/*
 * "NASZE PODEJŚCIE" plate — one composed band rather than a photo strip stacked
 * above a copy block. The statement and its value chips sit on the sand ground;
 * the industry photo bleeds off the section's outer edge, which is what makes
 * the two halves read as a single object. Renders whatever the industry has:
 * proof pages carry a photo but no manifesto, so the plate degrades to a
 * photo-only band rather than disappearing.
 */
function IndustryApproach({
  industry,
  chrome,
}: {
  industry: Industry
  chrome: Chrome
}) {
  const ref = useReveal<HTMLDivElement>()
  const photo = industry.collage?.[0]
  const hasCopy = Boolean(industry.manifesto && industry.chips)
  if (!(hasCopy || photo)) {
    return null
  }

  return (
    <section className={s.approach} data-theme="cream">
      <div
        ref={ref}
        className={s.approachInner}
        data-photo-only={!hasCopy || undefined}
      >
        {industry.manifesto && industry.chips && (
          <div className={s.approachCopy}>
            <p data-reveal-item className={s.kicker}>
              {chrome.editorial.manifestoKicker}
            </p>
            <h2 data-reveal-item className={s.manifestoHeading}>
              <span className={s.manifestoLead}>{industry.manifesto.lead}</span>{' '}
              <span className={s.manifestoRest}>{industry.manifesto.rest}</span>
            </h2>
            <Chips chips={industry.chips} />
          </div>
        )}

        {photo && (
          <figure data-reveal-item className={s.approachFigure}>
            <Image
              className={s.approachImg}
              src={photo.src}
              alt={photo.alt}
              fill
              objectFit="cover"
              desktopSize="46vw"
              mobileSize="100vw"
            />
          </figure>
        )}
      </div>
    </section>
  )
}

// —— Shared pieces ————————————————————————————————————————————————————————————

/*
 * Related-studies row. ADDITIVE and rendered by BOTH variants — unlike the
 * `caseStudy` block it never selects the layout, so an editorial industry keeps
 * its collage/marquee/manifesto while still linking out. Needs no client quote,
 * which is why it can ship ahead of testimonial collection. Renders nothing when
 * an industry has no mapping (e.g. Finanse, Fashion) so there's no empty shell.
 */
function RelatedCaseStudies({
  industry,
  chrome,
  caseStudyBase,
}: Omit<IndustryPageProps, 'hubHref'>) {
  const ref = useReveal<HTMLDivElement>()
  // Hard cap at six (owner call, 2026-08-24): the desktop row never wraps, so
  // a seventh card only squeezes the others. branze.test.ts pins the content
  // to the cap too, so an overgrown roster fails loudly instead of truncating
  // here silently.
  const studies = industry.relatedCaseStudies?.slice(0, MAX_RELATED)
  if (!studies || studies.length === 0) {
    return null
  }

  return (
    <section
      className={s.related}
      data-theme="cream"
      /* One linked study (e.g. beauty): heading left, the lone card right —
         a centered single card under a centered heading read as a stub
         (owner sketch, 2026-08-24). */
      data-lone={studies.length === 1 || undefined}
      /* Four or more cards stretch across the full row (owner call,
         2026-08-24); fewer stay centered at their natural width. */
      data-stretch={studies.length >= 4 || undefined}
    >
      <div className={s.relatedInner}>
        <div className={s.relatedHead}>
          <p className={s.kicker}>{chrome.related.kicker}</p>
          <h2 className={s.relatedHeading}>
            <span className={s.headingAccent}>
              {chrome.related.headingAccent}
            </span>{' '}
            {chrome.related.heading}
          </h2>
        </div>
        <div className={s.relatedGrid} ref={ref}>
          {studies.map((study) => (
            <Link
              key={study.slug}
              className={s.relatedCard}
              href={`${caseStudyBase}/${study.slug}`}
            >
              {study.logo !== false && (
                <span className={s.relatedCardLogo}>
                  {/* Logos are locale-independent public assets, not prefixed. */}
                  <Image
                    src={studyLogoSrc(study.slug)}
                    alt=""
                    width={120}
                    height={38}
                    objectFit="contain"
                  />
                </span>
              )}
              <span className={s.relatedCardTitle}>{study.title}</span>
              <span className={s.relatedCardCta}>
                {chrome.related.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/*
 * Industries whose hero carries a background clip. The assets are
 * locale-independent, so they're derived from the id rather than duplicated
 * across both content modules: `/branze/<id>/hero.mp4` + `/branze/<id>/hero.jpg`.
 * An id absent here falls back to the flat plum band.
 *
 * Footage: Pexels (free licence, no attribution required), user-selected
 * 2026-07-24. Each is a 7s seamless loop (the closing half-second crossfades
 * into the opening one), 1600x900, bt709. Video ids, in list order:
 * 6872095, 35999384, 7720885, 12866100, 11494044, 7802452,
 * 7592800, 7667424, 8626681, 32947362, 38630675, 13082773.
 * Exception — automotive: Volvo "EX60: A new beginning" (youtu.be/fBo4I4c0How,
 * 1:31.5-1:37.7), same loop treatment, 1600x680 (bars cropped, full width kept
 * so `cover` decides the crop).
 */
const HERO_MEDIA = new Set<string>([
  'automotive',
  'elektronika-i-agd',
  'beauty',
  'health',
  'finanse',
  'petcare',
  'alkohole',
  'fashion',
  'horeca',
  'hotele-i-miejsca-wypoczynkowe',
  'nieruchomosci-i-deweloperzy',
  'rozrywka',
])

/**
 * Hero background: an optimized poster carries the LCP, and the clip fades in
 * over it once it can actually play. The video is `preload="none"` and never
 * blocks — a slow connection or a refused autoplay simply keeps the poster, and
 * `prefers-reduced-motion` skips playback entirely.
 */
function HeroMedia({ id }: { id: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = usePreferredReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    if (reducedMotion) {
      return
    }
    video.preload = 'auto'
    video.play().catch(() => {
      // Autoplay refused (e.g. Low Power Mode) — the poster is the fallback.
    })
  }, [reducedMotion])

  const poster = `/branze/${id}/hero.jpg`

  return (
    <div className={s.heroMedia} aria-hidden="true">
      {/* `branza-<id>` pairs the poster with the hub card's image: on a
          view-transition-capable browser the clicked card expands into this
          hero (branze-morph-transition spec). Only the poster is named — the
          scrim and the video stay out of the pair, so the clip's fade-in
          after arrival composits over the settled shared layer. share must
          not fall back to `default` ("none"); the `poster-morph`
          view-transition-class activates the morph and lets global.css
          cover-fit the snapshots (card and hero crop the same photo
          differently). It is shared with the services hub — the names stay
          section-prefixed, so ids can never collide. share arrives per
          transition type so the hero's back link can opt out — see
          POSTER_MORPH_SHARE. */}
      <ViewTransition
        name={`branza-${id}`}
        share={POSTER_MORPH_SHARE}
        default="none"
      >
        <Image
          className={s.heroPoster}
          src={poster}
          alt=""
          fill
          objectFit="cover"
          preload
          desktopSize="100vw"
          mobileSize="100vw"
        />
      </ViewTransition>
      <video
        ref={videoRef}
        className={cn(s.heroVideo, playing && s.heroVideoReady)}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setPlaying(true)}
      >
        <source src={`/branze/${id}/hero.mp4`} type="video/mp4" />
      </video>
      <div className={s.heroScrim} />
    </div>
  )
}

/**
 * Hero band — one layout for both variants: plum ground, solid display
 * wordmark, lead. Long labels (e.g. "Hotele i Miejsca Wypoczynkowe") stack the
 * lead below and drop a size step, since they can't sit beside it at full size.
 */
function IndustryHero({
  industry,
  chrome,
  hubHref,
}: {
  industry: Industry
  chrome: Chrome
  hubHref: string
}) {
  const longLabel =
    industry.label.length > 16 ||
    industry.label.split(' ').some((word) => word.length > 10)
  const hasMedia = HERO_MEDIA.has(industry.id)

  return (
    // With a clip behind it the header drops its ground (see the Header's
    // `[data-transparent-header]` lookup) so the video runs to the top edge.
    <section
      className={s.hero}
      data-theme="plum"
      {...(hasMedia && { 'data-transparent-header': '' })}
    >
      {hasMedia && <HeroMedia id={industry.id} />}
      <div className={s.heroInner}>
        {/* The section label is the page's route back up (design D2): the
            label text carries the accessible name, the arrow is decoration.
            `hub-back` tags the navigation so the poster pair sits it out. */}
        <Link
          className={s.breadcrumb}
          href={hubHref}
          transitionTypes={HUB_BACK_TRANSITION}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {chrome.sectionLabel}
        </Link>
        <div className={s.heroBody} data-long-label={longLabel || undefined}>
          <h1 className={s.heroWordmark}>
            {industry.label}
            <span className={s.dot} aria-hidden="true">
              .
            </span>
          </h1>
          <p className={s.heroLead}>{industry.tagline}</p>
        </div>
      </div>
    </section>
  )
}

/** Duotone photo strip — sits directly under the brief, sharing its cream band. */
/** Closing CTA — the case-study CTA card: one title, one line, one action. */
function CtaBand({ headline, chrome }: { headline: string; chrome: Chrome }) {
  return (
    <section className={s.ctaBand} data-theme="cream">
      <div className={s.cta}>
        <h2 className={s.ctaTitle}>{headline}</h2>
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

function Chips({ chips }: { chips: NonNullable<Industry['chips']> }) {
  return (
    <ul className={s.chips}>
      {chips.map((chip) => (
        <li key={chip.label} data-reveal-item className={s.chip}>
          <span className={s.chipValue}>{chip.value}</span>
          <span className={s.chipLabel}>{chip.label}</span>
        </li>
      ))}
    </ul>
  )
}

/** Render a brief paragraph, bolding its `strong` run if present. */
function renderParagraph({
  text,
  strong,
}: Industry['brief']['paragraphs'][number]) {
  if (!strong) {
    return text
  }
  const idx = text.indexOf(strong)
  if (idx === -1) {
    return text
  }
  return (
    <>
      {text.slice(0, idx)}
      <strong className={s.briefStrong}>{strong}</strong>
      {text.slice(idx + strong.length)}
    </>
  )
}

/** Under-hero brief: pillars + the industry's copy. */
/*
 * Under-hero brief. On desktop the kicker + strategic pillars render as an
 * orbit — kicker at the hub, pillars revolving on a dotted ring. Below
 * --desktop the orbit is swapped for the plain chip list (positioned spokes
 * crowd at phone width), so only one of the two is in the a11y tree per width.
 *
 * The sweep is driven by keyframes holding literal angles, never by a
 * registered custom property. Safari below 16.4 has no `@property`, which is
 * what collapsed the chips onto the hub in the 2026-08-21 report; see the long
 * note in the CSS module. Nothing here needs a browser check.
 *
 * List semantics ride on role=list / listitem because the chips must be direct
 * children of the box that carries the sizing variables.
 */
function IndustryBrief({
  industry,
  chrome,
}: {
  industry: Industry
  chrome: Chrome
}) {
  const ref = useReveal<HTMLDivElement>()
  const orbitRef = useRef<HTMLDivElement>(null)
  const [spinning, setSpinning] = useState(false)
  const reducedMotion = usePreferredReducedMotion()

  // Spin only while on screen, never under reduced motion (the CSS also
  // disables it — this just avoids running a pointless observer).
  useEffect(() => {
    const el = orbitRef.current
    if (!el) {
      return
    }
    if (reducedMotion) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => setSpinning(entries[0]?.isIntersecting ?? false),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  const pillars = industry.brief.pillars
  const step = 360 / Math.max(pillars.length, 1)

  return (
    <section className={s.brief} data-theme="cream">
      <div ref={ref} className={s.briefInner}>
        <div className={s.briefHead}>
          {/* Desktop orbit */}
          {/* biome-ignore lint/a11y/useSemanticElements: a <ul> here would put a
              wrapper between the chips and the box that carries --orbit — the
              structural difference this component exists to avoid. */}
          <div
            ref={orbitRef}
            data-reveal-item
            className={s.briefOrbit}
            data-spinning={spinning}
            role="list"
          >
            <div className={s.orbitTrack} aria-hidden="true">
              <svg
                className={s.orbitSvg}
                viewBox="0 0 100 100"
                aria-hidden="true"
                focusable="false"
              >
                <circle className={s.orbitCircle} cx="50" cy="50" r="50" />
              </svg>
              {pillars.map((pillar, i) => (
                <span
                  key={pillar}
                  className={s.orbitDot}
                  style={{ '--base': `${i * step}deg` } as CSSProperties}
                />
              ))}
            </div>

            {pillars.map((pillar, i) => (
              // biome-ignore lint/a11y/useSemanticElements: see the orbit box.
              <div
                key={pillar}
                className={s.orbitItem}
                style={{ '--base': `${i * step}deg` } as CSSProperties}
                role="listitem"
              >
                {pillar}
              </div>
            ))}

            <p className={s.orbitHub}>{chrome.briefKicker}</p>
          </div>

          {/* Mobile fallback: the original kicker + chip list */}
          <p className={`${s.kicker} ${s.briefKickerFlat}`}>
            {chrome.briefKicker}
          </p>
          <ul className={s.pillars}>
            {pillars.map((pillar) => (
              <li key={pillar} data-reveal-item className={s.pillar}>
                {pillar}
              </li>
            ))}
          </ul>
        </div>
        <div className={s.briefBody}>
          {industry.brief.paragraphs.map((para) => (
            <p
              key={para.text.slice(0, 24)}
              data-reveal-item
              className={s.briefP}
            >
              {renderParagraph(para)}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Desktop `sizes` hint for one wall tile. It has to track `.wallItem` in the
 * stylesheet across both desktop regimes: the flex rows' 14rem phone slot is
 * 28vw at the 800px breakpoint, and the ≥1220 three-column masonry renders a
 * tile at ~390px (≈28vw at 1440). A landscape tile spans two flex slots and a
 * lone tile is 22rem, so both get wider hints.
 */
function wallTileSize(landscape: boolean, lone: boolean): `${number}vw` {
  if (landscape) {
    return '32vw'
  }
  return lone ? '25vw' : '28vw'
}

/**
 * The "here's how it looks in the feed" wall. Owned by neither layout: a proof
 * industry feeds it `caseStudy.creatives`, an editorial one its own
 * `industry.creatives` (design D1). Tiles render at their intrinsic aspect —
 * they are device mockups, so cropping them to a uniform tile mangles the
 * phone. A landscape frame is flagged for the CSS, which gives it two tile
 * widths instead of squeezing a 2:1 image into a phone slot (design D3).
 */
function CreativesWall({
  creatives,
  chrome,
}: {
  creatives: readonly IndustryCreative[]
  chrome: Chrome
}) {
  const wallRef = useReveal<HTMLDivElement>()

  return (
    <section className={s.portfolio} data-theme="cream">
      <div className={s.portfolioHead}>
        <div>
          <p className={s.kicker}>{chrome.proof.portfolioKicker}</p>
          <h2 className={s.portfolioHeading}>
            {chrome.proof.portfolioHeading}
          </h2>
        </div>
        <span className={s.realBadge}>{chrome.proof.realBadge}</span>
      </div>
      <div
        ref={wallRef}
        className={s.wall}
        /* The wide masonry can only fill as many columns as it has tiles —
           multicol never splits a tile, so a sparser wall under a fixed
           count parks permanently empty columns on the right. Walls are
           pinned to four tiles (branze.test.ts), so in practice this is four
           columns everywhere. */
        style={
          { '--wall-cols': Math.min(4, creatives.length) } as CSSProperties
        }
      >
        {creatives.map((creative) => {
          // Ratio, not `width > height` (design D3). Two tiles already on the
          // walls are square within a rounding error — julius-meinl-eventy-1 is
          // 1574×1572 and irobot-humor-parrot 713×640 — and a bare inequality
          // would hand them the double-width slot meant for the 2056×1164
          // YouTube still, wrecking a wall this change never meant to reshape.
          const ratio = creative.width / creative.height
          const landscape = ratio >= 1.5
          // Anything meaningfully wider than tall spans the mobile columns
          // (user call 2026-08-24: the parrot squeezed into a half column).
          // 1.05 clears rounding-error squares; true squares stay two-up.
          const wide = ratio > 1.05 && !landscape
          return (
            <div
              key={creative.src}
              data-reveal-item
              data-landscape={landscape || undefined}
              data-wide={wide || undefined}
              data-cutout={creative.cutout || undefined}
              className={s.wallItem}
            >
              <Image
                className={s.wallImg}
                src={creative.src}
                alt={creative.alt}
                width={creative.width}
                height={creative.height}
                desktopSize={wallTileSize(landscape, creatives.length === 1)}
                /* Mobile is a two-column masonry, so a tile is ~45vw — except
                   the column-spanning cases (landscape, lone tile), which take
                   the full row. */
                mobileSize={
                  landscape || wide || creatives.length === 1 ? '90vw' : '45vw'
                }
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

// —— Proof variant (mock C) ————————————————————————————————————————————————————

function ProofLayout({
  industry,
  chrome,
  hubHref,
  caseStudyBase,
}: IndustryPageProps) {
  const numbersRef = useReveal<HTMLDivElement>()
  const study = industry.caseStudy
  if (!study) {
    return null
  }

  return (
    <>
      <IndustryHero industry={industry} chrome={chrome} hubHref={hubHref} />

      <IndustryBrief industry={industry} chrome={chrome} />

      <CreativesWall creatives={study.creatives} chrome={chrome} />

      {/* Numbers band — case-study metrics (`numbers`), not manifesto chips. */}
      {industry.numbers && (
        <section className={s.numbers} data-theme="cream">
          <div ref={numbersRef} className={s.numbersInner}>
            {industry.numbers.map((chip) => (
              <div
                key={`${chip.label}-${chip.value}`}
                data-reveal-item
                className={s.number}
              >
                <span className={s.numberValue}>{chip.value}</span>
                {chip.delta && (
                  <span className={s.numberDelta}>{chip.delta}</span>
                )}
                <span className={s.numberLabel}>{chip.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <IndustryMarquee industry={industry} />
      <IndustryApproach industry={industry} chrome={chrome} />

      {/* Quote (only when a real testimonial exists) + case-study card */}
      <section className={s.proofClose} data-theme="cream">
        {study.quote && (
          <figure className={s.quote}>
            <blockquote className={s.quoteText}>
              <span className={s.quoteMark} aria-hidden="true">
                “
              </span>
              {study.quote.text}
            </blockquote>
            <figcaption className={s.quoteAttr}>
              {study.quote.attribution}
            </figcaption>
          </figure>
        )}
        <Link className={s.caseCard} href={`${caseStudyBase}/${study.slug}`}>
          <span className={s.caseCardKicker}>{study.cardKicker}</span>
          <span className={s.caseCardTitle}>{study.cardTitle}</span>
          <span className={s.caseCardLogo}>
            {/* Logos are locale-independent public assets, not prefixed. */}
            <Image
              src={studyLogoSrc(study.slug)}
              alt=""
              width={140}
              height={44}
              objectFit="contain"
            />
          </span>
          <span className={s.caseCardCta}>
            {chrome.proof.caseStudyCta}
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
      </section>

      <RelatedCaseStudies
        industry={industry}
        chrome={chrome}
        caseStudyBase={caseStudyBase}
      />

      <CtaBand headline={chrome.proof.ctaHeadline} chrome={chrome} />
    </>
  )
}

// —— Editorial variant (mock B) ————————————————————————————————————————————————

function EditorialLayout({
  industry,
  chrome,
  hubHref,
  caseStudyBase,
}: IndustryPageProps) {
  return (
    <>
      <IndustryHero industry={industry} chrome={chrome} hubHref={hubHref} />

      <IndustryBrief industry={industry} chrome={chrome} />

      {industry.creatives && industry.creatives.length > 0 && (
        <CreativesWall creatives={industry.creatives} chrome={chrome} />
      )}

      <IndustryMarquee industry={industry} />
      <IndustryApproach industry={industry} chrome={chrome} />

      <RelatedCaseStudies
        industry={industry}
        chrome={chrome}
        caseStudyBase={caseStudyBase}
      />

      <CtaBand headline={chrome.editorial.ctaHeadline} chrome={chrome} />
    </>
  )
}

export function IndustryPage(props: IndustryPageProps) {
  return props.industry.caseStudy ? (
    <ProofLayout {...props} />
  ) : (
    <EditorialLayout {...props} />
  )
}
