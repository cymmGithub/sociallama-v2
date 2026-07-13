const colors = {
  // Neutrals (kept for base utilities: bg-white, text-black, …)
  black: '#000000',
  white: '#ffffff',
  // Social Lama brand palette
  plum: '#923156',
  'plum-hero': '#892f53',
  'plum-dark': '#722341',
  orange: '#ed8c1b',
  ink: '#2b1f24',
  cream: '#fbfaf6',
  sand: '#f0ece3',
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
