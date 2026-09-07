import { describe, expect, test } from 'bun:test'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { bindOrphans, bindOrphansInText } from './orphans'

const NBSP = '\u00A0'

const bind = (text: string) => bindOrphansInText(text, 'pl')

describe('bindOrphansInText', () => {
  test('binds every one-letter word to the word after it', () => {
    expect(bind('strategii i tożsamości marki')).toBe(
      `strategii i${NBSP}tożsamości marki`
    )
    expect(bind('giną w tłumie')).toBe(`giną w${NBSP}tłumie`)
    expect(bind('wrócić w przyszłości, a potem')).toBe(
      `wrócić w${NBSP}przyszłości, a${NBSP}potem`
    )
  })

  test('binds at the start of a string and after an opening bracket or quote', () => {
    expect(bind('W 2025 roku')).toBe(`W${NBSP}2025 roku`)
    expect(bind('kanały (w tym TikTok)')).toBe(`kanały (w${NBSP}tym TikTok)`)
    expect(bind('powiedział: „a jednak działa')).toBe(
      `powiedział: „a${NBSP}jednak działa`
    )
  })

  test('chains consecutive one-letter words', () => {
    expect(bind('to a i tak działa')).toBe(`to a${NBSP}i${NBSP}tak działa`)
  })

  test('leaves text with nothing to bind untouched', () => {
    expect(bind('ala ma kota')).toBe('ala ma kota')
    // An ordinal, not a word: the dot means no space follows the letter.
    expect(bind('I. Wstęp do tematu')).toBe('I. Wstęp do tematu')
    // Nothing follows, so there is nothing to bind to.
    expect(bind('kończy się na i')).toBe('kończy się na i')
  })

  test('never breaks a word apart mid-token', () => {
    // The letter has to BE the word: `a` inside `marka` must not match.
    expect(bind('marka a nie logo')).toBe(`marka a${NBSP}nie logo`)
    expect(bind('markami tego typu')).toBe('markami tego typu')
  })

  test('is a no-op in English', () => {
    expect(bindOrphansInText('a brand and a voice', 'en')).toBe(
      'a brand and a voice'
    )
  })
})

/** Minimal body: one paragraph, one text node. */
const bodyWith = (nodes: unknown[]): SerializedEditorState =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: nodes,
        },
      ],
    },
  }) as unknown as SerializedEditorState

const textOf = (state: SerializedEditorState): string[] => {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child)
      return
    }
    if (!node || typeof node !== 'object') return
    const record = node as { text?: unknown; children?: unknown }
    if (typeof record.text === 'string') out.push(record.text)
    walk(record.children)
  }
  walk(state.root)
  return out
}

describe('bindOrphans', () => {
  test('rewrites every text node in the tree', () => {
    const body = bodyWith([
      { type: 'text', format: 0, text: 'zasięg w social mediach' },
      { type: 'text', format: 1, text: 'oraz w reklamie' },
    ])
    expect(textOf(bindOrphans(body, 'pl'))).toEqual([
      `zasięg w${NBSP}social mediach`,
      `oraz w${NBSP}reklamie`,
    ])
  })

  test('leaves the caller tree untouched', () => {
    const body = bodyWith([{ type: 'text', format: 0, text: 'giną w tłumie' }])
    bindOrphans(body, 'pl')
    expect(textOf(body)).toEqual(['giną w tłumie'])
  })

  test('skips code — there a non-breaking space is a different character', () => {
    const inlineCode = bodyWith([
      { type: 'text', format: 16, text: 'git log -o plik' },
    ])
    expect(textOf(bindOrphans(inlineCode, 'pl'))).toEqual(['git log -o plik'])

    const codeBlock = {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'code',
            children: [{ type: 'text', format: 0, text: 'const a = 1' }],
          },
        ],
      },
    } as unknown as SerializedEditorState
    expect(textOf(bindOrphans(codeBlock, 'pl'))).toEqual(['const a = 1'])
  })

  test('is a no-op in English, and returns the same object', () => {
    const body = bodyWith([{ type: 'text', format: 0, text: 'a brand voice' }])
    expect(bindOrphans(body, 'en')).toBe(body)
  })
})
