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

/**
 * The presentational-debris pass (repair-blog-post-formatting). These shapes
 * are the ones the imported corpus actually carried — the same fixtures the
 * repair's own tests use, expressed as the WordPress HTML they came from — so
 * the converter can no longer put back what the repair cleared.
 */
describe('prePass — presentational debris', () => {
  it('drops inline justified alignment and keeps centring', () => {
    const html = `
      <p style="text-align: justify;">Lejek marketingowy to model.</p>
      <p style="text-align: center;">Źródło: Post marki Vobis.pl</p>
    `
    const { html: out, notes } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).not.toContain('justify')
    expect(out).toContain('text-align: center')
    expect(notes.some((n) => n.includes('justify alignment'))).toBe(true)
  })

  it('drops a justify alignment class and keeps the other classes', () => {
    const html = `<p class="wp-block-paragraph has-text-align-justify">Tekst akapitu.</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).not.toContain('has-text-align-justify')
    expect(out).toContain('wp-block-paragraph')
  })

  it('keeps a declaration that merely sits beside the justify one', () => {
    const html = `<p style="color: red; text-align: justify">Tekst.</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).not.toContain('justify')
    expect(out).toContain('color: red')
  })

  it('drops WordPress spacer paragraphs', () => {
    const html = `<p>Pierwszy akapit.</p><p>&nbsp;</p><p><br /></p><p></p><p>Drugi akapit.</p>`
    const { html: out, notes } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe('<p>Pierwszy akapit.</p><p>Drugi akapit.</p>')
    expect(notes.some((n) => n.includes('blank block'))).toBe(true)
  })

  it('drops an empty heading', () => {
    // 11 of these in the corpus — invisible, but they claim a heading's margin.
    const html = `<p>Akapit.</p><h3></h3><h2>&nbsp;</h2><h3>Prawdziwa sekcja</h3>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe('<p>Akapit.</p><h3>Prawdziwa sekcja</h3>')
  })

  it('keeps a blank paragraph that is hiding an image', () => {
    const html = `<p><img src="https://sociallama.pl/wp-content/uploads/2020/05/x.png" alt="x" /></p>`
    const { html: out, images } = prePass(html, 'Post title', WP_ORIGIN)

    // The image became an upload marker, so the paragraph is no longer blank.
    expect(images.size).toBe(1)
    expect(out).toContain('@@upload:')
  })

  it('reports rather than removes a blank paragraph holding a link', () => {
    const html = `<p><a href="https://sociallama.pl/foo/"></a></p>`
    const { html: out, notes } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toContain('<a href')
    expect(notes.some((n) => n.startsWith('WARNING:'))).toBe(true)
  })

  it('hoists a rule out of a paragraph rather than losing it', () => {
    // `<hr>` cannot nest inside `<p>`, so the parser closes the paragraph
    // first: the now-genuinely-empty paragraph goes, the rule stays.
    const html = `<p>Akapit.</p><p><hr /></p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toContain('<hr>')
    expect(out).not.toContain('<p></p>')
  })

  it('converts a word-space non-breaking space', () => {
    const html = `<p>największy&nbsp;potencjał na viral</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe('<p>największy potencjał na viral</p>')
  })

  it('preserves a non-breaking space after a Polish one-letter preposition', () => {
    const html = `<p>promocji – o&nbsp;ile wiesz, w&nbsp;jaki sposób</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toContain('o&nbsp;ile')
    expect(out).toContain('w&nbsp;jaki')
  })

  it('preserves a grouped number', () => {
    const html = `<p>Liczba wyświetleń: 106&nbsp;800</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toContain('106&nbsp;800')
  })

  it('drops leading and trailing padding runs', () => {
    const html = `<p>&nbsp;&nbsp;&nbsp;Telefon z dobrym aparatem&nbsp;&nbsp;</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe('<p>Telefon z dobrym aparatem</p>')
  })

  it('reads a gap straddling an inline tag as one word space', () => {
    const html = `<p><strong>marketingowy</strong>&nbsp;to model</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe('<p><strong>marketingowy</strong> to model</p>')
  })

  it('does not read a gap across two paragraphs', () => {
    // The second paragraph's leading gap is padding, not a word space
    // continuing "akapitu." from the first.
    const html = `<p>Koniec akapitu.</p><p>&nbsp;Drugi akapit.</p>`
    const { html: out } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe('<p>Koniec akapitu.</p><p>Drugi akapit.</p>')
  })

  it('leaves a clean body untouched — a re-import stays clean', () => {
    const html = `<p>Pierwszy akapit.</p><h2>Sekcja</h2><p>Drugi akapit z czymś.</p>`
    const { html: out, notes } = prePass(html, 'Post title', WP_ORIGIN)

    expect(out).toBe(html)
    expect(notes).toEqual([])
  })
})
