'use client'

import { useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

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
 * so it wins over any in-flight scroll animation. Hash navigations are left
 * alone so in-page anchors (#o-nas, #uslugi) still land on their target.
 */
export function ScrollReset() {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    // `pathname` is the navigation trigger — read here (not just listed as a
    // dep) so it drives the effect and Biome's exhaustive-deps/unused-var
    // autofix can't strip it. It is always a non-empty path, so the guard
    // never short-circuits on it; the hash check is the only real early-out.
    if (!pathname || window.location.hash) return
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, lenis])

  return null
}
