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
import type { Industry, LocalizedBranze } from '@/lib/content/branze'
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
const LOGO_V: Record<string, string> = { volvo: '?v=2', breville: '?v=2' }
const studyLogoSrc = (slug: string) =>
  `/case-studies/${slug}/${slug}-logo.png${LOGO_V[slug] ?? ''}`

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
  const studies = industry.relatedCaseStudies
  if (!studies || studies.length === 0) {
    return null
  }

  return (
    <section className={s.related} data-theme="cream">
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
 * The GOOD ONE wheel in `o-nas/sections/good-one/index.tsx` is the structural
 * reference, not a loose inspiration: same child order (track, then the
 * revolving blocks, then the hub) and the same flat DOM, where every revolving
 * block is a direct child of the orbit box. List semantics ride on role=list /
 * listitem because the wrapper the <ul> used to provide is gone.
 *
 * On the reporter's Mac Safari the chips still land on the hub, so the orbit
 * also carries a measured fallback — see the effect below.
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
  const [pinnedWidth, setPinnedWidth] = useState(0)
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

  /*
   * Safari fallback, by measurement rather than by user agent.
   *
   * On the reporter's Mac the three chips render stacked on the hub. Each
   * chip's `transform: translate(-50%,-50%) rotate(calc(var(--base) +
   * var(--spin))) …` resolves to `none` there, which drops a `top: 50%; left:
   * 50%` box back onto the ring centre — exactly the symptom. `--spin` is the
   * only registered custom property in that chain, and the dots (same chain
   * minus `--spin`) and the hub (no var() at all) both render correctly, so
   * the registration is the suspect. Mirroring the GOOD ONE wheel's DOM
   * (841616ed) did not fix it and a fourth guess is not worth shipping.
   *
   * So: measure the outcome. If a chip's centre sits inside half the ring
   * radius, the transform chain did not survive, and we rewrite every chip's
   * position as plain px literals with no var() in them. The diagram stays
   * whole; only the spin is gone. Browsers that lay the orbit out correctly
   * never enter this branch, and a Safari that gains the missing support stops
   * entering it too — nothing here names a browser.
   *
   * Latched deliberately: pinned chips measure as healthy, so re-testing them
   * would flip the orbit back and forth. After the latch the ResizeObserver
   * only refreshes the width the geometry is derived from.
   */
  useEffect(() => {
    const el = orbitRef.current
    if (!el) {
      return
    }
    let pinned = false
    const read = () => {
      const box = el.getBoundingClientRect()
      // Below --desktop the orbit is display: none — nothing to measure.
      if (box.width < 1) {
        return
      }
      if (pinned) {
        setPinnedWidth(box.width)
        return
      }
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const chips = el.querySelectorAll<HTMLElement>('[data-orbit-chip]')
      // A chip on the ring is --item-r (0.4 × the box) from the centre; a
      // collapsed one is half its own width out, ~0.18 ×. Split the difference.
      const collapsed = Array.from(chips).some((chip) => {
        const r = chip.getBoundingClientRect()
        return (
          Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) <
          box.width * 0.2
        )
      })
      if (collapsed) {
        pinned = true
        setPinnedWidth(box.width)
      }
    }
    const frame = requestAnimationFrame(read)
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const pillars = industry.brief.pillars
  const step = 360 / Math.max(pillars.length, 1)

  // The same place the CSS transform would have put the chip, spelled out in
  // px. Undefined until the fallback latches, so the CSS keeps the animation.
  const pinnedChip = (base: number): CSSProperties | undefined => {
    if (!pinnedWidth) {
      return undefined
    }
    const radians = (base * Math.PI) / 180
    const itemR = pinnedWidth * 0.4
    const x = (itemR * Math.sin(radians)).toFixed(2)
    const y = (-itemR * Math.cos(radians)).toFixed(2)
    return {
      width: pinnedWidth * 0.34,
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    }
  }

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
            data-spinning={spinning && !pinnedWidth}
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
                data-orbit-chip
                className={s.orbitItem}
                style={
                  {
                    '--base': `${i * step}deg`,
                    ...pinnedChip(i * step),
                  } as CSSProperties
                }
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

// —— Proof variant (mock C) ————————————————————————————————————————————————————

function ProofLayout({
  industry,
  chrome,
  hubHref,
  caseStudyBase,
}: IndustryPageProps) {
  const wallRef = useReveal<HTMLDivElement>()
  const numbersRef = useReveal<HTMLDivElement>()
  const study = industry.caseStudy
  if (!study) {
    return null
  }

  return (
    <>
      <IndustryHero industry={industry} chrome={chrome} hubHref={hubHref} />

      <IndustryBrief industry={industry} chrome={chrome} />

      {/* Portfolio — real creatives wall */}
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
        <div ref={wallRef} className={s.wall}>
          {study.creatives.map((creative) => (
            <div key={creative.src} data-reveal-item className={s.wallItem}>
              <Image
                className={s.wallImg}
                src={creative.src}
                alt={creative.alt}
                width={creative.width}
                height={creative.height}
                desktopSize="16vw"
                mobileSize="45vw"
              />
            </div>
          ))}
        </div>
      </section>

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
