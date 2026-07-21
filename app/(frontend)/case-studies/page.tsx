import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { getCaseStudies } from '@/lib/payload/queries'
import s from './case-studies.module.css'
import { CaseStudyCard } from './case-study-card'

export const metadata: Metadata = {
  title: 'Case studies',
  description:
    'Case studies Social Lama — realne efekty naszej pracy w social mediach. Strategie, kampanie i liczby dla marek takich jak iRobot, Pracuj.pl i Volvo.',
  alternates: { canonical: '/case-studies' },
}

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies()

  return (
    <Wrapper theme="cream">
      <section className={s.listing}>
        <header className={s.header}>
          <h1 className={s.heading}>Case studies</h1>
          <p className={s.subhead}>
            Jak pracujemy i co z tego wynika — wybrane projekty Social Lama wraz
            z liczbami, które je opisują.
          </p>
        </header>

        {studies.length > 0 ? (
          <div className={s.grid}>
            {studies.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        ) : (
          <div className={s.empty}>
            <p className={s.emptyTitle}>Już wkrótce</p>
            <p className={s.emptyText}>
              Pracujemy nad opisami naszych projektów — zajrzyj niebawem.
            </p>
          </div>
        )}
      </section>
    </Wrapper>
  )
}
