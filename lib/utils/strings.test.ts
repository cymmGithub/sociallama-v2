/**
 * Unit tests for string utilities
 *
 * Run with: bun test lib/utils/strings.test.ts
 */

import { describe, expect, it } from 'bun:test'
import { slugify, stripHtmlTags } from './strings'

describe('slugify', () => {
  it('should convert text to URL-friendly format', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('Hello World!')).toBe('hello-world')
  })

  it('should handle special characters', () => {
    expect(slugify('Café & Restaurant')).toBe('cafe-restaurant')
    expect(slugify('Rock & Roll')).toBe('rock-roll')
  })

  it('should handle multiple spaces and dashes', () => {
    expect(slugify('Hello   World')).toBe('hello-world')
    expect(slugify('Hello--World')).toBe('hello-world')
    expect(slugify('Hello - World')).toBe('hello-world')
  })

  it('should trim whitespace', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('should handle numbers', () => {
    expect(slugify('Product 123')).toBe('product-123')
    expect(slugify('2024 Review')).toBe('2024-review')
  })

  it('should handle objects with toString', () => {
    const obj = { toString: () => 'Custom Object' }
    expect(slugify(obj)).toBe('custom-object')
  })
})

describe('stripHtmlTags', () => {
  it('removes simple and nested tags', () => {
    expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello')
    expect(stripHtmlTags('I agree to the <a href="/x">terms</a>')).toBe(
      'I agree to the terms'
    )
  })

  it('drops an unterminated tag without leaving <script', () => {
    const result = stripHtmlTags('safe <script')
    expect(result).toBe('safe ')
    expect(result).not.toContain('<script')
  })

  it('cannot reassemble a tag from the remainder', () => {
    expect(stripHtmlTags('<scr<script>ipt>')).not.toContain('<')
  })

  it('leaves plain text untouched', () => {
    expect(stripHtmlTags('No tags here')).toBe('No tags here')
    expect(stripHtmlTags('')).toBe('')
  })
})
