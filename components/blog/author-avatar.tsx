import cn from 'clsx'
import { Image } from '@/components/ui/image'
import { authorInitials, type ResolvedAuthor } from '@/lib/blog/author'
import s from './author-avatar.module.css'

/** 2x the largest rendered diameter (3rem on the post card). */
const AVATAR_PIXELS = 96

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

  return (
    <span className={cn(s.avatar, className)}>
      <Image
        // Decorative: both consumers render the name immediately beside it,
        // so real alt text would just stutter in the accessible name.
        alt=""
        className={s.image}
        height={AVATAR_PIXELS}
        // The org default is the static /icon.png lama mark — already small,
        // and the optimizer has bitten this project on tiny brand icons.
        unoptimized={author.kind === 'org'}
        src={author.avatarUrl}
        width={AVATAR_PIXELS}
      />
    </span>
  )
}
