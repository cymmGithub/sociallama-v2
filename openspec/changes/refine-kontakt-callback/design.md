# Design notes — refine-kontakt-callback

## Context

Refinement of the existing `/kontakt` page, inspired by Leanpassion's *bezpłatna konsultacja* lead-gen page. We borrow its **conversion skeleton** (clear offer → what-happens-next → proof) but reject its **execution** (heavy qualification, corporate tone) because Social Lama's goal is inquiry *volume* in a *playful* voice.

## Key decisions

### 1. The lever is copy + structure, not field count
Leanpassion's extra fields (position, company size) are a *filter* — they want to exclude small companies. Social Lama does not. So the biggest wins are the offer-forward lede and the "Co dalej?" strip (pure copy), not more inputs.

### 2. Exactly one new field — and only because the offer requires it
A "callback" offer needs a channel to call back on. Email alone can't honor "oddzwaniamy," so `Telefon` earns its place — but as **opt-in**, not required, so friction stays near zero. Every other field Leanpassion adds is rejected as qualification we don't want.

### 3. Honesty over inflation in the steps
Step 3 is `Gadamy o konkretach`, not "podrzucamy gotowe pomysły w 24h." Promising finished concepts before the call is a claim we'd have to make good on every time; the offer is a fast *conversation*, and the copy stays true to that.

### 4. Channel-agnostic verb because phone is optional
The lede uses `odzywamy się` (we get back to you), not `oddzwaniamy` (we call), because most submitters won't leave a number. The callback framing lives on the optional phone field's nudge, not in a promise the majority can't be served through.

## Fan-out map (why "a few inputs" ≠ trivial)

Copy edits are single-file. The phone field is not:

```
lib/content/contact.ts        → field copy + steps data + lede
contact-form.tsx              → the <InputField>
integrations/email/action.ts  → Zod schema + email body
kontakt.module.css            → steps strip styles
contact-steps.tsx (new)       → the strip component
page.tsx                      → mount the strip
```

## Risks

- **24h is an SLA, not decoration.** Once it's the headline offer, missing it erodes trust faster than never having promised it. Ship only if the team can honor it on working days.
- **Phone validation.** Kept intentionally loose (`trim().optional()`, no regex) — a rejected valid international number is a lost lead, and this field is a convenience, not a gate.

## Alternatives considered

- **Add company/budget qualifiers (full Leanpassion parity).** Rejected — filters out the scrappy DTC brands that may be ideal clients; contradicts the volume goal.
- **Reorder proof above the form.** Deferred — the dark page's visual rhythm (marquee → lede → form → belt → metrics band) is deliberate; moving the band is redesign risk disproportionate to this refinement. Left as a Non-Goal.
- **Calendar-booking (Calendly-style).** Rejected — the offer is a human callback; self-serve booking is a different, heavier product decision.
