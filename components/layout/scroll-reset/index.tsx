'use client'

import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect } from 'react'
import { scrollToHashTarget } from './scroll-to-hash-target'

// Layout effect on the client, plain effect during SSR (no-op, no warning) —
// same pattern as use-reveal.ts. The landing must happen inside the
// navigation commit (pre-paint): the visitor never sees the page at the old
// offset, and a view-transition snapshot captures the landed state, so the
// poster morphs (hub card ⇄ hero) target the hero at its on-screen position.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Reset scroll to the top on client navigation.
 *
 * The custom <Link> navigates with `scroll={false}` (Next's native
 * scroll-to-top is skipped to avoid its sticky/fixed restoration warning),
 * and Lenis keeps its scroll position across route changes — the layout tree
 * doesn't remount, so nothing resets it. Without this, a route opened from a
 * scrolled page lands at the previous offset (e.g. mid-page on /kontakt).
 *
 * `scrollTo(0, { immediate: true })` sets Lenis's target and clears momentum,
 * so it wins over any in-flight scroll animation.
 *
 * Cross-page hash navigations (e.g. the homepage team tiles → /o-nas#zespol)
 * need handling too: the target page mounts via client nav, so the browser
 * never scrolls to the anchor and Lenis keeps the old offset — landing at the
 * top. When the anchor already exists at commit (prerendered destinations),
 * the jump happens right here in the layout effect — pre-paint, so the
 * view-transition snapshot captures the landed state. A still-streaming
 * destination falls back to watching for the anchor via `scrollToHashTarget`
 * instead of sampling the DOM once — a one-shot lookup missed streamed
 * sections and never scrolled (bug, 2026-08-04). Same-page anchors (#o-nas,
 * #uslugi) don't change `pathname`, so this effect never fires for them — the
 * browser handles those.
 */
export function ScrollReset() {
  const pathname = usePathname()
  const lenis = useLenis()

  useIsomorphicLayoutEffect(() => {
    // `pathname` is the navigation trigger — read here (not just listed as a
    // dep) so it drives the effect and Biome's exhaustive-deps/unused-var
    // autofix can't strip it. It is always a non-empty path, so the guard
    // never short-circuits on it.
    if (!pathname) return

    const jump = (el: HTMLElement) => {
      if (lenis) {
        lenis.scrollTo(el, { immediate: true, force: true })
      } else {
        el.scrollIntoView()
      }
    }

    const hash = window.location.hash
    if (!hash) {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo(0, 0)
      }
      return
    }

    // Fast path: the target already exists at commit (true for prerendered
    // destinations like /o-nas#zespol) — land on it inside the commit.
    // Fallback: the destination is still streaming; watch for the anchor
    // post-paint, exactly as before (the documented 2026-08-04 fix).
    const el = document.getElementById(hash.slice(1))
    if (el) {
      jump(el)
      return
    }
    return scrollToHashTarget(hash, jump)
  }, [pathname, lenis])

  return null
}
