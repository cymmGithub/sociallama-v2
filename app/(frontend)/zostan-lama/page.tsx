import type { Metadata } from 'next'
import * as pl from '@/lib/content/zostan-lama'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import { CareersPage } from './careers-page'

/*
 * Careers page (redesign-careers-page, direction C). Dark conversion layout
 * served at /zostan-lama — the legacy WP /zostan-lama/ URL redirects here.
 *
 * The page itself is <CareersPage/>; this route only names it and its metadata.
 * The position URLs underneath (`[role]/page.tsx`) render the same composition
 * with one tab preselected.
 */

export const metadata: Metadata = {
  title: pl.careersMeta.title,
  description: pl.careersMeta.description,
  alternates: alternatesForPath('/zostan-lama'),
}

export default function JoinPage() {
  return <CareersPage content={pl} locale="pl" />
}
