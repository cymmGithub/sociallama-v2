'use client'

import { Field } from '@base-ui/react/field'
import cn from 'clsx'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useFormContext } from '..'
import s from './fields.module.css'

/**
 * Form field components built on Base UI Field for accessibility.
 *
 * @example
 * ```tsx
 * <Form action={myAction}>
 *   <InputField
 *     id="email"
 *     type="email"
 *     label="Email address"
 *     placeholder="you@example.com"
 *     required
 *   />
 *   <TextareaField
 *     id="message"
 *     label="Message"
 *     rows={4}
 *   />
 *   <SubmitButton>Send</SubmitButton>
 * </Form>
 * ```
 */

type FieldShellProps = {
  id: string
  /** Registration key — the field's `name` attribute, see `InputField`. */
  fieldName: string
  label?: ReactNode
  required: boolean
  disabled: boolean
  className?: string | undefined
  /** The field's own `<Field.Control>`. */
  children: ReactNode
}

/**
 * Root, label and error chrome shared by the input, textarea and select fields.
 * Each of them supplies only its own control; everything around it — the active
 * / error state classes, the required asterisk, the error message — lives here.
 *
 * `FileField` is not built on this: its label carries the visible affordance for
 * a hidden input and its error state is local, not the registered one.
 */
function FieldShell({
  id,
  fieldName,
  label,
  required,
  disabled,
  className,
  children,
}: FieldShellProps) {
  const { state } = useFormContext()
  const { errors, isActive } = state
  const error = errors[fieldName]

  return (
    <Field.Root
      className={cn(
        s.field,
        isActive[fieldName] && s.active,
        error?.state && s.error,
        className
      )}
      disabled={disabled}
    >
      {label && (
        <Field.Label htmlFor={id} className={s.label}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </Field.Label>
      )}
      {children}
      {/* Plain element, not Base UI <Field.Error> — the latter renders only
          from Base UI's own validity, so our custom validation state never
          surfaced through it. */}
      {error?.state && error.message && (
        <span className={s.errorMessage} role="alert">
          {error.message}
        </span>
      )}
    </Field.Root>
  )
}

type InputFieldProps = {
  className?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  id: string
  name?: string
  label?: ReactNode
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputField({
  className,
  type = 'text',
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
}: InputFieldProps) {
  const { actions } = useFormContext()
  const { register } = actions
  // Use name (or id as fallback) as the registration key — matches the input's name attribute
  const fieldName = name ?? id

  return (
    <FieldShell
      id={id}
      fieldName={fieldName}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
    >
      <Field.Control
        type={type}
        id={id}
        name={fieldName}
        required={required}
        placeholder={placeholder}
        className={s.input}
        {...register(fieldName)}
        render={<input />}
      />
    </FieldShell>
  )
}

type TextareaFieldProps = {
  className?: string
  id: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}

export function TextareaField({
  className,
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
}: TextareaFieldProps) {
  const { actions } = useFormContext()
  const { register } = actions
  const fieldName = name ?? id

  return (
    <FieldShell
      id={id}
      fieldName={fieldName}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
    >
      <Field.Control
        id={id}
        name={fieldName}
        required={required}
        placeholder={placeholder}
        className={s.textarea}
        {...register(fieldName)}
        render={<textarea rows={rows} />}
      />
    </FieldShell>
  )
}

type SelectFieldProps = {
  className?: string
  id: string
  name?: string
  label?: ReactNode
  options: readonly { label: string; value: string }[]
  defaultValue?: string
  required?: boolean
  disabled?: boolean
}

/**
 * Native `<select>` in the kit's field shell. Native rather than a listbox
 * widget: it inherits platform keyboard behaviour and the mobile picker for
 * free, and the pages that need one are styling a closed control, not an open
 * menu. A select always submits a value, so it is never the field that blocks
 * submit — the server schema is what rejects a value outside the option set.
 */
export function SelectField({
  className,
  id,
  name,
  label,
  options,
  defaultValue,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  const { actions } = useFormContext()
  const { register } = actions
  const fieldName = name ?? id

  return (
    <FieldShell
      id={id}
      fieldName={fieldName}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
    >
      <Field.Control
        id={id}
        name={fieldName}
        required={required}
        defaultValue={defaultValue}
        className={s.select}
        {...register(fieldName)}
        render={
          <select>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />
    </FieldShell>
  )
}

type FileFieldProps = {
  className?: string
  id: string
  name?: string
  label?: ReactNode
  /** Replaces `label` once a file is attached — e.g. "CV attached". */
  attachedLabel?: ReactNode
  /** Forwarded to the input's `accept`, and the allowlist the check enforces. */
  accept: string
  /** Client-side ceiling in bytes (design D5, layer 1). */
  maxBytes: number
  /** Static hint under the label — e.g. "PDF or DOCX, up to 5 MB". */
  hint?: string
  /** Replaces `hint` while a file is dragged over the card. */
  dropHint?: string
  /** Labels for the attached-state actions; the row renders only with both. */
  changeText?: string
  removeText?: string
  /** BCP 47 tag for the size chip's number format. */
  locale?: string
  /** Shown when the picked file is over `maxBytes`. */
  sizeError: string
  /** Shown when the picked file is outside `accept`. */
  typeError: string
  required?: boolean
  disabled?: boolean
}

/** "PDF · 184 KB" — extension from the name, whole KB below 1 MB, else 1 dp. */
function describeFile(file: File, locale: string): string {
  const ext = (file.name.split('.').pop() ?? '').toUpperCase()
  const size =
    file.size < 1024 * 1024
      ? `${Math.round(file.size / 1024)} KB`
      : `${(file.size / 1048576).toLocaleString(locale, { maximumFractionDigits: 1 })} MB`
  return `${ext} · ${size}`
}

/**
 * Whether a picked file matches an `accept` list, by extension or declared MIME
 * type. Deliberately not magic-byte sniffing (design D6): the file is forwarded
 * to a mailbox, never parsed or served, so the allowlist is there to catch an
 * honest mistake before the upload is spent.
 */
function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
  if (patterns.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return patterns.some((pattern) =>
    pattern.startsWith('.') ? name.endsWith(pattern) : type === pattern
  )
}

/**
 * File input in the kit's field shell.
 *
 * The control is visually hidden (clipped, NOT `display: none`, so it stays
 * focusable and in the tab order) and its `<label>` carries the visible
 * affordance — the only way to give a file input a designed appearance.
 *
 * A file failing the type or size check is REMOVED from the input rather than
 * flagged and left in place: an oversized body is rejected by the Next.js
 * runtime before the server action runs, with no field to attribute the error
 * to (design D5), so the browser must make sure it is never sent. The server
 * schema re-checks both regardless — this layer is advisory.
 *
 * Validity is driven through `setFieldValidity`, not the kit's registered-value
 * path. A file input's `value` is a fake path that stays non-empty after the
 * rejected file has been cleared, so the default path would report a required
 * field as satisfied by a file that is no longer attached.
 *
 * The label is also the drop target. A drop lands the FileList on the clipped
 * input (so the file rides in the FormData like a picked one) and then runs
 * the same check. Once a file is attached the card swaps to `attachedLabel`,
 * the file's name and a type · size chip, plus change / remove actions; the
 * `data-attached` / `data-dragging` attributes and `data-part` hooks are what a
 * page styles, since the kit forwards only `className`.
 */
export function FileField({
  className,
  id,
  name,
  label,
  attachedLabel,
  accept,
  maxBytes,
  hint,
  dropHint,
  changeText,
  removeText,
  locale = 'en',
  sizeError,
  typeError,
  required = false,
  disabled = false,
}: FileFieldProps) {
  const { state, actions } = useFormContext()
  const { errors } = state
  const { register, setFieldValidity } = actions
  const fieldName = name ?? id
  // Server-side error for this field, if the page surfaces one; the local
  // check owns everything the browser can see first.
  const serverError = errors[fieldName]
  const [attached, setAttached] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const reg = register(fieldName)

  // Seed the gate: an empty required field is invalid, but silently so — the
  // message appears when the visitor tries to submit, not on page load.
  useEffect(() => {
    setFieldValidity(fieldName, !required)
  }, [fieldName, required, setFieldValidity])

  const clear = (input: HTMLInputElement) => {
    // Clearing the input is what keeps a rejected body off the wire.
    input.value = ''
    setAttached(null)
    setLocalError(null)
    setFieldValidity(fieldName, !required)
  }

  /** Shared by the change and drop paths — the check does not care which. */
  const acceptFile = (input: HTMLInputElement, file: File | undefined) => {
    if (!file) {
      setAttached(null)
      setLocalError(null)
      setFieldValidity(fieldName, !required)
      return
    }

    let rejection: string | null = null
    if (!matchesAccept(file, accept)) {
      rejection = typeError
    } else if (file.size > maxBytes) {
      rejection = sizeError
    }

    if (rejection) {
      input.value = ''
      setAttached(null)
      setLocalError(rejection)
      setFieldValidity(fieldName, !required, rejection)
      return
    }

    setAttached(file)
    setLocalError(null)
    setFieldValidity(fieldName, true)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    const input = inputRef.current
    const files = event.dataTransfer?.files
    if (!(input && files?.length)) return
    // A FileList is assignable to `files`; the browser then submits it with
    // the form exactly as if it had been picked.
    try {
      input.files = files
    } catch {
      // happy-dom has no setter; the check below still runs on the dropped file.
    }
    acceptFile(input, files[0])
  }

  const message =
    localError ?? (serverError?.state ? serverError.message : null)
  const showActions = attached && changeText && removeText

  return (
    <Field.Root
      className={cn(s.field, s.fileField, message && s.error, className)}
      disabled={disabled}
      data-attached={attached ? '' : undefined}
      data-dragging={dragging ? '' : undefined}
    >
      <Field.Label
        htmlFor={id}
        className={cn(s.fileLabel)}
        onDragOver={(event: React.DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          if (!dragging) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {attached && (
          // Remounted per file so the page's outline sweep replays on a re-pick.
          <svg key={attached.name} aria-hidden="true" data-part="sweep">
            <rect pathLength="100" />
          </svg>
        )}
        <span className={s.fileTitle}>
          {attached ? (attachedLabel ?? label) : label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
        {attached ? (
          <span className={s.fileHint} data-part="file">
            <span data-part="name">{attached.name}</span>
            <span data-part="chip">{describeFile(attached, locale)}</span>
          </span>
        ) : (
          <span className={s.fileHint}>
            {dragging ? (dropHint ?? hint) : hint}
          </span>
        )}
      </Field.Label>
      <Field.Control
        type="file"
        id={id}
        name={fieldName}
        accept={accept}
        required={required}
        className={cn(s.fileInput)}
        {...reg}
        ref={(node: HTMLInputElement | null) => {
          inputRef.current = node
          reg.ref(node)
        }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          reg.onChange(event)
          acceptFile(event.target, event.target.files?.[0])
        }}
        render={<input />}
      />
      {showActions && (
        <span data-part="actions">
          <button type="button" onClick={() => inputRef.current?.click()}>
            {changeText}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current && clear(inputRef.current)}
          >
            {removeText}
          </button>
        </span>
      )}
      {message && (
        <span className={cn(s.errorMessage)} role="alert">
          {message}
        </span>
      )}
    </Field.Root>
  )
}

type CheckboxesFieldProps = {
  className?: string
  options: readonly { label: string; value: string }[]
  name: string
  label?: ReactNode
}

export function CheckboxesField({
  className,
  options,
  name,
  label,
}: CheckboxesFieldProps) {
  const { actions } = useFormContext()
  const { register } = actions
  const [selected, setSelected] = useState<string[]>([])

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const reg = register(name)

  return (
    <Field.Root className={cn(s.field, s.checkboxGroup, className)}>
      {label && <Field.Label className={cn(s.groupLabel)}>{label}</Field.Label>}
      <input
        type="hidden"
        name={name}
        id="hidden"
        value={JSON.stringify(selected)}
        {...reg}
      />
      <div className={s.options}>
        {options.map(({ label, value }) => (
          <button
            key={value}
            className={cn(s.option, selected.includes(value) && s.selected)}
            type="button"
            aria-pressed={selected.includes(value)}
            onClick={() => handleToggle(value)}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>
    </Field.Root>
  )
}
