'use client'

import { ArrowRight } from 'lucide-react'
import { useActionState, useState } from 'react'
import { postNewsletter } from '@/lib/content/blog'
import { mailchimpSubscriptionAction } from '@/lib/integrations/mailchimp/action'
import type { FormState } from '@/lib/types/form'
import s from './post.module.css'

/**
 * Newsletter slab closing the post, on the stage treatment. Submits through the
 * site's existing `mailchimpSubscriptionAction`.
 *
 * The address is a controlled value on purpose: React resets an uncontrolled
 * form after a successful action, which would also wipe the field on a failed
 * one. Holding it in state lets a failure keep what the reader typed and lets
 * success clear it deliberately.
 */

const INITIAL: FormState = { status: 0, message: '' }

/** Action message keys → reader-facing Polish (see lib/content/blog.ts). */
function resultMessage(state: FormState): { text: string; ok: boolean } | null {
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

export function PostNewsletter() {
  const [state, formAction, isPending] = useActionState(
    mailchimpSubscriptionAction,
    INITIAL
  )
  const [email, setEmail] = useState('')

  const result = resultMessage(state)

  return (
    <section className={`${s.stage} ${s.newsletter}`}>
      <div>
        <h2 className={s.newsletterTitle}>{postNewsletter.title}</h2>
        <p className={s.newsletterText}>{postNewsletter.text}</p>
      </div>
      <div>
        {/* Success retires the form rather than clearing it: there's nothing
            left to type, and it keeps the address off the screen. A failure
            keeps the form mounted, so the controlled value survives. */}
        {result?.ok ? (
          <p aria-live="polite" className={s.newsletterMessage}>
            {result.text}
          </p>
        ) : (
          <>
            <form action={formAction} className={s.newsletterForm}>
              <input
                aria-label={postNewsletter.placeholder}
                className={s.newsletterInput}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={postNewsletter.placeholder}
                required
                type="email"
                value={email}
              />
              <button
                className={s.pillButton}
                disabled={isPending}
                type="submit"
              >
                {postNewsletter.label}
                <ArrowRight aria-hidden="true" />
              </button>
            </form>
            {result ? (
              <p aria-live="polite" className={s.newsletterError}>
                {result.text}
              </p>
            ) : (
              <p className={s.newsletterNote}>{postNewsletter.note}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
