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
  /**
   * The other-locale URL for THIS page, when only the page can know it.
   *
   * Blog posts and categories carry a different slug per locale, held in the
   * database, so `slug-map.ts` cannot resolve them — and must not, since it
   * ships to the browser and would have to carry every slug pair to try
   * (design D11). The route already loaded the document, so it already knows
   * both slugs; it supplies the answer here instead.
   *
   * Absent means "no counterpart", and the toggle falls back to the other
   * locale's home — which is the correct answer for an untranslated post.
   */
  counterpart?: string | undefined
}

const ChromeContext = createContext<ChromeValue | null>(null)

export function ChromeProvider({
  locale,
  chrome,
  counterpart,
  children,
}: ChromeValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ locale, chrome, counterpart }),
    [locale, chrome, counterpart]
  )
  return (
    <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
  )
}

/**
 * Page-level counterpart override.
 *
 * Re-provides the chrome inherited from the root layout with this page's
 * counterpart attached. It works because `<Wrapper>` — not the layout —
 * renders `<Header>` and `<Footer>`, so a page wrapping its own content is
 * still an ancestor of the toggle.
 */
export function LocaleCounterpart({
  path,
  children,
}: {
  path: string | undefined
  children: ReactNode
}) {
  const { locale, chrome } = useChrome()
  return (
    <ChromeProvider locale={locale} chrome={chrome} counterpart={path}>
      {children}
    </ChromeProvider>
  )
}

export function useChrome(): ChromeValue {
  const ctx = useContext(ChromeContext)
  if (!ctx) {
    throw new Error('useChrome must be used within a ChromeProvider')
  }
  return ctx
}
