'use client'

/**
 * Three-chapter scroll narrative with an animated background morph.
 *
 * Each chapter is a `data-theme` wrapper so its sections resolve brand tokens
 * (`primary`/`secondary`/`contrast`). A single fixed background layer sits at
 * `z-index:-1` — painting above the body's background canvas but below content —
 * and its `background-color` transitions (~0.9s) between chapter theme
 * backgrounds as scroll crosses the viewport center (IntersectionObserver with a
 * center band). Chapters are transparent so the layer shows through; the hero
 * video therefore composites directly onto `#892f53` during chapter 1.
 *
 * Reduced motion: the global `--reduced-motion` rule neutralizes the layer's
 * transition, so backgrounds snap instead of morphing.
 */

import { useEffect, useRef, useState } from 'react'
import type { ThemeName } from '@/styles/config'
import { themes } from '@/styles/config'
import s from './chapters.module.css'

const CHAPTERS: { theme: ThemeName }[] = [
  { theme: 'plum' },
  { theme: 'cream' },
  { theme: 'plum-deep' },
]

export function Chapters({ children }: { children: React.ReactNode[] }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.chapter ?? 0
            )
            setActive(index)
            // Drive the global theme too, so the fixed chrome (Header/Footer,
            // which live outside the chapter wrappers) adapts its tokens to the
            // chapter currently in view.
            document.documentElement.setAttribute(
              'data-theme',
              CHAPTERS[index]!.theme
            )
          }
        }
      },
      // Center-of-viewport band: a chapter becomes active as it crosses the
      // vertical middle of the screen.
      { rootMargin: '-50% 0px -50% 0px' }
    )

    for (const el of refs.current) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className={s.background}
        style={{ backgroundColor: themes[CHAPTERS[active]!.theme].primary }}
      />
      {CHAPTERS.map((chapter, index) => (
        <div
          key={chapter.theme}
          data-theme={chapter.theme}
          data-chapter={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          className={s.chapter}
        >
          {children[index]}
        </div>
      ))}
    </>
  )
}
