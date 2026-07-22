'use client'

import { Wrapper } from '@/components/layout/wrapper'
import { ErrorView } from '@/components/ui/error-view'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/** English error boundary for the `(frontend-en)` tree (mirrors the PL group). */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Wrapper theme="cream" className="font-mono">
      <ErrorView error={error} reset={reset} />
    </Wrapper>
  )
}
