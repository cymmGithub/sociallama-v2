## 1. Author data model (Payload)

- [x] 1.1 Create the `authors` collection (`lib/payload/collections/authors.ts`): `name` (required), `avatar` (upload/media, optional), `bio` (textarea/richtext, optional), `profileUrl` (optional external URL). No public routes. Register it in the Payload config.
- [x] 1.2 Add an optional single `author` relationship field to the `posts` collection (`lib/payload/collections/posts.ts`), relating to `authors`.
- [x] 1.3 Push the schema to the DB and regenerate `payload-types.ts`; confirm `Post.author` and the `Author` type exist.

## 2. Seed, backfill & content cleanup (prod data)

- [x] 2.1 Seed a `Łukasz Płociński` author (avatar + short bio + `profileUrl` = his SEOFLY profile) via an idempotent seed script.
- [x] 2.2 Identify the guest posts by scanning `content` for the "autorem jest…" byline and the `seofly.pl/zespol/...` author embed; list them for confirmation.
- [x] 2.3 Backfill: set `author` = Łukasz Płociński on those posts.
- [x] 2.4 Clean up: remove the inline "autorem jest…" byline sentence and the WordPress author embed from those posts' bodies; verify each affected post visually.

## 3. Author resolution

- [x] 3.1 In `components/seo/structured-data.tsx`, export `ORG_ID` and `organizationRef()` (`{ '@id': ORG_ID }`).
- [x] 3.2 Add `resolvePostAuthor(post)` returning a normalized author (`{ kind: 'person' | 'org', name, avatarUrl, bio?, url? }`) — the related author when set, else the Social Lama default (name "Social Lama", avatar `/icon.png`, `kind: 'org'`). Single source of the fallback rule.

## 4. Presentation

- [x] 4.1 Build `AuthorCard` (bottom-of-post): avatar, name, bio (if present), external link (if present). Handles both person and org.
- [x] 4.2 Render `AuthorCard` after the post body in `app/(frontend)/[slug]/page.tsx`; add styles to `post.module.css`.
- [x] 4.3 Build a compact `AuthorByline` (avatar + name) and add it to `app/(frontend)/blog/post-card.tsx` `cardMeta`; add styles to `blog.module.css`. Covers `/blog` and `/category/*`.

## 5. Structured data

- [x] 5.1 Create `app/(frontend)/[slug]/json-ld.tsx` (`BlogPostJsonLd`), mirroring the case-study file (inline `application/ld+json`, absolute-URL media helper).
- [x] 5.2 Build the `BlogPosting` node: `headline`, `datePublished` (`publishedAt`), `dateModified` (`updatedAt`), `mainEntityOfPage`, `inLanguage: 'pl'`, conditional `description`/`image`; `publisher` = `organizationRef()`; `author` from `resolvePostAuthor` — `Person` (name + `sameAs` when `url`) or `organizationRef()` for the org default.
- [x] 5.3 Build the `BreadcrumbList` node (Blog → post) and emit both nodes in one JSON-LD script; wire `<BlogPostJsonLd>` into the post page.

## 6. Verify

- [x] 6.1 `bunx biome check --write` on changed files + `bunx tsc --noEmit`; both clean.
- [x] 6.2 On a guest post: confirm `BlogPosting.author` is a `Person` with `sameAs`, the bottom card shows Łukasz + external link, and the old inline byline is gone.
- [x] 6.3 On a default post: confirm `BlogPosting.author` references the Organization `@id`, and the card + card-byline show "Social Lama" + lama mark.
- [x] 6.4 Confirm the byline renders on `/blog` and a `/category/{slug}` listing, and validate one post's JSON-LD in the Rich Results Test.
