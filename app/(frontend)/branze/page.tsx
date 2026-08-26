import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { chrome, INDUSTRIES } from '@/lib/content/branze'
import { pairMetadata } from '@/lib/utils/metadata'

const PL_PATH = '/branze'

export const metadata: Metadata = pairMetadata({
  title: 'Branże',
  description:
    'Motoryzacja, beauty, zdrowie, finanse, zoologia i więcej — social media prowadzone ze znajomością realiów każdej branży. Wybierz swoją.',
  path: PL_PATH,
})

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
