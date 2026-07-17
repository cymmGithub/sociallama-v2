## MODIFIED Requirements

### Requirement: Minimal header bar
The site header SHALL show, at every breakpoint, exactly three elements: the Social Lama logo on the left (sized ~20% larger than the v1 header mark), and on the right the CTA pill ("POROZMAWIAJMY O TWOIM BIZNESIE" → `/kontakt`) next to a pill-styled "Menu" toggle. No inline navigation links and no hover submenus exist in the bar; the overlay is the only navigation surface.

#### Scenario: Same bar on desktop and mobile
- **WHEN** the page renders at any viewport width
- **THEN** the header contains only logo, CTA pill, and Menu toggle (mobile MAY shorten the CTA label, but no additional links appear)

#### Scenario: CTA opens the contact page
- **WHEN** the header CTA pill is clicked
- **THEN** the visitor navigates to the dedicated `/kontakt` page (not the `/#kontakt` footer anchor)

#### Scenario: Toggle state
- **WHEN** the Menu button is clicked
- **THEN** the overlay opens, the button reflects the open state (close affordance, `aria-expanded="true"`); clicking again (or the close affordance) closes it
