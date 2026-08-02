'use client'

import { Wrapper } from '@/components/layout/wrapper'
import { ErrorView } from '@/components/ui/error-view'
import { errorView } from '@/lib/content/site'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Wrapper theme="cream" className="font-mono">
      <ErrorView error={error} reset={reset} {...errorView.boundary} />
    </Wrapper>
  )
}
