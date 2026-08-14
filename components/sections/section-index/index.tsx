'use client'

import { ArrowRight } from 'lucide-react'
import { type ReactNode, ViewTransition } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { useReveal } from '@/lib/hooks/use-reveal'
import { POSTER_MORPH_SHARE } from '@/lib/utils/view-transitions'
import s from './index.module.css'

/*
 * Section index — the hub layout shared by `/uslugi` and `/branze` (design D2 /
 * O3: a simple card grid). Hero on flat plum followed by one card per item,
 * deriving links from the caller's canonical list. Imported by all four hub
 * routes (PL/EN × services/industries).
 */

/**
 * The chrome slice a hub needs. Structural rather than tied to one content
 * module, so any locale module whose `chrome` carries `sectionLabel` and an
 * `index` block can feed it.
 */
export interface SectionIndexChrome {
  sectionLabel: string
  index: {
    title: string
    intro: string
    cardCta: string
  }
}

/**
 * One card. `summary` is the generic body slot — a service summary or an
 * industry tagline. Either poster slot selects the poster-card presentation
 * instead: label + CTA over full-bleed art, no body copy. `image` takes a
 * photograph (the industries hub, whose posters are the destinations' own hero
 * JPEGs); `artwork` takes rendered markup (the services hub, whose posters are
 * inline line-art SVG that has to animate and morph). Exactly one applies —
 * `artwork` wins if a caller sets both.
 */
export interface SectionIndexItem {
  slug: string
  label: string
  summary?: string
  image?: string
  artwork?: ReactNode
  /**
   * Spans the card across the whole grid row. Poster cards only. The services
   * hub both opens and closes on one, so its eight items lay out as
   * 1 + 3 + 3 + 1 instead of orphaning a third-width tile in a fourth row.
   */
  feature?: boolean
  /**
   * View-transition pair name for the poster (e.g. `branza-<id>`,
   * `usluga-<id>`) — the destination page names its hero poster identically,
   * so the clicked card's poster morphs into it on capable browsers. Only
   * meaningful alongside `image` or `artwork`.
   */
  morphName?: string
}

export interface SectionIndexProps {
  chrome: SectionIndexChrome
  items: readonly SectionIndexItem[]
  /** Locale-correct section base (`/uslugi`, `/en/services`, `/branze`, …). */
  base: string
}

export function SectionIndex({ chrome, items, base }: SectionIndexProps) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <>
      <section className={s.hero} data-theme="plum">
        <div className={s.heroInner}>
          <p className={s.breadcrumb}>{chrome.sectionLabel}</p>
          <h1 className={s.heroTitle}>
            {chrome.index.title}
            <span className={s.dot} aria-hidden="true">
              .
            </span>
          </h1>
          <p className={s.heroLead}>{chrome.index.intro}</p>
        </div>
      </section>

      <section className={s.grid} data-theme="cream">
        <div ref={ref} className={s.gridInner}>
          {items.map((item, i) => {
            if (!(item.image || item.artwork)) {
              return (
                <Link
                  key={item.slug}
                  data-reveal-item
                  className={s.card}
                  href={`${base}/${item.slug}`}
                >
                  <span className={s.cardLabel}>{item.label}</span>
                  <span className={s.cardSummary}>{item.summary}</span>
                  <span className={s.cardCta}>
                    {chrome.index.cardCta}
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              )
            }

            // Rendered artwork arrives ready to paint; a photograph still
            // needs the image pipeline. Inline SVG takes no preload hint —
            // there is no request to prioritise.
            const poster =
              item.artwork ??
              (item.image === undefined ? null : (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  aspectRatio={3 / 2}
                  mobileSize="90vw"
                  desktopSize="33vw"
                  // The first desktop row peeks into the initial viewport and
                  // carries the hub's LCP (measured 2026-08-04) — eager-load it.
                  preload={i < 3}
                />
              ))

            return (
              <Link
                key={item.slug}
                data-reveal-item
                data-feature={item.feature ? '' : undefined}
                data-artwork={item.artwork ? '' : undefined}
                className={s.posterCard}
                href={`${base}/${item.slug}`}
              >
                {item.morphName ? (
                  // Pairs the card's poster with the destination hero's
                  // poster — only the poster morphs; the scrim, copy and card
                  // chrome crossfade with the page. share must not fall back
                  // to `default` ("none"), so it carries the `poster-morph`
                  // view-transition-class — which both activates the morph and
                  // lets global.css cover-fit the snapshots (card and hero
                  // frame the same artwork differently). It arrives per
                  // transition type so a detail page's back link can opt out —
                  // see POSTER_MORPH_SHARE.
                  <ViewTransition
                    name={item.morphName}
                    share={POSTER_MORPH_SHARE}
                    default="none"
                  >
                    {poster}
                  </ViewTransition>
                ) : (
                  poster
                )}
                <span className={s.posterScrim} aria-hidden="true" />
                <span className={s.posterLabel}>
                  {item.label}
                  <span className={s.dot} aria-hidden="true">
                    .
                  </span>
                </span>
                <span className={s.posterCta}>
                  {chrome.index.cardCta}
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
