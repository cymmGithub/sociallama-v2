import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
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
        <Image
          src={joinCta.poster}
          alt=""
          width={420}
          height={420}
          objectFit="contain"
          className={s.llama}
        />
      </div>
    </section>
  )
}
