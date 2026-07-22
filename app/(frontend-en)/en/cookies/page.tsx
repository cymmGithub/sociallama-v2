import { redirect } from 'next/navigation'

/*
 * Interim stub: the English Cookies page isn't translated yet (the `cookies`
 * CMS content wasn't available in this worktree). Redirect to the Polish
 * document so the EN footer/menu links resolve; replace with a static English
 * translation (like `/en/privacy-policy`) once the source content is sourced.
 */
export default function EnCookiesPage() {
  redirect('/cookies')
}
