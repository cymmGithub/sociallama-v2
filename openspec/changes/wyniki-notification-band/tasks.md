## 1. Chrome copy (PL + EN)

- [ ] 1.1 Add `resultsBand` strings to `caseStudyChrome` in `lib/content/case-studies.ts`: tick line, headline template (`{value}`/`{metric}` placeholders, no client name — safe for all studies), badge caption (count-agnostic Polish), replay label, notification message templates, "now" timestamp, clock time (9:41) + date line.
- [ ] 1.2 Mirror in `case-studies.en.ts` with `satisfies` parity.

## 2. Notification band

- [ ] 2.1 New `results-notifications.tsx` client component: phone (cover-image wallpaper + scrim, island, clock), semantic notification list (app tile, sender, message with bolded value, timestamp), side column (headline with `CountUp` top value, badge counting as notifications land, replay button). Stagger on first viewport entry; replay resets and re-runs; `prefers-reduced-motion` → final state, replay hidden.
- [ ] 2.2 Icon resolution: match `platform` name then metric text against the `platformLogos` map (social-platforms CMS logos); lucide fallback tile when no network matches.
- [ ] 2.3 Band styles in `case-study.module.css` (dark ink/plum band, hairline grid, phone, notifications, badge, replay; mobile stacks phone above side copy); remove the orphaned tile styles.
- [ ] 2.4 In `case-study-article.tsx`: move the results section above "Podejście" and swap the tiles markup for the band component (pass study cover, results, platformLogos, chrome strings).

## 3. Verification

- [ ] 3.1 Typecheck + Biome clean; no hardcoded copy in components.
- [ ] 3.2 Playwright on :3005 — PL `/case-studies/irobot` (7 notifications, TikTok/YouTube icons, stagger + badge), PL Volvo (dealership senders with Facebook/Instagram icons, cover wallpaper differs), EN `/en/case-studies/irobot` (EN strings).
- [ ] 3.3 Section order on all: Wyzwanie → Wyniki → Podejście; mobile width sane; reduced-motion shows final state without animation.
