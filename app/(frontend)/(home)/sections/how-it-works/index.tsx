'use client'

import { useScrollTrigger } from 'hamo'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { CLIENT_ROSTER } from '@/lib/content/clients'
import {
  howItWorks,
  type LocalizedHome,
  type SayPart,
} from '@/lib/content/home'
import s from './how-it-works.module.css'

type HowItWorksContent = LocalizedHome['howItWorks']

/** Stable key for a `SayPart` — index keys trip Biome's `noArrayIndexKey`. */
const partKey = (part: SayPart, index: number) =>
  `${index}-${typeof part === 'string' ? part : part.figure}`

/**
 * A step's supporting sentence with its figures accented.
 *
 * The figures are now the whole of the evidence — the exhibits that used to sit
 * beside them were removed (user decision, 2026-07-29) — so they carry the
 * accent colour and tabular numerals rather than being buried in the run of
 * text. Splitting the sentence into typed parts keeps the content module free
 * of markup and avoids string-matching the copy at render time.
 */
function Say({
  parts,
  className,
}: {
  parts: readonly SayPart[]
  className?: string | undefined
}) {
  return (
    <p className={className}>
      {parts.map((part, index) =>
        typeof part === 'string' ? (
          part
        ) : (
          <b className={s.figure} key={partKey(part, index)}>
            {part.figure}
          </b>
        )
      )}
    </p>
  )
}

/**
 * Where a step's figures came from, and the way to check them.
 *
 * The section carries no exhibits, so nothing on its own surface would
 * otherwise say these numbers belong to a client rather than to the agency.
 * The wordmark is the brand name — the label stops short of it deliberately,
 * so the card reads as one sentence: "Tak to wyglądało u [VOLVO]".
 */
function ProofCard({
  client,
  href,
  label,
  cta,
}: {
  client: string
  href: string
  label: string
  cta: string
}) {
  // The mark stands in for the brand name in the sentence, so its alt text has
  // to be the name a reader would say — the roster key would be announced as
  // "pracuj dash p l". Brand names do not translate, so the roster is shared.
  const name =
    CLIENT_ROSTER.find((brand) => brand.key === client)?.name ?? client

  return (
    <Link className={s.proofCard} href={href}>
      <span className={s.proofLine}>
        <span className={s.proofLabel}>{label}</span>
        <Image
          className={s.proofMark}
          src={`/case-studies/${client}/${client}-logo-mono.png`}
          alt={name}
          width={280}
          height={72}
          desktopSize="8vw"
          mobileSize="22vw"
          /* Tiny 3-colour PNGs the optimizer cannot improve; recoloured to
             cream in CSS for the plum ground. */
          unoptimized
        />
      </span>
      <span className={s.proofCta}>
        {cta}
        <ArrowRight className={s.proofArrow} aria-hidden="true" />
      </span>
    </Link>
  )
}

/**
 * One step's evidence: headline, one sentence carrying its figures, and the
 * proof card that says whose figures they are. The density this replaced is
 * what made the section feel like filler, and the budget is part of the spec.
 */
function Panel({
  step,
  active,
  caseStudyBase,
  proofLabel,
  caseStudyCta,
}: {
  step: HowItWorksContent['steps'][number]
  active: boolean
  caseStudyBase: string
  proofLabel: string
  caseStudyCta: string
}) {
  const { proof } = step

  return (
    <div className={s.panel} data-active={active}>
      <div className={s.panelText}>
        <p className={s.panelTitle}>{proof.title}</p>
        <Say parts={proof.say} className={s.panelSay} />
        {proof.client && proof.href && (
          <ProofCard
            client={proof.client}
            href={`${caseStudyBase}/${proof.href}`}
            label={proofLabel}
            cta={caseStudyCta}
          />
        )}
      </div>
    </div>
  )
}

export function HowItWorks({
  content = howItWorks,
  caseStudyBase = '/case-studies',
}: {
  content?: HowItWorksContent
  /** Case-study route prefix for the current locale; slugs are shared. */
  caseStudyBase?: string
}) {
  const stepCount = content.steps.length
  const [active, setActive] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)

  // Same scroll-trigger mechanism <Fold> is built on, driving both the pin
  // range and sequential step activation. Progress 0→1 maps to steps 01–05.
  const [setRectRef] = useScrollTrigger({
    start: 'top top',
    end: 'bottom bottom',
    onProgress: ({ progress }: { progress: number }) => {
      const index = Math.min(stepCount - 1, Math.floor(progress * stepCount))
      setActive(index)
    },
  })

  // Narrow viewports lay the rail out horizontally, so the active step can sit
  // off screen. Center it by moving the rail's own scrollLeft — scrollIntoView
  // would drag the page with it and fight the pin.
  useEffect(() => {
    const rail = railRef.current
    if (!rail || rail.scrollWidth <= rail.clientWidth + 1) return
    const item = rail.querySelectorAll('button')[active]
    if (!item) return
    rail.scrollLeft =
      item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2
  }, [active])

  return (
    <section ref={setRectRef} className={s.pin} aria-label={content.ariaLabel}>
      <div className={s.sticky}>
        <div className={s.head}>
          <h2 className={s.heading}>
            {content.heading.map((line) => (
              <span key={line} className={s.headingLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={s.subhead}>{content.subhead}</p>
        </div>

        {/* Plum stage panel (Mock B, user decision 2026-07-14): the step rail
            and the copy panel live on the services-stage backdrop language —
            rounded plum gradient, orange glow, grain. */}
        <div className={s.stage}>
          {/* `role="group"`: a bare div exposes role `generic`, which carries no
              accessible name, so the label would be dropped. */}
          <div
            className={s.rail}
            ref={railRef}
            role="group"
            aria-label={content.railAriaLabel}
          >
            <p className={s.railLabel}>{content.railLabel}</p>
            {content.steps.map((step, index) => (
              <button
                type="button"
                key={step.number}
                className={s.railItem}
                aria-current={index === active}
                onClick={() => setActive(index)}
              >
                <span className={s.number}>{step.number}</span>
                <span className={s.stepText}>{step.text}</span>
              </button>
            ))}
          </div>

          {/* All five panels share one grid cell, so the stage is always as
              tall as the tallest and never resizes between steps. `visibility`
              (not `display`) keeps that measurement while still removing the
              inactive panels from the tab order and the a11y tree. */}
          <div className={s.panels}>
            {content.steps.map((step, index) => (
              <Panel
                key={step.number}
                step={step}
                active={index === active}
                caseStudyBase={caseStudyBase}
                proofLabel={content.proofLabel}
                caseStudyCta={content.caseStudyCta}
              />
            ))}
          </div>

          <div className={s.progress} aria-hidden="true">
            <span
              className={s.progressBar}
              style={{ '--fill': `${((active + 1) / stepCount) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
