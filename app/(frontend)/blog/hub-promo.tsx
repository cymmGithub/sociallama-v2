import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/components/ui/link'
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'
import s from './blog.module.css'

/**
 * The strip between the lead block and the most-read row, on the plum grain
 * stage. Fixed copy pointing at the case-study index — the reviewed mock's
 * budget calculator does not exist, and this is the destination that pays the
 * editorial content off (resolved 2026-07-27, see the change's design.md).
 *
 * Shared by both locales; `content` carries the destination href as well, so
 * the strip needs no path props of its own.
 */
export function HubPromo({
  content,
}: {
  content: Localized<typeof pl.hubPromo>
}) {
  return (
    <section className={`${s.stage} ${s.promo}`}>
      <p className={s.promoTitle}>{content.title}</p>
      <p className={s.promoText}>{content.text}</p>
      <Link className={s.promoLink} href={content.href}>
        {content.label}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </section>
  )
}
