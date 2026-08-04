// Type augmentations and module declarations

// Bun globals (`Bun`, `bun:test`, etc.). `@types/bun` isn't auto-included under
// TypeScript 6's resolution (it re-exports `bun-types` via a triple-slash
// reference with an empty `main`), so reference it explicitly here.
/// <reference types="bun" />

// React canary API surface (ViewTransition). Next's App Router vendors a React
// canary at runtime, so the component exists — but @types/react only declares
// it behind the canary entrypoint.
/// <reference types="react/canary" />

// React CSS custom properties support
import 'react'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

// SVGs are loaded as React components via @svgr/webpack (see next.config.ts)
declare module '*.svg' {
  import type { FC, SVGProps } from 'react'

  const content: FC<SVGProps<SVGSVGElement>>
  export default content
}

// Global window extensions
declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (options: {
          portalId?: string
          formId: string
          target: string
          submitButtonClass?: string
          errorMessageClass?: string
          cssClass?: string
          onFormReady?: () => void
          onFormSubmitted?: () => void
        }) => void
      }
    }
    THEATRE_PROJECT_ID?: string
  }
}
