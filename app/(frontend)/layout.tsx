import type { Viewport } from 'next'
import type { PropsWithChildren } from 'react'
import { RootDocument } from '@/components/layout/root-document'
import {
  consentBanner,
  consentCategories,
  consentSettings,
} from '@/lib/content/consent'
import { footer, menu, nav } from '@/lib/content/home'
import { APP_DESCRIPTION } from '@/lib/content/site'
import { themes } from '@/lib/styles/colors'
import { rootMetadata } from '@/lib/utils/metadata'
import '@/lib/styles/css/index.css'

export const metadata = rootMetadata('pl')

export const viewport: Viewport = {
  themeColor: themes.plum.primary,
  colorScheme: 'normal',
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <RootDocument
      locale="pl"
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
