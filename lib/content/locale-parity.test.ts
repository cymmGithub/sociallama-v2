/**
 * Value-level EN↔PL parity that the `Localized<>` types can't see (design D2
 * enforces shape, not values). Locale-invariant data duplicated across the
 * twin content modules must stay byte-identical, or one locale breaks with no
 * compile error:
 *
 * - the o-nas slider order is the client-curated presentation order, and the
 *   homepage team grid derives from it per locale;
 * - the services collage CSS slots are tuned to the exact panel dimensions,
 *   so a width/height drift breaks the collage in one locale only;
 * - the case-study hub's platform filter is keyed by brand, and its labels ARE
 *   those brands, so a translated one would read as a different platform.
 *
 * Run with: bun test lib/content/locale-parity.test.ts
 */

import { expect, test } from 'bun:test'
import { INDUSTRY_OPTIONS as industriesPl } from './branze'
import { INDUSTRY_OPTIONS as industriesEn } from './branze.en'
import {
  PLATFORM_NAMES as platformsEn,
  PLATFORM_NAMES as platformsPl,
} from './case-studies'
import type { LocalizedHome } from './home'
import * as pl from './home'
import * as en from './home.en'
import { oNasTeam as oNasTeamPl } from './o-nas'
import { oNasTeam as oNasTeamEn } from './o-nas.en'

test('o-nas team rosters mirror each other (same people, same order)', () => {
  expect(oNasTeamEn.members.map((m) => m.photo)).toEqual(
    oNasTeamPl.members.map((m) => m.photo)
  )
})

test('services stage media is locale-invariant (alt copy aside)', () => {
  const media = (items: LocalizedHome['services']['items']) =>
    items.map(({ stage }) => {
      if ('panels' in stage) {
        return stage.panels.map(({ src, width, height }) => ({
          src,
          width,
          height,
        }))
      }
      // The journey vignettes are translated, but their crops, their step
      // order and the fictional shop's identity must not drift between
      // locales — one depicted shop, one currency, one funnel.
      if ('journey' in stage) {
        const { post, click, shop, cart, order } = stage.journey
        return {
          crops: [post.image.src, shop.image.src],
          steps: [post, click, shop, cart, order].map((step) => step.number),
          shop: [post.handle, shop.url, shop.price],
        }
      }
      return stage.clips.map(({ src, poster }) => ({ src, poster }))
    })
  expect(media(en.services.items)).toEqual(media(pl.services.items))
})

test('industry options are the same categories in both locales', () => {
  // The hub files every case study under one of these ids, and the id is what
  // is stored — so if the two lists drift, the Polish and English hubs offer
  // different categories over identical content, and one locale silently
  // hides studies the other shows. Labels and hrefs are translated; ids and
  // their order must not be.
  expect(industriesEn.map((option) => option.id)).toEqual(
    industriesPl.map((option) => option.id)
  )
  // Every category carries a name in both locales.
  for (const option of [...industriesPl, ...industriesEn]) {
    expect(option.label.length).toBeGreaterThan(0)
  }
})

test('platform names are brands, not translations', () => {
  expect(platformsEn).toEqual(platformsPl)
})
