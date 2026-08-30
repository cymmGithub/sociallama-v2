/**
 * Images inside a post's body honour the optimizer opt-out.
 *
 * This is the one link in the chain that neither TypeScript nor a grep can
 * settle. The flag travels post page → PostArticle → PostRichText →
 * makeConverters → UploadImage → the Image wrapper → next/image, through a
 * Lexical converter closure, and the only thing that proves it arrived is the
 * `src` that comes out the other end: the file itself, or `/_next/image`.
 *
 * It cannot be checked against dev content either — no post in the dev
 * database has an inline upload, while on production most of the WordPress
 * corpus does, which is the whole reason body images are in scope.
 *
 * Run with: bun test "app/(frontend)/[slug]/rich-text-upload.test.tsx"
 */

import { beforeAll, describe, expect, test } from 'bun:test'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { render } from '@testing-library/react'
import { BLOB_ORIGIN } from '@/lib/blob-store'
import { PostRichText } from './rich-text'

const SRC = `${BLOB_ORIGIN}/wykres.jpg`
/** What Payload generated beside it — 1024w, same frame. */
const CARD = `${BLOB_ORIGIN}/wykres-1024x640.jpg`

beforeAll(() => {
  // happy-dom opens at about:blank, and nothing relative resolves against an
  // opaque origin — React throws parsing `/_next/image?…` before the markup
  // exists. Give the document a real URL, as a browser would have.
  ;(
    globalThis as unknown as { happyDOM?: { setURL?: (url: string) => void } }
  ).happyDOM?.setURL?.('http://localhost:3000/')
})

/** A body containing one uploaded image and nothing else. */
const body = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'upload',
        relationTo: 'media',
        format: '',
        version: 3,
        value: {
          id: 1,
          alt: 'Wykres',
          url: SRC,
          width: 4000,
          height: 2500,
          sizes: { card: { url: CARD, width: 1024, height: 640 } },
        },
      },
    ],
  },
} as unknown as SerializedEditorState

/** The `src` next/image actually emits for the body image. */
function imageSrc(unoptimized: boolean): string {
  const { container } = render(
    <PostRichText
      basePath=""
      categoryPath="/category"
      data={body}
      fallbackHref="/"
      locale="pl"
      unoptimized={unoptimized}
    />
  )
  return container.querySelector('img')?.getAttribute('src') ?? ''
}

describe('a post body image', () => {
  test('serves the generated variant, not the original, when unoptimized', () => {
    // `unoptimized` ships `src` verbatim, so the original would go out whole —
    // on the archive that is a multi-megabyte camera file as the LCP element
    // (reduce-media-serving-costs §6).
    expect(imageSrc(true)).toBe(CARD)
  })

  test('still passes through the optimizer for a recent post', () => {
    // The opt-out has to be a decision, not a blanket switch: new covers are
    // artwork worth resizing, and this is what proves the flag is read rather
    // than ignored in both directions.
    const src = imageSrc(false)

    expect(src).toStartWith('/_next/image?')
    // The original, because resizing it is the optimizer's whole job.
    expect(src).toContain(encodeURIComponent(SRC))
  })
})
