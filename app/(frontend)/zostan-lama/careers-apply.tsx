import {
  careersForm as careersFormDefault,
  careersRoles as careersRolesDefault,
  type LocalizedCareers,
} from '@/lib/content/zostan-lama'
import type { Locale } from '@/lib/i18n/slug-map'
import { CareersForm } from './careers-form'
import s from './zostan-lama.module.css'

/**
 * The application band — deep plum, the last content section on the page
 * (design D3). Holds the pitch column and the form itself; only the form is a
 * client component, so the copy stays on the server.
 */
export function CareersApply({
  form = careersFormDefault,
  roles = careersRolesDefault,
  locale = 'pl',
}: {
  form?: LocalizedCareers['careersForm']
  roles?: LocalizedCareers['careersRoles']
  locale?: Locale
}) {
  return (
    <section className={s.formBand}>
      <div className={`${s.inner} ${s.formGrid}`}>
        <div>
          <p className={`${s.eyebrow} ${s.formEyebrow}`}>{form.eyebrow}</p>
          <h2 className={s.formHeading}>{form.heading}</h2>
          <p className={s.formLede}>{form.lede}</p>
        </div>
        <CareersForm form={form} roles={roles} locale={locale} />
      </div>
    </section>
  )
}
