'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

/**
 * Cloudflare Turnstile widget. Explicit-render so the widget re-mounts cleanly
 * when the form kit re-keys itself after a successful submit. Turnstile injects
 * a hidden input named `cf-turnstile-response` inside the rendered container,
 * which lives within the <form>, so its token rides along in the FormData —
 * exactly what `validateFormWithTurnstile` reads server-side.
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
    }
  }
}

export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!(ready && ref.current && window.turnstile)) return
    const id = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      theme: 'dark',
    })
    return () => window.turnstile?.remove(id)
  }, [ready, siteKey])

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
