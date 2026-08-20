# Proposal: fix-final-review-feedback

## Why

Ania's final website verification (Asana task 1217405077214092, "Finalna weryfikacja strony www <3", comment of 2026-08-19) produced a 13-point punch list before launch. Ten points were accepted by Przemek on 2026-08-20 (three deferred: blog authorship, CS photo-consent sweep, lama illustration swap). This change lands every accepted point.

## What Changes

**Code / layout**
- Fix the orbit-diagram text overlap on branże pages: the "DLACZEGO TO DZIAŁA" hub kicker renders on top of the "Personal branding ekspertów" orbit node (`app/(frontend)/branze/[slug]/industry-page.tsx` `orbitHub`).
- **Remove** the entire "Benefity, których naprawdę używamy" section from `/zostan-lama` (Ania: "brainstorm nie jest benefitem"; benefits change over time).

**Copy (PL + EN twins, locale parity preserved)**
- Careers hero lede: replace "Umiesz się zachować w grupie? … pluciu na odległość…" with Ania's tone-of-voice-compliant copy: "Chcesz zdobywać nowe umiejętności w świecie social mediów? Aplikuj do Social Lamy" (`lib/content/zostan-lama.ts`).
- Team bios: convert duration phrasing ("Od 5 lat…", "Od ponad 12 lat…") to start-year phrasing ("od 2021 roku…") so the page never goes stale (`lib/content/o-nas.ts`, 5 bios).
- "Coś o Lamie" section: replace body with the new BIO from Ania's Google Doc ("Pod www" first-person version). Note: the doc says "działająca na rynku ponad 13 lat" which violates Ania's own no-durations rule — apply the same rule ("od 2013 roku") and flag it back to her.
- Stats block (`lib/content/contact.ts`): de-round the suspicious round numbers — 500 000 zaangażowanych fanów and 7 000 000 zasięgu na Facebooku get slightly increased, non-round values; 528 and 80 stay.

**Case-study content (Payload documents + media; slugs: `volvo`, `pracuj-pl`, `irobot`, `breville`)**
- `volvo`: the logo caption reads "DOM VOLVO"; replace with "VOLVO CAR WARSZAWA & DOM VOLVO" (asset `volvo-title.png` provided if a graphic is needed; prefer text).
- `pracuj-pl`: remove ALL graphics including the main/cover image — they are not Social Lama's work.
- `irobot`: replace cover image with the provided Roomba lifestyle shot (`irobot-cover-roomba.png`); replace the photos in the "#HUMOR / Podkreślenie korzyści i wygody" pillar with the provided parrot image (`irobot-humor-parrot.png`).
- `breville`: replace the client logo with the provided official logo (`breville-logo.jpg`).

Assets staged at `/tmp/claude-1000/-mnt-work-goodone/9f98e023-c747-44ea-954e-d51b6e4ca79a/scratchpad/ania-assets/` — must be copied into the change directory (`assets/`) before that scratchpad expires.

**Out of scope (deferred by Przemek)**
- Blog post authorship (real people instead of generic "Social Lama").
- Consent sweep of client-session photos across all case studies.
- Swapping the old lama illustration for the new homepage lamki.
- Emilia's separate CS graphics batch from 2026-08-17 (Riviera, JW, POLOmarket, ASUS, IMID).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `careers-page`: the benefits section requirement is removed; the hero lede copy requirement changes to the new tone-of-voice-compliant text.
- `onas-team`: new requirement — team bios state tenure as a start year ("od RRRR roku"), never as a duration ("X lat doświadczenia").

_Not spec-level:_ the orbit-overlap fix is a bug against the existing `branze-pages` legibility expectations; CS media/copy swaps and stats values are content edits within existing `case-studies` / page requirements.

## Impact

- `app/(frontend)/branze/[slug]/industry-page.tsx` + its CSS module (orbit hub layering/positioning).
- `app/(frontend)/zostan-lama/careers-benefits.tsx` (deleted) + `careers-page.tsx` (section unmounted) + `lib/content/zostan-lama.ts` / `.en.ts`.
- `lib/content/o-nas.ts` / `.en.ts` (5 bios + "Coś o Lamie" body).
- `lib/content/contact.ts` / `.en.ts` (2 stat values).
- Payload documents + media for 4 case studies in the dev DB, then production via the established reseed/CI path (`scripts/case-studies/reseed-prod.sh`); Blob token discipline per repo guide applies to any media upload.
- Locale parity tests (`lib/content/locale-parity.test.ts`) constrain every copy edit; `orphan-coverage` tests may react to removed media.
