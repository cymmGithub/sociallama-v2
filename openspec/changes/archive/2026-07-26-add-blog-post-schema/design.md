## Context

Blog posts live at root-level slugs (`/{slug}`), rendered by `app/(frontend)/[slug]/page.tsx`; listing cards come from the shared `app/(frontend)/blog/post-card.tsx` (used by `/blog` and `/category/*`). The `posts` collection has no author field. In prod, most posts are implicitly Social Lama, but a subset are guest posts by **Łukasz Płociński (agency SEOFLY)** whose attribution exists only as free text + a leftover WordPress author embed inside the body. Two schema patterns already exist to mirror: `case-studies/[slug]/json-ld.tsx` (`Article` + `BreadcrumbList`) and `components/seo/structured-data.tsx` (site `Organization` at `@id` `{APP_BASE_URL}/#organization`). The blog is Polish-only.

## Goals / Non-Goals

**Goals:**
- A CMS-editable `authors` collection and an optional `posts.author` relationship, with a Social Lama fallback.
- A nicely-presented author card at the bottom of each post and a compact byline on listing cards.
- Valid `BlogPosting` + `BreadcrumbList` JSON-LD with a polymorphic (`Person`/`Organization`) author.
- Seed Łukasz Płociński, backfill his posts, and clean the duplicated inline bylines.

**Non-Goals:**
- No public author archive/profile routes. No author localization. No multiple authors per post. No EN blog. No `sitemap.ts` change.

## Decisions

**1. `authors` holds named *people*; the default is the *Organization*, not a row.** The collection models guest/named humans (name, avatar, bio, external profile URL). When `posts.author` is empty, the resolver returns a synthetic Social Lama default (name + lama mark) and the schema emits the `Organization` `@id`. *Why:* keeps schema honest — `Person` for humans, `Organization` for the brand — and avoids a fake "person" row for the org. *Alternative:* a mixed Person/Org collection with a default row — rejected (muddies schema type + duplicates the brand entity).

**2. Single author-resolution helper.** One `resolvePostAuthor(post)` returns a normalized shape — `{ kind: 'person' | 'org', name, avatarUrl, bio?, url? }` — consumed by the author card, the listing byline, and the JSON-LD builder. *Why:* the fallback rule lives in exactly one place; presentation and schema can't drift.

**3. Reuse the Organization `@id`.** Export `ORG_ID` / `organizationRef()` from `components/seo/structured-data.tsx`; `publisher` (always) and the default `author` reference it. Guest `author` is an inline `Person` (name + `sameAs`).

**4. `BlogPosting`, colocated component.** `BlogPosting` (schema.org blog subtype) over generic `Article`; colocate at `app/(frontend)/[slug]/json-ld.tsx` mirroring the case-study convention. Dates: `datePublished` = `publishedAt`, `dateModified` = `updatedAt`.

**5. Presentation split.** The rich author card renders at the *bottom* of the post (avatar, name, bio, external link); listing cards get a *compact* byline (avatar + name). A shared `AuthorByline`/`AuthorCard` pair keeps markup consistent. Lama mark for the default = `/icon.png` (the Organization logo).

**6. Migration ordering (against pre-launch prod DB).** (a) add collection + relationship field and push schema; (b) seed the Łukasz Płociński author; (c) backfill `author` on the affected guest posts; (d) strip the inline "autorem jest…" byline + WordPress author embed from those bodies. Steps b–d are idempotent scripts identifying targets by scanning `content` for the byline/embed markers.

## Risks / Trade-offs

- **Schema push touches the shared/prod DB** → Mitigation: additive collection + optional field only (no drops); run on a quiet window; prod is pre-launch/low-stakes per project norms. Watch for the known drizzle interactive-prompt hangs on push.
- **Body cleanup could remove wanted text** → Mitigation: script matches the specific imported byline/embed markers, previews affected posts, and edits are reversible via Payload versioning; verify each affected post after running.
- **Org-as-author is weaker E-E-A-T than a person** → Mitigation: acceptable for house posts; named guest authors get full `Person` + `sameAs`, which is the strong case.
- **Identifying guest posts reliably** → Mitigation: the "autorem jest [Name]" sentence + `seofly.pl/zespol/...` embed are consistent markers; enumerate matches and confirm the list before backfilling.

## Migration Plan

Deploy is additive code + a schema push + idempotent seed/backfill/cleanup scripts. Rollback: revert the code commit; the added collection/field can remain (unused) or be dropped separately. Post-deploy, fetch a guest post and a default post and validate `BlogPosting` (author `Person` vs `Organization`) + `BreadcrumbList` via Rich Results Test.

## Open Questions

- Exact bio copy / avatar for Łukasz Płociński — supplied by the user or pulled from the SEOFLY profile during implementation.
- Whether the Social Lama default card needs a tagline/link (to `/o-nas`) or just name + mark — resolve visually; does not affect schema.
