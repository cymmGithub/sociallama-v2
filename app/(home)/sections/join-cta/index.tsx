import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { joinCta } from '@/lib/content/home'
import s from './join-cta.module.css'

export function JoinCta() {
  return (
    <section className={s.section}>
      <div className={s.copy}>
        <h2 className={s.heading}>
          {joinCta.headingLead}{' '}
          <span className={s.emphasis}>{joinCta.headingEmphasis}</span>
        </h2>
        <Link className={s.button} href={joinCta.button.href}>
          {joinCta.button.label}
        </Link>
      </div>
      <div className={s.media}>
        {/* Clip background is flat #722341 (plum-dark), compositing seamlessly
            onto the plum-deep chapter (design D3/D5). */}
        <Video
          src={joinCta.clip}
          poster={joinCta.poster}
          aspectRatio={1}
          className={s.llama}
        />
      </div>
    </section>
  )
}
