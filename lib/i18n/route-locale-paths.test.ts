/**
 * Every route hand-writes its own locale URL prefixes.
 *
 * `PostArticle`, `BlogHubView` and the listing components take `basePath`,
 * `hubPath` and `categoryPath` as props, and eleven route files supply them as
 * string literals. Nothing connects a literal to the route group it sits in —
 * so a file copied from the Polish tree into the English one, or the reverse,
 * produces a page that renders perfectly and links entirely into the wrong
 * locale. TypeScript cannot see it: every one of these is a `string`.
 *
 * That is the failure this file exists to catch, and it is why the coverage is
 * a source-level invariant rather than a render test. Rendering `PostArticle`
 * would need a whole Payload document graph mocked into place and would still
 * only prove the one basePath the test itself passed in. Reading what the
 * routes actually pass proves it for all of them at once, and keeps proving it
 * for routes added later.
 *
 * Run with: bun test lib/i18n/route-locale-paths.test.ts
 */

import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const PL_TREE = 'app/(frontend)'
const EN_TREE = 'app/(frontend-en)'
const PATH_PROPS = ['basePath', 'hubPath', 'categoryPath'] as const

function routeFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...routeFiles(full))
    } else if (entry === 'page.tsx') {
      out.push(full)
    }
  }
  return out
}

interface Assignment {
  file: string
  prop: string
  value: string
}

/**
 * Pull `prop="literal"` and `prop={IDENT}` where IDENT is a string const
 * declared in the same file — both forms are in use, and skipping the second
 * would silently exempt the two `[slug]` routes, which are exactly the ones
 * most likely to be copied across locales.
 */
function assignments(file: string): Assignment[] {
  const src = readFileSync(file, 'utf8')
  const consts = new Map<string, string>()
  for (const m of src.matchAll(/const (?<name>\w+) = '(?<value>[^']*)'/g)) {
    consts.set(m.groups?.name as string, m.groups?.value as string)
  }

  const found: Assignment[] = []
  for (const prop of PATH_PROPS) {
    for (const m of src.matchAll(
      new RegExp(`\\b${prop}=(?:"(?<literal>[^"]*)"|\\{(?<ident>\\w+)\\})`, 'g')
    )) {
      const literal = m.groups?.literal
      const ident = m.groups?.ident
      if (literal !== undefined) {
        found.push({ file, prop, value: literal })
      } else if (ident && consts.has(ident)) {
        found.push({ file, prop, value: consts.get(ident) as string })
      }
    }
  }
  return found
}

const plAssignments = routeFiles(PL_TREE).flatMap(assignments)
const enAssignments = routeFiles(EN_TREE).flatMap(assignments)

describe('route locale path prefixes', () => {
  test('the trees are actually being read', () => {
    // Guards the whole file: a rename that broke `routeFiles` would otherwise
    // make every assertion below pass vacuously over an empty list.
    expect(plAssignments.length).toBeGreaterThan(5)
    expect(enAssignments.length).toBeGreaterThan(5)
  })

  test('no English route passes a Polish path', () => {
    const wrong = enAssignments.filter((a) => !a.value.startsWith('/en'))
    expect(wrong).toEqual([])
  })

  test('no Polish route passes an English path', () => {
    const wrong = plAssignments.filter((a) => a.value.startsWith('/en'))
    expect(wrong).toEqual([])
  })

  test('Polish blog routes use the documented triple', () => {
    // `basePath` is '' because Polish posts live at the site root, which is
    // also why an accidental '/blog' there would still render and still be
    // wrong on every link.
    const expected: Record<string, string> = {
      basePath: '',
      hubPath: '/blog',
      categoryPath: '/category',
    }
    const blog = plAssignments.filter(
      (a) =>
        !a.file.includes('case-studies') &&
        (a.file.includes('/blog') ||
          a.file.includes('/category') ||
          a.file.includes('[slug]'))
    )
    for (const a of blog) {
      expect(`${a.file}:${a.prop}=${a.value}`).toBe(
        `${a.file}:${a.prop}=${expected[a.prop]}`
      )
    }
  })

  test('English blog routes use the documented triple', () => {
    const expected: Record<string, string> = {
      basePath: '/en/blog',
      hubPath: '/en/blog',
      categoryPath: '/en/blog/category',
    }
    const blog = enAssignments.filter((a) => a.file.includes('/blog'))
    for (const a of blog) {
      expect(`${a.file}:${a.prop}=${a.value}`).toBe(
        `${a.file}:${a.prop}=${expected[a.prop]}`
      )
    }
  })

  test('case-study routes carry their own base, per locale', () => {
    const cs = [...plAssignments, ...enAssignments].filter((a) =>
      a.file.includes('case-studies')
    )
    expect(cs.length).toBeGreaterThan(0)
    for (const a of cs) {
      expect(a.value).toBe(
        a.file.startsWith(EN_TREE) ? '/en/case-studies' : '/case-studies'
      )
    }
  })
})
