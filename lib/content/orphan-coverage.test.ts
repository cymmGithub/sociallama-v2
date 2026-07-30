import { describe, expect, test } from 'bun:test'
import { scanOrphans } from '@/lib/scripts/audit-static-orphans'

/*
 * Guards the invariant, not the rule.
 *
 * `lib/typography/orphan-rules.test.ts` proves the rule is correct in isolation.
 * This proves it is still APPLIED to the copy — the failure mode that test
 * cannot see. Polish typesetting forbids leaving a one-letter function word at
 * a line end, 810 of them were bound across `lib/content/*.ts` and two inline
 * pages, and nothing else notices if an edit drops one: the copy still reads
 * correctly, it just wraps badly, and only at some viewport widths.
 *
 * It runs the real scanner rather than a second implementation of it, so the
 * rule, the file list and the exclusions cannot drift apart from the tool that
 * fixes them.
 */

const { findings, scanned } = scanOrphans()

describe('orphan coverage in the site copy', () => {
  /*
   * Two tripwires first, because the dangerous failure here is not a red test —
   * it is a green one. `app/(frontend)/**` as a glob matched nothing (the
   * parentheses are glob syntax), which made a real run report a clean audit
   * over zero files. A coverage test that passes because the detector stopped
   * detecting is worse than no coverage test at all.
   */
  test('the scan actually reached the files', () => {
    expect(scanned).toBeGreaterThan(80)
  })

  test('the scan actually still detects gaps', () => {
    // Hundreds of T2/T3 gaps are deliberately left unbound, so a total of zero
    // means the rule set broke, not that the copy became perfect.
    expect(findings.length).toBeGreaterThan(100)
  })

  test('no bindable single-letter orphan is left unbound', () => {
    const unbound = findings
      .filter((finding) => finding.actionable)
      .map(
        (finding) =>
          `${finding.file}:${finding.line} — "${finding.token}" in ${finding.path}\n    ${finding.excerpt}`
      )

    // Listed rather than counted: a failure should name the exact gaps, since
    // the fix is `bun ./lib/scripts/audit-static-orphans.ts --apply`.
    expect(unbound).toEqual([])
  })

  /*
   * The tiers below T1 are a standing decision, not an oversight — `to`, `co`
   * and `by` are also pronouns and verbs, so binding them inflates the diff for
   * arguable gain. This asserts the decision is still the decision: if someone
   * turns T2 on, this test says so out loud instead of the backlog silently
   * emptying.
   */
  test('T2 and T3 remain report-only', () => {
    const written = findings.filter(
      (finding) => finding.tier !== 'T1' && finding.actionable
    )
    expect(written).toEqual([])
  })
})
