# Hero Reference Merge

## Why

The user compared the shipped v2 hero against the reference build (`../sociallama`) and wants a merge of the two first-viewport treatments: the reference's hero clip (the 2026-07-08 take, presented big — full hero height, bottom-anchored right) and its client-logos belt look (sand band, "ZAUFALI NAM" heading, logos in real brand colors), while keeping everything v2 did better — minimal header, headline word rotator, socials under the headline, and the scroll-scrub machinery.

## What Changes

- **Hero clip swapped to the reference take**: `public/clips/hero.mp4` is replaced by the reference build's 3s take (1370×1080, 24fps, same wide right-anchored composition), run through the existing post-pipeline — global background tint to exactly `#892f53`, all-intra h264 with explicit colorspace tags, poster from frame 0, `verify-clip-bg.ts` gate plus browser-rendered pixel check. No trim; the full 3s scrubs across the existing 280vh runway. (User decision 2026-07-13: re-tint rather than port the reference's feather-gradient seam hiding — the seamless-composite convention stays.)
- **Hero clip presentation returns to reference geometry**: full hero height, bottom-anchored, right edge — the llama at hero scale again, replacing the current top-inset/shrunken placement. The clip's top edge stays clear of the fixed header band (the header's CTA/menu sit top-right).
- **Client-logos belt gets the reference visual treatment**: the belt sits on its own sand band with a centered "ZAUFALI NAM" display heading, logos render muted grayscale at rest with brand colors revealing only on hover (reference behavior; user correction 2026-07-13), and edge-fade gradients dissolve the track's ends. The white-silhouette resting state, its cream-theme flip, and the cream hover chip are removed (brand colors are legible on the light band without a chip).
- **v2 hover interaction kept**: pause-on-hover (mouse-like pointers only), testimonial cards with keep-on-screen shift, dim-others spotlight focus. Only the resting/reveal visuals change.
- **Light chapter ground becomes sand** (user addition, 2026-07-13, mid-implementation): the `cream` theme's `primary` switches from cream `#fbfaf6` to sand `#f0ece3` so the page's light chapter matches the belt band. Cream remains a surface color (testimonial cards, menu overlay). Theme name and chapter structure unchanged.
- **"THAT WORKS" is always bold orange** (user addition, 2026-07-13, mid-implementation): the big marquee's filled row switches from the chapter contrast slot (plum) to the orange palette token, and the why-that-works heading fill ends orange for "THAT WORKS" ("WHY" keeps the plum fill) — every homepage occurrence now mirrors the hero headline.
- **Why-that-works owns its sand ground** (user addition, 2026-07-13, chosen from seam mocks): the chapter morph fires at viewport center (~0.9s), leaving a scroll-beat where the section sat on hero plum with the sand belt sandwiched between two plums. A solid `sand` background on the section makes that state impossible; the morph keeps animating behind it. The equivalent seam at chapter 3 (testimonial on sand pre-morph) was mocked and explicitly left untouched (user decision).
- **Untouched**: header, headline + word rotator, socials placement under the headline, scrub machinery (track/pin/tempus loop, 280vh / HOLD 0.2 / lerp 0.35 / threshold 0.02), mobile clip and mobile layout, `BigMarquee`, everything outside chapter 1.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `homepage`: hero requirement — the bare right-anchored clip renders at full hero height, bottom-anchored (reference geometry), instead of the top-inset reduced-scale placement; the client-logos belt renders as a sand band inside the plum chapter.
- `hero-impressed-clip`: the committed clip becomes the reference build's 2026-07-08 take (3s, head-turn arc, no tail trim); framing/encoding/gate requirements apply to it unchanged; the acceptance-loop history is annotated with this reversion.
- `client-logos-marquee`: resting presentation changes from theme-matched silhouettes on the chapter background to brand-color logos on a sand band with a "ZAUFALI NAM" heading and edge fades; the spotlight requirement drops the chip/color-reveal (keeps dim-others); the cream-theme silhouette flip is removed.

## Impact

- `public/clips/hero.mp4`, `public/clips/hero-poster.jpg` — replaced by the tinted re-encode of `../sociallama/public/clips/hero.mp4` and its frame-0 poster. Mobile clip/poster untouched.
- `app/(home)/sections/hero/hero.module.css` — `.video` geometry: top inset/negative right bleed replaced by bottom-anchored full-height right-anchored placement with a header-clearance ceiling.
- `app/(home)/sections/client-logos/client-logos.module.css` — sand band background, heading style, edge fades, colored-logo resting state; silhouette filters, theme flip, and chip removed.
- `app/(home)/sections/client-logos/index.tsx` — heading element added; hover-card/pause logic unchanged.
- `lib/content/home.ts` — belt heading string ("ZAUFALI NAM") if not already present.
- **Prerequisite**: `hero-bare-clip` and `hero-client-logos-hover` are complete but not yet archived; archive both first so this change's deltas land on synced main specs (this change builds directly on their final state).
- No dependency, route, or API changes. No Higgsfield credits needed (reusing an existing take).
