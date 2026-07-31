'use client'

import { useEffect } from 'react'

/**
 * Marks the chrome (header/footer, via --color-primary) dark while the careers
 * page is the ACTIVE page. An effect — not a CSS :has() on the page node —
 * because Next 16 keeps the previous segment's DOM mounted (Activity
 * back/forward cache), so "node exists" ≠ "page is active" and a :has() rule
 * leaks the dark chrome onto the next page. Activity runs effect cleanup on
 * deactivation and re-runs effects on reactivation, so this tracks activation
 * exactly. Its own attribute value, not /kontakt's: the rule that reads it
 * lives in this route's module, which is the only sheet loaded here.
 */
export function DarkChrome() {
  useEffect(() => {
    document.documentElement.setAttribute('data-chrome', 'zostan-lama')
    return () => document.documentElement.removeAttribute('data-chrome')
  }, [])
  return null
}
