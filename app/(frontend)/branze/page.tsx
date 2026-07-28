import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { chrome, INDUSTRIES } from '@/lib/content/branze'
import { OG_BASE } from '@/lib/content/site'

const PL_PATH = '/branze'
const EN_PATH = '/en/industries'

export const metadata: Metadata = {
  title: 'Branże | Social Lama',
  description:
    'Automotive, beauty, health, finanse, petcare i więcej — social media prowadzone ze znajomością realiów każdej branży. Wybierz swoją.',
  alternates: {
    canonical: PL_PATH,
    languages: { pl: PL_PATH, en: EN_PATH, 'x-default': PL_PATH },
  },
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Branże | Social Lama',
    url: PL_PATH,
  },
}

// Card body reuses each industry's existing hero lead (design D2) — no new
// per-industry copy is authored for the index.
const cards = INDUSTRIES.map((industry) => ({
  slug: industry.slug,
  label: industry.label,
  summary: industry.tagline,
}))

export default function BranzeIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={PL_PATH} />
    </Wrapper>
  )
}
