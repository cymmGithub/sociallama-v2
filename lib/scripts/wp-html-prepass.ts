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
import { type NbspLeaf, planNbsp } from '@/lib/payload/post-formatting-rules'

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

// ---------------------------------------------------------------------------
// Presentational debris
// ---------------------------------------------------------------------------

/**
 * Elements that own a run of text. A non-breaking-space gap never spans two of
 * them, and a nested one is normalized on its own pass — the same boundary the
 * Lexical side draws (post-formatting-rules.ts).
 */
const BLOCK_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'LI',
  'BLOCKQUOTE',
  'TD',
  'TH',
  'FIGCAPTION',
  'DIV',
])

/** Inline wrappers a spacer paragraph may contain and still be safe to drop. */
const INERT_INLINE = new Set([
  'BR',
  'SPAN',
  'STRONG',
  'EM',
  'B',
  'I',
  'U',
  'SMALL',
  'FONT',
])

/** WordPress's ways of saying "justify" in a class. */
const JUSTIFY_CLASS = /^(?:has-text-align-justify|alignjustify|text-justify)$/i

// `Node.ELEMENT_NODE` and friends live on jsdom's window, not on a Bun
// global, so the numbers are spelled out rather than read off `Node`.
const ELEMENT_NODE = 1
const TEXT_NODE = 3

/**
 * Strip the formatting WordPress used to simulate layout, so a re-run of the
 * migration cannot put back what repair-post-formatting.ts just cleared.
 *
 * Three classes, matching the repair exactly: justified alignment (inline or
 * by class, with `center` left alone because it is authored intent), spacer
 * paragraphs, and non-breaking spaces used as word spaces or as padding. The
 * non-breaking-space rule is not restated here — it is `planNbsp`, the same
 * function the repair and the verifier call, fed DOM text nodes instead of
 * Lexical ones.
 *
 * This runs as a DOM pass rather than more regexes because all three rules
 * need to see element boundaries: which paragraph a `<br>` belongs to, whether
 * a gap sits at the edge of a block, whether a blank paragraph is hiding an
 * image.
 */
function stripPresentationalDebris(html: string, notes: string[]): string {
  const document = new JSDOM(`<body>${html}</body>`).window.document as Document
  const body = document.body

  let justified = 0
  for (const element of body.querySelectorAll<HTMLElement>('*')) {
    const style = element.getAttribute('style')
    if (style && /text-align\s*:\s*justify/i.test(style)) {
      const kept = style
        .split(';')
        .filter(
          (declaration) =>
            !/^\s*text-align\s*:\s*justify\s*$/i.test(declaration)
        )
        .join(';')
        .replace(/^;|;$/g, '')
        .trim()
      if (kept === '') {
        element.removeAttribute('style')
      } else {
        element.setAttribute('style', kept)
      }
      justified++
    }

    const className = element.getAttribute('class')
    if (className?.split(/\s+/).some((c) => JUSTIFY_CLASS.test(c))) {
      const kept = className
        .split(/\s+/)
        .filter((c) => c !== '' && !JUSTIFY_CLASS.test(c))
        .join(' ')
      if (kept === '') {
        element.removeAttribute('class')
      } else {
        element.setAttribute('class', kept)
      }
      justified++
    }
  }
  if (justified > 0) {
    notes.push(`${justified} justify alignment(s) dropped (center kept)`)
  }

  let spacers = 0
  let unclear = 0
  for (const paragraph of body.querySelectorAll('p')) {
    if ((paragraph.textContent ?? '').replace(/[\s\u00a0]/g, '') !== '') {
      continue
    }
    // Blank to the text walk, but an image or a rule inside it is real
    // content — reported and left alone, never guessed at.
    const opaque = [...paragraph.querySelectorAll('*')].some(
      (element) => !INERT_INLINE.has(element.tagName)
    )
    if (opaque) {
      unclear++
      continue
    }
    paragraph.remove()
    spacers++
  }
  if (spacers > 0) {
    notes.push(`${spacers} spacer paragraph(s) dropped`)
  }
  if (unclear > 0) {
    notes.push(
      `WARNING: ${unclear} blank paragraph(s) kept — they hold something the text walk cannot see`
    )
  }

  let wordSpace = 0
  let padding = 0
  const blocks: Element[] = [body, ...body.querySelectorAll('*')].filter(
    (element) => element === body || BLOCK_TAGS.has(element.tagName)
  )
  for (const block of blocks) {
    const texts: (Text | null)[] = []
    const leaves: NbspLeaf[] = []
    const collect = (node: Node) => {
      for (const child of node.childNodes) {
        if (child.nodeType === TEXT_NODE) {
          texts.push(child as Text)
          leaves.push({ node: null, text: (child as Text).data, mutable: true })
          continue
        }
        // Comments and the like carry no text and separate nothing.
        if (child.nodeType !== ELEMENT_NODE) {
          continue
        }
        const element = child as Element
        if (element.tagName === 'BR') {
          texts.push(null)
          leaves.push({ node: null, text: '\n', mutable: false })
        } else if (BLOCK_TAGS.has(element.tagName)) {
          // Normalized as a block of its own.
        } else if (element.childNodes.length > 0) {
          collect(element)
        } else {
          texts.push(null)
          leaves.push({ node: null, text: '\uFFFC', mutable: false })
        }
      }
    }
    collect(block)
    const plan = planNbsp(leaves)
    leaves.forEach((leaf, index) => {
      const target = texts[index]
      const next = plan.texts[index]
      if (target && typeof next === 'string' && next !== leaf.text) {
        target.data = next
      }
    })
    wordSpace += plan.wordSpace
    padding += plan.padding
  }
  if (wordSpace + padding > 0) {
    notes.push(
      `${wordSpace} word-space and ${padding} padding non-breaking space(s) resolved`
    )
  }

  return body.innerHTML
}

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

  // Last, so it sees the markers as ordinary text and the earlier rules have
  // already removed the iframes and shortcodes that would confuse it.
  html = stripPresentationalDebris(html, notes)

  return { html, images, notes }
}
