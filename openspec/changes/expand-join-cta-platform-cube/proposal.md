## Why

The join-cta section asks the visitor a good question — *"POTRZEBUJESZ WSPARCIA NA INSTAGRAMIE?"* — and then never answers it. The rotator names a platform every 2600ms, but nothing else on the screen reacts: the media column holds one static llama still, and the caption is the same joke for all nine tokens. A visitor who recognises their problem in the heading learns nothing about what we would actually do about it.

Two concrete problems sit underneath that:

- **The media column carries no meaning.** The looping clip was replaced by its first frame as a stopgap on 2026-07-22 (`TEMP` comment in `index.tsx`), so the column is a still image that never changes. It decorates; it does not inform.
- **The action row is a picture of an interface.** `Heart`, `MessageCircle`, `Send` and `Bookmark` render inside `aria-hidden="true"` — the card invites a gesture it cannot answer. On a page whose whole conceit is "we are good at social media", a dead like button is the wrong detail to leave dead.

The section needs the media column to respond to the word without turning into an asset factory. The answer is to change **what the llama is holding**, not the llama: the mascot stays put in one suit, and the platform cube it tosses swaps to whichever platform the heading just named. The llama's raised paw already gestures at exactly that spot.

The cubes cost nothing — `public/assets/cube-*.png` already exists for all seven platforms and already drives the platform section on `/uslugi/content`.

## What Changes

- **Rotator narrows from nine tokens to seven.** `W STRATEGII?` and `W WIDEO?` leave. They are disciplines, not platforms; once each token drives a platform cube and a platform services list, those two have nothing to point at. The seven survivors are exactly the seven `PlatformKey` values already defined for `/uslugi/content`.
- **A new mascot still replaces the current poster** — the llama in the navy double-breasted suit and burgundy cravat, tossing a social-media cube. Supplied as one RGBA PNG whose alpha splits cleanly into two components (llama 693×979, cube 140×145), so the cube can be lifted out and replaced at runtime.
- **The cube swaps with the rotator index.** One llama layer, one cube layer, seven cube assets pulled from the existing `public/assets/cube-*.png`. The cube is positioned as a percentage of the llama's own bounding box, so it stays at the paw at any card width. The swap is a pop, not a cross-fade — a thing being caught, not a slide turning.
- **Per-platform services copy appears**, distilled from the client-approved platform descriptions already in `lib/content/uslugi.ts` so the section cannot contradict `/uslugi/content`. **Placement is still open — see Open Questions.**
- **The action row becomes real controls.** Heart with progressive fill (starts part-filled, four clicks to full, then likes `1 024 → 1 025` and a payoff link to `/kontakt`); double-tap-to-like on the image; share that genuinely copies the link; save with a toast that routes to `/kontakt`; a comment thread that types out real client objections and their answers; and the `⋯` ad menu. Every gag terminates in the contact CTA.
- **The image well gains depth.** Flat `#913155` becomes the same plum with a light falloff toward the corners, so the cutout reads as a photograph rather than a colour swatch. One CSS gradient; no asset change.

Explicitly **out of scope** (see Non-Goals): the hero, Payload-managed copy, and a per-platform llama wardrobe.

## Capabilities

### Modified Capabilities

- `join-cta-rotator`: the heading rotates seven platform tokens instead of nine mixed ones; the media column becomes a static mascot with an index-driven platform cube rather than an independently-looping clip; the sponsored-post chrome gains per-platform services copy and genuinely interactive card controls.

## Non-Goals

- **No per-platform llama wardrobe.** Seven costumed llamas were explored and rejected as disproportionate: they required a generation pipeline, muzzle-template head anchoring and neck-contour repair to stop the mascot pulsing between slides, and they replaced a recognisable mascot with seven near-strangers. The seven looks are kept as reference (see Impact) but are not part of this change.
- **No carousel.** With one static mascot the card is one post, so there is no photo-changes-while-caption-freezes contradiction to solve. Dots, counter and slide machinery all fall away with it.
- **No hero changes.** The hero keeps its five discipline looks and its band-tear.
- **No Payload content type.** All copy stays in `lib/content/home.ts` and its EN twin. The section is chrome, not editorial content.
- **No claims we cannot support.** LinkedIn Ads and YouTube Ads are absent from the services copy because we do not offer them (confirmed 2026-07-28); those two platforms carry three items rather than four. X carries no ads item at all.
- **The superseded clip stays in the repo.** `public/clips/cta-llama-work.mp4` and its poster are no longer referenced but are not deleted.

## Open Questions

- **Where the services copy lives.** Option B (a second caption line inside the card) was chosen on 2026-07-28, but under the carousel premise — the argument was that a carousel's caption is where per-slide text naturally goes. That premise is gone. Option C (a chip list under the heading, in the left column, which is otherwise empty below the button) now keeps the card as a single coherent post with one joke, and fills real dead space. **The mock defaults to C and ships a toggle so both can be judged; this needs an explicit call before implementation.**
- **Cube art direction.** The supplied llama tosses a small white die with three flat logos. The repo cubes are larger, brand-coloured, and surrounded by floating platform icons. They read instantly and cost nothing, but they are a different visual language from the source image. If the die style is preferred, seven dice in that style would have to be produced.

## Impact

- **Modified code**:
  - `lib/content/home.ts` — `joinCta.rotator` drops to seven entries, each gaining a `platform` key (for the cube) and a `services` list. `joinCta.post` gains the comment-thread and ad-menu strings. `home.en.ts` mirrors it (the `LocalizedHome` parity gate enforces this).
  - `app/(frontend)/(home)/sections/join-cta/index.tsx` — mascot and cube as separate layers, cube swap on the rotator index, six interactions, thread and sheet.
  - `app/(frontend)/(home)/sections/join-cta/join-cta.module.css` — well gradient, stage/slot geometry, control states, thread, sheet, toast.
  - `lib/content/uslugi.ts` — untouched, but it is the source of truth the services copy is derived from.
- **New assets**: one mascot cutout at `public/assets/join-cta-llama.webp` (llama layer only, cube removed). No other new artwork — the seven cubes already ship.
- **Reused**: `public/assets/cube-*.png` (all seven, unchanged), `components/ui/image`, `components/ui/link`, `lucide-react` icons, `lib/hooks/use-rotator.ts` **unchanged** — no `stop()` is needed now that there are no dots.
- **Kept for reference, not shipped**: the seven costumed llama looks and their pipeline (`anchor2.py`, `defringe2.py`, muzzle template, prompts) move to `assets-src/join-cta-looks/` so the work and its findings survive. They are excluded from `public/`.
- **No new dependencies and no new env vars.**
- **Accessibility scope grows, and this is the real cost.** Four decorative SVGs become six interactive controls plus a modal sheet: labels, `aria-pressed`, focus rings, keyboard activation, `aria-live` on the likes counter, `Escape` and focus return on the sheet, and reduced-motion variants for every animation. This is more work than the visuals.
- **Payload**: none. No collections, migrations, or seeds.
