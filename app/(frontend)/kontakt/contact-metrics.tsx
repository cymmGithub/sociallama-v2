import { Smile } from 'lucide-react'
import {
  contactMetrics as contactMetricsDefault,
  contactMetricsHead as contactMetricsHeadDefault,
  type LocalizedContact,
} from '@/lib/content/contact'
import s from './kontakt.module.css'

/**
 * Orange metrics band — intro line, then number-left / caption-right rows with
 * hairline dividers. The one bright accent on the near-black page (design D3).
 */
export function ContactMetrics({
  head = contactMetricsHeadDefault,
  metrics = contactMetricsDefault,
}: {
  head?: LocalizedContact['contactMetricsHead']
  metrics?: LocalizedContact['contactMetrics']
}) {
  return (
    <section className={s.metrics}>
      <div className={s.metricsInner}>
        <div className={s.metricsHead}>
          <Smile className={s.metricsSmile} aria-hidden="true" />
          <p className={s.metricsHeadText}>{head}</p>
        </div>
        {metrics.map((metric) => (
          <div className={s.metric} key={metric.caption}>
            <span className={s.metricValue}>{metric.value}</span>
            <span className={s.metricCaption}>{metric.caption}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
