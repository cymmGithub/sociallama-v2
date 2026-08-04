# onas-team Delta

## MODIFIED Requirements

### Requirement: The slider honors a `lama` deep-link param

The `/o-nas` and `/en/about-us` team sliders SHALL read the `lama` query
param on arrival and, when it matches a member's cutout slug, feature that
member **render-synchronously**: the deep-linked member is the featured
member in the first frame the arriving page paints — no crossfade, no arrow
lock, no entrance replay, and no intermediate frame showing another member.
The `#zespol` hash SHALL scroll the page to the team section; on arrivals
where the target exists in the DOM at navigation commit (the prerendered
page), the landing SHALL happen before first paint, and the existing
streaming-tolerant polling path SHALL remain as the fallback for targets
that appear later.

The param is an entry point, not synced state: stepping the slider SHALL NOT
rewrite the URL. A missing or unrecognized `lama` value SHALL change nothing —
first member on a fresh mount, current member if already mounted.

Reading the param SHALL NOT alter the pages' static shell: the team section
SHALL render in full in the prerendered HTML (no Suspense fallback swallowing
it, no CSR bailout of the page). The static HTML features the first member —
a URL param can never influence prerendered markup; the render-synchronous
guarantee applies to the client-rendered first paint of a navigation or
hydrated visit.

#### Scenario: Deep link features the member

- **WHEN** a visitor opens `/o-nas?lama=przemyslaw-swiercz#zespol`
- **THEN** the page is scrolled to the team section and the slider features
  Przemysław Świercz, with his neighbors in the slider's own order behind him

#### Scenario: No wrong-member frame on client navigation

- **WHEN** a visitor client-navigates from a homepage tile to
  `/o-nas?lama=<slug>#zespol`
- **THEN** the first painted frame of the arriving page already features the
  deep-linked member — at no point does the slider visibly show member one
  before swapping

#### Scenario: Pre-paint landing on the prerendered page

- **WHEN** the client navigation commits and `#zespol` already exists in the
  DOM
- **THEN** the scroll to the team section happens before the first paint of
  the new page — the visitor never sees the page at its previous scroll
  offset

#### Scenario: Unknown slug degrades gracefully

- **WHEN** a visitor opens `/o-nas?lama=nie-ma-takiej-lamy`
- **THEN** the slider behaves exactly as with no param — first member featured,
  no error, no blank stage

#### Scenario: Repeat navigation while the page stays mounted

- **WHEN** a visitor deep-links to member A, navigates back to the homepage,
  and deep-links to member B while Next keeps the `/o-nas` page alive
- **THEN** the slider features member B, as an instant swap with no
  crossfade

#### Scenario: Static shell is unchanged

- **WHEN** the prerendered HTML of `/o-nas` is inspected with JavaScript
  disabled
- **THEN** the team section is present and complete, featuring the first
  member, exactly as before this change
