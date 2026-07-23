'use client'

import {
  Activity,
  ArrowRight,
  BedDouble,
  Beer,
  Bone,
  Building2,
  Cake,
  Car,
  Cat,
  ChefHat,
  Coffee,
  Cpu,
  CreditCard,
  Crown,
  Dog,
  Droplet,
  Fish,
  Flower2,
  Fuel,
  Gauge,
  Gem,
  Glasses,
  GlassWater,
  Grape,
  Headphones,
  Heart,
  HeartPulse,
  House,
  KeyRound,
  Landmark,
  Leaf,
  type LucideIcon,
  Luggage,
  MapPin,
  Martini,
  Mic,
  Music,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Pill,
  Plug,
  Ruler,
  Scissors,
  Shirt,
  ShoppingBag,
  Smartphone,
  Soup,
  Sparkles,
  Stethoscope,
  Sun,
  Ticket,
  TreePalm,
  TrendingUp,
  Tv,
  UtensilsCrossed,
  Wallet,
  WashingMachine,
  Waves,
  Wine,
  Wrench,
  Zap,
} from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Marquee } from '@/components/ui/marquee'
import type { Industry, LocalizedBranze } from '@/lib/content/branze'
import { useReveal } from '@/lib/hooks/use-reveal'
import { industryWordmarkPaths } from '@/lib/wordmark-paths'
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
  /** 1-based position in the canonical list — the "· 01" hero index. */
  index: number
  /** Locale-correct case-study base (`/case-studies` or `/en/case-studies`). */
  caseStudyBase: string
}

// Industry-themed background motifs for the brief section — a cohesive set
// (Lucide, the repo's only icon system), ~5 per industry, keyed by industry id.
// Decorative watermark only; the section wraps them `aria-hidden`.
const BRIEF_ICONS: Record<string, readonly LucideIcon[]> = {
  automotive: [Car, Gauge, Zap, Wrench, Fuel],
  'elektronika-i-agd': [Smartphone, Cpu, WashingMachine, Plug, Tv],
  beauty: [Sparkles, Droplet, Flower2, Heart, Gem],
  health: [HeartPulse, Stethoscope, Pill, Activity, Leaf],
  finanse: [Wallet, CreditCard, TrendingUp, PiggyBank, Landmark],
  petcare: [PawPrint, Bone, Dog, Cat, Fish],
  alkohole: [Wine, Beer, Martini, Grape, GlassWater],
  fashion: [Shirt, ShoppingBag, Scissors, Glasses, Crown],
  horeca: [UtensilsCrossed, Coffee, ChefHat, Soup, Cake],
  'hotele-i-miejsca-wypoczynkowe': [BedDouble, TreePalm, Sun, Luggage, Waves],
  'nieruchomosci-i-deweloperzy': [Building2, House, KeyRound, MapPin, Ruler],
  rozrywka: [Music, Ticket, PartyPopper, Mic, Headphones],
}

// —— Shared pieces ————————————————————————————————————————————————————————————

function Breadcrumb({ chrome, label }: { chrome: Chrome; label: string }) {
  return (
    <p className={s.breadcrumb}>
      <span>{chrome.sectionLabel}</span>
      <span className={s.breadcrumbDot} aria-hidden="true">
        •
      </span>
      <span className={s.breadcrumbCurrent}>{label}</span>
    </p>
  )
}

function CtaBand({ headline, chrome }: { headline: string; chrome: Chrome }) {
  return (
    <section className={s.cta} data-theme="plum">
      <h2 className={s.ctaHeadline}>{headline}</h2>
      <Link className={s.ctaButton} href={chrome.ctaHref}>
        {chrome.ctaButton}
      </Link>
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

/** Under-hero brief: pillars + paragraphs over an industry icon watermark. */
function IndustryBrief({
  industry,
  chrome,
}: {
  industry: Industry
  chrome: Chrome
}) {
  const ref = useReveal<HTMLDivElement>()
  const icons = BRIEF_ICONS[industry.id] ?? []

  return (
    <section className={s.brief} data-theme="cream">
      <div className={s.briefIcons} aria-hidden="true">
        {icons.map((Icon) => (
          <Icon
            key={Icon.displayName}
            className={s.briefIcon}
            strokeWidth={1.25}
          />
        ))}
      </div>
      <div ref={ref} className={s.briefInner}>
        <div className={s.briefHead}>
          <p className={s.kicker}>{chrome.briefKicker}</p>
          <ul className={s.pillars}>
            {industry.brief.pillars.map((pillar) => (
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
  index,
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
      {/* Hero band */}
      <section className={s.proofHero} data-theme="plum">
        <div className={s.proofHeroInner}>
          <div className={s.proofHeroHead}>
            <Breadcrumb chrome={chrome} label={industry.label} />
            <span className={s.heroIndex}>
              {chrome.sectionLabel} · {String(index).padStart(2, '0')}
            </span>
          </div>
          <div className={s.proofHeroBody}>
            <h1 className={s.proofWordmark}>
              {industry.label}
              <span className={s.dot} aria-hidden="true">
                .
              </span>
            </h1>
            <p className={s.proofLead}>{industry.tagline}</p>
          </div>
        </div>
      </section>

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
                fill
                objectFit="cover"
                desktopSize="20vw"
                mobileSize="60vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Numbers band */}
      {industry.chips && (
        <section className={s.numbers} data-theme="cream">
          <div ref={numbersRef} className={s.numbersInner}>
            {industry.chips.map((chip) => (
              <div key={chip.label} data-reveal-item className={s.number}>
                <span className={s.numberValue}>{chip.value}</span>
                <span className={s.numberLabel}>{chip.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quote + case-study card */}
      <section className={s.proofClose} data-theme="cream">
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
        <Link className={s.caseCard} href={`${caseStudyBase}/${study.slug}`}>
          <span className={s.caseCardKicker}>{study.cardKicker}</span>
          <span className={s.caseCardTitle}>{study.cardTitle}</span>
          <span className={s.caseCardLogo}>
            {/* Logos are locale-independent public assets, not prefixed. */}
            <Image
              src={`/case-studies/${study.slug}/${study.slug}-logo.png`}
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

      <CtaBand headline={chrome.proof.ctaHeadline} chrome={chrome} />
    </>
  )
}

// —— Editorial variant (mock B) ————————————————————————————————————————————————

function EditorialLayout({ industry, chrome, index }: IndustryPageProps) {
  const heroRef = useReveal<HTMLDivElement>()
  const manifestoRef = useReveal<HTMLDivElement>()
  const hasCollage = (industry.collage?.length ?? 0) > 0
  // Long multi-word labels (e.g. "Hotele i Miejsca Wypoczynkowe") need the full
  // hero width for the outline wordmark — the collage then stacks below rather
  // than sitting beside it (side-by-side only fits short labels like the mocks).
  const longLabel =
    industry.label.length > 16 ||
    industry.label.split(' ').some((word) => word.length > 10)
  // Merged-union outline path (dissolves the crossing strokes plain outlined
  // text shows on A/K/H/E); falls back to text if a label has no generated path.
  const wordmark = industryWordmarkPaths[industry.id]

  return (
    <>
      {/* Hero band */}
      <section className={s.edHero} data-theme="cream">
        <div className={s.edHeroHead}>
          <Breadcrumb chrome={chrome} label={industry.label} />
          <span className={s.heroIndex}>
            {chrome.sectionLabel} · {String(index).padStart(2, '0')}
          </span>
        </div>
        <div
          ref={heroRef}
          className={hasCollage ? s.edHeroGrid : s.edHeroGridSolo}
          data-long-label={longLabel || undefined}
        >
          <div className={s.edHeroCopy}>
            <h1
              data-reveal-item
              className={s.edWordmark}
              aria-label={industry.label}
            >
              {wordmark ? (
                <svg
                  className={s.edWordmarkSvg}
                  viewBox={wordmark.viewBox}
                  preserveAspectRatio="xMinYMid meet"
                  aria-hidden="true"
                >
                  <path d={wordmark.d} vectorEffect="non-scaling-stroke" />
                </svg>
              ) : (
                industry.label
              )}
            </h1>
            <p data-reveal-item className={s.edLead}>
              {industry.tagline}
            </p>
          </div>
          {hasCollage && (
            <div data-reveal-item className={s.collage}>
              {industry.collage?.map((photo, i) => (
                <div
                  key={photo.src}
                  className={s.collageItem}
                  data-collage-index={i}
                >
                  <Image
                    className={s.collageImg}
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    objectFit="cover"
                    desktopSize="30vw"
                    mobileSize="80vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <IndustryBrief industry={industry} chrome={chrome} />

      {/* Keyword marquee */}
      {industry.marquee && industry.marquee.length > 0 && (
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
      )}

      {/* Manifesto + value chips (our punchy take, distinct from the brief) */}
      {industry.manifesto && industry.chips && (
        <section className={s.manifesto} data-theme="cream">
          <div ref={manifestoRef} className={s.manifestoInner}>
            <div className={s.manifestoCopy}>
              <p className={s.kicker}>{chrome.editorial.manifestoKicker}</p>
              <h2 data-reveal-item className={s.manifestoHeading}>
                <span className={s.manifestoLead}>
                  {industry.manifesto.lead}
                </span>{' '}
                <span className={s.manifestoRest}>
                  {industry.manifesto.rest}
                </span>
              </h2>
            </div>
            <Chips chips={industry.chips} />
          </div>
        </section>
      )}

      {/* Client-logo strip — rendered only when logos are assigned (O2). */}
      {industry.logos && industry.logos.length > 0 && (
        <section className={s.logos} data-theme="cream">
          <p className={s.logosKicker}>{chrome.editorial.logosKicker}</p>
          <ul className={s.logosRow}>
            {industry.logos.map((logo) => (
              <li key={logo.src} className={s.logo}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={150}
                  height={48}
                  objectFit="contain"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

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
