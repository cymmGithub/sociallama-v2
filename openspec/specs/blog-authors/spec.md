# blog-authors Specification

## Purpose
TBD - created by archiving change add-blog-post-schema. Update Purpose after archive.
## Requirements
### Requirement: Authors are a CMS-editable collection

The system SHALL provide an `authors` collection editable in the Payload admin, holding named people who write posts. Each author SHALL have a `name`, an optional avatar image, an optional short bio, an optional role or job title, and an optional external profile URL. The collection SHALL NOT expose public author archive routes in this change.

#### Scenario: Editor manages an author
- **WHEN** an editor opens the Payload admin
- **THEN** they can create, edit, and delete `authors` records with name, avatar, bio, role, and external profile URL

#### Scenario: Author without a role
- **WHEN** an author record has no role set
- **THEN** the author is presented with name and avatar only, with no empty role line

### Requirement: Posts have an optional author

The `posts` collection SHALL gain an optional single `author` relationship to the `authors` collection. Leaving it empty is valid and SHALL be interpreted as "authored by Social Lama."

#### Scenario: Post with an assigned author
- **WHEN** a post has an `author` set
- **THEN** the site renders that author's identity for the post

#### Scenario: Post with no author
- **WHEN** a post has no `author`
- **THEN** the site renders the Social Lama organization as the author

### Requirement: Social Lama is the default author

When a post has no assigned author, the resolved author SHALL be the **Social Lama** organization: the name "Social Lama", the lama mark as avatar, and a presented role identifying it as the house byline, consistent with the site's `/#organization` brand entity. The default SHALL NOT require a row in the `authors` collection.

The organization avatar SHALL be presented as a contained brand mark on a brand-coloured disc, visually distinct from a cropped photographic portrait, so that an unauthored post reads as a deliberate house byline rather than an author whose photo is missing.

#### Scenario: Default author identity
- **WHEN** an unauthored post is displayed
- **THEN** its author name reads "Social Lama" with the lama mark as the avatar and a house role line

#### Scenario: Organization mark is not cropped like a portrait
- **WHEN** the organization fallback avatar is rendered
- **THEN** the lama mark is shown whole on a brand-coloured disc rather than filling the disc edge to edge

### Requirement: Author card at the bottom of each post

Each blog post detail page SHALL display an author card after the post body, showing the resolved author's avatar, name, and role when present, the bio when present, and a link to the external profile when present.

#### Scenario: Guest author card
- **WHEN** a post authored by a named person is displayed
- **THEN** the bottom-of-post card shows their avatar, name, role (if set), bio (if set), and a link to their external profile (if set)

#### Scenario: Default author card
- **WHEN** an unauthored post is displayed
- **THEN** the bottom-of-post card shows the Social Lama name, house role, and lama mark

### Requirement: Author byline on listing cards

The shared `PostCard` (used by `/blog` and `/category/*`) SHALL show a compact author byline — the resolved author's avatar and name — for each post.

#### Scenario: Byline on the blog listing
- **WHEN** the `/blog` or a `/category/{slug}` listing is rendered
- **THEN** each card shows the resolved author's name and avatar

### Requirement: Seed and migrate existing guest posts

The change SHALL seed a `Łukasz Płociński` author linked to his SEOFLY profile, assign that author to the existing guest posts he wrote, and remove the now-duplicate inline byline text and leftover WordPress author embed from those posts' bodies.

#### Scenario: Guest post is migrated
- **WHEN** the migration has run against a guest post
- **THEN** the post's `author` relationship points at Łukasz Płociński, and its body no longer contains the "autorem jest…" byline sentence or the WordPress author embed

### Requirement: One attribution surface per post

The author card after the body SHALL be the only place a post presents its author. The post page SHALL NOT repeat author identity elsewhere — not in the sticky rail, and not as a byline under the title.

Rationale: an earlier revision of this change put the author above the table of contents as well. In practice that duplicated the same three fields twice on one page, and on the organization default it also duplicated a brand already carried by the site header (user decision 2026-07-26).

#### Scenario: Named author on a post
- **WHEN** a post with an assigned author is opened
- **THEN** the author's avatar, name, role, and bio appear once, in the card after the body

#### Scenario: No duplicate byline
- **WHEN** a post page is rendered at any viewport
- **THEN** the author's name appears in exactly one block on the page

