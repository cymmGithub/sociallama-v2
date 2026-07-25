## Why

Blog posts have two linked gaps. **Presentation/authorship:** there is no author field — most posts are implicitly Social Lama, but a subset are guest posts by **Łukasz Płociński of the partner agency SEOFLY**, whose attribution survives only as free text plus a leftover WordPress author-embed inside the post body. **Structured data:** blog posts are the last high-value page type with no `BlogPosting` JSON-LD (case studies and the homepage already have schema). Both stem from the same missing concept — a first-class, editable author — so they are addressed together.

## What Changes

- Add a CMS-editable **`authors` collection** (named people: name, avatar, bio, optional external profile URL). Add an **optional `author` relationship** on `posts`.
- When a post has no author, fall back to the **Social Lama** organization as the author (lama avatar), reusing the site's `/#organization` node.
- Render a **nicely-presented author card at the bottom of each post** (avatar, name, bio, optional external link), and a **compact author byline on listing cards** (`PostCard`, used by `/blog` and `/category/*`).
- Emit **`BlogPosting` + `BreadcrumbList` JSON-LD** on post detail pages. `author` is a **`Person`** (with `sameAs` → external profile) for guest-authored posts, or the **`Organization`** (`/#organization`) for the Social Lama default; `publisher` is always the Organization.
- **Seed** a `Łukasz Płociński` author (linked to his SEOFLY profile), **backfill** the affected guest posts, and **clean up** the now-duplicate inline byline text + WordPress author embed from those post bodies.

## Capabilities

### New Capabilities
- `blog-authors`: the `authors` collection, the optional post→author relationship, the Social Lama fallback, the bottom-of-post author card, the listing-card byline, and the seed/backfill/content-cleanup of existing guest posts.
- `blog-structured-data`: `BlogPosting` + `BreadcrumbList` JSON-LD on blog post detail pages, with a polymorphic `Person`/`Organization` author derived from the resolved author.

### Modified Capabilities
<!-- none — this adds new capabilities rather than changing existing spec-level requirements -->

## Impact

- **Payload**: new `authors` collection; new optional `author` relationship field on `posts`. Requires a schema push and a seed. Posts live in the (pre-launch) prod DB, so seed + backfill + body cleanup run against that data.
- **New code**: `authors` collection definition; an author-resolution helper (returns the related author or the Social Lama default); a bottom-of-post `AuthorCard`; a compact `AuthorByline` for cards; `app/(frontend)/[slug]/json-ld.tsx` (`BlogPosting` + `BreadcrumbList`).
- **Modified**: `app/(frontend)/[slug]/page.tsx` (author card + JSON-LD), `app/(frontend)/blog/post-card.tsx` (byline), related CSS modules; export `ORG_ID`/`organizationRef()` from `components/seo/structured-data.tsx`.
- **Content migration**: assign the guest author and strip the inline byline + WP embed on the affected posts.
- **Scope**: Polish-only (the blog is not in the EN tree). No public author archive pages. Single author per post. No `sitemap.ts` change (posts already included).
