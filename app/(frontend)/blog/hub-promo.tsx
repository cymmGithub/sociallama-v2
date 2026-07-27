import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/components/ui/link'
import { hubPromo } from '@/lib/content/blog'
import s from './blog.module.css'

/**
 * The strip between the lead block and the most-read row, on the plum grain
 * stage. Fixed copy pointing at the case-study index — the reviewed mock's
 * budget calculator does not exist, and this is the destination that pays the
 * editorial content off (resolved 2026-07-27, see the change's design.md).
 */
export function HubPromo() {
  return (
    <section className={`${s.stage} ${s.promo}`}>
      <p className={s.promoTitle}>{hubPromo.title}</p>
      <p className={s.promoText}>{hubPromo.text}</p>
      <Link className={s.promoLink} href={hubPromo.href}>
        {hubPromo.label}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </section>
  )
}
