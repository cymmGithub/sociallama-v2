/*
 * Poster identity, kept out of the `'use client'` barrel on purpose: the two
 * hub routes are Server Components and call `isPosterId` while building their
 * card lists. Re-exporting it from `index.tsx` would turn it into a client
 * reference the server cannot invoke.
 */

/** Ordered exactly as the hubs render them (SERVICES order, both locales). */
export const POSTER_IDS = [
  'strategia',
  'content',
  'sprzedaz',
  'kampanie-reklamowe',
  'kreacje-wideo',
  'audyt-i-konsultacje',
  'influencer-marketing',
] as const

export type PosterId = (typeof POSTER_IDS)[number]

export type PosterVariant = 'card' | 'hero'

/** Narrows a service id to one that has an authored poster. */
export function isPosterId(id: string): id is PosterId {
  return (POSTER_IDS as readonly string[]).includes(id)
}
