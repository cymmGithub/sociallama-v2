# Design — redesign-blog-covers

## Context

One `cover` upload per post feeds five surfaces at three crop ratios:

```
post.cover (shared PL+EN, NOT localized)
 ├─ hub lead        16/9    (blog.module.css .leadMedia)
 ├─ popular card    16/10   (.popularMedia)
 ├─ grid card       16/10   (.cardMedia, also category pages + related rail)
 ├─ post header     4/3     (post.module.css .cover — right column, NOT full-bleed)
 └─ OG fallback     1200×630 (media size `og`, crop center)
```

The 22 target covers (from `content/media/image-audit.json`, all verified against prod):

| Group | Ids | Problem |
|---|---|---|
| 15 title cards | 9, 21, 23, 25, 128, 227, 231, 233, 235, 237, 239, 241, 250, 252, 256 | Polish headline baked into ~16:9 art; 4/3 crop amputates it in both locales |
| 2 series-brand cards | 259, 265 | "OKIEM SOCIAL LAMY" / "NOWA SERIA NA BLOGU!" — closer to content than label |
| 3 LAMÓWKA roundups | 28, 29, 31 | Polish news headlines that are content found nowhere else on the page (`recreate`, blocked) |
| 2 IG screenshots | 179, 180 | Full-screen Polish Instagram dialogs (`replace`, blocked) |

Category spread of the 22 posts (prod probe, 19 resolved + 3 by inspection):
`marketing` ≈ 7, `social-media` ≈ 6–7, `reklama` 4, `seo` 3–4. Five posts belong to the
LAMÓWKA series (the 3 roundups, the series announcement, and the "spookily good Halloween"
post — final membership to be confirmed by slug prefix `lamowka-` at apply time).

Constraints inherited from prior work:

- `cover` and `seo.ogImage` are not localized (`lib/payload/collections/posts.ts`); one
  write serves both locales. This change *keeps* that.
- One media id serves as both a cover and an in-body image — file replacement on existing
  rows is unsafe; relation repointing is not.
- `media.alt` IS localized, and blog queries use `fallbackLocale: false` — a new row needs
  alt written in BOTH locales or one locale renders `alt=""`.
- The alt gate treats `content/media/alts.en.json` as source of truth; any direct alt write
  must update it in step or the next `--apply` run reverts it.
- Higgsfield: no generation without explicit per-batch user OK. Style consistency across a
  batch is the known failure mode; the working recipe is nano_banana_pro framed as an image
  edit against a fixed reference asset.
- The audit and all content work must run against `DATABASE_URL_PROD`; the local dev DB
  holds 1 of the 22 posts and produces silent-success empty runs.

## Goals / Non-Goals

**Goals:**

- Every one of the 22 covers becomes language-agnostic artwork that composes at 16/9,
  16/10 and 4/3 without losing meaning.
- The library reads as one visual system: shared style anchor, category-coded accents,
  ~11 pieces total.
- The LAMÓWKA series keeps a recognizable identity via one dedicated series cover.
- The 5 blocked verdicts in the audit artifact resolve; `localize-blog-image-text` becomes
  archivable.
- A future post needs an assignment rule, not a design task.

**Non-Goals:**

- No rendering changes: hub, cards, post header layout and CSS are untouched.
- No schema change: `cover` stays non-localized — that is now the point, not the debt.
- The other 57 covers, the compact-card hub redesign, and the 22 in-body English captures
  are other changes' work.
- No OG template system (Satori title-in-image rendering) — `og:title` carries the
  headline; revisit only if social CTR visibly suffers.

## Decisions

**D1 — Library of ~11 reused pieces, not 22 bespoke covers.**
3 variants × {marketing, social-media}, 2 × {reklama, seo}, 1 LAMÓWKA series cover.
Each variant lands on ~2 posts; assignment avoids the same art on adjacent posts in the
default hub ordering. *Alternatives rejected:* per-post bespoke generation (most credits,
least consistency — the Webflow look is a system, not 22 one-offs); programmatic SVG
templates (cheapest and perfectly consistent, but the user chose llama artwork, and the
brand already has a proven generative pipeline).

**D2 — Style anchor = the painted mascot cast on sociallama.pl.** *(revised 2026-07-31)*
Generation runs as nano_banana_pro image-edits against a fixed reference, varying motif and
category accent per piece.

> **Correction.** The original D2 read the user's "the llamas from sociallama.pl" as meaning
> the repo's photoreal hero-llama assets, on the stated grounds that "that domain's only
> llama is the logo". **That is false and was never checked.** sociallama.pl's WordPress
> media library is open (`/wp-json/wp/v2/media?search=lama`) and holds a full painted mascot
> cast — `seo_lama`, `lama_szkolenie`, `lama_kontakt`, `lama_maratonczyk`, `lama_klient`,
> `zostan_lama`, `lamy_stadko`, and more. The user confirmed these are what they meant. The
> repo's `lama-fotograf.png` / `lama-manifest.png` / `lama-dolacz.png` belong to this same
> family and are its highest-resolution members.
>
> Cost of the error: 14 Higgsfield credits spent on four photoreal pieces, now off-style.

The anchors are painterly digital illustration — expressive cartoon llamas in a warm
saturated cast (yellow, orange, pink, purple, magenta), hand-painted fleece, props with
personality. **Not** the photoreal anthropomorphic treatment used by the hero and o-nas.

Constraint this introduces: the mascot files top out at 500×500, far under the 2560×1600
master. They are style *anchors* for generation, not source art to composite — the same
image-edit mechanism as before, pointed at the right references.

**D3 — One text exception: the LAMÓWKA wordmark.**
"LAMÓWKA" is a brand name the English titles keep verbatim, so it may appear in the series
cover artwork. Everything else is strictly text-free — including English text, which would
just recreate today's problem mirrored.

**D4 — Master format: 16:10 at ≥2048px wide, composed center-safe.**
16/10 is the majority crop (grid + popular). The acceptance test per piece: the focal
subject survives cropping to the central 4/3 *and* extending to 16/9 — checked before any
cover is applied, on the real surfaces, not by eyeballing the master.

**D5 — Apply = new media rows + relation repoint; never file replacement.**
Upload each library piece once (~11 new rows), then repoint the 22 posts' `cover`
relations via a script with `--apply` gating and a dry-run default, mirroring
`repoint-en-images.ts`. Old rows stay untouched (rollback = repoint back; the audit
artifact records old→new id pairs). The cover/in-body shared id is safe by construction.
`seo.ogImage` is left alone — where unset, the new cover flows into OG automatically.

**D6 — Alt text policy for library art.**
Reused abstract art gets *library-level* alt (per piece, both locales, descriptive of the
artwork: "Abstrakcyjna ilustracja lamy…" / "Abstract llama illustration…"), not per-post
alt. Covers here are decorative brand art, not informative screenshots; inventing 22
distinct descriptions of 11 images would be noise. `alts.en.json` updated in step (the
gate's source-of-truth hazard).

**D7 — Audit artifact is updated, not bypassed.**
Each of the 22 entries gets its resolution recorded on the existing entry (superseding
cover id + date), keeping the ids stable for the next locale's incremental audit. The 5
`blockedBy` markers clear. The merge-safety fix in `audit-blog-images.ts` (spread prior
entry first) already protects these new fields from future re-runs.

## Risks / Trade-offs

- **[Batch style drift]** Generated pieces don't read as siblings → fixed reference asset
  per D2, generate in one session, and the user reviews the whole library on a contact
  sheet *before* any upload; regenerate outliers, not the batch.
- **[Prompt rewriting]** soul_2-style silent prompt rewrites produce off-brief art → use
  nano_banana_pro as image edit (known-good), verify each output against the brief, never
  chain-accept.
- **[Mixed hub aesthetic]** 22 abstract covers next to 57 photo covers → accepted
  deliberately; scope is "fix the broken ones first". If the clash grates, extending the
  library to more covers is additive follow-up work with the same system.
- **[Series membership ambiguity]** Which posts are LAMÓWKA is defined by slug prefix +
  title check at apply time; miscounting just means a category variant lands where the
  series cover should — visible in review, trivially repointable.
- **[Social preview regression]** Losing baked-in headlines in OG images → accepted;
  `og:title` carries the headline. Revisit with a Satori OG template only on evidence.
- **[Silent empty run]** Local DB has 1 of 22 posts → every script hard-requires `--prod`
  for this work and asserts it found exactly the expected post count before writing.
- **[Stale caches]** Covers feed hub/category/related/OG in both locales → revalidate
  `posts` + `blog-hub` tags and re-check with the read-twice rule (first read serves
  stale).

## Open Questions

- Final category variant counts once the 3 unresolved posts' categories are confirmed at
  apply time (affects whether marketing gets 3 or 4 uses per variant, not the library size).
- Whether the 2 IG-screenshot posts (179, 180) read better with category art or with a
  purpose-made "platform news" motif from the same library style — decided at contact-sheet
  review.
