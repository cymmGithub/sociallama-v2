/**
 * The markdown ⇄ Lexical round trip for the two post blocks (design D3).
 *
 * `source.pl.md` is the authored source for a post, so a block that survives
 * the editor but not the importer is a block an author cannot write. Nothing
 * else pins that: the JSX syntax is the library's, the parsing is ours, and
 * the only proof either agrees is running both directions.
 *
 * The fixture is written in the form the EXPORTER emits — lowercase tag (the
 * block slug), children indented two spaces on their own lines. The importer's
 * regex is case-insensitive, so `<Stat …>` in a hand-authored source imports
 * just as well; it comes back as `<stat …>`, which is why the fixed-point
 * assertion below uses the canonical form.
 *
 * Run with: bun test lib/payload/blocks/post-blocks.test.ts
 */

import { describe, expect, test } from 'bun:test'
import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import {
  assertPostBlockSyntax,
  postEditorFeatures,
} from '@/lib/payload/blocks/post-blocks'

// The editor config is built from the project's own Payload config, so the
// blocks are sanitized exactly as the admin sanitizes them. Building it does
// not open a connection — the adapter is constructed, never initialised — but
// `requirePayloadEnv()` still demands the two variables, and Bun skips
// `.env.local` under NODE_ENV=test. Placeholders only, and only if unset.
process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/test'
process.env.PAYLOAD_SECRET ||= 'test-secret'

const { default: config } = await import('@payload-config')
const editorConfig = await editorConfigFactory.fromFeatures({
  config: await config,
  features: postEditorFeatures,
})

const MARKDOWN = `Wstęp przed liczbą.

<stat value="45%">
  więcej szans sprzedażowych generują osoby z wysokim SSI
</stat>

<pillars chip="maks. 25 pkt">
  1. **Establish your professional brand** (Budowanie profesjonalnej marki osobistej).
  2. **Find the right people** (Znajdowanie odpowiednich osób).
</pillars>
`

interface BlockNode {
  type?: string
  fields?: Record<string, unknown>
}

/** Block fields of a converted body, minus the `id` each conversion mints. */
const blocksOf = (markdown: string): Record<string, unknown>[] =>
  (
    convertMarkdownToLexical({ editorConfig, markdown }).root
      .children as BlockNode[]
  )
    .filter((node) => node.type === 'block')
    .map(({ fields }) => {
      const { id: _id, ...rest } = fields ?? {}
      return rest
    })

describe('post block markdown syntax', () => {
  test('imports both blocks with their attributes and items', () => {
    const [stat, pillars] = blocksOf(MARKDOWN)

    expect(stat).toMatchObject({
      blockType: 'stat',
      value: '45%',
      caption: 'więcej szans sprzedażowych generują osoby z wysokim SSI',
    })
    expect(pillars).toMatchObject({
      blockType: 'pillars',
      chip: 'maks. 25 pkt',
      items: [
        {
          title: 'Establish your professional brand',
          description: '(Budowanie profesjonalnej marki osobistej).',
        },
        {
          title: 'Find the right people',
          description: '(Znajdowanie odpowiednich osób).',
        },
      ],
    })
  })

  test('markdown → Lexical → markdown leaves the blocks unchanged', () => {
    const data = convertMarkdownToLexical({ editorConfig, markdown: MARKDOWN })
    const exported = convertLexicalToMarkdown({ data, editorConfig })

    // Semantic equality first — it is the claim that matters, and it names the
    // field that drifted rather than pointing at a whitespace column.
    expect(blocksOf(exported)).toEqual(blocksOf(MARKDOWN))
    // …then the syntax itself, which only holds because the fixture is already
    // in the exporter's canonical form.
    expect(exported.trim()).toBe(MARKDOWN.trim())
  })

  test('a pillar line that does not parse aborts, naming the line', () => {
    const broken = `<pillars>
  1. **Establish your professional brand** (ok).
  - Find the right people
</pillars>
`
    expect(() => assertPostBlockSyntax(broken)).toThrow(
      /- Find the right people/
    )
    // And the reason the guard cannot live in `jsx.import`: Lexical catches
    // the throw and hands back a body with the block simply gone.
    expect(blocksOf(broken)).toEqual([])
  })

  test('the pre-flight count matches the blocks the conversion produced', () => {
    expect(assertPostBlockSyntax(MARKDOWN)).toBe(blocksOf(MARKDOWN).length)
  })
})
