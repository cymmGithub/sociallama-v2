'use client'

import { ArrowRight, CornerDownRight } from 'lucide-react'
import { ConsentSettingsLink } from '@/components/consent/consent-settings-link'
import { useChrome } from '@/components/layout/chrome-provider'
import { LocaleToggle } from '@/components/layout/locale-toggle'
import { Link } from '@/components/ui/link'
import { SocialLinks } from '@/components/ui/social-links'
import { footerWordmarkPath } from '@/lib/wordmark-footer'
import s from './footer.module.css'

export function Footer() {
  const { footer } = useChrome().chrome
  return (
    <footer className={s.footer} id="kontakt" data-site-footer>
      {/* Sign-off wordmark — the last brand beat. A single merged-outline path
          (glyphs boolean-unioned in lib/scripts/gen-wordmark.py) so the tight
          tracking has no crossing/doubled strokes where letters overlap; plain
          <text> stroked each glyph separately and looked sloppy. non-scaling-
          stroke keeps the outline a crisp constant weight at any width. */}
      <svg
        className={s.wordmark}
        viewBox={footerWordmarkPath.viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={footer.wordmark}
      >
        <path d={footerWordmarkPath.d} vectorEffect="non-scaling-stroke" />
      </svg>

      <div className={s.body}>
        <div className={s.invite}>
          <CornerDownRight className={s.arrow} aria-hidden="true" />
          <p className={s.headline}>{footer.headline}</p>
          <Link className={s.cta} href={footer.cta.href}>
            {footer.cta.label}
            <ArrowRight className={s.ctaIcon} aria-hidden="true" />
          </Link>
        </div>

        {footer.columns.map((column) => (
          <nav
            key={column.title}
            className={s.column}
            aria-label={column.title}
          >
            <p className={s.columnTitle}>{column.title}</p>
            <ul
              className={s.links}
              data-cols={column.links.length >= 9 ? '2' : undefined}
            >
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link className={s.link} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className={s.column}>
          <p className={s.columnTitle}>{footer.contactTitle}</p>
          <ul className={s.contact}>
            <li>
              <Link className={s.link} href={`tel:${footer.contact.phone}`}>
                {footer.contact.phone}
              </Link>
            </li>
            <li>
              <Link className={s.link} href={`mailto:${footer.contact.email}`}>
                {footer.contact.email}
              </Link>
            </li>
            {footer.contact.addresses.map((address) => (
              <li key={address} className={s.address}>
                {address}
              </li>
            ))}
          </ul>

          <SocialLinks
            className={s.socials}
            linkClassName={s.social}
            iconClassName={s.socialIcon}
          />
        </div>
      </div>

      <div className={s.bottom}>
        <ul className={s.legal}>
          {footer.legal.map((item) => (
            <li key={item.label}>
              <Link className={s.legalLink} href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
          {/* Withdrawal control. A button, not a link — it opens the consent
              panel rather than navigating, and it must be reachable from every
              page, which is what puts it in the footer rather than the policy. */}
          <li>
            <ConsentSettingsLink className={s.legalLink} />
          </li>
        </ul>
        <p className={s.copyright}>{footer.copyright}</p>
        <LocaleToggle className={s.locale} linkClassName={s.legalLink} />
      </div>
    </footer>
  )
}
