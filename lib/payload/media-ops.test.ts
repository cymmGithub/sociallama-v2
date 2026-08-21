import { describe, expect, test } from 'bun:test'
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { assertCleanWorkingCopy, idOf } from './media-ops'

/**
 * The guard that makes `media-ops.ts` the only way to write media.
 *
 * It greps, deliberately. A grep has no runtime, no mocks, and no way to be
 * bypassed by a refactor that moves the call behind a helper — if the text
 * `collection: 'media'` appears inside a `.create(` or `.update(` in any other
 * file under lib/payload, the build fails naming that file.
 *
 * Existing offenders are allow-listed BY NAME with the date they were frozen.
 * The list can only shrink: a listed file that stops matching fails the test
 * too, so a port or a deletion has to remove its line. That keeps the list
 * honest about what is still unported instead of rotting into noise.
 */

const DIR = join(import.meta.dir)
const MODULE = 'media-ops.ts'

/** `.create({ … collection: 'media' … })` across line breaks. */
const DIRECT_WRITE =
  /\.(?<op>create|update)\(\s*\{[^)]*?collection:\s*['"]media['"]/s

/**
 * One-off scripts that wrote media directly before the module existed.
 * Frozen 2026-08-21. Each ran its job and is kept for its record; none should
 * be run again without porting first.
 */
const FROZEN_OFFENDERS = new Set([
  'apply-case-study-imagery.ts',
  'apply-en-alt.ts',
  'apply-final-verification-imagery.ts',
  'import-case-study.ts',
  'refresh-case-study-creatives.ts',
  'refresh-case-study-logos.ts',
  'relink-cover-art.ts',
  'repoint-ariadna-cover.ts',
  'repoint-en-images.ts',
  'seed-authors.ts',
  'seed-case-studies.ts',
  'seed-social-platforms.ts',
  'seed.ts',
  'strip-pracuj-creatives.ts',
  'swap-irobot-humor.ts',
  'translate-media-alt.ts',
  'upload-cover-art.ts',
])

function scriptsInDir(): string[] {
  return readdirSync(DIR).filter(
    (f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== MODULE
  )
}

describe('media writes go through media-ops', () => {
  const files = scriptsInDir()
  const writers = files.filter((f) =>
    DIRECT_WRITE.test(readFileSync(join(DIR, f), 'utf-8'))
  )

  test('no new file writes media directly', () => {
    const fresh = writers.filter((f) => !FROZEN_OFFENDERS.has(f))
    expect(
      fresh,
      `These files create or update media without media-ops.ts: ${fresh.join(', ')}. ` +
        'Use uploadMedia() / repointRelation() — see the module header for why.'
    ).toEqual([])
  })

  test('the frozen list only shrinks', () => {
    const stale = [...FROZEN_OFFENDERS].filter((f) => !writers.includes(f))
    expect(
      stale,
      `Listed as offenders but no longer write media directly (ported or deleted): ` +
        `${stale.join(', ')}. Remove them from FROZEN_OFFENDERS.`
    ).toEqual([])
  })
})

describe('assertCleanWorkingCopy', () => {
  test('names the directory and the fix when media/ holds files', () => {
    // This repo's worktree keeps a media/ dir only after a dev upload run, so
    // the assertion is exercised against a synthetic cwd.
    const root = mkdtempSync(join(tmpdir(), 'media-ops-'))
    mkdirSync(join(root, 'media'))
    writeFileSync(join(root, 'media', 'x-cover-2.jpg'), '')
    const prev = process.cwd()
    process.chdir(root)
    try {
      expect(() => assertCleanWorkingCopy('t')).toThrow(/holds 1 file/)
      expect(() => assertCleanWorkingCopy('t')).toThrow(/rm -rf media\//)
    } finally {
      process.chdir(prev)
    }
  })

  test('passes when media/ is absent or empty', () => {
    const root = mkdtempSync(join(tmpdir(), 'media-ops-'))
    const prev = process.cwd()
    process.chdir(root)
    try {
      expect(() => assertCleanWorkingCopy('t')).not.toThrow()
      mkdirSync(join(root, 'media'))
      expect(() => assertCleanWorkingCopy('t')).not.toThrow()
    } finally {
      process.chdir(prev)
    }
  })
})

describe('idOf', () => {
  test('reads a populated relation, a bare id, and nothing', () => {
    expect(idOf(7)).toBe(7)
    expect(idOf({ id: 7, filename: 'x.jpg' })).toBe(7)
    expect(idOf(null)).toBeNull()
    expect(idOf({ id: 'not-a-number' })).toBeNull()
  })
})
