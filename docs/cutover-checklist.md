# WordPress → v2 cutover checklist

Launch-day runbook for switching `sociallama.pl` DNS from the WordPress host
to the Vercel deployment (migrate-wp-content, task 4.3). The WP site keeps
publishing until cutover, so content import and verification repeat as the
final pre-flight.

## Pre-flight (any time before cutover)

- [ ] All migrate-wp-content tasks complete; redirects + static pages deployed
- [ ] Parity gate green against the preview deployment:
      `bun ./lib/scripts/check-url-parity.ts <preview-url>`
      (set `VERCEL_AUTOMATION_BYPASS_SECRET` if the preview is protected)
- [ ] Rendering spot-checks signed off (oldest post, newest post, embeds/tables)
- [ ] Production DB has real content: `/blog`, `/category/*`, and the homepage
      NewsLAMA card show WP posts, not just the seed post

## Cutover day (order matters)

1. **Freeze WP publishing** — tell editors to stop; any post published after
   the final import will not exist on v2.
2. **Final content refresh** — re-import while WP is still reachable
   (idempotent, updates in place):
   `bun ./lib/scripts/migrate-wp.ts --prod`
3. **Redeploy / revalidate production** — Local API writes bypass the deployed
   app's revalidation hooks, so trigger a redeploy (or revalidate) for the new
   content to appear (same caveat as `payload:seed`).
4. **Re-run the parity gate** against production’s current deployment URL:
   `bun ./lib/scripts/check-url-parity.ts <production-deployment-url>`
   Must be zero failures — this is the launch blocker.
5. **Switch DNS** for `sociallama.pl` to Vercel (per Vercel domain
   instructions). Keep the WP host running until TTLs expire.
6. **Post-cutover smoke test** on the live domain:
   - `https://sociallama.pl/` (homepage)
   - a post URL from the old site (e.g. `/linkedin-premium-czy-warto/`)
   - `/blog`, a `/category/*` page, a `/tag/*` URL (must 301 → `/blog`)
   - `/polityka-prywatnosci`, `/zostan-lama`
7. **Re-run the parity gate against the live domain** once DNS has
   propagated: `bun ./lib/scripts/check-url-parity.ts https://sociallama.pl`
8. **Google Search Console** — submit the v2 sitemap (`/sitemap.xml`) for the
   property so recrawl starts promptly.

## Rollback

Content-only change: point DNS back at the WP host (it stays untouched until
decommission). No v2 code needs reverting.

## Decommission (after TTLs + a safety window)

- [ ] Verify no traffic reaches the WP host (its access logs are quiet)
- [ ] Final parity gate green on `https://sociallama.pl`
- [ ] Archive/backup the WP site, then shut it down
