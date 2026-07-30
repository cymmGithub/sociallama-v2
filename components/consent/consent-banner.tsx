'use client'

import cn from 'clsx'
import { Cookie, Heart } from 'lucide-react'
import { useConsentStore } from '@/lib/consent/store'
import type { LocalizedConsent } from '@/lib/content/consent'
import s from './consent.module.css'

/**
 * The consent card (design.md Decision 13, restyled after mock review
 * 2026-07-30 — user picked variant A, "Karteczka").
 *
 * A cream note pinned to the BOTTOM-LEFT corner rather than a full-width bar.
 * It reads as something placed on the page instead of a strip of chrome, and
 * the corner keeps the whole bottom edge of the viewport free.
 *
 * It is deliberately not a modal: `role="region"` with an accessible name, no
 * focus trap, no scroll lock. The page stays usable while it is shown, which is
 * what makes leaving it up until a choice is made a fair thing to do.
 *
 * There is no close/X control and one must not be added back for polish.
 * Dismissal without a choice is neither consent nor refusal, and treating it as
 * either is indefensible.
 *
 * Mounted only when a decision is genuinely absent — see `index.tsx`.
 */
export function ConsentBanner({
  copy,
}: {
  copy: LocalizedConsent['consentBanner']
}) {
  const acceptAll = useConsentStore((state) => state.acceptAll)
  const rejectAll = useConsentStore((state) => state.rejectAll)
  const openSettings = useConsentStore((state) => state.openSettings)

  return (
    <section className={s.banner} aria-label={copy.regionLabel}>
      <p className={s.heading}>
        {copy.headingBefore}{' '}
        {/* The icon stands in for the noun. It is hidden from assistive tech
            and the word is supplied beside it, so the heading is complete when
            read aloud but the icon does the work on screen. */}
        <Cookie className={s.headingIcon} aria-hidden="true" />
        <span className="sr-only">{copy.headingIcon}</span>
        {copy.headingAfter}
      </p>

      <p className={s.body}>
        {copy.body} <Heart className={s.heart} aria-hidden="true" />
      </p>

      <div className={s.actions}>
        <button type="button" className={s.settings} onClick={openSettings}>
          {copy.settings}
        </button>
        {/* Accept and refuse sit in one equal-track grid, side by side at the
            same level. Refusal behind the settings panel — or one pixel
            narrower than acceptance — is the dark pattern this prevents. */}
        <div className={s.choices}>
          <button
            type="button"
            className={cn(s.choice, s.reject)}
            onClick={rejectAll}
          >
            {copy.rejectAll}
          </button>
          <button
            type="button"
            className={cn(s.choice, s.accept)}
            onClick={acceptAll}
          >
            {copy.acceptAll}
          </button>
        </div>
      </div>
    </section>
  )
}
