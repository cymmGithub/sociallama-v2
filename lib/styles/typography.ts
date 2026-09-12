import type { CSSProperties } from 'react'

const fonts = {
  display: '--next-font-display',
  mono: '--next-font-mono', // this should be the variable name defined in fonts.ts
} as const

/*
 * Type roles, extracted from the shipped site on 2026-09-11 (see DESIGN.md).
 * Each value is the most-used member of its cluster, so `type-*` utilities and
 * the CSS modules agree. Sizes are the site's own `clamp()`/rem values, not the
 * Satus viewport-scaled px scale.
 *
 * `h2` is the one Satus default with consumers (four /o-nas headings) and is
 * kept byte-identical; it is a legacy variant, not a role to reuse.
 * `display` and `label` are set uppercase at the call site — the roles carry
 * size, family, weight and rhythm only.
 */
const typography: TypeStyles = {
  h2: {
    'font-family': `var(${fonts.display})`,
    'font-style': 'normal',
    'font-weight': 700,
    'line-height': '80%',
    'letter-spacing': '-0.03em',
    'font-size': { mobile: 32, desktop: 48 },
  },
  'type-display': {
    'font-family': `var(${fonts.display})`,
    'font-style': 'normal',
    'font-weight': 800,
    'line-height': '100%',
    'letter-spacing': '-0.02em',
    'font-size': 'clamp(3.5rem, 14vw, 12rem)',
  },
  'type-title': {
    'font-family': `var(${fonts.display})`,
    'font-style': 'normal',
    'font-weight': 800,
    'line-height': '90%',
    'letter-spacing': '-0.02em',
    'font-size': 'clamp(2.5rem, 7vw, 5rem)',
  },
  'type-heading': {
    'font-family': `var(${fonts.display})`,
    'font-style': 'normal',
    'font-weight': 800,
    'line-height': '105%',
    'letter-spacing': '0em',
    'font-size': 'clamp(1.5rem, 3vw, 2rem)',
  },
  'type-lead': {
    'font-family': `var(${fonts.mono})`,
    'font-style': 'normal',
    'font-weight': 400,
    'line-height': '155%',
    'letter-spacing': '0em',
    'font-size': 'clamp(1rem, 1.5vw, 1.15rem)',
  },
  'type-body': {
    'font-family': `var(${fonts.mono})`,
    'font-style': 'normal',
    'font-weight': 400,
    'line-height': '160%',
    'letter-spacing': '0em',
    'font-size': '1rem',
  },
  'type-small': {
    'font-family': `var(${fonts.mono})`,
    'font-style': 'normal',
    'font-weight': 400,
    'line-height': '150%',
    'letter-spacing': '0em',
    'font-size': '0.875rem',
  },
  'type-caption': {
    'font-family': `var(${fonts.mono})`,
    'font-style': 'normal',
    'font-weight': 400,
    'line-height': '140%',
    'letter-spacing': '0em',
    'font-size': '0.8125rem',
  },
  'type-label': {
    'font-family': `var(${fonts.mono})`,
    'font-style': 'normal',
    'font-weight': 700,
    'line-height': '120%',
    'letter-spacing': '0.08em',
    'font-size': '0.75rem',
  },
} as const

export { fonts, typography }

// UTIL TYPES
type TypeStyles = Record<
  string,
  {
    'font-family': string
    'font-style': CSSProperties['fontStyle']
    'font-weight': CSSProperties['fontWeight']
    'line-height':
      | `${number}%`
      | { mobile: `${number}%`; desktop: `${number}%` }
    'letter-spacing':
      | `${number}em`
      | { mobile: `${number}em`; desktop: `${number}em` }
    'font-feature-settings'?: string
    // A string passes through verbatim, which is how the site's own
    // `clamp()`/rem sizes are expressed; numbers keep the Satus px scaling.
    'font-size': number | string | { mobile: number; desktop: number }
  }
>
