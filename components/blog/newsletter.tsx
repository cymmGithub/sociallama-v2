'use client'

import cn from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useActionState, useState } from 'react'
import { NEWSLETTER_INITIAL, newsletterResult } from '@/lib/blog/newsletter'
import { postNewsletter } from '@/lib/content/blog'
import { mailchimpSubscriptionAction } from '@/lib/integrations/mailchimp/action'
import s from './newsletter.module.css'

/**
 * The NewsLAMA sign-up slab, on the plum grain stage. Used by the post
 * template and by the /blog hub — one offer, one action, one set of states, so
 * the two can never drift apart.
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
  className,
}: {
  className?: string | undefined
}) {
  const [state, formAction, isPending] = useActionState(
    mailchimpSubscriptionAction,
    NEWSLETTER_INITIAL
  )
  const [email, setEmail] = useState('')

  const result = newsletterResult(state)

  return (
    <section className={cn(s.stage, s.newsletter, className)}>
      <div>
        <h2 className={s.title}>{postNewsletter.title}</h2>
        <p className={s.text}>{postNewsletter.text}</p>
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
                aria-label={postNewsletter.placeholder}
                className={s.input}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={postNewsletter.placeholder}
                required
                type="email"
                value={email}
              />
              <button className={s.button} disabled={isPending} type="submit">
                {postNewsletter.label}
                <ArrowRight aria-hidden="true" />
              </button>
            </form>
            {result ? (
              <p aria-live="polite" className={s.error}>
                {result.text}
              </p>
            ) : (
              <p className={s.note}>{postNewsletter.note}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
