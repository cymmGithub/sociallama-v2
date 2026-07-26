/**
 * Unit tests for the pure WP → HTML pre-pass (lib/scripts/wp-html-prepass.ts).
 *
 * Run with: bun test lib/scripts/wp-html-prepass.test.ts
 *
 * Covers the bug this file exists to fix: a WordPress internal post embed
 * ships a `<blockquote class="wp-embedded-content">` (titled permalink,
 * converts cleanly) AND an `<iframe class="wp-embedded-content" src="…">`
 * that used to degrade into a second, dead-linking paragraph. The iframe
 * must now be dropped; a genuine third-party iframe (no such class/src
 * shape) must still degrade to a link, since nothing else preserves its URL.
 */

import { describe, expect, it } from 'bun:test'
import { prePass } from './wp-html-prepass'

const WP_ORIGIN = 'https://sociallama.pl'

describe('prePass — WordPress internal post embed', () => {
  it('drops the embed iframe and keeps the blockquote permalink', () => {
    const html = `
      <p>See also:</p>
      <blockquote class="wp-embedded-content" data-secret="wNbhKpXHRn">
        <a href="https://sociallama.pl/top-6-branz-dla-influencer-marketingu/" class="wp-embedded-content" data-secret="wNbhKpXHRn">TOP 6 branż dla influencer marketingu</a>
      </blockquote>
      <iframe class="wp-embedded-content" sandbox="allow-scripts" security="restricted" style="position: absolute; visibility: hidden;" title="&#8222;TOP 6 branż dla influencer marketingu&#8221; &#8212; SocialLama" src="https://sociallama.pl/top-6-branz-dla-influencer-marketingu/embed/#?secret=coiSnrg1T1#?secret=wNbhKpXHRn" data-secret="wNbhKpXHRn" width="600" height="338" frameborder="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>
    `
    const { html: out, notes } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).not.toContain('embed/#?secret=')
    expect(out).not.toContain('<iframe')
    expect(out).toContain('TOP 6 branż dla influencer marketingu')
    expect(out).toContain('wp-embedded-content')
    expect(
      notes.some((n) => n.includes('WP internal post embed iframe dropped'))
    ).toBe(true)
  })

  it('recognizes an internal embed by src shape even without the class attribute', () => {
    const html = `<iframe sandbox="allow-scripts" src="https://sociallama.pl/foo/embed/#?secret=abc123"></iframe>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).not.toContain('embed/#?secret=')
    expect(out).not.toContain('<iframe')
  })

  it('still degrades a genuine third-party iframe to a link', () => {
    const html = `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315"></iframe>`
    const { html: out, notes } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe(
      '<p><a href="https://www.youtube.com/embed/dQw4w9WgXcQ">https://www.youtube.com/embed/dQw4w9WgXcQ</a></p>'
    )
    expect(notes.some((n) => n.startsWith('iframe → link:'))).toBe(true)
  })

  it('handles both an internal embed and a third-party iframe in one body', () => {
    const html = `
      <blockquote class="wp-embedded-content"><a href="https://sociallama.pl/foo/">Foo</a></blockquote>
      <iframe class="wp-embedded-content" src="https://sociallama.pl/foo/embed/#?secret=xyz"></iframe>
      <p>and also:</p>
      <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
    `
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).not.toContain('embed/#?secret=')
    expect(out).toContain('wp-embedded-content')
    expect(out).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
})
