'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { useFormContext } from '@/components/ui/form'

/**
 * Cloudflare Turnstile widget. Explicit-render so the widget re-mounts cleanly
 * when the form kit re-keys itself after a successful submit. Turnstile injects
 * a hidden input named `cf-turnstile-response` inside the rendered container,
 * which lives within the <form>, so its token rides along in the FormData —
 * exactly what `validateFormWithTurnstile` reads server-side.
 *
 * Must be rendered inside a `<Form>`: the hidden token input has to sit within
 * the form element to be submitted at all, and the failed-submit reset below
 * reads the form kit's context.
 *
 * Rendered only when a site key is configured; without it the server verifier
 * fails open in development, so the form still submits locally.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; theme?: 'auto' | 'light' | 'dark' }
      ) => string
      remove: (id: string) => void
      reset: (id: string) => void
    }
  }
}

export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const idRef = useRef<string | null>(null)
  const [ready, setReady] = useState(false)
  const { state } = useFormContext()
  const { formState } = state

  useEffect(() => {
    if (!(ready && ref.current && window.turnstile)) return
    const id = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      theme: 'dark',
    })
    idRef.current = id
    return () => {
      idRef.current = null
      window.turnstile?.remove(id)
    }
  }, [ready, siteKey])

  // Tokens are single-use and expire after 300s, but the form only re-keys —
  // remounting this widget with a fresh challenge — after a *successful*
  // submit. A failed one has already spent the token, so on retry the same
  // token goes back to siteverify, which rejects it as a duplicate: the visitor
  // gets a security error they cannot clear without reloading the page. Reset
  // on every server-side failure so the retry carries a fresh token.
  //
  // Keyed on the `formState` object, not its status: two consecutive failures
  // share the same status code, and a status-keyed effect would not re-run for
  // the second one. Each submit returns a new state object.
  useEffect(() => {
    const failed = (formState?.status ?? 0) >= 400
    if (!(failed && idRef.current)) return
    window.turnstile?.reset(idRef.current)
  }, [formState])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onReady={() => setReady(true)}
      />
      <div ref={ref} />
    </>
  )
}
