## Context

`/zostan-lama` and its EN twin `/en/become-a-lama` were produced by the WP
content migration with the disposition "keep". Both import
`app/(frontend)/[slug]/post.module.css` and render inside `<Wrapper theme="cream">`.

The defect that forces this change is a CSS-module contract violation.
`post.module.css` was written so `.header` only works composed with `.stage` —
`post-article.tsx:128` does `cn(s.stage, s.header)`. The careers pages apply
`.header` alone, so `.lead` (`post.module.css:149`,
`color-mix(in srgb, var(--color-cream) 82%, transparent)`) renders cream on the
cream ground. Nothing errors; the hook paragraph and the application address are
simply invisible. Both roles are open, so this is live recruitment collateral
with an unreadable call to action.

Three directions were mocked at full fidelity on the repo's own tokens and
faces and reviewed. Direction **C** was selected: the dark conversion layout
built on `/kontakt`'s grammar, with the benefits band from direction A moved in
above the form, and the page truncated so the form is the final section.

Constraints inherited from the codebase:

- `/kontakt` already ships everything a form needs — `validateFormWithTurnstile`,
  `runFormAction` (IP rate limit + Zod via `parseFormData`), and a cached
  nodemailer SMTP transport that returns `null` rather than throwing when
  unconfigured.
- The form kit (`components/ui/form/fields`) exports `InputField`,
  `TextareaField` and `CheckboxesField` only. There is no file or select field.
- `next.config.ts` sets no `experimental.serverActions.bodySizeLimit`, so the
  Next.js default of 1 MB applies to every server action in the app.
- Content lives in `lib/content/<page>.ts` + `.en.ts` pairs behind a
  translation-parity gate; the careers copy is currently hardcoded JSX instead.
- Tight Exo 2 tracking doubles strokes at glyph crossings, which is why
  `/kontakt` and the footer use merged-union paths from `lib/wordmark-paths.ts`
  rather than stroked live text.

## Goals / Non-Goals

**Goals:**

- Remove the invisible-lead defect at the root, in both locales, by giving the
  route its own styles rather than patching a colour.
- Make the page read as part of the site by composing it from scoped sections
  in the established band idiom.
- Replace the `mailto:` CTA with a submission path that can carry a CV and
  capture recruitment consent.
- Reuse `/kontakt`'s verification, rate-limiting and delivery rather than
  introducing a parallel pipeline.
- Make the page reachable from site chrome.

**Non-Goals:**

- Per-role detail routes. Two roles fit in tab panels; a third would not force
  a rethink.
- Moving job content into Payload. Copy stays in content files.
- `JobPosting` structured data and Google Jobs eligibility. Worth doing, but it
  is additive and independent of this redesign.
- Applicant tracking, CV retention, or any candidate database.
- Restyling `/en/become-a-lama` copy beyond parity with the Polish page.

## Decisions

### D1 — Own CSS module; never import another route's

The route gets `zostan-lama.module.css` and colocated section components. The
alternative — keeping `post.module.css` and adding `.stage` to the header — was
rejected: it fixes one symptom while leaving a careers page rendered through a
blog-post template whose `--post-measure: 68ch` article column and
`calc(var(--safe) * 6)` closing allowance produce the narrow measure and the
dead trailing space that made the page look unfinished. It also leaves the same
cross-route coupling in place for the next editor to trip over.

### D2 — Band order puts the payoff immediately before the form

`ink-deep` (marquee, lede, role panels) → `orange` (benefits) → `plum-deep`
(application form) → footer chrome. Two reasons over placing benefits after the
form or omitting the band:

- The page is otherwise an unbroken dark scroll; the band is the only value
  break in it.
- It orders the argument correctly — requirements, then what you get, then
  apply — so the last thing before the form is the reason to fill it in.

Band edges stay hard, matching the `/o-nas` idiom. (The grain overlay that was
to unify the band with the page ground was removed — see D13.)

### D3 — The page ends on the submit button

No sections follow the form. The "what happens next" strip and team belt shown
in the original mock were cut. Nothing after a form does anything but push the
CTA up the page.

**Revised during implementation:** the response-time promise does not survive
anywhere on the page (client decision). The hero carries the WordPress page's
own copy verbatim (D12), which ends on its call to action, and the "Odpowiadamy
w 7 dni" line beside the submit button was removed. Nothing now states a
response time — which is the honest position, since no SLA was agreed. If one is
wanted later, the submit row is where it goes.

### D4 — CV travels as an email attachment; nothing is stored

nodemailer accepts `attachments: [{ filename, content }]` directly, so the
uploaded file is streamed from `FormData` into the outgoing message and
discarded. Alternatives rejected:

- **Vercel Blob** — introduces a retention obligation, a deletion policy, and
  access control for documents nobody needs after the mail is read.
- **Link-only ("send your CV separately")** — reintroduces the `mailto:`
  weakness this change exists to remove.

Consequence: delivery is bounded by the SMTP provider's message limit (25 MB on
Google Workspace), comfortably above the 5 MB cap.

### D5 — Size is enforced three times, deliberately

1. **Client**, before submit — the only place that can produce a readable
   message, because an oversized body never reaches the action.
2. **`serverActions.bodySizeLimit`** in `next.config.ts`, set above the file cap
   with headroom for the other fields.
3. **Server**, in the Zod schema — the client check is advisory and trivially
   bypassed.

The middle layer is why this is not purely a validation concern. Next 16.2.10
enforces the cap in `server/app-render/action-handler.js` as a stream transform
that counts bytes during body decoding and throws `ApiError(413, "Body exceeded
1 MB limit.")` (`E394`) **before the action function is invoked**. There is no
field to attribute that to, which is why the client-side check exists at all.

The cap applies to the whole multipart body, not the file alone, so it must
clear file + fields + boundaries. Multipart sends binary rather than base64, so
the overhead is bytes rather than megabytes: **6 MB** leaves roughly 1 MB of
headroom over the 5 MB file cap. Vercel Functions accept request bodies up to
100 MB, so this is nowhere near a platform ceiling.

`bodySizeLimit` remains under `experimental.serverActions` in 16.2.10
(`server/config-shared.d.ts:653`) and is global to every server action. Blast
radius is small — the contact form and the Shopify cart/customer actions — and
each is bounded by its own Zod schema, so a fat body still fails validation; it
merely costs bandwidth first. No action relies on the global limit for
correctness.

Two alternatives were considered and rejected:

- **Move the upload to a Route Handler.** `bodySizeLimit` is enforced only on
  the Server Action path, so `app/api/careers/route.ts` reading
  `request.formData()` would bypass it entirely. Rejected because it forfeits
  `useActionState`, the form kit wiring and the per-locale `FormState`
  plumbing — and, more importantly, the Origin/Host CSRF validation Server
  Actions apply automatically, which a route handler would have to reimplement.
  A bad trade for a 5 MB file.
- **Client-direct upload to Vercel Blob**, with the action carrying only a URL.
  Correct for genuinely large files, but it reintroduces the storage,
  retention policy, deletion job and access control that D4 exists to avoid.

### D6 — Type checking is an allowlist, not sniffing

Accept PDF and DOCX by declared MIME type **and** file extension. Magic-byte
sniffing was considered and rejected as disproportionate: the file is forwarded
to a mailbox and never parsed, executed, or served back, so the threat model is
"mail an operator a weird attachment", which their mail client already handles.
The allowlist exists to catch honest mistakes, and this reasoning should be
revisited if the file is ever stored or rendered.

### D7 — A separate server action, not an extension of `sendContactEmail`

`sendCareersApplication` lives alongside it and reuses the same helpers. Sharing
one action was rejected because the schemas, the subject line, the required
consent, and the appropriate rate-limit key all differ, and branching a single
action on a `kind` discriminator would make both paths harder to read. Turnstile
is validated in the action body before `runFormAction`, matching the existing
convention.

### D8 — New `FileField` and `SelectField` in the shared form kit

Both are missing from `components/ui/form/fields`. They go in the kit rather
than the page so they follow the existing field components' prop shape,
error-rendering, and label conventions — this is the second form on the site and
the first of many that will want a select.

### D9 — A generated wordmark path per locale for the marquee

`ZOSTAŃ LAMĄ` / `BECOME A LAMA` get merged-union paths from
`lib/scripts/gen-wordmark.py`, added to `lib/wordmark-paths.ts`. Live text with
`-webkit-text-stroke` was used in the mock and visibly doubles strokes where
glyphs cross — the exact problem the generator was written to solve.

### D10 — Footer link in the NAWIGACJA column, plus the overlay menu

Added to `lib/content/home.ts` and `home.en.ts`.

**Revised during implementation (user decision):** the careers link also goes in
the overlay menu, in its `utility` list directly after CASE STUDIES. The
original decision kept careers out of the menu on the grounds that its columns
are canonical service/industry lists — that argument holds for the *columns* and
does not apply to `utility`, which is already the O NAS / BLOG / CASE STUDIES
row. Two roles are open now, and a recruitment page reachable only from the
footer is under-advertised.

### D11 — The CV is required

**Decided during implementation (user decision).** The form was specified with
an optional attachment; it is now required, in the browser (`FileField
required`) and in the schema (`cvRequired`).

This is the one field whose requiredness the kit's default path cannot enforce:
a file input's `value` is a fake path that stays non-empty after a rejected file
has been cleared from `files`, so the registered-value check would read the
field as satisfied by a file that is no longer attached. `FileField` therefore
drives `setFieldValidity` directly — the same escape hatch the consent checkbox
needs, and for the same underlying reason (a control whose `value` does not
describe its state).

### D12 — The hero keeps the WordPress copy; no copy about the rebuild

**Decided during implementation (client decision).** The hero lede is the
original page's copy, verbatim, including its closing "Aplikuj śmiało
i kreatywnie" / "Apply — boldly and creatively".

The drafted replacements were rejected for a specific reason worth recording:
they described the change rather than the offer. The form heading read "Wyślij
CV **bez maila**" and its lede "**Bez maila, bez formularzy w PDF-ie**" — both
only mean anything to someone who saw the `mailto:` page this replaces. A
visitor has not. Copy on this site states what the visitor does, never what the
previous implementation made them do. The form heading is now the neutral
"Twoja kolej" / "Your turn", so the original call to action is not duplicated
between the hero and the form.

The consent clauses are client-supplied text for the same reason, and must not
be reworded without asking.

### D13 — The ground is flat: no glows, no grain

**Decided during implementation (client decision).** Mock C carried three
surface effects. All three are gone.

- **Plum glow behind the marquee** and **orange glow in the application band** —
  cut. `/kontakt` sets the house treatment for a dark canvas and has no light
  sources on it.
- **Grain overlay** — cut, and this one was a defect rather than a taste call.
  The overlay covered the page but not the fixed header, which paints the
  *identical* colour (`rgb(22,18,22)`, verified in the browser). Same colour,
  two textures: a seam ran across the top of every screen, and it read as the
  header being a slightly different shade. `/kontakt` has no overlay, which is
  why it shows no seam.

Consequence for D2: the orange band no longer "inherits the page's grain". It
does not need to — the hard ink→orange edge is the `/o-nas` band idiom on its
own, and `/kontakt`'s orange metrics band is flat for the same reason.

Anything reintroducing a page-level overlay must re-check the header edge.

## Risks / Trade-offs

- **Raising `bodySizeLimit` is global** → every server action can now receive
  6 MB bodies. Mitigated by keeping the cap modest and enforcing per-action
  bounds in each schema; no action relies on the global limit for correctness.

- **An oversized upload still degrades badly if the client check is bypassed** →
  the request is rejected by the Next.js runtime with no field-level error.
  Accepted: this requires deliberately defeating the client guard, and the
  server schema catches everything that does get through.

- **Turnstile runs after the body is parsed** → a large body is spent before
  verification. Accepted; the rate limiter, keyed on IP ahead of the schema,
  is the actual abuse control.

- **Recruitment consent wording is a legal artifact, not copy** → the RODO
  clause must be reviewed before launch rather than drafted to sound good. The
  form must not ship with placeholder consent text.

- **The orange band is the brightest surface on the page and sits above an
  orange submit button** → they compete for attention. Mitigated by the
  plum-deep form band separating them; if it still reads as competition in
  review, the band's grid cells desaturate before the button changes, because
  the CTA's colour is the one that must not move.

- **SMTP is fail-soft by design** (`getEmailTransport()` returns `null` when
  unconfigured) → a misconfigured environment silently accepts applications and
  delivers nothing. The action must return a failure state when the transport
  is absent, not a success toast.

- **Content parity is enforced by a gate, translations are not** → `.en.ts`
  will compile with Polish strings pasted in. The EN copy needs a real pass, not
  a shape-satisfying one.

## Migration Plan

No data migration; the change is a route rewrite plus one config value.

1. Land content files and the new sections behind the existing route paths —
   the URLs, sitemap entries, `llms.txt` entries, and the legacy WP redirect for
   `/zostan-lama/` are all unchanged.
2. Raise `serverActions.bodySizeLimit` and verify an at-cap upload end to end
   before the form is linked from the footer.
3. Add the footer link last, so the page is only advertised once it works.

Rollback is a revert: nothing outside the two routes, the shared form kit
additions, the footer content entry, and the config value is touched, and no
persisted state is created.

## Open Questions

- Final wording of the recruitment consent clause — needs sign-off, not
  drafting.
- Whether applications should also copy a second recipient, or whether
  `CONTACT_INBOX` alone is right for candidate CVs.
- Whether `JobPosting` structured data lands here after all. It is scoped out,
  but both roles are open now, which is exactly when it would pay off.
