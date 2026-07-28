## Why

`HOW IT WORKS` spends **~300svh of scroll to deliver five one-line sentences**, and it feels empty because it is.

The section pins for `100svh + 5 × 40svh` (`how-it-works.module.css`) and lays all five steps out as glassy cards in a single row. Every card is on screen and legible within the first second — so the 200svh of extra scroll buys nothing but a border-colour change. Information per unit of scroll is close to zero, and no amount of restyling fixes that: the problem is that there is nothing left to reveal.

The second problem is the copy. Read the five steps as a stranger would:

> *Proaktywnie rekomendujemy nowe rozwiązania i możliwości.*
> *Analizujemy wyniki i wprowadzamy niezbędne zmiany.*

These are unfalsifiable. Every agency in the market says exactly this, which is precisely why it reads as filler. The section asserts a process and offers the reader no reason to believe any of it happened.

Meanwhile the proof exists and is sitting unused. The client reports contain, verbatim: a measured starting point before a single post went out, a per-platform content structure that visibly differs profile by profile, an AR filter the agency invented that the brief never asked for, and a channel whose subscriber growth jumped roughly twentyfold the year Social Lama took it over. None of it is on the site.

**This change replaces assertion with evidence, one exhibit per step.**

### Why the evidence gets redrawn instead of screenshotted

The first version of this work put actual pages of the report on the stage — a real document is hard to fake, and that was the whole argument. It was rejected on sight, correctly: the slides are 16:9, and at panel width their body text lands around 8px. **An unreadable document is not proof, it is texture.** Everything is now rendered natively in the site's own language — our typography, our cards, our charts, fed by the reports' numbers.

That trade has a real cost and it should be stated plainly: redrawn in our design, the evidence becomes agency-made content again, which is the thing that felt empty in the first place. Three deliberate choices claw the credibility back:

1. **Every number is real and attributable.** Nothing is illustrative, nothing is rounded for effect.
2. **Every panel names its client** and deep-links to the case study section that carries the same figure, so any claim can be checked in one click.
3. **Step 05 shows the actual document** — a real isometric render of three real report pages, legible enough to recognise as a report and no more.

### Why several brands instead of one engagement

The exploration originally threaded one client through all five steps, on the argument that a process is a sequence and only one continuous subject demonstrates a sequence. That argument was load-bearing **only while we were showing pages of one document**. Once every panel is redrawn, the continuity signal is gone anyway — so a mixed roster costs nothing and buys breadth: a global brand, a premium dealer group, and a market-leading platform, across TikTok, YouTube, Facebook, Instagram and LinkedIn.

The residual risk — that five exhibits read as five disconnected boasts — is handled by marking each panel with its client, so the section reads as a portfolio walk rather than a single implied story.

## What Changes

- **Layout: five horizontal cards → a left rail plus a single-exhibit panel.** The rail carries the five step sentences and the active-state treatment the cards have today; the panel to its right holds one visual per step. The pin, the five scroll beats and the sequential activation are unchanged.
- **One exhibit per step, each from a real client report:**

  | Step | Claim | Exhibit | Source |
  |---|---|---|---|
  | 01 | Określamy cele, potrzeby i możliwości | Line chart with axes: `1 168 → 6 222` obserwujących, plus `+57 911` polubień (×40) | iRobot |
  | 02 | Przygotowujemy indywidualną strategię | 2×3 diagram: two profiles × three platforms = six distinct content plans | Volvo |
  | 03 | Proaktywnie rekomendujemy | The unbriefed AR filter: `6,79 mln` views, `4 885` user films, plus the real filter page | Pracuj.pl |
  | 04 | Analizujemy wyniki i wprowadzamy zmiany | Before/after columns: annual subscriber growth `+597 / +300` → `+8 600 / +6 300` | iRobot |
  | 05 | Raportujemy nasze działania | Isometric render of three real report pages | Pracuj.pl |

- **Each panel is exactly four things**: an eyebrow with the client mark, one headline, one sentence carrying one or two figures, one visual, one link. Supporting copy runs 15–21 words. This is the second revision of the content model — the first carried a headline, a list, a chart, a conclusion box, a pull quote and a source caption per panel, and was cut for density.
- **Nothing is dated anywhere.** No years, no `dd.mm.yyyy`, no month names. Elapsed time is expressed as duration (*"sześć tygodni od umowy do pierwszego materiału"*, *"po 17 miesiącach"*). This is enforced by a build-time check, not by review — see `design.md` Decision 6.
- **Step 01 is deliberately not a numbered list.** The section already numbers five steps; a numbered list inside it repeats the device, and those goals run in parallel rather than in order, so numbering them was also untrue. It carries a baseline figure and a growth chart instead.
- **Mobile drops the dense detail and leads with the link.** Each card keeps its headline and single strongest visual; matrices, tags, pull quotes and conclusion boxes are hidden, and the panel ends in a full-width 44px pill link to the case study.
- **English locale included.** All new copy needs an EN twin; `Localized<>` parity is type-enforced, so it cannot ship half-done. Case-study slugs are shared across locales, so only the route prefix differs — the existing `caseStudyBase` prop pattern from `ClientLogos` applies.
- **New image assets**, all derived from files already published in case studies: one Pracuj.pl creative, three Volvo pillar frames, and one generated isometric report render.

## Capabilities

### Added Capabilities

- `how-it-works-proof`: The homepage process section SHALL present, for each of its five steps, one piece of concrete evidence drawn from real client work — a figure, a chart, a diagram or a real artefact — attributed to a named client and linked to the case study section that carries the same evidence. Claims SHALL NOT be dated; elapsed time SHALL be expressed as duration. On narrow viewports each step SHALL reduce to its headline, its single strongest visual and a link, with supporting detail deferred to the case study.

### Modified Capabilities

- `homepage`: the `steps` content surface grows from `{ number, text, image }` to carry per-step proof copy, client attribution and a case-study link; the how-it-works section's five step *cards* become a rail plus a single exhibit panel. Pin behaviour, scroll beats and sequential activation are unchanged.

## Non-Goals

- **No new Payload fields and no CMS migration of the proof content.** Five editorial choices belong in `lib/content/home.ts` next to the rest of the homepage copy. A `provesStep` field on `case-studies` was considered and rejected: it invites careless ticking, and it would add a homepage→Payload join at static-generation time, which this repo has already been burned by.
- **No changes to the step sentences themselves.** The five claims in `howItWorks.steps[].text` stay verbatim. This change surrounds them with evidence; it does not rewrite them.
- **No changes to the pin mechanics.** `useScrollTrigger`, the `40svh`-per-step cadence and the reduced-motion fallback are untouched.
- **No changes to other homepage sections.** `Services` above and `BigMarquee` below are not repositioned.
- **No new photography.** Every image already exists under `public/case-studies/`. Steps 01 and 05 carry no photograph because no genuine one exists — see Open Questions.

## Open Questions

**1. Client consent — three brands, three asks.** The section publishes iRobot's starting-point and YouTube growth figures, Volvo's content structure, and Pracuj.pl's AR-filter numbers and report pages. All of it is already public in the case studies except the iRobot baseline and the report pages. Short written sign-off from each is the safe path, and step 04 is the one that most needs it.

**2. Step 04 shows the metric that rose and omits the one that fell.** iRobot's YouTube subscriptions jumped roughly twentyfold under Social Lama; over the same period annual *views* fell from millions to hundreds of thousands, driven by a change in ad spend rather than content. The proposal ships subscriptions alone, which is normal case-study practice but sits awkwardly under a banner whose entire premise is "these words are real". A safe alternative is drafted and mocked: Pracuj.pl's audience-demographics chart with its written conclusion, which carries no such asymmetry but is less arresting. **Decision needed before implementation.**

**3. Step 05 has no call to action.** The label, client mark and case-study link were removed by decision, leaving headline, sentence and render. If this section is meant to be the homepage's on-ramp into `/case-studies`, the closing step was the last chance to send people there.

**4. The Pracuj.pl case study contradicts its own report.** The published study says `104,8 tys.` polubień for the whole engagement; the annual report says `+184 000` for a single year. Likes cannot shrink. This is a defect in already-published content, independent of this change, and it should be fixed before this section starts pointing readers at that page.

**5. Gendered address in step 05.** *"Wszystko, co widziałeś…"* is the only copy on the section that assumes the reader's gender; the rest of the site uses neutral forms. *"co widzisz"* fixes it in one word and reads stronger. Recorded, not re-litigated — the current wording is as decided.
