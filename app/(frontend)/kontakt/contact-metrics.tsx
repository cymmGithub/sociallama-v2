import { contactMetrics, contactMetricsHead } from '@/lib/content/contact'
import s from './kontakt.module.css'

/**
 * Orange metrics band — intro line, then number-left / caption-right rows with
 * hairline dividers. The one bright accent on the near-black page (design D3).
 */
export function ContactMetrics() {
  return (
    <section className={s.metrics}>
      <div className={s.metricsInner}>
        <div className={s.metricsHead}>
          <span className={s.metricsSmile} aria-hidden="true">
            ☺
          </span>
          <p className={s.metricsHeadText}>{contactMetricsHead}</p>
        </div>
        {contactMetrics.map((metric) => (
          <div className={s.metric} key={metric.caption}>
            <span className={s.metricValue}>{metric.value}</span>
            <span className={s.metricCaption}>{metric.caption}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
