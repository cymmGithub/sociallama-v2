import type {
  DefaultNodeTypes,
  SerializedAutoLinkNode,
  SerializedLinkNode,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  RichText,
} from '@payloadcms/richtext-lexical/react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import { slugifyHeading } from '@/lib/blog/heading-slug'
import { type TocEntry, trackedHeading } from '@/lib/blog/toc'
import type { Locale } from '@/lib/i18n/slug-map'
import { mediaSource } from '@/lib/payload/media-refs'
import type { Media } from '@/payload-types'
import s from './post.module.css'

/**
 * Lexical → design system. Uploads render through the project `Image`
 * (optimized, lazy), links through the project `Link` (internal docs resolve
 * to relative paths). Lists and quotes keep the default converters and are
 * styled by post.module.css. Node types without a converter fall back to the
 * library default instead of crashing.
 *
 * Headings get a converter for one reason only: to stamp the anchor `id` that
 * the table of contents links to. The slug is never computed here — it comes
 * from the `toc` array the server already built (design D1).
 */

/**
 * Locale-correct URL prefixes for everything a post body can link to.
 * Bundled rather than passed positionally because every one of them is a
 * silent-wrong-destination bug if it goes missing, and a named field is
 * harder to drop than a fourth positional string.
 */
export interface PostPaths {
  /** Post URL prefix: `''` (PL, root-level) or `/en/blog`. */
  basePath: string
  /** Category URL prefix: `/category` (PL) or `/en/blog/category`. */
  categoryPath: string
  /**
   * Where a link goes when no real destination can be built in this locale —
   * an unpopulated relation, an untranslated target, or a custom link with no
   * URL. Must be a path in THIS locale: `/` and `/en` are different sites, and
   * the Polish one renders as `<html lang="pl">`.
   */
  fallbackHref: string
}

/**
 * `payload.config.ts` uses a bare `lexicalEditor()`, so its `LinkFeature`
 * offers an editor EVERY collection as an internal link target — including
 * `authors`, `media`, `social-platforms` and `users`, none of which have a
 * public URL of their own.
 *
 * This used to be a single ternary: categories took `categoryPath`, and
 * everything else took `basePath`. That is only correct for posts. A link to a
 * case study produced `/en/blog/{cs-slug}` — a 404 dressed as an article link,
 * and unnoticeable in review because it looks exactly like a post URL.
 *
 * So the mapping is now explicit and the default is `fallbackHref`, not a
 * guess. An unmappable relation lands somewhere real rather than somewhere
 * plausible. Nothing in the current corpus exercises this — all 79 posts
 * contain zero internal links — which is precisely why it needed to be closed
 * before someone adds the first one from the CMS and never sees it break.
 */
export function hrefForRelation(
  relationTo: string,
  slug: string,
  { basePath, categoryPath, fallbackHref }: PostPaths,
  locale: Locale
): string {
  switch (relationTo) {
    case 'posts':
      return `${basePath}/${slug}`
    case 'categories':
      return `${categoryPath}/${slug}`
    // Case-study slugs are shared across locales (slug-map.ts:100-104), so the
    // prefix swap is the whole difference.
    case 'case-studies':
      return locale === 'en'
        ? `/en/case-studies/${slug}`
        : `/case-studies/${slug}`
    default:
      return fallbackHref
  }
}

export function linkHref(
  node: SerializedLinkNode | SerializedAutoLinkNode,
  paths: PostPaths,
  locale: Locale
): string {
  const { fallbackHref } = paths
  if (node.fields.linkType !== 'internal') {
    return node.fields.url ?? fallbackHref
  }

  const doc = node.fields.doc
  if (!doc || typeof doc.value !== 'object') {
    return fallbackHref
  }

  // The related doc is populated by the page's locale-scoped query, so `slug`
  // already carries the right locale — only the URL shape varies. But with
  // `fallbackLocale: false` an UNTRANSLATED target populates with a null slug,
  // and that is the common case mid-translation: an English body is rendered
  // from a Polish one whose links point at posts not yet translated. Building
  // the URL anyway would yield `/en/blog/`, a silent link to the hub dressed
  // as a link to an article.
  const slug = (doc.value as { slug?: string | null }).slug
  if (!slug) {
    return fallbackHref
  }

  return hrefForRelation(String(doc.relationTo), slug, paths, locale)
}

function UploadImage({
  node,
  unoptimized,
}: {
  node: SerializedUploadNode
  unoptimized: boolean
}) {
  if (node.relationTo !== 'media' || typeof node.value !== 'object') {
    return null
  }
  const media = node.value as Media
  // Not `media.url`: an unoptimized render ships `src` verbatim, so it takes
  // the generated variant rather than the original upload (see `mediaSource`).
  const source = mediaSource(media, unoptimized)
  if (!source) {
    return null
  }

  return (
    <span className={s.figure}>
      <Image
        src={source.url}
        // `payload-types` declares `alt` as a plain `string`, and since it
        // became `localized: true` that is a lie on this surface: blog queries
        // read with `fallbackLocale: false` for the design D6 gate, which
        // propagates into depth-populated media, so an untranslated image
        // arrives with `alt: null`. Nothing in the type system catches it —
        // the same trap `resolveCategory` fell into. An empty alt marks the
        // image decorative, which is the correct degradation when there is
        // genuinely no description to give.
        alt={media.alt ?? ''}
        {...(source.width && source.height
          ? { width: source.width, height: source.height }
          : { fill: true })}
        mobileSize="100vw"
        desktopSize="72vw"
        unoptimized={unoptimized}
      />
    </span>
  )
}

/**
 * Built per render so the heading index starts at 0 every time. `nodesToJSX`
 * converts children in document order, which is the same order `buildToc`
 * walked them in — that's what makes positional matching sound.
 *
 * No `toc` means "this surface has no anchors" (the case-study article), and
 * headings render bare, exactly as the default converter left them.
 */
function makeConverters(
  toc: readonly TocEntry[] | undefined,
  headingOffset: number,
  paths: PostPaths,
  locale: Locale,
  unoptimized: boolean
): JSXConvertersFunction<DefaultNodeTypes> {
  let index = headingOffset

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = node.tag
      const children = nodesToJSX({ nodes: node.children })
      const tracked = toc ? trackedHeading(node) : null
      if (!(toc && tracked)) {
        return <Tag>{children}</Tag>
      }
      const entry = toc[index]
      index += 1
      // Fallback for the impossible case where the renderer emits more tracked
      // headings than the walk found: a degraded anchor beats a crash (D1).
      const id = entry
        ? entry.slug
        : slugifyHeading(tracked.text, undefined, locale)
      // No class: `.body h2/h3` in post.module.css already styles these, and
      // that's also where their `scroll-margin-top` lives.
      return <Tag id={id}>{children}</Tag>
    },
    link: ({ node, nodesToJSX }) => (
      <Link
        href={linkHref(node, paths, locale)}
        {...(node.fields.newTab ? { target: '_blank' } : {})}
      >
        {nodesToJSX({ nodes: node.children })}
      </Link>
    ),
    autolink: ({ node, nodesToJSX }) => (
      <Link href={linkHref(node, paths, locale)}>
        {nodesToJSX({ nodes: node.children })}
      </Link>
    ),
    upload: ({ node }) => <UploadImage node={node} unoptimized={unoptimized} />,
  })
}

export function PostRichText({
  data,
  toc,
  headingOffset = 0,
  locale,
  unoptimized,
  ...paths
}: PostPaths & {
  data: SerializedEditorState
  /** Omit on surfaces that have no table of contents (case studies). */
  toc?: readonly TocEntry[]
  /**
   * Heading index to resume from. Non-zero only for the second half of a body
   * split around the in-article CTA, so its anchors continue the same sequence.
   */
  headingOffset?: number
  /**
   * Anchor language for the degraded-heading fallback. `slugifyHeading`
   * defaults to Polish, so omitting this would stamp `id="sekcja"` into an
   * English document.
   */
  locale: Locale
  /**
   * Skip Next's image optimizer for body images — true for posts outside the
   * newest `OPTIMIZED_POST_COUNT` (lib/payload/queries.ts).
   *
   * Required, not defaulted, for the reason `PostCard` gives: a default would
   * have to pick a direction, and the safe-looking one (optimize) is the
   * expensive one. Case studies pass `false` and mean it — their creatives are
   * current artwork, not a 2020 export.
   */
  unoptimized: boolean
}) {
  return (
    <RichText
      converters={makeConverters(
        toc,
        headingOffset,
        paths,
        locale,
        unoptimized
      )}
      data={data}
    />
  )
}
