# email-health-monitoring

## ADDED Requirements

### Requirement: A probe verifies delivery health against the live Resend API

A dependency-free probe script SHALL verify, against the live Resend API,
that (1) the domain of `EMAIL_FROM` is verified in the account and (2) a real
send succeeds — addressed to Resend's official test sink
(`delivered@resend.dev`) so no human inbox receives it and domain reputation
is untouched. Any failed step SHALL exit non-zero with a message naming what
failed; success SHALL exit zero. The same script serves manual smoke testing
(run locally against `.env.local`) and the scheduled check.

#### Scenario: Healthy configuration passes

- **WHEN** the probe runs with a valid `RESEND_API_KEY` and an `EMAIL_FROM`
  whose domain is verified
- **THEN** it sends one email to the test sink and exits zero

#### Scenario: Domain no longer verified

- **WHEN** the probe runs while the `EMAIL_FROM` domain is missing or not
  `verified` in the Resend account
- **THEN** it exits non-zero naming the domain, before attempting any send

#### Scenario: Send rejected

- **WHEN** the domain check passes but the test send returns an error
- **THEN** the probe exits non-zero with the API's error message

### Requirement: The probe runs on its own daily schedule

The probe SHALL run once a day in a dedicated lightweight workflow — separate
from the manual-only `Monitor` workflow, whose full-site crawl stays off the
schedule — with a manual dispatch trigger for on-demand runs and alert
rehearsal. The workflow SHALL fail loudly when its configuration
(`RESEND_API_KEY` secret, `EMAIL_FROM` variable) is missing rather than
skipping silently.

#### Scenario: Daily run without secrets configured

- **WHEN** the scheduled run starts with the API key secret or the sender
  variable unset
- **THEN** the run fails with an error naming the missing repository setting

#### Scenario: Manual rehearsal

- **WHEN** the workflow is dispatched manually
- **THEN** it runs the identical probe and reports the same pass/fail result

### Requirement: Failures reach a human without watching the Actions tab

A failed scheduled run SHALL surface through GitHub's failure notification to
the workflow author, and the workflow SHALL carry a stable, distinct name so
the existing GitHub→Slack subscription mechanism can match on it. The
monitoring SHALL NOT exercise the production forms — production Turnstile is
fail-closed by design — and SHALL NOT deliver anything to a human inbox.

#### Scenario: Red run notifies

- **WHEN** a scheduled run fails
- **THEN** GitHub emails the workflow author, without requiring any repo
  visit

#### Scenario: No production side effects

- **WHEN** the daily check runs
- **THEN** no production form is submitted and no email arrives in
  `CONTACT_INBOX` or `CAREERS_INBOX`
