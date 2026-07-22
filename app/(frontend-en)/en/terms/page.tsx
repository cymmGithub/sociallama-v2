import { redirect } from 'next/navigation'

/*
 * Interim stub: the English Terms page isn't translated yet (the `regulamin`
 * CMS content wasn't available in this worktree). Redirect to the Polish
 * document so the EN footer/menu links resolve; replace with a static English
 * translation (like `/en/privacy-policy`) once the source content is sourced.
 */
export default function EnTermsPage() {
  redirect('/regulamin')
}
