# expand-uslugi-client-copy — design

## Context

All `/uslugi/*` page content lives in `lib/content/uslugi.ts` as ordered section descriptors (design D1 of the original build), with `uslugi.en.ts` as the parity-gated EN twin. Partner blocks render in `service-page.tsx` in one of two branches: a cinematic full-bleed cover when `video` is present (SEOFly on kampanie-reklamowe, Folks on influencer-marketing, DIEA on kreacje-wideo) or a copy+image split otherwise. Both branches render `data.copy` as a single string in a single element.

The client's source documents (2026-07-25) carry 3–4-paragraph partner copy; the shipped pages compress it to one paragraph. The Audyt document's headline voice was dropped, and the ad-campaigns page never shipped the cross-link to `/uslugi/sprzedaz` that the `services-pages` spec ("Reciprocal cross-links") already requires — only the Sprzedaż→Kampanie direction exists (a `banner` at the end of Sprzedaż).

## Goals / Non-Goals

**Goals:**

- Restore the documents' partner-copy argument structure (who does what → why the group model pays off → group line) in our editing voice, on both partner pages.
- Give the Audyt page the client's headline voice and a SEOFly partner cover that *complements* rather than duplicates the ad-campaigns block.
- Close the missing Kampanie→Sprzedaż cross-link.
- Keep both locales in lockstep via the existing parity gate.

**Non-Goals:**

- No second CTA on Audyt (hero + banner pair stays).
- No new artwork or video: the SeoFly cover clips are reused byte-for-byte; the document's llama-detective/stats/team-carousel graphics stay out.
- No partner case-study showcases (no client assets exist; `proof` links only into our own collection).
- No change to the ADS tile's Google-only scope (the documented deviation stands, pending client sign-off).

## Decisions

### D1 — `partner.copy: string | readonly string[]`, not a forced array and not `\n\n` splitting

The renderer maps an array to one `<p>` per entry; a plain string renders exactly as today. This leaves the DIEA block (and any future single-paragraph partner) untouched in both locales, so the diff stays confined to the two blocks being expanded plus the new Audyt block. Splitting a single string on `\n\n` was rejected as a magic-string convention invisible to the type system; forcing `readonly string[]` everywhere was rejected as needless churn on DIEA and its EN twin. Both renderer branches (cover and copy+image) get the same treatment.

### D2 — The Kampanie→Sprzedaż cross-link is a `banner`, mirroring the existing Sprzedaż→Kampanie banner

Sprzedaż already ends with a `banner` ("Szukasz SEO i kampanii w Google?") pointing here. The reciprocal link reuses the same kind with mirrored copy ("Szukasz kampanii Meta lub TikTok? → Zobacz Sprzedaż"), appended after the partner cover. Alternative rejected: a link inside the ADS tile body — `triptych` item bodies are plain strings with no link support, and adding rich-text machinery to tiles for one sentence is disproportionate. The banner also keeps the two pages structurally symmetrical, which is how the spec scenario is phrased.

### D3 — Audyt's SeoFly cover goes at the end of the page, after `proof`

New composition: hero(+CTA) · checklist · logoStrip · banner · proof · **partner(seofly)**. Placing the cover mid-page (between logoStrip and the consultation banner) would interrupt the page's single conversion thread — analyse → book a consultation — with a different agency's offer. At the end it reads as a cross-sell addendum: "social audits are ours; if your website needs auditing too, that's SEOFly, same group." The existing "Audyt composition" spec scenario is updated accordingly.

### D4 — Audyt's partner copy is complementary, not copied

The ad-campaigns block pitches the full SEOFly collaboration. The Audyt block must not blur the deliberate boundary the codebase already guards (social-profile audits = Social Lama; website/SEO audits = SEOFly). Its copy is shorter (~2 paragraphs): the boundary statement, then the group framing, closing with the shared "Jeden partner. Wiele kompetencji. BETTER WORKS." line — kept for group-brand consistency with the other two covers, per the existing spec scenarios.

### D5 — Audyt headline voice mapping

The hero keeps the service-name title (spec: heroes carry the service title) and works "świeże spojrzenie" into the intro's opening instead. The checklist's heading becomes the client's "Zobacz swoją markę z nowej perspektywy"; its former generic heading "Co obejmuje usługa?" folds into the intro as the lead-in to the ticked list. Kicker stays `ZAKRES`.

### D6 — The Folks tagline is dropped, not replaced

`tagline` is optional and the renderer already handles its absence (SEOFly's block has none). Folks publishes no tagline; we stop inventing one.

## Risks / Trade-offs

- [Long partner copy over video hurts legibility, especially mobile] → The cover already runs a scrim; verify the restored ~120–150-word blocks with Playwright screenshots at mobile and desktop widths (WebKit included, per repo verification rules) and let the copy length be trimmed in review rather than weakening the scrim.
- [Audyt page identity dilution — a second agency's brand on our audit page] → D3 placement + D4 boundary copy; the block sells the *group*, not SEOFly as the audit provider.
- [Union type breaks the `Localized` parity mapping] → `Localized` widens literals; `string | readonly string[]` passes through structurally. Confirmed by compile — the parity gate is itself the test.
- [Three covers closing with the identical group line reads repetitive to a visitor touring the section] → Accepted: the line is the group's slogan and the spec already pins it on two pages; consistency outweighs variety here.

## Migration Plan

Content-and-renderer-only change; no schema, DB, routes, or assets. Ships as one commit through the normal worktree flow (no `--isolated`). Rollback = revert the commit.

## Open Questions

None — copy wording is authoring work within D4/D5's constraints, resolved at implementation and checked in review.
