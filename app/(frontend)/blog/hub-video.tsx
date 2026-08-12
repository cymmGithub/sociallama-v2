import { ExternalLink, Play } from 'lucide-react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { focalPosition, type VideoSpotlight } from '@/lib/payload/queries'
import s from './blog.module.css'

/**
 * The video spotlight: a poster, a play badge, and a link out to YouTube.
 *
 * No iframe by design (decision 6). Nothing third-party loads, no cookies are
 * set, and the consent question never arises — the cost is that this is the one
 * block on the hub that sends the reader away, which is why leaving is marked
 * explicitly rather than disguised as in-page playback.
 *
 * `Link` derives the new-tab behaviour from the href itself — an absolute
 * http(s) URL gets `target="_blank" rel="noopener noreferrer"` automatically —
 * which is why the global refuses to save a destination without a protocol.
 *
 * Shared by both locales. `content` is typed structurally rather than through
 * `Localized`, which maps over object types and would strip `posterLabel`'s
 * callability.
 */
export function HubVideo({
  video,
  content,
}: {
  video: VideoSpotlight
  content: {
    badge: string
    play: string
    label: string
    posterLabel: (title: string) => string
  }
}) {
  return (
    <section className={s.spotlight}>
      <Link
        aria-label={content.posterLabel(video.title)}
        className={s.spotlightFrame}
        href={video.url}
      >
        <Image
          alt={video.poster.alt ?? ''}
          desktopSize="55vw"
          fill
          mobileSize="100vw"
          objectFit="cover"
          src={video.poster.url ?? ''}
          style={focalPosition(video.poster)}
        />
        {/* Sits above the frame's scrim, which keeps it legible on any still. */}
        <span className={s.play}>
          <Play aria-hidden="true" />
          {content.play}
        </span>
      </Link>

      <div>
        <span className={s.spotlightBadge}>{content.badge}</span>
        <h2 className={s.spotlightTitle}>{video.title}</h2>
        {video.description && (
          <p className={s.spotlightText}>{video.description}</p>
        )}
        <div className={s.spotlightFoot}>
          <Link className={s.outLink} href={video.url}>
            {content.label}
            <ExternalLink aria-hidden="true" />
          </Link>
          {video.duration && (
            <span className={s.spotlightDuration}>{video.duration}</span>
          )}
        </div>
      </div>
    </section>
  )
}
