## MODIFIED Requirements

### Requirement: Authors are a CMS-editable collection

The system SHALL provide an `authors` collection editable in the Payload admin, holding named people who write posts. Each author SHALL have a `name`, an optional avatar image, an optional short bio, an optional role or job title, and an optional external profile URL. The collection SHALL NOT expose public author archive routes in this change.

`bio` and `role` SHALL be localized, so an author card renders in the language of the page it appears on. `name`, avatar, and external profile URL SHALL be shared across locales — a person's name and photo do not change with the reader's language.

#### Scenario: Editor manages an author
- **WHEN** an editor opens the Payload admin
- **THEN** they can create, edit, and delete `authors` records with name, avatar, bio, role, and external profile URL

#### Scenario: Author card follows the page language
- **WHEN** the same author's card renders on a Polish post and on an English post
- **THEN** the role and bio appear in Polish on the first and in English on the second, with the same name and avatar on both

#### Scenario: Author without a role
- **WHEN** an author record has no role set
- **THEN** the author is presented with name and avatar only, with no empty role line

### Requirement: Social Lama is the default author

When a post has no assigned author, the resolved author SHALL be the **Social Lama** organization: the name "Social Lama", the lama mark as avatar, and a presented role identifying it as the house byline, consistent with the site's `/#organization` brand entity. The default SHALL NOT require a row in the `authors` collection.

The house role, bio, and profile link SHALL be authored per locale, so an English post's default author card reads as English rather than falling back to Polish, and its profile link points at the English about page.

The organization avatar SHALL be presented as a contained brand mark on a brand-coloured disc, visually distinct from a cropped photographic portrait, so that an unauthored post reads as a deliberate house byline rather than an author whose photo is missing.

#### Scenario: Default author identity
- **WHEN** an unauthored post is displayed
- **THEN** its author name reads "Social Lama" with the lama mark as the avatar and a house role line in the page's language

#### Scenario: English house byline
- **WHEN** an unauthored post is displayed on an English page
- **THEN** its role and bio are in English and its profile link points at `/en/about-us`, not `/o-nas`

#### Scenario: Organization mark is not cropped like a portrait
- **WHEN** the organization fallback avatar is rendered
- **THEN** the lama mark is shown whole on a brand-coloured disc rather than filling the disc edge to edge
