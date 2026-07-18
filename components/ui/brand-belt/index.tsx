import cn from 'clsx'
import { Image } from '@/components/ui/image'
import { Marquee } from '@/components/ui/marquee'
import s from './brand-belt.module.css'

export interface BrandLogo {
  /** Accessible name, used as the logo's alt text. */
  name: string
  /** Logo image source. */
  src: string
}

interface BrandBeltProps {
  logos: BrandLogo[]
  className?: string
  /** Marquee copies; 2 gives a seamless loop. */
  repeat?: number
  /** Marquee speed multiplier. */
  speed?: number
}

/**
 * Plain scrolling logo belt: the shared Marquee motion primitive wrapped
 * around a single logo track. No heading, no hover cards — it animates and
 * that's all.
 *
 * Colours adapt to the ground through CSS custom properties the consumer
 * sets on (or above) the belt: `--belt-edge` (edge-fade colour, default
 * transparent — no visible fade), `--belt-logo-filter` (default none) and
 * `--belt-logo-opacity` (default 1).
 */
export function BrandBelt({
  logos,
  className,
  repeat = 2,
  speed = 0.6,
}: BrandBeltProps) {
  return (
    <Marquee className={cn(s.belt, className)} repeat={repeat} speed={speed}>
      <ul className={s.track}>
        {logos.map((logo) => (
          <li key={logo.name} className={s.item}>
            <Image
              src={logo.src}
              alt={logo.name}
              width={180}
              height={56}
              objectFit="contain"
              className={s.logo}
            />
          </li>
        ))}
      </ul>
    </Marquee>
  )
}
