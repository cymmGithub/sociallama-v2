import { describe, expect, test } from 'bun:test'
import { INDUSTRIES } from '../content/branze'
import { USLUGI_PAGES } from '../content/uslugi'
import { careersRoles } from '../content/zostan-lama'
import { alternatesForPath, counterpartPath, SECTIONS } from './slug-map'

/**
 * The section slug tables in `slug-map.ts` are literals: the module reaches the
 * browser through <LocaleToggle>, so it must not import the content files.
 * These tests are the link that keeps the two honest — add a service or an
 * industry without extending the table and the language toggle would silently
 * strand visitors on the home page instead of the twin page.
 */

function sectionFor(pl: string) {
  const section = SECTIONS.find((candidate) => candidate.pl === pl)
  if (!section) {
    throw new Error(`no section registered for ${pl}`)
  }
  return section
}

/*
 * `USLUGI_PAGES`, not `SERVICES`: the SEO landings share the `/uslugi` route and
 * so need the same PL↔EN mapping. They are kept out of the navigation, which
 * makes the language toggle one of the few ways a visitor moves between their
 * two locales — a landing missing from the table would strand them on the home
 * page with nothing on screen to say so.
 */
describe('slug map — services and landings', () => {
  test('every page round-trips to its EN twin', () => {
    for (const page of USLUGI_PAGES) {
      const pl = `/uslugi/${page.slug}`
      const en = `/en/services/${page.pairSlug}`
      expect(counterpartPath(pl)).toBe(en)
      expect(counterpartPath(en)).toBe(pl)
    }
  })

  test('table carries no entry the content has dropped', () => {
    expect(USLUGI_PAGES.length).toBe(sectionFor('/uslugi').slugs.length)
  })

  test('the index pair resolves both ways', () => {
    expect(counterpartPath('/uslugi')).toBe('/en/services')
    expect(counterpartPath('/en/services')).toBe('/uslugi')
  })
})

describe('slug map — industries', () => {
  test('every industry round-trips to its EN twin', () => {
    for (const industry of INDUSTRIES) {
      const pl = `/branze/${industry.slug}`
      const en = `/en/industries/${industry.pairSlug}`
      expect(counterpartPath(pl)).toBe(en)
      expect(counterpartPath(en)).toBe(pl)
    }
  })

  test('table carries no entry the content has dropped', () => {
    expect(sectionFor('/branze').slugs.length).toBe(INDUSTRIES.length)
  })

  // Both index pages ship, so the toggle maps them as a pair rather than
  // falling back to the locale home.
  test('the index pair is mapped', () => {
    expect(sectionFor('/branze').hasIndex).toBe(true)
    expect(counterpartPath('/branze')).toBe('/en/industries')
    expect(counterpartPath('/en/industries')).toBe('/branze')
  })
})

describe('slug map — careers positions', () => {
  test('every open position round-trips to its EN twin', () => {
    for (const role of careersRoles) {
      const pl = `/zostan-lama/${role.id}`
      const en = `/en/become-a-lama/${role.id}`
      expect(counterpartPath(pl)).toBe(en)
      expect(counterpartPath(en)).toBe(pl)
    }
  })

  test('table carries no position the content has dropped', () => {
    expect(sectionFor('/zostan-lama').slugs.length).toBe(careersRoles.length)
  })

  // The index pair lives in `pathPairs`, so this section deliberately declares
  // no index of its own — and the toggle must still resolve it.
  test('the careers index still resolves through the static pairs', () => {
    expect(sectionFor('/zostan-lama').hasIndex).toBe(false)
    expect(counterpartPath('/zostan-lama')).toBe('/en/become-a-lama')
    expect(counterpartPath('/en/become-a-lama')).toBe('/zostan-lama')
  })

  test('a closed position falls back rather than pointing at a 404', () => {
    expect(counterpartPath('/zostan-lama/nie-rekrutujemy')).toBe('/en')
    expect(counterpartPath('/en/become-a-lama/not-hiring')).toBe('/')
  })
})

describe('slug map — existing behaviour is unchanged', () => {
  test('case-study details still swap by prefix', () => {
    expect(counterpartPath('/case-studies/volvo')).toBe(
      '/en/case-studies/volvo'
    )
    expect(counterpartPath('/en/case-studies/volvo')).toBe(
      '/case-studies/volvo'
    )
  })

  test('static pairs still resolve', () => {
    expect(counterpartPath('/o-nas')).toBe('/en/about-us')
    expect(counterpartPath('/en/about-us')).toBe('/o-nas')
  })

  test('unmapped paths fall back to the other locale home', () => {
    expect(counterpartPath('/jakis-wpis-na-blogu')).toBe('/en')
    expect(counterpartPath('/en/nothing-here')).toBe('/')
  })

  test('an unknown section slug falls back rather than inventing a URL', () => {
    expect(counterpartPath('/uslugi/nie-istnieje')).toBe('/en')
    expect(counterpartPath('/en/services/does-not-exist')).toBe('/')
  })
})

/**
 * Blog counterparts are resolved by the route, not by this module: post and
 * category slugs differ per locale and live in the database, and this module
 * ships to the browser (design D11). The hub is the one genuinely static pair.
 */
describe('blog paths', () => {
  test('the hub is a static pair', () => {
    expect(counterpartPath('/blog')).toBe('/en/blog')
    expect(counterpartPath('/en/blog')).toBe('/blog')
  })

  test('a post with no override still falls back to the locale home', () => {
    // Unchanged behaviour, and correct: an untranslated post has no
    // counterpart, so the toggle must not invent one.
    expect(counterpartPath('/jakis-wpis-na-blogu')).toBe('/en')
    expect(counterpartPath('/en/blog/some-english-post')).toBe('/')
  })

  test('an override wins over the fallback, in both directions', () => {
    expect(
      counterpartPath('/jakis-wpis-na-blogu', '/en/blog/some-english-post')
    ).toBe('/en/blog/some-english-post')
    expect(
      counterpartPath('/en/blog/some-english-post', '/jakis-wpis-na-blogu')
    ).toBe('/jakis-wpis-na-blogu')
  })

  test('an override wins over a path that WOULD have mapped', () => {
    // Guards the precedence: a route that knows the real counterpart must not
    // be second-guessed by the literal table.
    expect(counterpartPath('/blog', '/en/blog/page/2')).toBe('/en/blog/page/2')
  })

  test('alternates carry the override into hreflang, x-default staying PL', () => {
    expect(
      alternatesForPath('/jakis-wpis-na-blogu', '/en/blog/some-english-post')
    ).toEqual({
      canonical: '/jakis-wpis-na-blogu',
      languages: {
        pl: '/jakis-wpis-na-blogu',
        en: '/en/blog/some-english-post',
        'x-default': '/jakis-wpis-na-blogu',
      },
    })
    expect(
      alternatesForPath('/en/blog/some-english-post', '/jakis-wpis-na-blogu')
    ).toEqual({
      canonical: '/en/blog/some-english-post',
      languages: {
        pl: '/jakis-wpis-na-blogu',
        en: '/en/blog/some-english-post',
        'x-default': '/jakis-wpis-na-blogu',
      },
    })
  })
})
