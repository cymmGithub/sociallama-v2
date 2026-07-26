## 1. Converter fix

- [x] 1.1 In `lib/scripts/migrate-wp.ts`, strip WordPress internal post embeds — iframes with `class="wp-embedded-content"` or a src matching `/embed/#?secret=` — **before** the catch-all iframe→link rule; push a `notes` entry for each strip.
- [x] 1.2 Confirm the catch-all still degrades a third-party iframe (YouTube/Facebook) to a link; add or extend a converter test fixture covering both cases in one body.

## 2. Repair script

- [x] 2.1 Create `lib/payload/repair-wp-embed-links.ts` mirroring `backfill-guest-authors.ts`: dry run by default, `--apply` to write, `--prod` to target production (forcing `NODE_ENV=production`). Register it in `package.json`.
- [x] 2.2 Find candidates by walking the Lexical tree for the `embed/#?secret=` substring (NOT via `fields.url` — the needle lives in the text node).
- [x] 2.3 Guard each deletion: the node's text must be nothing but that URL, AND a node within the preceding 3 must carry a non-embed link to the same slug. Skip and report anything failing either test.
- [x] 2.4 Also drop the adjacent blank spacer paragraph, so the post does not end up with a double gap.

## 3. Apply to production

- [x] 3.1 Dry-run against prod; confirm exactly 13 nodes across posts `#2, #47, #48, #49, #50, #54, #55`, each reporting its partner link.
- [x] 3.2 Apply, then verify: zero published posts contain `embed/#?secret=`, and the total blockquote-link count is unchanged.
- [x] 3.3 Re-run the script to confirm idempotency (second run reports 0 candidates).

## 4. Verify

- [x] 4.1 `bunx biome check` + `bunx tsc --noEmit`; both clean.
- [x] 4.2 Redeploy (or revalidate) so the cached pages pick up the change.
- [x] 4.3 On the deployment, open one repaired post and confirm the titled blockquote link survives, the raw URL is gone, and the link resolves to the target post.
