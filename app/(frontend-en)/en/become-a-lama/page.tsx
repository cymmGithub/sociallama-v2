import type { Metadata } from 'next'
import { CareersPage } from '@/app/(frontend)/zostan-lama/careers-page'
import * as en from '@/lib/content/zostan-lama.en'
import { alternatesForPath } from '@/lib/i18n/slug-map'

/*
 * English careers page — the Polish composition fed English content. The form
 * posts with locale="en", so the server action returns English validation
 * messages, toasts and lead-email labels.
 */

export const metadata: Metadata = {
  title: en.careersMeta.title,
  description: en.careersMeta.description,
  alternates: alternatesForPath('/en/become-a-lama'),
}

export default function EnJoinPage() {
  return <CareersPage content={en} locale="en" />
}
