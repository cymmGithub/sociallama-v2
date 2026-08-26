import type { Metadata } from 'next'
import * as pl from '@/lib/content/zostan-lama'
import { pairMetadata } from '@/lib/utils/metadata'
import { CareersPage } from './careers-page'

/*
 * Careers page (redesign-careers-page, direction C). Dark conversion layout
 * served at /zostan-lama — the legacy WP /zostan-lama/ URL redirects here.
 *
 * The page itself is <CareersPage/>; this route only names it and its metadata.
 * The position URLs underneath (`[role]/page.tsx`) render the same composition
 * with one tab preselected.
 */

/*
 * Through `pairMetadata` for the openGraph block, not just the alternates:
 * page-level `openGraph` is not deep-merged, it REPLACES the layout's object —
 * and a page that omits it inherits the layout's whole object rather than
 * having og:title/og:url derived from its own. This page was therefore
 * unfurling as the HOMEPAGE: og:title "Social Lama", og:url the site root.
 * The position pages underneath were always correct; only the hub was not.
 */
export const metadata: Metadata = pairMetadata({
  title: pl.careersMeta.title,
  description: pl.careersMeta.description,
  path: '/zostan-lama',
  card: 'careers',
})

export default function JoinPage() {
  return <CareersPage content={pl} locale="pl" />
}
