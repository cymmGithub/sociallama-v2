'use client'

import cn from 'clsx'
import { ArrowRight, CircleSmall } from 'lucide-react'
import { useCallback, useId, useRef } from 'react'
import { Form, type FormState, SubmitButton } from '@/components/ui/form'
import { ConsentField } from '@/components/ui/form/consent-field'
import { InputField, TextareaField } from '@/components/ui/form/fields'
import { Link } from '@/components/ui/link'
import { Toast, useToast } from '@/components/ui/toast'
import {
  contactForm as contactFormDefault,
  type LocalizedContact,
} from '@/lib/content/contact'
import { env } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import { sendContactEmail } from '@/lib/integrations/email/action'
import s from './kontakt.module.css'
import { TurnstileWidget } from './turnstile-widget'

type ContactFormCopy = LocalizedContact['contactForm']

interface ContactFormProps {
  form?: ContactFormCopy
  locale?: Locale
}

export function ContactForm({
  form = contactFormDefault,
  locale = 'pl',
}: ContactFormProps) {
  // Toast.Provider must live inside a client component — it's a compound-
  // component object and can't be resolved across the RSC boundary from the
  // server page. The Viewport (top-right) is portaled to <body>.
  return (
    <Toast.Provider>
      <ContactFormFields form={form} locale={locale} />
      <Toast.Viewport />
    </Toast.Provider>
  )
}

/** The page's own look for a consent row; the kit component owns the wiring. */
const CONSENT_CLASSES = {
  row: s.consent,
  box: s.consentBox,
  label: s.consentLabel,
  error: s.consentError,
}

function ContactFormFields({ form, locale }: Required<ContactFormProps>) {
  const siteKey = env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
  const consentId = useId()
  // The toast context value isn't memoised, so read it through a ref and keep
  // the Form callbacks stable — otherwise a new callback identity on every
  // toast-driven re-render would re-fire the effect (and re-toast in a loop).
  const { toast } = useToast()
  const toastRef = useRef(toast)
  toastRef.current = toast

  const handleSuccess = useCallback((state: FormState) => {
    if (state.message) toastRef.current.success(state.message)
  }, [])
  const handleError = useCallback((state: FormState) => {
    if (state.message) toastRef.current.error(state.message)
  }, [])

  // Client-side validation copy, keyed by field name — sourced from content so
  // the reused hook stops emitting its default English `Invalid <field>` text.
  // Required text fields get the short "Required" hint; email keeps its
  // format-specific message (covers empty + malformed).
  const invalidMessage = useCallback(
    (field: string): string => {
      const messages: Record<string, string> = {
        name: form.errors.required,
        email: form.errors.email,
        message: form.errors.required,
        consent: form.errors.consent,
      }
      return messages[field] ?? form.errors.fallback
    },
    [form]
  )

  return (
    <Form
      action={sendContactEmail}
      className={cn(s.formShell)}
      invalidMessage={invalidMessage}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {/* Locale for the server action — selects EN validation/message/email
          strings (design D7). Hidden field so it rides along in the FormData. */}
      <input type="hidden" name="locale" value={locale} />

      <InputField
        className={cn(s.field, s.half)}
        id="name"
        name="name"
        label={form.fields.name.label}
        placeholder={form.fields.name.placeholder}
        required
      />
      <InputField
        className={cn(s.field, s.half)}
        id="email"
        name="email"
        type="email"
        label={form.fields.email.label}
        placeholder={form.fields.email.placeholder}
        required
      />
      <InputField
        // Keyed `phoneNumber`, not `phone`, on purpose: the form kit
        // auto-applies a strict-E.164 built-in validator to any field named
        // `phone` (see hook.ts resolveValidator), which would reject formatted
        // numbers and block this optional field. The design wants it loose.
        className={cn(s.field)}
        id="phoneNumber"
        name="phoneNumber"
        type="tel"
        label={
          <>
            {form.fields.phone.label}
            <CircleSmall
              className={s.labelSep}
              fill="currentColor"
              aria-hidden="true"
            />
            {form.fields.phone.optional}
          </>
        }
        placeholder={form.fields.phone.placeholder}
      />
      <TextareaField
        className={cn(s.field)}
        id="message"
        name="message"
        label={form.fields.message.label}
        placeholder={form.fields.message.placeholder}
        rows={5}
        required
      />

      {/* Consents sit above the send row, so nothing is submitted before the
          required one is given. Two separate controls on purpose: bundling the
          marketing permission into the one a visitor must give would not be
          freely given consent, and the schema treats them independently. */}
      <div className={s.consentGroup}>
        <ConsentField
          classNames={CONSENT_CLASSES}
          id={`${consentId}-consent`}
          name="consent"
          required
          invalidMessage={form.errors.consent}
        >
          {form.consent.text}
        </ConsentField>
        <ConsentField
          classNames={CONSENT_CLASSES}
          id={`${consentId}-marketing`}
          name="marketingConsent"
        >
          {form.marketingConsent.text}
          <Link href={form.marketingConsent.linkHref}>
            {form.marketingConsent.linkLabel}
          </Link>
          .
        </ConsentField>
      </div>

      <div className={cn(s.send)}>
        <SubmitButton
          defaultText={form.submit.default}
          pendingText={form.submit.pending}
          successText={form.submit.success}
          errorText={form.submit.error}
          icon={<ArrowRight aria-hidden="true" />}
        >
          {form.submit.default}
        </SubmitButton>
        <span className={cn(s.note)}>{form.note}</span>
      </div>

      {/* Below the send row (user call, 2026-08-14) — the challenge is
          plumbing, not a step the visitor should read before the CTA. Still
          inside the <Form>: the hidden token input must ride in the FormData. */}
      {siteKey && <TurnstileWidget siteKey={siteKey} />}
    </Form>
  )
}
