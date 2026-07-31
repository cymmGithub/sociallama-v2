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

export const postRelated = {
  title: 'Read next',
  allLabel: 'All posts',
  allHref: '/en/blog',
} satisfies Localized<typeof pl.postRelated>

export const postToc = {
  title: 'In this post',
  navLabel: 'Table of contents',
} satisfies Localized<typeof pl.postToc>

export const postShare = {
  title: 'Share',
  linkedin: 'Share “{title}” on LinkedIn',
  facebook: 'Share “{title}” on Facebook',
  copy: 'Copy link to this post',
  copied: 'Link copied',
} satisfies Localized<typeof pl.postShare>

export const postAuthor = {
  personLink: 'Author profile',
  brandLink: 'Meet Social Lama',
} satisfies Localized<typeof pl.postAuthor>

export const hub = {
  eyebrow: 'The Social Lama blog',
  title: 'What works in social media — and why',
  lead: 'Campaign teardowns with the numbers left in, not trend roundups. Everything here was tested on our own clients first.',
  categoriesAria: 'Categories',
  allCategories: 'All',
  picksTitle: "Editors' picks",
  popularTitle: 'Most read',
  archiveTitle: 'All posts',
  readingTimeSuffix: 'min read',
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

export const postCard = {
  read: 'READ POST',
} satisfies Localized<typeof pl.postCard>

export const pagination = {
  navAria: 'Pagination',
  newer: 'Newer',
  older: 'Older',
} satisfies Localized<typeof pl.pagination>

export const listing = {
  categoriesAria: hub.categoriesAria,
  allCategories: hub.allCategories,
  emptyTitle: 'Nothing here yet',
  emptyText: "We're working on new posts — check back soon.",
  postCard,
  pagination,
} satisfies Localized<typeof pl.listing>

export const postArticle = {
  breadcrumbAria: 'Breadcrumb',
  hubLabel: 'Blog',
  readingTimeSuffix: hub.readingTimeSuffix,
  cta: postCta,
  toc: postToc,
  share: postShare,
  author: postAuthor,
  related: postRelated,
  postCard,
} satisfies Localized<typeof pl.postArticle>

export const hubView = {
  hub,
  promo: hubPromo,
  video: hubVideo,
  postCard,
  pagination,
  emptyTitle: listing.emptyTitle,
  emptyText: listing.emptyText,
} as const
