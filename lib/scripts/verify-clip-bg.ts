#!/usr/bin/env bun
/**
 * Clip background verification (seamless-composite convention, design D3).
 *
 * Samples the four corner regions of a clip's first frame with ffmpeg and
 * asserts they match a target theme-background color within tolerance, so a
 * clip placed on a themed section blends invisibly into the page. If a clip
 * lands off-color, color-correct or regenerate it — never adjust the theme
 * token to match a clip.
 *
 * Usage:
 *   bun lib/scripts/verify-clip-bg.ts <clip.mp4> [#hex]
 *   bun lib/scripts/verify-clip-bg.ts public/clips/hero.mp4 '#892f53'
 *
 * Passes when every corner is within ±3 per RGB channel OR ΔE (CIE76) < 3.
 * Exits non-zero on mismatch so it is usable as a pre-commit / CI gate.
 */

import { execFileSync } from 'node:child_process'

const CHANNEL_TOLERANCE = 3
const DELTA_E_TOLERANCE = 3
const SAMPLE = 16 // px square sampled at each corner

type RGB = [number, number, number]

function parseHex(hex: string): RGB {
  const h = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ]
}

/** Average a corner region into a single RGB pixel via ffmpeg. */
function sampleCorner(clip: string, xExpr: string, yExpr: string): RGB {
  const buf = execFileSync(
    'ffmpeg',
    [
      '-loglevel',
      'error',
      '-i',
      clip,
      '-vf',
      `crop=${SAMPLE}:${SAMPLE}:${xExpr}:${yExpr},scale=1:1`,
      '-frames:v',
      '1',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgb24',
      '-',
    ],
    { maxBuffer: 1 << 20 }
  )
  if (buf.length < 3)
    throw new Error(`ffmpeg returned no pixel data for ${clip}`)
  return [buf[0] as number, buf[1] as number, buf[2] as number]
}

function srgbToLab([r, g, b]: RGB): [number, number, number] {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const R = lin(r)
  const G = lin(g)
  const B = lin(b)
  // sRGB D65 → XYZ
  let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  let y = R * 0.2126 + G * 0.7152 + B * 0.0722
  let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  x = f(x)
  y = f(y)
  z = f(z)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

function deltaE(a: RGB, b: RGB): number {
  const [l1, a1, b1] = srgbToLab(a)
  const [l2, a2, b2] = srgbToLab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

function maxChannelDiff(a: RGB, b: RGB): number {
  return Math.max(...a.map((v, i) => Math.abs(v - (b[i] as number))))
}

function toHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function main() {
  const clip = process.argv[2]
  const target = process.argv[3] ?? '#892f53'
  if (!clip) {
    console.error('Usage: bun lib/scripts/verify-clip-bg.ts <clip> [#hex]')
    process.exit(2)
  }

  const targetRgb = parseHex(target)
  const corners: { label: string; x: string; y: string }[] = [
    { label: 'top-left', x: '0', y: '0' },
    { label: 'top-right', x: `in_w-${SAMPLE}`, y: '0' },
    { label: 'bottom-left', x: '0', y: `in_h-${SAMPLE}` },
    { label: 'bottom-right', x: `in_w-${SAMPLE}`, y: `in_h-${SAMPLE}` },
  ]

  console.log(`Verifying ${clip} against ${target} …`)
  let ok = true
  for (const corner of corners) {
    const rgb = sampleCorner(clip, corner.x, corner.y)
    const de = deltaE(rgb, targetRgb)
    const diff = maxChannelDiff(rgb, targetRgb)
    const pass = diff <= CHANNEL_TOLERANCE || de < DELTA_E_TOLERANCE
    ok &&= pass
    console.log(
      `  ${pass ? '✓' : '✗'} ${corner.label.padEnd(13)} ${toHex(rgb)}  ΔE=${de.toFixed(2)}  Δmax=${diff}`
    )
  }

  if (!ok) {
    console.error(
      `\n✗ ${clip} does not composite onto ${target}. Color-correct or regenerate the clip.`
    )
    process.exit(1)
  }
  console.log(`\n✓ ${clip} composites seamlessly onto ${target}.`)
}

main()
