import type { Metadata } from 'next'
import { CareersPage } from '@/app/(frontend)/zostan-lama/careers-page'
import * as en from '@/lib/content/zostan-lama.en'
import { pairMetadata } from '@/lib/utils/metadata'

/*
 * English careers page — the Polish composition fed English content. The form
 * posts with locale="en", so the server action returns English validation
 * messages, toasts and lead-email labels.
 */

/* Same og fix as the Polish hub — see the note there. */
export const metadata: Metadata = pairMetadata({
  title: en.careersMeta.title,
  description: en.careersMeta.description,
  path: '/en/become-a-lama',
  card: 'careers',
})

export default function EnJoinPage() {
  return <CareersPage content={en} locale="en" />
}
