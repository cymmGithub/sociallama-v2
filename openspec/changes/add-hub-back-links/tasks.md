# add-hub-back-links — tasks

## 1. Services pages

- [ ] 1.1 In `service-page.tsx`, replace the section-label `<p>` with a `Link` to a new `hubHref` prop: lucide `ArrowLeft` (`aria-hidden`) + `chrome.sectionLabel`, keeping the mono/uppercase treatment; add hover and `:focus-visible` styles in `service.module.css`.
- [ ] 1.2 Pass `hubHref` from both wrappers: `/uslugi` in `app/(frontend)/uslugi/[slug]/page.tsx`, `/en/services` in `app/(frontend-en)/en/services/[slug]/page.tsx`.

## 2. Industry pages

- [ ] 2.1 Same treatment in `industry-page.tsx` (label at `:307`) and its CSS module.
- [ ] 2.2 Pass `hubHref` from both wrappers: `/branze` and `/en/industries`.

## 3. Morph guard

- [ ] 3.1 Ensure the back link navigates without engaging the poster pair (no reverse hero→card morph), using the existing view-transition gating machinery; forward card→hero morph must remain intact on both sections.

## 4. Verification

- [ ] 4.1 `bun run check` passes.
- [ ] 4.2 Playwright (Chromium): from a scrolled and an unscrolled service page and industry page, activate the back link — hub arrives at top with no partial/misdirected poster animation; then click a card and confirm the forward morph still runs.
- [ ] 4.3 Screenshots of one service and one industry hero, PL + EN, mobile (~390px) + desktop, Chromium **and** WebKit: label position/typography unchanged apart from the arrow; focus-visible state visible on keyboard focus.
- [ ] 4.4 `bun run test:e2e` green from the worktree.
