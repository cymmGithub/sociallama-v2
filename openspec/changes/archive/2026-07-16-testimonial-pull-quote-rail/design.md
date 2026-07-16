# Design: testimonial-pull-quote-rail

## Context

`app/(home)/sections/testimonial/` currently renders a centered fade-carousel with dots and arrows; all layout in `testimonial.module.css`, content from `testimonials` in `lib/content/home.ts`. The approved mock (Makieta 1, https://claude.ai/code/artifact/8ec92feb-a5f3-4386-92c1-121da81f08a5) was validated interactively at 1440 px and 390 px, including the 7 s autoplay rhythm and hover-pause. The services section (`services-autoplay-tabs` spec) already establishes an autoplay-with-visible-progress pattern on this page.

## Goals / Non-Goals

**Goals:**
- Implement the mock 1 layout and interaction exactly as specced in `specs/testimonial-rail/spec.md`.
- Keep the section a drop-in replacement: same content module, theme, reveal, and blur-gate contracts.

**Non-Goals:**
- No changes to the client-logos marquee hover-card quotes, services tabs, or any other section.
- No new testimonial content beyond pull-phrase fields; no CMS.
- No shared "autoplay" abstraction with the services tabs — two usages don't justify one (revisit if a third appears).

## Decisions

- **Pull-phrase data model**: extend `Testimonial` in `lib/content/home.ts` with `pull: { before?: string; highlight: string; after?: string }` — three plain-string segments instead of embedded markup or character offsets. Rationale: keeps content module free of JSX/HTML, renders trivially as `before <mark>highlight</mark> after`, and offsets are brittle against copy edits. Alternatives considered: raw HTML string (rejected: markup in content), offset ranges (rejected: brittle).
- **Approved pull-phrases** (from the mock; Uniphar's is a rephrased excerpt — needs sign-off, tracked in tasks):
  - iRobot / Radomska: "Z pełnym przekonaniem **możemy ją polecić**."
  - Uniphar / Szwat: "Projekty, które wymagają **wyjścia poza szablon**."
  - STAG / Jemiejłańczuk: "**Proaktywność, kreatywność** i zaangażowanie."
- **Autoplay engine**: `setTimeout` chain + `performance.now()` bookkeeping for hover pause/resume (store remaining ms on `mouseenter`, reschedule on `mouseleave`); progress bar is a CSS `scaleX` animation on the active row, `animation-play-state: paused` while a `data-paused` attribute is set on the section. Rationale: the CSS animation restarts naturally when `aria-selected` re-applies, so JS and CSS stay in sync without rAF bookkeeping; this is the mock's proven implementation. Alternative considered: rAF-driven width updates (rejected: more code, main-thread work every frame for a 7 s fill).
- **Touch stops autoplay permanently, hover pauses temporarily**: hover signals "reading", touch selection signals "I chose this one". Detect via `matchMedia('(hover: none)')` rather than user-agent sniffing. Swipe (kept from the current implementation) counts as manual selection.
- **Directional transition via stacked grid**: keep the existing one-grid-cell technique (reserves tallest-slide height, zero layout shift) and add a `data-leaving` attribute that overrides the default enter-from-right transform with an exit-to-left transform for ~500 ms. Selector order matters: `[data-active="true"]` must be declared after `[data-leaving="true"]` so the active slide wins the cascade (equal specificity).
- **Reveal + blur gate unchanged**: keep `useReveal` on the section root and `data-blur-edge-gate` (byline/rail sit low on short desktop viewports).
- **`prefers-reduced-motion`**: checked once in JS to skip scheduling entirely, plus a CSS block that kills the progress animation and slide transitions — belt and braces, matching the current file's pattern.

## Risks / Trade-offs

- [Autoplay advances while a slow reader is mid-quote on desktop without hovering] → 7 s per ~4-line quote is tight but hover-pause is the natural reading posture; if feedback says otherwise, bump the constant (single `CYCLE` value).
- [Pull-phrases are derived copy shown under a client's name] → full quote stays verbatim alongside; Uniphar rephrase flagged as a launch blocker in tasks until signed off.
- [CSS animation and JS timer could drift apart on pause/resume] → both are driven by the same `data-paused` attribute and the same remaining-time value; verified in the mock (8 s hold, resume from same fill).
- [Lenis smooth-scroll and the swipe handler share touch gestures] → unchanged behavior from the current section (user confirmed swipe works today); scroll-snap migration explicitly out of scope for this change.

## Open Questions

- Uniphar pull-phrase sign-off ("Projekty, które wymagają wyjścia poza szablon" vs the verbatim "…do realizacji projektów, które wymagają wyjścia poza szablon") — blocking launch, not implementation.
