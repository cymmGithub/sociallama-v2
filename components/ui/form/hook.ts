import {
  type ChangeEventHandler,
  type FocusEventHandler,
  type FormEvent,
  useActionState,
  useCallback,
  useRef,
  useState,
  useTransition,
} from 'react'
import { emailSchema, phoneSchema, zodToValidator } from '@/utils/validation'
import type {
  FieldError,
  FormAction,
  FormState,
  UseFormOptions,
  UseFormReturn,
} from './types'

/**
 * Form hook that integrates with React 19's useActionState for server actions.
 *
 * @example
 * ```tsx
 * const { formAction, onSubmit, register, isPending, isReady, errors } = useForm({
 *   action: myServerAction,
 * })
 *
 * return (
 *   <form action={formAction} onSubmit={onSubmit}>
 *     <input {...register('email')} name="email" />
 *     <button disabled={!isReady || isPending}>Submit</button>
 *   </form>
 * )
 * ```
 */
export function useForm<T = unknown>({
  action,
  initialState = null,
  onBlur = false,
  formId = '',
  invalidMessage = (name: string) => `Invalid ${name}`,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [formState, formAction] = useActionState(
    action as FormAction<unknown>,
    initialState as FormState<unknown> | null
  )
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState<Record<string, boolean>>({})
  const [isValid, setIsValid] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, FieldError>>({})
  const inputsRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({})
  // Fields already seeded by initializeInput. Ref callbacks still re-fire on
  // remounts (StrictMode double-invoke, form reset via key); guarding on the
  // field name initializes exactly once per form instance.
  const initializedRefs = useRef<Set<string>>(new Set())

  // Initialize state for a field when it first registers.
  // Hidden fields are always auto-valid. Otherwise, seed by requiredness:
  // required fields start invalid (must be filled to become valid), optional
  // fields start valid (an untouched optional field must not block isReady).
  function initializeInput(
    name: string,
    input: HTMLInputElement | HTMLTextAreaElement | null
  ) {
    setIsActive((prev) => ({ ...prev, [name]: false }))
    setIsValid((prev) => {
      const isHidden =
        input instanceof HTMLInputElement && input.type === 'hidden'
      const isRequired = input?.required ?? false
      return { ...prev, [name]: isHidden || !isRequired }
    })
    setErrors((prev) => ({
      ...prev,
      [name]: { state: false, message: '' },
    }))
  }

  // Reveal errors on every currently-invalid field so a blocked submit
  // (Enter key, or a click that slips through) explains itself instead of
  // silently doing nothing.
  function revealErrorsForInvalidFields() {
    setErrors((prev) => {
      const next = { ...prev }
      for (const [name, valid] of Object.entries(isValid)) {
        if (valid) continue
        next[name] = { state: true, message: invalidMessage(name) }
      }
      return next
    })
  }

  const isReady =
    Object.values(isValid).length > 0 &&
    Object.values(isValid).every(Boolean) &&
    Object.values(errors).every(({ state }) => !state)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Enter-to-submit must respect the same gate as the SubmitButton.
    // Server-side Zod validation remains the authoritative gate either way.
    if (!isReady) {
      revealErrorsForInvalidFields()
      // Move the user to the first missing/invalid field (its inline error is
      // now visible). Registration order matches DOM order, so the first
      // invalid key is the topmost field.
      const firstInvalid = Object.keys(isValid).find((name) => !isValid[name])
      const el = firstInvalid ? inputsRefs.current[firstInvalid] : null
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.focus({ preventScroll: true })
      return
    }

    const formData = new FormData(event.currentTarget)
    if (formId) {
      formData.append('formId', formId)
    }

    startTransition(async () => {
      await formAction(formData)
    })
  }

  function setToActiveInput(value: string, name: string) {
    setIsActive((prev) => ({ ...prev, [name]: value.length > 0 }))
  }

  function validate(value: string, name: string) {
    const element = inputsRefs.current[name]
    if (!element) return

    const elementType =
      element instanceof HTMLInputElement ? element.type : 'textarea'
    const validator = resolveValidator(validators, {
      name: element.name,
      id: element.id,
      type: elementType,
    })

    const isRequired = element.required
    let isValidValue: boolean

    if (validator) {
      isValidValue = value === '' ? false : validator(value)
    } else {
      isValidValue = value !== '' || !isRequired
    }

    setIsValid((prev) => ({ ...prev, [name]: isValidValue }))
    setErrors((prev) => ({
      ...prev,
      [name]: {
        state: !isValidValue && value !== '',
        message: isValidValue ? '' : invalidMessage(name),
      },
    }))
  }

  // Registrations are memoized per field name so the callback ref (and the
  // change/blur handlers) keep a stable identity across renders — React
  // otherwise detaches (node = null) and re-attaches every field's ref on
  // every render. The closures read the latest logic through handlersRef so
  // they never go stale.
  const registrationsRef = useRef<
    Record<string, ReturnType<UseFormReturn['register']>>
  >({})
  const handlersRef = useRef({
    initializeInput,
    setToActiveInput,
    validate,
    onBlur,
  })
  handlersRef.current = { initializeInput, setToActiveInput, validate, onBlur }

  const register = useCallback((name: string) => {
    const existing = registrationsRef.current[name]
    if (existing) return existing

    const registration = {
      ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        inputsRefs.current[name] = node
        if (node && !initializedRefs.current.has(name)) {
          initializedRefs.current.add(name)
          handlersRef.current.initializeInput(name, node)
        }
      },
      onChange: ({
        target,
      }: Parameters<
        ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
      >[0]) => {
        handlersRef.current.setToActiveInput(target.value, name)
        if (!handlersRef.current.onBlur) {
          handlersRef.current.validate(target.value, name)
        }
      },
      onBlur: ({
        target,
      }: Parameters<
        FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
      >[0]) => {
        if (handlersRef.current.onBlur) {
          handlersRef.current.validate(target.value, name)
        }
      },
    }
    registrationsRef.current[name] = registration
    return registration
  }, [])

  return {
    formState: formState as FormState<T> | null,
    formAction,
    onSubmit,
    register,
    isActive,
    isValid,
    isPending,
    isReady,
    errors,
  }
}

// Built-in validators (uses same Zod schemas as server-side validation)
const validators: Record<string, (value: string) => boolean> = {
  email: zodToValidator(emailSchema),
  phone: zodToValidator(phoneSchema),
}

// Allow extending validators
export function addValidator(id: string, fn: (value: string) => boolean) {
  validators[id] = fn
}

/**
 * Pure helper: resolves the best matching validator for a given element.
 * Exported for testing and custom form integrations.
 *
 * Priority: name → id → elementType
 */
export function resolveValidator(
  validatorMap: Record<string, (value: string) => boolean>,
  element: { name: string; id: string; type: string }
): ((value: string) => boolean) | undefined {
  const byName = element.name ? validatorMap[element.name] : undefined
  const byId = element.id ? validatorMap[element.id] : undefined
  return byName ?? byId ?? validatorMap[element.type]
}
