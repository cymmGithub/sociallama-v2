import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { ChevronDown } from 'lucide-react'
import type { FaqSection } from '@/lib/blog/faq'
import type { TocEntry } from '@/lib/blog/toc'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import type { Locale } from '@/lib/i18n/slug-map'
import { HeadingAnchor } from './heading-anchor'
import s from './post.module.css'
import { type PostPaths, PostRichText } from './rich-text'

/**
 * The strict-shape FAQ closer, as a disclosure list (design D4).
 *
 * It is a component rather than a Lexical converter for one structural reason:
 * a `details` wraps the question AND its answer, which are siblings in the
 * body, and a converter only ever sees one node. So `detectFaq` cuts the
 * section off the body and this renders it — the same nodes, one level of
 * markup deeper.
 *
 * Anchors: the question's table-of-contents slug goes on the `details`, not on
 * the `h3`, because that is what a jump has to reach — opening the disclosure
 * and scrolling to the question are the same target (design D6).
 *
 * All rows start closed. The browser's own "reveal an anchor inside a closed
 * details" behaviour is never relied on: Lenis drives the page's scrolling and
 * bypasses it, so `toc.tsx` opens the row explicitly.
 */
export function PostFaq({
  section,
  toc,
  locale,
  unoptimized,
  headingContent,
  ...paths
}: PostPaths & {
  section: FaqSection
  /** The whole body's table of contents — sliced by `headingOffset` here. */
  toc: readonly TocEntry[]
  locale: Locale
  unoptimized: boolean
  /** Copy for the `h2` copy-link control, as every other `h2` gets one. */
  headingContent: Localized<typeof pl.postHeading>
}) {
  const entries = toc.slice(section.headingOffset)
  const headingSlug = entries[0]?.slug

  /** One node as its own editor state, so the answer keeps its links. */
  const asBody = (node: unknown): SerializedEditorState =>
    ({
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [node],
      },
    }) as unknown as SerializedEditorState

  return (
    <>
      <div className={s.headingRow}>
        <h2 {...(headingSlug ? { id: headingSlug } : {})}>
          {section.headingText}
        </h2>
        {headingSlug && (
          <HeadingAnchor content={headingContent} id={headingSlug} />
        )}
      </div>
      <div className={s.faqList}>
        {section.pairs.map((pair, index) => (
          <details
            className={s.faqItem}
            key={pair.questionText}
            {...(entries[index + 1]?.slug
              ? { id: entries[index + 1]?.slug }
              : {})}
          >
            <summary className={s.faqSummary}>
              {/* Plain text, not the `h3` node rendered through the converter:
                  a summary takes phrasing content, and wrapping a rich-text
                  render inside the heading would put a `div` in an `h3`. The
                  corpus's questions are unformatted sentences, which is what
                  makes the trade free. */}
              <h3 className={s.faqQuestion}>{pair.questionText}</h3>
              <ChevronDown aria-hidden="true" className={s.faqSign} />
            </summary>
            <div className={s.faqAnswer}>
              <PostRichText
                {...paths}
                data={asBody(pair.answer)}
                locale={locale}
                unoptimized={unoptimized}
              />
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
