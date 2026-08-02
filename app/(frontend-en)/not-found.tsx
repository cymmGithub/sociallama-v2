import s from '@/app/(frontend)/not-found.module.css'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { errorView } from '@/lib/content/site.en'

const { label, message, description, cta } = errorView.notFound

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
          <div className={s.label}>{label}</div>
          <h1 className={s.code}>404</h1>
          <p className={s.message}>{message}</p>
          <p className={s.description}>{description}</p>
          <Link href="/en" className={s.cta}>
            {cta}
          </Link>
        </div>
      </section>
    </Wrapper>
  )
}
