import type { TextFieldSingleValidation } from 'payload'
import { RESERVED_SLUGS } from '@/lib/payload/reserved-slugs'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Slug validation shared by posts and categories: URL-safe format plus the
 * reserved-slug list, so content can never shadow an app route (posts render
 * at root-level `/{slug}` URLs).
 */
export const validatePostSlug: TextFieldSingleValidation = (value) => {
  if (!value) {
    return 'Slug jest wymagany.'
  }

  if (!SLUG_PATTERN.test(value)) {
    return 'Slug może zawierać tylko małe litery (a–z), cyfry i pojedyncze myślniki, np. „linkedin-premium-czy-warto".'
  }

  if ((RESERVED_SLUGS as readonly string[]).includes(value)) {
    return `Slug „${value}" jest zarezerwowany dla strony aplikacji i nie może być użyty.`
  }

  return true
}
