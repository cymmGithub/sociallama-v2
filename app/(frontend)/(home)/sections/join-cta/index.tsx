'use client'

import cn from 'clsx'
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { joinCta } from '@/lib/content/home'
import { useRotator } from '@/lib/hooks/use-rotator'
import s from './join-cta.module.css'

export function JoinCta() {
  // Rotates the locative token through the offer. Static under reduced
  // motion (shows the first entry only); paused while off screen.
  const { ref: rotatorRef, rotation } = useRotator<HTMLElement>(
    joinCta.rotator.length
  )

  return (
    <section ref={rotatorRef} className={s.section}>
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
      {/* Looping clip on its own clock — no sync with the heading rotator —
          wrapped in fake sponsored-post chrome: the CTA literally becomes the
          ad we'd run for ourselves. Post chrome is decorative (icons hidden
          from AT); the video keeps the accessible label. */}
      <div className={s.media}>
        <div className={s.card}>
          <div className={s.cardHeader}>
            <Link
              className={s.cardProfile}
              href={joinCta.post.href}
              aria-label={`${joinCta.post.handle} na Instagramie`}
            >
              <span className={s.avatar} aria-hidden="true" />
              <span className={s.cardIdentity}>
                <b>{joinCta.post.handle}</b>
                <span>{joinCta.post.meta}</span>
              </span>
            </Link>
            <MoreHorizontal className={s.cardMore} aria-hidden="true" />
          </div>
          <Video
            src={joinCta.clip}
            poster={joinCta.poster}
            alt={joinCta.llamaAlt}
            aspectRatio={1}
          />
          <div className={s.cardFooter}>
            <div className={s.cardActions} aria-hidden="true">
              <Heart />
              <MessageCircle />
              <Send />
              <Bookmark className={s.cardSave} />
            </div>
            <b className={s.cardLikes}>{joinCta.post.likes}</b>
            <p className={s.cardCaption}>
              <b>{joinCta.post.handle}</b> {joinCta.post.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
