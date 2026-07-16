'use client'

import cn from 'clsx'
import { useEffect, useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { joinCta } from '@/lib/content/home'
import s from './join-cta.module.css'

const ROTATOR_INTERVAL = 2600

export function JoinCta() {
  // prev tracks the token sliding out so only it (and the incoming token)
  // transition — waiting tokens snap into place unseen below the mask.
  const [rotation, setRotation] = useState({ index: 0, prev: -1 })

  // Rotate the locative token through the offer. Static under reduced motion
  // (shows the first entry only — word and image alike).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      setRotation((state) => ({
        index: (state.index + 1) % joinCta.rotator.length,
        prev: state.index,
      }))
    }, ROTATOR_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return (
    <section className={s.section}>
      <div className={s.copy}>
        {/* The visual token rotates; expose a stable accessible name. */}
        <h2
          className={s.heading}
          aria-label={`${joinCta.headingLead} ${joinCta.rotator[0].token}`}
        >
          <span aria-hidden="true">{joinCta.headingLead}</span>
          <span aria-hidden="true" className={s.tokenMask}>
            <span className={s.rotator}>
              {joinCta.rotator.map((entry, index) => (
                <span
                  key={entry.token}
                  className={cn(
                    s.rotatorWord,
                    index === rotation.index && s.rotatorWordActive,
                    index === rotation.prev && s.rotatorWordLeaving
                  )}
                >
                  {entry.token}
                </span>
              ))}
            </span>
          </span>
        </h2>
        <Link className={s.button} href={joinCta.button.href}>
          {joinCta.button.label}
        </Link>
      </div>
      {/* Images stack in one grid cell and crossfade off the same rotation
          state as the heading, so word and image stay index-locked. All nine
          stay mounted (decoded) for flash-free swaps; each is graded to flat
          #722341, compositing seamlessly onto the plum-deep chapter. */}
      <div className={s.media} role="img" aria-label={joinCta.llamaAlt}>
        {joinCta.rotator.map((entry, index) => (
          <Image
            key={entry.token}
            src={entry.image}
            alt=""
            width={1080}
            height={1080}
            desktopSize="25vw"
            mobileSize="70vw"
            className={cn(s.slide, index === rotation.index && s.slideActive)}
          />
        ))}
      </div>
    </section>
  )
}
