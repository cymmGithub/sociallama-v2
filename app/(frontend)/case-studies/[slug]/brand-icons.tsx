/**
 * Full-color official brand marks for the case-study result platforms — the
 * real logos rather than the plum CMS glyphs. Keyed by the normalized platform
 * label `case-study-scoreboard.ts` produces; `BrandIcon` renders nothing for a
 * label outside that set, so the caller can fall back to the CMS logo.
 *
 * Shipped as a sprite: the paths are defined once per page by
 * `BrandIconSprite`, and every mark is a `<use>` pointing at one of them. The
 * hub renders 220 marks — a card lead, a ledger row's leads and its platform
 * strip, per study — and inlining each one cost 933 DOM nodes and 140 KB of
 * markup, 29% of that page's entire node count. As `<use>` elements they are
 * ~220 nodes and the five definitions.
 *
 * The sprite also retires the `useId` the Instagram gradient needed. That fix
 * was for DUPLICATE ids — 27 copies of `#ig-gradient`, where `url(#…)` resolves
 * to the first in the document, which after the grid/ledger toggle shipped was
 * whichever copy sat in the `display: none` pane. One definition cannot have
 * that problem. The sprite is positioned off-canvas rather than `display: none`
 * precisely so its paint servers stay live.
 */

import type { PlatformKey } from '@/lib/payload/case-study-scoreboard'

/** Sprite-local ids. Namespaced so nothing else on the page can collide. */
const SYMBOL_ID: Record<PlatformKey, string> = {
  tiktok: 'brand-tiktok',
  youtube: 'brand-youtube',
  instagram: 'brand-instagram',
  facebook: 'brand-facebook',
  linkedin: 'brand-linkedin',
}

function TikTok() {
  // Classic offset-channel glitch: cyan up-left, magenta down-right, black on top.
  const note =
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
  return (
    <symbol id={SYMBOL_ID.tiktok} viewBox="0 0 24 24">
      <path fill="#25F4EE" transform="translate(-0.6 -0.6)" d={note} />
      <path fill="#FE2C55" transform="translate(0.6 0.6)" d={note} />
      <path fill="#010101" d={note} />
    </symbol>
  )
}

function YouTube() {
  return (
    <symbol id={SYMBOL_ID.youtube} viewBox="0 0 24 24">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </symbol>
  )
}

function Instagram() {
  return (
    <symbol id={SYMBOL_ID.instagram} viewBox="0 0 24 24">
      <defs>
        {/* One definition per document now, so a fixed id is correct again. */}
        <radialGradient
          id="brand-instagram-gradient"
          cx="0.3"
          cy="1.05"
          r="1.1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.25" stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="0.75" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </radialGradient>
      </defs>
      <rect
        width="24"
        height="24"
        rx="6"
        fill="url(#brand-instagram-gradient)"
      />
      <rect
        x="5.25"
        y="5.25"
        width="13.5"
        height="13.5"
        rx="4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="3.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
      />
      <circle cx="16.1" cy="7.9" r="1.1" fill="#fff" />
    </symbol>
  )
}

function Facebook() {
  return (
    <symbol id={SYMBOL_ID.facebook} viewBox="0 0 24 24">
      <path
        fill="#1877F2"
        d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
      />
      <path
        fill="#fff"
        d="M16.671 15.469 17.203 12h-3.328V9.749c0-.949.464-1.874 1.955-1.874h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.469h3.047v8.385a12.13 12.13 0 0 0 3.75 0v-8.385z"
      />
    </symbol>
  )
}

function LinkedIn() {
  return (
    <symbol id={SYMBOL_ID.linkedin} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="3" fill="#fff" />
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </symbol>
  )
}

/**
 * The five definitions. Render this ONCE per page that shows brand marks,
 * outside any container the page can hide.
 *
 * Off-canvas rather than `display: none`: a hidden subtree is exactly what
 * broke the gradient before, and while one definition cannot repeat that bug,
 * keeping the paint server in a rendered subtree costs nothing and removes the
 * question entirely.
 */
export function BrandIconSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <TikTok />
      <YouTube />
      <Instagram />
      <Facebook />
      <LinkedIn />
    </svg>
  )
}

/** Whether a full-color brand mark ships for this normalized platform key. */
export const hasBrandIcon = (platform: string): platform is PlatformKey =>
  platform in SYMBOL_ID

/**
 * One brand mark — a `<use>` pointing at the sprite `BrandIconSprite` laid
 * down. Renders null for a label outside the set, so the caller can fall back
 * to the CMS logo.
 */
export function BrandIcon({
  platform,
  className,
}: {
  platform: string
  className?: string | undefined
}) {
  if (!hasBrandIcon(platform)) {
    return null
  }
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <use href={`#${SYMBOL_ID[platform]}`} />
    </svg>
  )
}
