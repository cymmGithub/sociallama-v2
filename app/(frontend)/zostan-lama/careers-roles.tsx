'use client'

import { useId, useRef, useState } from 'react'
import {
  careersRoles as careersRolesDefault,
  careersRolesLabel as careersRolesLabelDefault,
  type LocalizedCareers,
} from '@/lib/content/zostan-lama'
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
 */
export function CareersRoles({
  roles = careersRolesDefault,
  label = careersRolesLabelDefault,
}: {
  roles?: LocalizedCareers['careersRoles']
  label?: LocalizedCareers['careersRolesLabel']
}) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

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
    <section className={`${s.inner} ${s.roles}`}>
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
        </div>
      ))}
    </section>
  )
}
