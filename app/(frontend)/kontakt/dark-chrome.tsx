'use client'

import { useEffect } from 'react'

/**
 * Marks the chrome (header/footer, via --color-primary) dark while /kontakt is
 * the ACTIVE page. An effect — not a CSS :has() on the page node — because
 * Next 16 keeps the previous segment's DOM mounted (Activity back/forward
 * cache), so "node exists" ≠ "page is active" and a :has() rule leaks the dark
 * chrome onto the next page. Activity runs effect cleanup on deactivation and
 * re-runs effects on reactivation, so this attribute tracks activation exactly.
 */
export function DarkChrome() {
  useEffect(() => {
    document.documentElement.setAttribute('data-chrome', 'kontakt')
    return () => document.documentElement.removeAttribute('data-chrome')
  }, [])
  return null
}
