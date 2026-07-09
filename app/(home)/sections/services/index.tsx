'use client'

import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { services } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './services.module.css'

export function Services() {
  const gridRef = useReveal<HTMLUListElement>()

  return (
    <section className={s.section} id="uslugi">
      <header className={s.head}>
        <p className={s.eyebrow}>{services.eyebrow}</p>
        <h2 className={s.heading}>{services.heading}</h2>
      </header>

      <ul ref={gridRef} className={s.grid}>
        {services.items.map((service) => (
          <li key={service.id} data-reveal-item className={s.card}>
            <div className={s.media}>
              {/* Clips are deferred (design D5); the poster still fills the same
                  slot and swaps to <Video> once a clip is generated. */}
              <Image
                src={service.poster}
                alt=""
                fill
                objectFit="cover"
                className={s.poster}
                mobileSize="100vw"
                desktopSize="33vw"
              />
            </div>
            <h3 className={s.title}>{service.title}</h3>
            <p className={s.body}>{service.body}</p>
            <Link className={s.link} href={service.link.href}>
              {service.link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
