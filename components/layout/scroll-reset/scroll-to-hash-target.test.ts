/**
 * Tests for the cross-page hash-jump helper behind <ScrollReset />.
 *
 * The regression these guard (2026-08-04): on a client navigation to a
 * streamed page (production /o-nas commits its loading shell first, sections
 * arrive afterwards), the hash target does not exist on the frame after the
 * pathname commits. The old one-shot `querySelector` bailed permanently and
 * homepage member tiles landed at the top of /o-nas instead of the #zespol
 * slider. The helper must keep watching until the target streams in.
 *
 * Run with: bun test components/layout/scroll-reset/scroll-to-hash-target.test.ts
 */

import { afterEach, describe, expect, test } from 'bun:test'
import { scrollToHashTarget } from './scroll-to-hash-target'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Poll until `check()` is true or `ms` elapsed — keeps waits condition-based
 *  rather than a guessed fixed delay. */
async function waitFor(check: () => boolean, ms = 1000) {
  const deadline = Date.now() + ms
  while (!check() && Date.now() < deadline) {
    await sleep(10)
  }
  return check()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('scrollToHashTarget', () => {
  test('scrolls when the target already exists', async () => {
    const el = document.createElement('section')
    el.id = 'zespol'
    document.body.appendChild(el)

    const scrolled: Element[] = []
    scrollToHashTarget('#zespol', (target) => scrolled.push(target))

    expect(await waitFor(() => scrolled.length === 1)).toBe(true)
    expect(scrolled[0]).toBe(el)
  })

  test('scrolls when the target streams in after the navigation commits', async () => {
    // The regression case: pathname has committed, but the section is not in
    // the DOM yet — it arrives later, as streamed content does in production.
    const scrolled: Element[] = []
    scrollToHashTarget('#zespol', (target) => scrolled.push(target))

    await sleep(120) // several frames pass with no target
    expect(scrolled.length).toBe(0)

    const el = document.createElement('section')
    el.id = 'zespol'
    document.body.appendChild(el)

    expect(await waitFor(() => scrolled.length === 1)).toBe(true)
    expect(scrolled[0]).toBe(el)
  })

  test('scrolls only once even if the watcher keeps running', async () => {
    const el = document.createElement('section')
    el.id = 'zespol'
    document.body.appendChild(el)

    const scrolled: Element[] = []
    scrollToHashTarget('#zespol', (target) => scrolled.push(target))

    await waitFor(() => scrolled.length >= 1)
    await sleep(120)
    expect(scrolled.length).toBe(1)
  })

  test('gives up silently when the target never appears', async () => {
    const scrolled: Element[] = []
    scrollToHashTarget('#missing', (target) => scrolled.push(target), {
      timeoutMs: 80,
    })

    await sleep(200)
    expect(scrolled.length).toBe(0)
  })

  test('a malformed hash neither throws nor scrolls', async () => {
    // Seen in the wild as a doubled fragment (#o-lamie#o-lamie) — an invalid
    // selector, which bare querySelector would throw on.
    const scrolled: Element[] = []
    expect(() =>
      scrollToHashTarget('#o-lamie#o-lamie', (target) => scrolled.push(target))
    ).not.toThrow()

    await sleep(100)
    expect(scrolled.length).toBe(0)
  })

  test('cancel stops the watcher before the target appears', async () => {
    const scrolled: Element[] = []
    const cancel = scrollToHashTarget('#zespol', (target) =>
      scrolled.push(target)
    )
    cancel()

    const el = document.createElement('section')
    el.id = 'zespol'
    document.body.appendChild(el)

    await sleep(120)
    expect(scrolled.length).toBe(0)
  })
})
