'use client'

import cn from 'clsx'
import { useEffect, useState } from 'react'
import s from './blur-edge.module.css'

/**
 * Progressive blur pinned to the viewport bottom (Azurio-style, user request
 * 2026-07-13): six stacked `backdrop-filter` layers with doubling blur radii
 * and staggered gradient masks, so content melts into frost as it exits the
 * bottom edge.
 *
 * Gate contract: the blur hides while any `[data-blur-edge-gate]` element is
 * on screen — the hero's client-logos belt must never be frosted at page
 * start (user decision, 2026-07-13). Pages without gate elements show the
 * blur unconditionally. Opacity fades on the layers, not the wrapper: an
 * ancestor's opacity group would become the layers' backdrop root and break
 * backdrop-filter sampling.
 */
export function BlurEdge() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const gates = document.querySelectorAll('[data-blur-edge-gate]')
    if (gates.length === 0) {
      setVisible(true)
      return
    }
    const intersecting = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target)
        else intersecting.delete(entry.target)
      }
      setVisible(intersecting.size === 0)
    })
    for (const gate of gates) observer.observe(gate)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={cn(s.edge, visible && s.isVisible)} aria-hidden="true">
      <div className={s.layer} />
      <div className={s.layer} />
      <div className={s.layer} />
      <div className={s.layer} />
      <div className={s.layer} />
      <div className={s.layer} />
    </div>
  )
}
