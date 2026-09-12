import { describe, expect, test } from 'bun:test'
import { auditStylesheets } from './audit-tokens'

describe('auditStylesheets', () => {
  test('counts declared values per family, skipping comments and selectors', () => {
    const inventory = auditStylesheets([
      `
      /* font-size: 99px; */
      .a { font-size: 1rem; padding: 16px 24px; border-radius: 18px; }
      .b:hover { font-size: 1rem !important; gap: var(--gap); }
      .c { @media (--desktop) { border-top-left-radius: 4px; margin-inline: auto; } }
      `,
    ])

    expect([...inventory['font-size']]).toEqual([['1rem', 2]])
    expect([...inventory.spacing]).toEqual([
      ['16px 24px', 1],
      ['auto', 1],
    ])
    expect([...inventory['border-radius']]).toEqual([
      ['18px', 1],
      ['4px', 1],
    ])
  })

  // A value that is only a reference is on the system, not a literal; a value
  // that mixes one with literals still carries literals that can drift.
  test('skips values that are a single var() reference', () => {
    const inventory = auditStylesheets([
      `
      .a { border-radius: var(--radius-pill); box-shadow: var(--shadow-card) !important; }
      .b { border-radius: var(--j) var(--j) 0 0; box-shadow: 0 0 0 2px var(--color-plum); }
      .c { padding: var(--safe); gap: calc(var(--gap) * 2); }
      `,
    ])

    expect([...inventory['border-radius']]).toEqual([
      ['var(--j) var(--j) 0 0', 1],
    ])
    expect([...inventory['box-shadow']]).toEqual([
      ['0 0 0 2px var(--color-plum)', 1],
    ])
    expect([...inventory.spacing]).toEqual([['calc(var(--gap) * 2)', 1]])
  })

  test('takes one duration per shorthand layer, in ms', () => {
    const { duration } = auditStylesheets([
      `
      .a { transition: opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1) 100ms, transform 180ms; }
      .b { animation-duration: 1.2s, 540ms; transition: color var(--duration-fast); }
      `,
    ])

    expect([...duration]).toEqual([
      ['300ms', 1],
      ['180ms', 1],
      ['1200ms', 1],
      ['540ms', 1],
    ])
  })

  test('normalizes hex literals and ignores url() fragment ids', () => {
    const { hex } = auditStylesheets([
      '.a { color: #FFF; background: #ffffff url(#fade); border-color: #913155cc; }',
    ])

    expect([...hex]).toEqual([
      ['#ffffff', 2],
      ['#913155cc', 1],
    ])
  })
})
