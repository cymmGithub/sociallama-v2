'use client'

import { useLenis } from 'lenis/react'
import { useEffect, useId, useRef, useState } from 'react'
import { ShareRow } from '@/components/ui/share'
import type { LocalizedCareers } from '@/lib/content/zostan-lama'
import { APP_BASE_URL } from '@/lib/env'
import s from './zostan-lama.module.css'

/**
 * Open roles as tab panels — one role visible at a time, driven entirely by the
 * content file's role array, so adding an opening is a content change.
 *
 * Full ARIA tabs semantics: a labelled tablist, `aria-selected` on the active
 * control, `aria-controls`/`aria-labelledby` pairing each control to its panel,
 * and roving tabindex so the group is one tab stop with arrow keys moving
 * inside it (APG "tabs with automatic activation" — the panels are already
 * rendered, so selecting on arrow costs nothing).
 *
 * Clicking a tab does NOT navigate or rewrite the URL (design D2). Each panel
 * carries its own share row instead, built from that panel's role id, so what a
 * recruiter shares is that position's URL no matter which URL the page was
 * entered from or which tab was open first.
 */
export function CareersRoles({
  roles,
  label,
  share,
  rolesBasePath,
  initialRoleId,
}: {
  roles: LocalizedCareers['careersRoles']
  label: LocalizedCareers['careersRolesLabel']
  share: LocalizedCareers['careersShare']
  /** This locale's careers path — each role's URL is `{base}/{id}`. */
  rolesBasePath: string
  /** Set when the page was entered through a position URL (design D1). */
  initialRoleId?: string | undefined
}) {
  // Resolved once: the entry URL chooses the first tab and nothing else. An id
  // the content no longer carries can't reach here (the route 404s first), but
  // falling back to the first role keeps this independent of that.
  const [active, setActive] = useState(() => {
    const index = roles.findIndex((role) => role.id === initialRoleId)
    return index === -1 ? 0 : index
  })
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const landed = useRef(false)

  /*
   * Entry scroll (design D3): a shared link lands on the job, not on the hero
   * above it. Instant, so there is no animated scroll to sit through and
   * nothing for `prefers-reduced-motion` to object to.
   *
   * Runs a frame after mount because the page's entrance animation and Lenis's
   * own setup both land in the first commit. `useLenis()` is empty on that
   * first pass — the provider's layout effect runs after its children's — so
   * the jump goes through the native fallback then and repeats through Lenis
   * the moment the instance arrives, which is when it is marked done.
   */
  useEffect(() => {
    if (!initialRoleId || landed.current) return
    const section = sectionRef.current
    if (!section) return
    if (lenis) landed.current = true

    const frame = requestAnimationFrame(() => {
      // No offset argument: the header clearance is the section's
      // `scroll-margin-top`, which Lenis subtracts itself and `scrollIntoView`
      // honours natively — passing it here as well lands the section a header
      // lower than intended (measured; Lenis 1.3).
      if (lenis) {
        lenis.scrollTo(section, { immediate: true, force: true })
      } else {
        section.scrollIntoView()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [initialRoleId, lenis])

  const move = (index: number) => {
    setActive(index)
    tabRefs.current[index]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = roles.length - 1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      move(active === last ? 0 : active + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      move(active === 0 ? last : active - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      move(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      move(last)
    }
  }

  return (
    <section className={`${s.inner} ${s.roles}`} ref={sectionRef}>
      <div className={s.tabs} role="tablist" aria-label={label}>
        {roles.map((role, index) => (
          <button
            key={role.id}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            className={s.tab}
            type="button"
            role="tab"
            id={`${baseId}-tab-${role.id}`}
            aria-controls={`${baseId}-panel-${role.id}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={onKeyDown}
          >
            {role.title}
          </button>
        ))}
      </div>

      {roles.map((role, index) => (
        <div
          key={role.id}
          id={`${baseId}-panel-${role.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${role.id}`}
          hidden={index !== active}
        >
          <div className={s.panelGrid}>
            {role.blocks.map((block) => (
              <div key={block.head}>
                <h2 className={s.panelHead}>{block.head}</h2>
                <ul className={s.panelList}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Absolute by construction: share intents reject relative paths, and
              the copied link has to survive being pasted anywhere. */}
          <ShareRow
            brandIconClassName={s.shareBrandIcon}
            buttonClassName={s.shareButton}
            className={s.share}
            iconClassName={s.shareIcon}
            labelClassName={s.shareLabel}
            labels={share}
            rowClassName={s.shareRow}
            title={role.title}
            url={`${APP_BASE_URL}${rolesBasePath}/${role.id}`}
          />
        </div>
      ))}
    </section>
  )
}
