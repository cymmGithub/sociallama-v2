import cn from 'clsx'
import { Image } from '@/components/ui/image'
import { authorInitials, type ResolvedAuthor } from '@/lib/blog/author'
import s from './author-avatar.module.css'

/**
 * The largest diameter any consumer renders: 4.25rem on the post card
 * (post.module.css), against 1.5rem and 2.25rem on the listings. Declared in
 * CSS pixels — the browser multiplies by device pixel ratio itself when it
 * picks from the srcset.
 */
const AVATAR_CSS_PIXELS = 68

/** Intrinsic box, 2x the above, so the reserved layout box is retina-sharp. */
const AVATAR_PIXELS = AVATAR_CSS_PIXELS * 2

/**
 * An author's face: their photo when the CMS has one, otherwise an initials
 * monogram. Shared by the post-page card and the listing byline so the two
 * never drift; size comes from the `--author-avatar-size` custom property the
 * consumer sets.
 */
export function AuthorAvatar({
  author,
  className,
}: {
  author: ResolvedAuthor
  // CSS-module lookups are `string | undefined` under exactOptionalPropertyTypes
  className?: string | undefined
}) {
  if (!author.avatarUrl) {
    return (
      <span aria-hidden="true" className={cn(s.avatar, s.monogram, className)}>
        {authorInitials(author.name)}
      </span>
    )
  }

  /*
   * The organization default is a reversed brand mark, not a photo. `icon.png`
   * is a plum lama on transparency, so drawing it as an image on the plum disc
   * would be plum-on-plum and all but vanish. Using its alpha as a mask and
   * filling with cream gives the reversed mark the brand state is meant to be —
   * the same technique as the footer's social row. It also sidesteps the image
   * optimizer, which has misbehaved on tiny brand icons in this project.
   */
  if (author.kind === 'org') {
    return (
      <span className={cn(s.avatar, s.isOrg, className)}>
        <span
          aria-hidden="true"
          className={s.orgMark}
          style={{
            maskImage: `url(${author.avatarUrl})`,
            WebkitMaskImage: `url(${author.avatarUrl})`,
          }}
        />
      </span>
    )
  }

  return (
    <span className={cn(s.avatar, className)}>
      <Image
        // Decorative: both consumers render the name immediately beside it,
        // so real alt text would just stutter in the accessible name.
        alt=""
        className={s.image}
        height={AVATAR_PIXELS}
        /*
         * Explicit, in px, because the `Image` wrapper otherwise defaults to
         * `100vw` (components/ui/image). A `vw` sizes makes Next build the
         * srcset from `deviceSizes` alone, whose smallest entry is 640 — so a
         * 68px circle downloaded a >=640px variant, and an author photo
         * narrower than that was UPSCALED first, then squeezed back down by
         * the browser. That round trip is what made the avatar look soft.
         * A px sizes puts `imageSizes` (16-384) back in reach.
         */
        sizes={`${AVATAR_CSS_PIXELS}px`}
        src={author.avatarUrl}
        width={AVATAR_PIXELS}
      />
    </span>
  )
}
