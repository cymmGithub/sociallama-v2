/**
 * The brand's social profiles — one locale-invariant list.
 *
 * Kept out of `home.ts` on purpose: that module value-imports the industry
 * copy, so every `'use client'` file that only wanted the icon row used to drag
 * the whole content graph into the shared bundle.
 */

/** Glyph keys for the inline `SocialGlyph` component (components/ui). */
export type SocialIconName =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'x'
  | 'youtube'
  | 'pinterest'

export interface SocialLink {
  label: string
  href: string
  /** Brand glyph rendered by `SocialGlyph`. */
  icon: SocialIconName
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
    icon: 'facebook',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/social.lama/',
    icon: 'instagram',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/sociallama/',
    icon: 'linkedin',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@social_lama',
    icon: 'tiktok',
  },
  {
    label: 'X',
    href: 'https://x.com/SocialLamaPL',
    icon: 'x',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@GOODONEGROUP',
    icon: 'youtube',
  },
  {
    label: 'Pinterest',
    href: 'https://pl.pinterest.com/social__lama/',
    icon: 'pinterest',
  },
]
