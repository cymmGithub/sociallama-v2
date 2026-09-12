# Design system — Social Lama

What the shipped site **is**, measured rather than prescribed. Read this before
styling any surface; it is the answer to "what size/radius/duration should this
be" so that new work stops inventing a fourth value.

Two standing rules for this document:

- **The shipped site wins.** Where the brand book and the code disagree, the
  code is recorded here and the book is noted as origin. Nothing in this
  document changes a rendered pixel.
- **It is a snapshot with a date.** Inventory taken **2026-09-12** by
  `bun run styles:audit` (`lib/styles/scripts/audit-tokens.ts`), which walks
  every `*.module.css` under `app/`, `components/`, `lib/`. Re-run it after
  adding a surface: if the "literal" column grew, you invented a value.

## Inventory, 2026-09-12 (62 CSS modules)

After the literal → token substitution. The audit counts a `var(--radius-pill)`
as a value like any other, so its "distinct" column includes the token
references; "literal" excludes them and is the number that tracks drift.
Duration and hex count occurrences the audit can parse, so a value moved into
a token leaves those totals.

| Property | Occurrences | Distinct (audit) | Literal |
|---|---|---|---|
| `font-size` | 463 | 191 | 191 |
| `padding` / `margin` / `gap` | 1155 | 387 | 387 |
| `border-radius` | 215 | 55 | 50 |
| `box-shadow` | 38 | 29 | 26 |
| transition/animation duration | 136 | 39 | 39 |
| hex literals | 48 | 31 | 31 |

On 2026-09-11, before the substitution: radius 54, shadow 29, duration 172/41,
hex 64/32.

That spread is the reason this document exists. The tokens below are the
most-used member of each cluster; everything else is listed under
[Existing variants](#existing-variants--do-not-reuse).

## Palette

Defined in `lib/styles/colors.ts`, exposed as `--color-*`. Never hard-code a
palette colour in a component — reference the token, or the theme slot.

| Token | Value | Role | Origin |
|---|---|---|---|
| `plum` | `#913155` | accent on light grounds (scrubbed heading fill) | brand book |
| `plum-hero` | `#913155` | hero + team grounds, chapter-1 theme | own token: baked hero assets are graded to it; equal to `plum` since the 2026-07 book |
| `plum-dark` | `#722341` | chapter-3 ground (testimonial/CTA/footer) | site decision |
| `orange` | `#f09b39` | accent on plum grounds, CTAs | brand book |
| `ink` | `#2b1f24` | text on light grounds; the shadow tint | brand book |
| `ink-deep` | `#161216` | footer sign-off + `/kontakt` ground | site decision (darker, flatter than `ink`) |
| `cream` | `#faf9f5` | text on plum; card surfaces | brand book |
| `sand` | `#e0ddd3` | chapter-2 ground | brand book colour, chapter-two ground is a site decision (2026-07-13, over cream) |
| `black` / `white` | — | base utilities and mask layers only | Satus |

### Chapter themes

Three scroll chapters, as Satus themes (`primary` = ground, `secondary` =
foreground text, `contrast` = accent). Set with `<Wrapper theme="…">`, then
reference the slots.

| Theme | primary | secondary | contrast | Where |
|---|---|---|---|---|
| `plum` | `plum-hero` | `cream` | `orange` | chapter 1 — hero, team, join-CTA |
| `cream` | `sand` | `ink` | `plum` | chapter 2 — light sections, logos belt |
| `plum-deep` | `plum-dark` | `cream` | `orange` | chapter 3 — testimonial, CTA, footer |

### Colour literals outside the palette

31 hex literals survive in modules. All of them are deliberate; none is drift
from the palette, so none was changed:

- **Platform and partner brand:** `#0a66c2` LinkedIn, `#1877f2` Facebook,
  `#e60023` Pinterest, `#f9ce34`/`#ee2a7b`/`#6228d7` the Instagram gradient,
  `--color-black` TikTok (`ui/social-links`); `#ed4956`, `#ff2e5b`, `#21e6ff` in the
  hero and join-CTA mock UI; `/uslugi` partner accents `#f4c430`, `#f2695b`
  (folks), `#41ad49`.
- **Deliberate shades:** `#d9812a` the orange CTA's hover deepen (kontakt,
  zostan-lama); `#a83c65` → `#8d2f53` → `#601c37` the three stops of
  join-CTA's radial plum ramp; `#241318` / `#2b1a08` page-local `--band-ink`;
  `#8f838b` / `#bfacb6` `--muted` (the footer's is lightened for 4.5:1);
  `#ff6b5b` `--field-error`, warm by choice; `#0b0b0e` the service-page dark
  ground; `#1c1c1c` / `#4a4a4a` / `#737373` join-CTA's phone-mock chrome.
- **Satus kit leftovers**, in components this site barely renders: `#dc2626`
  (form fields, alert-dialog), `#22c55e` / `#3b82f6` (toast). Don't extend them.

## Type

Two faces, no others: **Exo 2** (display, weights 300/400/700/800) and
**Manrope** (body, 400/600/700), loaded in `lib/styles/fonts.ts` as
`--next-font-display` / `--next-font-mono`. Using a weight that isn't loaded
means a synthetic or silently rounded face — Manrope **500 is not loaded**.

Roles live in `lib/styles/typography.ts` and generate `type-*` utilities. Each
value below is what the site already renders most often.

| Utility | Face | Weight | Size | Line-height | Tracking | Extracted from |
|---|---|---|---|---|---|---|
| `type-display` | Exo 2 | 800 | `clamp(3.5rem, 14vw, 12rem)` | 100% | -0.02em | big-marquee fill/outline, kontakt + zostan-lama wordmarks |
| `type-title` | Exo 2 | 800 | `clamp(2.5rem, 7vw, 5rem)` | 90% | -0.02em | services, news-lama headings, team title |
| `type-heading` | Exo 2 | 800 | `clamp(1.5rem, 3vw, 2rem)` | 105% | 0 | card and poster labels, empty-state titles |
| `type-lead` | Manrope | 400 | `clamp(1rem, 1.5vw, 1.15rem)` | 155% | 0 | `/uslugi` platform, partner and CTA copy (6/6 identical) |
| `type-body` | Manrope | 400 | `1rem` | 160% | 0 | blog lead excerpt, pillar body |
| `type-small` | Manrope | 400 | `0.875rem` | 150% | 0 | chips, meta values, inline links |
| `type-caption` | Manrope | 400 | `0.8125rem` | 140% | 0 | breadcrumbs, captions, toasts |
| `type-label` | Manrope | 700 | `0.75rem` | 120% | 0.08em | eyebrows, kickers, rail labels (uppercase at the call site) |

`type-display` and `type-label` carry no `text-transform`: set `uppercase`
where you use them, as the surfaces do today.

**`h2` is legacy, not a role.** It is the one Satus default with consumers —
four `/o-nas` headings (about-intro, projects, good-one, team) whose module
classes set no font property, so the utility owns their type: 32px/700/25.6px
at 375px, 48px/700/38.4px at 1440px. It is kept byte-identical. Don't add
consumers; use `type-title` or `type-heading`. The other Satus defaults (`h1`,
`p`, `p-big`, `caption`, `cta`, `link`) had no rendered consumer and are gone.

## Spacing rhythm

Spacing is already tokenized and should stay that way: `var(--gap)` and
`var(--safe)` are both 16px, viewport-scaled, from `lib/styles/layout.mjs`.
The convention is **a factor of one of them**, not a new length:

- Most used: `gap*2` (29), `gap/2` (23), `safe*3` (22), `gap*1.5` (21),
  `safe*1.5` (16), `safe*2` (14), `safe*4` (11), `gap*3` (11), `gap*0.75` (10).
- Section rhythm: `padding-inline: var(--safe)` with
  `padding-block: calc(var(--safe) * N)`, N = 3–6 on the home chapters
  (services 3/4, testimonial 6, news-lama 2/6, big-marquee 4) and 4 across
  `/o-nas`.
- No spacing tokens are added: the factor *is* the scale. Raw rem values
  (0.5rem, 0.4rem, 1rem) stay inside components, for gaps between a label and
  its value — not for section rhythm.

## Radius

`lib/styles/css/tokens.css`. `@theme static` is required — Tailwind drops
theme variables it sees no use of, and CSS modules compile separately.

| Token | Value | Use |
|---|---|---|
| `--radius-chip` | `12px` | chips, small controls |
| `--radius-card` | `18px` | cards, panels, **and the `.shot` creative radius** |
| `--radius-panel` | `20px` | large surfaces, sheets |
| `--radius-pill` | `999px` | pills, capsule buttons (51 uses — the most common radius on the site) |
| `--radius-circle` | `50%` | avatars, round buttons |

## Elevation

One ink-tinted ramp (ink `#2b1f24` as `rgb(43 31 36 / …)`), three tiers. Black
shadows are the exception, not the rule — prefer these.

| Token | Value |
|---|---|
| `--shadow-card` | `0 6px 18px -10px rgb(43 31 36 / 35%)` |
| `--shadow-raised` | `0 18px 40px -24px rgb(43 31 36 / 45%)` |
| `--shadow-overlay` | `0 26px 50px -22px rgb(43 31 36 / 55%)` |

## Motion

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | `200ms` | hovers, colour and transform states (~100 consumers) |
| `--duration` | `400ms` | reveals, panel open/close (~19) |
| `--duration-slow` | `800ms` | full-section moves |

Easings live in `lib/styles/css/easings.css`. The house curve is
`var(--ease-out-expo)` (128 uses); `var(--ease-gleasing)` (10) is the softer
alternative. Anything else is a one-off — `--ease-out-quad` has a single use.

Animate `transform` and `opacity` only. Reduced motion is neutralized globally
in `css/global.css` (`@media (--reduced-motion)` collapses animation and
transition durations to 0.01ms; GSAP/WebGL gate themselves via
`usePreferredReducedMotion()`). A new `@media (--reduced-motion)` block must sit
**below** the rules it cancels, or it loses the cascade.

## Layout grid

From `lib/styles/layout.mjs`, generated into `css/root.css`:

- Columns: 4 mobile / 12 desktop; `--gap` and `--safe` both 16px at the design
  widths (375 × 650 mobile, 1440 × 816 desktop), viewport-scaled.
- Breakpoint: `--breakpoint-dt: 800px`; `@media (--mobile)` ≤ 799.98px,
  `@media (--desktop)` ≥ 800px.
- Header height: 58px mobile / 98px desktop (`--header-height`).
- Helpers: `dr-layout-grid`, `dr-grid`, `columns(n)`, `mobile-vw()`,
  `desktop-vw()` — see `lib/styles/README.md`.

## Iconography and imagery

- **Lucide only** (`lucide-react`, 35 files). Never a raw glyph, emoji or
  one-off SVG icon for UI affordances.
- **Creative radius is a per-file judgement, not a target.** `.shot` uses
  18px (= `--radius-card`); a phone mockup keeps its ~38px corner baked in the
  alpha channel, a flat app capture is cut to 18px. The 37 `trim`-mode cutouts
  can never be re-radiused. Read the "Creative corner radius" section of
  `CLAUDE.md` before touching any of it, and measure before assuming a defect.
- Replacing media bytes has its own contract (`?v=<filesize>` on media URLs,
  `?v=N` plus a CDN purge for `public/`) — `CLAUDE.md` again.

## Component vocabulary

The names the site already uses; reuse them rather than inventing a synonym.
Counts are class-name occurrences across the 62 modules.

| Name | Count | What it is |
|---|---|---|
| `card` | 91 | a bordered/elevated content block (`cardTitle`, `cardBody`, `cardLink`, `cardMeta`) |
| `cta` | 63 | a call to action; `ctaPrimary` is the filled one, `ctaIcon`/`ctaLabel` its parts |
| `label` | 34 | small uppercase identifier for a value |
| `tag` | 27 | taxonomy marker on a card |
| `rail` | 23 | a horizontal strip of filters/meta beside content |
| `stage` | 21 | the framed area a mockup or media sits in |
| `panel` | 19 | a disclosure surface (FAQ row, step body) |
| `pill` | 18 | capsule control (`--radius-pill`); note `pillar` is unrelated |
| `band` | 11 | a full-bleed horizontal strip of ground colour |
| `button` | 11 | a real `<button>`; prefer `cta`/`pill` for link-shaped actions |
| `chip` | 10 | compact key/value or count |
| `eyebrow` / `kicker` | 14 | the small line above a heading (`type-label`) |
| `shot` | 4 | a creative screenshot/mockup image |

## Standing rules

| Rule | Enforced by |
|---|---|
| Exo 2 + Manrope only, loaded weights only | `lib/styles/fonts.ts`, `brand-theme` spec |
| No palette hex in a component — use `--color-*` or a theme slot | `brand-theme` spec |
| Lucide icons only | this document; review |
| `.shot` 18px, baked mockup radii per file | `CLAUDE.md` → Creative corner radius |
| Animate `transform`/`opacity`; `cn()` + sorted classes | `AGENTS.md`, Biome `useSortedClasses` |
| Reduced-motion neutralizer stays effective | `css/global.css` |
| Never hand-edit `css/root.css` / `css/tailwind.css` | generated by `bun setup:styles` |
| Case-study content edits are Payload scripts, not file edits | `CLAUDE.md` |

## Existing variants — do not reuse

Recorded so a later migration has the map. These are *shipped* values; leave
them where they are, but don't copy them into new work.

- **Font size** (191 distinct): label cluster `0.6875`, `0.7`, `0.72`, `0.78`,
  `0.8rem`; small cluster `0.8125`, `0.85rem`; body cluster `0.9`, `0.9375`,
  `0.95`, `0.98`, `1.05rem`; a second title scale
  `clamp(2.75rem, 9vw, 7rem)` (why-that-works and how-it-works headings, with
  `-0.03em`); plus the Satus viewport forms `desktop-vw(14px)`,
  `calc(11 / 1440 * 100vw)`, `dr-text-*`, and `em`-relative sizes.
- **Font weight:** `font-weight: 500` on three `0.875rem` rules — not a loaded
  Manrope weight.
- **Radius** (50 literal): `10`, `14`, `16`, `22`, `24`, `28px`, `1rem`,
  `0.6em`, `100%`, and the viewport-scaled `mobile-vw(4px)` /
  `desktop-vw(4px)` pairs inside Satus components.
- **Elevation** (26 literal): one-off shadows, most of them black
  (`rgb(0 0 0 / 0.35)`) rather than ink-tinted.
- **Duration** (39 literal): `150ms` is a second "fast" tier with 27 uses —
  the token is 200ms; also `250`, `280`, `300`, `350`, `420`, `480`, `500`,
  `520`, `540`, `600`, `620`, `640`, `650`, `700ms`. Values above ~1s
  (`1.95s`–`32s`) are animation loops (marquees, orbits), not UI transitions,
  and are out of the token's scope.
- **Spacing:** the odd factors `safe*1.2`, `safe*1.4`, `safe*3.5`.
