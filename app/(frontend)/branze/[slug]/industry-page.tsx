'use client'

import { ArrowRight } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Marquee } from '@/components/ui/marquee'
import type { Industry, LocalizedBranze } from '@/lib/content/branze'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './industry.module.css'

/*
 * Shared industry-page template (design D2). One component, two data-driven
 * variants — an entry with a `caseStudy` block renders the proof layout
 * (mock C), otherwise the editorial layout (mock B). Imported by both the PL
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

function Chips({ chips }: { chips: Industry['chips'] }) {
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
        >
          <div className={s.edHeroCopy}>
            <h1 data-reveal-item className={s.edWordmark}>
              {industry.label}
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

      {/* Manifesto + chips */}
      <section className={s.manifesto} data-theme="cream">
        <div ref={manifestoRef} className={s.manifestoInner}>
          <div className={s.manifestoCopy}>
            <p className={s.kicker}>{chrome.editorial.manifestoKicker}</p>
            {industry.manifesto && (
              <h2 data-reveal-item className={s.manifestoHeading}>
                <span className={s.manifestoLead}>
                  {industry.manifesto.lead}
                </span>{' '}
                <span className={s.manifestoRest}>
                  {industry.manifesto.rest}
                </span>
              </h2>
            )}
          </div>
          <Chips chips={industry.chips} />
        </div>
      </section>

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
