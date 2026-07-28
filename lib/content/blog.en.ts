/**
 * English blog copy — the EN twin of `blog.ts`.
 *
 * Structural notes live in the Polish module; only strings and hrefs differ.
 * Each plain block `satisfies Localized<…>` against its Polish counterpart, so
 * a missing or mis-shaped translation fails the build. `hubVideo` and
 * `hubSearch` are exempt: they carry functions, and `Localized` maps over
 * object types, which would strip callability rather than widen it.
 *
 * Voice: playful but clean, American spelling (user-approved 2026-07-22).
 */
import type * as pl from '@/lib/content/blog'
import type { Localized } from '@/lib/i18n/parity'

export const postCta = {
  title: "Let's talk about your brand",
  text: 'Write to us — we answer fast, and there is no three-page form.',
  label: 'Book a consultation',
  href: '/en/contact',
} satisfies Localized<typeof pl.postCta>

export const postNewsletter = {
  title: 'NewsLAMA, once a month',
  text: 'One email, three things that actually changed in social media. No "10 trends you need to know."',
  placeholder: 'Your email address',
  label: 'Subscribe',
  note: 'One click to unsubscribe. We never send anything but the newsletter.',
  messages: {
    success: "You're on the list. Check your inbox to confirm.",
    invalidEmail: 'That email address looks off.',
    failure: "That didn't go through. Try again in a moment.",
  },
} satisfies Localized<typeof pl.postNewsletter>

export const postRelated = {
  title: 'Read next',
  allLabel: 'All posts',
  allHref: '/en/blog',
} satisfies Localized<typeof pl.postRelated>

export const hub = {
  eyebrow: 'The Social Lama blog',
  title: 'What works in social media — and why',
  lead: 'Campaign teardowns with the numbers left in, not trend roundups. Everything here was tested on our own clients first.',
  picksTitle: "Editors' picks",
  popularTitle: 'Most read',
  archiveTitle: 'All posts',
} satisfies Localized<typeof pl.hub>

export const hubPromo = {
  title: "We don't just write about it",
  text: 'See what these rules look like in campaigns that actually ran.',
  label: 'See case studies',
  href: '/en/case-studies',
} satisfies Localized<typeof pl.hubPromo>

export const hubVideo = {
  badge: 'Video',
  play: 'Watch',
  label: 'Watch on YouTube',
  posterLabel: (title: string) => `Watch on YouTube: ${title}`,
} as const

/**
 * `postsPlural` is **replaced, not translated**. Polish has three plural forms
 * keyed to the last two digits (1 → wpis, 2–4 → wpisy, 5+ → wpisów, teens
 * always wpisów); English has two and no analogue for that rule, so porting
 * the function would be porting a bug.
 */
export const hubSearch = {
  label: 'Search posts',
  placeholder: 'What are you looking for?',
  clear: 'Clear',
  results: (count: number) =>
    `Found ${count} ${count === 1 ? 'post' : 'posts'}.`,
  emptyTitle: 'Nothing matches',
  emptyText: 'Try a different word, or clear the search.',
} as const
