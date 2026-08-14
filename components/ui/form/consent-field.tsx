'use client'

import { type ReactNode, useState } from 'react'
import { useFormContext } from '.'

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
 * Where a form has more than one consent they stay separate controls on
 * purpose: bundling a marketing permission into the one a visitor must give
 * would not be freely given consent, and the schemas treat them independently.
 *
 * The look stays with the page: each caller passes its own CSS module's classes
 * through `classNames`, so this file owns the wiring and nothing else.
 */
export function ConsentField({
  id,
  name,
  children,
  required = false,
  invalidMessage,
  classNames,
}: {
  id: string
  name: string
  children: ReactNode
  required?: boolean
  invalidMessage?: string
  /** CSS-module lookups resolve as `string | undefined`, hence the union. */
  classNames: {
    /** The row wrapper — checkbox and label side by side. */
    row: string | undefined
    box: string | undefined
    label: string | undefined
    error: string | undefined
  }
}) {
  const { state, actions } = useFormContext()
  const { register, setFieldValidity } = actions
  const [checked, setChecked] = useState(false)
  const error = state.errors[name]

  // Seed the gate through the kit's registration ref, exactly like every other
  // required field: `initializeInput` reads the `required` attribute below and
  // marks the control invalid during the commit that attaches the handlers. A
  // passive-effect seed (the first version) armed the gate one flush later —
  // and under load a submit could land in that window, sail through `isReady`,
  // and come back as the schema's generic failure with no inline message.
  // Unchecked stays silently invalid: the message appears when the visitor
  // tries to submit, not the moment the page loads. An optional consent is
  // seeded valid by the same read, so it never blocks.
  //
  // Only the ref is taken from the registration — the kit's own onChange reads
  // `value`, which for a checkbox is "on" regardless of checked state; the
  // handler below drives validity from `checked` instead.
  const { ref } = register(name)

  return (
    <div className={classNames.row}>
      <input
        className={classNames.box}
        type="checkbox"
        id={id}
        name={name}
        ref={ref}
        required={required}
        checked={checked}
        onChange={(event) => {
          const next = event.target.checked
          setChecked(next)
          if (required) {
            setFieldValidity(name, next, next ? '' : (invalidMessage ?? ''))
          }
        }}
      />
      <label className={classNames.label} htmlFor={id}>
        {children}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {error?.state && error.message && (
        <span className={classNames.error} role="alert">
          {error.message}
        </span>
      )}
    </div>
  )
}
