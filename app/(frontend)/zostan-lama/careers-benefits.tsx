import {
  Activity,
  Clock,
  GraduationCap,
  HeartPulse,
  Languages,
  Lightbulb,
  type LucideIcon,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import {
  careersBenefits as careersBenefitsDefault,
  type LocalizedCareers,
} from '@/lib/content/zostan-lama'
import s from './zostan-lama.module.css'

/**
 * Benefits band — the page's only light break, on the orange ground, sitting
 * between the role panels and the form (design D2): requirements, then what you
 * get, then apply. The ink→orange edge is hard, matching the /o-nas band idiom,
 * and the band takes the page's grain overlay because it is a direct child of
 * the page ground.
 *
 * Icons are resolved here rather than in the content file: content modules stay
 * serialisable data and never hold React components.
 */
const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  clock: Clock,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  languages: Languages,
  lightbulb: Lightbulb,
  'trending-up': TrendingUp,
  utensils: Utensils,
}

export function CareersBenefits({
  benefits = careersBenefitsDefault,
}: {
  benefits?: LocalizedCareers['careersBenefits']
}) {
  return (
    <section className={s.benefits}>
      <div className={s.inner}>
        <p className={s.eyebrow}>{benefits.eyebrow}</p>
        <h2 className={s.benefitsHeading}>{benefits.heading}</h2>
        <ul className={s.benefitsGrid}>
          {benefits.items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <li className={s.benefit} key={item.title}>
                {Icon && <Icon className={s.benefitIcon} aria-hidden="true" />}
                <b className={s.benefitTitle}>{item.title}</b>
                <span className={s.benefitText}>{item.text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
