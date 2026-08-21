/**
 * The one way a maintenance script writes media.
 *
 * Batch image updates against production failed the same five ways three days
 * running (2026-08-19 → 08-21), each one documented in memory and each one hit
 * again after being documented. This module exists so those failures are
 * impossible to reproduce through its API, rather than merely written down:
 *
 * 1. **Renamed uploads.** Payload's `getSafeFileName` checks the local `media/`
 *    directory for collisions EVEN WHEN the bytes go to Vercel Blob
 *    (`generateFileData.js` passes `staticPath` unconditionally). A dev run
 *    leaves `<name>` on disk; the prod run bumps every filename by one. Here:
 *    `overwriteExistingFiles: true` skips that path, and the stored name is
 *    asserted equal to the requested one. Before that, `begin()` refuses a
 *    production run while `media/` holds any file at all.
 * 2. **Stale pages.** Collection hooks revalidate through `revalidateTag`, which
 *    throws outside a Next request and is swallowed — a CLI write invalidates
 *    nothing for `cacheLife('days')`. Here: `finish()` POSTs every touched tag
 *    to `/api/revalidate`, and the secret is checked before the first write.
 * 3. **Year-old optimizer variants.** `/_next/image` caches variants of the old
 *    bytes; a deploy does not clear them. Here: `finish()` purges the CDN when
 *    bytes changed.
 * 4. **Diverged environments.** Dev and prod can point one field at different
 *    rows. Here: `repointRelation` takes the list of filenames the plan expects
 *    and reports `stale` — never writes — on a third value.
 * 5. **Lying verification.** Bare curl hits a different `Accept`-negotiated
 *    cache entry than a browser; `naturalWidth` counts lazy images as broken;
 *    the rate limiter surfaces as 400. Here: `verifyLive()` does it once,
 *    correctly.
 *
 * Shape of a script on this module:
 *
 *   const ctx = await begin({ script: 'apply-x', prod, apply, host })
 *   for (const op of OPS) {
 *     const verdict = await repointRelation(ctx, { …, from: op.from, upload: … })
 *   }
 *   await finish(ctx)
 *
 * `media-ops.test.ts` fails the build if any other file under `lib/payload/`
 * creates or updates a `media` document directly.
 */

import { existsSync, readdirSync } from 'node:fs'
import { targetProdEnv } from '@/lib/payload/prod-env'

// —— context ————————————————————————————————————————————————————————————————

export type Ctx = {
  script: string
  prod: boolean
  apply: boolean
  /** Deployed origin for revalidation, e.g. https://sociallama-v2.vercel.app */
  host: string
  // biome-ignore lint/suspicious/noExplicitAny: Payload's local API type is enormous and this module is its only consumer
  payload: any
  tags: Set<string>
  bytesChanged: boolean
  rollback: string[]
}

export type BeginOpts = {
  script: string
  prod: boolean
  apply: boolean
  /**
   * Where the pages live. Required, not inferred: `NEXT_PUBLIC_BASE_URL` points
   * at the public domain, which is still the old site until cutover, and a
   * revalidate call against the wrong host succeeds silently with a 404.
   */
  host: string
}

/**
 * Env checks and the clean-working-copy preflight, then the Payload client.
 *
 * Everything that could make `finish()` fail is checked HERE, before a single
 * write — a run that cannot revalidate must not start, because "data changed,
 * pages stale for a day" is the failure this module exists to end.
 */
export async function begin(opts: BeginOpts): Promise<Ctx> {
  if (opts.prod) {
    if (opts.apply) {
      assertCleanWorkingCopy(opts.script)
      if (!process.env.REVALIDATE_SECRET) {
        throw new Error(
          `${opts.script}: REVALIDATE_SECRET is not set — a production write ` +
            'that cannot revalidate leaves every prerendered page stale for a ' +
            'day. Add it to .env.local before running --apply --prod.'
        )
      }
    }
    targetProdEnv(opts.script, { blob: true })
  }
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })
  return {
    ...opts,
    payload,
    tags: new Set(),
    bytesChanged: false,
    rollback: [],
  }
}

/**
 * Refuse a production write while the local media directory holds files.
 *
 * Those files are exactly what `getSafeFileName` collides with. They are left
 * by a development run of the same script (no Blob token → bytes land on disk),
 * so the sequence "dev, verify, then prod" — the sequence every plan requires —
 * is the one that triggers the rename. Deleting them here is tempting and
 * wrong: the dev server may be serving them. The fix is named instead.
 */
export function assertCleanWorkingCopy(script: string): void {
  const dir = `${process.cwd()}/media`
  if (!existsSync(dir)) return
  const files = readdirSync(dir).filter((f) => !f.startsWith('.'))
  if (files.length === 0) return
  throw new Error(
    `${script}: ${dir} holds ${files.length} file(s) from a development run. ` +
      'Payload checks that directory for filename collisions even when bytes go ' +
      'to Vercel Blob, so a production upload from here is renamed ' +
      '(`-cover-2` becomes `-cover-3`). Stop the dev server if it is serving ' +
      'them, then `rm -rf media/` and re-run.'
  )
}

// —— helpers ————————————————————————————————————————————————————————————————

export const idOf = (v: unknown): number | null => {
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'id' in v) {
    const id = (v as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

const filenameOf = (v: unknown): string | null =>
  v && typeof v === 'object' && 'filename' in v
    ? ((v as { filename: unknown }).filename as string | null)
    : null

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// —— upload —————————————————————————————————————————————————————————————————

export type UploadOpts = {
  /** The filename the row MUST end up with. */
  file: string
  /** Path on disk to read the bytes from. */
  fromPath: string
  altPl: string
  altEn: string
  /**
   * Allow replacing an existing object of the same name. Off by default: a
   * plan names its files deliberately, and an accidental overwrite is a worse
   * failure than a refused one.
   */
  replace?: boolean
}

/**
 * Does the store already hold an object under this exact key?
 *
 * Blob when the plugin is active (token set), the local directory otherwise.
 * Blob's `list` is eventually consistent; one false "exists" is accepted over
 * one silent overwrite.
 */
async function objectExists(file: string): Promise<boolean> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return existsSync(`${process.cwd()}/media/${file}`)
  const { list } = await import('@vercel/blob')
  const stem = file.slice(0, file.lastIndexOf('.'))
  const { blobs } = await list({ prefix: stem, token })
  return blobs.some((b) => b.pathname === file)
}

/**
 * Delete every object under a filename (the original and its `-WxH` variants)
 * and poll until the store agrees they are gone. Dev and prod share one Blob
 * store, so a prod run can find a dev run's key already present.
 */
export async function clearBlobs(file: string): Promise<number> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return 0
  const { list, del } = await import('@vercel/blob')
  const dot = file.lastIndexOf('.')
  const stem = file.slice(0, dot)
  const ext = file.slice(dot)
  const variant = new RegExp(
    `^${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+x\\d+)?${ext.replace('.', '\\.')}$`
  )
  const matching = async () => {
    const { blobs } = await list({ prefix: stem, token })
    return blobs.filter((b) => variant.test(b.pathname))
  }
  const first = await matching()
  if (first.length === 0) return 0
  await del(
    first.map((b) => b.url),
    { token }
  )
  for (let i = 0; i < 20; i++) {
    const still = await matching()
    if (still.length === 0) return first.length
    await sleep(500 + i * 250)
    await del(
      still.map((b) => b.url),
      { token }
    )
  }
  throw new Error(
    `${file}: blob objects still present after 20 delete attempts`
  )
}

/**
 * Upload a file so that the stored filename IS the requested filename.
 *
 * Reuses an existing row of that name (idempotent). Otherwise creates with
 * `overwriteExistingFiles: true`, which skips `getSafeFileName` — the local
 * collision rename — entirely. The stored name is then read back and asserted:
 * the option is the mechanism, the assertion is the contract, and a Payload
 * upgrade that changes the option's meaning fails loudly here instead of
 * shipping a renamed row.
 *
 * EN alt is a separate localized write. `alt` is required, so a Polish-only
 * upload is an accessibility regression on /en.
 */
export async function uploadMedia(ctx: Ctx, opts: UploadOpts) {
  const existing = await ctx.payload.find({
    collection: 'media',
    where: { filename: { equals: opts.file } },
    limit: 1,
    locale: 'pl',
    overrideAccess: true,
  })
  if (existing.docs[0]) return { doc: existing.docs[0], created: false }

  if (!ctx.apply) return { doc: null, created: false }

  if (await objectExists(opts.file)) {
    if (!opts.replace) {
      throw new Error(
        `${opts.file}: an object of that name is already in the store but no ` +
          'media row owns it (a previous run left it behind). Pass replace: true ' +
          'on this op to overwrite it, or choose another name.'
      )
    }
    const n = await clearBlobs(opts.file)
    console.log(`    (cleared ${n} orphaned object(s) named ${opts.file})`)
  }

  const doc = await ctx.payload.create({
    collection: 'media',
    locale: 'pl',
    data: { alt: opts.altPl },
    filePath: opts.fromPath,
    overwriteExistingFiles: true,
    overrideAccess: true,
  })
  if (doc.filename !== opts.file) {
    throw new Error(
      `${opts.file}: Payload stored it as ${doc.filename}. The row exists (id ` +
        `${doc.id}) but under the wrong name — fix the name or delete the row ` +
        'before re-running; nothing has been repointed at it.'
    )
  }
  await ctx.payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'en',
    data: { alt: opts.altEn },
    overrideAccess: true,
  })
  ctx.bytesChanged = true
  return { doc, created: true }
}

// —— repoint ————————————————————————————————————————————————————————————————

export type RepointOpts = {
  collection: string
  slug: string
  /** Top-level upload relation on the document, e.g. `cover`. */
  field: string
  /** Filenames the plan expects the field to hold now — dev's and prod's. */
  from: string[]
  /** The filename the field should hold afterwards. */
  to: string
  /** Produces the replacement row when needed (called only for `pending`). */
  upload: () => Promise<{ id: number; filename: string } | null>
  /** Cache tags this write invalidates, e.g. `['case-studies', 'case-study:x']`. */
  tags: string[]
}

export type Verdict = 'already-done' | 'pending' | 'stale' | 'missing'

/**
 * Point an upload relation at a new row, guarded by what the TARGET database
 * currently holds.
 *
 * `from` is a list because dev and prod reference different rows for the same
 * field more often than a plan author expects. A current value matching none
 * of them means the content moved since the plan was written; it is reported
 * as `stale` with the unexpected filename and never overwritten.
 */
export async function repointRelation(
  ctx: Ctx,
  opts: RepointOpts
): Promise<Verdict> {
  const found = await ctx.payload.find({
    collection: opts.collection,
    where: { slug: { equals: opts.slug } },
    limit: 1,
    depth: 1,
    locale: 'pl',
    draft: false,
    overrideAccess: true,
  })
  const doc = found.docs[0]
  if (!doc) {
    console.log(
      `  ! ${opts.slug}: no such ${opts.collection} document — skipped`
    )
    return 'missing'
  }
  const current = filenameOf(doc[opts.field])
  if (current === opts.to) return 'already-done'
  if (!(current && opts.from.includes(current))) {
    console.log(
      `  ! ${opts.slug}.${opts.field} is ${current ?? '(none)'}, expected one of ` +
        `${opts.from.join(' | ')} — skipped, the plan is stale for this document`
    )
    return 'stale'
  }

  console.log(
    `  ${ctx.apply ? '~' : 'would'} ${opts.slug}.${opts.field}: ${current} -> ${opts.to}`
  )
  for (const t of opts.tags) ctx.tags.add(t)
  if (!ctx.apply) return 'pending'

  const media = await opts.upload()
  if (!media) {
    throw new Error(
      `${opts.slug}: no media row for ${opts.to} — aborting rather than blanking ${opts.field}`
    )
  }
  await ctx.payload.update({
    collection: opts.collection,
    id: doc.id,
    data: { [opts.field]: media.id },
    overrideAccess: true,
  })
  ctx.rollback.push(
    `${opts.slug}.${opts.field}: ${media.filename} -> ${current}`
  )
  return 'pending'
}

// —— finish —————————————————————————————————————————————————————————————————

/**
 * End the run: revalidate what changed, purge the CDN if bytes changed, print
 * the rollback lines.
 *
 * One POST carrying every tag — `/api/revalidate` is rate-limited. On a dev or
 * report-only run the calls are printed, not made, so the log shows exactly
 * what production would do.
 */
export async function finish(ctx: Ctx): Promise<void> {
  if (ctx.rollback.length) {
    console.log('\nRollback — repoint these back:')
    for (const line of ctx.rollback) console.log(`  ${line}`)
  }

  const tags = [...ctx.tags].sort()
  if (tags.length === 0) {
    console.log('\nNothing changed — no revalidation needed.')
    return
  }

  const query = tags.map((t) => `tag=${encodeURIComponent(t)}`).join('&')
  const url = `${ctx.host}/api/revalidate?${query}`

  if (!(ctx.prod && ctx.apply)) {
    console.log(`\nOn --apply --prod this run would POST ${url}`)
    if (ctx.bytesChanged || !ctx.apply) {
      console.log(
        'and then: vercel cache purge --project sociallama-v2 --type cdn -y'
      )
    }
    return
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET as string },
  })
  const body = await res.text()
  if (!res.ok) {
    throw new Error(
      `revalidate failed (${res.status}): ${body.slice(0, 200)} — the data is ` +
        'written; re-run this POST by hand or the pages stay stale for a day.'
    )
  }
  console.log(`\nRevalidated ${tags.length} tag(s): ${body.slice(0, 160)}`)

  if (ctx.bytesChanged) {
    const { spawnSync } = await import('node:child_process')
    const r = spawnSync(
      'vercel',
      ['cache', 'purge', '--project', 'sociallama-v2', '--type', 'cdn', '-y'],
      { encoding: 'utf-8' }
    )
    if (r.status !== 0) {
      throw new Error(
        `CDN purge failed: ${r.stderr || r.stdout} — /_next/image will serve ` +
          'old variants for up to a year until it is run by hand.'
      )
    }
    console.log('CDN purged.')
  }
  console.log(
    'Verify in a real browser, not curl — and wait ~10 s: a read inside the ' +
      'stale-while-revalidate window still returns the old HTML.'
  )
}

// —— verify —————————————————————————————————————————————————————————————————

export type VerifyResult = {
  page: string
  status: number
  images: { total: number; decoded: number; failed: number }
  responses: { rateLimited: number; serverErrors: number }
}

/**
 * See a page the way a browser does.
 *
 * Scrolls to the bottom before counting, because lazy images below the fold
 * have no `src` yet and a naïve `naturalWidth` check calls them broken. Splits
 * 429 (the 60 req / 60 s media limiter) and 5xx (a missing Blob token locally)
 * from genuine decode failures, because all three look like "broken image"
 * from the outside and mean entirely different things.
 */
export async function verifyLive(opts: {
  host: string
  pages: string[]
}): Promise<VerifyResult[]> {
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch()
  const out: VerifyResult[] = []
  try {
    for (const page of opts.pages) {
      const p = await browser.newPage({
        viewport: { width: 1440, height: 1200 },
      })
      let rateLimited = 0
      let serverErrors = 0
      p.on('response', (r) => {
        if (r.status() === 429) rateLimited++
        else if (r.status() >= 500) serverErrors++
      })
      const res = await p.goto(`${opts.host}${page}`, {
        waitUntil: 'networkidle',
      })
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 200))
        }
      })
      await p.waitForTimeout(3000)
      const images = await p.evaluate(() => {
        const imgs = [...document.images]
        const decoded = imgs.filter(
          (i) => i.complete && i.naturalWidth > 0
        ).length
        return { total: imgs.length, decoded, failed: imgs.length - decoded }
      })
      out.push({
        page,
        status: res?.status() ?? 0,
        images,
        responses: { rateLimited, serverErrors },
      })
      await p.close()
    }
  } finally {
    await browser.close()
  }
  return out
}
