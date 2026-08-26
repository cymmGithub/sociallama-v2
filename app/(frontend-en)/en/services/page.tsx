import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { SectionIndex } from '@/components/sections/section-index'
import { ServicePoster } from '@/components/sections/service-posters'
import { isPosterId } from '@/components/sections/service-posters/ids'
import { chrome, USLUGI_PAGES } from '@/lib/content/uslugi.en'
import { pairMetadata } from '@/lib/utils/metadata'

const EN_PATH = '/en/services'

export const metadata: Metadata = pairMetadata({
  title: 'Services',
  description:
    'From strategy to sales — the full spectrum of social media work. Strategy, content, sales, creative & video, audit, and influencer marketing.',
  path: EN_PATH,
})

/* Mirrors `/uslugi` — see the note there. Service ids are locale-neutral, so
   both hubs build `usluga-<id>` pairs against their own locale's pages and the
   morphs can never cross wires. */
const cards = USLUGI_PAGES.map((service) => {
  if (!isPosterId(service.id)) {
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
    artwork: (
      <ServicePoster id={service.id} variant={feature ? 'hero' : 'card'} />
    ),
  }
})

export default function EnServicesIndexPage() {
  return (
    <Wrapper theme="plum">
      <SectionIndex chrome={chrome} items={cards} base={EN_PATH} />
    </Wrapper>
  )
}
