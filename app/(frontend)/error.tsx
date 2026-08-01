'use client'

import { Wrapper } from '@/components/layout/wrapper'
import { ErrorView } from '@/components/ui/error-view'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Wrapper theme="cream" className="font-mono">
      <ErrorView
        error={error}
        reset={reset}
        title="Coś poszło nie tak"
        description="Przepraszamy — wystąpił nieoczekiwany błąd po naszej stronie."
        retryLabel="Spróbuj ponownie"
        homeLabel="Wróć na stronę główną"
      />
    </Wrapper>
  )
}
