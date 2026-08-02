import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { errorView } from '@/lib/content/site'
import s from './not-found.module.css'

const { label, message, description, cta } = errorView.notFound

export default function NotFound() {
  return (
    <Wrapper theme="plum">
      <section className={s.section}>
        <div className={s.panel}>
          <div className={s.label}>{label}</div>
          <h1 className={s.code}>404</h1>
          <p className={s.message}>{message}</p>
          <p className={s.description}>{description}</p>
          <Link href="/" className={s.cta}>
            {cta}
          </Link>
        </div>
      </section>
    </Wrapper>
  )
}
