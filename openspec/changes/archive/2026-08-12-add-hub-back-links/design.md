# add-hub-back-links — design

## Context

The fixed site header owns the viewport's top-left corner (logo → home) and hides on scroll-down, so a viewport-fixed back button would collide with it visually and inherit its reveal/transparency mechanics. Meanwhile every detail page already reserves an in-flow slot at the top of its hero for return navigation: case studies render `hub / client` breadcrumb links, blog posts render `Blog › category` links, and service/industry pages render a dead `<p>` with the section label (`service-page.tsx:263`, `industry-page.tsx:307`). The audit decision (user, 2026-08-12) is option C: make the dead labels into hub links with a lucide `ArrowLeft`, leaving the working breadcrumbs alone.

Both dead-label pages participate in the poster-morph view transition with their hubs (`usluga-<id>` / `branza-<id>` pairs). The morph specs require that a navigation where the shared element cannot cleanly participate degrades to a plain arrival — "a partial or misdirected animation is not" accepted.

## Goals / Non-Goals

**Goals:**

- A clickable, keyboard-focusable return-to-hub affordance at the top of service and industry heroes, both locales.
- Zero regression in the forward card→hero morph, and no reverse morph fired by the new link.

**Non-Goals:**

- No changes to case-study or blog breadcrumbs (they already work; follow-up may later restyle for closer visual unity).
- No `history.back()` semantics anywhere.
- No viewport-fixed or header-mounted back button.
- No JSON-LD additions.

## Decisions

### D1 — Deterministic hub link, not history

`history.back()` is useless for deep-linked visitors (search traffic has no in-site history) and unpredictable for visitors who arrived via the mega-menu from an unrelated page. The arrow always targets the locale-correct hub. User-confirmed.

### D2 — The existing label slot becomes the link; no new element

The `<p className={s.breadcrumb}>{chrome.sectionLabel}</p>` swaps to a `Link` carrying `ArrowLeft` (lucide, per the repo icon rule) + the same label text, keeping the mono/uppercase styling so the hero composition is untouched. The visible text is the accessible name — "USŁUGI" / "BRANŻE" reads correctly as a link destination; the icon is `aria-hidden`. Hover/focus-visible styles follow the site's existing link affordances.

### D3 — Hub href arrives as a page prop, not new content strings

The shared renderers are locale-agnostic and already receive locale-specific bases from their `page.tsx` wrappers (`caseStudyBase`, `postBase` on services). A `hubHref` prop follows the same pattern: `/uslugi` · `/en/services` · `/branze` · `/en/industries`. `chrome.sectionLabel` supplies the text in both locales already — the parity gate sees no new keys.

### D4 — The back link performs a plain, non-morph navigation

On detail→hub navigation both poster names are present on each side, so an unguarded transition would attempt a hero→card reverse morph — toward a card that is frequently off-screen on the freshly-arrived (scroll-zero) hub. The morph specs forbid exactly this. The link therefore navigates without engaging the shared-element pair; a full-page crossfade or instant swap are both acceptable degraded modes per the existing specs. Mechanism is left to implementation against the current view-transition machinery (the repo already gates entrances on `activeViewTransition`; browser back/forward is already morph-free), but the acceptance bar is behavioral: no partial or misdirected animation from the back link on either section, either locale.

### D5 — Case studies and blog stay as they are

Their breadcrumbs already provide a superior affordance (two levels on blog). Forcing all four page types into identical `← LABEL` markup would delete information for no gain. Consistency here means: same position, same function — every detail page's hero opens with a working route back up.

## Risks / Trade-offs

- [Reverse morph fires anyway on some browser/path combination] → Playwright verification on Chromium for both sections, clicking the new link from a scrolled and unscrolled detail page; the reduced-motion and WebKit paths are morph-free by construction but get screenshot passes anyway.
- [Label-as-link shifts hero metrics (icon adds width/height)] → Icon is sized to the label's cap height and the slot keeps its margins; verify with before/after screenshots at mobile and desktop widths.
- [Users expect the arrow to return to their scroll position on the hub, browser-back style] → Accepted: the arrow is "go to the hub", browser back still does the position-restoring return; the two coexist.

## Migration Plan

Frontend-only, additive; ships as one commit through the normal worktree flow (no `--isolated`). Rollback = revert.

## Open Questions

None.
