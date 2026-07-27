'use client'

import { ArrowRight } from 'lucide-react'
import { useActionState, useState } from 'react'
import { NEWSLETTER_INITIAL, newsletterResult } from '@/lib/blog/newsletter'
import { postNewsletter } from '@/lib/content/blog'
import { mailchimpSubscriptionAction } from '@/lib/integrations/mailchimp/action'
import s from './blog.module.css'

/**
 * Newsletter slab on the hub, on the stage treatment. Same offer and same
 * action as the post page's slab; the message mapping is shared so the two can
 * never disagree about what a failure means.
 *
 * The address is a controlled value on purpose: React resets an uncontrolled
 * form after a successful action, which would also wipe the field on a failed
 * one. Holding it in state lets a failure keep what the reader typed.
 */
export function HubNewsletter() {
  const [state, formAction, isPending] = useActionState(
    mailchimpSubscriptionAction,
    NEWSLETTER_INITIAL
  )
  const [email, setEmail] = useState('')

  const result = newsletterResult(state)

  return (
    <section className={`${s.stage} ${s.newsletter}`}>
      <div>
        <h2 className={s.newsletterTitle}>{postNewsletter.title}</h2>
        <p className={s.newsletterText}>{postNewsletter.text}</p>
      </div>
      <div>
        {/* Success retires the form rather than clearing it: there's nothing
            left to type, and it keeps the address off the screen. */}
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
