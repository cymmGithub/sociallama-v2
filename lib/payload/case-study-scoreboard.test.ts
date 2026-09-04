import { describe, expect, it } from 'bun:test'
import type { CaseStudy } from '@/payload-types'
import {
  groupResults,
  leadMetrics,
  platformOf,
  platformsOf,
  splitValue,
} from './case-study-scoreboard'

/**
 * The read rules decide what 47 published studies claim about themselves on
 * four surfaces, from an array with no schema support behind it. Every shape
 * asserted here is a real one, lifted from the seeded database — the labels
 * are what editors actually typed, and the strict cases (`Facebook (strona)`,
 * `Facebook / Instagram (Niemcy)`) are the ones where a looser match would
 * quietly change a published count.
 */

const results = (
  ...rows: [platform: string, metric: string, value: string][]
): CaseStudy['results'] =>
  rows.map(([platform, metric, value]) => ({ platform, metric, value }))

describe('leadMetrics — array order is the editorial ranking', () => {
  it('takes the first result as the study lead', () => {
    // irobot
    const leads = leadMetrics(
      results(
        ['TikTok', 'Wyświetlenia', '11 mln'],
        ['TikTok', 'Polubienia', '742 tys.'],
        ['YouTube', 'Wyświetlenia', '742 tys.']
      )
    )
    expect(leads[0]).toEqual({
      label: 'TikTok',
      platform: 'tiktok',
      metric: 'Wyświetlenia',
      value: '11 mln',
    })
  })

  it('gives one lead per group, in first-appearance order', () => {
    // engie: LinkedIn group first, Facebook second, interleaved rows.
    const leads = leadMetrics(
      results(
        ['LinkedIn', 'Łączna liczba wyświetleń publikacji', '263 996'],
        ['LinkedIn', 'Obserwujący', '+1 200'],
        ['Facebook', 'Wyświetlenia', '69,1 tys.'],
        ['LinkedIn', 'Reakcje', '5 000'],
        ['Facebook', 'Reakcje', '900']
      )
    )
    expect(leads.map((lead) => [lead.label, lead.value])).toEqual([
      ['LinkedIn', '263 996'],
      ['Facebook', '69,1 tys.'],
    ])
  })

  it('is empty for a study with no results', () => {
    // luisse is the one published study carrying none.
    expect(leadMetrics(null)).toEqual([])
    expect(leadMetrics([])).toEqual([])
    expect(platformsOf(null)).toEqual([])
    expect(groupResults(null)).toEqual([])
  })
})

describe('groupResults — grouping preserves both orders', () => {
  it('keeps metrics in array order inside a group', () => {
    const groups = groupResults(
      results(
        ['Facebook', 'A', '1'],
        ['Instagram', 'B', '2'],
        ['Facebook', 'C', '3']
      )
    )
    expect(groups).toHaveLength(2)
    expect(groups[0]?.items.map((i) => i.metric)).toEqual(['A', 'C'])
    expect(groups[1]?.items.map((i) => i.metric)).toEqual(['B'])
  })
})

describe('platformOf — only the five brand-icon keys match', () => {
  it('matches the known platforms however they are cased or spaced', () => {
    expect(platformOf('TikTok')).toBe('tiktok')
    expect(platformOf('LinkedIn')).toBe('linkedin')
    expect(platformOf('You Tube')).toBe('youtube')
  })

  it('treats a brand or channel label as no platform', () => {
    // Real group labels, none of them dirty data.
    expect(platformOf('FoodSaver')).toBeNull()
    expect(platformOf('Kongres Bezpieczeństwo Polski')).toBeNull()
    expect(platformOf('Getaway')).toBeNull()
    expect(platformOf('Beesfund')).toBeNull()
    expect(platformOf('Strona WWW')).toBeNull()
    expect(platformOf('Volvo Car Warszawa')).toBeNull()
  })

  it('matches neither platform in a composite label', () => {
    expect(platformOf('Facebook / Instagram')).toBeNull()
    expect(platformOf('Facebook / Instagram (Niemcy)')).toBeNull()
    expect(platformOf('Instagram/Facebook')).toBeNull()
    expect(platformOf('YouTube — Zaczarowany Świat Sary')).toBeNull()
  })

  it('does not fold a qualified platform into the bare one', () => {
    // imid-cmv measures a Facebook page and a Facebook group separately. The
    // labels are the distinction; matching them to `facebook` would report one
    // number as the other's, and would make the hub count 31 Facebook studies
    // where 30 have a plain Facebook group.
    expect(platformOf('Facebook (strona)')).toBeNull()
    expect(platformOf('Facebook (grupa)')).toBeNull()
  })
})

describe('platformsOf — brand groups sit beside platform groups', () => {
  it('keeps the platforms and ignores the brand group', () => {
    // foodsaver: Facebook, Instagram, FoodSaver.
    const rows = results(
      ['Facebook', 'Całkowita liczba obserwujących', '9 433'],
      ['Instagram', 'Zasięg', '1,2 mln'],
      ['FoodSaver', 'Sprzedaż', '+38%']
    )
    expect(platformsOf(rows)).toEqual(['facebook', 'instagram'])
    // The brand group still renders, and can still be a lead.
    expect(groupResults(rows).map((g) => g.label)).toEqual([
      'Facebook',
      'Instagram',
      'FoodSaver',
    ])
  })

  it('reports no platforms when every group is a brand label', () => {
    // kbp: one group, no platform, and the lead is still that group's first.
    const rows = results([
      'Kongres Bezpieczeństwo Polski',
      'Uczestnicy wydarzenia',
      'prawie 4 000',
    ])
    expect(platformsOf(rows)).toEqual([])
    expect(leadMetrics(rows)[0]).toMatchObject({
      label: 'Kongres Bezpieczeństwo Polski',
      platform: null,
      value: 'prawie 4 000',
    })
    // getaway is the same shape with nine metrics under the one group.
    expect(platformsOf(results(['Getaway', 'Odwiedziny', '+913%']))).toEqual([])
  })

  it('lists each platform once, in first-appearance order', () => {
    expect(
      platformsOf(
        results(
          ['Instagram', 'A', '1'],
          ['Facebook', 'B', '2'],
          ['Instagram', 'C', '3']
        )
      )
    ).toEqual(['instagram', 'facebook'])
  })
})

describe('splitValue — the numeral and its parenthetical', () => {
  it('splits a delta off the numeral', () => {
    expect(splitValue('432 616 (+1 380%)')).toEqual({
      numeral: '432 616',
      note: '+1 380%',
    })
    expect(splitValue('15,5 mln (+44,7%)')).toEqual({
      numeral: '15,5 mln',
      note: '+44,7%',
    })
    expect(splitValue('20.58% (+7.98 pp)')).toEqual({
      numeral: '20.58%',
      note: '+7.98 pp',
    })
  })

  it('splits a range or a base the same way', () => {
    expect(splitValue('+50% (z 368 do 549)')).toEqual({
      numeral: '+50%',
      note: 'z 368 do 549',
    })
    expect(splitValue('+159,1% (2 508)')).toEqual({
      numeral: '+159,1%',
      note: '2 508',
    })
  })

  it('splits a qualifier, which reads correctly as a second line', () => {
    expect(splitValue('92% (612 opinii)')).toEqual({
      numeral: '92%',
      note: '612 opinii',
    })
  })

  it('leaves a value without a trailing parenthesis whole', () => {
    expect(splitValue('prawie 3 mln')).toEqual({ numeral: 'prawie 3 mln' })
    expect(splitValue('306% rocznego KPI')).toEqual({
      numeral: '306% rocznego KPI',
    })
    expect(splitValue('8,6 mln+')).toEqual({ numeral: '8,6 mln+' })
  })

  it('leaves a value that is only a parenthetical whole', () => {
    // Nothing would be left to set as the numeral.
    expect(splitValue('(brak danych)')).toEqual({ numeral: '(brak danych)' })
  })
})
