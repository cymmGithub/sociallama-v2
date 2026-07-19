const colors = {
  // Neutrals (kept for base utilities: bg-white, text-black, …)
  black: '#000000',
  white: '#ffffff',
  // Social Lama brand palette — per the brand book ("Social Lama nowe
  // wytyczne stylistyczne", 2026-07): white, cream, sand, orange, plum, ink.
  plum: '#913155',
  // Not in the brand book: plum-hero is the hero clip's graded background
  // (seamless-composite token — clips are gated against it, never retint it
  // to match a document); plum-dark is the chapter-3 ground.
  'plum-hero': '#853253',
  'plum-dark': '#722341',
  orange: '#f09b39',
  ink: '#2b1f24',
  // Not in the brand book: the warm near-black ground for the dark canvases
  // (footer sign-off + the /kontakt page). Darker and flatter than `ink`.
  'ink-deep': '#161216',
  cream: '#faf9f5',
  sand: '#e0ddd3',
} as const

// Three scroll chapters, expressed as Satus themes.
// `primary` = section/background, `secondary` = foreground text, `contrast` = accent.
const themeNames = ['plum', 'cream', 'plum-deep'] as const
const colorNames = ['primary', 'secondary', 'contrast'] as const

const themes = {
  // Chapter 1 — hero. Background is exactly the hero clip's flat plum so the
  // video composites seamlessly (seamless-composite convention, design D3).
  plum: {
    primary: colors['plum-hero'],
    secondary: colors.cream,
    contrast: colors.orange,
  },
  // Chapter 2 — light. Sand ground (matches the hero's client-logos band, user
  // decision 2026-07-13), ink text; brand plum is the accent used for the
  // scroll-scrubbed heading fill. Cream stays a surface color (cards, overlay).
  cream: {
    primary: colors.sand,
    secondary: colors.ink,
    contrast: colors.plum,
  },
  // Chapter 3 — closing. Deeper plum ground for the testimonial/CTA/footer.
  'plum-deep': {
    primary: colors['plum-dark'],
    secondary: colors.cream,
    contrast: colors.orange,
  },
} as const satisfies Themes

export { colors, themeNames, themes }

// UTIL TYPES
export type Themes = Record<
  (typeof themeNames)[number],
  Record<(typeof colorNames)[number], string>
>
