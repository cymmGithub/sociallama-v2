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

function linkHref(
  node: SerializedLinkNode | SerializedAutoLinkNode,
  { basePath, categoryPath, fallbackHref }: PostPaths
): string {
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

  return doc.relationTo === 'categories'
    ? `${categoryPath}/${slug}`
    : `${basePath}/${slug}`
}

function UploadImage({ node }: { node: SerializedUploadNode }) {
  if (node.relationTo !== 'media' || typeof node.value !== 'object') {
    return null
  }
  const media = node.value as Media
  if (!media.url) {
    return null
  }

  return (
    <span className={s.figure}>
      <Image
        src={media.url}
        alt={media.alt}
        {...(media.width && media.height
          ? { width: media.width, height: media.height }
          : { fill: true })}
        mobileSize="100vw"
        desktopSize="72vw"
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
  locale: Locale
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
        href={linkHref(node, paths)}
        {...(node.fields.newTab ? { target: '_blank' } : {})}
      >
        {nodesToJSX({ nodes: node.children })}
      </Link>
    ),
    autolink: ({ node, nodesToJSX }) => (
      <Link href={linkHref(node, paths)}>
        {nodesToJSX({ nodes: node.children })}
      </Link>
    ),
    upload: ({ node }) => <UploadImage node={node} />,
  })
}

export function PostRichText({
  data,
  toc,
  headingOffset = 0,
  locale,
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
}) {
  return (
    <RichText
      converters={makeConverters(toc, headingOffset, paths, locale)}
      data={data}
    />
  )
}
