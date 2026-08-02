'use client'

import { Toast as BaseToast } from '@base-ui/react/toast'
import cn from 'clsx'
import { X } from 'lucide-react'
import { type ComponentProps, createContext, type ReactNode, use } from 'react'
import s from './toast.module.css'

/**
 * Toast component built on Base UI for accessible notifications.
 *
 * @example
 * ```tsx
 * // Wrap your app with ToastProvider
 * <Toast.Provider>
 *   <App />
 *   <Toast.Viewport />
 * </Toast.Provider>
 * ```
 *
 * @example
 * ```tsx
 * // Use the toast hook
 * function MyComponent() {
 *   const { toast } = useToast()
 *
 *   return (
 *     <button onClick={() => toast.success('Item saved!')}>
 *       Save
 *     </button>
 *   )
 * }
 * ```
 */

type ToastContextValue = {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = use(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a Toast.Provider')
  }
  return context
}

// Provider
function Provider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider>
      <ToastContextWrapper>{children}</ToastContextWrapper>
    </BaseToast.Provider>
  )
}

function ToastContextWrapper({ children }: { children: ReactNode }) {
  const toastManager = BaseToast.useToastManager()

  const toast = {
    success: (message: string) => {
      toastManager.add({ title: message, type: 'success' })
    },
    error: (message: string) => {
      toastManager.add({ title: message, type: 'error' })
    },
  }

  return (
    <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>
  )
}

// Viewport (where toasts appear)
type ViewportProps = ComponentProps<typeof BaseToast.Viewport> & {
  className?: string
}

function Viewport({ className, ...props }: ViewportProps) {
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className={cn(s.viewport, className)} {...props}>
        <ToastList />
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

// Renders the live toast stack. Base UI's Title/Description read their text
// from the `toast` object, so no children are needed.
function ToastList() {
  const { toasts } = BaseToast.useToastManager()
  return toasts.map((toast) => (
    <BaseToast.Root
      key={toast.id}
      toast={toast}
      className={cn(s.root, toast.type && s[toast.type])}
    >
      <BaseToast.Title className={cn(s.title)} />
      <BaseToast.Close className={cn(s.close)} aria-label="Zamknij">
        <X aria-hidden="true" />
      </BaseToast.Close>
    </BaseToast.Root>
  ))
}

export const Toast = {
  Provider,
  Viewport,
}
