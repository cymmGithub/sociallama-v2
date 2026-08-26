import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { ServicePoster } from '@/components/sections/service-posters'
import { isPosterId } from '@/components/sections/service-posters/ids'
import { chrome, USLUGI_PAGES } from '@/lib/content/uslugi'
import { pairMetadata } from '@/lib/utils/metadata'

const PL_PATH = '/uslugi'

export const metadata: Metadata = pairMetadata({
  title: 'Usługi',
  description:
    'Od strategii po sprzedaż — pełne spektrum działań w social mediach. Strategia, content, sprzedaż, kreacje i wideo, audyt i influencer marketing.',
  path: PL_PATH,
})

/* Poster cards, not summaries: each card shows the line-art artwork that opens
   its service page, and `usluga-<id>` pairs the two so the clicked poster
   morphs into the hero. Ids are locale-neutral, so the EN twin builds the
   identical pairs.

   Built from USLUGI_PAGES, not the roster: this hub is one of the three
   surfaces that deliberately list the SEO landings (the mega-menu, the homepage
   services section and the hero rotator must not).

   Two feature cards, opening and closing the grid as 1 + 3 + 3 + 1. Strategia
   leads because its own copy calls it the starting point of every engagement;
   the landing closes because it is the broad "all of it" page rather than one
   more discipline — and because a ninth tile would otherwise orphan a
   third-width card in a fourth row. */
const cards = USLUGI_PAGES.map((service) => {
  if (!isPosterId(service.id)) {
    // A page added without an authored poster keeps the text card rather than
    // blanking a tile. Nothing takes this branch today.
    return {
      slug: service.slug,
      label: service.label,
      summary: service.summary,
    }
  }

  const feature =
    service.id === 'strategia' || service.id === 'prowadzenie-social-media'

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
