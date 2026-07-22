import {
  contactSteps as contactStepsDefault,
  contactStepsHead as contactStepsHeadDefault,
  type LocalizedContact,
} from '@/lib/content/contact'
import s from './kontakt.module.css'

/**
 * "Co dalej?" strip — the what-happens-next sequence (write → we respond in
 * 24h → we talk specifics) that turns the page's callback promise into concrete
 * steps. Numbered, hairline-separated rows echoing the metrics band's rhythm,
 * but on the dark ground. Step numbers are real text (from content), so the
 * order is announced to assistive tech.
 */
export function ContactSteps({
  head = contactStepsHeadDefault,
  steps = contactStepsDefault,
}: {
  head?: LocalizedContact['contactStepsHead']
  steps?: LocalizedContact['contactSteps']
}) {
  return (
    <section className={s.steps} aria-labelledby="steps-head">
      <div className={s.stepsInner}>
        <h2 className={s.stepsHead} id="steps-head">
          {head}
        </h2>
        <ol className={s.stepList}>
          {steps.map((item) => (
            <li className={s.step} key={item.step}>
              <span className={s.stepNum}>{item.step}</span>
              <span className={s.stepTitle}>{item.title}</span>
              <span className={s.stepText}>{item.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
