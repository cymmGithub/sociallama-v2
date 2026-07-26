## MODIFIED Requirements

### Requirement: Authors are a CMS-editable collection

The system SHALL provide an `authors` collection editable in the Payload admin, holding named people who write posts. Each author SHALL have a `name`, an optional avatar image, an optional short bio, an optional role or job title, and an optional external profile URL. The collection SHALL NOT expose public author archive routes in this change.

#### Scenario: Editor manages an author
- **WHEN** an editor opens the Payload admin
- **THEN** they can create, edit, and delete `authors` records with name, avatar, bio, role, and external profile URL

#### Scenario: Author without a role
- **WHEN** an author record has no role set
- **THEN** the author is presented with name and avatar only, with no empty role line

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

## ADDED Requirements

### Requirement: Author identity presented before the read

The resolved author SHALL be presented at the top of the post — avatar, name, and role when present — in addition to the existing card after the body, so that attribution is visible before the reader commits to the article.

#### Scenario: Named author on a new post
- **WHEN** a post with an assigned author is opened
- **THEN** that author's avatar, name, and role are visible without scrolling past the article body

#### Scenario: Archive post with no assigned author
- **WHEN** a post with no assigned author is opened
- **THEN** the organization identity is presented in the same position with the same shape, with no empty or broken avatar
