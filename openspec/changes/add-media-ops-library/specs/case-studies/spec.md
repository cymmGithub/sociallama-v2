## MODIFIED Requirements

### Requirement: Imagery changes to published studies are reviewed before they are written
Case-study content is held only in the database; the Polish source drafts are not in version control. Removing or replacing imagery on a published study SHALL therefore be recorded as a per-image list — study, image, verdict, reason, and the proposed replacement where there is one — and that list SHALL be approved before any database write.

The applying script SHALL be idempotent, SHALL default to reporting rather than writing, and SHALL run against the development database and be verified there before the production database. Completion SHALL be confirmed by re-running until it reports no remaining changes, because a long production pass continues writing after its shell returns.

A `media` document SHALL be detached from a study rather than deleted unless its reference count shows no other study uses it.

Every script that writes media SHALL do so through `lib/payload/media-ops.ts`, and that module SHALL enforce the following rather than document them:

- An upload SHALL store the file under exactly the requested filename, and SHALL fail if the stored name differs. The module SHALL pass `overwriteExistingFiles` so Payload's local-collision rename never runs, and SHALL check the Blob store for an existing object first, refusing to overwrite one unless the caller opted in.
- A production write SHALL refuse to start while the working copy's local `media/` directory contains files, because those are what the rename collides with.
- A relation repoint SHALL accept a list of expected current filenames, SHALL read the target database's current value, and SHALL skip with a named reason when the value matches none of them.
- A production write SHALL end by revalidating every cache tag it touched through `/api/revalidate`, SHALL purge the CDN when media bytes changed, and SHALL treat a missing `REVALIDATE_SECRET` as an error before the first write rather than after.
- Live verification SHALL request images with a browser `Accept` header, SHALL scroll the page before counting images, SHALL pace requests under the media rate limit, and SHALL report 429 and 500 responses separately from images that failed to decode.

A test SHALL fail when any file under `lib/payload/` other than the module itself creates or updates a `media` document directly.

#### Scenario: Nothing is written before approval
- **WHEN** the audit has identified images to remove
- **THEN** no database write has occurred, and the per-image list exists for review

#### Scenario: Every image gets a row
- **WHEN** a study is marked reviewed
- **THEN** the list carries a verdict for every one of that study's images, so a skipped image is visible as a missing row

#### Scenario: Re-running changes nothing
- **WHEN** the applying script is run a second time against the same database
- **THEN** it reports zero changes and writes nothing

#### Scenario: Shared media is detached, not deleted
- **WHEN** an image being removed from one study is also referenced by another
- **THEN** it is detached from the first study and its media document is retained

#### Scenario: Development database first
- **WHEN** the change is applied
- **THEN** it lands on the development database and is verified in the browser before the production database is touched

#### Scenario: Stored name equals requested name
- **WHEN** a script uploads `engie-cover-2.jpg` to production after a development run left a file of that name in the local `media/` directory
- **THEN** the run refuses to start, names the directory, and no row is created — and once the directory is cleared, the row is stored as `engie-cover-2.jpg`, never `engie-cover-3.jpg`

#### Scenario: Diverged environments are named, not overwritten
- **WHEN** production's `cover` points at a filename the plan did not list for that study
- **THEN** the script skips that study, prints the unexpected filename, and writes nothing to it

#### Scenario: Pages are fresh without a redeploy
- **WHEN** a production write completes
- **THEN** `/api/revalidate` has been called with the tags the write touched, and a browser request for the affected listing within a minute shows the new state

#### Scenario: A direct media write cannot merge
- **WHEN** a new file under `lib/payload/` calls `payload.create` on the `media` collection without going through the module
- **THEN** `bun test` fails naming that file
