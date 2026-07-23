# Industry "brief" section — design

**Date:** 2026-07-23
**Extends:** `add-branze-pages` (the `/branze/*` ↔ `/en/industries/*` pages already shipped).
**Source copy:** `BRANŻE - TEKSTY NA STRONĘ SOCIAL LAMA.pdf` (all 12 industries, PL).

## Goal

Add a per-industry **brief** section directly under the hero on all 12 industry
pages, carrying the real strategic copy from the PDF (3 pillars + 1–2
market-report-backed paragraphs) over a subtle industry-themed icon background.
It replaces the placeholder „DLACZEGO TO DZIAŁA" block on editorial pages.

## Section anatomy

A single band (`cream`/`sand`) sitting between the hero and the next section:

- **Background:** a faint plum watermark of ~5 scattered **Lucide** icons chosen
  per industry (e.g. Automotive → `Car, Gauge, Zap, Wrench, Fuel`; Alkohole →
  `Wine, Beer, Martini, Grape`). Lucide is the repo's only icon system
  (lucide-only rule), one consistent line style, free-license — no new
  dependency, no bespoke illustrations. Subtle intensity (~6–10% opacity),
  `aria-hidden`, non-interactive.
- **Pillars:** the 3 PDF bullets rendered as brand-styled outline tags.
- **Body:** the 1–2 PDF paragraphs verbatim (PL), the copywriter's key emphasis
  sentence bolded, the market-report citation intact (Deloitte / Mintel / PMR /
  Edelman / Otodom / Euromonitor / Gemius 2025). EN = translated for the `/en`
  twin, approved voice.

## Placement in the page

- **Proof** (Automotive, Elektronika): hero → **brief** → „Tak to wygląda w
  feedzie" (portfolio) → numbers band → quote + case-study card → CTA. The real
  numbers band (`chips`, e.g. 11 mln wyświetleń) is untouched.
- **Editorial** (other 10): hero → **brief** → keyword marquee → CTA. The brief
  **replaces** the placeholder manifesto + value cards.

## Content model (`branze.ts` / `branze.en.ts`)

Add to each industry entry:

```ts
brief: {
  pillars: readonly string[]                              // 3 strategic tags
  paragraphs: readonly { text: string; strong?: string }[] // strong = one bold run
}
```

- `strong` is an exact substring of `text`; the renderer splits on it and wraps
  it in `<strong>`. Absent → plain paragraph. One emphasis per paragraph (the
  most important bold phrase in the PDF).
- **Remove** the now-unused `manifesto` field (editorial placeholder, replaced).
- **Keep** `chips` — now consumed only by the proof numbers band. Editorial
  entries drop their `chips` data (no longer rendered on editorial pages).
- `marquee`, `collage`, `caseStudy` unchanged.

Parity stays enforced by `LocalizedBranze` (PL `as const`, EN `satisfies`).

## Rendering (`industry-page.tsx`)

- New `IndustryBrief` sub-component: renders the icon-watermark background layer
  + pillars + paragraphs. Reuses `useReveal` for entrance.
- Icon mapping `Record<industryId, LucideIcon[]>` lives in the component (icons
  are presentational, not content — keeps `branze.ts` free of React/lucide).
- Both variants render `<IndustryBrief>` right after the hero.
- Editorial variant: delete the manifesto + chips-cards markup.

## SEO / a11y

- More genuine per-industry prose strengthens the pages (mitigates the
  near-duplicate-editorial risk noted in the original design's Risks).
- Background icons are decorative → `aria-hidden`, wrapped so they never
  intercept pointer/AT. No metadata/hreflang/sitemap changes.

## Non-goals

- No CMS. No new dependency. No change to proof numbers, collage imagery, nav,
  or SEO surface. No bespoke illustrations.

## Verification

- Typecheck + Biome green; `LocalizedBranze` parity holds after the model change.
- Screenshot-sample brief on ≥1 proof + ≥2 editorial pages, PL + EN, desktop +
  mobile: copy renders, watermark is subtle and legible, placement correct,
  editorial „DLACZEGO TO DZIAŁA" gone.
