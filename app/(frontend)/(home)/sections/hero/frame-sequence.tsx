'use client'

import { useEffect, useRef } from 'react'
import { useTempus } from 'tempus/react'
import s from './hero.module.css'
import { useHeroScrubTarget } from './track'

/* Transparent head-turn frames (rembg matte, no baked plum) composited live
   onto the CSS plum ground — nothing for Safari to colour-manage, unlike the
   old baked-background clip. 60 frames = the source clip's 24fps × 2.5s, so
   scrub target (0..1) maps one-to-one onto a frame index. */
const FRAME_COUNT = 60
const FRAME_W = 1370
const FRAME_H = 1080
const frameUrl = (i: number) =>
  `/clips/hero-frames/${String(i + 1).padStart(3, '0')}.webp`

/**
 * Canvas frame-sequence renderer. Preloads all 60 transparent frames, then the
 * per-frame tempus loop draws the frame nearest the scroll scrub target — a
 * plain `drawImage` swap, GPU-composited, no video seek pipeline (which is what
 * rendered inconsistently on Safari). Desktop only; mobile keeps its poster.
 */
export function HeroFrames({ alt }: { alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const lastDrawn = useRef(-1)
  const scrubTargetRef = useHeroScrubTarget()

  // Preload every frame up front (they all get shown across the runway, so
  // lazy-loading would stutter the scrub). Draw frame 0 the moment it decodes
  // so the llama paints without waiting on the whole sequence.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const imgs = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image()
      img.src = frameUrl(i)
      return img
    })
    framesRef.current = imgs

    const first = imgs[0]
    if (!(ctx && first)) return
    const paintFirst = () => {
      if (lastDrawn.current === -1) {
        ctx.drawImage(first, 0, 0)
        lastDrawn.current = 0
      }
    }
    if (first.complete && first.naturalWidth > 0) paintFirst()
    else first.addEventListener('load', paintFirst, { once: true })
  }, [])

  // Per-frame: pick the frame nearest the scrub target, redraw only on change.
  // clearRect first — frames are transparent, so without it the previous
  // subject's silhouette ghosts through where the new frame is empty.
  useTempus(() => {
    const canvas = canvasRef.current
    const frames = framesRef.current
    if (!(canvas && scrubTargetRef) || frames.length === 0) return

    const idx = Math.min(
      FRAME_COUNT - 1,
      Math.round(scrubTargetRef.current * (FRAME_COUNT - 1))
    )
    if (idx === lastDrawn.current) return

    const img = frames[idx]
    if (!img?.complete || img.naturalWidth === 0) return // still decoding

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, FRAME_W, FRAME_H)
    ctx.drawImage(img, 0, 0)
    lastDrawn.current = idx
  })

  return (
    <canvas
      ref={canvasRef}
      className={s.video}
      width={FRAME_W}
      height={FRAME_H}
      role="img"
      aria-label={alt}
    />
  )
}
