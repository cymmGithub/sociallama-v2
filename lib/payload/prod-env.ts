/**
 * Points a maintenance script at the production database and media store.
 *
 * Call this BEFORE the dynamic `await import('@payload-config')` — the config
 * validates its environment at import time, so a script that mutates
 * `process.env` afterwards has already lost. That ordering is also why this
 * lives here rather than in `lib/payload/env.ts`: that module is imported *by*
 * `payload.config.ts`, so anything added there runs too late to help.
 *
 *   import { targetProdEnv } from '@/lib/payload/prod-env'
 *   if (process.argv.includes('--prod')) targetProdEnv('my-script', { blob: true })
 *   const { default: config } = await import('@payload-config')
 *
 * Two variables, both deliberately stored under names the running app cannot
 * pick up by accident:
 *
 * - `DATABASE_URL_PROD` — assigning it to `DATABASE_URL` in a `.env` file would
 *   hand production to every local command, including the test suite, which
 *   creates and deletes real documents.
 * - `BLOB_READ_WRITE_TOKEN_PROD` — a Payload config enables its Vercel Blob
 *   plugin whenever `BLOB_READ_WRITE_TOKEN` is set, so a token in `.env.local`
 *   does not merely permit production writes, it routes *every* local upload
 *   into the production store with no flag to pass and nothing in the UI to
 *   show it. Scripts that write media therefore have to opt in per run.
 *
 * `NODE_ENV=production` is set alongside them because Payload's dev mode
 * push-syncs the schema on init, which would stamp the production database as
 * dev-managed and hang `payload migrate` on the next deploy.
 */

/**
 * @param script  name used in the error messages, so a failure names its caller
 * @param opts.blob  require the Blob token too — set this for any script that
 *   uploads files. Without it the bytes are written to local disk while the
 *   production rows point at files that do not exist, and re-running does not
 *   repair it because the importers dedupe on rows rather than on disk.
 */
export function targetProdEnv(
  script: string,
  opts: { blob?: boolean } = {}
): void {
  const prodUrl = process.env.DATABASE_URL_PROD
  if (!prodUrl) {
    throw new Error(`${script} --prod requires DATABASE_URL_PROD in .env.local`)
  }

  if (opts.blob) {
    const token = process.env.BLOB_READ_WRITE_TOKEN_PROD
    if (!token) {
      throw new Error(
        `${script} --prod requires BLOB_READ_WRITE_TOKEN_PROD in .env.local, ` +
          'or the uploaded bytes would be written to local disk while the ' +
          'production rows point at files that do not exist.'
      )
    }
    process.env.BLOB_READ_WRITE_TOKEN = token
  }

  process.env.DATABASE_URL = prodUrl
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
}
