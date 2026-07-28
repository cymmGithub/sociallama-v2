## 1. Content

- [x] 1.1 Add a `faq` export to `lib/content/home.ts`: `heading` as a two-line array (`['ASK', 'THE LAMA']`, matching `whyThatWorks`/`howItWorks`), `eyebrow` (`'NAJCZĘŚCIEJ ZADAWANE PYTANIA'`), `ariaLabel`, and `items` as an array of `{ question, answer }`.
- [x] 1.2 Populate `items` with source entries **#2, #5, #7, #9, #10, #12** in that order — price, agency-vs-freelancer, timeline, measurement, choosing an agency, reach. The order is a funnel, not the source document's numbering.
- [x] 1.3 Copy the answers **verbatim** from the source document, including entry #7's `SoMe` phrasing and its `przez Social Lama` suffix — this was decided explicitly (see proposal, Open Question). Normalise only typography: the source uses hyphens where the rest of `home.ts` uses em dashes.
- [x] 1.4 Extend the `LocalizedHome` type so `faq` is part of the localised surface, matching how the other sections are typed.
- [x] 1.5 Add the matching `faq` export to `lib/content/home.en.ts`. Translate #2, #5, #7, #9, #10; **replace #12** with the international-reach entry drafted in `design.md` Decision 7. The `ASK / THE LAMA` heading is shared verbatim — only the eyebrow and items are localised.

## 2. Section component

- [x] 2.1 Create `app/(frontend)/(home)/sections/faq/index.tsx` and `faq.module.css`, following the sibling sections' shape: `'use client'`, `content?: LocalizedHome['faq']` defaulting to the PL export, `useReveal<HTMLElement>()` on the section, `data-reveal-item` on the list.
- [x] 2.2 Render each entry as `<details><summary>…</summary><div>…</div></details>`. **Do not** use `components/ui/accordion` — see `design.md` Decision 1. Do **not** set the `name` attribute; rows are independent (Decision 4). Mark the first entry `open`.
- [x] 2.3 Zero out the default disclosure triangle (`list-style: none` plus `::-webkit-details-marker`) and add the `+`/`−` sign built from two pseudo-element bars, rotating one on `[open]`.
- [x] 2.4 Style per mock A: hairline `--line` row separators, `01`–`06` numerals in `--font-mono` at ~0.75rem, questions in `--font-display` 700 at `clamp(1.15rem, 2.1vw, 1.75rem)`, answers in `--font-mono` at 0.95rem with `max-width: 74ch`.
- [x] 2.5 Use the derived tokens, never literals: `--line` for rules, `--color-contrast` for the toggle sign, and `color-mix(in srgb, var(--color-secondary) 78%, transparent)` for answer body text. Small orange text must use the AA-lifted tint `color-mix(in srgb, var(--color-orange) 45%, var(--color-cream))` — raw `--color-orange` sits at ~3:1 on plum, per the convention documented in `news-lama.module.css`.
- [x] 2.6 Animate with `interpolate-size: allow-keywords` and `::details-content { block-size: 0 → auto }`, transitioning `content-visibility` with `allow-discrete`. Accept the snap-open fallback where unsupported (Decision 5).
- [x] 2.7 Set `--reveal-transform` on the section as the siblings do, and leave `data-reveal-style` unset. **Do not** use `wipe` — its settled `clip-path` slices content that grows after the reveal (Decision 6).
- [x] 2.8 Add `:focus-visible` styling on `summary` — the reset strips the default outline, so keyboard focus is invisible without it.

## 3. Structured data

- [x] 3.1 Add a `FaqJsonLd` component to `components/seo/structured-data.tsx` taking the items array and emitting `@type: FAQPage` with `mainEntity` of `Question`/`acceptedAnswer` pairs. Follow the file's existing `@id`/`organizationRef()` conventions.
- [x] 3.2 Render it **server-side** from each `page.tsx`, beside the existing `<WebSiteJsonLd />` — not from inside the client section component (Decision 8).
- [x] 3.3 Feed it from the same `faq.items` array the section renders, so the two cannot drift. PL page reads `home.ts`, EN page reads `home.en.ts`.
- [x] 3.4 Strip any typographic markup from answers before serialising if present — JSON-LD carries plain text.

## 4. Wiring

- [x] 4.1 In `app/(frontend)/(home)/page.tsx`, insert `<FaqSection />` **inside** the existing chapter-3 fragment, between `<Testimonial />` and `<JoinCta />`. Do not add a wrapper element or restructure the fragment — its position in `Chapters`' children array is its chapter index, which is why the `biome-ignore noUselessFragments` comment is there (Decision 9).
- [x] 4.2 Do the same in `app/(frontend-en)/en/page.tsx`, passing `content={en.faq}`. Note this chapter has no `NewsLama` — the blog is Polish-only.

## 5. Verification

- [x] 5.1 **The load-bearing check:** `curl -s localhost:3000/ | grep` for a distinctive phrase from a **collapsed** answer — e.g. `466%` from entry #7, which is not the open row. It must appear in the raw response. Repeat for `/en`. Use `curl`, not DevTools: DevTools shows the hydrated DOM and would pass even if the server output were empty.
- [ ] 5.2 Load the page with JavaScript disabled; confirm all six questions render and every answer is reachable.
  - **Blocked site-wide, not a FAQ defect.** With JS disabled *every* route renders only the loader: the whole page body ships inside `<div hidden id="S:n">` (the React streaming shell), so nothing in it is visible until hydration reveals it. This cannot pass for the FAQ until that is fixed globally. 5.1 covers the load-bearing half — the answers really are in the server response, verbatim, including collapsed ones. Re-run 5.2 once the shell issue is resolved; it is not tracked by an OpenSpec change yet.
- [x] 5.3 Validate the emitted `FAQPage` JSON-LD, and diff its question/answer strings against the rendered copy. Expect **no rich result** — this is markup for answer engines, not for the SERP (Decision 8).
- [x] 5.4 Screenshot the section **expanded, after the reveal has settled**, and confirm no answer is clipped at the section boundary. A DOM assertion cannot see this failure — it needs a screenshot.
- [x] 5.5 Keyboard pass: tab to each `summary`, confirm a visible focus ring and that Enter/Space toggles. Check `aria-expanded` is exposed.
- [x] 5.6 Expand two entries at once and confirm neither closes the other, and that expanding a lower row does not shift content under the cursor.
- [x] 5.7 Measure the collapsed section height at 1440px and at a common mobile width; confirm it stays near one viewport so `JoinCta` is not pushed far down.
- [x] 5.8 Scroll the full homepage in both locales and confirm the three-chapter background morph still fires at the same boundaries.
- [x] 5.9 Check the reduced-motion path suppresses the height transition.
- [x] 5.10 Run `bun run lint` and `bun run typecheck`. Filter Biome to `--diagnostic-level=error`: `module_resolver` panics are pre-existing and non-fatal.
