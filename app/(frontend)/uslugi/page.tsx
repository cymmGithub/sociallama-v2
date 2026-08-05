import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { ServicePoster } from '@/components/sections/service-posters'
import { isPosterId } from '@/components/sections/service-posters/ids'
import { OG_BASE } from '@/lib/content/site'
import { chrome, SERVICES } from '@/lib/content/uslugi'
import { alternatesForPath } from '@/lib/i18n/slug-map'

const PL_PATH = '/uslugi'

export const metadata: Metadata = {
  title: 'Usługi',
  description:
    'Od strategii po sprzedaż — pełne spektrum działań w social mediach. Strategia, content, sprzedaż, kreacje i wideo, audyt i influencer marketing.',
  alternates: alternatesForPath(PL_PATH),
  openGraph: {
    type: 'website',
    ...OG_BASE,
    title: 'Usługi',
    url: PL_PATH,
  },
}

/* Poster cards, not summaries: each card shows the line-art artwork that opens
   its service page, and `usluga-<id>` pairs the two so the clicked poster
   morphs into the hero. Strategia leads as the feature card — its own copy
   calls it the starting point of every engagement — which also closes the
   seven-item grid as 1 + 3 + 3. Ids are locale-neutral, so the EN twin builds
   the identical pairs. */
const cards = SERVICES.map((service) => {
  if (!isPosterId(service.id)) {
    // A service added without an authored poster keeps the text card rather
    // than blanking a tile.
    return {
      slug: service.slug,
      label: service.label,
      summary: service.summary,
    }
  }

  const feature = service.id === 'strategia'

  return {
    slug: service.slug,
    label: service.label,
    feature,
    morphName: `usluga-${service.id}`,
    // The feature card is wider than 3:2, so it shows the hero composition —
    // which is also what it morphs into.
    artwork: (
      <ServicePoster id={service.id} variant={feature ? 'hero' : 'card'} />
    ),
  }
})

export default function UslugiIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={PL_PATH} />
    </Wrapper>
  )
}
