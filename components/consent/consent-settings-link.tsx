'use client'

import { useChrome } from '@/components/layout/chrome-provider'
import { useConsentStore } from '@/lib/consent/store'
import { consentTrigger as pl } from '@/lib/content/consent'
import { consentTrigger as en } from '@/lib/content/consent.en'
import type { Locale } from '@/lib/i18n/slug-map'

/**
 * The persistent withdrawal control, rendered in the footer's legal row.
 *
 * A `<button>`, not a link: it opens a panel and does not navigate, so
 * announcing it as a link would misdescribe it to assistive technology. It
 * takes the surrounding row's class so it inherits the legal links' colour and
 * size — `all: unset` in the reset means a button with that class is visually
 * identical to its neighbours.
 *
 * The label is picked from both content modules by locale rather than threaded
 * through `ChromeProvider`. The footer's copy comes from `home.ts`, and putting
 * one consent string there would split consent copy across two modules for the
 * sake of avoiding two short imports. `LocaleToggle` sets the precedent for a
 * `Record<Locale, string>` in a component that spans locales.
 */
const LABEL: Record<Locale, string> = { pl, en }

export function ConsentSettingsLink({
  className,
}: {
  className?: string | undefined
}) {
  const { locale } = useChrome()
  const openSettings = useConsentStore((state) => state.openSettings)

  return (
    <button type="button" className={className} onClick={openSettings}>
      {LABEL[locale]}
    </button>
  )
}
