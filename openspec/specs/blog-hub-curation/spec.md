# blog-hub-curation Specification

## Purpose
TBD - created by archiving change refine-blog-hub. Update Purpose after archive.
## Requirements
### Requirement: Blog hub curation is edited in one place

The system SHALL provide a `blog-hub` Payload global holding the hub's editorial slots: a featured post, an ordered list of up to four editors' picks, one most-read post, and an optional video spotlight. These slots SHALL NOT be expressed as fields on individual posts.

#### Scenario: Editor curates the hub
- **WHEN** an editor opens the blog hub settings in the Payload admin
- **THEN** they can set the featured post, reorder up to four editors' picks, set the most-read post, and set or clear the video spotlight, all on one screen

#### Scenario: Picks keep their order
- **WHEN** an editor reorders the editors' picks
- **THEN** the hub presents them in that order

#### Scenario: Featuring a post does not modify the post
- **WHEN** an editor changes which post is featured
- **THEN** no post record is modified

### Requirement: Empty curation slots degrade to sensible defaults

The hub SHALL render correctly when any or all curation slots are empty. An empty slot SHALL NOT produce a placeholder, an error, or an empty container.

#### Scenario: Nothing has been curated yet
- **WHEN** the hub is opened and no curation slots are set
- **THEN** the featured position shows the newest published post, the picks show the next four newest posts, and the page renders with no empty regions

#### Scenario: No featured post set
- **WHEN** the featured slot is empty
- **THEN** the newest published post occupies the featured position

#### Scenario: No editors' picks set
- **WHEN** the picks slot is empty
- **THEN** the four newest published posts other than the featured post are listed

#### Scenario: No most-read post set
- **WHEN** the most-read slot is empty
- **THEN** the most-read block is omitted and the surrounding layout closes up

#### Scenario: Curated post is unpublished
- **WHEN** a post referenced by a curation slot is no longer published
- **THEN** the hub falls back as though that slot were empty rather than linking to an unavailable post

### Requirement: Video spotlight links to the channel without embedding a player

The `blog-hub` global SHALL support an optional video spotlight consisting of a title, a destination URL, a description, an uploaded poster image, and an optional duration. The hub SHALL present it as a poster with a play affordance and an outbound link. The system SHALL NOT embed a third-party video player on the hub.

#### Scenario: Video spotlight is set
- **WHEN** a video spotlight is configured
- **THEN** the hub shows its poster, title, description, duration when set, and an action that opens the video in a new tab

#### Scenario: No third-party player is loaded
- **WHEN** the hub is loaded with a video spotlight configured
- **THEN** no video player is embedded and no request is made to a video host before the visitor activates the link

#### Scenario: Leaving the site is explicit
- **WHEN** the video spotlight is displayed
- **THEN** its play affordance and its action are both visibly marked as leading off-site, and the link opens in a new tab

#### Scenario: Video spotlight is cleared
- **WHEN** no video spotlight is configured
- **THEN** the entire spotlight section is absent from the page

#### Scenario: Poster is required alongside a video
- **WHEN** an editor sets a video destination without uploading a poster
- **THEN** the admin prevents saving an incomplete spotlight rather than rendering an empty media frame

