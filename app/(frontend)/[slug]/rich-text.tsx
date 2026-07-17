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
import type { Media } from '@/payload-types'
import s from './post.module.css'

/**
 * Lexical → design system. Uploads render through the project `Image`
 * (optimized, lazy), links through the project `Link` (internal docs resolve
 * to relative paths). Headings, lists, and quotes keep the default
 * converters and are styled by post.module.css. Node types without a
 * converter fall back to the library default instead of crashing.
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

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
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

export function PostRichText({ data }: { data: SerializedEditorState }) {
  return <RichText converters={converters} data={data} />
}
