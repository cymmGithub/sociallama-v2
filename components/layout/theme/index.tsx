'use client'

import { useEffect } from 'react'
import type { ThemeName } from '@/styles/config'

/**
 * Applies the route's theme to `<html data-theme>`.
 *
 * Renders its children untouched — the theme is a document-level attribute,
 * not a wrapper element.
 */
export function Theme({
  children,
  theme,
}: {
  children: React.ReactNode
  theme: ThemeName
}) {
  // NOTE: `pathname` must NOT be a dependency here. Next 16 keeps the
  // previous page mounted (Activity back/forward cache), and a pathname dep
  // makes the HIDDEN page's Theme re-fire on navigation too — racing the
  // incoming page's effect for the html attribute, so the losing order left
  // the old page's theme stuck (seen as plum-deep chrome on the homepage
  // after visiting /kontakt). Activity re-runs a shown tree's effects on
  // every reactivation regardless of deps, so the visible page always
  // re-asserts its theme without the dep.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // NOTE: the theme is applied to <html> via the effect above (and a
  // server-rendered default in the root layout for no-flash initial paint).
  // We intentionally do NOT render an inline <script> here: scripts inside
  // client components never execute on client navigation and trigger a React
  // "Encountered a script tag while rendering" error.
  return children
}
