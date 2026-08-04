'use client'

import { useSyncExternalStore } from 'react'
import { breakpoints } from '@/styles/config'

/**
 * Browser API Hooks using useSyncExternalStore
 *
 * These hooks provide performant, concurrent-rendering-safe subscriptions
 * to browser APIs. Components only re-render when their subscribed value changes.
 *
 * @see https://react.dev/reference/react/useSyncExternalStore
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot(): boolean {
  return false
}

/**
 * Subscribe to user's reduced motion preference.
 *
 * Uses useSyncExternalStore for concurrent-rendering safety.
 * Only re-renders when reduced motion preference changes.
 *
 * @returns Whether the user prefers reduced motion
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = usePreferredReducedMotion()
 *
 *   const animationDuration = prefersReducedMotion ? 0 : 300
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={{ duration: animationDuration / 1000 }}
 *     />
 *   )
 * }
 * ```
 */
export function usePreferredReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
}

const DESKTOP_QUERY = `(min-width: ${breakpoints.dt}px)`

function subscribeToDesktop(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function getDesktopServerSnapshot(): boolean {
  return false
}

/**
 * Whether the viewport is at or above the house desktop breakpoint
 * (`breakpoints.dt`, the `--desktop` custom-media line).
 *
 * Unlike hamo's effect-based `useMediaQuery` (undefined on a component's
 * first render), this reads the client snapshot synchronously — required
 * where the value must be correct in the very commit a navigation paints,
 * e.g. naming the team slider's ViewTransition slot on arrival: an
 * undefined first render there leaves the slot unnamed at snapshot time
 * and silently disables the morph.
 *
 * SSR snapshot is `false` (mobile-first): the prerendered HTML never
 * carries desktop-only wiring, and capable clients flip in the hydration
 * re-render.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  )
}
