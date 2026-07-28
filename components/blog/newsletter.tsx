'use client'

import cn from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useActionState, useState } from 'react'
import { NEWSLETTER_INITIAL } from '@/lib/blog/newsletter'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import { mailchimpSubscriptionAction } from '@/lib/integrations/mailchimp/action'
import type { FormState } from '@/lib/types/form'
import s from './newsletter.module.css'

type NewsletterCopy = Localized<typeof pl.postNewsletter>

/**
 * Map the subscription action's result to reader-facing text. The action
 * returns untranslated placeholder keys (the satus `foo_` convention), so the
 * wording is looked up in the copy the caller supplied — the mapping follows
 * the locale, which is why it sits with the copy rather than in a shared
 * module. Returns null before the form has been submitted.
 */
function subscriptionResult(
  state: FormState,
  messages: NewsletterCopy['messages']
): { text: string; ok: boolean } | null {
  if (state.status === 0) {
    return null
  }
  if (state.status === 200) {
    return { text: messages.success, ok: true }
  }
  const text =
    state.message === 'invalid_email_'
      ? messages.invalidEmail
      : messages.failure
  return { text, ok: false }
}

/**
 * The NewsLAMA sign-up slab, on the plum grain stage. Used by the post
 * template and by the /blog hub — one offer, one action, one set of states, so
 * the two can never drift apart.
 *
 * Shared by both locales: `content` carries every string, including the
 * `messages` map the action's outcome is rendered through. It renders on the
 * hub and after every post body, so a Polish fallback here would surface on
 * every English blog page.
 *
 * `className` is for outer placement only (the post page constrains its width
 * and pushes it down the article column); the slab owns everything inside.
 *
 * The address is a controlled value on purpose: React resets an uncontrolled
 * form after a successful action, which would also wipe the field on a failed
 * one. Holding it in state lets a failure keep what the reader typed and lets
 * success clear it deliberately.
 */
export function BlogNewsletter({
  content,
  className,
}: {
  content: NewsletterCopy
  className?: string | undefined
}) {
  const [state, formAction, isPending] = useActionState(
    mailchimpSubscriptionAction,
    NEWSLETTER_INITIAL
  )
  const [email, setEmail] = useState('')

  const result = subscriptionResult(state, content.messages)

  return (
    <section className={cn(s.stage, s.newsletter, className)}>
      <div>
        <h2 className={s.title}>{content.title}</h2>
        <p className={s.text}>{content.text}</p>
      </div>
      <div>
        {/* Success retires the form rather than clearing it: there's nothing
            left to type, and it keeps the address off the screen. A failure
            keeps the form mounted, so the controlled value survives. */}
        {result?.ok ? (
          <p aria-live="polite" className={s.message}>
            {result.text}
          </p>
        ) : (
          <>
            <form action={formAction} className={s.form}>
              <input
                aria-label={content.placeholder}
                className={s.input}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={content.placeholder}
                required
                type="email"
                value={email}
              />
              <button className={s.button} disabled={isPending} type="submit">
                {content.label}
                <ArrowRight aria-hidden="true" />
              </button>
            </form>
            {result ? (
              <p aria-live="polite" className={s.error}>
                {result.text}
              </p>
            ) : (
              <p className={s.note}>{content.note}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
