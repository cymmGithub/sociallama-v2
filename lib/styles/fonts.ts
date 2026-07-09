import { Exo_2, Manrope } from 'next/font/google'

// Display / heading face. `latin-ext` is required for Polish diacritics
// (ą ć ę ł ń ó ś ż) in headlines like "SPRZEDAŻ" / "Usługi".
const display = Exo_2({
  weight: ['300', '400', '700', '800'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--next-font-display',
  fallback: ['Arial Narrow', 'Arial', 'sans-serif'],
})

// Body / utility face. Kept under the `--next-font-mono` variable name so the
// existing typography scale and CSS references resolve without change.
const mono = Manrope({
  weight: ['400', '600'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--next-font-mono',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
})

const fonts = [display, mono]
const fontsVariable = fonts.map((font) => font.variable).join(' ')

export { fontsVariable }
