import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  CAREERS_BASE_PATH,
  CareersPage,
  findCareersRole,
} from '@/app/(frontend)/zostan-lama/careers-page'
import * as en from '@/lib/content/zostan-lama.en'
import { pairMetadata } from '@/lib/utils/metadata'

/*
 * English twin of `/zostan-lama/[role]`. The position ids are locale-
 * independent (they are the values the application form submits), so the two
 * locales' URLs differ only in their base path — which is what makes the pair
 * resolvable from the static slug map, and the locale toggle land on the same
 * job rather than the English home.
 */

interface RouteParams {
  params: Promise<{ role: string }>
}

export function generateStaticParams(): { role: string }[] {
  return en.careersRoles.map((role) => ({ role: role.id }))
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { role: id } = await params
  const role = findCareersRole(en, id)
  if (!role) return {}

  return pairMetadata({
    title: role.seo.title,
    description: role.seo.description,
    path: `${CAREERS_BASE_PATH.en}/${role.id}`,
    card: 'careers',
  })
}

export default async function EnJoinRolePage({ params }: RouteParams) {
  const { role: id } = await params
  if (!findCareersRole(en, id)) notFound()

  return <CareersPage content={en} locale="en" initialRoleId={id} />
}
