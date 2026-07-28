## MODIFIED Requirements

### Requirement: Blog hub curation is edited in one place

The system SHALL provide a `blog-hub` Payload global holding the hub's editorial slots: a featured post, an ordered list of up to four editors' picks, one most-read post, and an optional video spotlight. These slots SHALL NOT be expressed as fields on individual posts.

Curation SHALL be per locale: each locale's hub carries its own featured post, picks, most-read post, and video spotlight text, so an English hub is never bound to the choices made for the Polish one. A curation slot SHALL NOT reference a post that has no translation in the locale being curated.

#### Scenario: Editor curates the hub
- **WHEN** an editor opens the blog hub settings in the Payload admin
- **THEN** they can set the featured post, reorder up to four editors' picks, set the most-read post, and set or clear the video spotlight, all on one screen

#### Scenario: Locales curate independently
- **WHEN** an editor changes the featured post for one locale
- **THEN** the other locale's featured post is unchanged

#### Scenario: Untranslated post cannot be curated into English
- **WHEN** a post with no English translation is referenced by an English curation slot
- **THEN** the English hub falls back as though that slot were empty rather than surfacing Polish text

#### Scenario: Picks keep their order
- **WHEN** an editor reorders the editors' picks
- **THEN** the hub presents them in that order

#### Scenario: Featuring a post does not modify the post
- **WHEN** an editor changes which post is featured
- **THEN** no post record is modified

### Requirement: Empty curation slots degrade to sensible defaults

The hub SHALL render correctly when any or all curation slots are empty, in either locale. An empty slot SHALL NOT produce a placeholder, an error, or an empty container. Defaults SHALL be drawn only from posts available in the rendering locale.

An uncurated English hub is a supported steady state, not a temporary one: the English hub ships with every slot empty and is expected to render entirely from these defaults until an editor chooses otherwise.

#### Scenario: Nothing has been curated yet
- **WHEN** the hub is opened and no curation slots are set
- **THEN** the featured position shows the newest published post, the picks show the next four newest posts, and the page renders with no empty regions

#### Scenario: Uncurated English hub
- **WHEN** `/en/blog` is opened with no English curation set
- **THEN** it renders fully from defaults drawn from translated posts only, with no empty regions and no Polish content

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

The spotlight's title, description, and duration SHALL be localized; its destination URL and poster image are shared across locales.

#### Scenario: Video spotlight is set
- **WHEN** a video spotlight is configured
- **THEN** the hub shows its poster, title, description, duration when set, and an action that opens the video in a new tab

#### Scenario: Spotlight text follows the locale
- **WHEN** a video spotlight configured in both locales renders on each hub
- **THEN** its title and description appear in that hub's language, pointing at the same destination and showing the same poster

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
