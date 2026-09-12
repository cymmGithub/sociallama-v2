/**
 * Token inventory: every literal value the CSS modules use per visual property,
 * with occurrence counts. Read-only — re-run it to see whether a surface is on
 * the system or has drifted. `DESIGN.md` quotes its output.
 *
 * A value that is only a `var(--name)` reference is skipped: it is on the
 * system, and counting it would make every substitution look like a new value.
 * A value that mixes a reference with literals (`0 0 0 2px var(--color-plum)`)
 * still counts, and so does a reference with a fallback.
 *
 *   bun run styles:audit
 *
 * Durations are normalized to ms and hex literals to lowercase 6/8 digits, so
 * `0.2s`/`200ms` and `#FFF`/`#ffffff` count as one value.
 */

const ROOTS = ['app', 'components', 'lib']

const FAMILIES = {
  'font-size': /^font-size$/,
  spacing:
    /^(?:(?:padding|margin)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|(?:row-|column-)?gap)$/,
  'border-radius':
    /^border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius$/,
  'box-shadow': /^box-shadow$/,
} as const

type Family = keyof typeof FAMILIES | 'duration' | 'hex'
type Inventory = Record<Family, Map<string, number>>

// A lookbehind, not a consumed `;`: the previous match already ate it, and a
// consumed anchor would skip every second declaration on a one-line rule.
const DECLARATION =
  /(?<=^|[;{])\s*(?<property>--[\w-]+|[a-z-]+)\s*:\s*(?<value>[^;{}]+);/gm
const TIME = /(?<![\w.-])(?<amount>\d*\.?\d+)(?<unit>m?s)\b/g
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi

const REFERENCE = /^var\(--[\w-]+\)$/

// Splits a comma-separated list, leaving commas inside cubic-bezier() etc.
function splitTopLevel(value: string) {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, i))
      start = i + 1
    }
  }
  parts.push(value.slice(start))
  return parts
}

// Longhands list durations only; in a shorthand layer the first time is the
// duration and a second one is the delay.
function durationsOf(property: string, value: string) {
  const longhand = /^(?:transition|animation)-duration$/.test(property)
  if (!(longhand || /^(?:transition|animation)$/.test(property))) return []

  return splitTopLevel(value).flatMap((layer) => {
    const times = [...layer.matchAll(TIME)].map(({ groups }) => {
      const ms = Number(groups?.amount) * (groups?.unit === 's' ? 1000 : 1)
      return `${Math.round(ms)}ms`
    })
    return longhand ? times : times.slice(0, 1)
  })
}

function normalizeHex(hex: string) {
  const digits = hex.slice(1).toLowerCase()
  return digits.length <= 4
    ? `#${[...digits].map((digit) => digit + digit).join('')}`
    : `#${digits}`
}

export function auditStylesheets(sources: Iterable<string>) {
  const inventory: Inventory = {
    'font-size': new Map(),
    spacing: new Map(),
    'border-radius': new Map(),
    'box-shadow': new Map(),
    duration: new Map(),
    hex: new Map(),
  }
  const tally = (family: Family, value: string) => {
    const counts = inventory[family]
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  for (const source of sources) {
    const css = source.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const { groups } of css.matchAll(DECLARATION)) {
      const property = groups?.property ?? ''
      const value = (groups?.value ?? '')
        .replace(/\s+/g, ' ')
        .replace(/\s*!important$/i, '')
        .trim()
      if (REFERENCE.test(value)) continue

      for (const [family, pattern] of Object.entries(FAMILIES)) {
        if (pattern.test(property)) tally(family as Family, value)
      }
      for (const duration of durationsOf(property, value)) {
        tally('duration', duration)
      }
      // url(#id) fragment ids (`url(#fade)`) are not colours.
      for (const [hex] of value.replace(/url\([^)]*\)/g, '').matchAll(HEX)) {
        tally('hex', normalizeHex(hex))
      }
    }
  }

  return inventory
}

if (import.meta.main) {
  const files = ROOTS.flatMap((root) =>
    [...new Bun.Glob('**/*.module.css').scanSync({ cwd: root })].map(
      (file) => `${root}/${file}`
    )
  ).sort()
  const inventory = auditStylesheets(
    await Promise.all(files.map((file) => Bun.file(file).text()))
  )

  console.log(`${files.length} CSS modules under ${ROOTS.join('/, ')}/\n`)
  for (const [family, counts] of Object.entries(inventory)) {
    const rows = [...counts].sort(
      ([a, countA], [b, countB]) => countB - countA || a.localeCompare(b)
    )
    const total = rows.reduce((sum, [, count]) => sum + count, 0)
    console.log(`${family} — ${total} occurrences, ${rows.length} distinct`)
    for (const [value, count] of rows) {
      console.log(`${String(count).padStart(5)}  ${value}`)
    }
    console.log()
  }
}
