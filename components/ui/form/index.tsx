'use client'

import cn from 'clsx'
import { createContext, use, useEffect, useMemo, useState } from 'react'
import { mutate } from '@/utils/raf'
import s from './form.module.css'
import { useForm } from './hook'
import type {
  FormAction,
  FormContextStandard,
  FormProps,
  FormState,
  SubmitButtonProps,
} from './types'

/**
 * Form component with built-in state management and server action support.
 *
 * @example
 * ```tsx
 * // Basic usage with any server action
 * async function submitAction(prevState: FormState | null, formData: FormData) {
 *   'use server'
 *   const email = formData.get('email')
 *   // Process form...
 *   return { status: 200, message: 'Success!' }
 * }
 *
 * <Form action={submitAction}>
 *   <Input id="email" type="email" label="Email" />
 *   <SubmitButton>Subscribe</SubmitButton>
 * </Form>
 * ```
 *
 * @example
 * ```tsx
 * // With success callback
 * <Form
 *   action={contactAction}
 *   onSuccess={(state) => console.log('Submitted:', state)}
 *   onError={(state) => console.log('Error:', state)}
 * >
 *   {children}
 * </Form>
 * ```
 */

// Context with standard { state, actions } structure
const FormContext = createContext<FormContextStandard | null>(null)

/**
 * Hook to access the form context with standard structure.
 *
 * @example
 * ```tsx
 * const { state, actions } = useFormContext()
 * const { isPending, formState, errors } = state
 * const { register, setFieldValidity } = actions
 * ```
 */
export function useFormContext(): FormContextStandard {
  const context = use(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a Form')
  }
  return context
}

// Main Form component
export function Form<T = unknown>({
  children,
  action,
  formId,
  onSuccess,
  onError,
  invalidMessage,
  className,
  ...props
}: FormProps<T>) {
  const [key, setKey] = useState<string | null>(null)

  const {
    formAction,
    onSubmit,
    formState,
    isPending,
    isReady,
    isActive,
    isValid,
    errors,
    register,
    setFieldValidity,
  } = useForm({
    action: action as FormAction<unknown>,
    ...(formId && { formId }),
    ...(invalidMessage && { invalidMessage }),
    initialState: null,
  })

  // Handle success/error callbacks
  useEffect(() => {
    if (!formState) return

    let resetTimer: ReturnType<typeof setTimeout> | undefined
    if (formState.status === 200) {
      onSuccess?.(formState as FormState<T>)
      // Reset form after success
      mutate(() => {
        resetTimer = setTimeout(() => {
          setKey(crypto.randomUUID())
        }, 2000)
      })
    } else if (formState.status >= 400) {
      onError?.(formState as FormState<T>)
    }

    return () => {
      if (resetTimer) clearTimeout(resetTimer)
    }
  }, [formState, onSuccess, onError])

  // Memoized so context consumers re-render when form state changes, not on
  // every Form render.
  const contextValue: FormContextStandard = useMemo(
    () => ({
      state: {
        formState,
        isPending,
        isReady,
        isActive,
        isValid,
        errors,
      },
      actions: {
        register,
        setFieldValidity,
      },
    }),
    [
      formState,
      isPending,
      isReady,
      isActive,
      isValid,
      errors,
      register,
      setFieldValidity,
    ]
  )

  return (
    <FormContext.Provider value={contextValue}>
      <form
        key={key}
        className={cn(s.form, className)}
        action={formAction}
        onSubmit={onSubmit}
        // Custom validation owns error display (onSubmit reveals per-field
        // messages when the form isn't ready); suppress the native bubbles so
        // the two don't compete.
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

// Submit Button
export function SubmitButton({
  className,
  children,
  defaultText = 'Submit',
  pendingText = 'Submitting...',
  successText = 'Success!',
  errorText = 'Error',
  icon,
  ...props
}: SubmitButtonProps) {
  const { state } = useFormContext()
  const { isPending, formState } = state
  const isSuccess = formState?.status === 200
  const isError = formState?.status && formState.status >= 400

  let buttonText = children?.toString() ?? defaultText
  if (isSuccess) {
    buttonText = successText
  } else if (isError) {
    buttonText = errorText
  } else if (isPending) {
    buttonText = pendingText
  }

  return (
    <button
      type="submit"
      // Stays enabled while the form is incomplete: clicking submits, and the
      // form's onSubmit reveals per-field errors instead of the click silently
      // doing nothing (a disabled submit is an anti-pattern). Only a request
      // already in flight disables it, to prevent a double submit.
      aria-disabled={isPending}
      onClick={(e) => {
        if (isPending) {
          e.preventDefault()
        }
      }}
      className={cn(
        className,
        s.submit,
        isPending && s.pending,
        isSuccess && s.submitted,
        isError && s.error
      )}
      {...props}
    >
      <span>{buttonText}</span>
      {icon}
    </button>
  )
}

// Re-export types
export type {
  FormAction,
  FormContextActions,
  FormContextStandard,
  FormContextState,
  FormState,
} from './types'
