## 1. Brand logo on the card

- [x] 1.1 In `case-study-card.tsx`, resolve `study.client.logo` via `resolveMedia` (mirroring how `cover` is resolved) and render it as an `<Image>` in the client slot, `alt={study.client.name}`, with `study.client.name` also present as a visually-hidden span (for SEO + AT).
- [x] 1.2 Keep the existing text-name render as the fallback branch when no logo resolves — a logo-less study looks exactly as it does today.
- [x] 1.3 In `case-studies.module.css`, style the logo slot: fixed height (~24–28px), `object-fit: contain`, width auto, left-aligned, replacing/adjusting `.cardClient` so the vertical rhythm of the card body is preserved.

## 2. Topic tags on the card

- [x] 2.1 In `case-study-card.tsx`, render `study.tags` (when non-empty) as a wrapping row of pill labels below the excerpt, above the "ZOBACZ CASE STUDY" row. (Rendered as styled `<span>` pills rather than `<li>`: the card body is a `<span>` inside an `<a>`, so a `<ul>`/`<li>` nested there is invalid HTML block-in-inline; the spec's "non-interactive labels" requirement is met by spans.)
- [x] 2.2 In `case-studies.module.css`, add the tag-row + pill styles, matching the detail page's tag visual language; ensure the pills wrap on a ~33vw card and respect the cream surface contrast.

## 3. Verification

- [x] 3.1 Typecheck + Biome clean; no hardcoded copy (logo alt + tags come from the `study` data, not literals).
- [x] 3.2 Drive `/case-studies` in the browser on :3003: each card shows the brand logo in place of the name text, all three tags render and wrap cleanly, and the card links still resolve to the detail page.
- [x] 3.3 Pixel-check each of the three logos (iRobot, Pracuj.pl, Volvo) for contrast on the card surface — none washed out or clipped; confirm the visually-hidden client name is present in the DOM for a11y/SEO.
- [x] 3.4 Confirm the fallback: a study with no `client.logo` renders the text name (reasoned from the branch — the fallback markup is byte-identical to the unchanged pre-change `.cardClient` path, and `.cardClient` CSS is untouched, so a logo-less study renders exactly as today) without layout breakage.
