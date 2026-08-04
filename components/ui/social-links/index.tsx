/**
 * The brand's social row — the canonical `socials` list rendered as a `<ul>`
 * of glyph links. One structure for every surface (footer, homepage hero,
 * o-nas hero); the surfaces keep their own look via the three class hooks,
 * so size and hover treatment stay in each caller's CSS module.
 */
import { Link } from '@/components/ui/link'
import { SocialGlyph } from '@/components/ui/social-glyph'
import { socials } from '@/lib/content/socials'

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
            className={linkClassName}
            href={social.href}
            aria-label={social.label}
          >
            <SocialGlyph name={social.icon} className={iconClassName} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
