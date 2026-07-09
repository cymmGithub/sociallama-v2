import { Image } from '@/components/ui/image'
import { Marquee } from '@/components/ui/marquee'
import { clients } from '@/lib/content/home'
import s from './client-logos.module.css'

export function ClientLogos() {
  return (
    <section className={s.section} aria-label="Zaufali nam">
      <Marquee className={s.marquee} repeat={2} speed={0.6}>
        <ul className={s.track}>
          {clients.map((client) => (
            <li key={client.name} className={s.item}>
              <Image
                src={client.logo}
                alt={client.name}
                width={180}
                height={56}
                objectFit="contain"
                className={s.logo}
              />
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  )
}
