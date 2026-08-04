/**
 * Watch the DOM for a hash target and hand it to `scroll` once it exists.
 *
 * Cross-page hash navigations land on pages that may still be streaming: in
 * production the destination commits its loading shell first (the pathname
 * changes), and the section carrying the anchor arrives afterwards. A
 * one-shot `querySelector` on the frame after the commit misses that target
 * permanently — this helper polls per animation frame until the element
 * appears, then scrolls exactly once.
 *
 * `timeoutMs` bounds the watch (a hash that never resolves — typo, removed
 * section — must not poll forever). A malformed hash (`#a#b`) is treated the
 * same as a missing target rather than throwing out of `querySelector`.
 *
 * Returns a cancel function; callers tie it to effect cleanup so a newer
 * navigation stops the older watcher.
 */
export function scrollToHashTarget(
  hash: string,
  scroll: (el: HTMLElement) => void,
  { timeoutMs = 6000 }: { timeoutMs?: number } = {}
): () => void {
  let cancelled = false
  let raf = 0
  const deadline = performance.now() + timeoutMs

  const attempt = () => {
    if (cancelled) return
    let el: HTMLElement | null = null
    try {
      el = document.querySelector<HTMLElement>(hash)
    } catch {
      return // invalid selector — nothing will ever match it
    }
    if (el) {
      scroll(el)
      return
    }
    if (performance.now() < deadline) {
      raf = requestAnimationFrame(attempt)
    }
  }

  raf = requestAnimationFrame(attempt)

  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
  }
}
