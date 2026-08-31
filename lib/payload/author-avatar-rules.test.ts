import { describe, expect, test } from 'bun:test'
import {
  AVATAR_MIN_PX,
  checkAvatarDimensions,
} from '@/lib/payload/author-avatar-rules'

describe('checkAvatarDimensions', () => {
  test('accepts the avatars already shipping', () => {
    // lukasz-plocinski.png and katarzyna-kaptur.png as committed.
    expect(checkAvatarDimensions({ width: 384, height: 384 })).toBeNull()
    expect(checkAvatarDimensions({ width: 303, height: 303 })).toBeNull()
  })

  test('rejects the shape that caused the incident', () => {
    // The admin upload that got squeezed into the disc.
    expect(checkAvatarDimensions({ width: 324, height: 276 })).toMatch(
      /kwadratowe/
    )
  })

  test('tolerates a one-pixel export rounding', () => {
    expect(checkAvatarDimensions({ width: 401, height: 400 })).toBeNull()
  })

  test('rejects a portrait crop as well as a landscape one', () => {
    expect(checkAvatarDimensions({ width: 276, height: 324 })).toMatch(
      /kwadratowe/
    )
  })

  test('rejects a square that is too small to serve the disc', () => {
    expect(
      checkAvatarDimensions({
        width: AVATAR_MIN_PX - 1,
        height: AVATAR_MIN_PX - 1,
      })
    ).toMatch(/za mały|za małe/)
    expect(
      checkAvatarDimensions({ width: AVATAR_MIN_PX, height: AVATAR_MIN_PX })
    ).toBeNull()
  })

  test('reports unknown dimensions rather than passing them', () => {
    expect(checkAvatarDimensions({})).toMatch(/wymiarów/)
    expect(checkAvatarDimensions({ width: 300, height: null })).toMatch(
      /wymiarów/
    )
  })
})
