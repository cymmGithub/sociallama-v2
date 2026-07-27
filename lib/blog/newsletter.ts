import { postNewsletter } from '@/lib/content/blog'
import type { FormState } from '@/lib/types/form'

/**
 * Map `mailchimpSubscriptionAction`'s result to reader-facing Polish.
 *
 * Shared by the post page's newsletter and the hub's: the action returns
 * untranslated placeholder keys (the satus `foo_` convention), and the two
 * slabs must never disagree about what a given failure means. Returns null
 * before the form has been submitted.
 */
export function newsletterResult(
  state: FormState
): { text: string; ok: boolean } | null {
  if (state.status === 0) {
    return null
  }
  if (state.status === 200) {
    return { text: postNewsletter.messages.success, ok: true }
  }
  const text =
    state.message === 'invalid_email_'
      ? postNewsletter.messages.invalidEmail
      : postNewsletter.messages.failure
  return { text, ok: false }
}

/** Initial `useActionState` value for both newsletter forms. */
export const NEWSLETTER_INITIAL: FormState = { status: 0, message: '' }
