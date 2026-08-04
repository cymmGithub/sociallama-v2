import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { chrome, INDUSTRIES } from '@/lib/content/branze'
import { OG_BASE } from '@/lib/content/site'
import { alternatesForPath } from '@/lib/i18n/slug-map'

const PL_PATH = '/branze'

export const metadata: Metadata = {
  title: 'Branże',
  description:
    'Automotive, beauty, health, finanse, petcare i więcej — social media prowadzone ze znajomością realiów każdej branży. Wybierz swoją.',
  alternates: alternatesForPath(PL_PATH),
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Branże',
    url: PL_PATH,
  },
}

// Poster cards (Variant A, 2026-08-04): each card carries its destination's
// own hero poster — no new per-industry copy or artwork is authored for the
// index. The tagline stays on the industry page.
const cards = INDUSTRIES.map((industry) => ({
  slug: industry.slug,
  label: industry.label,
  image: `/branze/${industry.id}/hero.jpg`,
  morphName: `branza-${industry.id}`,
}))

export default function BranzeIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={PL_PATH} />
    </Wrapper>
  )
}
