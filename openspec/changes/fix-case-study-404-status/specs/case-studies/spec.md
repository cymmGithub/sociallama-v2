## ADDED Requirements

### Requirement: An unknown case-study slug answers 404
A request for `/case-studies/<slug>` or `/en/case-studies/<slug>` where no published study has that slug SHALL respond with HTTP status 404, and a request for a published study SHALL respond 200 and still stream its shell rather than blocking on the full document.

#### Scenario: Unknown slug
- **WHEN** `/case-studies/definitely-not-a-study-12345` is requested
- **THEN** the response status is 404 and the not-found page renders

#### Scenario: Withdrawn study
- **WHEN** a study is withdrawn from the database and its slug is requested in either locale
- **THEN** the response status is 404

#### Scenario: Published study still streams
- **WHEN** `/case-studies/engie` is requested
- **THEN** the response status is 200 and the page still renders its loading shell before the full document resolves
