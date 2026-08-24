/**
 * The brand's social row — the canonical `socials` list rendered as a `<ul>`
 * of glyph links. One structure for every surface (footer, homepage hero,
 * o-nas hero); the surfaces keep their own size and resting look via the
 * three class hooks, while the brand-colour hover lives here (see the module
 * CSS) so it is identical everywhere.
 */
import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { SocialGlyph } from '@/components/ui/social-glyph'
import { socials } from '@/lib/content/socials'
import s from './social-links.module.css'

export function SocialLinks({
  className,
  linkClassName,
  iconClassName,
}: {
  className?: string | undefined
  linkClassName?: string | undefined
  iconClassName?: string | undefined
}) {
  return (
    <ul className={className}>
      {socials.map((social) => (
        <li key={social.label}>
          <Link
            className={cn(s.link, linkClassName)}
            href={social.href}
            aria-label={social.label}
            data-social={social.icon}
          >
            <SocialGlyph
              name={social.icon}
              className={cn(s.icon, iconClassName)}
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
