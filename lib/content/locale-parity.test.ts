/**
 * Value-level EN↔PL parity that the `Localized<>` types can't see (design D2
 * enforces shape, not values). Locale-invariant data duplicated across the
 * twin content modules must stay byte-identical, or one locale breaks with no
 * compile error:
 *
 * - the o-nas slider order is the client-curated presentation order, and the
 *   homepage team grid derives from it per locale;
 * - the services collage CSS slots are tuned to the exact panel dimensions,
 *   so a width/height drift breaks the collage in one locale only.
 *
 * Run with: bun test lib/content/locale-parity.test.ts
 */

import { expect, test } from 'bun:test'
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
