'use client'

import cn from 'clsx'
import { useLenis } from 'lenis/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/components/ui/link'
import { menu, nav, socials } from '@/lib/content/home'
import s from './header.module.css'

// Top-to-bottom cascade order for the overlay content (--i drives each node's
// transition-delay): column label, its items, next column, then the utility row.
const columnOffsets: number[] = []
let staggerCursor = 0
for (const column of menu.columns) {
  columnOffsets.push(staggerCursor)
  staggerCursor += 1 + column.items.length
}
const utilityStaggerIndex = staggerCursor

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const lenis = useLenis()

  const close = () => setMenuOpen(false)

  // While the overlay is open: lock scroll (Lenis + the html.overflow-hidden
  // rule in global.css) and close on Escape. Cleanup restores scroll and
  // returns focus to the Menu toggle.
  useEffect(() => {
    if (!menuOpen) return

    lenis?.stop()
    document.documentElement.classList.add('overflow-hidden')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.documentElement.classList.remove('overflow-hidden')
      lenis?.start()
      toggleRef.current?.focus()
    }
  }, [menuOpen, lenis])

  return (
    <>
      {/* The bar adopts the cream theme while the overlay is open so its
          chapter-tinted elements stay legible above the cream panel. */}
      <header className={s.header} {...(menuOpen && { 'data-theme': 'cream' })}>
        <Link
          className={s.logo}
          href="/"
          aria-label={nav.logoAlt}
          onClick={close}
        >
          <span
            aria-hidden="true"
            className={s.logoMark}
            style={{
              maskImage: `url(${nav.logo})`,
              WebkitMaskImage: `url(${nav.logo})`,
            }}
          />
        </Link>

        <div className={s.actions}>
          <Link className={s.cta} href={nav.cta.href} onClick={close}>
            <span className="desktop-only">{nav.cta.label}</span>
            <span className="mobile-only">{nav.cta.labelShort}</span>
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className={s.toggle}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {nav.menuLabel}
            <span aria-hidden="true" className={s.toggleIcon}>
              {menuOpen ? '✕' : '≡'}
            </span>
          </button>
        </div>
      </header>

      {/* Full-viewport menu overlay — fixed cream theme regardless of the
          scroll chapter (design D9). Always mounted; inert while closed. */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-theme="cream"
        inert={!menuOpen}
        className={cn(s.overlay, menuOpen && s.overlayOpen)}
      >
        <div className={s.overlayInner}>
          <nav aria-label="Główna nawigacja" className={s.columns}>
            {menu.columns.map((column, columnIndex) => (
              <div key={column.label} className={s.column}>
                <p
                  className={cn(s.columnLabel, s.stagger)}
                  style={{ '--i': columnOffsets[columnIndex] ?? 0 }}
                >
                  {column.label}
                </p>
                <ul className={s.columnItems}>
                  {column.items.map((item, itemIndex) => (
                    <li
                      key={item.label}
                      className={s.stagger}
                      style={{
                        '--i':
                          (columnOffsets[columnIndex] ?? 0) + 1 + itemIndex,
                      }}
                    >
                      <Link
                        className={s.menuLink}
                        href={item.href}
                        onClick={close}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div
            className={cn(s.utility, s.stagger)}
            style={{ '--i': utilityStaggerIndex }}
          >
            <ul className={s.utilityLinks}>
              {menu.utility.map((item) => (
                <li key={item.label}>
                  <Link
                    className={s.utilityLink}
                    href={item.href}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className={s.socials}>
              {socials.map((social) => (
                <li key={social.label}>
                  <Link
                    className={s.social}
                    href={social.href}
                    aria-label={social.label}
                    onClick={close}
                  >
                    <span
                      aria-hidden="true"
                      className={s.socialIcon}
                      style={{
                        maskImage: `url(${social.icon})`,
                        WebkitMaskImage: `url(${social.icon})`,
                      }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
