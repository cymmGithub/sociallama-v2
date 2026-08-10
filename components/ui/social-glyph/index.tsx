/**
 * The brand's social glyphs, inlined so their colour rides `currentColor`.
 *
 * Same forced-dark hardening as the header LogoMark: the social rows used to
 * paint these SVGs via mask-image + background-color, which Samsung Internet's
 * default web darkening treats as a surface and darkens — near-black glyphs on
 * the dark footer ground. Inline fills classified as foreground survive the
 * transform. Path data is the /assets icon artwork, svgo-optimised, unchanged.
 *
 * The `viewBox` of each glyph is a normalising frame, not the artwork's own.
 * The source SVGs draw their ink at different fractions of their canvas —
 * measured, X filled 89.9% of its box and YouTube 87.5% against the 79.7% that
 * facebook, instagram and linkedin agree on, and Pinterest sat 3.1% right of
 * its own centre — so at one CSS size they rendered as a row of mismatched
 * icons. Each viewBox is recomputed from the path's bounding box: centred on
 * the ink, sized so the ink's bounding square is 79.7% of the frame, which is
 * the grid the three consistent glyphs already set. Re-measure if a glyph is
 * ever replaced rather than hand-tuning these numbers.
 *
 * Facebook is the one deliberate exception, at 85.3%. It is the only pure
 * circle in the set, and a circle inscribed in the same square as LinkedIn's
 * actual square encloses about a fifth less area, so matching them
 * geometrically leaves the circle looking undersized. +7% is the usual optical
 * correction; 89.6% is where it landed after checking it on the running site.
 */
import type { SocialIconName } from '@/lib/content/socials'

const GLYPHS: Record<SocialIconName, { viewBox: string; d: string }> = {
  facebook: {
    viewBox: '1.322 1.322 21.357 21.357',
    d: 'M12 2.438A9.562 9.562 0 1 0 21.563 12 9.574 9.574 0 0 0 12 2.438m.563 17.98v-6.355H15a.563.563 0 0 0 0-1.126h-2.437V10.5a1.687 1.687 0 0 1 1.687-1.687h1.5a.563.563 0 1 0 0-1.126h-1.5a2.81 2.81 0 0 0-2.812 2.813v2.438H9a.562.562 0 0 0 0 1.124h2.438v6.357a8.438 8.438 0 1 1 1.124 0',
  },
  instagram: {
    viewBox: '0 0 24 24',
    d: 'M12 7.688a4.313 4.313 0 1 0 0 8.625 4.313 4.313 0 0 0 0-8.625m0 7.5a3.187 3.187 0 1 1 0-6.375 3.187 3.187 0 0 1 0 6.374m4.5-12.75h-9A5.07 5.07 0 0 0 2.438 7.5v9A5.07 5.07 0 0 0 7.5 21.563h9a5.07 5.07 0 0 0 5.063-5.063v-9A5.07 5.07 0 0 0 16.5 2.438M20.438 16.5a3.937 3.937 0 0 1-3.938 3.938h-9A3.937 3.937 0 0 1 3.563 16.5v-9A3.937 3.937 0 0 1 7.5 3.563h9A3.937 3.937 0 0 1 20.438 7.5zm-2.625-9.375a.938.938 0 1 1-1.876 0 .938.938 0 0 1 1.876 0',
  },
  linkedin: {
    viewBox: '0 0 24 24',
    d: 'M20.25 2.438H3.75A1.313 1.313 0 0 0 2.438 3.75v16.5a1.313 1.313 0 0 0 1.312 1.313h16.5a1.313 1.313 0 0 0 1.313-1.313V3.75a1.313 1.313 0 0 0-1.313-1.312m.188 17.812a.19.19 0 0 1-.188.188H3.75a.19.19 0 0 1-.187-.188V3.75a.187.187 0 0 1 .187-.187h16.5a.19.19 0 0 1 .188.187zM8.813 10.5v6a.562.562 0 1 1-1.126 0v-6a.562.562 0 1 1 1.125 0m8.25 2.625V16.5a.562.562 0 1 1-1.125 0v-3.375a2.062 2.062 0 0 0-4.126 0V16.5a.562.562 0 1 1-1.124 0v-6a.562.562 0 1 1 1.124 0v.198a3.188 3.188 0 0 1 5.25 2.427m-7.875-5.25a.937.937 0 1 1-1.875 0 .937.937 0 0 1 1.875 0',
  },
  tiktok: {
    viewBox: '-0.467 -0.843 24.933 24.933',
    d: 'M21 6.938a4.693 4.693 0 0 1-4.687-4.688.563.563 0 0 0-.563-.562H12a.56.56 0 0 0-.562.562v12.375A2.062 2.062 0 1 1 8.49 12.76a.56.56 0 0 0 .322-.508V8.25a.563.563 0 0 0-.657-.554c-3.262.58-5.719 3.559-5.719 6.929a6.938 6.938 0 0 0 13.876 0v-4.038A9.5 9.5 0 0 0 21 11.813a.56.56 0 0 0 .563-.563V7.5A.563.563 0 0 0 21 6.938m-.562 3.73a8.36 8.36 0 0 1-4.36-1.564.562.562 0 0 0-.89.459v5.062a5.813 5.813 0 0 1-11.625 0c0-2.599 1.731-4.92 4.124-5.66v2.955a3.188 3.188 0 1 0 4.876 2.705V2.813h2.652a5.82 5.82 0 0 0 5.223 5.222z',
  },
  x: {
    viewBox: '-1.493 -1.534 27.068 27.068',
    d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  youtube: {
    viewBox: '-12.527 -12.527 281.054 281.054',
    d: 'm164.44 121.34-48-32A8 8 0 0 0 104 96v64a8 8 0 0 0 12.44 6.66l48-32a8 8 0 0 0 0-13.32M120 145.05V111l25.58 17Zm114.33-75.53a24 24 0 0 0-14.49-16.4C185.56 39.88 131 40 128 40s-57.56-.12-91.84 13.12a24 24 0 0 0-14.49 16.4C19.08 79.5 16 97.74 16 128s3.08 48.5 5.67 58.48a24 24 0 0 0 14.49 16.41C69 215.56 120.4 216 127.34 216h1.32c6.94 0 58.37-.44 91.18-13.11a24 24 0 0 0 14.49-16.41c2.59-10 5.67-28.22 5.67-58.48s-3.08-48.5-5.67-58.48m-15.49 113a8 8 0 0 1-4.77 5.49c-31.65 12.22-85.48 12-86 12H128c-.54 0-54.33.2-86-12a8 8 0 0 1-4.77-5.49C34.8 173.39 32 156.57 32 128s2.8-45.39 5.16-54.47A8 8 0 0 1 41.93 68c30.52-11.79 81.66-12 85.85-12h.27c.54 0 54.38-.18 86 12a8 8 0 0 1 4.77 5.49C221.2 82.61 224 99.43 224 128s-2.8 45.39-5.16 54.47Z',
  },
  pinterest: {
    viewBox: '5.521 -2.47 260.957 260.957',
    d: 'M224 112c0 22.57-7.9 43.2-22.23 58.11C188.39 184 170.25 192 152 192c-17.88 0-29.82-5.86-37.43-12l-10.78 45.82A8 8 0 0 1 96 232a8.2 8.2 0 0 1-1.84-.21 8 8 0 0 1-6-9.62l32-136a8 8 0 0 1 15.58 3.66l-16.9 71.8C122 166 131.3 176 152 176c27.53 0 56-23.94 56-64a72 72 0 1 0-134.37 36 8 8 0 0 1-13.85 8A88 88 0 1 1 224 112',
  },
}

export function SocialGlyph({
  name,
  className,
  label,
}: {
  name: SocialIconName
  className?: string | undefined
  /** Accessible name; without one the glyph is decorative (aria-hidden). */
  label?: string | undefined
}) {
  const glyph = GLYPHS[name]
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: the spread supplies aria-label (labelled) or aria-hidden (decorative); the rule can't see through it
    <svg
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true })}
      className={className}
      viewBox={glyph.viewBox}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={glyph.d} />
    </svg>
  )
}
