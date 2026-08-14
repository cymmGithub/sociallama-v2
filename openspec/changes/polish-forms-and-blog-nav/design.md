# Design — polish-forms-and-blog-nav

## Context

Three independent quick fixes, bundled because each is too small to carry its own change:

1. Blog posts render through the shared `PostArticle` (`app/(frontend)/[slug]/post-article.tsx`), used by the PL root-level route (`BASE_PATH = ''`, hub `/blog`) and the EN route (`app/(frontend-en)/en/blog/[slug]/page.tsx`, `BASE_PATH = '/en/blog'`, hub `/en/blog`). The header stage already carries breadcrumbs (hub → category) but no dedicated back affordance.
2. The contact form (`app/(frontend)/kontakt/contact-form.tsx`, reused by `/en/contact`) submits through `sendContactEmail` (`lib/integrations/email/action.ts`) with a per-locale Zod schema. It shows a passive RODO paragraph (`form.privacyNote`, rendered at `contact-form.tsx:177-183`) but has no consent checkbox. The careers form already solved this: a local `ConsentField` (`careers-form.tsx:83-135`) wired into the form kit via `setFieldValidity` (a checkbox's FormData `value` is `"on"` regardless of checked state, so the kit's readiness gate can't see it natively), enforced server-side with `consent: z.literal('on')` (`careers-schema.ts:73`).
3. Contact-form field labels carry CSS-counter step numbers (`.formShell .field label::before` → `01 — Imię`) colored `var(--muted)` = `#8f838b` (`kontakt.module.css:19,160-171`) — low contrast on the plum stage. The careers form colors its labels `color-mix(in srgb, var(--color-cream) 72%, transparent)` (`zostan-lama.module.css:439-447`).

## Goals / Non-Goals

**Goals:**
- Locale-aware "← Blog" back link at the top-left of every post header, breadcrumbs untouched.
- Contact form cannot submit — client- or server-side — without an explicit consent tick, in both locales.
- Contact-form step numbers/labels legible (cream) on the plum stage.

**Non-Goals:**
- No careers-form behavior change (it already enforces consent). Only a mechanical import swap if `ConsentField` is extracted.
- No breadcrumb redesign, no marketing-consent (optional second checkbox) on the contact form — careers has one because job applicants opt into a talent pool; contact has no equivalent need.
- No consent persistence/audit trail beyond what the email pipeline already records.

## Decisions

**D1 — Back link renders inside `PostArticle`, driven by props already available.**
Both routes pass locale-specific `content` and a base path; the back link needs `href` (PL `/blog`, EN `/en/blog`) and a label (`Blog`) with aria copy in `lib/content/blog.ts` / `blog.en.ts`. One component change covers both locales — no route-level duplication. Placed as the first element inside the header stage, above the breadcrumb nav, left-aligned.
*Alternative rejected:* per-route back-link markup — duplicates the template, violating the "single bespoke post template" requirement's spirit.

**D2 — The arrow is `lucide-react` `ArrowLeft`, never a text glyph.**
House rule: no raw glyph icons (`←`). Breadcrumbs already use lucide `ChevronRight`; the back link mirrors that with `<ArrowLeft>` + text label, styled with the crumbs' typographic recipe (mono-ish uppercase, cream mix) but at full-strength cream so it reads as an action, not a trail.

**D3 — Extract `ConsentField` into the form kit; both forms import it.**
The careers `ConsentField` already encodes the non-obvious part (checkbox validity via `setFieldValidity`, error wiring). Copying it into `kontakt/` would fork that logic. Move it to `components/ui/form/consent-field.tsx` accepting className hooks (group/box/label/error) so each page's CSS module keeps owning the look; careers switches to the import with zero behavior change, kontakt adds a required instance.
*Alternative rejected:* local duplication — two ~50-line copies of subtle form-kit glue is exactly the divergence the past simplify passes removed.

**D4 — Consent is required via `consent: z.literal('on')` in `buildContactSchema`, mirroring careers.**
Client side, the form kit's readiness gate blocks submit until the box is ticked (via `setFieldValidity`); server side the schema rejects a missing/unchecked value with a per-locale message, so the guarantee holds even without JS. The static `privacyNote` paragraph is removed and its RODO substance becomes the checkbox label (PL from existing copy in `lib/content/contact.ts:94-98`; EN adapted in `contact.en.ts` — clean, not playful: it's legal copy).

**D5 — Step-number fix is one declaration: label color moves from `--muted` to the careers cream mix.**
`.formShell .field label` gets `color: color-mix(in srgb, var(--color-cream) 72%, transparent)`; the `::before` counter inherits, so number and label brighten together and the two forms end up on the same label recipe. The orange required-asterisk stays.
*Alternative rejected:* coloring only the `::before` counter full cream — a bright `01 —` next to a muted label reads as a rendering artifact, and it diverges from the careers recipe the user pointed at ("like we do in other places").

## Risks / Trade-offs

- [Careers form touched by the D3 extraction] → import swap only; careers e2e/visual behavior must be verified unchanged. If the extraction turns out hairier than expected (kit-version drift between forms), fall back to local duplication and note it in tasks.
- [Kontakt e2e spec submits the form] → it must now tick the consent box or the happy-path spec goes red; update the spec in the same change. (`e2e/kontakt` is a known standing lane — see the CI flake note; don't misread a consent-caused failure as that flake.)
- [Back link + breadcrumbs both point at the hub on top of each other] → accepted duplication, explicitly requested ("even that we have breadcrumbs, just add it"); aria labels keep them distinguishable.
- [Locale-parity test] → new content keys (back-link label/aria, consent label/error) must land in both `blog.ts`/`blog.en.ts` and `contact.ts`/`contact.en.ts` or the parity test fails — that test is the safety net, not a risk.

## Open Questions

None blocking. EN consent wording drafts in tasks; user reviews copy at implementation time.
