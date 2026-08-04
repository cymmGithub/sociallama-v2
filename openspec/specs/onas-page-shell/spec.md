# onas-page-shell Specification

## Purpose
The `/o-nas` (and `/en/about-us`) rendering class: a fully prerendered
static shell with the CMS-dependent news section isolated behind Suspense,
so client navigation never shows a loading shell and the team anchor exists
at navigation commit.
## Requirements
### Requirement: /o-nas prerenders as a full static shell

The `/o-nas` page (and its EN mirror `/en/about-us`) SHALL prerender its
entire section sequence — hero, client belt, about-intro, values, projects,
marquee, GOOD ONE, and the team slider — into the static shell. No page-root
`await` may hold the body hostage to a CMS query: the only CMS-dependent
slice (the NewsLAMA band) SHALL be isolated in an async child behind
`Suspense` with a skeleton fallback, following the homepage `HomeNews`
pattern, and its query SHALL remain the cached `getLatestPost` so the news
bakes into the build and freshness comes from tag revalidation on publish.

#### Scenario: Team section is in the prerendered HTML

- **WHEN** the prerendered HTML of `/o-nas` is inspected with JavaScript
  disabled
- **THEN** the team section (`#zespol`) is present and complete, and no
  section other than the news band renders a fallback

#### Scenario: News is the only streamed slice

- **WHEN** a cold render of `/o-nas` is served
- **THEN** every section except NewsLAMA comes from the static shell, and
  the NewsLAMA slot shows its skeleton until the cached query resolves

#### Scenario: EN mirror has the same rendering class

- **WHEN** `/en/about-us` is built and served
- **THEN** it prerenders as a pure static shell like the Polish page — a
  sync page component with no page-root CMS await (the EN page omits the
  NewsLAMA band entirely, so nothing streams)

### Requirement: Client navigation to /o-nas shows no loading shell

Client-side navigation to `/o-nas` or `/en/about-us` SHALL NOT present the
route loading shell: the target page's static content SHALL be available at
navigation commit, so the `#zespol` anchor target exists in the DOM when the
pathname changes.

#### Scenario: Grid tile navigation lands on real content

- **WHEN** a visitor clicks a homepage team tile and the client navigation
  commits
- **THEN** the `/o-nas` team section exists in the DOM at commit time, and
  the visitor never sees the `/o-nas` loading shell
