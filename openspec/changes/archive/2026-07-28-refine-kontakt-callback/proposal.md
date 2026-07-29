## Why

`/kontakt` converts a click into an email, but the page never makes a **promise**. The lede asks an open question (`…albo po prostu chcesz pogadać?`) and the form just says "send" — a visitor has no idea what happens after they hit submit or when they'll hear back. Lead-gen pages we admire (e.g. Leanpassion's *bezpłatna konsultacja*) convert because they lead with a concrete offer and spell out the next steps. We want the same conversion skeleton — **clear offer → what-happens-next → proof** — but in Social Lama's playful voice, not a corporate one.

The chosen offer is a **fast callback**: "napisz kilka słów — odzywamy się w 24h i gadamy o konkretach." Deliberately low-friction: we want to fill the funnel, not qualify it, so we are **not** adding company / position / budget / company-size fields the way an enterprise consultancy would.

## What Changes

- **Offer-forward lede** — rewrite the hero lede in `contact.ts` from an open question to a short call to action (booking a free consultation), with the CTA emphasised (orange bold). The 24h promise is carried by the "Co dalej?" strip and the submit-row note rather than the lede. Marquee, layout, and voice unchanged.
- **New "Co dalej?" strip** — a small three-step section between the lede/form area that tells the visitor exactly what happens: `1 Piszesz` → `2 Odzywamy się (24h)` → `3 Gadamy o konkretach`. Pure copy in the brand voice; deliberately does **not** promise finished ideas before the call (honesty over inflation).
- **Optional phone field** — one new input, `Telefon` (optional), justified *because* the offer is a callback. Opt-in ("Wolisz, żebyśmy oddzwonili? Zostaw numer."), so friction stays near zero. When provided it is included in the lead email; when blank the form behaves exactly as today.
- **Aligned submit note** — the reassurance line next to the submit pill is aligned to the 24h promise so copy is consistent.
- **RODO info note** (added 2026-07-22) — a one-line privacy note near the submit row: data is used only to respond to the inquiry (including the callback when a number is left), linking to the existing `/polityka-prywatnosci` page. The form currently ships with no privacy copy at all; collecting a phone number widens that gap enough to close it here. Copy lives in `contact.ts` like everything else.

Explicitly **out of scope** (see Non-Goals): lead-qualifying fields, reordering the proof band, any tone/visual redesign, and any calendar-booking integration.

## Capabilities

### Modified Capabilities
- `contact-page`: The contact form gains an optional `Telefon` field (surfaced in the lead email); the page gains an offer-forward lede and a "Co dalej?" three-step strip that states the callback promise and what happens next.

## Non-Goals

- **No qualifying fields.** No company, position, budget, or company-size inputs — the goal is inquiry volume, not filtering. This intentionally diverges from the Leanpassion reference.
- **No proof reordering.** The brand belt and metrics band stay where they are; pulling them above the form is more visual-rhythm risk than this change needs.
- **No tone or visual redesign.** Marquee hero, dark canvas, orange accent band, and the numbered underline form are untouched. Voice stays playful.
- **No booking integration.** The offer is a human callback, not a self-serve calendar.

## Impact

- **Modified code**:
  - `lib/content/contact.ts` — new lede copy; new `contactSteps` (the "Co dalej?" data) + `contactStepsHead`; new `phone` field copy under `contactForm.fields`; aligned submit note.
  - `app/(frontend)/kontakt/contact-form.tsx` — add the optional `Telefon` `InputField`; render the RODO note near the submit row.
  - `lib/integrations/email/action.ts` — extend the Zod schema with optional `phone`; include it in the email body.
  - `app/(frontend)/kontakt/kontakt.module.css` — styles for the new steps strip.
- **New code**: a `ContactSteps` section component (`app/(frontend)/kontakt/contact-steps.tsx`) rendered from `page.tsx`.
- **Reused**: `components/ui/form` `InputField`, existing `runFormAction` / Turnstile harness (unchanged), `lucide-react` icons.
- **No new dependencies, no new env vars.** Email transport, rate limiting, and spam protection are untouched.
- **Sequencing note**: this change **modifies the `contact-page` capability, whose baseline spec is still inside the in-progress `add-contact-page` change** (not yet promoted to `openspec/specs/`). The MODIFIED requirements below quote that pending baseline. **Decision (2026-07-22): wait for the SMTP secrets, finish `add-contact-page` task 6.2 (real browser submit + email delivery), archive it, then apply this change.** Worktree + exploration can proceed now; implementation is gated on that archive.
- **Operational commitment**: the 24h callback promise is a real SLA, not just copy. **Confirmed 2026-07-22: the team will honor 24h on working days — the promise ships as written.**
