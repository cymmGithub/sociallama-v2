## MODIFIED Requirements

### Requirement: Postgres and Blob infrastructure
Payload SHALL use the `@payloadcms/db-postgres` adapter with a Neon Postgres connection string from `DATABASE_URL`, and `@payloadcms/storage-vercel-blob` for media files via `BLOB_READ_WRITE_TOKEN`. `PAYLOAD_SECRET` SHALL be required. Env vars SHALL be validated with Zod following the repo's integration env pattern, failing loudly with setup instructions when missing. Uploaded bytes SHALL be served by the Blob CDN rather than through Payload's own upload route — see the `media-serving-policy` capability, which owns where media URLs point and what they cost.

#### Scenario: Missing configuration
- **WHEN** the app starts without `DATABASE_URL` or `PAYLOAD_SECRET`
- **THEN** startup fails with a validation error naming the missing variable and how to set it

#### Scenario: Media upload
- **WHEN** an editor uploads an image in the admin panel
- **THEN** the file is stored in Vercel Blob with its generated sizes, and the media collection exposes URLs that address the store directly
