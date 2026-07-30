## ADDED Requirements

### Requirement: The footer carries the consent-settings trigger

The footer's bottom legal row SHALL carry a control that reopens the consent settings panel, alongside the existing legal links, in both locales. This is the site's persistent withdrawal mechanism and SHALL be present on every page.

Because it opens a panel rather than navigating, it SHALL be a button rather than a link, while matching the legal row's visual treatment.

#### Scenario: The trigger is present site-wide

- **WHEN** the footer renders on any page in either locale
- **THEN** the bottom legal row contains a consent-settings control

#### Scenario: The trigger opens the settings panel

- **WHEN** a visitor activates the consent-settings control
- **THEN** the settings panel opens showing their current category choices

#### Scenario: It is a button, not a link

- **WHEN** the consent-settings control is inspected or read by assistive technology
- **THEN** it is announced as a button, and it does not navigate
