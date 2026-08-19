/**
 * Second imagery pass over the approach pillars: drop two weak creatives and
 * move one so the pillar that lost its own is not left bare.
 *
 *   entelo    #DOBREKRZESLO  drop entelo-gallery-1.jpg
 *       A laptop mockup of the LinkedIn profile, mostly empty white frame; the
 *       phone creative beside it carries the pillar on its own.
 *   laurastar #SPRZEDAŻ      drop laurastar-gallery-3-cut.webp
 *       The capture is broken — the comment sheet is cut mid-thread with a slab
 *       of unrelated video above it.
 *   laurastar #EKSPERCKOŚĆ → #SPRZEDAŻ  move laurastar-gallery-2.jpg
 *       It is a brand-reply thread about which steam generator to buy, so it
 *       reads as sales activation; #EKSPERCKOŚĆ keeps the how-to video, which
 *       is the education the pillar is actually about.
 *
 * Same keying as detach-comment-screenshots.ts, and for the same reasons:
 * filenames rather than media ids (ids are per-database), the pillar tag as a
 * GUARD rather than a selector (a file found under an unexpected tag aborts the
 * run), and every write repeated per locale because `approach` is localized as
 * a whole array. A move keeps the media document — only the row it hangs off
 * changes — so it survives the locales independently.
 *
 * Run:  bun ./lib/payload/edit-approach-creatives.ts            # dry run, dev DB
 *       bun ./lib/payload/edit-approach-creatives.ts --apply
 *       bun ./lib/payload/edit-approach-creatives.ts --apply --prod
 *
 * NOTE: writes bypass the deployed app, so the revalidation hooks cannot reach
 * the live cache — after running against production, redeploy (or revalidate).
 */

export {} // top-level await needs this file to be a module

const APPLY = process.argv.includes('--apply')

if (process.argv.includes('--prod')) {
  const { targetProdEnv } = await import('./prod-env')
  targetProdEnv('edit-approach-creatives')
}

type Tags = { pl: string; en: string }
type Op =
  | { kind: 'drop'; slug: string; file: string; from: Tags }
  | { kind: 'move'; slug: string; file: string; from: Tags; to: Tags }

const PLAN: Op[] = [
  {
    kind: 'drop',
    slug: 'entelo',
    file: 'entelo-gallery-1.jpg',
    from: { pl: '#DOBREKRZESLO', en: '#DOBREKRZESLO' },
  },
  {
    kind: 'drop',
    slug: 'laurastar',
    file: 'laurastar-gallery-3-cut.webp',
    from: { pl: '#SPRZEDAŻ', en: '#SALES' },
  },
  {
    kind: 'move',
    slug: 'laurastar',
    file: 'laurastar-gallery-2.jpg',
    from: { pl: '#EKSPERCKOŚĆ', en: '#EXPERTISE' },
    to: { pl: '#SPRZEDAŻ', en: '#SALES' },
  },
]

const LOCALES = ['pl', 'en'] as const

const dbHost = new URL(
  (process.env.DATABASE_URL ?? '').replace(/^postgres(?:ql)?:/, 'http:')
).hostname

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

console.log(
  `${APPLY ? 'applying to' : 'dry run against'} ${dbHost}\n` +
    '(pass --apply to write)\n'
)

let changes = 0

// Ops are applied one at a time, re-reading the document each time: the two
// laurastar ops touch the same pillar array, so batching them off one read
// would let the second overwrite the first.
for (const op of PLAN) {
  for (const locale of LOCALES) {
    const res = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: op.slug } },
      limit: 1,
      draft: true,
      locale,
      fallbackLocale: false,
      depth: 1, // media resolved so rows can be matched by filename
    })
    // biome-ignore lint/suspicious/noExplicitAny: doc shape
    const doc = res.docs[0] as any
    if (!doc?.approach?.length) {
      console.log(`! ${op.slug} [${locale}]: no approach pillars — skipping`)
      continue
    }

    const fromTag = op.from[locale]
    const toTag = op.kind === 'move' ? op.to[locale] : null

    // biome-ignore lint/suspicious/noExplicitAny: pillar row shape
    const pillars = doc.approach as any[]
    const holder = pillars.find((p) =>
      (p.media ?? []).some(
        (m: { filename?: string }) => m?.filename === op.file
      )
    )

    if (!holder) {
      console.log(`= ${op.slug} [${locale}]: ${op.file} already gone`)
      continue
    }
    // A re-run finds a moved creative under its destination — that is the
    // finished state, not the drift the guard below is looking for.
    if (holder.tag === toTag) {
      console.log(`= ${op.slug} [${locale}]: ${op.file} already in ${toTag}`)
      continue
    }
    if (holder.tag !== fromTag) {
      throw new Error(
        `${op.slug} [${locale}]: ${op.file} sits under "${holder.tag}", not ` +
          `"${fromTag}" — the content moved, refusing to write`
      )
    }
    const target =
      toTag === null ? null : (pillars.find((p) => p.tag === toTag) ?? null)
    if (toTag !== null && target === null) {
      throw new Error(`${op.slug} [${locale}]: no pillar tagged "${toTag}"`)
    }

    const idOf = (m: unknown) =>
      typeof m === 'object' && m !== null ? (m as { id: number }).id : Number(m)
    const moved = (holder.media ?? []).find(
      (m: { filename?: string }) => m?.filename === op.file
    )

    const approach = pillars.map((pillar) => {
      if (pillar === holder) {
        return {
          ...pillar,
          media: (pillar.media ?? [])
            .filter((m: { filename?: string }) => m?.filename !== op.file)
            .map(idOf),
        }
      }
      if (pillar === target) {
        return {
          ...pillar,
          media: [...(pillar.media ?? []).map(idOf), idOf(moved)],
        }
      }
      return pillar
    })

    changes++
    console.log(
      `${APPLY ? '~' : 'would'} ${op.slug} [${locale}] ${fromTag}: ` +
        (toTag === null ? `drop ${op.file}` : `move ${op.file} -> ${toTag}`)
    )

    if (APPLY) {
      await payload.update({
        collection: 'case-studies',
        id: doc.id,
        locale,
        // No `draft: true`: these studies are published and the public page is
        // the thing being corrected.
        // biome-ignore lint/suspicious/noExplicitAny: hand-built rows, validated by Payload
        data: { approach } as any,
      })
    }
  }
}

console.log(`\n${changes} write(s) ${APPLY ? 'applied' : 'pending'}`)
process.exit(0)
