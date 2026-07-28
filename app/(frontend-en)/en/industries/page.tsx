import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { chrome, INDUSTRIES } from '@/lib/content/branze.en'
import { OG_BASE } from '@/lib/content/site.en'

const EN_PATH = '/en/industries'
const PL_PATH = '/branze'

export const metadata: Metadata = {
  title: 'Industries | Social Lama',
  description:
    'Automotive, beauty, health, finance, pet care and more — social media run by people who know how each industry actually works. Pick yours.',
  alternates: {
    canonical: EN_PATH,
    languages: { pl: PL_PATH, en: EN_PATH, 'x-default': PL_PATH },
  },
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Industries | Social Lama',
    url: EN_PATH,
  },
}

const cards = INDUSTRIES.map((industry) => ({
  slug: industry.slug,
  label: industry.label,
  summary: industry.tagline,
}))

export default function EnIndustriesIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={EN_PATH} />
    </Wrapper>
  )
}
