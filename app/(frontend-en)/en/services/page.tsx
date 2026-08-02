import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { OG_BASE } from '@/lib/content/site.en'
import { chrome, SERVICES } from '@/lib/content/uslugi.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'

const EN_PATH = '/en/services'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'From strategy to sales — the full spectrum of social media work. Strategy, content, sales, creative & video, audit, and influencer marketing.',
  alternates: alternatesForPath(EN_PATH),
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Services',
    url: EN_PATH,
  },
}

const cards = SERVICES.map((service) => ({
  slug: service.slug,
  label: service.label,
  summary: service.summary,
}))

export default function EnServicesIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={EN_PATH} />
    </Wrapper>
  )
}
