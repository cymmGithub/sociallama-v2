import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { chrome, INDUSTRIES } from '@/lib/content/branze.en'
import { OG_BASE } from '@/lib/content/site.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'

const EN_PATH = '/en/industries'

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Automotive, beauty, health, finance, pet care and more — social media run by people who know how each industry actually works. Pick yours.',
  alternates: alternatesForPath(EN_PATH),
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Industries',
    url: EN_PATH,
  },
}

const cards = INDUSTRIES.map((industry) => ({
  slug: industry.slug,
  label: industry.label,
  image: `/branze/${industry.id}/hero.jpg`,
}))

export default function EnIndustriesIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={EN_PATH} />
    </Wrapper>
  )
}
