## ADDED Requirements

### Requirement: Authors are a CMS-editable collection

The system SHALL provide an `authors` collection editable in the Payload admin, holding named people who write posts. Each author SHALL have a `name`, an optional avatar image, an optional short bio, and an optional external profile URL. The collection SHALL NOT expose public author archive routes in this change.

#### Scenario: Editor manages an author
- **WHEN** an editor opens the Payload admin
- **THEN** they can create, edit, and delete `authors` records with name, avatar, bio, and external profile URL

### Requirement: Posts have an optional author

The `posts` collection SHALL gain an optional single `author` relationship to the `authors` collection. Leaving it empty is valid and SHALL be interpreted as "authored by Social Lama."

#### Scenario: Post with an assigned author
- **WHEN** a post has an `author` set
- **THEN** the site renders that author's identity for the post

#### Scenario: Post with no author
- **WHEN** a post has no `author`
- **THEN** the site renders the Social Lama organization as the author

### Requirement: Social Lama is the default author

When a post has no assigned author, the resolved author SHALL be the **Social Lama** organization: the name "Social Lama" and the lama mark as avatar, consistent with the site's `/#organization` brand entity. The default SHALL NOT require a row in the `authors` collection.

#### Scenario: Default author identity
- **WHEN** an unauthored post is displayed
- **THEN** its author name reads "Social Lama" with the lama mark as the avatar

### Requirement: Author card at the bottom of each post

Each blog post detail page SHALL display an author card after the post body, showing the resolved author's avatar and name, the bio when present, and a link to the external profile when present.

#### Scenario: Guest author card
- **WHEN** a post authored by Łukasz Płociński is displayed
- **THEN** the bottom-of-post card shows his avatar, name, bio (if set), and a link to his external profile

#### Scenario: Default author card
- **WHEN** an unauthored post is displayed
- **THEN** the bottom-of-post card shows the Social Lama name and lama mark

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
