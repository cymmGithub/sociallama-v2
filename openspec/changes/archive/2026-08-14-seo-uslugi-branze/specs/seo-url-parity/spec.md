# seo-url-parity — delta

## ADDED Requirements

### Requirement: Platform offer URLs redirect to the service landing

The six legacy platform offer URLs SHALL 301-redirect to `/uslugi/prowadzenie-social-media`, their content successor, instead of the `/#uslugi` homepage anchor: `/oferta/facebook`, `/oferta/instagram`, `/oferta/linkedin`, `/oferta/tiktok`, `/oferta/twitter` and `/oferta/pinterest`. The bare `/oferta` URL keeps its existing target.

#### Scenario: Platform offer URL redirects to the landing

- **WHEN** any of the six `/oferta/<platform>` URLs is requested
- **THEN** it returns a 301 to `/uslugi/prowadzenie-social-media`

#### Scenario: Redirect target resolves

- **WHEN** the parity gate requests a `/oferta/<platform>` URL against a v2 deployment
- **THEN** the 301 target returns 200
