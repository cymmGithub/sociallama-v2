## Context

Seven polish items off a client review. They are independent of each other but share one property that decides how they are packaged: four of them change behaviour that `openspec/specs/` states normatively, so each needs a delta alongside the code.

Current state, verified in the tree:

- `lib/content/home.ts:253` holds one canonical `socials` array, Instagram-first, consumed by the header overlay, footer, hero and `/o-nas` hero. `openspec/specs/site-nav/spec.md:56` pins that order.
- `lib/content/clients.ts` orders `ROSTER` alphabetically by key. Tagging all 31 brands by industry and testing cyclic adjacency (the belt sets `repeat={2}`, so last→first is a real seam) finds exactly two collisions: `dynamic-development`/`ed-invest` and `medicover`/`mercator`.
- `scripts/client-logos/pipeline.py` — `dematte()` correctly floods inward from the border, so enclosed counters survive as opaque pixels. `ink_from_plate()` then repaints every near-white pixel in the plate colour. On a knockout mark the counters are *plate*-coloured, not white, so they were already opaque and stay that way; repainting the glyphs the same colour merges glyph and counter into one silhouette. Confirmed by rendering both marks on plum and on white.
- The case-study card pass is **not** affected: `mono_ink()` keys on distance from the plate colour, so a plate-coloured counter measures zero distance and falls away by construction. Verified — `polomarket-logo-mono.png` has clean counters.
- `app/(frontend)/case-studies/[slug]/case-study.module.css` sets no `text-align` on `.prose` or `.pillarBody`; both are ragged-right.
- `app/(frontend)/o-nas/sections/team/index.tsx:310` renders `.surname` (small, `--color-secondary`) above `.given` (`h2` display utility, `--color-orange`). No cert chip exists anywhere in the slider — DIMAQ appears only as a sentence inside Magda Rokicka's bio.
- `certsLabel` in `home.ts:564` / `home.en.ts:334` is dead: nothing has read it since the team grid was redesigned.
- `app/(frontend)/(home)/sections/why-that-works/index.tsx` hardcodes `name: 'Ania Ozga'` in its `TEAM` array — not in `home.ts`, which is why a content-module search does not find it.
- The join-CTA `⋯` menu is a modal sheet: `role="dialog"`, `aria-modal="true"`, a scrim, an `onSheetKeyDown` Tab trap, a document-level Escape listener, and a body that swaps the option list for the chosen answer. That swap unmounts the focused button, which is why there is a focus-restoration effect carrying a `biome-ignore` and a comment explaining that `menuItem` is "a re-run trigger, not a read". `openspec/specs/join-cta-rotator/spec.md:78,92` require the dialog role and Escape-plus-focus-return behaviour.

Constraint from `openspec/specs/onas-team/spec.md:37`: where the client bio document and the site disagree on a role label, the site wins. The document says "Head of Social Lama" and "Content Creator"; the site keeps "Head of Social Media" and "Wideo Content Creator".

## Goals / Non-Goals

**Goals:**

- Every belt logo renders with its letterforms legible, satisfying the transparency requirement that already exists.
- No two brands of the same industry sit next to each other anywhere on the belt, and the rule is enforced by a test rather than by a comment.
- The `/o-nas` slider presents each member with the reversed name treatment, a fuller bio, and a certificate chip where one is held.
- The closing CTA reads the same on case-study, service and industry pages, and matches the header.
- Case-study body copy is justified without opening whitespace rivers.

**Non-Goals:**

- The case-study image audit — separate change (`audit-case-study-imagery`), because it edits Payload data rather than the repository and needs a per-image approval gate.
- Lifting the homepage's local `CERTS` registry into a shared module. The slider needs two entries; a refactor of a working surface is outside what these items ask for.
- Specifying the homepage certificate block. It is unspecced today (the archived `redesign-team-grid` homepage delta never landed in `openspec/specs/homepage/spec.md`); adding a caption does not oblige this change to close that gap.
- Justifying blog post bodies. `.prose` in `case-study.module.css` is a local rule set despite its comment claiming to mirror the blog, so the change scopes cleanly to case studies.
- Re-alphabetising or re-curating which brands are on the belt. Membership is fixed by `client-logos-marquee`; only order changes.
- Reworking the rest of the join-CTA post mock. The heart, save toast, share, comment thread and typewriter stay exactly as they are — only the `⋯` menu is reported as flaky, and only its copy is reported as needing warmth.

## Decisions

### D1 — De-cluster the belt with minimum moves, and enforce it with a test

Two entries move off the alphabetical base: `ed-invest` to just after `polomarket`, `mercator` to just after `riviera`. The other 29 hold their positions. Result verified: zero cyclic collisions.

`ClientBrand` gains an `industry` field, and `clients.test.ts` gains a test asserting no two cyclically adjacent entries share it.

*Why the field and the test rather than a comment:* the order is no longer alphabetical, which means it now looks arbitrary. Without machine-checkable intent, the next person to touch the roster re-sorts it and silently reintroduces the defect. The rule is only expressible with the data, so the data has to carry it.

*Alternative rejected — greedy largest-industry-first interleave.* It also reaches zero collisions, but it rewrites all 31 positions and degenerates its tail into a run of singleton industries in alphabetical order (`edukacja, elektronika, energetyka, fmcg, gastronomia, handel, horeca, hr, instytucja, kultura…`), which reads as accidental and concentrates every repeated-industry brand in the front half. More churn, worse result.

*Known limit, accepted:* the closest same-industry pair afterwards is `dpd`/`fm-logistics` at distance 3 (removing `ed-invest` from between them shortened that span from 4). A third move does not help — with four property developers in 31 slots something else drops to 3 — so the requirement is stated as **adjacency**, which is what was actually reported, not minimum spacing.

### D2 — Key the plate globally, but only for `plate_ink` marks

The fix is gated on the existing `plate_ink` option, which already marks exactly the two knockout sources. For those, plate-coloured pixels are cleared wherever they are, not only where they connect to the border; the glyph repaint then runs as before.

*Why gated rather than a change to `dematte()`'s default:* global keying is wrong for the other 29 marks, whose interior negative space is genuinely opaque artwork rather than show-through plate. It would also silently diverge the two passes, because `CS_INHERIT_OPTS = {"tol"}` deliberately does not carry `plate_ink` into the case-study pass — a default-behaviour change would reach that pass while the flag-gated one cannot.

*Why not hand-edit the two PNGs:* they are build artefacts. The next `pipeline.py --belt` run would overwrite the fix, and the contact sheet review would stop meaning anything.

POLOmarket's yellow sun must survive: it is far from the red plate, so a plate-distance key leaves it alone. Both marks get checked on the sand contact sheet the pipeline already emits, at belt resting treatment, not just at full size — that is where a half-keyed counter shows up.

Dependencies confirmed present: numpy 2.4.3, scipy 1.18.0, pillow 12.2.0, inkscape.

### D3 — Rename the name slots to positional classes, and move colour with the word

`.surname` → `.nameSmall`, `.given` → `.nameBig`, and `Details` renders `member.given` in the small slot and `member.surname` in the big one.

*Why rename:* a class called `.given` that renders the surname is the kind of lie that costs an hour later. The classes now name the slot, which is what the CSS actually styles.

Colour travels with the word (user decision): the small slot takes orange, the big slot takes cream. On `data-theme="plum"` (`--color-primary: #913155`), that means:

| slot | today | after | contrast on plum |
|---|---|---|---|
| small | cream `#faf9f5` | orange `#f09b39` | **3.41:1** |
| big | orange `#f09b39` | cream `#faf9f5` | **7.18:1** |

3.41:1 clears WCAG AA only under the large-text threshold (3:1). The small slot is `clamp(1.5rem, 2.6vw, 2.4rem)` at `font-weight: 700` — 24 px bold at its floor, so it is large text by the ≥18.66 px bold rule at every viewport, and the grade holds. Recording the arithmetic here so nobody has to re-derive it before touching the clamp: **the floor of that clamp may not drop below 18.66 px** while the slot is orange.

### D4 — Cert chip: cream pill carrying the unmodified mark

A member may carry `certs?: readonly CertKey[]`, with `CertKey = 'dimaq' | 'meta'` — both marks already ship in `/public/assets/certs/`. Only `'dimaq'` is used, by Anna Ozga and Magda Rokicka.

Rendered as a small cream pill with the mark at `objectFit: contain`, on its own row between `.role` and the `.bio` top border. Cream ground rather than tinting the mark onto plum: the homepage cert cards set that precedent for the same trademark reason — the mark is never recoloured, cropped or distorted. Accessible name comes from a label in the o-nas content module (the slider cannot read `home.ts`'s `certAlt` without coupling two content modules).

The "Posiadaczka certyfikatu DIMAQ Professional." sentence leaves both bios; the chip states it, and repeating it in prose is the redundancy the chip is meant to remove.

### D5 — Bios: the document's fuller text, normalised

Target band ~450–600 characters, up from today's ~230–290. The band matters more than the exact count: the slider's text column is sized by the incoming layer while the outgoing one is an absolute overlay, so bios of wildly different lengths make the column jump between steps.

Three normalisations against the source document:

1. Agnieszka Klajbert's bio is written in the first person ("Łączę pasję…") while all twelve others are third person. Converted to third person.
2. Role labels stay as the site has them, per `onas-team` spec.
3. The DIMAQ sentence comes out of Anna Ozga's and Magda Rokicka's bios (D4).

Przemysław Świercz is absent from the document and keeps his current bio.

EN bios in `o-nas.en.ts` are re-translated to the same fuller length. Leaving them short would break the `onas-team` requirement that both locales carry the same members with translated bios, and would show as a visibly thinner EN page.

### D6 — Justify body prose only, with hyphenation

`text-align: justify` + `hyphens: auto` on `.prose` and `.pillarBody`. `.lead`, headings and the tag/metric furniture stay ragged-right.

Hyphenation is load-bearing, not decoration: `.pillarBody` sits in a two-column pillar, and justified Polish in a narrow measure without hyphenation is what produces rivers. `app/(frontend)/layout.tsx:95` sets `lang="pl"` and the EN layout sets `lang="en"`, so the browser picks the right dictionary on both locales with no extra attribute.

*Alternative considered — justify the lead too, and rejected:* justification artefacts scale with type size, so the largest block is where a bad line is most visible, and the lead is a single short paragraph where the ragged edge costs nothing.

### D7 — The certificate caption reuses `certsLabel`

`certsLabel` currently holds the bare word `Certyfikaty` and renders nowhere. It becomes the caption sentence rather than a new key beside a dead one.

### D8 — The `⋯` menu becomes a non-modal dropdown with inline answers

Two changes, and the second is the one that matters:

1. **Non-modal.** A `button` with `aria-expanded` / `aria-controls` opens a dropdown anchored to it. `aria-modal`, the scrim and the Tab trap all go. Kept: Escape closes, an outside pointer-down closes, focus returns to the trigger, and the panel ends in the `/kontakt` link the capability requires.

2. **Answers open inline instead of replacing the list.** Each option becomes a disclosure: pressing it expands its answer directly beneath it and the list stays mounted.

*Why the inline answer is the actual fix, not the non-modal packaging:* the focus bug has one cause — the button holding focus unmounts when the list is swapped for an answer, so focus falls to `<body>`, outside the dialog, where neither the Tab trap nor a container-level Escape can reach it. The current code works around that with an effect that re-focuses on every `menuItem` change, and the `biome-ignore` above it is the tell. If nothing unmounts, there is nothing to restore, and both the effect and the ignore delete themselves. Going non-modal without this would keep the fragile part and only remove the safety net around it.

*Alternative rejected — keep the modal and fix the focus handling.* It is possible (render the answer while keeping the pressed button mounted and disabled), but it retains a scrim and a focus trap on a decorative card, which is the disproportion that produced the bug. A dropdown is also what was asked for.

*Alternative rejected — a native `<dialog>` element.* `showModal()` on iOS Safari brings its own top-layer and scroll-locking quirks, which is trading one platform-specific failure for another on a surface that does not need modality at all.

The three option texts are rewritten for warmth. The current set is dry and slightly smug ("Zgłoszone. Sami sobie. Rozpatrzone po naszej myśli."); the brief is more human and more creative, while keeping the one honest option the spec requires — the one that admits this is a page section rather than an ad.

### D9 — Shorten the X token (user decision), then size the heading from whatever token is widest afterward

Measured on the running site (token text extents via `Range`, against the media column's left edge; positive means the token crosses into the card's column):

| token | 1024 | 1152 | 1280 | 1366 | 1440 | 1512 | 1600 | 1680 | 1920 |
|---|---|---|---|---|---|---|---|---|---|
| `NA X (TWITTERZE)?` | **+39** | **+42** | **+50** | **+54** | **+54** | **+49** | **+38** | **+13** | −164 |
| `NA INSTAGRAMIE?` | **+6** | **+6** | **+11** | **+8** | **+11** | **+7** | −9 | −35 | −212 |
| `NA PINTEREŚCIE?` | −22 | −27 | −28 | −35 | −31 | −42 | −59 | −86 | −263 |
| `NA FACEBOOKU?` | −49 | −60 | −64 | −69 | −70 | −81 | −99 | −132 | −309 |
| `NA YOUTUBIE?` | −111 | −126 | −138 | −147 | −155 | −171 | −194 | −230 | −407 |
| `NA LINKEDINIE?` | −75 | −83 | −89 | −101 | −100 | −113 | −137 | −167 | −344 |
| `NA TIKTOKU?` | −150 | −170 | −189 | −201 | −214 | −229 | −258 | −295 | −472 |

Two tokens cross, not one. `NA YOUTUBIE?` is among the *safest*, not close — the near-miss is `NA PINTEREŚCIE?` at 22px.

The mask reports `overflow-x: visible`, and `maskWidth` equals the widest token's width at every viewport (838px at 1440, against a `copyRight` of 692). So the reserved box already overhangs the copy column before any word animates — the layout was never sized for the widest token.

**Decision 1 — shorten the X token.** The user chose to drop the locative ending: `NA X (TWITTERZE)?` → `NA X (TWITTER)?`, matching the un-inflected form `home.en.ts` already carries (`ON X (TWITTER)?`). Measured in the same DOM element (so font, weight and letter-spacing are exactly production's), this token drops from 838px to 795px at 1440 — **identical to `NA INSTAGRAMIE?`'s own width**, because both are now measured at the same value in this run. X stops being the binding constraint at every width in the table: its worst overflow was +54px (1366/1440), and the shortened form removes it entirely, leaving `NA INSTAGRAMIE?` as the sole outlier.

**Decision 2 — size the heading from the new widest token.** With X out of contention, `NA INSTAGRAMIE?` governs, at a much smaller overflow — +30 to +35px across 1024–1512, +14px at 1600, already clear by 1680. Solving `maskLeft + widestTokenWidth + gutter(24px) ≤ mediaLeft` per width needs a shrink of 5.4% at 1024, 4.9% at 1280, 4.4% at 1440, 3.7% at 1512, and 1.6% at 1600 — roughly **half** the ~10.7% the unshortened X token would have forced. A uniform ~5.5% reduction across 1024–1600 clears every measured width with margin; 1680 and above already clear and need no change. The final clamp is taken from a re-measurement after both changes land, not from this estimate.

*Why size from the widest token:* the rotator advances every 2600ms, so a layout that fits the active word is broken four seconds later. Sizing from the maximum is the only stable rule, and it is also what the mask's own box already implies.

*Why shortening X first matters:* it roughly halves the required clamp reduction, so the heading loses noticeably less presence than fixing this by clamp alone would have cost.

*Alternative rejected — widen the copy column / shrink the card.* It trades a heading problem for a smaller post card, and the card's chrome is already tuned to read as a real Instagram post at its current size.

*Alternative rejected — let the token wrap.* The token would break between `NA X` and `(TWITTER)?`, and the mask animation assumes one line per word.

### D10 — The logo carries the brand; the title stops repeating it, and takes the `alt` with it

The three proof cases and what happens to each:

| case | now | after |
|---|---|---|
| iRobot (PL) | `iRobot — humor i edukacja, które budują markę na YouTube i TikToku` | `Humor i edukacja, które budują markę na YouTube i TikToku` |
| Volvo (PL) | `Budowa marek Volvo na LinkedInie, Facebooku i Instagramie` | `Budowa marek na LinkedInie, Facebooku i Instagramie` |
| Pracuj.pl (PL) | `Pracuj.pl — humor, twórcy i filtr AR na TikToku` | `Humor, twórcy i filtr AR na TikToku` |
| iRobot (EN) | `iRobot — humor and education that build a brand on YouTube and TikTok` | `Humor and education that build a brand on YouTube and TikTok` |
| Volvo (EN) | `Building the Volvo brands on LinkedIn, Facebook, and Instagram` | `Building the brands on LinkedIn, Facebook, and Instagram` |
| Pracuj.pl (EN) | `Pracuj.pl — humor, creators, and an AR filter on TikTok` | `Humor, creators, and an AR filter on TikTok` |

Two of the three are a clean prefix strip (`Brand — `). **Volvo is not** — there the brand is woven into the sentence grammatically, so removing it is an edit rather than a deletion. `Budowa marek na LinkedInie…` still reads correctly, and "marek" (plural) still points at the two Volvo marks the study covers, which the logo names. Called out because it is the one title where the change is not mechanical and a reviewer should read it rather than skim it.

**The accessibility half is not optional.** The card is a single `<Link>` wrapping kicker, title, logo and CTA, and the logo renders `alt=""`. Verified on the running site at `/uslugi/influencer-marketing`: the link's visible text — which is its accessible name — is *"CASE STUDY Pracuj.pl — humor, twórcy i filtr AR na TikToku ZOBACZ CASE STUDY"*. Strip the brand from the title and that name becomes *"CASE STUDY Humor, twórcy i filtr AR na TikToku ZOBACZ CASE STUDY"* — a link to a case study that never says whose.

So `ProofCase` gains a required `brand` field and the logo renders `alt={item.brand}`. This is the correct pairing regardless of the redundancy fix: the logo *is* the brand name rendered as a picture, so `alt=""` was always understating it. The visual duplication the user objected to disappears, and the information does not.

*Why a required field rather than deriving the brand from `slug` or reusing `CLIENT_ROSTER`:* the roster is keyed by belt key, not by case-study slug, and three of these cases would need a mapping that exists nowhere. One explicit string on three entries is smaller than the lookup it would replace.

*Noted, not fixed here:* the same `<Image>` carries `width={140} height={44}` with no `mobileSize`/`desktopSize`, so it is requested at `w=3840&q=90` — a ~3840px source for a 140px box. That is a real payload defect at the exact element this change touches, but it is a performance concern rather than the reported one, so it is raised for a decision instead of folded in silently.

## Risks / Trade-offs

- **[MARCINOWSKA becomes the longest string in the big display slot]** — 11 characters against PRZEMYSŁAW's 10, and the CSS already carries a comment about PRZEMYSŁAW clipping above ~1700 px when a `ch` cap was applied. → Verify the slider at 390 / 768 / 1280 / 1920 and above 1700 px before calling this done; the `h2` clamp may need its ceiling trimmed.
- **[Longer bios change the slider's column height]** — `.details.exit` is absolutely positioned and `.text` takes its height from the incoming layer, so a step from a short bio to a long one can shift the layout mid-crossfade. → Step through all twelve members in both locales after the copy lands.
- **[Reordering the roster moves logos in the contact-page bands too]** — `/kontakt` and `/en/contact` map `CLIENT_ROSTER` directly. Intended, but `e2e/kontakt.e2e.ts` reads `CLIENT_ROSTER[0]`; `a1-karting` keeps first position so the assertion holds. → Run both e2e specs, from the repo root (per `e2e-from-a-worktree`, the Playwright config hardcodes `:3000`).
- **[Justification hides behind a browser dictionary]** — if `hyphens: auto` silently no-ops the result is rivers, not an error. → Verify visually on the narrowest pillar column, not just on the wide prose block.
- **[Regenerating logos rewrites all 31 belt PNGs]** — `pipeline.py --belt` normalises optical mass against the roster median, so any input change can perturb every output. Only two inputs change here, but the median is computed over the set. → Diff every emitted PNG; anything beyond `polomarket` and `mercator` moving is a signal, not noise.
- **[Orange on plum sits close to the AA large-text floor]** — 3.41:1 passes only because the small name slot is bold and ≥24 px. → Recorded in D3 as a constraint on the clamp.
- **[Dropping modality could lose accessibility the spec rightly required]** — the dialog role was not gratuitous; it guaranteed Escape and focus return. → The delta keeps both as explicit requirements on the dropdown, and the scenario list keeps a keyboard path. Verify with the keyboard only: open with Enter, walk the options with Tab, expand one, Escape, confirm focus is back on `⋯`.
- **[The flakiness is reported, not reproduced here]** — Safari/iOS behaviour was described by the user, not measured in this session, so "fixed" cannot be claimed from the code change alone. → The root cause is identifiable in the source (unmount under focus) and is removed by construction, but confirmation needs a real Safari/iOS pass, which is listed as a task rather than assumed.
- **[The rewritten menu copy is a voice judgement]** — "more human" is not testable. → Draft, show, adjust; the one spec-required option (admitting the section is not an ad) is preserved regardless of wording.
- **[An ~5.5% smaller join-CTA heading is a visible loss of presence]** — this section's whole job is to land a question hard. → Re-measure after both changes land and take the largest clamp that still clears every token at every width, rather than rounding down for safety.
- **[Shortening the X token is a grammar call, not just a layout fix]** — "na X (Twitterze)" is the fully inflected Polish form; "na X (Twitter)" leaves the parenthetical un-inflected, which is common for foreign brand names in casual Polish and is already how the English copy handles it, but it is still a copy change beyond the layout problem. → User decision, taken explicitly rather than assumed; recorded here so it is visible as a content change, not hidden inside a CSS fix.
- **[Dropping the brand from a proof title could read as a lost signal in search or link previews]** — the title is card text, not page metadata, so nothing indexable changes; but a card skimmed without images would no longer name the client. → The logo's new `alt` covers assistive technology and images-off rendering, which is where that risk actually lands.
- **[The overlap fix is tuned against measurements from one machine]** — font metrics are stable across platforms for a self-hosted display face, but the gutter is small at 1680 (+13px before the fix). → Keep a gutter, do not tune to zero clearance, and re-measure at every width in the table after the clamp change.

## Migration Plan

No schema, no migrations, no Payload data. Deployment is the ordinary branch → `bun run check` → rebase → push to `main` flow.

Rollback is a revert: the only build artefacts are the two regenerated PNGs, which the pipeline reproduces from committed sources.

Note for the diff review: `bun run build` is known to dirty `lib/content/home.ts`'s copyright year (`setup:styles` restamps it) — revert that hunk if it appears, it is not part of this change.

## Open Questions

- The eleven rewritten Polish bios and the certificate caption sentence are copy, drafted from the client document but not yet read by the client. Both are cheap to adjust after review; neither blocks the structural work.
- `.claude/worktrees/wf_6858f016-0d9-10/` is a leftover workflow worktree carrying its own `node_modules`. Unrelated to this change and left alone, but flagged since it turned up while searching for theme tokens.
