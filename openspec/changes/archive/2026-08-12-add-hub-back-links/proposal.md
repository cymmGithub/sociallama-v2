# add-hub-back-links

## Why

An audit of the detail pages (2026-08-12) found the return affordance inconsistent: case-study and blog-post pages carry linked breadcrumbs at the top of their heroes, while service and industry pages render a static, dead section label ("USŁUGI" / industry section label) in the exact same slot — an element that looks like navigation but does nothing. Visitors on `/uslugi/<slug>` and `/branze/<slug>` (and their EN twins) have no in-page way back to the hub short of the mega-menu.

## What Changes

- The static section label on `/uslugi/[slug]` and `/branze/[slug]` (both locales) becomes a **hub back link**: a lucide `ArrowLeft` icon followed by the existing label, linking to the locale-correct hub (`/uslugi` · `/en/services`, `/branze` · `/en/industries`). Deterministic hub link, not `history.back()` — deep-linked visitors (SEO traffic) have no in-site history.
- The back-link navigation SHALL NOT trigger the poster morph in reverse: the hub arrives at scroll zero, so the paired card may be off-screen, and both morph specs already forbid misdirected animation. The link navigates with a plain (non-morph) arrival.
- Case-study and blog-post pages are **unchanged** — their linked breadcrumbs already provide the return affordance in the same position; unification is positional and functional, not markup-identical.

Out of scope: `BreadcrumbList` JSON-LD for service/industry pages (possible follow-up; case studies and blog already emit it); adding `ArrowLeft` to the existing case-study/blog breadcrumbs; any header/viewport-fixed back button.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `services-pages`: the service hero's section label becomes a link back to the services hub.
- `branze-pages`: the industry hero's section label becomes a link back to the industries hub.
- `uslugi-morph-transition`: back-link navigation must not produce a reverse or misdirected poster morph.
- `branze-morph-transition`: same constraint for the industries pair.

## Impact

- `app/(frontend)/uslugi/[slug]/service-page.tsx` + `service.module.css` — label `<p>` → `Link`, icon, hover/focus styles; hub href passed from both locale pages (`uslugi/[slug]/page.tsx`, `en/services/[slug]/page.tsx`).
- `app/(frontend)/branze/[slug]/industry-page.tsx` + its CSS — same treatment; hub href from both locale pages.
- Possibly the poster-morph gating (whatever mechanism suppresses the pair on this navigation) — implementation detail resolved against the existing view-transition machinery.
- No content-file, schema, DB, or route changes; labels reuse the existing `chrome.sectionLabel` strings in both locales.
