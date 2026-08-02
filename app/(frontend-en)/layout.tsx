import type { Viewport } from 'next'
import type { PropsWithChildren } from 'react'
import { RootDocument } from '@/components/layout/root-document'
import {
  consentBanner,
  consentCategories,
  consentSettings,
} from '@/lib/content/consent.en'
import { footer, menu, nav } from '@/lib/content/home.en'
import { APP_DESCRIPTION } from '@/lib/content/site.en'
import { themes } from '@/lib/styles/colors'
import { rootMetadata } from '@/lib/utils/metadata'
import '@/lib/styles/css/index.css'

export const metadata = rootMetadata('en')

export const viewport: Viewport = {
  themeColor: themes.plum.primary,
  colorScheme: 'normal',
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <RootDocument
      locale="en"
      description={APP_DESCRIPTION}
      chrome={{ nav, menu, footer }}
      consent={{
        banner: consentBanner,
        settings: consentSettings,
        categories: consentCategories,
      }}
    >
      {children}
    </RootDocument>
  )
}
