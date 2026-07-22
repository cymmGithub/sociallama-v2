import s from '@/app/(frontend)/not-found.module.css'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'

/**
 * English 404 boundary for the `(frontend-en)` root-layout tree. Without it, an
 * EN `notFound()` (e.g. the empty-CMS case-study placeholder) has no boundary in
 * this route group and Next's fallback rendering fails the build. Mirrors the PL
 * not-found; the "Go Home" link points at `/en`.
 */
export default function NotFound() {
  return (
    <Wrapper theme="plum">
      <section className={s.section}>
        <div className={s.panel}>
          <div className={s.label}>Error</div>
          <h1 className={s.code}>404</h1>
          <p className={s.message}>Page not found</p>
          <p className={s.description}>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Link href="/en" className={s.cta}>
            Go Home
          </Link>
        </div>
      </section>
    </Wrapper>
  )
}
