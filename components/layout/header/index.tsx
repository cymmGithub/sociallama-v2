'use client'

import cn from 'clsx'
import { useState } from 'react'
import { Link } from '@/components/ui/link'
import { nav } from '@/lib/content/home'
import s from './header.module.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  return (
    <header className={s.header}>
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

      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
        className={s.toggle}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? '✕' : '≡'}
      </button>

      <nav
        id="site-nav"
        className={cn(s.nav, menuOpen && s.navOpen)}
        aria-label="Główna nawigacja"
      >
        <ul className={s.links}>
          {nav.links.map((link) => (
            <li
              key={link.label}
              className={cn(s.item, link.children && s.hasChildren)}
            >
              <Link className={s.link} href={link.href} onClick={close}>
                {link.label}
              </Link>
              {link.children && (
                <ul className={s.submenu}>
                  {link.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        className={s.subLink}
                        href={child.href}
                        onClick={close}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <Link className={s.cta} href={nav.cta.href} onClick={close}>
          {nav.cta.label}
        </Link>
      </nav>
    </header>
  )
}
