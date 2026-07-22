'use client'

import cn from 'clsx'
import { ArrowRight, CircleSmall } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { Form, type FormState, SubmitButton } from '@/components/ui/form'
import {
  CheckboxesField,
  InputField,
  TextareaField,
} from '@/components/ui/form/fields'
import { Link } from '@/components/ui/link'
import { Toast, useToast } from '@/components/ui/toast'
import { contactForm, contactServices } from '@/lib/content/contact'
import { env } from '@/lib/env'
import { sendContactEmail } from '@/lib/integrations/email/action'
import s from './kontakt.module.css'
import { TurnstileWidget } from './turnstile-widget'

// Client-side validation copy, keyed by field name — Polish, sourced from
// content. Passed to the form kit's `invalidMessage` formatter so the reused
// hook stops emitting its default English `Invalid <field>` text.
// Inline hints shown under a field. Required text fields get the short
// "Wymagane"; email keeps its format-specific message (covers empty + malformed).
const INVALID_MESSAGES: Record<string, string> = {
  name: contactForm.errors.required,
  email: contactForm.errors.email,
  message: contactForm.errors.required,
}

function invalidMessage(field: string): string {
  return INVALID_MESSAGES[field] ?? contactForm.errors.fallback
}

export function ContactForm() {
  // Toast.Provider must live inside a client component — it's a compound-
  // component object and can't be resolved across the RSC boundary from the
  // server page. The Viewport (top-right) is portaled to <body>.
  return (
    <Toast.Provider>
      <ContactFormFields />
      <Toast.Viewport />
    </Toast.Provider>
  )
}

function ContactFormFields() {
  const siteKey = env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
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

  return (
    <Form
      action={sendContactEmail}
      className={cn(s.formShell)}
      invalidMessage={invalidMessage}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      <InputField
        className={cn(s.field, s.half)}
        id="name"
        name="name"
        label={contactForm.fields.name.label}
        placeholder={contactForm.fields.name.placeholder}
        required
      />
      <InputField
        className={cn(s.field, s.half)}
        id="email"
        name="email"
        type="email"
        label={contactForm.fields.email.label}
        placeholder={contactForm.fields.email.placeholder}
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
            {contactForm.fields.phone.label}
            <CircleSmall
              className={s.labelSep}
              fill="currentColor"
              aria-hidden="true"
            />
            {contactForm.fields.phone.optional}
          </>
        }
        placeholder={contactForm.fields.phone.placeholder}
      />
      <CheckboxesField
        className={cn(s.field)}
        name="services"
        label={
          <>
            {contactForm.fields.services.label}
            <CircleSmall
              className={s.labelSep}
              fill="currentColor"
              aria-hidden="true"
            />
            {contactForm.fields.services.optional}
          </>
        }
        options={contactServices}
      />
      <TextareaField
        className={cn(s.field)}
        id="message"
        name="message"
        label={contactForm.fields.message.label}
        placeholder={contactForm.fields.message.placeholder}
        rows={5}
        required
      />

      {siteKey && <TurnstileWidget siteKey={siteKey} />}

      <div className={cn(s.send)}>
        <SubmitButton
          defaultText={contactForm.submit.default}
          pendingText={contactForm.submit.pending}
          successText={contactForm.submit.success}
          errorText={contactForm.submit.error}
          icon={<ArrowRight aria-hidden="true" />}
        >
          {contactForm.submit.default}
        </SubmitButton>
        <span className={cn(s.note)}>{contactForm.note}</span>
      </div>
      <p className={cn(s.privacy)}>
        {contactForm.privacyNote.text}{' '}
        <Link href={contactForm.privacyNote.linkHref}>
          {contactForm.privacyNote.linkLabel}
        </Link>
        .
      </p>
    </Form>
  )
}
