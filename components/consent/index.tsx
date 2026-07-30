'use client'

import { useEffect } from 'react'
import { useConsentStore } from '@/lib/consent/store'
import type { LocalizedConsent } from '@/lib/content/consent'
import { ConsentBanner } from './consent-banner'
import { ConsentSettings } from './consent-settings'

export interface ConsentCopy {
  banner: LocalizedConsent['consentBanner']
  settings: LocalizedConsent['consentSettings']
  categories: LocalizedConsent['consentCategories']
}

/**
 * Consent root. Mounted once per root layout, in `<body>`, with that layout's
 * locale copy passed down as a plain serializable prop — which is why the
 * Polish and English content modules never both reach the client.
 *
 * Two things mount here, and the distinction matters:
 *
 *  • the banner, only while no decision is stored;
 *  • the settings panel, ALWAYS, because the footer trigger has to be able to
 *    open it long after a decision was made. That is the withdrawal mechanism.
 *
 * Nothing renders while `status` is `unknown`. Rendering the banner before the
 * cookie has been read would flash it at every returning visitor who already
 * chose — the exact thing they asked not to be bothered by again.
 */
export function Consent({ copy }: { copy: ConsentCopy }) {
  const status = useConsentStore((state) => state.status)
  const decided = useConsentStore((state) => state.decided)
  const hydrate = useConsentStore((state) => state.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (status === 'unknown') return null

  return (
    <>
      {!decided && <ConsentBanner copy={copy.banner} />}
      <ConsentSettings
        copy={{ settings: copy.settings, categories: copy.categories }}
      />
    </>
  )
}
