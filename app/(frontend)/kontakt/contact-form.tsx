'use client'

import cn from 'clsx'
import { Form, Messages, SubmitButton } from '@/components/ui/form'
import {
  CheckboxesField,
  InputField,
  TextareaField,
} from '@/components/ui/form/fields'
import { contactForm, contactServices } from '@/lib/content/contact'
import { env } from '@/lib/env'
import { sendContactEmail } from '@/lib/integrations/email/action'
import s from './kontakt.module.css'
import { TurnstileWidget } from './turnstile-widget'

const SERVICE_OPTIONS = contactServices.map((service) => ({
  label: service.label,
  value: service.value,
}))

// Client-side validation copy, keyed by field name — Polish, sourced from
// content. Passed to the form kit's `invalidMessage` formatter so the reused
// hook stops emitting its default English `Invalid <field>` text.
const INVALID_MESSAGES: Record<string, string> = {
  name: contactForm.errors.name,
  email: contactForm.errors.email,
  message: contactForm.errors.message,
}

function invalidMessage(field: string): string {
  return INVALID_MESSAGES[field] ?? contactForm.errors.fallback
}

export function ContactForm() {
  const siteKey = env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY

  return (
    <Form
      action={sendContactEmail}
      className={cn(s.formShell)}
      invalidMessage={invalidMessage}
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
      <CheckboxesField
        className={cn(s.field)}
        name="services"
        label={contactForm.fields.services.label}
        options={SERVICE_OPTIONS}
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
        >
          {contactForm.submit.default}
        </SubmitButton>
        <span className={cn(s.note)}>{contactForm.note}</span>
      </div>
      <Messages className={cn(s.messages)} />
    </Form>
  )
}
