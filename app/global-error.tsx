'use client'

import { Wrapper } from '@/components/layout/wrapper'
import { ErrorView } from '@/components/ui/error-view'

// global-error.tsx replaces the root layout when a root-level error occurs,
// so it must render its own <html> and <body>. Without them Next.js renders
// broken, unstyled HTML at the worst possible moment for the user.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // Polish, matching the site's primary locale (x-default): global-error
    // renders outside the router, so the visitor's locale is unknowable here.
    <html lang="pl">
      <body>
        <Wrapper theme="cream" className="font-mono">
          <ErrorView
            error={error}
            reset={reset}
            title="Błąd krytyczny"
            description="Wystąpił krytyczny błąd. Odśwież stronę, a jeśli problem się powtarza — daj nam znać."
            retryLabel="Spróbuj ponownie"
            homeLabel="Wróć na stronę główną"
          />
        </Wrapper>
      </body>
    </html>
  )
}
