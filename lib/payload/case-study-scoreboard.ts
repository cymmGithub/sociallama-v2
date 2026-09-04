import type { CaseStudy } from '@/payload-types'

/**
 * The read rules the case-study surfaces share.
 *
 * Four screens answer the same three questions — what is this study's lead
 * number, which platforms does it count as, and how does a value with a
 * parenthetical break — and they answer them from the same array with no
 * schema support: the hub card, the hub's ledger row, the detail scoreboard
 * and the results ledger. Keeping the rules here rather than in whichever
 * component needed them first is what stops the four from drifting.
 *
 * Pure by construction: a type import and nothing else, so the hub's client
 * search may import it as freely as a build-time page does.
 */

/**
 * The platforms the site knows, which is exactly the set `brand-icons.tsx`
 * ships a mark for — that file types its icon table against this tuple, so a
 * key here without an icon is a compile error rather than a blank square.
 *
 * Deliberately not derived from the `social-platforms` collection: that holds
 * whatever logos were uploaded, so the hub's rail would list a platform no
 * study has, and would change when nobody edited a case study.
 */
export const PLATFORM_KEYS = [
  'facebook',
  'instagram',
  'tiktok',
  'linkedin',
  'youtube',
] as const

export type PlatformKey = (typeof PLATFORM_KEYS)[number]

/** Normalize a group label for platform matching: "TikTok" → "tiktok". */
export const normalizePlatform = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * The platform a result group names, or null when it names something else.
 *
 * Exact match after normalization, and that strictness is the point. A third
 * of the roster labels its groups by brand or channel ("FoodSaver",
 * "Strona WWW", "Beesfund"), and those groups carry the strongest claims on
 * the site — tracked sales, crowdfunding totals. They are content, not dirty
 * data, so nothing here rewrites or guesses at them; they simply have no mark
 * and no place in the platform index.
 *
 * The same strictness settles the two ambiguous shapes the roster does hold.
 * "Facebook / Instagram (Niemcy)" names two platforms and would have to be
 * counted under both or arbitrarily under one, so it is counted under
 * neither. "Facebook (strona)" and "Facebook (grupa)" are one study's two
 * distinct Facebook surfaces; folding them into `facebook` would make the
 * label a lie about what was measured.
 */
export function platformOf(label: string): PlatformKey | null {
  const key = normalizePlatform(label)
  return (PLATFORM_KEYS as readonly string[]).includes(key)
    ? (key as PlatformKey)
    : null
}

export interface ResultGroup {
  /** The group's label, verbatim from `results[].platform`. */
  label: string
  /** Its platform when the label names one, else null. */
  platform: PlatformKey | null
  items: { metric: string; value: string }[]
}

/** A group's first metric — the number that stands for the group. */
export interface LeadMetric {
  label: string
  platform: PlatformKey | null
  metric: string
  value: string
}

/**
 * Group results by their `platform` label, in order of first appearance and
 * with each group's metrics in array order. Array order is the editorial
 * ranking: there is no "featured" flag on the collection and this change adds
 * none, so first is what the editor put first.
 */
export function groupResults(results: CaseStudy['results']): ResultGroup[] {
  const groups: ResultGroup[] = []
  for (const result of results ?? []) {
    let group = groups.find((g) => g.label === result.platform)
    if (!group) {
      group = {
        label: result.platform,
        platform: platformOf(result.platform),
        items: [],
      }
      groups.push(group)
    }
    group.items.push({ metric: result.metric, value: result.value })
  }
  return groups
}

/**
 * One lead per group, in group order. The first entry is the study's lead —
 * the card's numeral and the scoreboard's large one.
 *
 * Locale-bound, because `results` is localized as a whole array: this reads
 * whatever locale resolved the study it was handed.
 */
export function leadMetrics(results: CaseStudy['results']): LeadMetric[] {
  return groupResults(results).flatMap((group) => {
    const first = group.items[0]
    return first
      ? [
          {
            label: group.label,
            platform: group.platform,
            metric: first.metric,
            value: first.value,
          },
        ]
      : []
  })
}

/** The study's platforms, distinct and in first-appearance order. */
export function platformsOf(results: CaseStudy['results']): PlatformKey[] {
  const seen: PlatformKey[] = []
  for (const group of groupResults(results)) {
    if (group.platform && !seen.includes(group.platform)) {
      seen.push(group.platform)
    }
  }
  return seen
}

/**
 * A value's numeral and its trailing parenthetical, if it has one.
 *
 * `432 616 (+1 380%)` is two facts wearing one string, and set as one it
 * either wraps mid-value or shrinks the numeral to fit the delta. Split, the
 * numeral keeps the display size and the parenthetical becomes a second line.
 *
 * Presentational only — the stored value never changes, and the callers keep
 * the full string as the metric's accessible name. So a parenthesis that is
 * not a delta (`92% (612 opinii)`) still renders correctly; it is a numeral
 * with a qualifier rather than a numeral with a change, and reads that way.
 */
export function splitValue(value: string): { numeral: string; note?: string } {
  const match = value.match(/^(?<head>.+?)\s*\((?<tail>[^()]+)\)$/)
  const numeral = match?.groups?.head?.trim()
  const note = match?.groups?.tail?.trim()
  return numeral && note ? { numeral, note } : { numeral: value }
}
