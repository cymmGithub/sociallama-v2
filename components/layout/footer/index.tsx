import { Link } from '@/components/ui/link'
import { footer, socials } from '@/lib/content/home'
import s from './footer.module.css'

export function Footer() {
  return (
    <footer className={s.footer} data-theme="plum-deep" id="kontakt">
      <div className={s.top}>
        <div className={s.brand}>
          <span
            aria-hidden="true"
            className={s.logo}
            style={{
              maskImage: `url(${footer.logo})`,
              WebkitMaskImage: `url(${footer.logo})`,
            }}
          />
          <p className={s.headline}>{footer.headline}</p>
        </div>

        <nav className={s.columns} aria-label="Stopka">
          {footer.columns.map((column) => (
            <div key={column.title} className={s.column}>
              <p className={s.columnTitle}>{column.title}</p>
              <ul className={s.columnLinks}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link className={s.link} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={s.column}>
            <p className={s.columnTitle}>KONTAKT</p>
            <ul className={s.contact}>
              <li>
                <Link className={s.link} href={`tel:${footer.contact.phone}`}>
                  {footer.contact.phone}
                </Link>
              </li>
              <li>
                <Link
                  className={s.link}
                  href={`mailto:${footer.contact.email}`}
                >
                  {footer.contact.email}
                </Link>
              </li>
              <li className={s.address}>{footer.contact.address}</li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={s.bottom}>
        <ul className={s.socials}>
          {socials.map((social) => (
            <li key={social.label}>
              <Link
                className={s.social}
                href={social.href}
                aria-label={social.label}
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

        <p className={s.copyright}>{footer.copyright}</p>

        <ul className={s.legal}>
          {footer.legal.map((item) => (
            <li key={item.label}>
              <Link className={s.legalLink} href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
