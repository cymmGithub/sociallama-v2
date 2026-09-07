import { BlocksFeature, type lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

/**
 * The two editor-authored blocks a post body may carry (design D1/D2).
 *
 * They live in the Lexical JSON as `type: "block"` nodes, not in a separate
 * layout field, so enabling them costs no SQL migration and a block sits at the
 * paragraph the editor chose rather than in a slot beside the article.
 *
 * Both are TEXT ONLY. No nested rich text: the translation projection
 * (`post-projection.ts`) then sees a flat list of string fields, and the JSX
 * markdown syntax below stays parseable with a line regex instead of a
 * recursive markdown pass.
 */

/** `N. **Title** trailing description` — one line of a `<pillars>` body. */
const PILLAR_LINE =
  /^\s*\d+[.)]\s*\*\*(?<title>[^*]+)\*\*\s*(?<description>.*)$/

export const MIN_PILLARS = 2
export const MAX_PILLARS = 6

/**
 * The `items` of a `<pillars>` body, one per non-empty child line.
 *
 * Throws on a line that does not parse — but see `assertPostBlockSyntax`: a
 * throw from inside `jsx.import` never reaches the caller, because Lexical
 * catches everything raised during an editor update and reports it to the
 * editor's `onError`. The block is then simply absent from the converted body.
 * That is why the same parse runs ahead of the conversion, where the throw can
 * still stop the import.
 */
export function parsePillars(
  children: string
): { title: string; description?: string }[] {
  return children
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const match = PILLAR_LINE.exec(line)
      if (!match?.groups) {
        throw new Error(
          `<pillars>: cannot parse "${line}" — expected "N. **Tytuł** opis"`
        )
      }
      const description = match.groups.description?.trim() ?? ''
      return {
        title: (match.groups.title ?? '').trim(),
        ...(description ? { description } : {}),
      }
    })
}

/** Every `<stat>`/`<pillars>` region in an authored source, body included. */
const BLOCK_REGION =
  /<(?<slug>stat|pillars)\b[^>]*>(?<body>[\s\S]*?)<\/\k<slug>\s*>/gi

/**
 * How many block tags the source claims, having proved each one parses.
 *
 * `import-post.ts` runs this before converting and compares the count with the
 * `block` nodes that came out, so a block Lexical dropped for ANY reason — an
 * unparseable pillar line, a missing close tag — fails the import instead of
 * quietly shortening the article.
 */
export function assertPostBlockSyntax(markdown: string): number {
  let count = 0
  for (const match of markdown.matchAll(BLOCK_REGION)) {
    count += 1
    if (match.groups?.slug?.toLowerCase() === 'pillars') {
      parsePillars(match.groups.body ?? '')
    }
  }
  return count
}

/**
 * A figure lifted out of prose. `value` is the number as the editor wants it
 * read (`45%`, `3×`), never a raw count we format here — the unit is part of
 * the claim.
 */
export const statBlock: Block = {
  slug: 'stat',
  labels: { singular: 'Statystyka', plural: 'Statystyki' },
  fields: [
    {
      name: 'value',
      label: 'Liczba',
      type: 'text',
      required: true,
      admin: { description: 'Np. „45%”, „3×”. Razem z jednostką.' },
    },
    {
      name: 'caption',
      label: 'Podpis',
      type: 'text',
      required: true,
      admin: { description: 'Jedno zdanie: co ta liczba znaczy.' },
    },
  ],
  jsx: {
    // `children` arrives de-dented, with a trailing newline the exporter added.
    import: ({ children, props }) => ({
      value: String(props.value ?? '').trim(),
      caption: children.trim(),
    }),
    export: ({ fields }) => ({
      props: { value: fields.value },
      children: String(fields.caption ?? ''),
    }),
  },
}

/**
 * An ordered set the article itself refers to by number ("Filar 1…4"), so the
 * ordinal is structure rather than decoration and comes from array order.
 */
export const pillarsBlock: Block = {
  slug: 'pillars',
  labels: { singular: 'Filary', plural: 'Bloki filarów' },
  fields: [
    {
      name: 'items',
      label: 'Pozycje',
      type: 'array',
      required: true,
      minRows: MIN_PILLARS,
      maxRows: MAX_PILLARS,
      labels: { singular: 'Pozycja', plural: 'Pozycje' },
      fields: [
        { name: 'title', label: 'Tytuł', type: 'text', required: true },
        { name: 'description', label: 'Opis', type: 'text' },
      ],
    },
    {
      name: 'chip',
      label: 'Plakietka',
      type: 'text',
      admin: {
        description:
          'Opcjonalna etykieta powtórzona na każdej karcie, np. „maks. 25 pkt”.',
      },
    },
  ],
  jsx: {
    import: ({ children, props }) => {
      const chip = String(props.chip ?? '').trim()
      return { items: parsePillars(children), ...(chip ? { chip } : {}) }
    },
    export: ({ fields }) => {
      const items = (fields.items ?? []) as {
        title?: string
        description?: string
      }[]
      const chip = typeof fields.chip === 'string' ? fields.chip.trim() : ''
      return {
        props: chip ? { chip } : {},
        children: items
          .map((item, index) => {
            const description = item.description?.trim() ?? ''
            return `${index + 1}. **${item.title ?? ''}**${
              description ? ` ${description}` : ''
            }`
          })
          .join('\n'),
      }
    },
  },
}

export const POST_BLOCKS: readonly Block[] = [statBlock, pillarsBlock]

/**
 * The posts `content` editor: the project default plus the two blocks.
 *
 * Exported as a features input rather than an editor instance so the markdown
 * importer can rebuild the SAME config with
 * `editorConfigFactory.fromFeatures`. `editorConfigFactory.default` reads the
 * ROOT editor from `payload.config`, which has no blocks — converting
 * `source.pl.md` through it would drop every block on the floor.
 */
type FeaturesInput = NonNullable<
  NonNullable<Parameters<typeof lexicalEditor>[0]>['features']
>

export const postEditorFeatures: FeaturesInput = ({ defaultFeatures }) => [
  ...defaultFeatures,
  BlocksFeature({ blocks: [...POST_BLOCKS] }),
]
