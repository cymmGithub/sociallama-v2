/**
 * Watch the DOM for a hash target and hand it to `scroll` once it exists.
 *
 * Cross-page hash navigations land on pages that may still be streaming: in
 * production the destination commits its loading shell first (the pathname
 * changes), and the section carrying the anchor arrives afterwards. A
 * one-shot lookup on the frame after the commit misses that target
 * permanently — this helper polls per animation frame until the element
 * appears, then scrolls exactly once. (A MutationObserver would wake less
 * often, but happy-dom — the bun test DOM — does not deliver async
 * mutations, so the observer variant cannot be covered by the tests below.)
 *
 * `timeoutMs` bounds the watch (a hash that never resolves — typo, removed
 * section — must not poll forever). Lookup is `getElementById`, so a
 * malformed hash (`#a#b`) simply never matches instead of throwing the way
 * `querySelector` would.
 *
 * Returns a cancel function; callers tie it to effect cleanup so a newer
 * navigation stops the older watcher.
 */
export function scrollToHashTarget(
  hash: string,
  scroll: (el: HTMLElement) => void,
  { timeoutMs = 6000 }: { timeoutMs?: number } = {}
): () => void {
  const id = hash.slice(1)
  let cancelled = false
  let raf = 0
  const deadline = performance.now() + timeoutMs

  const attempt = () => {
    if (cancelled) return
    const el = document.getElementById(id)
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
