/**
 * The one rule shared by repair-embed-quotes.ts (Lexical, already imported)
 * and wp-html-prepass.ts (HTML, still to be imported): a social embed the
 * site cannot render becomes ONE quote holding ONE link.
 *
 * WordPress ships an Instagram/TikTok embed as a `<blockquote>` fallback plus
 * a `<script>`. The script is stripped on import and the fallback survives —
 * but its inner `<div>`s have no Lexical node, so the converter flattened
 * them into a pile of `linebreak`s around "Wyświetl ten post na Instagramie",
 * and a TikTok caption arrived as a paragraph of hashtag links plus a music
 * link. On the page that is a column of blank lines inside a quote.
 */

export interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  fields?: { url?: string; [key: string]: unknown }
  [key: string]: unknown
}

export type EmbedKind = 'instagram' | 'tiktok'

/** The link that stands for the whole embed, by URL path. */
export const PRIMARY_EMBED_PATH: Record<EmbedKind, RegExp> = {
  // A post / reel / IGTV permalink — never the profile link the header carries.
  instagram: /^\/(?:p|reel|tv)\/[^/]+\/?$/,
  // The creator profile — never a `/music/…` or `/tag/…` link.
  tiktok: /^\/@[^/]+\/?$/,
}

/** Label for a TikTok profile link, per content locale. */
const TIKTOK_LABEL: Record<string, (handle: string) => string> = {
  pl: (handle) => `${handle} na TikToku`,
  en: (handle) => `${handle} on TikTok`,
}
const tiktokLabel = (locale: string) => TIKTOK_LABEL[locale] ?? TIKTOK_LABEL.pl!

/**
 * The text the surviving link shows. Instagram keeps the label WordPress
 * already localized ("Post udostępniony przez X (@x)"); TikTok gets the
 * handle plus a locale suffix. The handle comes from the URL, not the link
 * text — the text is what a previous run wrote, and reading it back would
 * stack the suffix.
 */
export function embedLinkLabel(
  kind: EmbedKind,
  url: string,
  text: string,
  locale: string
): string {
  if (kind !== 'tiktok') {
    return text.trim()
  }
  const handle = decodeURIComponent(
    new URL(url).pathname.replace(/\/$/, '').slice(1)
  )
  return tiktokLabel(locale)(handle)
}

function linkNodes(node: LexicalNode): LexicalNode[] {
  const own = node.type === 'link' ? [node] : []
  return own.concat((node.children ?? []).flatMap(linkNodes))
}

export function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }
  return (node.children ?? []).map(nodeText).join('')
}

export function embedKindOfUrl(url: string): EmbedKind | null {
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    return null
  }
  if (/(?:^|\.)instagram\.com$/.test(host)) return 'instagram'
  if (/(?:^|\.)tiktok\.com$/.test(host)) return 'tiktok'
  return null
}

/** Which embed a quote is the leftover of, or null for an authored quote. */
export function embedKind(quote: LexicalNode): EmbedKind | null {
  if (quote.type !== 'quote') {
    return null
  }
  for (const link of linkNodes(quote)) {
    const kind = embedKindOfUrl(link.fields?.url ?? '')
    if (kind) return kind
  }
  return null
}

export function primaryLink(
  quote: LexicalNode,
  kind: EmbedKind
): LexicalNode | null {
  for (const link of linkNodes(quote)) {
    const url = link.fields?.url ?? ''
    if (embedKindOfUrl(url) !== kind) continue
    if (PRIMARY_EMBED_PATH[kind].test(new URL(url).pathname)) return link
  }
  return null
}

export type EmbedQuoteRepair =
  | { verdict: 'not-embed' }
  | { verdict: 'no-primary-link'; kind: EmbedKind }
  | { verdict: 'clean'; kind: EmbedKind }
  | { verdict: 'repair'; kind: EmbedKind; node: LexicalNode }

/**
 * Rebuild an embed leftover as `quote > link > text`. Every other child —
 * linebreaks, the "view this post" header text, hashtag and music links, the
 * centred paragraph wrapper — is dropped. Node attributes (version, format,
 * link fields) are carried over from the nodes that are kept, so the result
 * is what the editor would have produced by hand.
 */
export function repairEmbedQuote(
  quote: LexicalNode,
  locale: string
): EmbedQuoteRepair {
  const kind = embedKind(quote)
  if (!kind) {
    return { verdict: 'not-embed' }
  }
  const link = primaryLink(quote, kind)
  if (!link) {
    return { verdict: 'no-primary-link', kind }
  }
  const textNode = (link.children ?? []).find((c) => c.type === 'text')
  if (!textNode) {
    return { verdict: 'no-primary-link', kind }
  }
  const label = embedLinkLabel(
    kind,
    link.fields?.url ?? '',
    nodeText(link),
    locale
  )

  const node: LexicalNode = {
    ...quote,
    children: [{ ...link, children: [{ ...textNode, text: label }] }],
  }
  if (JSON.stringify(node) === JSON.stringify(quote)) {
    return { verdict: 'clean', kind }
  }
  return { verdict: 'repair', kind, node }
}
