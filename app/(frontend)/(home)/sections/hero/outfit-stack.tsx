'use client'

import cn from 'clsx'
import { Image } from '@/components/ui/image'
import s from './hero.module.css'

/* One transparent front-pose still per rotator word (rembg matte, no baked
   plum) — an 820x1080 canvas cropped tight to the llama (the dead left plum of
   the old 1370-wide take is gone), so it composites onto the section plum via
   CSS: right-anchored on desktop, centered on mobile. Order mirrors the
   rotator: KREACJE & WIDEO, SOCIAL MEDIA, TREŚCI, SPRZEDAŻ, STRATEGIA. */
export const LOOK_COUNT = 5
const lookUrl = (i: number) =>
  `/clips/hero-looks/look-${String(i + 1).padStart(2, '0')}.webp`

/**
 * Static-pose outfit stack (hero-outfit-swap): the llama holds one front pose
 * and only the wardrobe changes, driven by the SAME rotator index as the
 * headline word — sync is structural, not timed, so it cannot drift. All five
 * stills render stacked and the active one fades in over the leaving one.
 *
 * Rendered once per breakpoint (`positionClass` supplies the desktop absolute
 * box or the mobile media box); the 5 URLs are identical, so the browser still
 * fetches only 5 files no matter how many instances mount.
 *
 * Priority: only look-01 (first paint / LCP candidate) is prioritized — looks
 * 2–5 load eagerly but at normal priority so they don't contend with it. The
 * `primary` instance owns the single `<link rel=preload>`; any secondary
 * instance hints high priority inline instead, avoiding a duplicate-preload
 * warning while still favouring look-01 whichever viewport paints.
 *
 * unoptimized: Next's optimizer re-encodes transparent WebP and shifts
 * colour/alpha (the known width-specific corruption) — serve the mattes as-is.
 */
export function HeroLooks({
  index,
  alt,
  positionClass,
  primary = false,
}: {
  index: number
  alt: string
  // A CSS-module class (typed `string | undefined` under noUncheckedIndexedAccess);
  // clsx drops it if undefined, exactly as the rest of the hero passes these.
  positionClass: string | undefined
  primary?: boolean
}) {
  return (
    <>
      {Array.from({ length: LOOK_COUNT }, (_, i) => {
        const isActive = i === index
        const isFirst = i === 0
        return (
          <Image
            key={lookUrl(i)}
            src={lookUrl(i)}
            width={820}
            height={1080}
            unoptimized
            loading="eager"
            {...(isFirst && primary && { preload: true })}
            {...(isFirst && !primary && { fetchPriority: 'high' as const })}
            alt={isActive ? alt : ''}
            aria-hidden={!isActive}
            className={cn(positionClass, s.look, isActive && s.lookActive)}
          />
        )
      })}
    </>
  )
}
