import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import s from './not-found.module.css'

export default function NotFound() {
  return (
    <Wrapper theme="plum">
      <section className={s.section}>
        <div className={s.panel}>
          <div className={s.label}>Błąd</div>
          <h1 className={s.code}>404</h1>
          <p className={s.message}>Nie znaleziono strony</p>
          <p className={s.description}>
            Strona, której szukasz, nie istnieje albo została przeniesiona.
          </p>
          <Link href="/" className={s.cta}>
            Wróć na stronę główną
          </Link>
        </div>
      </section>
    </Wrapper>
  )
}
