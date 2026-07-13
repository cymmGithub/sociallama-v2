'use client'

import { useMediaQuery } from 'hamo'
import { Image } from '@/components/ui/image'
import { Marquee } from '@/components/ui/marquee'
import { clients, clientsHeading } from '@/lib/content/home'
import s from './client-logos.module.css'

/* Keep the hover card on screen: cards are centred on their logo, so near the
   viewport edges we nudge them back inside (the caret stays on the logo). */
const EDGE_PAD = 16

function keepCardOnScreen(e: React.MouseEvent<HTMLLIElement>) {
  const li = e.currentTarget
  const card = li.querySelector<HTMLElement>('[role="tooltip"]')
  if (!card) return
  li.style.setProperty('--shift', '0px') // measure from the centred position
  const rect = card.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  let shift = 0
  if (rect.left < EDGE_PAD) shift = EDGE_PAD - rect.left
  else if (rect.right > vw - EDGE_PAD) shift = vw - EDGE_PAD - rect.right
  li.style.setProperty('--shift', `${shift}px`)
}

export function ClientLogos() {
  // Marquee's pauseOnHover reacts to mouseenter, which touch taps emulate —
  // gate it to mouse-like pointers so touch keeps the plain scrolling belt
  // (the spotlight/card CSS is gated by the same media query).
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')

  return (
    <section className={s.section}>
      {/* The visible heading names the section — no aria-label, so AT
          announces "Zaufali nam" exactly once. */}
      <h2 className={s.heading}>{clientsHeading}</h2>
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
                <div className={s.card} role="tooltip">
                  <p className={s.quote}>„{client.testimonial.quote}”</p>
                  <p className={s.author}>
                    <strong>{client.testimonial.author}</strong>
                    <span>{client.testimonial.company}</span>
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  )
}
