# Design: fix-final-review-feedback

## Context

Ania's final pre-launch review produced ten accepted fixes spanning three layers of this codebase:

1. **Component/CSS** — one layout bug (branże orbit) and one section removal (careers benefits).
2. **`lib/content/*.ts` copy** — hand-authored PL content files with mandatory EN twins, guarded by `lib/content/locale-parity.test.ts`.
3. **Payload case-study documents + media** — CS content lives in the dev Postgres DB (docker, seeded), with production reached via `scripts/case-studies/reseed-prod.sh` or targeted `payload run` scripts under Blob/DATABASE_URL discipline (see repo CLAUDE.md).

Feedback provenance: Asana task 1217405077214092, Anna Ozga's comment 2026-08-19 21:41, screenshots downloaded and decoded 2026-08-20. Replacement assets provided by Przemek are staged in this change's `assets/` directory.

## Goals / Non-Goals

**Goals:**
- Every accepted review point fixed on dev, verifiable in the browser, with lint/tests/build green.
- EN locale stays in parity for every copy edit (translate, don't stub).
- CS media swaps leave no orphaned media rows (orphan-coverage tests stay green).

**Non-Goals:**
- Blog authorship, CS photo-consent sweep, lama illustration swap (deferred by Przemek).
- Emilia's 2026-08-17 CS graphics batch (Riviera, JW, POLOmarket, ASUS, IMID) — separate change.
- Production deployment of CS content edits — this change lands them on dev and documents the prod path; running the prod reseed is a separate, explicitly-approved step.

## Decisions

**D1 — Orbit overlap: fix layout, don't hide the kicker.** `industry-page.tsx:484` renders `chrome.briefKicker` as `.orbitHub` inside the desktop orbit; Ania's screenshot (~1100px viewport) shows the hub pill ("Personal branding ekspertów") and the kicker text stacked on the same center. Diagnose in-browser at that width first (systematic-debugging: reproduce before touching CSS) — likely a breakpoint band where the orbit layout is active but the hub node and kicker both claim the center, or a z-index/positioning regression in `industry.module.css` (orbit vars at :894). Fix the geometry for the failing band; do not paper over with `display:none`.

**D2 — Benefits section: delete component + content, keep the route intact.** Remove `careers-benefits.tsx`, its mount in `careers-page.tsx`, its content block in `zostan-lama.ts`/`.en.ts`, and its CSS. Per repo rules, also remove anything *this* deletion orphans (styles, types, test fixtures) — nothing else.

**D3 — Bio years: compute start year as 2026 − N, flag "ponad".** "Od 5 lat" → "od 2021 roku"; "od ponad 4 lat" → "od 2022 roku"; "od ponad 12 lat" → "od 2014 roku"; "od ponad 10 lat" → "od 2016 roku"; "od ponad piętnastu lat" → "od 2011 roku". "Ponad" makes these lower bounds — the computed year is the latest plausible, which is the safe claim. Mirror in `o-nas.en.ts` ("since 2021").

**D4 — "Coś o Lamie" BIO: use the doc's "Pod www" version, but apply the no-durations rule.** The green-marked www version is first-person ("Zapewniamy…"). Its opening says "działająca na rynku ponad 13 lat", which contradicts Ania's own rule #3; render as "działająca na rynku od 2013 roku" and note the deviation in the Asana reply for her sign-off. Translate for `o-nas.en.ts`.

**D5 — Stats: non-round, slightly increased, plausible.** `contact.ts:129-132`: `500 000` → `514 000` fans; `7 000 000` → `7 260 000` reach. Keep `528` and `80`. Mirror exact digits in `contact.en.ts`. Values are Przemek's call ("randomly slightly increase") — recorded here so they're deliberate, not improvised mid-implementation.

**D6 — Volvo caption: prefer the text field over a baked-in graphic.** The CS `client` group has `name` (text) + `logo` (media upload). First check whether "DOM VOLVO" in Ania's screenshot comes from `client.name` or from text baked into the logo image. If it's the field: update `client.name` to "Volvo Car Warszawa & Dom Volvo" via a `payload run` script. Only if the string is baked into the logo asset does `assets/volvo-title.png` (493×24 text render) come into play — and even then, re-setting the text field beats shipping a screenshot of text.

**D7 — Pracuj.pl: strip uploads from the document, then delete the orphaned media rows.** Null the `cover` and every pillar/gallery `media` reference on the `pracuj-pl` doc (both locales share media per the collection comment), then remove the now-unreferenced media documents so orphan-coverage stays truthful. Write through the Payload API (never raw SQL — `_v` version rows).

**D8 — iRobot swaps go through the media collection.** Upload `irobot-cover-roomba.png` (1144×643) as the new `cover`; upload `irobot-humor-parrot.png` (713×640) and point the `#HUMOR` pillar ("Podkreślenie korzyści i wygody") media at it, replacing all current photos in that pillar. Old media rows deleted after re-pointing.

**D9 — Breville logo: replace the media file behind `client.logo`.** Upload `assets/breville-logo.jpg` (205×90 official wordmark) and re-point `client.logo`. Note the source is a small JPEG with white background — check how the card renders it on the cream card background (Ania's screenshot showed a purple-tinted wrong-brand-color mark); if the white box clashes, convert to PNG/webp with transparency during implementation.

**D10 — Dev-first, prod later.** All Payload edits run against the local dev DB (plain `bun run payload run <script>` — no env overrides). The scripts must be idempotent and loggable so the same scripts can later run against prod under the repo's `DATABASE_URL`/Blob-token discipline. Actually running them on prod is out of this change's scope (Non-Goal).

## Risks / Trade-offs

- [Orbit fix regresses other breakpoints] → verify the full width range (mobile flat kicker at `briefKickerFlat`, desktop orbit) with Playwright screenshots before/after.
- [Locale-parity tests fail on copy edits] → edit PL and EN twins in the same commit; run `bun run test` before each commit.
- [Deleting pracuj-pl media breaks other references] → media may be shared across docs/locales; check references before deleting any media row; delete only truly orphaned rows.
- [Bio year arithmetic wrong for "ponad" phrasing] → years are lower-bound-safe by construction (D3); flag the mapping in the Asana reply so Ania/the team can correct individual years.
- ["od 2013 roku" deviates from Ania's literal doc text] → deliberate (D4); called out for her sign-off rather than silently shipped.
- [Breville JPEG renders as a white box on the card] → D9 fallback: transparent PNG conversion.

## Open Questions

- Does "DOM VOLVO" come from `client.name` or the logo asset? (Resolved in the first Volvo task; both paths designed in D6.)
- Exact EN phrasing for the new BIO — implementation session translates, parity test enforces structure only.
