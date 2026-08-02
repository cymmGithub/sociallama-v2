import config from '@payload-config'
import type { Route } from 'next'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

/**
 * Draft preview entry, opened by the admin panel's preview button
 * (posts collection `admin.preview`). Requires a logged-in Payload user —
 * the admin session cookie authenticates this request — so visitors can
 * never enable draft mode themselves.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  // `path` lands verbatim in the `Location` header, so a bare `startsWith('/')`
  // would admit `//evil.com` and `/\evil.com` — both scheme-relative, both
  // sending the browser to another origin.
  if (!(path && /^\/(?![/\\])/.test(path))) {
    return new Response('Missing or invalid ?path', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return new Response('Unauthorized', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path as Route)
}
