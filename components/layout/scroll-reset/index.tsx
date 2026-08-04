'use client'

import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { scrollToHashTarget } from './scroll-to-hash-target'

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
 * top. The destination may also still be streaming when the pathname commits
 * (production /o-nas shows its loading shell first), so the jump watches for
 * the anchor per frame via `scrollToHashTarget` instead of sampling the DOM
 * once — a one-shot lookup missed streamed sections and silently never
 * scrolled (bug, 2026-08-04). Same-page anchors (#o-nas, #uslugi) don't
 * change `pathname`, so this effect never fires for them — the browser handles
 * those.
 */
export function ScrollReset() {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    // `pathname` is the navigation trigger — read here (not just listed as a
    // dep) so it drives the effect and Biome's exhaustive-deps/unused-var
    // autofix can't strip it. It is always a non-empty path, so the guard
    // never short-circuits on it.
    if (!pathname) return

    const hash = window.location.hash
    if (!hash) {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo(0, 0)
      }
      return
    }

    return scrollToHashTarget(hash, (el) => {
      if (lenis) {
        lenis.scrollTo(el, { immediate: true, force: true })
      } else {
        el.scrollIntoView()
      }
    })
  }, [pathname, lenis])

  return null
}
