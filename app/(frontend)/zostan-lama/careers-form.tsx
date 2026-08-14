'use client'

import cn from 'clsx'
import { ArrowUpRight, FileUp } from 'lucide-react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
// Shared with /kontakt: the widget is route-agnostic (no CSS module of its
// own), and both forms need the same explicit-render + reset-on-failure
// behaviour. Importing the component, not another route's styles.
import { TurnstileWidget } from '@/app/(frontend)/kontakt/turnstile-widget'
import {
  Form,
  type FormState,
  SubmitButton,
  useFormContext,
} from '@/components/ui/form'
import {
  FileField,
  InputField,
  SelectField,
  TextareaField,
} from '@/components/ui/form/fields'
import { Link } from '@/components/ui/link'
import { Toast, useToast } from '@/components/ui/toast'
import {
  CAREERS_CV_MAX_BYTES,
  CAREERS_SPONTANEOUS_VALUE,
  type LocalizedCareers,
} from '@/lib/content/zostan-lama'
import { env } from '@/lib/env'
import type { Locale } from '@/lib/i18n/slug-map'
import { sendCareersApplication } from '@/lib/integrations/email/careers-action'
import { CAREERS_CV_ACCEPT } from '@/lib/integrations/email/careers-schema'
import s from './zostan-lama.module.css'

type CareersFormCopy = LocalizedCareers['careersForm']
type CareersRoles = LocalizedCareers['careersRoles']

interface CareersFormProps {
  form: CareersFormCopy
  roles: CareersRoles
  locale: Locale
  /**
   * The position the page was entered through, when it was entered through one
   * (`/zostan-lama/{id}`) — it changes which role the select opens on, nothing
   * else. The visitor stays free to pick another, and the server still
   * validates whatever is submitted.
   */
  initialRoleId?: string | undefined
}

/**
 * Application form — the page's closing section (design D3), on the deep-plum
 * band. Replaces the `mailto:` CTA the redesign exists to remove, and reuses
 * /kontakt's pipeline end to end: Turnstile widget, form kit, rate-limited
 * server action, SMTP transport.
 */
export function CareersForm({
  form,
  roles,
  locale,
  initialRoleId,
}: CareersFormProps) {
  // Toast.Provider must live inside a client component — it's a compound-
  // component object and can't be resolved across the RSC boundary from the
  // server page. The Viewport (top-right) is portaled to <body>.
  return (
    <Toast.Provider>
      <CareersFormFields
        form={form}
        roles={roles}
        locale={locale}
        initialRoleId={initialRoleId}
      />
      <Toast.Viewport />
    </Toast.Provider>
  )
}

/**
 * A consent row — a real checkbox, unchecked by default.
 *
 * Not a kit field: a checkbox's `value` is `"on"` whether or not it is checked,
 * so the kit's registered-control path reads every consent box as filled in.
 * For a required one, `setFieldValidity` is the escape hatch — it puts the
 * control back inside the readiness gate, so an unchecked box blocks the submit
 * and reveals its own message rather than making the round trip and coming back
 * with the schema's generic failure.
 *
 * The two consents are separate controls on purpose: bundling the marketing
 * permission into the one an applicant must give would not be freely given
 * consent, and the schema treats them independently.
 */
function ConsentField({
  id,
  name,
  children,
  required = false,
  invalidMessage,
}: {
  id: string
  name: string
  children: ReactNode
  required?: boolean
  invalidMessage?: string
}) {
  const { state, actions } = useFormContext()
  const { setFieldValidity } = actions
  const [checked, setChecked] = useState(false)
  const error = state.errors[name]

  // Seed the gate: unchecked is invalid, but silently so — the message appears
  // when the visitor tries to submit, not the moment the page loads. An
  // optional consent never enters the gate at all.
  useEffect(() => {
    if (required) setFieldValidity(name, false)
  }, [name, required, setFieldValidity])

  return (
    <div className={s.consent}>
      <input
        className={s.consentBox}
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(event) => {
          const next = event.target.checked
          setChecked(next)
          if (required) {
            setFieldValidity(name, next, next ? '' : (invalidMessage ?? ''))
          }
        }}
      />
      <label className={s.consentLabel} htmlFor={id}>
        {children}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {error?.state && error.message && (
        <span className={s.consentError} role="alert">
          {error.message}
        </span>
      )}
    </div>
  )
}

function CareersFormFields({
  form,
  roles,
  locale,
  initialRoleId,
}: CareersFormProps) {
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
  const invalidMessage = useCallback(
    (field: string): string => {
      const messages: Record<string, string> = {
        name: form.errors.name,
        email: form.errors.email,
        message: form.errors.message,
        cv: form.errors.cvRequired,
        consent: form.errors.consent,
      }
      return messages[field] ?? form.errors.fallback
    },
    [form]
  )

  // Every open role, plus the spontaneous option so the form stays usable when
  // nothing advertised fits. Values are the locale-independent role ids the
  // server action validates against.
  const roleOptions = [
    ...roles.map((role) => ({ label: role.title, value: role.id })),
    { label: form.fields.role.spontaneous, value: CAREERS_SPONTANEOUS_VALUE },
  ]
  // The position URL's role when the page was entered through one, otherwise
  // the first opening. Falls back to the spontaneous option, which is always
  // present — so the select still has a valid default if every role is ever
  // closed.
  const defaultRole =
    roles.find((role) => role.id === initialRoleId)?.id ??
    roles[0]?.id ??
    CAREERS_SPONTANEOUS_VALUE

  return (
    <Form
      action={sendCareersApplication}
      className={cn(s.formShell)}
      invalidMessage={invalidMessage}
      onSuccess={handleSuccess}
      onError={handleError}
    >
      {/* Locale for the server action — selects EN validation / status / email
          strings. Hidden field so it rides along in the FormData. */}
      <input type="hidden" name="locale" value={locale} />

      <div className={s.fieldRow}>
        <InputField
          className={cn(s.field, s.half)}
          id="careers-name"
          name="name"
          label={form.fields.name.label}
          placeholder={form.fields.name.placeholder}
          required
        />
        <InputField
          className={cn(s.field, s.half)}
          id="careers-email"
          name="email"
          type="email"
          label={form.fields.email.label}
          placeholder={form.fields.email.placeholder}
          required
        />
      </div>

      {/* Not marked `required`: a select always submits a value, and the kit
          seeds a required control as invalid until it changes — which would
          block the submit on a role the visitor never had to touch. The schema
          is what rejects a value outside the option set. */}
      <SelectField
        className={cn(s.field)}
        id="careers-role"
        name="role"
        label={form.fields.role.label}
        options={roleOptions}
        defaultValue={defaultRole}
      />

      <TextareaField
        className={cn(s.field)}
        id="careers-message"
        name="message"
        label={form.fields.message.label}
        placeholder={form.fields.message.placeholder}
        rows={4}
        required
      />

      <FileField
        className={cn(s.field, s.cvField)}
        id="careers-cv"
        name="cv"
        label={
          <>
            <FileUp aria-hidden="true" />
            {form.fields.cv.label}
          </>
        }
        hint={form.fields.cv.hint}
        accept={CAREERS_CV_ACCEPT}
        maxBytes={CAREERS_CV_MAX_BYTES}
        sizeError={form.errors.cvSize}
        typeError={form.errors.cvType}
        required
      />

      <div className={s.consentGroup}>
        <ConsentField
          id={`${consentId}-required`}
          name="consent"
          required
          invalidMessage={form.errors.consent}
        >
          {form.consent.required.label}
        </ConsentField>
        <ConsentField id={`${consentId}-marketing`} name="marketingConsent">
          {form.consent.marketing.text}
          <Link href={form.consent.marketing.linkHref}>
            {form.consent.marketing.linkLabel}
          </Link>
          .
        </ConsentField>
      </div>

      {siteKey && <TurnstileWidget siteKey={siteKey} />}

      <div className={cn(s.send)}>
        <SubmitButton
          defaultText={form.submit.default}
          pendingText={form.submit.pending}
          successText={form.submit.success}
          errorText={form.submit.error}
          icon={<ArrowUpRight aria-hidden="true" />}
        >
          {form.submit.default}
        </SubmitButton>
      </div>
    </Form>
  )
}
