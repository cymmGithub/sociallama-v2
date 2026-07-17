/**
 * Unit tests for the `satus add` CLI pure helpers.
 *
 * Run with: bun test lib/scripts/satus.test.ts
 *
 * Covers argument parsing, transitive `requires` resolution, the installed
 * probe, and the barrel-line restore helpers. Disk-writing steps are
 * exercised by the Phase 3 round-trip e2e.
 */

import { describe, expect, it } from 'bun:test'
import { findBarrelLine, insertBarrelLine } from './barrel-file'
import { bundleProbePath } from './bundle-installer'
import { INTEGRATION_BUNDLES } from './integration-bundles'
import { parseAddArgs, resolveAddSet } from './satus'

// ---------------------------------------------------------------------------
// parseAddArgs
// ---------------------------------------------------------------------------

describe('parseAddArgs', () => {
  it('separates plugins from flags', () => {
    const { plugins, flags } = parseAddArgs([
      'shopify',
      'webgl',
      '--from',
      '.',
      '--dry-run',
      '--yes',
    ])

    expect(plugins).toEqual(['shopify', 'webgl'])
    expect(flags.from).toBe('.')
    expect(flags.dryRun).toBe(true)
    expect(flags.yes).toBe(true)
    expect(flags.force).toBe(false)
    expect(flags.skipInstall).toBe(false)
    expect(flags.ref).toBeUndefined()
  })

  it('parses --skip-install', () => {
    const { flags } = parseAddArgs(['shopify', '--skip-install', '--yes'])
    expect(flags.skipInstall).toBe(true)
    expect(flags.yes).toBe(true)
  })

  it('supports the --flag=value form', () => {
    const { flags } = parseAddArgs(['theatre', '--from=../satus', '--ref=v2'])
    expect(flags.from).toBe('../satus')
    expect(flags.ref).toBe('v2')
  })

  it('supports --ref with a separate value', () => {
    const { flags } = parseAddArgs(['shopify', '--ref', '6f49149', '--force'])
    expect(flags.ref).toBe('6f49149')
    expect(flags.force).toBe(true)
  })

  it('fails loudly when a value flag has no value', () => {
    expect(() => parseAddArgs(['shopify', '--from'])).toThrow(
      '--from requires a value'
    )
    expect(() => parseAddArgs(['shopify', '--from', '--dry-run'])).toThrow(
      '--from requires a value'
    )
  })

  it('fails loudly on unknown flags', () => {
    expect(() => parseAddArgs(['shopify', '--frmo', '.'])).toThrow(
      'Unknown flag: --frmo'
    )
  })
})

// ---------------------------------------------------------------------------
// resolveAddSet — transitive `requires` resolution
// ---------------------------------------------------------------------------

describe('resolveAddSet', () => {
  it('resolves a standalone plugin to itself', () => {
    expect(resolveAddSet(['shopify'])).toEqual({
      order: ['shopify'],
      implied: [],
    })
  })

  it('pulls in required plugins before the requester (theatre → webgl)', () => {
    const { order, implied } = resolveAddSet(['theatre'])

    expect(order).toEqual(['webgl', 'theatre'])
    expect(implied).toEqual(['webgl'])
  })

  it('does not mark explicitly requested dependencies as implied', () => {
    const { order, implied } = resolveAddSet(['theatre', 'webgl'])

    expect(order).toEqual(['webgl', 'theatre'])
    expect(implied).toEqual([])
  })

  it('deduplicates repeated requests', () => {
    const { order } = resolveAddSet(['webgl', 'webgl', 'theatre'])
    expect(order).toEqual(['webgl', 'theatre'])
  })

  it('fails loudly on unknown plugin ids', () => {
    expect(() => resolveAddSet(['shopifyy'])).toThrow(
      'Unknown plugin "shopifyy"'
    )
  })
})

// ---------------------------------------------------------------------------
// bundleProbePath — installed detection
// ---------------------------------------------------------------------------

describe('bundleProbePath', () => {
  it('uses the first folder as the installed probe', () => {
    const shopify = INTEGRATION_BUNDLES.shopify
    if (!shopify) throw new Error('shopify bundle not found')
    expect(bundleProbePath(shopify)).toBe('lib/integrations/shopify')
  })

  it('every bundle has a probe path', () => {
    for (const bundle of Object.values(INTEGRATION_BUNDLES)) {
      expect(bundleProbePath(bundle)).toBeTruthy()
    }
  })
})

// ---------------------------------------------------------------------------
// Barrel-line restore helpers
// ---------------------------------------------------------------------------

describe('findBarrelLine', () => {
  const barrel = `export * from './accordion'
export * from './marquee'
export * from './example-image'
`

  it('finds the line matching a removal pattern', () => {
    expect(findBarrelLine(barrel, 'example-image')).toBe(
      "export * from './example-image'"
    )
  })

  it('returns undefined when no line matches', () => {
    expect(findBarrelLine(barrel, 'animated-gradient')).toBeUndefined()
  })
})

describe('insertBarrelLine', () => {
  it('inserts in sorted position among export lines', () => {
    const barrel = `export * from './accordion'
export * from './tabs'
`
    const result = insertBarrelLine(barrel, "export * from './marquee'")

    expect(result).toBe(`export * from './accordion'
export * from './marquee'
export * from './tabs'
`)
  })

  it('appends after the last export when it sorts last', () => {
    const barrel = `export * from './accordion'
export * from './marquee'
`
    const result = insertBarrelLine(barrel, "export * from './tabs'")

    expect(result).toBe(`export * from './accordion'
export * from './marquee'
export * from './tabs'
`)
  })

  it('is idempotent when the line already exists', () => {
    const barrel = `export * from './accordion'
export * from './example-image'
`
    expect(insertBarrelLine(barrel, "export * from './example-image'")).toBe(
      barrel
    )
  })

  it('creates content for an empty barrel', () => {
    expect(insertBarrelLine('', "export * from './example-image'")).toBe(
      "export * from './example-image'\n"
    )
  })

  it('appends to a file without export lines', () => {
    const result = insertBarrelLine(
      '// barrel\n',
      "export * from './example-image'"
    )
    expect(result).toBe("// barrel\nexport * from './example-image'\n")
  })

  it('keeps comment headers above the sorted insert', () => {
    const barrel = `// UI components barrel
export * from './accordion'
export * from './tabs'
`
    const result = insertBarrelLine(barrel, "export * from './marquee'")

    expect(result.startsWith('// UI components barrel\n')).toBe(true)
    expect(result.indexOf('./accordion')).toBeLessThan(
      result.indexOf('./marquee')
    )
    expect(result.indexOf('./marquee')).toBeLessThan(result.indexOf('./tabs'))
  })
})
