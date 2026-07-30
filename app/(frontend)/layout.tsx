import { Analytics } from '@vercel/analytics/next'
import { TransformProvider } from 'hamo'
import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { type PropsWithChildren, Suspense } from 'react'
import { ReactTempus } from 'tempus/react'
import { Consent } from '@/components/consent'
import { ChromeProvider } from '@/components/layout/chrome-provider'
import { OrganizationJsonLd } from '@/components/seo/structured-data'
import { Link } from '@/components/ui/link'
import { RealViewport } from '@/components/ui/real-viewport'
import { ConsentInit } from '@/lib/consent/consent-init'
import { GoogleAnalytics } from '@/lib/consent/google-analytics'
import {
  consentBanner,
  consentCategories,
  consentSettings,
} from '@/lib/content/consent'
import { footer, menu, nav } from '@/lib/content/home'
import {
  APP_DEFAULT_TITLE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE_TEMPLATE,
  OG_BASE,
} from '@/lib/content/site'
import { APP_BASE_URL, env } from '@/lib/env'
import { OptionalFeatures } from '@/lib/features'
import { themes } from '@/lib/styles/colors'
import { fontsVariable } from '@/lib/styles/fonts'
import '@/lib/styles/css/index.css'

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: APP_BASE_URL,
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: APP_DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  ...(env.NEXT_PUBLIC_FACEBOOK_APP_ID
    ? { other: { 'fb:app_id': env.NEXT_PUBLIC_FACEBOOK_APP_ID } }
    : {}),
}

export const viewport: Viewport = {
  themeColor: themes.plum.primary,
  colorScheme: 'normal',
}

/**
 * The layout's ONLY request-bound read, quarantined behind its own Suspense:
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

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html
      lang="pl"
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
          queues its `config`. Do not reorder these two, and do not move them
          into <body>. */}
      <head>
        <ConsentInit />
        <GoogleAnalytics />
      </head>
      <body>
        <OrganizationJsonLd description={APP_DESCRIPTION} />
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
            <ChromeProvider locale="pl" chrome={{ nav, menu, footer }}>
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
        <Consent
          copy={{
            banner: consentBanner,
            settings: consentSettings,
            categories: consentCategories,
          }}
        />
      </body>
    </html>
  )
}
