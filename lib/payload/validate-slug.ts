import type { TextFieldSingleValidation } from 'payload'
import {
  RESERVED_EN_POST_SLUGS,
  RESERVED_SLUGS,
} from '@/lib/payload/reserved-slugs'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Slug validation shared by posts and categories: URL-safe format plus the
 * reserved-slug list, so content can never shadow an app route (posts render
 * at root-level `/{slug}` URLs).
 *
 * The reserved list is per locale, because the two locales have different
 * URL shapes and therefore different collisions. Polish posts sit at
 * `/{slug}` and can shadow any top-level route; English posts sit under
 * `/en/blog/` and can only shadow that segment's static siblings.
 */
export const validatePostSlug: TextFieldSingleValidation = (value, { req }) => {
  if (!value) {
    return 'Slug jest wymagany.'
  }

  if (!SLUG_PATTERN.test(value)) {
    return 'Slug może zawierać tylko małe litery (a–z), cyfry i pojedyncze myślniki, np. „linkedin-premium-czy-warto".'
  }

  const reserved =
    req?.locale === 'en' ? RESERVED_EN_POST_SLUGS : RESERVED_SLUGS

  if (reserved.includes(value)) {
    return `Slug „${value}" jest zarezerwowany dla strony aplikacji i nie może być użyty.`
  }

  return true
}
