## Why

The case-study "Wyniki" section renders last-but-one as flat metric tiles — visitors reach the payoff numbers only after scrolling the whole approach section, and the tiles present social-media results in the least social-media way possible. The competitor benchmark (tigers.pl) leads with an evocative results moment; ours should beat it by presenting the metrics in the native language they were earned in. Direction chosen 2026-07-23 from three interactive mocks: **a phone lock-screen where the results arrive as a storm of push notifications** ("Powiadomienia"), with real network icons and the study's own cover photo as the wallpaper.

## What Changes

- **Section reorder**: "Wyniki" moves directly under "Wyzwanie" (before "Podejście") in the shared `CaseStudyArticle` — both locales inherit the order.
- **Notification phone + metric list replace the tiles** (redesigned 2026-07-23 after design review — the first cut transplanted the dark mock 1:1; the section now lives in the page's own cream editorial system): an orange count-up metric list (the crawlable payload, with plum platform micro-labels) beside a CSS phone whose lock screen fills with one push notification per CMS metric — staggered entrance on scroll, brand-colored network icon, platform as sender, value bolded. A quiet caption under the phone ("Telefon klienta nie miał chwili spokoju.") doubles as the replay control.
- **Cover as wallpaper**: the phone's wallpaper is the study's cover image under a dark scrim — every case study gets its own phone automatically, no per-study design work.
- **Real network icons, inline**: app tiles are brand-colored SVG marks (TikTok/YouTube/Instagram/Facebook/LinkedIn) bundled in the component — the CMS `social-platforms` logos are plum-toned site marks, wrong vocabulary for an app tile (user call 2026-07-23). Matching: platform name first, metric text second (Volvo: sender = dealership, icon = the network named in the metric); unmatched metrics get a lucide fallback tile.
- **Copy via chrome modules**: all section strings (caption/replay line, notification message templates, clock, sender timestamp) live in `lib/content/case-studies.ts` + its EN twin — no hardcoded copy, `satisfies`-typed parity.
- **Motion discipline**: entrance + badge count respect `prefers-reduced-motion` (final state, no animation, replay hidden); notifications remain a real semantic list readable by AT.

## Capabilities

### Modified Capabilities
- `case-studies`: The detail page's results section moves to directly after the challenge section and presents the per-platform metrics as an editorial metric list beside a notification lock-screen phone (cover-photo wallpaper, inline brand-colored network icons, staggered entrance, caption-as-replay) instead of metric tiles.

## Non-Goals

- **No CMS schema change.** `results` stays `{platform, metric, value}[]`; the band is pure presentation.
- **No listing-page changes.**
- **No new dependencies** (lucide-react already present; icons/wallpaper come from existing CMS assets).
- **No JSON-LD/metadata changes** beyond what the section move implies (none).

## Impact

- **Modified**: `app/(frontend)/case-studies/[slug]/case-study-article.tsx` (reorder + band markup), `case-study.module.css` (band styles; old tile styles removed as orphans), `lib/content/case-studies.ts` + `case-studies.en.ts` (band strings).
- **New**: `app/(frontend)/case-studies/[slug]/results-notifications.tsx` (client component: stagger/badge/replay logic).
- **Reused**: `CountUp` (headline value), `resolveMedia`, the `platformLogos` map already built in the article, `components/ui/image`.
- **Both locales**: served automatically via the shared article; EN strings in the chrome twin.
- **Verification**: Playwright on :3005 — PL iRobot (7 notifs), PL Volvo (dealer senders + network icons), EN detail, mobile width, reduced-motion; typecheck + Biome.
- **Worktree**: `sl-wyniki-notifs` (:3005), branched from main at `4c192ad` (post-i18n). File-disjoint from `sl-services-media` and `sl-hero-montage`.
