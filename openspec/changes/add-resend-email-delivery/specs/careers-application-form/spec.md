# careers-application-form

## MODIFIED Requirements

### Requirement: Delivery failure is reported, never masked

The action SHALL return a failure state whenever mail delivery is unavailable,
including when the email delivery client is unconfigured and resolves to none.
It SHALL NOT report success for an application it did not deliver.

#### Scenario: Unconfigured delivery fails the submission

- **WHEN** an application is submitted while email delivery is unconfigured
  (missing API key, sender address, or destination inbox)
- **THEN** the visitor is shown a failure state rather than a success
  confirmation

#### Scenario: Status messages follow the submitter's locale

- **WHEN** an application is submitted from the English careers page
- **THEN** validation errors and the success or failure message are returned in
  English
