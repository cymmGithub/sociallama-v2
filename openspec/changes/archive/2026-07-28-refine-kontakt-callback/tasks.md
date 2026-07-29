## 1. Copy (content module)

- [x] 1.1 In `lib/content/contact.ts`, rewrite `contactLede` from the open question to a short call to action with an emphasised (orange bold) CTA, e.g. `Masz pomysł albo markę do rozkręcenia? Napisz kilka słów i **umów bezpłatną konsultację**.` (Split into `{ text, cta }` so the hero can bold the CTA.) The 24h promise is carried by the "Co dalej?" strip and submit note, not the lede.
- [x] 1.2 Add `phone` copy under `contactForm.fields` — label `Telefon`, an `optional` marker (mirroring `services.optional`), and a callback-nudge placeholder (e.g. `Wolisz, żebyśmy oddzwonili? Zostaw numer.`).
- [x] 1.3 Add `contactStepsHead` (e.g. `Co dalej?`) and `contactSteps` — exactly three items `{ step, title, text }`: `1 Piszesz` / kilka słów wystarczy · `2 Odzywamy się` / w 24h, w dni robocze · `3 Gadamy o konkretach` / pomysły, zakres, następne kroki. No promise of finished deliverables.
- [x] 1.4 Align `contactForm.note` with the 24h promise so the submit-row reassurance is consistent with the lede.
- [x] 1.5 Add `contactForm.privacyNote` copy — one line stating data is used only to respond to the inquiry (including the callback), with link text pointing at `/polityka-prywatnosci`.

## 2. Optional phone field

- [x] 2.1 In `contact-form.tsx`, add an optional `Telefon` `InputField` (`type="tel"`, not `required`) reading its copy from `contactForm.fields.phone`; place it sensibly relative to the name/email pair.
- [x] 2.2 In `lib/integrations/email/action.ts`, extend the Zod schema with `phone: z.string().trim().optional()` (no strict regex — accept international/informal numbers) and include it in the email body (render `—` or omit the line when blank).
- [x] 2.3 In `contact-form.tsx`, render the RODO privacy note near the submit row from `contactForm.privacyNote`, linking to `/polityka-prywatnosci`.

## 3. "Co dalej?" strip

- [x] 3.1 Add `app/(frontend)/kontakt/contact-steps.tsx` — a section rendering `contactStepsHead` + the three `contactSteps`, styled to the dark page (numbered, hairline rhythm consistent with the existing metrics band). Use `lucide-react` icons only if needed (repo rule — no raw glyphs).
- [x] 3.2 Render `<ContactSteps />` from `page.tsx` between `<ContactHero />`/form and the brand belt.
- [x] 3.3 Add the scoped styles to `kontakt.module.css`; reuse `--color-orange` / `--color-cream` tokens; respect `prefers-reduced-motion` and visible keyboard focus.

## 4. Verification

- [x] 4.1 Typecheck + Biome clean; no hardcoded copy in components (all strings from `contact.ts`).
- [x] 4.2 Drive `/kontakt` in the browser: lede states the 24h callback offer, the three-step strip renders in order, the form still validates (blank phone submits fine, invalid email/empty required still blocked), the privacy note is visible and its link opens `/polityka-prywatnosci`, and a valid submit with a phone number delivers an email whose body includes the number.
- [x] 4.3 Confirm the page still returns 200 within site chrome and graceful SMTP-failure behavior is unchanged.
