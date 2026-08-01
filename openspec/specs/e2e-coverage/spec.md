# e2e-coverage Specification

## Purpose
The coverage floor the e2e suite must hold: PL blog journey, case-study detail render, and the mobile viewport lane including the 800px fold contract.

## Requirements



### Requirement: PL blog journey coverage
A PL blog spec SHALL cover the Polish blog tree by sampling the rendered site (links read from the hub, mirroring the `en-blog.e2e.ts` approach): the `/blog` hub resolves with `lang="pl"`; hub-linked posts resolve at their root-level `/{slug}` URLs and render an article; hub-linked category pages resolve; pagination links the hub offers resolve, and a page beyond the set (e.g. `/blog/page/999`) renders the 404 state. Unlike the English tree, an empty PL hub SHALL be a failure — there is no legitimate zero-post state for the Polish blog.

#### Scenario: Hub to post
- **WHEN** the PL blog hub renders and its first linked post is visited
- **THEN** the post URL is root-level (`/{slug}`, no `/blog/` prefix), returns 200, renders an article with a non-empty heading, and carries Polish chrome

#### Scenario: Empty hub is a failure
- **WHEN** the `/blog` hub renders zero post links
- **THEN** the test fails rather than skipping

#### Scenario: Pagination honesty
- **WHEN** the hub offers pagination links
- **THEN** every offered page resolves, and `/blog/page/999` renders the not-found state

### Requirement: Case-study detail render coverage
A case-study spec SHALL navigate from the `/case-studies` hub to a detail page and assert real content rendering — not merely HTTP 200: the hub lists at least one study, the detail page renders a non-empty `h1` and its content/media sections, and the visit produces zero console errors and zero page errors. Both the PL and EN hubs SHALL be covered.

#### Scenario: Hub to detail, PL
- **WHEN** the first study linked from `/case-studies` is visited
- **THEN** the detail page hydrates, renders a non-empty heading and attached content sections, with no console or page errors

#### Scenario: Hub to detail, EN
- **WHEN** the first study linked from `/en/case-studies` is visited
- **THEN** the same render assertions hold and internal links stay in the `/en` tree

### Requirement: Mobile viewport lane
The Playwright config SHALL define a `mobile-chromium` project (mobile viewport ~393×852, touch enabled, mobile UA) that runs only tests tagged `@mobile`; the desktop project SHALL exclude `@mobile` tests. A mobile spec SHALL cover what only a mobile viewport can regress: the MENU overlay opens and navigates in both locales, the home page renders at mobile width with zero console errors, and the consent banner's accept and reject buttons are both visible and tappable within the viewport.

#### Scenario: Menu overlay navigation
- **WHEN** the MENU control is tapped on the mobile home page and a menu link is followed
- **THEN** the overlay opens, the link navigates, and the destination hydrates

#### Scenario: Consent actionable on mobile
- **WHEN** a first-time mobile visitor loads the home page
- **THEN** the consent banner is visible with both accept and reject fully inside the viewport and tappable

#### Scenario: The 800px breakpoint boundary is a contract
- **WHEN** the home page renders at a 799px-wide viewport and again at 800px
- **THEN** the header renders its compact metrics at 799px and its desktop metrics at 800px (the logo mark's rendered size is the observable: ~118×30 below the fold, ~212×53 at or above it) — pinning the single `--mobile`/`--desktop` custom-media fold from `lib/styles/css/root.css` that all layouts hang on (tablets fall on either side of it; no separate tablet project exists, and the MENU overlay control is universal at every width)

#### Scenario: Projects stay disjoint
- **WHEN** the full suite runs
- **THEN** `@mobile` tests execute only under the mobile project and all other tests only under the desktop project
