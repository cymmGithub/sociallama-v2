import { Analytics } from '@vercel/analytics/next'
import { TransformProvider } from 'hamo'
import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { type PropsWithChildren, Suspense } from 'react'
import { ReactTempus } from 'tempus/react'
import { Link } from '@/components/ui/link'
import { RealViewport } from '@/components/ui/real-viewport'
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

export default async function Layout({ children }: PropsWithChildren) {
  const { isEnabled: isDraftMode } = await draftMode()

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
      <body>
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
            {children}
          </TransformProvider>
        </RealViewport>
        {/* Optional features - conditionally loaded based on configuration */}
        <OptionalFeatures />

        {/* RAF management - lightweight, but don't patch in draft mode to avoid conflicts */}
        <ReactTempus patch={!isDraftMode} />
        <Analytics />
      </body>
    </html>
  )
}
