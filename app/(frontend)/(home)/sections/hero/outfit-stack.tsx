'use client'

import cn from 'clsx'
import { useResizeObserver } from 'hamo'
import { type CSSProperties, useState } from 'react'
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

const BAND_COUNT = 7
/* The stills' canvas ratio. The media box is exactly this shape on desktop and
   letterboxes the still by height on mobile, so on both breakpoints the drawn
   llama is `box height * this`. Displacements are scaled off that rather than
   off the box width, which would be far too wide on the full-bleed mobile box. */
const LOOK_ASPECT = 820 / 1080

interface TearBand {
  /** Displacement at each of the three steps, as a fraction of the llama's
      drawn width. Signs alternate so bands shear against each other. */
  dx: readonly [number, number, number]
  /** When this band hands the frame over to the incoming look, in ms from the
      rotator tick. Grouped so the change reads as a costume rewritten in
      strips: 360ms → bands 2,5 · 450ms → 0,4,6 · 540ms → 1,3. */
  flip: 360 | 450 | 540
}

/* One fixed table, reused for every transition — deterministic, so server and
   client render alike and reduced motion stays predictable (no Math.random).
   Magnitudes taper toward the bottom on purpose: the mattes are cropped tight
   at the feet (look-02's base touches the right edge), so a large shift there
   would be cut off by the box, whereas the head/torso bands carry ~240px of
   transparent margin each side and can take a much bigger throw. */
const TEAR_TABLE: readonly TearBand[] = [
  { dx: [0.03, -0.016, 0.008], flip: 450 },
  { dx: [-0.042, 0.024, -0.01], flip: 540 },
  { dx: [0.02, 0.04, -0.02], flip: 360 },
  { dx: [-0.026, -0.034, 0.014], flip: 540 },
  { dx: [0.036, 0.012, -0.006], flip: 450 },
  { dx: [-0.016, 0.02, 0.009], flip: 360 },
  { dx: [0.012, -0.008, -0.004], flip: 450 },
]

/**
 * Static-pose outfit stack (hero-outfit-swap): the llama holds one front pose
 * and only the wardrobe changes, driven by the SAME rotator index as the
 * headline word — sync is structural, not timed, so it cannot drift.
 *
 * The wardrobe changes by slice tear, not cross-dissolve
 * (replace-hero-wardrobe-dissolve): the llama shears into seven horizontal
 * bands that displace sideways and hand off to the incoming look band by band
 * over 270ms, starting 270ms behind the word. Two band layers — outgoing and
 * incoming — mean exactly one layer owns each band at any moment, so a wide
 * silhouette never ghosts through a narrower one (look-05's bicorne behind
 * look-01 was the case that blocked this last time). The whole schedule lives
 * in CSS keyframes; JS only toggles a class and writes the band geometry.
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
 * The resting layer stays a real `<img>` for exactly that reason: the HTML
 * preload scanner finds it while parsing, whereas a CSS background is only
 * discovered after CSSOM and style resolution. The bands may be backgrounds
 * because they are never LCP candidates, and they hold no image at all until
 * the first transition fires, so nothing competes with look-01 during load.
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
  // Derived-state-during-render: `prev` names the look the tear hands away
  // from, and `tick` counts transitions so the A/B animation names alternate.
  // A CSS animation only restarts when its name changes and these band
  // elements persist, so the alternation IS the trigger — LOOK_COUNT is odd,
  // so the index's own parity repeats at the wrap and cannot serve.
  const [track, setTrack] = useState({ index, prev: -1, tick: 0 })
  if (track.index !== index) {
    setTrack((state) => ({ index, prev: state.index, tick: state.tick + 1 }))
  }

  // Band boundaries are integer pixel rows, so adjacent bands butt exactly:
  // percentages land on fractional pixels and two antialiased clip edges meet
  // at ~75% coverage, reading as a pale hairline. Overlapping them instead
  // would be worse — the mattes' bodies sit at alpha 250–254, so an overlap
  // double-composites into a visible ridge.
  const [setBoxRef, entry] = useResizeObserver()
  const boxHeight = entry?.contentRect.height ?? 0
  const llamaWidth = boxHeight * LOOK_ASPECT

  const bands = TEAR_TABLE.map((band, i) => {
    const top = i === 0 ? 0 : Math.round((i * boxHeight) / BAND_COUNT)
    const bottom =
      i === BAND_COUNT - 1
        ? 0
        : boxHeight - Math.round(((i + 1) * boxHeight) / BAND_COUNT)
    return {
      clipPath:
        boxHeight > 0
          ? `inset(${top}px 0 ${bottom}px 0)`
          : // Unmeasured (SSR, first paint): clip to nothing rather than leak a
            // full un-banded copy of the look if anything ever un-hides a layer.
            'inset(50% 0)',
      '--dx-a': `${(llamaWidth * band.dx[0]).toFixed(2)}px`,
      '--dx-b': `${(llamaWidth * band.dx[1]).toFixed(2)}px`,
      '--dx-c': `${(llamaWidth * band.dx[2]).toFixed(2)}px`,
      '--flip': `${band.flip}ms`,
    }
  })

  // No transition has fired yet: no tear class, and the bands hold no image,
  // so they issue no request during load.
  const hasTorn = track.prev >= 0
  const tearClass = hasTorn && (track.tick % 2 === 1 ? s.tearA : s.tearB)
  const outgoing = hasTorn ? `url(${lookUrl(track.prev)})` : undefined
  const incoming = hasTorn ? `url(${lookUrl(track.index)})` : undefined

  return (
    <div ref={setBoxRef} className={cn(positionClass, s.llamaBox, tearClass)}>
      {Array.from({ length: LOOK_COUNT }, (_, i) => {
        const isActive = i === track.index
        const isFirst = i === 0
        return (
          <Image
            key={lookUrl(i)}
            src={lookUrl(i)}
            width={820}
            height={1080}
            unoptimized
            loading="eager"
            objectFit="contain"
            {...(isFirst && primary && { preload: true })}
            {...(isFirst && !primary && { fetchPriority: 'high' as const })}
            alt={isActive ? alt : ''}
            aria-hidden={!isActive}
            className={cn(
              s.look,
              isActive && s.lookActive,
              isActive && hasTorn && s.lookIn,
              i === track.prev && s.lookOut
            )}
          />
        )
      })}

      {/* Two band layers, seven strips each. Both carry the same displacement
          schedule; they differ only in which look they draw and in when each
          strip switches on or off, which is what makes the handoff exclusive. */}
      <div className={cn(s.bandLayer, s.bandsOut)}>
        {bands.map((band, i) => (
          <div
            className={s.band}
            // biome-ignore lint/suspicious/noArrayIndexKey: the band grid is a fixed-length ladder of strips, not a reorderable list
            key={i}
            style={{ ...band, backgroundImage: outgoing } as CSSProperties}
          />
        ))}
      </div>
      <div className={cn(s.bandLayer, s.bandsIn)}>
        {bands.map((band, i) => (
          <div
            className={s.band}
            // biome-ignore lint/suspicious/noArrayIndexKey: the band grid is a fixed-length ladder of strips, not a reorderable list
            key={i}
            style={{ ...band, backgroundImage: incoming } as CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
