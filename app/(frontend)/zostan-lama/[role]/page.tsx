import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as pl from '@/lib/content/zostan-lama'
import { pairMetadata } from '@/lib/utils/metadata'
import {
  CAREERS_BASE_PATH,
  CareersPage,
  findCareersRole,
} from '../careers-page'

/*
 * A single open position, at its own URL — `/zostan-lama/{id}`, where `{id}` is
 * the role id from the careers content (add-careers-role-urls, design D1/D4).
 *
 * The page is the careers page: same composition, this position's tab already
 * selected. What the URL buys is the part client-side tabs cannot give — a
 * crawlable address with the job's own title and description, so a link a
 * recruiter shares unfurls as that job rather than as the careers page.
 *
 * Statically generated from the same array the tabs render, so a closed
 * position takes its URL down with it (`notFound()`), and a new one needs no
 * change here.
 */

interface RouteParams {
  params: Promise<{ role: string }>
}

export function generateStaticParams(): { role: string }[] {
  return pl.careersRoles.map((role) => ({ role: role.id }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { role: id } = await params
  const role = findCareersRole(pl, id)
  if (!role) return {}

  return pairMetadata({
    title: role.seo.title,
    description: role.seo.description,
    path: `${CAREERS_BASE_PATH.pl}/${role.id}`,
    card: 'careers',
  })
}

export default async function JoinRolePage({ params }: RouteParams) {
  const { role: id } = await params
  if (!findCareersRole(pl, id)) notFound()

  return <CareersPage content={pl} locale="pl" initialRoleId={id} />
}
