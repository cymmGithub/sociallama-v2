import { create } from 'zustand'
import { readConsent, writeConsent } from '@/lib/consent/cookie'
import { updateConsent } from '@/lib/consent/gtag'

/**
 * Consent state (design.md Decision 6 — zustand, not context).
 *
 * Read from three places that share no ancestor: the banner, the settings
 * panel, and the footer trigger — across TWO root layouts, `(frontend)` and
 * `(frontend-en)`. A provider would have to be mounted and kept in sync in both
 * trees; a module singleton is imported by both and is simply the same store.
 *
 * Nothing here runs on the server. The cookie is read on the client only, so
 * no route is pushed out of static rendering (design.md Decision 4).
 */

/**
 * `unknown` until the cookie has been read after hydration.
 *
 * The distinction is not cosmetic: rendering the banner while state is
 * `unknown` would flash it at every returning visitor who already decided.
 */
type ConsentStatus = 'unknown' | 'resolved'

interface ConsentState {
  status: ConsentStatus
  /** Whether a valid, current-version decision is stored. */
  decided: boolean
  /** The analytics category's current value. `false` until accepted. */
  analytics: boolean
  settingsOpen: boolean
  /** Read the cookie once, after mount. Idempotent. */
  hydrate: () => void
  acceptAll: () => void
  rejectAll: () => void
  save: (prefs: { analytics: boolean }) => void
  openSettings: () => void
  closeSettings: () => void
}

export const useConsentStore = create<ConsentState>()((set, get) => {
  /**
   * The single write path.
   *
   * Persisting and signalling Google are deliberately fused here so no call
   * site can do one without the other — a cookie written without the Consent
   * Mode update leaves acceptance invisible until the next page load, and an
   * update without the cookie forgets it entirely.
   */
  const commit = (analytics: boolean) => {
    writeConsent(analytics)
    updateConsent(analytics)
    set({ status: 'resolved', decided: true, analytics, settingsOpen: false })
  }

  return {
    status: 'unknown',
    decided: false,
    analytics: false,
    settingsOpen: false,

    hydrate: () => {
      // Two components call this on mount; the second is a no-op rather than a
      // second cookie read that could clobber a decision made in between.
      if (get().status === 'resolved') return
      const decision = readConsent()
      set({
        status: 'resolved',
        decided: decision !== null,
        analytics: decision?.analytics ?? false,
      })
    },

    acceptAll: () => commit(true),
    rejectAll: () => commit(false),
    save: ({ analytics }) => commit(analytics),

    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),
  }
})
