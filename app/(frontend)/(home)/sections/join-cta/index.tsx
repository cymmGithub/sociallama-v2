'use client'

import cn from 'clsx'
import {
  Bookmark,
  CircleSmall,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { joinCta, type LocalizedHome } from '@/lib/content/home'
import { useRotator } from '@/lib/hooks/use-rotator'
import s from './join-cta.module.css'

export function JoinCta({
  content = joinCta,
}: {
  content?: LocalizedHome['joinCta']
}) {
  // Rotates the locative token through the offer. Static under reduced
  // motion (shows the first entry only); paused while off screen.
  const { ref: rotatorRef, rotation } = useRotator<HTMLElement>(
    content.rotator.length
  )

  return (
    <section ref={rotatorRef} className={s.section}>
      <div className={s.copy}>
        {/* The visual token rotates; expose a stable accessible name. */}
        <h2
          className={s.heading}
          aria-label={`${content.headingLead} ${content.rotator[0]?.token ?? ''}`}
        >
          <span aria-hidden="true">{content.headingLead}</span>
          <span aria-hidden="true" className={s.tokenMask}>
            <span className={s.rotator}>
              {content.rotator.map((entry, index) => (
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
        <Link className={s.button} href={content.button.href}>
          {content.button.label}
        </Link>
      </div>
      {/* Wrapped in fake sponsored-post chrome: the CTA literally becomes the
          ad we'd run for ourselves. Post chrome is decorative (icons hidden
          from AT); the media keeps the accessible label.
          TEMP (2026-07-22): the looping llama clip is replaced by its first
          frame served as a static image (`content.poster` == frame 0 of
          `content.clip`). The mp4 stays in the repo for later — re-add the
          Video import and swap this <Image> for <Video src={content.clip}> to
          restore motion. */}
      <div className={s.media}>
        <div className={s.card}>
          <div className={s.cardHeader}>
            <Link
              className={s.cardProfile}
              href={content.post.href}
              aria-label={`${content.post.handle} ${content.post.onInstagram}`}
            >
              <span className={s.avatar} aria-hidden="true" />
              <span className={s.cardIdentity}>
                <b>{content.post.handle}</b>
                <span>
                  {content.post.meta}
                  <CircleSmall
                    className={s.metaSep}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  {content.post.metaNote}
                </span>
              </span>
            </Link>
            <MoreHorizontal className={s.cardMore} aria-hidden="true" />
          </div>
          <Image src={content.poster} alt={content.llamaAlt} aspectRatio={1} />
          <div className={s.cardFooter}>
            <div className={s.cardActions} aria-hidden="true">
              <Heart />
              <MessageCircle />
              <Send />
              <Bookmark className={s.cardSave} />
            </div>
            <b className={s.cardLikes}>{content.post.likes}</b>
            <p className={s.cardCaption}>
              <b>{content.post.handle}</b> {content.post.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
