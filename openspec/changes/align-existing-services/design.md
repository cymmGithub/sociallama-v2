## Context

`add-services-pages` shipped six service pages built on a section-primitive model: each service declares an ordered `sections` array of typed descriptors, and `service-page.tsx` renders them in order. It archived with its copy-review section unfinished, because the client had not supplied source copy.

That copy arrived on 2026-07-25 as four PDFs. Three map onto existing pages (Strategia, Influencer marketing, Audyt i konsultacje); the fourth becomes a new service page under a separate change. Each document has the same internal structure: several pages of prose, then a `SZKIELET` — the client's own wireframe, listing the sections they expect and in what form.

The constraint that shapes this design: the current six section kinds can express one of the three pages. The other two need shapes that do not exist.

## Goals / Non-Goals

**Goals:**

- Three pages carrying the client's approved messaging, compressed rather than transcribed.
- Section kinds sufficient to express the client's wireframes without bending them into approximations.
- Keep the additive property the model already guarantees: a new kind must not change how existing pages render.
- Resolve the Volvo proof duplication left open as O2.

**Non-Goals:**

- No scheduler integration. The booking step is a CTA (see D4).
- No new illustration sourcing; the one graphic slot degrades gracefully.
- No changes to Content, Kreacje & Wideo, Sprzedaż, or the `/uslugi` index — no source copy exists for them.
- No partner case-study mechanism; `proof` continues to link only into our own collection.

## Decisions

**D1 — Write to the client's wireframe, not their prose.** Each PDF runs roughly three times the length a page should carry, and each ends with a `SZKIELET` that names the sections the client actually wants. The Strategia doc is the clearest example: "Co zawiera strategia?" is seven paragraphs of prose and five bullets in the wireframe. The wireframe *is* the client's own compression, so treating it as the layout contract and the prose as source material satisfies "keep it concise" without inventing an editorial position. Rejected: 1:1 import (explicitly against user direction, and would roughly double page length).

**D2 — Five new kinds rather than variants on existing ones.** `checklist` carries optional media, mirroring how `platforms` already models "copy block with optional media" — Strategia's "Co zawiera strategia?" uses it with a graphic, Audyt's "Co obejmuje usługa?" without. `timeline` is deliberately not a `triptych` variant: the client wrote "oś czasu chyba będzie ciekawsza, bo pokazuje next stepy", so the sequencing is the point, not the card. `logoStrip` and `posts` are structurally unlike anything present. Rejected: overloading `triptych` with a `variant` flag, which would fold three distinct layouts into one renderer branch and make the CSS conditional on data.

**D3 — `banner` serves both pages.** Strategia's "Strategia jako oddzielna usługa" and Audyt's "Umów konsultację online" are the same object: a highlighted band with a heading, a paragraph, and one CTA. One primitive, two uses, distinguished by theme. This is what keeps the new-kind count at five instead of six.

**D4 — Booking is a CTA to `/kontakt`, not a scheduler.** The document asks for a calendar and a specialist picker. The repo's HubSpot integration is forms-only (`fetch-form.ts`, `action.ts`, an embed component) with no meetings surface. Alternatives considered: a HubSpot Meetings embed (needs Meetings configured, per-specialist meeting links, a new client component, and script-source review) and an external scheduler such as Cal.com (third-party dependency the repo does not have). Per user decision the banner links to `/kontakt`; a real scheduler is a later change if the booking flow proves wanted.

**D5 — `posts` matches by category, not by title.** The existing platform related-posts block matches posts whose *title* contains the platform name — a workaround forced by platform relevance being absent from the taxonomy. Strategia does not have that problem: the blog's categories are already topical (`SEO`, `Marketing`, `Reklama`, `Social media`). Matching on category is both more accurate and less code. The graceful-omission rule carries over unchanged: zero matches means the section does not render, heading included.

**D6 — Strategia loses `proof`; Audyt keeps it.** The client's wireframe omits case studies from Strategia entirely. Acting on that resolves a defect rather than merely following instruction: Volvo was the proof case on *both* Strategia and Audyt with identical slug, logo, and title — open question O2 from `add-services-pages`, never answered. Cutting it from Strategia removes the duplication and trims the longest page in the section.

**D7 — Audyt's triptych is deleted, not supplemented.** Its three invented cards (Audyt / Rekomendacje / Konsultacje) cover the same ground as the client's six-item checklist, less concretely. Keeping both would state the offer twice on one page. This is the only place the change removes live content.

**D8 — Narrow sections by `kind`, replacing structural narrowing.** The renderer currently identifies sections by property presence (`'intro' in section` → Hero, `'cases' in section` → Proof, `'items' in section && 'kicker' in section` → Triptych, then `'items' in section` → Platforms) because `Localized<T>` widens each `kind` literal to `string`, defeating discriminated-union narrowing. That chain is order-dependent and silently breakable: `checklist` would naturally carry `items`, colliding with both `triptych` and `platforms` and being swallowed by whichever branch tests first. At six kinds this was survivable; at eleven it is a trap.

The fix is to switch on `section.kind` at runtime and keep the per-branch casts the code already performs (`section as HeroData`). Runtime behaviour becomes explicit and order-independent, and the type-safety story is no worse — those casts exist today. Rejected: renaming new fields to guarantee structural uniqueness (`checks`, `steps`, `logos`), which preserves the trap for whoever adds kind twelve; and reworking `Localized` to preserve literal types, which is correct but a cross-cutting refactor well outside this change.

## Risks / Trade-offs

- **Deleting Audyt's triptych removes shipped content** → Justified by D7; the checklist covers it more concretely. Visible in the visual sign-off before merge.
- **The D8 refactor touches every existing section branch** → Contained to one function whose branches map 1:1 onto the current chain; all six existing pages exercise it, so the Playwright sweep across all services routes is the regression net.
- **`posts` may match nothing** → Degrades to an absent section by design. But it should be checked against the prod database, where the real ~79 posts live; the local dev DB has one seeded post, so a local run proves nothing either way.
- **Strategia's graphic is unsourced** → `checklist` renders media-less, the same scaffold-with-omission pattern `HERO_LLAMA` and the Folks partner image already use.
- **EN copy has no client source** → The documents are PL only. English follows the established EN locale voice, as with every other page in the section.

## Migration Plan

Single worktree, shared with `add-seo-performance-page`, which runs after this change — both edit `uslugi.ts`, `uslugi.en.ts`, `service-page.tsx`, and `service.module.css`, so parallel worktrees would conflict on the core of each.

Order within the change is cheapest-first, so the change can ship partially if something stalls:

1. Influencer marketing — data-only, no renderer work.
2. D8 narrowing refactor — no behaviour change, verified against the six live pages before any new kind exists.
3. New section kinds, then Strategia, then Audyt.

Rollback is per-service: each page's `sections` array is independent data, so reverting one service does not affect the others.

## Open Questions

- **Strategia's "Co zawiera strategia?" graphic** — the client asks for one; nothing is specified. Ships media-less until supplied.
- **Blog categories for Strategia** — which categories `posts` should query, confirmed against the prod database rather than assumed.
- **Whether the booking CTA should say something other than the client's "Wybierz termin w kalendarzu"**, given it now opens a contact form rather than a calendar. Promising a calendar and delivering a form is worse than promising a conversation.
