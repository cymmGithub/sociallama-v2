# site-nav

## Purpose

Define the site navigation: the minimal header bar and the full-viewport overlay menu.

## Requirements

### Requirement: Minimal header bar
The site header SHALL show, at every breakpoint, exactly three elements: the Social Lama logo on the left (sized ~20% larger than the v1 header mark), and on the right the CTA pill ("POROZMAWIAJMY O TWOIM BIZNESIE" → `/#kontakt`) next to a pill-styled "Menu" toggle. No inline navigation links and no hover submenus exist in the bar; the overlay is the only navigation surface.

#### Scenario: Same bar on desktop and mobile
- **WHEN** the page renders at any viewport width
- **THEN** the header contains only logo, CTA pill, and Menu toggle (mobile MAY shorten the CTA label, but no additional links appear)

#### Scenario: Toggle state
- **WHEN** the Menu button is clicked
- **THEN** the overlay opens, the button reflects the open state (close affordance, `aria-expanded="true"`); clicking again (or the close affordance) closes it

### Requirement: Menu overlay
Activating the Menu toggle SHALL open a full-viewport overlay with a fixed `cream` theme (ink text, plum/orange accents) regardless of the chapter theme active at open time. The overlay SHALL contain two link columns and a utility row:

- **BRANŻE** (column label, not a link): Nieruchomości & Budownictwo, Moda, Zdrowie, Edukacja, Usługi biznesowe, Retail & E-commerce — content-export order and spelling, each linking to its industry route under `/branze/`
- **USŁUGI** (column label, not a link): Content (`/uslugi/content`), Sprzedaż (`/uslugi/sprzedaz`), Kreacje & Wideo (`/uslugi/kreacje-wideo`), Szkolenia i kursy (`/szkolenia`)
- **Utility row** (below the columns): O NAS (`/#o-nas`), contact email (`mailto:halohalo@sociallama.pl`), social links

KONTAKT does not appear as a menu item — the header CTA is the contact action.

#### Scenario: Overlay content and links
- **WHEN** the overlay is open
- **THEN** both columns render the exact items above and each item navigates to its route on click, closing the overlay

#### Scenario: Dismissal and scroll lock
- **WHEN** the overlay is open
- **THEN** page scroll is locked behind it, and pressing Escape or activating the close affordance closes it and returns focus to the Menu toggle

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the overlay appears and disappears without animated transition
