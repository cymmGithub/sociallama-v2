/**
 * Every post-surface image has to say whether it goes through Next's image
 * optimizer.
 *
 * The prop is required on the card components and on `PostRichText`, so
 * TypeScript already catches a new *call site* that forgets it. What
 * TypeScript cannot catch is a new `<Image>` added *inside* one of these files
 * — a second cover, a byline portrait, an inline figure. That image would
 * silently optimize every post in the archive, and the transformations and
 * optimization-cache writes this change exists to stop would come back with
 * nothing to show for them (reduce-media-serving-costs).
 *
 * So: grep. Deliberately, and for the same reason media-ops.test.ts does — a
 * grep has no runtime and cannot be satisfied by a refactor that hides the
 * decision behind a helper. Like that test, the file list is *discovered*
 * rather than written down: a hardcoded list silently excuses every file added
 * after it, which is how `hub-video.tsx` sat here unexamined. Exemptions are
 * named below with their reason, and the set can only shrink.
 *
 * Run with: bun test "app/(frontend)/blog/image-optimizer-optout.test.ts"
 */

import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const BLOG = import.meta.dir
const POST = join(BLOG, '..', '[slug]')

/**
 * Images that are deliberately always optimized. Each entry is a decision, so
 * each carries the reason it is not a post cover.
 */
const EXEMPT = new Map([
  [
    'hub-video.tsx',
    'One editorial poster from the blog-hub global — a single image on a ' +
      'single page, not a per-post cover, so the newest-15 window says nothing ' +
      'about it.',
  ],
])

/** Each `<Image … />` element, whole. They never nest and always self-close. */
const IMAGE_ELEMENT = /<Image\b[\s\S]*?\/>/g

/**
 * Every component under the two post surfaces that renders an image. Also not
 * covered here, because they live elsewhere: `(home)/sections/news-lama`
 * renders `getLatestPost()`, which is inside the window by definition, and the
 * case-study article, whose creatives are current artwork.
 */
function surfaces(): { name: string; source: string }[] {
  return [BLOG, POST].flatMap((dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith('.tsx') && !f.includes('.test.'))
      .map((f) => ({ name: f, source: readFileSync(join(dir, f), 'utf8') }))
      .filter(({ source }) => source.includes('<Image'))
  )
}

describe('post-surface images opt out of the optimizer explicitly', () => {
  const found = surfaces()

  test('the scan finds the surfaces at all', () => {
    // Guards the grep itself: a rename or a moved directory would otherwise
    // make this whole file pass by matching nothing.
    expect(found.length).toBeGreaterThan(3)
  })

  for (const { name, source } of found) {
    const reason = EXEMPT.get(name)

    test.skipIf(Boolean(reason))(
      `${name} passes unoptimized on every image`,
      () => {
        const images = source.match(IMAGE_ELEMENT) ?? []
        expect(images.length).toBeGreaterThan(0)

        const undecided = images.filter((img) => !img.includes('unoptimized'))
        expect(undecided).toEqual([])

        // And none of them may hand `src` the original upload: `unoptimized`
        // ships it verbatim, and on the archive the original is a camera file
        // beside a 1024w variant Payload already made (§6). `mediaSource`
        // picks; `sizes.card ?? …` at a call site is the same decision spelled
        // out. These two exact forms are the ones that regressed.
        const rawOriginal = images.filter(
          (img) =>
            img.includes('src={cover.url}') || img.includes('src={media.url}')
        )
        expect(rawOriginal).toEqual([])
      }
    )
  }

  test('every exemption names a file that still exists and still has an image', () => {
    // An exemption that stops matching is a decision nobody needs any more.
    const scanned = new Set(found.map((f) => f.name))
    expect([...EXEMPT.keys()].filter((f) => !scanned.has(f))).toEqual([])
  })
})
