import { Wrapper } from '@/components/layout/wrapper'
import type { LocalizedCareers } from '@/lib/content/zostan-lama'
import type { Locale } from '@/lib/i18n/slug-map'
import { careersMarqueeOutlinePaths } from '@/lib/wordmark-paths'
import { CareersApply } from './careers-apply'
import { CareersHero } from './careers-hero'
import { CareersRoles } from './careers-roles'
import { DarkChrome } from './dark-chrome'
import s from './zostan-lama.module.css'

/*
 * The careers page itself (redesign-careers-page, direction C) — one
 * composition serving four routes: `/zostan-lama` and `/en/become-a-lama`, plus
 * each locale's position URLs, which render this exact page with one tab
 * already selected (add-careers-role-urls, design D1). The routes are thin: they
 * own metadata and param validation, this file owns what the page IS, so a
 * section added here cannot reach three routes and miss the fourth.
 *
 * Renders inside <Wrapper theme="plum-deep"> (cream-on-dark chrome + smooth
 * scrolling); the near-black ground and the plum application band are painted
 * by the scoped zostan-lama.module.css.
 *
 * Band order is ink-deep → ink-deep → plum-deep: hero, then role panels, then
 * the form immediately after them. The page ENDS on the form (design D3):
 * nothing may be added below <CareersApply/> — the next element is the site
 * footer.
 */

/**
 * Where each locale's careers page lives — the prefix every position URL is
 * built on, for the routes' own metadata as well as the panels' share links.
 */
export const CAREERS_BASE_PATH = {
  pl: '/zostan-lama',
  en: '/en/become-a-lama',
} as const

export function CareersPage({
  content,
  locale,
  initialRoleId,
}: {
  /** The locale's whole content module — `zostan-lama.ts` or its EN twin. */
  content: LocalizedCareers
  locale: Locale
  /**
   * Set only when the page was entered through a position URL: it selects that
   * tab, defaults the application form's role select, and brings the roles
   * section into view. The base pages pass nothing and behave as before.
   */
  initialRoleId?: string | undefined
}) {
  return (
    <Wrapper theme="plum-deep">
      <div className={s.page}>
        <DarkChrome />
        <CareersHero
          meta={content.careersMeta}
          marquee={content.careersMarquee}
          lede={content.careersLede}
          outlinePath={careersMarqueeOutlinePaths[locale]}
        />
        <CareersRoles
          roles={content.careersRoles}
          label={content.careersRolesLabel}
          share={content.careersShare}
          rolesBasePath={CAREERS_BASE_PATH[locale]}
          initialRoleId={initialRoleId}
        />
        <CareersApply
          form={content.careersForm}
          roles={content.careersRoles}
          locale={locale}
          initialRoleId={initialRoleId}
        />
      </div>
    </Wrapper>
  )
}

/**
 * The open position a URL segment names, or null when it names none — which is
 * the routes' 404 condition. Shared so the Polish and English position routes
 * cannot disagree about what counts as a valid id.
 */
export function findCareersRole(
  content: LocalizedCareers,
  id: string
): LocalizedCareers['careersRoles'][number] | null {
  return content.careersRoles.find((role) => role.id === id) ?? null
}
