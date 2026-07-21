## MODIFIED Requirements

### Requirement: Menu overlay
Activating the Menu toggle SHALL open a full-viewport overlay with a fixed `cream` theme (ink text, plum/orange accents) regardless of the chapter theme active at open time. The overlay SHALL contain two link columns and a utility row:

- **BRANŻE** (column label, not a link): Nieruchomości & Budownictwo, Moda, Zdrowie, Edukacja, Usługi biznesowe, Retail & E-commerce — content-export order and spelling, each linking to its industry route under `/branze/`
- **USŁUGI** (column label, not a link): Strategia (`/uslugi/strategia`), Content (`/uslugi/content`), Sprzedaż (`/uslugi/sprzedaz`), Kreacje & Wideo (`/uslugi/kreacje-wideo`), Audyt i konsultacje (`/uslugi/audyt-i-konsultacje`), Influencer marketing (`/uslugi/influencer-marketing`), Szkolenia i kursy (`/szkolenia`)
- **Utility row** (below the columns): O NAS (`/#o-nas`), contact email (`mailto:halohalo@sociallama.pl`), social links (per the Social links set requirement)

KONTAKT does not appear as a menu item — the header CTA is the contact action.

The three `/uslugi/*` routes added for Strategia, Audyt i konsultacje, and Influencer marketing MAY not have destination pages yet; the menu items SHALL still render and link to their slugs.

#### Scenario: Overlay content and links
- **WHEN** the overlay is open
- **THEN** both columns render the exact items above and each item navigates to its route on click, closing the overlay

#### Scenario: Dismissal and scroll lock
- **WHEN** the overlay is open
- **THEN** page scroll is locked behind it, and pressing Escape or activating the close affordance closes it and returns focus to the Menu toggle

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** the overlay appears and disappears without animated transition

## ADDED Requirements

### Requirement: Social links set
The site SHALL render one canonical, ordered set of social links, used everywhere social icons appear (the Menu-overlay utility row, the footer sign-off band, and the hero social row). The order SHALL be: **Instagram, Facebook, TikTok, X, LinkedIn, YouTube, Pinterest**. Each link SHALL point to its real profile destination:

- Instagram → `https://www.instagram.com/social.lama/`
- Facebook → `https://www.facebook.com/agencjasociallama/`
- TikTok → `https://www.tiktok.com/@social_lama`
- X → `https://x.com/SocialLamaPL`
- LinkedIn → `https://www.linkedin.com/company/sociallama/`
- YouTube → `https://www.youtube.com/@GOODONEGROUP`
- Pinterest → `https://pl.pinterest.com/social__lama/`

Each icon SHALL carry an accessible label naming its platform. No social link SHALL point to a `#` placeholder.

#### Scenario: Canonical order and destinations
- **WHEN** any surface renders the social row (overlay, footer, or hero)
- **THEN** the seven icons appear in the order above, each linking to its real profile destination, opening in a new tab with `rel="noopener noreferrer"`

#### Scenario: No placeholder links
- **WHEN** the social set renders
- **THEN** no icon resolves to `#` — every icon navigates to a live profile URL

#### Scenario: Row fits the mobile viewport
- **WHEN** the social row renders at a 390px viewport in the hero and footer
- **THEN** all seven icons fit without horizontal overflow or unintended wrapping
