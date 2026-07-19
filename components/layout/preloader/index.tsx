'use client'

import { useEffect, useState } from 'react'
import styles from './preloader.module.css'

const LOCK_CLASS = 'sl-intro-lock'
// Slightly past the last panel lift (1.35s + 0.72s) so the reveal fully lands.
const DURATION_MS = 2150

// Wordmark letters with their reveal stagger, precomputed once. Keyed on the
// (unique) delay so no array index is needed for React keys.
const LETTERS = 'sociallama'
  .split('')
  .map((char, i) => ({ char, delay: (i * 0.045).toFixed(3) }))

/**
 * "Plum Curtain" first-paint intro. See
 * docs/superpowers/specs/2026-07-19-preloader-design.md.
 *
 * Plays on every full page load / hard refresh — the fixed overlay sits above
 * everything (including the `loading.tsx` "Cooking…" Suspense fallback), so each
 * refresh reads as one consistent branded reveal while content streams in
 * behind it. It does NOT replay on client-side navigation: the frontend layout
 * stays mounted across routes, so this component mounts once per document load.
 *
 * The choreography is pure CSS (see the module) so it plays at first paint
 * without waiting for hydration. This component only adds the progressive
 * enhancements: holding page scroll while the curtain is up, and retiring the
 * node once the sequence is done. Reduced-motion users get an instant reveal
 * (the CSS has already hidden the curtain), so we just unmount.
 */
export function Preloader() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true)
      return
    }

    const root = document.documentElement
    root.classList.add(LOCK_CLASS)
    const timer = window.setTimeout(() => {
      root.classList.remove(LOCK_CLASS)
      setDone(true)
    }, DURATION_MS)

    return () => {
      window.clearTimeout(timer)
      root.classList.remove(LOCK_CLASS)
    }
  }, [])

  if (done) return null

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.panelBack} />
      <div className={styles.panelFront}>
        <span className={styles.maskline}>
          <span className={styles.word}>
            {LETTERS.map(({ char, delay }) => (
              <span
                key={`${char}-${delay}`}
                className={styles.ltr}
                style={{ animationDelay: `${delay}s` }}
              >
                {char}
              </span>
            ))}
          </span>
        </span>
        <span className={styles.rule} />
      </div>
    </div>
  )
}
