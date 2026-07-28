import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { OG_BASE } from '@/lib/content/site'
import { chrome, SERVICES } from '@/lib/content/uslugi'

const PL_PATH = '/uslugi'
const EN_PATH = '/en/services'

export const metadata: Metadata = {
  title: 'Usługi | Social Lama',
  description:
    'Od strategii po sprzedaż — pełne spektrum działań w social mediach. Strategia, content, sprzedaż, kreacje i wideo, audyt i influencer marketing.',
  alternates: {
    canonical: PL_PATH,
    languages: { pl: PL_PATH, en: EN_PATH, 'x-default': PL_PATH },
  },
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Usługi | Social Lama',
    url: PL_PATH,
  },
}

const cards = SERVICES.map((service) => ({
  slug: service.slug,
  label: service.label,
  summary: service.summary,
}))

export default function UslugiIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={PL_PATH} />
    </Wrapper>
  )
}
