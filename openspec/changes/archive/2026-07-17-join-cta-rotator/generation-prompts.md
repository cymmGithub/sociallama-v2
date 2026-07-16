# join-cta-rotator — generation prompts

Reference image: `public/clips/hero-poster.jpg` (character + style anchor).
Aspect 1:1. Every prompt = BASE + one accent clause. Accents are color-coded
props, not literal platform logos (models mangle trademarks; props keep the
set consistent and safe).

## BASE (identical for all nine)

> Studio portrait of the same white llama character from the reference image:
> black wayfarer sunglasses, beige button-up utility shirt, chest-up framing,
> facing the camera, calm confident expression. Perfectly flat, uniform
> deep-plum studio background, solid color #722341, no gradient, no vignette,
> no shadows on the backdrop. Photorealistic, soft even studio lighting,
> consistent with the reference image.

## Accents

| slug | token | accent clause |
|---|---|---|
| facebook | W FACEBOOKU? | The llama holds up one big glossy royal-blue thumbs-up sign. |
| instagram | NA INSTAGRAMIE? | The llama holds a white instant camera; two small square photo prints tucked in its shirt pocket, warm pink-to-orange gradient accent on the camera body. |
| tiktok | NA TIKTOKU? | The llama wears chunky black headphones with cyan and magenta neon glow accents on the earcups. |
| linkedin | NA LINKEDINIE? | The llama wears a navy blazer over the beige shirt and holds a slim leather portfolio case. |
| pinterest | NA PINTEREŚCIE? | The llama pins a small paper swatch to a tiny cork mood-board it holds; oversized crimson-red push pin. |
| x | NA X? | The llama holds a minimal matte-black square sign with a bold white letter X. |
| youtube | NA YOUTUBIE? | The llama holds a big glossy red rounded-rectangle play button. |
| strategia | W STRATEGII? | The llama holds a large white chess knight piece, contemplating it. |
| wideo | W WIDEO? | The llama holds a classic black-and-white film clapperboard, half open. |

## Post-processing

1. Prefer grading the near-plum backdrop to exact `#722341` (preserves fur edge).
2. Fallback: `remove_background` → composite onto `#722341` (sharp/ImageMagick).
3. Gate: `bun lib/scripts/verify-clip-bg.ts public/clips/cta-<slug>.jpg '#722341'`.
