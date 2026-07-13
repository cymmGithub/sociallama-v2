'use client'

import { useState } from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { Video } from '@/components/ui/video'
import { services } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './services.module.css'

export function Services() {
  const gridRef = useReveal<HTMLUListElement>()
  // Hover-gated clip previews (design D5): the poster cutout renders until a
  // card is hovered, then its clip mounts and plays. Touch devices never
  // hover, so they keep the poster — matching the Video primitive's
  // autoPlay=false poster path.
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className={s.section} id="uslugi">
      <header className={s.head}>
        <p className={s.eyebrow}>{services.eyebrow}</p>
        <h2 className={s.heading}>{services.heading}</h2>
      </header>

      <ul ref={gridRef} className={s.grid}>
        {services.items.map((service) => (
          <li
            key={service.id}
            data-reveal-item
            className={s.card}
            onMouseEnter={() => setHovered(service.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={s.media}>
              {service.clip ? (
                <Video
                  src={service.clip}
                  poster={service.poster}
                  autoPlay={hovered === service.id}
                />
              ) : (
                <Image
                  src={service.poster}
                  alt=""
                  fill
                  objectFit="cover"
                  className={s.poster}
                  mobileSize="100vw"
                  desktopSize="33vw"
                />
              )}
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
