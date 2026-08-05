import styles from './route-loading.module.css'

/**
 * Branded route-transition loader, shared by the per-subtree `loading.tsx`
 * boundaries. Deliberately NOT a group-level loading.tsx anymore: with
 * cacheComponents, a route-level loading boundary makes the ENTIRE page body
 * stream as one hidden late segment that cannot paint until its last byte
 * arrives — the top mobile-LCP offender in the 2026-07-29 audit. Only the
 * param-driven CMS routes (blog posts, case studies, categories) mount this
 * now; static marketing pages stream in-order instead, visible as bytes
 * arrive.
 *
 * The industry and service detail routes dropped it for a second reason: the
 * shell commits before the page body, so React never sees the poster pair in
 * a single transition-marked commit and the card→hero morph silently never
 * starts (measured 0 `startViewTransition` calls with the shell, 1 without).
 * Those destinations are prerendered, so the hub simply holds until the
 * payload commits — no blank state.
 */
export function RouteLoading({ label = 'Ładowanie…' }: { label?: string }) {
  return (
    <div className={styles.root} role="status">
      <p className={styles.word} aria-hidden="true">
        sociallama
      </p>
      <span className={styles.bar} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
