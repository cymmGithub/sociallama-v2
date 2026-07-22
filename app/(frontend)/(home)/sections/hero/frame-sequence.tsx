'use client'

import { useEffect, useRef } from 'react'
import { useTempus } from 'tempus/react'
import s from './hero.module.css'

/* Transparent head-turn frames (rembg matte, no baked plum) composited live
   onto the CSS plum ground — nothing for Safari to colour-manage, unlike the
   old baked-background clip. 60 frames = the source clip's 24fps × 2.5s,
   played back at natural speed as a one-shot montage. (30-frame/12fps
   decimation was tried for payload and rejected — visibly choppy, 2026-07-22.) */
const FRAME_COUNT = 60
const FRAME_W = 1370
const FRAME_H = 1080
const DURATION_MS = 2500
/* Minimum delay before the montage starts, so it lands alongside the
   headline stagger (0.2s delay + first line landing) instead of before it. */
const START_DELAY_MS = 300
const frameUrl = (i: number) =>
  `/clips/hero-frames/${String(i + 1).padStart(3, '0')}.webp`

/**
 * Canvas frame-sequence renderer. Preloads all 60 transparent frames, then
 * plays them through once on a time clock (hero-intro-montage) — a plain
 * `drawImage` swap per elapsed-time frame, GPU-composited, no video pipeline
 * (which is what rendered inconsistently on Safari). Fully independent of the
 * headline rotator (user decision 2026-07-22: no word↔outfit coupling — it
 * was tried as bursts and as montage-driven flips and felt flaky both ways).
 * The clock starts only when every frame has decoded AND the mount delay has
 * passed, so the one showpiece playthrough never drops frames; until then
 * the canvas holds frame 0. After the last frame the montage holds — no
 * loop, no replay. Desktop only; mobile keeps its poster.
 */
export function HeroFrames({ alt }: { alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const lastDrawn = useRef(-1)
  // Clock baseline (performance.now() at montage start); null until the
  // decode + delay gate opens. lastDrawn persists across Activity re-shows
  // (refs survive while effects re-run), so a finished montage stays finished
  // even though this effect re-stamps the baseline.
  const startRef = useRef<number | null>(null)

  // Preload every frame up front (all 60 show within 2.5s, so lazy-loading
  // would drop frames). Draw frame 0 the moment it decodes so the llama
  // paints without waiting on the whole sequence.
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

    // Start gate: all frames decoded AND the mount delay elapsed. A failed
    // decode is caught (not awaited forever) — the draw loop's completeness
    // guard just skips that frame.
    let cancelled = false
    const delay = new Promise((resolve) => setTimeout(resolve, START_DELAY_MS))
    const decoded = Promise.all(
      imgs.map((img) => img.decode().catch(() => undefined))
    )
    Promise.all([decoded, delay]).then(() => {
      if (!cancelled) startRef.current = performance.now()
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Per-frame: map elapsed time onto a frame index, redraw only on change.
  // clearRect first — frames are transparent, so without it the previous
  // subject's silhouette ghosts through where the new frame is empty.
  useTempus(() => {
    const canvas = canvasRef.current
    const frames = framesRef.current
    if (!canvas || frames.length === 0) return
    if (lastDrawn.current === FRAME_COUNT - 1) return // montage done — hold
    const start = startRef.current
    if (start === null) return // gate not open yet — hold frame 0

    const elapsed = performance.now() - start
    const idx = Math.min(
      FRAME_COUNT - 1,
      Math.floor((elapsed / DURATION_MS) * FRAME_COUNT)
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
