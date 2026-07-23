'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'
import { usePreferredReducedMotion } from './use-sync-external'

const ROTATOR_INTERVAL = 1700

export interface RotationState {
  index: number
  prev: number
}

/**
 * Shared word-rotator state (hero headline, JoinCta heading). `prev` tracks
 * the word sliding out so only it (and the incoming word) transition —
 * waiting words snap into place unseen below the mask.
 *
 * The interval runs only while the observed element is on screen, and not at
 * all under reduced motion (the first word stays put).
 */
export function useRotator<T extends Element>(
  length: number
): { ref: RefObject<T | null>; rotation: RotationState } {
  const ref = useRef<T>(null)
  const [rotation, setRotation] = useState<RotationState>({
    index: 0,
    prev: -1,
  })
  const [inView, setInView] = useState(false)
  const reducedMotion = usePreferredReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) setInView(entry.isIntersecting)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion || !inView) return
    const id = setInterval(() => {
      setRotation((state) => ({
        index: (state.index + 1) % length,
        prev: state.index,
      }))
    }, ROTATOR_INTERVAL)
    return () => clearInterval(id)
  }, [reducedMotion, inView, length])

  return { ref, rotation }
}
