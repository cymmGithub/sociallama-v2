'use client'

import { useMediaQuery } from 'hamo'
import { ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Marquee } from '@/components/ui/marquee'
import {
  clientCardCta as clientCardCtaDefault,
  clients as clientsDefault,
  clientsHeading as clientsHeadingDefault,
  type LocalizedHome,
} from '@/lib/content/home'
import s from './client-logos.module.css'

/* Keep the hover card on screen: cards are centred on their logo, so near the
   viewport edges we nudge them back inside (the caret stays on the logo). */
const EDGE_PAD = 16

/* How long the "waiting for case study" bubble stays up after a CTA click. */
const TIP_MS = 2000

/* Initials for the plum placeholder circle when a portrait hasn't been
   delivered — "Imię Nazwisko" → "IN". */
function initialsOf(author: string) {
  return author
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function keepCardOnScreen(e: React.MouseEvent<HTMLLIElement>) {
  const li = e.currentTarget
  const card = li.querySelector<HTMLElement>(`.${s.card}`)
  if (!card) return
  li.style.setProperty('--shift', '0px') // measure from the centred position
  const rect = card.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  let shift = 0
  if (rect.left < EDGE_PAD) shift = EDGE_PAD - rect.left
  else if (rect.right > vw - EDGE_PAD) shift = vw - EDGE_PAD - rect.right
  li.style.setProperty('--shift', `${shift}px`)
}

export function ClientLogos({
  clients = clientsDefault,
  heading = clientsHeadingDefault,
  cardCta = clientCardCtaDefault,
}: {
  clients?: LocalizedHome['clients']
  heading?: LocalizedHome['clientsHeading']
  cardCta?: LocalizedHome['clientCardCta']
}) {
  // Marquee's pauseOnHover reacts to mouseenter, which touch taps emulate —
  // gate it to mouse-like pointers so touch keeps the plain scrolling belt
  // (the spotlight/card CSS is gated by the same media query).
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')

  // Which client's "waiting for case study" bubble is up. Keyed by name, so
  // the aria-hidden marquee clone mirrors the state — invisible in practice
  // (the clone is a belt-width away) and cheaper than per-node state.
  const [tipFor, setTipFor] = useState<string | null>(null)
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTip = useCallback((name: string) => {
    setTipFor(name)
    if (tipTimer.current) clearTimeout(tipTimer.current)
    tipTimer.current = setTimeout(() => setTipFor(null), TIP_MS)
  }, [])

  useEffect(
    () => () => {
      if (tipTimer.current) clearTimeout(tipTimer.current)
    },
    []
  )

  return (
    // data-blur-edge-gate: the viewport-bottom progressive blur stays hidden
    // while this belt is on screen — the brand marquee must never be frosted
    // at page start (user decision, 2026-07-13). See components/layout/blur-edge.
    <section className={s.section} data-blur-edge-gate>
      {/* The visible heading names the section — no aria-label, so AT
          announces "Zaufali nam" exactly once. */}
      <h2 className={s.heading}>{heading}</h2>
      <Marquee
        className={s.marquee}
        repeat={2}
        speed={0.6}
        pauseOnHover={finePointer === true}
      >
        <ul className={s.track}>
          {clients.map((client) => (
            <li
              key={client.name}
              className={s.item}
              onMouseEnter={keepCardOnScreen}
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={180}
                height={56}
                objectFit="contain"
                className={s.logo}
              />
              {client.testimonial && (
                // Interactive popover, not a tooltip (it holds a button): the
                // ::before bridge in the CSS spans the logo↔card gap so the
                // cursor can travel up to the CTA without the card closing.
                <div className={s.card}>
                  <p className={s.quote}>„{client.testimonial.quote}”</p>
                  <div className={s.foot}>
                    {client.testimonial.image ? (
                      <Image
                        src={client.testimonial.image}
                        alt=""
                        width={88}
                        height={88}
                        className={s.cardAvatar}
                      />
                    ) : (
                      <span
                        className={`${s.cardAvatar} ${s.cardAvatarPh}`}
                        aria-hidden
                      >
                        {initialsOf(client.testimonial.author)}
                      </span>
                    )}
                    <p className={s.author}>
                      <strong>{client.testimonial.author}</strong>
                      <span>{client.testimonial.company}</span>
                    </p>
                  </div>
                  <div className={s.ctaRow}>
                    <span className={s.ctaWrap}>
                      {client.caseStudySlug ? (
                        // Real destination exists — link through to the study.
                        <Link
                          href={`/case-studies/${client.caseStudySlug}`}
                          className={s.cta}
                        >
                          {cardCta.label}
                          <ArrowRight
                            className={s.ctaIcon}
                            aria-hidden="true"
                          />
                        </Link>
                      ) : (
                        // No study yet — the button answers with a playful tip.
                        <>
                          <span
                            className={s.tip}
                            data-show={tipFor === client.name}
                            role="status"
                          >
                            {cardCta.tip}
                          </span>
                          <button
                            type="button"
                            className={s.cta}
                            onClick={() => showTip(client.name)}
                          >
                            {cardCta.label}
                            <ArrowRight
                              className={s.ctaIcon}
                              aria-hidden="true"
                            />
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  )
}
