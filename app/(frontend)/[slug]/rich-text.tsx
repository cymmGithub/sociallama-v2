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

function linkHref(node: SerializedLinkNode | SerializedAutoLinkNode): string {
  if (node.fields.linkType === 'internal') {
    const doc = node.fields.doc
    if (!doc || typeof doc.value !== 'object') {
      return '/'
    }
    const slug = (doc.value as { slug?: string }).slug ?? ''
    // Posts live at root-level URLs; categories under /category
    return doc.relationTo === 'categories' ? `/category/${slug}` : `/${slug}`
  }
  return node.fields.url ?? '/'
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
  headingOffset: number
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
      const id = entry ? entry.slug : slugifyHeading(tracked.text)
      // No class: `.body h2/h3` in post.module.css already styles these, and
      // that's also where their `scroll-margin-top` lives.
      return <Tag id={id}>{children}</Tag>
    },
    link: ({ node, nodesToJSX }) => (
      <Link
        href={linkHref(node)}
        {...(node.fields.newTab ? { target: '_blank' } : {})}
      >
        {nodesToJSX({ nodes: node.children })}
      </Link>
    ),
    autolink: ({ node, nodesToJSX }) => (
      <Link href={linkHref(node)}>{nodesToJSX({ nodes: node.children })}</Link>
    ),
    upload: ({ node }) => <UploadImage node={node} />,
  })
}

export function PostRichText({
  data,
  toc,
  headingOffset = 0,
}: {
  data: SerializedEditorState
  /** Omit on surfaces that have no table of contents (case studies). */
  toc?: readonly TocEntry[]
  /**
   * Heading index to resume from. Non-zero only for the second half of a body
   * split around the in-article CTA, so its anchors continue the same sequence.
   */
  headingOffset?: number
}) {
  return (
    <RichText converters={makeConverters(toc, headingOffset)} data={data} />
  )
}
