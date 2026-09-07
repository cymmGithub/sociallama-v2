## MODIFIED Requirements

### Requirement: Sticky post rail
On desktop viewports the post page SHALL display a sticky rail beside the article body containing, in order: the table of contents and share links. The rail SHALL remain visible while the body scrolls and SHALL be offset below the fixed site header.

The rail's table-of-contents label SHALL carry the reader's remaining reading time, derived from the post's reading-time estimate and the portion of the body already scrolled past, reading `zostało ~X min` while reading and `przeczytane` once the body has been scrolled through. The site SHALL NOT add a second progress surface (no viewport-edge bar) and the site header's hide-on-scroll behaviour SHALL NOT gain an exception on post pages.

The rail SHALL NOT carry author identity — that belongs to the author card after the body, which is the page's single attribution surface (see the `blog-authors` capability).

#### Scenario: Rail persists while reading
- **WHEN** a visitor scrolls through a long post on desktop
- **THEN** the rail remains visible and does not slide beneath the fixed header

#### Scenario: Remaining time counts down
- **WHEN** a visitor has scrolled roughly halfway through a post estimated at 12 minutes
- **THEN** the rail reads `zostało ~6 min`, and once the end of the body has passed the viewport it reads `przeczytane`

#### Scenario: Rail on mobile
- **WHEN** a post is viewed below the desktop breakpoint
- **THEN** no sticky rail is rendered; the table of contents appears as a collapsed disclosure above the body, and share links appear after the body

#### Scenario: Post with no table of contents
- **WHEN** a post with fewer than three headings is viewed on desktop
- **THEN** no rail is rendered at all and the share links appear after the body, so no empty gutter is left beside the article

#### Scenario: Share links
- **WHEN** the rail is displayed
- **THEN** it offers share actions for LinkedIn and Facebook and a copy-link action, each with an accessible name

### Requirement: Table of contents with active-section tracking
Posts with three or more `h2`/`h3` headings SHALL display a table of contents listing those headings in document order, with `h3` entries visually subordinate to `h2` entries. The entry corresponding to the reader's current position SHALL be marked as current, entries before it SHALL be marked as passed, and the list's guide line SHALL fill in the accent colour down to the current entry. Activating an entry SHALL scroll to its heading; when the heading sits inside a closed disclosure (see the FAQ requirement), the disclosure SHALL be opened before scrolling.

#### Scenario: Reader scrolls through sections
- **WHEN** a visitor scrolls a post so that a new section heading passes the top of the viewport
- **THEN** the table-of-contents entry for that section becomes the current entry, earlier entries are marked passed, later entries are neither, and the guide line's fill ends at the current entry

#### Scenario: Jumping to a section
- **WHEN** a visitor activates a table-of-contents entry
- **THEN** the page scrolls to that heading, positioned clear of the fixed header, and the address bar reflects the heading's anchor

#### Scenario: Jumping into a closed FAQ entry
- **WHEN** a visitor activates the table-of-contents entry of an FAQ question whose disclosure is closed
- **THEN** that disclosure opens and the page scrolls to its question, positioned clear of the fixed header

#### Scenario: Landing on an anchor directly
- **WHEN** a visitor opens a post URL that already includes a heading anchor
- **THEN** the page lands with that heading positioned clear of the fixed header, and if the anchor is an FAQ question its disclosure is open

#### Scenario: Short post
- **WHEN** a post has fewer than three `h2`/`h3` headings
- **THEN** no table of contents is rendered, and no rail is rendered either — the share links move below the body

## ADDED Requirements

### Requirement: Heading copy-link affordance
On desktop viewports each rendered `h2` SHALL offer a control, revealed on hover or keyboard focus, that copies the heading's anchor URL (origin, path, and `#id`) to the clipboard and confirms briefly. The control SHALL be a sibling of the heading, not part of its content, so the heading's accessible name is unchanged. Below the desktop breakpoint the control SHALL NOT render.

#### Scenario: Copy a section link
- **WHEN** a visitor hovers an `h2` on desktop and activates the revealed control
- **THEN** the clipboard holds the page URL ending in that heading's `#id`, and the control shows a copied state for about a second

#### Scenario: Heading name unaffected
- **WHEN** assistive technology reads an `h2` that carries the control
- **THEN** the heading's name is the heading text only

### Requirement: FAQ section renders as disclosures
When a body's last section is an `h2` whose text starts with `FAQ` (case-insensitive) followed only by `h3`+paragraph pairs to the end of the body, the page SHALL render each pair as a `details` element with the question in its `summary` and the answer as its content, all closed on load, keeping the question's existing heading `id` on the `details`. Any other shape — a heading merely containing "pytania", a section with images or extra paragraphs, a body where the FAQ is not last — SHALL render as plain headings and paragraphs. Detection SHALL run per rendered locale.

#### Scenario: Strict-shape FAQ on an existing post
- **WHEN** `linkedin-premium-czy-warto` is rendered
- **THEN** its "FAQ – Najczęściej zadawane pytania" section shows one closed disclosure per question, and opening one reveals only that answer

#### Scenario: Loose match renders plain
- **WHEN** `jak-angazowac-na-facebooku-przyklady-postow-ktore-wzbudza-reakcje-twoich-klientow` is rendered
- **THEN** its "Głosowanie reakcjami i pytania angażujące" section renders as ordinary headings, paragraphs, and images

#### Scenario: Disclosures without JavaScript
- **WHEN** the page is rendered with scripting disabled
- **THEN** each disclosure still opens and closes natively

### Requirement: Quote sharing from a text selection
On devices with a fine pointer, selecting at least twelve characters of body text SHALL show a floating toolbar above the selection offering: share on X with the quoted text and the post URL, share on LinkedIn with the post URL, and copy the quote as `„<text>” — <title> <url>`. The toolbar SHALL disappear when the selection collapses or leaves the body. On touch devices no toolbar SHALL render.

#### Scenario: Select and copy
- **WHEN** a desktop visitor selects a sentence in the body and activates "Kopiuj cytat"
- **THEN** the clipboard holds the sentence in Polish quotation marks followed by the post title and URL, and the toolbar closes

#### Scenario: Selection outside the body
- **WHEN** a visitor selects text in the rail or the author card
- **THEN** no toolbar appears

#### Scenario: Touch device
- **WHEN** a visitor on a touch device selects body text
- **THEN** only the platform's native selection UI appears
