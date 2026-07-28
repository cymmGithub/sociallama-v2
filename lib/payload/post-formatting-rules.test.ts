/**
 * Unit tests for the shared post-formatting predicates
 * (lib/payload/post-formatting-rules.ts).
 *
 * Run with: bun test lib/payload/post-formatting-rules.test.ts
 *
 * Fixtures are drawn from the real defect samples the audit collected from
 * the imported corpus, including every case that must be PRESERVED — the
 * deliberate `center` alignment, the Polish one-letter prepositions, and the
 * grouped numbers in `case-study-mechanicy-na-tiktoku`. Those are the tests
 * that matter: a rule that over-fires here degrades typography while
 * claiming to improve it.
 */

import { describe, expect, it } from 'bun:test'
import {
  applyBlockNbsp,
  classifyIntroHeading,
  classifySpacerParagraph,
  duplicatesExcerpt,
  isBoldPseudoHeading,
  isCentered,
  isJustified,
  type LexicalNode,
  NBSP,
  normalizeHeadingLevels,
  planBlockNbsp,
  promoteToHeading,
  stripDuplicatedPrefix,
  unwrapLabelList,
} from './post-formatting-rules'

/** A paragraph carrying one plain text node. */
function para(text: string, format = ''): LexicalNode {
  return {
    type: 'paragraph',
    format,
    children: [{ type: 'text', text, format: 0 }],
  }
}

/** A paragraph built from several text nodes, as a mixed-formatting run is. */
function paraOf(...children: LexicalNode[]): LexicalNode {
  return { type: 'paragraph', format: '', children }
}

const text = (value: string, format = 0): LexicalNode => ({
  type: 'text',
  text: value,
  format,
})

describe('alignment', () => {
  it('flags a justified paragraph', () => {
    expect(isJustified(para('Lejek marketingowy', 'justify'))).toBe(true)
  })

  it('leaves centred nodes alone — authored intent, not debris', () => {
    const centred = para('Zobacz nasze realizacje', 'center')
    expect(isJustified(centred)).toBe(false)
    expect(isCentered(centred)).toBe(true)
  })

  it('does not read a bold text node as an alignment', () => {
    // Text nodes serialize `format` as a bitmask; 1 is bold, not an alignment.
    expect(isJustified(text('Lejek', 1))).toBe(false)
    expect(isCentered(text('Lejek', 2))).toBe(false)
  })
})

describe('spacer paragraphs', () => {
  it('classifies an empty paragraph as a spacer', () => {
    expect(classifySpacerParagraph({ type: 'paragraph', children: [] })).toBe(
      'spacer'
    )
  })

  it('classifies a non-breaking-space-only paragraph as a spacer', () => {
    expect(classifySpacerParagraph(para(NBSP))).toBe('spacer')
  })

  it('classifies a line-break-only paragraph as a spacer', () => {
    expect(
      classifySpacerParagraph(
        paraOf({ type: 'linebreak' }, { type: 'linebreak' })
      )
    ).toBe('spacer')
  })

  it('keeps a paragraph carrying a single visible character', () => {
    expect(classifySpacerParagraph(para(`${NBSP}—${NBSP}`))).toBe('content')
  })

  it('skips a blank paragraph holding a node the text walk cannot see', () => {
    // An image in an otherwise empty paragraph reads as blank text but is
    // real content — reported, never removed.
    expect(
      classifySpacerParagraph(
        paraOf(text(' '), { type: 'upload', children: [] })
      )
    ).toBe('unclear')
  })

  it('treats an empty heading as a spacer too', () => {
    // 11 of these in the corpus: a heading node with no text, which renders as
    // nothing but still claims a heading's margin. buildToc already skips
    // them, so removing one cannot shift an anchor.
    expect(
      classifySpacerParagraph({ type: 'heading', tag: 'h2', children: [] })
    ).toBe('spacer')
    expect(
      classifySpacerParagraph({ type: 'heading', tag: 'h3', children: [] })
    ).toBe('spacer')
  })

  it('keeps a heading that has text', () => {
    expect(
      classifySpacerParagraph({
        type: 'heading',
        tag: 'h2',
        children: [text('Co to jest lejek marketingowy?')],
      })
    ).toBe('content')
  })

  it('is not fooled by a blank list or quote', () => {
    expect(classifySpacerParagraph({ type: 'quote', children: [] })).toBe(
      'content'
    )
    expect(classifySpacerParagraph({ type: 'list', children: [] })).toBe(
      'content'
    )
  })
})

describe('non-breaking spaces', () => {
  it('converts a word space after a long token', () => {
    const block = para(`największy${NBSP}potencjał`)
    expect(applyBlockNbsp(block).wordSpace).toBe(1)
    expect(block.children?.[0]?.text).toBe('największy potencjał')
  })

  it('preserves a non-breaking space after a Polish one-letter preposition', () => {
    const block = para(`promocji – o${NBSP}ile wiesz, w${NBSP}jaki sposób`)
    const plan = applyBlockNbsp(block)
    expect(plan.wordSpace).toBe(0)
    expect(plan.preserved).toBe(2)
    expect(block.children?.[0]?.text).toContain(`o${NBSP}ile`)
    expect(block.children?.[0]?.text).toContain(`w${NBSP}jaki`)
  })

  it('preserves the ambiguous two-letter cases', () => {
    const block = para(`oparta na${NBSP}najprostszych`)
    expect(applyBlockNbsp(block).preserved).toBe(1)
    expect(block.children?.[0]?.text).toBe(`oparta na${NBSP}najprostszych`)
  })

  it('preserves a grouped number', () => {
    // "106 800" — converting this would let the number wrap in half.
    const block = para(`Liczba wyświetleń: 106${NBSP}800`)
    const plan = applyBlockNbsp(block)
    expect(plan.wordSpace).toBe(0)
    expect(plan.preserved).toBe(1)
    expect(block.children?.[0]?.text).toBe(`Liczba wyświetleń: 106${NBSP}800`)
  })

  it('drops a trailing padding run', () => {
    const block = para(`Jak zwiększyć zasięg?${NBSP.repeat(6)}`)
    const plan = applyBlockNbsp(block)
    expect(plan.padding).toBe(6)
    expect(block.children?.[0]?.text).toBe('Jak zwiększyć zasięg?')
  })

  it('drops a leading indent run', () => {
    const block = para(`${NBSP.repeat(6)}Telefon z dobrym aparatem`)
    const plan = applyBlockNbsp(block)
    expect(plan.padding).toBe(6)
    expect(block.children?.[0]?.text).toBe('Telefon z dobrym aparatem')
  })

  it('collapses a padding run between words without joining them', () => {
    const block = para(`istnieje! ${NBSP}Rok 2020`)
    const plan = applyBlockNbsp(block)
    expect(plan.padding).toBe(1)
    expect(block.children?.[0]?.text).toBe('istnieje! Rok 2020')
  })

  it('reads a gap straddling two text nodes as one word space', () => {
    // Bold "Lejek marketingowy" then a plain node opening with the gap.
    const block = paraOf(text('marketingowy', 1), text(`${NBSP}to model`))
    const plan = applyBlockNbsp(block)
    expect(plan.wordSpace).toBe(1)
    expect(block.children?.[1]?.text).toBe(' to model')
  })

  it('preserves a straddling gap after a one-letter preposition', () => {
    const block = paraOf(text('kontaktu z', 1), text(`${NBSP}fanami`))
    expect(applyBlockNbsp(block).preserved).toBe(1)
    expect(block.children?.[1]?.text).toBe(`${NBSP}fanami`)
  })

  it('does not read a gap across a block boundary', () => {
    // A list item's own text starts the block: its leading gap is padding,
    // not a word space continuing the previous item.
    const item: LexicalNode = {
      type: 'listitem',
      children: [text(`${NBSP}Dobre światło`)],
    }
    expect(planBlockNbsp(item).padding).toBe(1)
  })

  it('drops padding around a line break rather than joining the lines', () => {
    const block = paraOf(
      text(`pierwsza linia${NBSP}`),
      { type: 'linebreak' },
      text('druga')
    )
    const plan = applyBlockNbsp(block)
    expect(plan.padding).toBe(1)
    expect(block.children?.[0]?.text).toBe('pierwsza linia')
  })

  it('is idempotent', () => {
    const block = para(
      `${NBSP.repeat(3)}Tekst${NBSP}akapitu z${NBSP}czymś 106${NBSP}800${NBSP.repeat(2)}`
    )
    applyBlockNbsp(block)
    const settled = block.children?.[0]?.text
    const second = applyBlockNbsp(block)
    expect(second.wordSpace).toBe(0)
    expect(second.padding).toBe(0)
    expect(block.children?.[0]?.text).toBe(settled as string)
  })
})

describe('heading predicates', () => {
  it('reads an all-bold paragraph as a pseudo-heading', () => {
    expect(
      isBoldPseudoHeading(paraOf(text('Co to jest lejek marketingowy?', 1)))
    ).toBe(true)
  })

  it('ignores a paragraph with only some bold words', () => {
    expect(
      isBoldPseudoHeading(
        paraOf(text('Lejek marketingowy', 1), text(' to model'))
      )
    ).toBe(false)
  })

  it('ignores a long bolded sentence — emphasis, not a label', () => {
    expect(isBoldPseudoHeading(paraOf(text('a'.repeat(130), 1)))).toBe(false)
  })

  it('flags a heading contained in the excerpt', () => {
    const excerpt =
      'Google Search Console umożliwia teraz oficjalne powiązanie profili w social mediach z Twoją stroną.'
    expect(
      duplicatesExcerpt(
        'Google Search Console umożliwia teraz oficjalne powiązanie profili',
        excerpt
      )
    ).toBe(true)
  })

  it('does not flag a genuine section heading', () => {
    expect(
      duplicatesExcerpt(
        'Jak przygotować świąteczną kampanię?',
        'Google Search Console umożliwia teraz oficjalne powiązanie profili w social mediach.'
      )
    ).toBe(false)
  })

  it('does not flag anything when the post has no excerpt', () => {
    expect(duplicatesExcerpt('Cokolwiek', '')).toBe(false)
  })
})

/**
 * The editorial transformations (phase 7). Fixtures come from the posts named
 * in the review document, so a regression here is traceable to a real page.
 */
describe('intro heading treatment', () => {
  const EXCERPT_GOOGLE =
    'Google Search Console umożliwia teraz oficjalne powiązanie profili w social mediach z Twoją stroną internetową. To nie gadżet – to sygnał, że w oczach Google social media i SEO to już jeden ekosystem. Jeśli nie masz czasu'

  it('reads a heading that is essentially the whole excerpt as a restatement', () => {
    const excerpt = 'Co się u nas działo od stycznia do grudnia?'
    expect(classifyIntroHeading(excerpt, excerpt)).toBe('restatement')
  })

  it('reads intro prose running past the excerpt as extended', () => {
    const heading = `${EXCERPT_GOOGLE} ani zasobów, żeby to ogarnąć – Social Lama zrobi to za Ciebie.`
    expect(classifyIntroHeading(heading, EXCERPT_GOOGLE)).toBe('extended')
  })

  it('leaves a short genuine section label alone', () => {
    // "Budowanie Marki" opens the body, so the auto-generated excerpt starts
    // with it — but it is a real heading, not a restatement.
    const excerpt =
      'Budowanie Marki jest procesem długotrwałym i wymaga konsekwencji na każdym etapie prowadzenia komunikacji w mediach społecznościowych.'
    expect(classifyIntroHeading('Budowanie Marki', excerpt)).toBe('genuine')
  })

  it('cuts at a sentence boundary, not where the excerpt happened to stop', () => {
    // The stored excerpt ends mid-sentence ("Jeśli nie masz czasu"), so
    // cutting there left the paragraph starting "ani zasobów…". Back up to the
    // last full stop instead: a few repeated words beat a fragment.
    const heading = `${EXCERPT_GOOGLE} ani zasobów, żeby to ogarnąć.`
    expect(stripDuplicatedPrefix(heading, EXCERPT_GOOGLE)).toBe(
      'Jeśli nie masz czasu ani zasobów, żeby to ogarnąć.'
    )
  })

  it('keeps the whole heading when there is no sentence boundary to back up to', () => {
    const excerpt = 'Jeden ciąg słów bez kropki w środku tego zdania'
    const heading = `${excerpt} i jeszcze trochę więcej.`
    expect(stripDuplicatedPrefix(heading, excerpt)).toBe(heading)
  })

  it('keeps the heading when it shares no opening with the excerpt', () => {
    expect(stripDuplicatedPrefix('Zupełnie inny tekst', EXCERPT_GOOGLE)).toBe(
      'Zupełnie inny tekst'
    )
  })

  it('returns nothing when the heading is entirely inside the excerpt', () => {
    expect(
      stripDuplicatedPrefix('Co się u nas działo', 'Co się u nas działo')
    ).toBe('')
  })
})

describe('heading levels', () => {
  const heading = (tag: string, value: string): LexicalNode => ({
    type: 'heading',
    tag,
    children: [text(value)],
  })
  const body = (...children: LexicalNode[]): LexicalNode => ({
    type: 'root',
    children,
  })

  it('lifts a body that opens at h3 so it starts at h2', () => {
    const root = body(heading('h3', 'Sekcja'), heading('h3', 'Druga'))
    expect(normalizeHeadingLevels(root)).toBe(2)
    expect(root.children?.every((n) => n.tag === 'h2')).toBe(true)
  })

  it('clamps h4 and deeper to h3, which is all buildToc tracks', () => {
    const root = body(
      heading('h2', 'Sekcja'),
      heading('h4', '1. Widoczność w Google'),
      heading('h6', 'Podpis')
    )
    normalizeHeadingLevels(root)
    expect(root.children?.map((n) => n.tag)).toEqual(['h2', 'h3', 'h3'])
  })

  it('flattens a body that opens below its own shallowest level', () => {
    // h3 sections then one closing h2 — that h2 is the last section, not a
    // parent of everything before it, so they are all peers.
    const root = body(
      heading('h3', 'Beauty'),
      heading('h3', 'Fashion'),
      heading('h2', 'Co łączy branże?')
    )
    normalizeHeadingLevels(root)
    expect(root.children?.map((n) => n.tag)).toEqual(['h2', 'h2', 'h2'])
  })

  it('unwraps a single-item list into a heading', () => {
    const list: LexicalNode = {
      type: 'list',
      tag: 'ol',
      children: [
        { type: 'listitem', children: [text('Zadbaj o strategię', 1)] },
      ],
    }
    const heading = unwrapLabelList(list, 'h2')
    expect(heading?.type).toBe('heading')
    expect(heading?.tag).toBe('h2')
    expect(heading?.children?.[0]?.text).toBe('Zadbaj o strategię')
    expect(heading?.children?.[0]?.format).toBe(0)
  })

  it('leaves a real list alone', () => {
    const list: LexicalNode = {
      type: 'list',
      tag: 'ul',
      children: [
        { type: 'listitem', children: [text('Pierwszy')] },
        { type: 'listitem', children: [text('Drugi')] },
      ],
    }
    expect(unwrapLabelList(list, 'h2')).toBeNull()
  })

  it('leaves a single-item list that is too long to be a label', () => {
    const list: LexicalNode = {
      type: 'list',
      tag: 'ul',
      children: [{ type: 'listitem', children: [text('a'.repeat(90))] }],
    }
    expect(unwrapLabelList(list, 'h2')).toBeNull()
  })

  it('leaves an already-correct hierarchy untouched', () => {
    const root = body(heading('h2', 'Sekcja'), heading('h3', 'Podsekcja'))
    expect(normalizeHeadingLevels(root)).toBe(0)
  })

  it('re-levels after the only h2 is removed — the google-polaczylo shape', () => {
    // One bloated h2 plus h3 sections and h4 sub-points. Drop the h2 and the
    // post would have none at all; re-levelling lifts the whole tree.
    const root = body(
      heading('h3', 'Google przytuliło social media. Serio.'),
      heading('h4', '1. Widoczność')
    )
    normalizeHeadingLevels(root)
    expect(root.children?.map((n) => n.tag)).toEqual(['h2', 'h3'])
  })

  it('promotes a bold paragraph and clears the now-redundant bold', () => {
    const node = paraOf(text('Co to jest lejek marketingowy?', 1))
    promoteToHeading(node, 'h2')
    expect(node.type).toBe('heading')
    expect(node.tag).toBe('h2')
    expect(node.children?.[0]?.format).toBe(0)
    expect(isBoldPseudoHeading(node)).toBe(false)
  })
})

describe('bold pseudo-heading exclusions', () => {
  it('does not promote a bold run longer than a heading may be', () => {
    // Promoting one would manufacture the oversized heading this change removes.
    expect(isBoldPseudoHeading(paraOf(text('a'.repeat(86), 1)))).toBe(false)
    expect(isBoldPseudoHeading(paraOf(text('a'.repeat(85), 1)))).toBe(true)
  })

  it('does not promote a bold image credit', () => {
    expect(
      isBoldPseudoHeading(
        paraOf(text('źródło: https://blog.planoly.com/instagram-stories', 1))
      )
    ).toBe(false)
  })
})
