'use client'

import { useMediaQuery } from 'hamo'
import { ArrowRight } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Marquee } from '@/components/ui/marquee'
import { CLIENT_ROSTER, type ClientCopy } from '@/lib/content/clients'
import type { LocalizedHome } from '@/lib/content/home'
import s from './client-logos.module.css'

/* Keep the hover card on screen: cards are centred on their logo, so near the
   viewport edges we nudge them back inside (the caret stays on the logo). */
const EDGE_PAD = 16

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
  clients,
  heading,
  cardCta,
  caseStudyBase = '/case-studies',
}: {
  /** Per-locale card copy, keyed by roster key. The roster itself is shared. */
  clients: ClientCopy
  heading: LocalizedHome['clientsHeading']
  cardCta: LocalizedHome['clientCardCta']
  /** Case-study route prefix for the current locale. */
  caseStudyBase?: string
}) {
  // Marquee's pauseOnHover reacts to mouseenter, which touch taps emulate —
  // gate it to mouse-like pointers so touch keeps the plain scrolling belt
  // (the spotlight/card CSS is gated by the same media query).
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')

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
          {CLIENT_ROSTER.map((client) => {
            const copy = clients[client.key]
            // Three card states, derived from the copy rather than a flag: a
            // testimonial opens a quote card, a figure sentence opens a numbers
            // card, and a brand with neither is a bare logo with no card.
            const testimonial = copy?.testimonial
            const numbers = testimonial ? undefined : copy?.numbers
            return (
              <li
                key={client.key}
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
                {(testimonial || numbers) && (
                  // Interactive popover, not a tooltip (it holds a link): the
                  // ::before bridge in the CSS spans the logo↔card gap so the
                  // cursor can travel up to the CTA without the card closing.
                  <div className={s.card}>
                    {testimonial ? (
                      <>
                        <p className={s.quote}>„{testimonial.quote}”</p>
                        <div className={s.foot}>
                          {testimonial.image ? (
                            <Image
                              src={testimonial.image}
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
                              {initialsOf(testimonial.author)}
                            </span>
                          )}
                          <p className={s.author}>
                            <strong>{testimonial.author}</strong>
                            <span>{testimonial.company}</span>
                          </p>
                        </div>
                      </>
                    ) : (
                      // Numbers card: the sentence leads with the headline
                      // figure, the rows below add the supporting ones. No
                      // author footer — there is nobody to attribute it to.
                      <>
                        <p className={s.numbers}>{numbers}</p>
                        {copy?.metrics && copy.metrics.length > 0 && (
                          <dl className={s.metrics}>
                            {copy.metrics.map((metric) => (
                              <div className={s.metric} key={metric.label}>
                                <dt>{metric.label}</dt>
                                <dd>{metric.value}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </>
                    )}
                    {client.caseStudySlug && (
                      <div className={s.ctaRow}>
                        <span className={s.ctaWrap}>
                          <Link
                            href={`${caseStudyBase}/${client.caseStudySlug}`}
                            className={s.cta}
                          >
                            {cardCta.label}
                            <ArrowRight
                              className={s.ctaIcon}
                              aria-hidden="true"
                            />
                          </Link>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </Marquee>
    </section>
  )
}
