## MODIFIED Requirements

### Requirement: Social links set
The site SHALL render one canonical, ordered set of social links, used everywhere social icons appear — currently the footer sign-off band, the homepage hero social row, and the `/o-nas` hero social row. The Menu overlay no longer carries a social row (removed when the mobile menu was simplified), so it is not a consumer. The same set SHALL also supply the `sameAs` list in the site's structured data. The order SHALL be: **Facebook, Instagram, LinkedIn, TikTok, X, YouTube, Pinterest**. Each link SHALL point to its real profile destination:

- Facebook → `https://www.facebook.com/agencjasociallama/`
- Instagram → `https://www.instagram.com/social.lama/`
- LinkedIn → `https://www.linkedin.com/company/sociallama/`
- TikTok → `https://www.tiktok.com/@social_lama`
- X → `https://x.com/SocialLamaPL`
- YouTube → `https://www.youtube.com/@GOODONEGROUP`
- Pinterest → `https://pl.pinterest.com/social__lama/`

Each icon SHALL carry an accessible label naming its platform. No social link SHALL point to a `#` placeholder. The set SHALL be defined once and read by every surface, so no surface can carry its own order.

#### Scenario: Canonical order and destinations
- **WHEN** any surface renders the social row (overlay, footer, or hero)
- **THEN** the seven icons appear in the order above, each linking to its real profile destination, opening in a new tab with `rel="noopener noreferrer"`

#### Scenario: No placeholder links
- **WHEN** the social set renders
- **THEN** no icon resolves to `#` — every icon navigates to a live profile URL

#### Scenario: Row fits the mobile viewport
- **WHEN** the social row renders at a 390px viewport in the hero and footer
- **THEN** all seven icons fit without horizontal overflow or unintended wrapping

#### Scenario: One order, every surface
- **WHEN** the social order is changed
- **THEN** the header overlay, the footer band, the homepage hero and the `/o-nas` hero all reflect it without further edits, because each reads the same canonical set
