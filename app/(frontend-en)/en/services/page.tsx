import type { Metadata } from 'next'
import { ServicesIndex } from '@/app/(frontend)/uslugi/services-index'
import { Wrapper } from '@/components/layout/wrapper'
import { OG_BASE } from '@/lib/content/site.en'
import { chrome, SERVICES } from '@/lib/content/uslugi.en'

const EN_PATH = '/en/services'
const PL_PATH = '/uslugi'

export const metadata: Metadata = {
  title: 'Services | Social Lama',
  description:
    'From strategy to sales — the full spectrum of social media work. Strategy, content, sales, creative & video, audit, and influencer marketing.',
  alternates: {
    canonical: EN_PATH,
    languages: { pl: PL_PATH, en: EN_PATH, 'x-default': PL_PATH },
  },
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Services | Social Lama',
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
      <ServicesIndex chrome={chrome} services={cards} base={EN_PATH} />
    </Wrapper>
  )
}
