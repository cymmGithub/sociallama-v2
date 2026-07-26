import { ArrowRight } from 'lucide-react'
import { AuthorAvatar } from '@/components/blog/author-avatar'
import { Link } from '@/components/ui/link'
import type { ResolvedAuthor } from '@/lib/blog/author'
import s from './post.module.css'

/**
 * Attribution block closing every post. One layout serves both a guest
 * `Person` and the Social Lama default — only the outbound link's wording
 * differs, since "Profil autora" over the brand mark would misread as a
 * person's page. The organization's avatar renders as a contained brand mark
 * rather than a cropped portrait; that rule lives in AuthorAvatar so the
 * listing byline gets it too.
 */
export function AuthorCard({ author }: { author: ResolvedAuthor }) {
  return (
    <aside className={s.authorCard}>
      <AuthorAvatar author={author} className={s.authorAvatar} />
      <div className={s.authorText}>
        <p className={s.authorName}>{author.name}</p>
        {author.role && <p className={s.authorRole}>{author.role}</p>}
        {author.bio && <p className={s.authorBio}>{author.bio}</p>}
        {author.url && (
          <Link className={s.authorLink} href={author.url}>
            {author.kind === 'person' ? 'Profil autora' : 'Poznaj Social Lamę'}
            <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  )
}
