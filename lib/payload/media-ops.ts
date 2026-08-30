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
 *    nothing for `cacheLife('weeks')`. Here: `finish()` POSTs every touched tag
 *    to `/api/revalidate`, and the secret is checked before the first write.
 * 3. **Year-old cached bytes.** Media is served straight from the Blob CDN and
 *    `/_next/image` caches variants of it, both for a year, and a deploy clears
 *    neither. `vercel cache purge` never reached the Blob store, and now that
 *    the bytes come from there it would not help even for the original file.
 *    Here: the media collection's `afterRead` hook stamps `?v=<filesize>` on
 *    every URL, so replacing bytes under the same filename produces a URL
 *    nothing has cached — for the direct fetch and the optimizer alike
 *    (lib/payload/collections/media.ts).
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

/** Pixel size of a file on disk, or null for anything sharp cannot read. */
async function imageSize(
  path: string
): Promise<{ width: number; height: number } | null> {
  try {
    const { default: sharp } = await import('sharp')
    const meta = await sharp(path).metadata()
    return meta.width && meta.height
      ? { width: meta.width, height: meta.height }
      : null
  } catch {
    return null
  }
}

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

// —— alt text ———————————————————————————————————————————————————————————————

export type AltOpts = {
  /** The filename whose row is edited. */
  file: string
  /** `media.alt` is localized; each locale is a separate guarded write. */
  locale: 'pl' | 'en'
  /** Substring the current alt must contain — the guard AND what changes. */
  from: string
  /** Its replacement. */
  to: string
  /** Cache tags this write invalidates. */
  tags: string[]
}

/**
 * Correct one substring of a media row's alt text, one locale at a time.
 *
 * The narrow shape is deliberate: a substring swap cannot blank an alt or
 * replace a description wholesale, which is what `replaceMediaBytes` (new
 * picture, new description) and the seeders are for. The `from` string is both
 * the edit and the guard — an alt that no longer contains it has been edited by
 * someone since the plan was written, so the row is reported `stale` and left
 * alone rather than overwritten.
 *
 * Idempotent: an alt already containing `to` reports `already-done`.
 */
export async function updateMediaAlt(
  ctx: Ctx,
  opts: AltOpts
): Promise<Verdict> {
  const label = `${opts.file} [${opts.locale}]`
  const found = await ctx.payload.find({
    collection: 'media',
    where: { filename: { equals: opts.file } },
    limit: 2,
    locale: opts.locale,
    fallbackLocale: false,
    overrideAccess: true,
  })
  if (found.docs.length === 0) {
    console.log(`  ! ${label}: no media row owns that name — skipped`)
    return 'missing'
  }
  if (found.docs.length > 1) {
    throw new Error(
      `${opts.file}: ${found.docs.length} media rows share that filename — ` +
        'refusing to guess which one the plan means'
    )
  }
  const doc = found.docs[0]
  const alt: string = doc.alt ?? ''

  if (alt.includes(opts.to)) return 'already-done'
  if (!alt.includes(opts.from)) {
    console.log(
      `  ! ${label}: alt is "${alt}" — expected it to contain "${opts.from}". ` +
        'Skipped: someone has edited this since the plan was written.'
    )
    return 'stale'
  }

  const next = alt.replace(opts.from, opts.to)
  console.log(
    `  ${ctx.apply ? '~' : 'would'} ${label} ${alt}\n      -> ${next}`
  )
  for (const t of opts.tags) ctx.tags.add(t)
  if (!ctx.apply) return 'pending'

  await ctx.payload.update({
    collection: 'media',
    id: doc.id,
    locale: opts.locale,
    data: { alt: next },
    overrideAccess: true,
  })
  ctx.rollback.push(`media ${label} alt: ${next} -> ${alt}`)
  return 'pending'
}

// —— replace bytes ——————————————————————————————————————————————————————————

export type ReplaceOpts = {
  /** The filename whose row is updated. It does not change. */
  file: string
  /** Path on disk holding the new bytes. */
  fromPath: string
  /** New alt, when the picture changed enough that the old one lies. */
  altPl?: string
  altEn?: string
  /** Cache tags this write invalidates. */
  tags: string[]
}

/**
 * Put new bytes behind an existing filename, keeping the row and its id.
 *
 * This is the operation a re-crop needs and `uploadMedia` deliberately refuses:
 * `uploadMedia` returns the existing row untouched when the filename is already
 * taken, because a plan that names a new file and finds one there has a bug.
 * A re-crop is the opposite — the row is the point, since `approach[].media`
 * references it by id and a fresh row would need every pillar repointed for a
 * picture that did not change.
 *
 * Idempotent on `filesize`: a re-crop always changes it, so a second run
 * reports `already-done` instead of pushing the same bytes at Blob again. Alt
 * text is compared too, in both locales, because the crop is often what makes
 * the old description wrong.
 */
export async function replaceMediaBytes(
  ctx: Ctx,
  opts: ReplaceOpts
): Promise<Verdict> {
  const found = await ctx.payload.find({
    collection: 'media',
    where: { filename: { equals: opts.file } },
    limit: 2,
    locale: 'pl',
    overrideAccess: true,
  })
  if (found.docs.length === 0) {
    console.log(`  ! ${opts.file}: no media row owns that name — skipped`)
    return 'missing'
  }
  if (found.docs.length > 1) {
    throw new Error(
      `${opts.file}: ${found.docs.length} media rows share that filename — ` +
        'refusing to guess which one the plan means'
    )
  }
  const doc = found.docs[0]
  const { statSync } = await import('node:fs')
  const size = statSync(opts.fromPath).size
  const local = await imageSize(opts.fromPath)

  let altEnCurrent: string | null = null
  if (opts.altEn) {
    const en = await ctx.payload.find({
      collection: 'media',
      where: { id: { equals: doc.id } },
      limit: 1,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    altEnCurrent = (en.docs[0]?.alt as string) ?? null
  }
  // Dimensions first, byte count only as a fallback. Payload re-encodes WebP on
  // upload, so a stored row's `filesize` never equals the source file's and a
  // filesize check would report the same re-cut pending for ever. Every re-cut
  // changes the frame, so width and height are the honest signal.
  const bytesDone =
    local && doc.width && doc.height
      ? doc.width === local.width && doc.height === local.height
      : doc.filesize === size
  const altDone =
    (!opts.altPl || doc.alt === opts.altPl) &&
    (!opts.altEn || altEnCurrent === opts.altEn)
  if (bytesDone && altDone) return 'already-done'

  console.log(
    `  ${ctx.apply ? '~' : 'would'} ${opts.file} (id ${doc.id}): ` +
      `${bytesDone ? 'alt only' : `${doc.filesize} -> ${size} bytes`}`
  )
  for (const t of opts.tags) ctx.tags.add(t)
  if (!ctx.apply) return 'pending'

  if (!bytesDone) {
    // The Blob adapter will not overwrite a key, and `getSafeFileName` bumps a
    // name whose row already exists — including the row being updated. Clearing
    // first and asserting the stored name afterwards covers both.
    await clearBlobs(opts.file)
    let res = await ctx.payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'pl',
      filePath: opts.fromPath,
      data: opts.altPl ? { alt: opts.altPl } : {},
      overrideAccess: true,
    })
    if (res.filename !== opts.file) {
      await clearBlobs(opts.file)
      res = await ctx.payload.update({
        collection: 'media',
        id: doc.id,
        locale: 'pl',
        filePath: opts.fromPath,
        data: {},
        overrideAccess: true,
      })
    }
    if (res.filename !== opts.file) {
      throw new Error(
        `${opts.file}: stored as ${res.filename} after two attempts — the row ` +
          `(id ${doc.id}) now points at the wrong object`
      )
    }
    ctx.bytesChanged = true
    ctx.rollback.push(
      `${opts.file} (id ${doc.id}): bytes replaced — restore from git and re-run`
    )
  } else if (opts.altPl) {
    await ctx.payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'pl',
      data: { alt: opts.altPl },
      overrideAccess: true,
    })
  }

  if (opts.altEn) {
    await ctx.payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: opts.altEn },
      overrideAccess: true,
    })
  }
  return 'pending'
}

// —— pillar media ———————————————————————————————————————————————————————————

export type PillarOpts = {
  slug: string
  /** Index into `approach`. Asserted against the tags below, never trusted. */
  pillar: number
  tagPl: string
  tagEn: string
  /** Filenames the pillar is expected to hold now, in any order. */
  from: string[]
  /** Filenames it should hold afterwards, in this order. */
  to: string[]
  /** Resolves (or uploads) a row for one filename. Called only when pending. */
  resolve: (file: string) => Promise<{ id: number; filename: string } | null>
  tags: string[]
}

const LOCALES = ['pl', 'en'] as const

/**
 * Set one approach pillar's creatives, in both locales, guarded by its tag and
 * by what it holds now.
 *
 * Why this is not `repointRelation`: that one writes a single top-level upload
 * field on an unlocalized document. A pillar creative is neither. `approach` is
 * a localized WHOLE ARRAY, so PL and EN carry separate copies of every pillar
 * pointing at the same media rows, and a write that touches one locale leaves
 * the other showing the picture the review rejected.
 *
 * Three guards, in order, because each catches a different way a plan rots:
 *
 *   1. **The tag.** Pillar order is editable in the admin, so index 2 today
 *      need not be index 2 when the plan was written. A tag that does not match
 *      means the study was reordered — reported, never written.
 *   2. **The current set.** `from` is the plan's expected contents. A third
 *      filename means someone edited the pillar since; dev and prod diverge
 *      this way routinely.
 *   3. **The target set.** Already equal to `to` in both locales is
 *      `already-done`, which is what makes "re-run until zero pending" finish.
 */
export async function repointPillarMedia(
  ctx: Ctx,
  opts: PillarOpts
): Promise<Verdict> {
  const label = `${opts.slug} ${opts.tagPl}`
  // biome-ignore lint/suspicious/noExplicitAny: Payload doc shape
  const docs: Record<string, any> = {}

  for (const locale of LOCALES) {
    const res = await ctx.payload.find({
      collection: 'case-studies',
      where: { slug: { equals: opts.slug } },
      limit: 1,
      draft: true,
      locale,
      fallbackLocale: false,
      depth: 1, // media populated so the guard can read filenames
      overrideAccess: true,
    })
    const doc = res.docs[0]
    if (!doc) {
      console.log(`  ! ${label}: no case study with that slug — skipped`)
      return 'missing'
    }
    const pillar = doc.approach?.[opts.pillar]
    if (!pillar) {
      console.log(
        `  ! ${label} [${locale}]: no pillar at index ${opts.pillar} — skipped`
      )
      return 'missing'
    }
    const expectedTag = locale === 'pl' ? opts.tagPl : opts.tagEn
    // Untagged pillars are real — Pracuj and Volvo both have some — and Payload
    // returns null rather than '' for them, so the plan's empty string has to
    // compare equal.
    if ((pillar.tag ?? '') !== expectedTag) {
      console.log(
        `  ! ${label} [${locale}]: pillar ${opts.pillar} is tagged ` +
          `${pillar.tag}, expected ${expectedTag} — skipped, the pillars moved`
      )
      return 'stale'
    }
    docs[locale] = doc
  }

  const namesOf = (doc: unknown, pillarIndex: number): string[] =>
    // biome-ignore lint/suspicious/noExplicitAny: doc shape
    ((doc as any).approach[pillarIndex].media ?? []).map(
      (m: unknown) => filenameOf(m) ?? '(unnamed)'
    )

  const same = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v, i) => v === b[i])
  const sameSet = (a: string[], b: string[]) =>
    same([...a].sort(), [...b].sort())

  const done = LOCALES.every((l) =>
    same(namesOf(docs[l], opts.pillar), opts.to)
  )
  if (done) return 'already-done'

  for (const locale of LOCALES) {
    const current = namesOf(docs[locale], opts.pillar)
    if (same(current, opts.to)) continue
    if (!sameSet(current, opts.from)) {
      console.log(
        `  ! ${label} [${locale}]: holds ${current.join(', ') || '(none)'}, ` +
          `plan expected ${opts.from.join(', ') || '(none)'} — skipped, stale`
      )
      return 'stale'
    }
  }

  console.log(
    `  ${ctx.apply ? '~' : 'would'} ${label}: ` +
      `${opts.from.join(', ') || '(none)'} -> ${opts.to.join(', ') || '(none)'}`
  )
  for (const t of opts.tags) ctx.tags.add(t)
  if (!ctx.apply) return 'pending'

  const ids: number[] = []
  for (const file of opts.to) {
    const media = await opts.resolve(file)
    if (!media) {
      throw new Error(
        `${label}: no media row for ${file} — aborting rather than writing a ` +
          'pillar that is missing a creative'
      )
    }
    ids.push(media.id)
  }

  for (const locale of LOCALES) {
    const doc = docs[locale]
    if (same(namesOf(doc, opts.pillar), opts.to)) continue
    // Rebuild the whole array: `approach` is localized as a unit, so a partial
    // write would blank the pillars it omits. Populated relations are reduced
    // back to ids on the way in.
    // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
    const approach = doc.approach.map((pillar: any, i: number) => ({
      ...pillar,
      media:
        i === opts.pillar
          ? ids
          : (pillar.media ?? []).map((m: unknown) => idOf(m)),
    }))
    await ctx.payload.update({
      collection: 'case-studies',
      id: doc.id,
      locale,
      // No `draft: true`: these studies are published and the published page is
      // what the review is correcting.
      // biome-ignore lint/suspicious/noExplicitAny: hand-built rows
      data: { approach } as any,
      overrideAccess: true,
    })
  }
  ctx.rollback.push(
    `${label}: ${opts.to.join(', ') || '(none)'} -> ${opts.from.join(', ') || '(none)'}`
  )
  return 'pending'
}

// —— finish —————————————————————————————————————————————————————————————————

/**
 * End the run: revalidate what changed and print the rollback lines.
 *
 * One POST carrying every tag — `/api/revalidate` is rate-limited. On a dev or
 * report-only run the calls are printed, not made, so the log shows exactly
 * what production would do.
 *
 * No CDN purge any more. It used to be here because `/api/media/file/*` was
 * served by this project's CDN with a year on it, so replacing bytes under an
 * unchanged filename left the old picture in place. Media now comes from the
 * Blob store's own CDN, which `vercel cache purge` cannot touch at all — so
 * the fix moved to where it always belonged: the URL itself changes, because
 * the media hook stamps `?v=<filesize>` on it. A purge would only throw away
 * this project's warm page cache for nothing.
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
        'written; re-run this POST by hand or the pages stay stale for weeks.'
    )
  }
  console.log(`\nRevalidated ${tags.length} tag(s): ${body.slice(0, 160)}`)

  if (ctx.bytesChanged) {
    console.log(
      'Bytes changed — the new pictures ride a new `?v=<filesize>` URL, so ' +
        'nothing cached under the old one is in the way. Check the rendered ' +
        'src carries the new version; an unchanged `?v=` means the upload did ' +
        'not land.'
    )
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
