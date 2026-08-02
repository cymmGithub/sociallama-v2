/**
 * The brand's social profiles — one locale-invariant list.
 *
 * Kept out of `home.ts` on purpose: that module value-imports the industry
 * copy, so every `'use client'` file that only wanted the icon row used to drag
 * the whole content graph into the shared bundle.
 */

export interface SocialLink {
  label: string
  href: string
  /** Path to the brand icon svg under /assets. */
  icon: string
}

// Canonical, ordered social set — rendered identically everywhere social icons
// appear (header overlay, footer, hero, o-nas hero). Order is:
// Facebook, Instagram, LinkedIn, TikTok, X, YouTube, Pinterest. Real profile
// destinations — no `#` placeholders. External http(s) hrefs make <Link> open a
// new tab with rel="noopener noreferrer" automatically (see components/ui/link).
export const socials: SocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/agencjasociallama/',
    icon: '/assets/icon-facebook.svg',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/social.lama/',
    icon: '/assets/icon-instagram.svg',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/sociallama/',
    icon: '/assets/icon-linkedin.svg',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@social_lama',
    icon: '/assets/icon-tiktok.svg',
  },
  {
    label: 'X',
    href: 'https://x.com/SocialLamaPL',
    icon: '/assets/icon-x.svg',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@GOODONEGROUP',
    icon: '/assets/icon-youtube.svg',
  },
  {
    label: 'Pinterest',
    href: 'https://pl.pinterest.com/social__lama/',
    icon: '/assets/icon-pinterest.svg',
  },
]
