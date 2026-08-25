import { Analytics } from '@vercel/analytics/next'
import { TransformProvider } from 'hamo'
import { draftMode } from 'next/headers'
import { type ReactNode, Suspense } from 'react'
import { ReactTempus } from 'tempus/react'
import { Consent, type ConsentCopy } from '@/components/consent'
import { ChromeProvider } from '@/components/layout/chrome-provider'
import { OrganizationJsonLd } from '@/components/seo/structured-data'
import { Link } from '@/components/ui/link'
import { RealViewport } from '@/components/ui/real-viewport'
import { ConsentInit } from '@/lib/consent/consent-init'
import { GoogleAnalytics } from '@/lib/consent/google-analytics'
import { GoogleTagManager } from '@/lib/consent/google-tag-manager'
import type { ChromeContent } from '@/lib/content/home'
import { OptionalFeatures } from '@/lib/features'
import type { Locale } from '@/lib/i18n/slug-map'
import { fontsVariable } from '@/lib/styles/fonts'

/**
 * The whole `<html>` document, shared by both root layouts (design D1).
 *
 * Polish `(frontend)` and English `(frontend-en)` are sibling roots — separate
 * documents so the `/en` tree is additive and Polish URLs never move. Multiple
 * root layouts is a documented App Router pattern; crossing locales is a full
 * document load. Everything below the locale bindings is identical between
 * them, so it lives here once and each layout is a thin binding.
 */

/**
 * The document's ONLY request-bound read, quarantined behind its own Suspense:
 * awaiting draftMode() in the layout body suspended the ENTIRE page tree, so
 * every route streamed as one hidden late segment (`<div hidden id="S:1">`)
 * that could not paint until its last byte arrived — the top mobile-LCP
 * offender in the 2026-07-29 audit. Isolated here, only this leaf suspends
 * and the pages stream in order, visible as they arrive.
 */
async function TempusPatch() {
  // RAF management - lightweight, but don't patch in draft mode to avoid conflicts
  const { isEnabled: isDraftMode } = await draftMode()
  return <ReactTempus patch={!isDraftMode} />
}

interface RootDocumentProps {
  /** Drives both `<html lang>` and the chrome context. */
  locale: Locale
  /** The locale's site description, for the Organization entity. */
  description: string
  chrome: ChromeContent
  consent: ConsentCopy
  children: ReactNode
}

export function RootDocument({
  locale,
  description,
  chrome,
  consent,
  children,
}: RootDocumentProps) {
  return (
    <html
      lang={locale}
      dir="ltr"
      className={fontsVariable}
      // Default theme rendered server-side for no-flash initial paint; the
      // client <Theme> updates data-theme per route via effect.
      data-theme="plum"
      // NOTE: data-theme is updated client-side per route, which would
      // otherwise trip a hydration warning.
      suppressHydrationWarning
    >
      {/* Order in <head> is the entire point (design.md Decision 3): the denied
          Consent Mode defaults — and a returning visitor's synchronous upgrade
          from the cookie — must be queued into dataLayer before the Google tag
          queues its `config` and before the GTM container fires its first
          event. ConsentInit stays first; do not reorder, and do not move any
          of these into <body>. */}
      {/* biome-ignore lint/style/noHeadElement: this IS the App Router root
          document — `next/head` is a Pages Router API. The rule only skips the
          check for files under app/, and the document lives here now. */}
      <head>
        <ConsentInit />
        <GoogleTagManager />
        <GoogleAnalytics />
      </head>
      <body>
        <OrganizationJsonLd description={description} />
        {/* Skip link for keyboard navigation accessibility */}
        <Suspense fallback={null}>
          <Link
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            Skip to main content
          </Link>
        </Suspense>
        {/* Critical: CSS custom properties needed for layout */}
        <RealViewport>
          <TransformProvider>
            {/*
              DO NOT add Header or Footer here.
              They are included in the <Wrapper> component used by each page.
              See: components/layout/wrapper/index.tsx
            */}
            <ChromeProvider locale={locale} chrome={chrome}>
              {children}
            </ChromeProvider>
          </TransformProvider>
        </RealViewport>
        {/* Optional features - conditionally loaded based on configuration */}
        <OptionalFeatures />

        <Suspense fallback={null}>
          <TempusPatch />
        </Suspense>
        {/* Unconditional by design: Vercel Analytics touches no device storage,
            so the ePrivacy consent obligation never fires for it (design.md
            Decision 1). Do not move it behind the consent gate. */}
        <Analytics />
        <Consent copy={consent} />
      </body>
    </html>
  )
}
