## Decision 1 — Native `<details>`, not `components/ui/accordion`

**Decision:** build the disclosure on native `<details>`/`<summary>`.

The entire value of this section is that crawlers and answer engines can read answers that a human has not clicked. That makes "is the collapsed answer in the served HTML?" the load-bearing question, not a detail.

`<details>` answers it definitionally. The element renders its full contents into the document regardless of the `open` attribute; collapsing is a paint-time concern. Every answer is in the initial HTML response, with no JavaScript involved at all.

The repo's alternative does not obviously answer it. `components/ui/accordion` is `'use client'`, built on Base UI `Collapsible.Panel`, wrapping children in React 19's `<Activity mode="hidden">` and driving height from a `useResizeObserver` measurement. Whether hidden `Activity` subtrees appear in the server-rendered stream is unverified here, and if they do not, this section's SEO rationale evaporates silently — the page would look correct in a browser and be empty to a crawler. That is exactly the class of failure that is expensive to notice.

Two facts make choosing native cheap rather than a deviation:

- **The primitive has zero usages.** `grep -rn "Accordion" --include="*.tsx" app components`, excluding its own directory, returns nothing. It is an unused Satus-template leftover, so not using it breaks no established house pattern.
- **Native gives away nothing we need.** Keyboard operation, focus handling and the `button`-like `summary` role come free and correct. Chrome, Safari and Firefox have all shipped `::details-content`.

**Consequence:** this section deliberately does not consume a UI primitive that exists. `design.md` is where that is on the record so a future reader does not "fix" it.

## Decision 2 — Numbered ledger layout

Three full mocks were built with the real copy on the real `plum-deep` tokens and reviewed as rendered pages, not descriptions.

| Mock | Shape | Outcome |
|---|---|---|
| **A** | Hairline rows, `01`–`06` numerals, no card chrome | **Chosen** |
| B | Sticky heading + CTA left, bordered cards right | Rejected |
| C | No accordion; two-column grid, all answers always visible | Rejected |

**Why A.** It is the only one already speaking the homepage's language: full-bleed sections, big Exo 2 display type, hairline rules and no container chrome is what `WhyThatWorks`, `Services` and `BigMarquee` all do. The `01`–`06` numerals reuse the motif `HowItWorks` established with its five steps. Collapsed, all six rows occupy roughly one viewport, so `JoinCta` is not pushed far down the page.

**Why not B.** The sticky left column runs out of content around 40% of the way down and leaves a large empty plum field at desktop widths — visible in the mock, not hypothetical. Six rounded, bordered cards also introduce chrome that appears nowhere else on the homepage except NewsLama's single card; repeated six times it reads as a different site's section. **B's heading was kept** — see Decision 3.

**Why not C.** C exists to be maximally crawlable, and Decision 1 removes its reason to exist: with native `<details>`, A is equally crawlable. What remains is ~700 words of body prose immediately before the call to action, which flattens the momentum the Testimonial builds and reads as a footer block rather than a homepage section.

## Decision 3 — `ASK` / `THE LAMA`

Taken from mock B. Two display lines, second line in `--color-contrast`, joining the `WHY / THAT WORKS` and `HOW / IT WORKS` family. Being English already, it is shared verbatim across both locales, matching how those two siblings behave. A Polish eyebrow line above it carries the actual "najczęściej zadawane pytania" signal for readers and crawlers.

## Decision 4 — Multiple rows may be open at once

No `name` attribute on the `<details>` elements, so this is **not** an exclusive accordion.

Native `name` grouping would give single-open behaviour for free, but with rows this tall, auto-closing a row *above* the one being opened removes content from above the viewport and yanks the page under the reader's cursor. Independent rows avoid that entirely and let a reader compare the price and the freelancer-comparison answers side by side.

**Row `01` ships with `open`.** It is the price question, it is the most-wanted answer, and having one answer visible on arrival stops the section reading as a wall of unexplained headings.

## Decision 5 — Animation, and its graceful failure

Height animation via `::details-content` with `interpolate-size: allow-keywords`, transitioning `block-size` from `0` to `auto` alongside `content-visibility` with `transition-behavior: allow-discrete`.

Where `interpolate-size` is unsupported, rows snap open instead of sliding. **This is acceptable and must not be worked around** — every alternative (JS height measurement, `max-height` guessing, adopting the Base UI primitive) costs more than the animation is worth, and the snap is a normal disclosure behaviour, not a visual defect.

Reduced motion is handled by the global `--reduced-motion` rule already in place for `Chapters`; verify the transition is neutralised rather than assuming it.

## Decision 6 — Reveal style must not be `wipe`

The section uses `useReveal` with `data-reveal-item`, like its chapter-3 siblings — but explicitly **not** `data-reveal-style="wipe"`.

The wipe treatment retains a border-box `clip-path` after the reveal settles. Static content tolerates this; content that *grows after settling* does not. An answer expanding below the clip rectangle would be silently sliced, and the failure is invisible to DOM assertions — it only shows in a screenshot of the settled, expanded state. The default translate/fade reveal has no clip and no such interaction.

## Decision 7 — English set, and the entry that is authored rather than translated

Entries #2, #5, #7, #9 and #10 translate directly.

**#12 is replaced.** Its Polish answer is a local-SEO instrument — Warszawa, Pabianice, Białystok, Poznań — and none of that signal exists for an English reader. The replacement asks the equivalent question for that audience, built from the same source answer's own material about bilingual communication and foreign markets:

> **Do you work with brands outside Poland?**
>
> Yes. Our office is in Warsaw, but we work with clients across Poland and run a share of our projects as bilingual communication aimed at foreign markets. Brands we've worked with include Aflofarm, STAG (AC S.A.), Press-Service Media Monitoring, Pracuj.pl, Medicover, Manpower and Aquael. Briefs, status meetings and reporting all run remotely, so where you're based makes no difference to us — what matters is fitting the strategy to your goals.

Voice follows the established EN locale register: playful-but-clean, American spelling.

## Decision 8 — One copy array feeds both the section and the schema

Google requires `FAQPage` structured data to match the visible page content; drift between the two is a markup violation, and hand-maintained duplicates always drift.

The `faq.items` array in `lib/content/home.ts` is therefore the single source for both the rendered rows and the JSON-LD. The JSON-LD is emitted **server-side from `page.tsx`**, next to the existing `<WebSiteJsonLd />`, rather than from inside the `'use client'` section component — structured data has no reason to depend on hydration.

The English page emits its own `FAQPage` from `home.en.ts`, so each locale describes the questions it actually shows.

Worth being clear about the expected return, so nobody measures this against the wrong benchmark: **this markup will not produce a rich result.** FAQ rich results have been restricted to authoritative government and health sites since August 2023. It is included because it is ~15 lines, it is parsed by answer-engine crawlers, and it makes the Q&A structure explicit rather than inferred.

## Decision 9 — Chapter composition

Chapter 3 is a single JSX fragment whose position in `Chapters`' children array *is* its chapter index — both homepages carry a `biome-ignore lint/complexity/noUselessFragments` comment marking the fragment as load-bearing. The new section is added **inside** the existing fragment. Introducing a wrapper element, or lifting the section out of the fragment, silently reassigns chapter indices and breaks the background morph.

The two locales differ in this chapter and must both be edited: PL is `Testimonial → JoinCta → {newsPost && <NewsLama/>}`, EN is `Testimonial → JoinCta` (the blog, and therefore NewsLAMA, is Polish-only).

## Risks

| Risk | Mitigation |
|---|---|
| Answers absent from served HTML — the failure that would void the whole change | Decision 1; verified explicitly by `curl \| grep` against the raw response, not via DevTools, which shows the hydrated DOM |
| JSON-LD drifting from visible copy | Decision 8 — one array, two consumers |
| Expanded answer clipped by a settled reveal | Decision 6; verified from a screenshot of the expanded state |
| Section lengthens the path to `JoinCta` | Collapsed height held to roughly one viewport; measured, not assumed |
| Chapter indices shift and the background morph breaks | Decision 9; verified by scrolling all three chapters after the edit |
