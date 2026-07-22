'use client'

import cn from 'clsx'
import { usePathname } from 'next/navigation'
import { useChrome } from '@/components/layout/chrome-provider'
import { Link } from '@/components/ui/link'
import { counterpartPath, type Locale } from '@/lib/i18n/slug-map'
import s from './locale-toggle.module.css'

const LOCALES: readonly { code: Locale; label: string }[] = [
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
]

// The one place a hardcoded per-locale string is defensible: this component IS
// the language switcher, so it can't source its own label from the (single-
// locale) chrome data.
const GROUP_LABEL: Record<Locale, string> = {
  pl: 'Zmień język',
  en: 'Change language',
}

/**
 * PL/EN switch for the site chrome (design D3). The active locale links to the
 * current path (marked `aria-current`); the other links to the path's
 * counterpart via the slug map — falling back to the other locale's home for
 * paths with no counterpart (e.g. a blog post).
 *
 * `linkClassName` should be the surrounding chrome's link class so the toggle
 * inherits its colour and size; the active/inactive emphasis is handled here.
 */
export function LocaleToggle({
  className,
  linkClassName,
}: {
  className?: string | undefined
  linkClassName?: string | undefined
}) {
  const pathname = usePathname()
  const { locale } = useChrome()
  const counterpart = counterpartPath(pathname)

  return (
    <div
      className={cn(s.toggle, className)}
      role="group"
      aria-label={GROUP_LABEL[locale]}
    >
      {LOCALES.map(({ code, label }, index) => {
        const active = code === locale
        return (
          <span key={code} className={s.item}>
            {index > 0 && (
              <span aria-hidden="true" className={s.sep}>
                /
              </span>
            )}
            <Link
              className={linkClassName}
              href={active ? pathname : counterpart}
              aria-current={active ? 'true' : undefined}
              hrefLang={code}
            >
              {label}
            </Link>
          </span>
        )
      })}
    </div>
  )
}
