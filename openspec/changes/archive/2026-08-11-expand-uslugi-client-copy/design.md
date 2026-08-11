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

### D1 — `partner.copy: string | readonly string[]`, with the array split across two grounds

`copy` widens to `string | readonly string[]`. A plain string renders exactly as today. With an array, `copy[0]` rides the cover footage and `copy[1..]` render in a solid plum section emitted directly beneath the cover by the same component — one `partner` descriptor still describes the whole block, and no new section kind is introduced.

**Revised during implementation.** The first pass stacked every paragraph over the footage. Rendered, that was wrong: one paragraph over a moving clip reads as a caption, four read as a wall of text on a ground that keeps moving and is bright in places (the lit laptop in the SEOFly clip, the phone screen in the Folks one). Attempts to settle the legibility question with a pixel metric were abandoned — every variant scored the untouched DIEA cover the same as the changed ones, because a single specular highlight dominates any worst-case reading of moving video. The split fixes the cause rather than measuring the symptom, and it costs no new component: `PartnerCover` returns a fragment, and an empty tail means no second section at all.

Splitting a single string on `\n\n` was rejected as a magic-string convention invisible to the type system; forcing `readonly string[]` everywhere was rejected as needless churn on DIEA and its EN twin. The copy+image branch (currently unused — every partner block ships a video) renders array copy as stacked paragraphs on its existing plum ground, where legibility was never in question.

### D7 — The division of responsibilities becomes a structure, not a paragraph

**Added during implementation, after a design review of the rendered result.**

The second paragraph of every partner pitch *describes a split*: Social Lama does strategy/content/social, the partner does their thing. Rendered as prose it is four lines of agency copy that a visitor skims past; the one question they actually came with — "can this agency cover what I need?" — is answered in a form that has to be read rather than seen.

So `copy[1]` stops being a string and becomes `split: { partner: { label, items }, lama: { label, items } }`. The renderer draws it as two labelled lists. This is not scope creep away from the spec: the spec already requires the block to present "the division of responsibilities between the partner and Social Lama", and a list of responsibilities is the honest shape for that requirement.

Three decisions inside it:

- **The `×` is the axis.** The glyph that joins the two logos in the cover lockup is redrawn as the rule *between* the two lists — vertical on desktop, horizontal once they stack. One mark, two scales, the same statement. It is drawn as the rule rather than set beside it, so it reads as structure and not as decoration.
- **Only the partner wears its colour.** Colouring both columns in their brand accents was tried and rejected: Folks' coral and DIEA's gold sit a few degrees from the brand orange, and the pairing turns to mush. The partner's label takes `--accent`, Social Lama's stays cream, and the orange is spent once — on the closing group line.
- **The panel ground is brand plum.** A near-black mixed down from the plum was tried first, because at full strength the plum does mute the partner accent — but the call went the other way in review: the section is ours, and it should look it. The cost is measured rather than assumed: the partner labels land at 3.6:1 (SEOFly) and 3.4:1 (Folks) on `--color-plum-dark`, so the label's size floor is set at `1.2rem` — at 800 weight that clears 18.66px, where WCAG's large-text threshold of 3:1 takes over from 4.5:1. Shrinking that label below the floor would drop it out of AA at mobile widths.
- **The panel's inline padding sits on the inner box, not the section.** `.partnerCoverInner` keeps `--safe` *inside* its 1240px box; padding the panel's section instead put its text ~16px left of the copy on the cover, and the two read as misaligned columns. Measured at 390/1100/1440px, the kicker, lockup, cover copy, split labels and closing paragraph now share one left edge exactly.

The Audyt block gains the most: "SEOFly audytuje × My audytujemy" states the boundary the spec guards in one glance, where the prose version spent a sentence arguing it.

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

- [Long partner copy over video hurts legibility, especially mobile] → **Materialised, and resolved by D1's split.** The restored blocks were verified with Playwright screenshots at mobile and desktop widths in Chromium and WebKit; at 390px the four-paragraph blocks covered roughly four times the footage the single paragraph had, reaching into the brightest region of both clips. Rather than weaken or thicken the scrim, only the opening paragraph now rides the video and the argument continues on solid plum.
- [Audyt page identity dilution — a second agency's brand on our audit page] → D3 placement + D4 boundary copy; the block sells the *group*, not SEOFly as the audit provider.
- [Union type breaks the `Localized` parity mapping] → `Localized` widens literals; `string | readonly string[]` passes through structurally. Confirmed by compile — the parity gate is itself the test.
- [Three covers closing with the identical group line reads repetitive to a visitor touring the section] → Accepted: the line is the group's slogan and the spec already pins it on two pages; consistency outweighs variety here.

## Migration Plan

Content-and-renderer-only change; no schema, DB, routes, or assets. Ships as one commit through the normal worktree flow (no `--isolated`). Rollback = revert the commit.

## Open Questions

None — copy wording is authoring work within D4/D5's constraints, resolved at implementation and checked in review.
