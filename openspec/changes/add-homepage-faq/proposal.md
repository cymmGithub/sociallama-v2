## Why

The homepage has no question-shaped text anywhere on it. Every section speaks in brand voice — `WHY THAT WORKS`, `Usługi`, `HOW IT WORKS` — and none of it matches the phrasing a stranger actually types before they know the agency exists. The page currently has no text at all for the single highest-intent query in this market: **"ile kosztuje prowadzenie social media"**.

A source document of 12 drafted FAQ entries exists (`FAQ - Social Lama.docx`). This change lands six of them on the homepage.

### What an FAQ is actually worth in 2026

The obvious rationale — rich results — is dead. Google restricted FAQ rich results to **well-known, authoritative government and health sites in August 2023**. A commercial agency site gets no SERP accordion, no stars, nothing. Any proposal that justifies this section on snippet grounds is justifying it on a lever that no longer exists.

The three surviving reasons, in order of value:

1. **Answer-engine retrieval (AEO/GEO).** Q&A pairs are close to the ideal retrieval chunk: self-contained, short, and headed by the literal question. This is the surface that ChatGPT, Perplexity and AI Overviews quote from. It favours answers carrying **numbers, named entities and explicit comparisons**.
2. **Long-tail on-page text.** The homepage becomes eligible for query text it currently has no words for.
3. **Conversion.** Objection handling — price, timeline, "why not just hire someone" — placed where objections actually arise.

Criterion 1 and 2 both point the same way: select for **what a stranger types**, not for what the agency wants to say. That single test is what drives the selection below, and it is what disqualifies the most on-brand-sounding entries in the source document.

### Selection

Six of twelve, chosen against that test:

| Source # | Question | Why it's in |
|---|---|---|
| 2 | Ile kosztuje prowadzenie social media przez agencję? | Highest-intent query in the set; carries concrete price ranges |
| 5 | Czym różni się agencja od freelancera lub in-house managera? | Comparison queries are disproportionately cited by answer engines |
| 7 | Kiedy pojawią się pierwsze efekty…? | Carries the 466% / 1000% / 83% figures — the most quotable answer in the document |
| 9 | Jak mierzycie skuteczność działań w social media? | Real informational query; KPI list is well-structured for extraction |
| 10 | Jak wybrać dobrą agencję social media? | High-volume informational query, strong AI-Overview surface |
| 12 | Czy Social Lama działa tylko w Warszawie? | Local intent, and the most entity-dense answer in the set (Aflofarm, STAG, Press-Service, Pracuj.pl, Medicover, Manpower, Aquael; Pabianice, Białystok, Poznań, Warszawa) |

**Three entries were rejected for cause, not for space:**

- **#1 "Czym się zajmuje agencja Social Lama?"** duplicates `services.eyebrow` in `lib/content/home.ts`, which reads **"CZYM SIĘ ZAJMUJE SOCIAL LAMA?"** — the same question, verbatim, already answered by the Services section higher up the same page.
- **#6 "Jak wygląda proces współpracy…?"** duplicates `howItWorks.subhead`, which reads **"JAK WYGLĄDA WSPÓŁPRACA Z SOCIAL LAMĄ?"** — again verbatim, and already answered in five numbered steps. An FAQ row restating it in prose is a strictly worse second answer.
- **#4 "Jakimi platformami zajmuje się agencja?"** has no meaningful query volume in that phrasing.

The remaining six source entries (#3, #8, #11) are held for a possible dedicated FAQ page — see Non-Goals.

### Placement

The section goes **between `Testimonial` and `JoinCta`**, not after `NewsLama`.

An FAQ is objection handling. Placing it two sections *after* the call to action answers "isn't this expensive?" only for readers who already declined to convert, and leaves the page closing on a stack of collapsed rows instead of the NewsLAMA card. Social proof → objections → ask is the correct order, and it is what chapter 3 already almost is.

## What Changes

- **New `FaqSection`** in the chapter-3 (`plum-deep`) group of both homepages, positioned between `Testimonial` and `JoinCta`.
- **Built on native `<details>`/`<summary>`, not the repo's `components/ui/accordion` primitive.** This is the decision the whole SEO rationale rests on, and it is covered in `design.md` Decision 1. The short version: `<details>` renders its contents into the served HTML whether open or closed, so every answer is retrievable; the existing primitive is a `'use client'` Base UI `Collapsible` wrapping React's `<Activity mode="hidden">`, whose server output is unverified — and it has **zero usages anywhere in the app**, so nothing establishes it as the house pattern.
- **Layout: a numbered hairline ledger** (`01`–`06`), no card chrome, matching the full-bleed editorial rhythm the rest of the homepage already uses and reusing the numeral motif from `HowItWorks`. Chosen against two rejected alternatives, both built and reviewed as real mocks — see `design.md` Decision 2.
- **Heading `ASK` / `THE LAMA`**, two display lines with the second in `--color-contrast`, joining the `WHY / THAT WORKS` and `HOW / IT WORKS` family. It needs no translation, so both locales share it.
- **Copy lives in `lib/content/home.ts`** as a `faq` export with an EN mirror in `lib/content/home.en.ts`, following the established `content?: LocalizedHome['x']` prop pattern.
- **`FAQPage` JSON-LD**, server-rendered in each `page.tsx` alongside the existing `WebSiteJsonLd`, generated from the same copy array as the visible section so the two can never drift.
- **English locale included.** Five entries translate directly; **#12 is replaced**, not translated — Pabianice and Białystok are meaningless to an English reader. It becomes an international-reach question built from the same source answer's bilingual-communication material. Draft copy in `design.md` Decision 7.

## Capabilities

### Added Capabilities

- `homepage-faq`: The homepage SHALL present a set of frequently-asked questions as an expand/collapse list in the closing chapter, positioned before the join call to action, with every answer present in the served HTML regardless of expansion state, and described to search and answer engines with `FAQPage` structured data that matches the visible copy. The section SHALL be available in both the Polish and English locales.

## Non-Goals

- **No dedicated `/faq` page.** Source entries #3, #8 and #11 stay unpublished for now. A standalone page is the natural follow-up once these six prove out, and #11 (the GEO/AI-visibility answer) is the strongest differentiator in the whole document — but shipping a thin six-answer page that competes with the homepage for the same queries would be worse than shipping neither.
- **No migration of FAQ copy into Payload.** Every other homepage section keeps its copy in `lib/content/home.ts`; this follows that, and an editable-FAQ collection is a separate decision.
- **No adoption or deletion of `components/ui/accordion`.** It remains unused. Whether it should exist at all is already tracked as a deferred simplification and is not settled here.
- **No change to the existing chapter-3 sections.** `Testimonial`, `JoinCta` and `NewsLama` are untouched apart from the new sibling between the first two.

## Open Question

**"SoMe" in entry #7.** The source phrasing is *"Kiedy pojawią się pierwsze efekty prowadzenia **SoMe** przez Social Lama?"*. It was proposed that this be rephrased to drop both the abbreviation and the brand name — a branded question cannot match an unbranded query — and the decision was to **keep the source copy verbatim**. That decision is recorded and implemented as given. The concern being logged, not re-litigated: "SoMe" is marketing-desk shorthand, it is the only jargon among the six, and the target reader is a Polish business owner outside the marketing trade. Changing it later is a one-line copy edit in `home.ts`.
