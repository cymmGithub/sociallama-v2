/**
 * The one rule an author's photo has to satisfy, kept out of the collection so
 * it can be tested without booting Payload.
 *
 * Both constraints are the component's, not taste. `AuthorAvatar` renders into
 * a circle whose CSS is `width/height: 100%` on a square span, so a
 * non-square upload is squeezed to fit — before `object-fit: cover` landed it
 * narrowed the subject's face, and even with cover a very wide photo loses its
 * edges to the crop with no warning. And 68px is the largest diameter any
 * consumer renders (post.module.css), which the browser doubles on a retina
 * screen and rounds up to the 256 entry in `imageSizes` — so anything smaller
 * than 256 is the largest variant the component can ever ask for.
 */

export const AVATAR_MIN_PX = 256

/** Tolerance for a crop that is square in intent but a pixel off in export. */
const SQUARE_TOLERANCE = 0.02

export interface Dimensions {
  width?: number | null
  height?: number | null
}

/** Returns a message describing why the image cannot be an avatar, else null. */
export function checkAvatarDimensions(media: Dimensions): string | null {
  const { width, height } = media
  if (!(width && height)) {
    return 'Nie znamy wymiarów tego pliku — wgraj obraz rastrowy (PNG lub JPG).'
  }
  const ratio = width / height
  if (Math.abs(ratio - 1) > SQUARE_TOLERANCE) {
    return `Zdjęcie musi być kwadratowe — to ma ${width}×${height} px. Przytnij je do kwadratu; inaczej kółko autora ściśnie twarz.`
  }
  if (Math.min(width, height) < AVATAR_MIN_PX) {
    return `Zdjęcie jest za małe — ${width}×${height} px, potrzebujemy co najmniej ${AVATAR_MIN_PX}×${AVATAR_MIN_PX} px.`
  }
  return null
}
