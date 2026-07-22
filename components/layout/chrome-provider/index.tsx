'use client'

import { createContext, type ReactNode, useContext, useMemo } from 'react'
import type { ChromeContent } from '@/lib/content/home'
import type { Locale } from '@/lib/i18n/slug-map'

/**
 * Carries the active locale and its chrome copy (menu / nav / footer) to the
 * shared <Header> and <Footer>, which render below every page's <Wrapper>.
 *
 * Set once per root layout — `(frontend)` provides the Polish chrome,
 * `(frontend-en)` the English chrome — so the whole tree gets the right chrome
 * with no per-page prop and no chance of a locale leaking onto the wrong page.
 */
interface ChromeValue {
  locale: Locale
  chrome: ChromeContent
}

const ChromeContext = createContext<ChromeValue | null>(null)

export function ChromeProvider({
  locale,
  chrome,
  children,
}: ChromeValue & { children: ReactNode }) {
  const value = useMemo(() => ({ locale, chrome }), [locale, chrome])
  return (
    <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
  )
}

export function useChrome(): ChromeValue {
  const ctx = useContext(ChromeContext)
  if (!ctx) {
    throw new Error('useChrome must be used within a ChromeProvider')
  }
  return ctx
}
