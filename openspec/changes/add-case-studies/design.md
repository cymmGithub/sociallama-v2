## Context

The blog is a Payload collection (`posts`) rendered through `/[slug]` with `generateMetadata` + a `media` collection, and surfaced in `sitemap.ts`. Case studies mirror that pattern. Source content is three 16:9 PDF decks (iRobot, Pracuj.pl, Volvo); text is extractable via `pdftotext`, slides render via `pdftoppm`. The build is deliberately sequenced after two in-flight worktrees merge, because Postgres dev uses `push: true` and a new collection on the shared Neon dev DB would thrash or hang other running dev servers.

## Goals / Non-Goals

**Goals:**
- CMS-editable case studies consistent with the blog.
- SEO-first pages: unique metadata, JSON-LD, sitemap, semantic structure, internal links.
- Three real studies published with their metrics and visuals.

**Non-Goals:**
- Pagination (only 3 studies — add later if it grows).
- Content localization (site is Polish-only).
- Wiring the `home.ts` CTA in this change (deferred until `polish-homepage` merges — it owns that file).
- Building before the other two worktrees merge (DB safety).

## Decisions

- **Payload collection over static files** (user choice) — CMS-editable, consistent with blog; accepts the migration + sequencing cost.
- **`/case-studies` base** (user choice) — matches the button label and brand copy; slugs are client-based (`irobot`, `pracuj-pl`, `volvo`).
- **Structured `results[]` field** (`{ platform, metric, value }`) rather than freeform text — the per-platform numbers (YouTube/TikTok views, likes, subs) are the distinctive, shareable, SEO-valuable data and deserve structured rendering (metric tiles).
- **JSON-LD `Article` + `BreadcrumbList`** — schema.org has no "CaseStudy" type; `Article` is the honest fit, with the client as `about`. The blog currently ships no structured data, so this is a net SEO gain, not parity.
- **Embedded creatives via `pdfimages`, woven into pillars** (revised 2026-07-21 after user review) — full-slide `pdftoppm` renders read as "copy-pasted slides" (deck chrome, baked-in text, watermark). Instead: extract the decks' real campaign creatives (phone/laptop screenshots, lifestyle photos) with `pdfimages`, and model `approach` as a structured pillar array (`tag`/hashtag + heading + richText body + media[]) so copy is indexable HTML and creatives sit beside the narrative they belong to. A `client.about` richText carries the deck's "NASZ KLIENT" section. The flat `gallery` remains as a fallback for studies whose source PDF hasn't been provided yet (pracuj-pl, volvo — pending like iRobot's).
- **Listing page** — a `/blog`-style index is a genuine SEO hub (internal linking, a crawlable entry point), worth building even for three.

## Risks / Trade-offs

- **Shared dev DB thrash** → mitigated by sequencing (build only after the other two worktrees merge and close); own worktree; migration run `--prod` at merge.
- **PDF fidelity** → decks are image-heavy; text extraction is clean but slide images may need cropping. Mitigation: hand-pick slides, provide alt text; the user can supply cleaner assets if a slide is weak.
- **Draft leakage** → `for-sitemap` and listing queries must constrain `_status` to published, exactly as `getPostsForSitemap` does.

## Migration Plan

Generate the Payload migration for the new collection in the worktree (dev push against a clean shared DB post-merge). Run `--prod` at merge to apply it to the production DB, then seed/enter the three studies. Rollback is a git revert plus a down-migration.

## Open Questions

None blocking. Whether to later migrate the blog to also emit JSON-LD is out of scope here.
