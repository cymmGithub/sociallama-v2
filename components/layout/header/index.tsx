'use client'

import cn from 'clsx'
import { useLenis } from 'lenis/react'
import { Menu, X } from 'lucide-react'
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

// Keep the bar revealed within this many pixels of the top so a fresh load or
// a scroll-to-top always shows it, regardless of the last scroll direction.
const REVEAL_AT_TOP = 80

// Fraction of the footer's height, measured up from the page bottom, that marks
// the "footer zone": once scroll enters it the bar force-reveals and recolors to
// the footer's dark palette (user request). main's bottom edge equals the
// footer's top on every breakpoint, so distance-from-bottom detects it uniformly.
const FOOTER_ZONE_FRACTION = 0.6

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [overFooter, setOverFooter] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const lenis = useLenis()

  const close = () => setMenuOpen(false)

  // Scroll position below which the bar stays revealed regardless of scroll
  // direction. Defaults to a sliver below the top; on the home page it extends
  // to the hero scrub track's pin-release point so the bar never hides while
  // the hero clip is scrubbing (user request 2026-07-15).
  const revealUntilRef = useRef(REVEAL_AT_TOP)

  // Distance-from-bottom (px) below which the bar enters the footer zone.
  const footerZoneRef = useRef(0)

  useEffect(() => {
    const measure = () => {
      const footer = document.querySelector<HTMLElement>('footer')
      footerZoneRef.current = footer
        ? footer.offsetHeight * FOOTER_ZONE_FRACTION
        : 0

      const track = document.querySelector<HTMLElement>('[data-hero-track]')
      if (!track) {
        revealUntilRef.current = REVEAL_AT_TOP
        return
      }
      // Pin releases when the track's bottom reaches the viewport bottom — the
      // scroll offset where the scrubbed hero unpins and content starts moving.
      const top = track.getBoundingClientRect().top + window.scrollY
      const release = top + track.offsetHeight - window.innerHeight
      revealUntilRef.current = Math.max(REVEAL_AT_TOP, release)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Hide-on-scroll-down, reveal-on-scroll-up. Only act on an explicit Lenis
  // direction — leaving state untouched on 0 (at rest) stops the bar popping
  // back in when a downward scroll pauses. The menu-open override lives in the
  // render, since lenis.stop() freezes this callback while the overlay is open.
  useLenis((instance) => {
    // Footer zone: force the bar in (overriding hide-on-scroll-down) and flag it
    // so the render recolors it to the footer's dark palette.
    const max = document.documentElement.scrollHeight - window.innerHeight
    const inFooterZone = max - instance.scroll <= footerZoneRef.current
    setOverFooter(inFooterZone)
    if (inFooterZone) {
      setHidden(false)
      return
    }

    if (instance.scroll <= revealUntilRef.current) {
      setHidden(false)
      return
    }
    if (instance.direction === 1) setHidden(true)
    else if (instance.direction === -1) setHidden(false)
  }, [])

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
      <header
        className={cn(s.header, hidden && !menuOpen && s.headerHidden)}
        data-over-footer={overFooter && !menuOpen ? '' : undefined}
        {...(menuOpen && { 'data-theme': 'cream' })}
      >
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
              {menuOpen ? <X /> : <Menu />}
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
