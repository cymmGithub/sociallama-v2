/**
 * Pure HTML pre-pass for the WordPress → Lexical migration (task 2.2 of
 * migrate-wp-content). Split out from migrate-wp.ts so it can be unit
 * tested: that script connects to Payload/Postgres at module load, so
 * nothing defined in it can be imported without triggering a live DB
 * connection. Everything here is pure — string in, string (+ side data) out.
 */

// jsdom ships without types (transitive dep, fine for a run-once script);
// this is the exact constructor shape convertHTMLToLexical expects.
// @ts-expect-error jsdom has no bundled or @types declarations
import { JSDOM } from 'jsdom'

/** Decode entities and strip tags via a DOM body. */
export function htmlToText(html: string): string {
  return (
    new JSDOM(`<body>${html}</body>`).window.document.body.textContent ?? ''
  )
}

/** `https://sociallama.pl/wp-content/uploads/2025/08/x.png` → `2025-08-x.png`.
 * The uploads path makes this unique; plain basenames collide across months. */
export function mediaFilename(sourceUrl: string): string {
  const url = new URL(sourceUrl)
  const parts = url.pathname.split('/').filter(Boolean)
  // Collapse dot runs (WP hosts files like `x..png`) — Payload sanitizes
  // them to a single dot on create, and the computed name must match the
  // stored name or re-runs duplicate the doc.
  const base = decodeURIComponent(parts.at(-1) ?? 'image').replace(
    /\.{2,}/g,
    '.'
  )
  const month = parts.at(-2)
  const year = parts.at(-3)
  return /^\d{4}$/.test(year ?? '') && /^\d{2}$/.test(month ?? '')
    ? `${year}-${month}-${base}`
    : base
}

/** Strip WP's `-1024x683` resize suffix to target the original file. */
export function originalImageUrl(sourceUrl: string): string {
  return sourceUrl.replace(/-\d{2,4}x\d{2,4}(\.[a-z]{3,4})$/i, '$1')
}

/** Human-readable alt fallback from a WP filename. */
export function altFromFilename(sourceUrl: string): string {
  const base = decodeURIComponent(
    new URL(sourceUrl).pathname.split('/').at(-1) ?? ''
  )
  return base
    .replace(/\.[a-z]{3,4}$/i, '')
    .replace(/-\d{2,4}x\d{2,4}$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

export const UPLOAD_MARKER = /^@@upload:(.+)@@$/

export interface PrePassResult {
  html: string
  /** marker key → { sourceUrl, alt } for the media phase */
  images: Map<string, { alt: string; sourceUrl: string }>
  notes: string[]
}

export function prePass(
  rawHtml: string,
  postTitle: string,
  wpOrigin: string
): PrePassResult {
  const notes: string[] = []
  const images = new Map<string, { alt: string; sourceUrl: string }>()
  let html = rawHtml

  // WP shortcodes (Visual Composer, captions, galleries…) — wrappers only,
  // inner content survives.
  html = html.replace(
    /\[\/?(vc_[a-z_]*|caption|gallery|embed|imi)[^\]]*\]/gi,
    ''
  )

  // Embed scripts (Instagram/TikTok) — their blockquote fallback (with the
  // permalink) survives conversion as a quote + link.
  html = html.replace(/<script[\s\S]*?<\/script>/gi, () => {
    notes.push('embed <script> stripped (blockquote fallback kept)')
    return ''
  })

  // WordPress internal post embeds ship TWO elements: a
  // `<blockquote class="wp-embedded-content">` carrying the titled permalink
  // (converts cleanly, kept), and an `<iframe class="wp-embedded-content"
  // src=".../embed/#?secret=...">` that only JS-hydrates on the live site.
  // The iframe carries no information the blockquote doesn't already have,
  // so it is dropped here — BEFORE the catch-all iframe rule below would
  // otherwise degrade it into a second, dead-linking paragraph.
  html = html.replace(
    /<iframe(?=[^>]*(?:class="wp-embedded-content"|src="[^"]*\/embed\/#\?secret=))[^>]*>[\s\S]*?(?:<\/iframe>|\/>)/gi,
    () => {
      notes.push(
        'WP internal post embed iframe dropped (blockquote permalink kept)'
      )
      return ''
    }
  )

  // Iframes (YouTube, Facebook…) have no Lexical node — degrade to a link.
  html = html.replace(
    /<iframe[^>]*\ssrc="([^"]+)"[\s\S]*?(?:<\/iframe>|\/>)/gi,
    (_, src: string) => {
      const url = src.startsWith('//') ? `https:${src}` : src
      notes.push(`iframe → link: ${url}`)
      return `<p><a href="${url}">${url}</a></p>`
    }
  )

  // Tables have no enabled Lexical node and the converter mushes them into
  // one blob. The WP tables are label matrices (header row = column labels,
  // first cell of each row = row label) — linearize into headed sections.
  html = html.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    const doc = new JSDOM(`<body>${tableHtml}</body>`).window.document
    const rows = [...doc.querySelectorAll('tr')]
    if (rows.length < 2) {
      notes.push('WARNING: <table> too small to linearize — dropped as-is')
      return tableHtml
    }
    const headerCells = [...(rows[0]?.querySelectorAll('th, td') ?? [])]
    const columnLabels = headerCells.map((c) => c.textContent?.trim() ?? '')
    let out = ''
    for (const row of rows.slice(1)) {
      const cells = [...row.querySelectorAll('th, td')]
      const rowLabel = cells[0]?.textContent?.trim() ?? ''
      for (const [i, cell] of cells.slice(1).entries()) {
        const heading = [rowLabel, columnLabels[i + 1]]
          .filter(Boolean)
          .join(' — ')
        if (heading) {
          out += `<h3>${heading}</h3>`
        }
        out += cell.innerHTML
      }
    }
    notes.push('table linearized into headed sections')
    return out
  })

  // In-content <h1> would compete with the post title — demote.
  html = html.replace(/<(\/?)h1([\s>])/gi, '<$1h2$2')

  // Internal absolute links → relative (the WP host dies after cutover).
  html = html.replace(
    /href="https?:\/\/(?:www\.)?sociallama\.pl(\/[^"]*)?"/gi,
    (_, path: string | undefined) => `href="${path || '/'}"`
  )

  // Anchor-wrapped images: WP links images to their own file — drop the
  // wrapper so the marker replacement below sees a bare <img>.
  html = html.replace(
    /<a[^>]*href="([^"]*)"[^>]*>\s*(<img[^>]+>)\s*<\/a>/gi,
    (_, href: string, img: string) => {
      if (!/wp-content\/uploads/.test(href)) {
        notes.push(`image link dropped (pointed at ${href})`)
      }
      return img
    }
  )

  // Images → marker paragraphs; markers survive HTML→Lexical as text and are
  // swapped for upload nodes afterwards (D4 phase B).
  html = html.replace(/<img[^>]*>/gi, (tag) => {
    const src = tag
      .match(/\ssrc="([^"]+)"/i)?.[1]
      // Attribute values are HTML-encoded; query-string ampersands arrive
      // as &amp; and break signed CDN URLs if fetched verbatim.
      ?.replace(/&#0?38;/g, '&')
      .replace(/&amp;/g, '&')
    if (!src || src.startsWith('data:')) {
      notes.push('img without usable src dropped')
      return ''
    }
    const sourceUrl = new URL(src, wpOrigin).href
    const alt =
      htmlToText(tag.match(/\salt="([^"]*)"/i)?.[1] ?? '').trim() ||
      altFromFilename(sourceUrl) ||
      postTitle
    const key = mediaFilename(originalImageUrl(sourceUrl))
    images.set(key, { alt, sourceUrl })
    return `<p>@@upload:${key}@@</p>`
  })

  return { html, images, notes }
}
