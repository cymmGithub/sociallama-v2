'use client'

import { useSyncExternalStore } from 'react'

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
