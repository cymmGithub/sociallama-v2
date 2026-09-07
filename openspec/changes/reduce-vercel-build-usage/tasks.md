# Tasks — reduce Vercel build usage

## 1. Skip non-production builds

- [ ] 1.1 Add `"ignoreCommand": "[ \"$VERCEL_ENV\" != \"production\" ]"` to `vercel.json`
- [ ] 1.2 Verify locally that `vercel.json` still validates (`bun run check` for JSON lint pickup; no build behaviour changes locally)

## 2. Slow dependabot cadence

- [ ] 2.1 Change `interval: weekly` → `interval: monthly` for the github-actions ecosystem in `.github/dependabot.yml`
- [ ] 2.2 Same for the npm ecosystem; keep single-PR-per-dependency and the ignore list untouched (auto-merge title parser depends on them)

## 3. Ship and verify

- [ ] 3.1 Merge to `main` via the standard branch + ff-merge flow (this push itself builds — expected)
- [ ] 3.2 Push a throwaway branch (or wait for the next dependabot branch) and confirm the deployment shows as skipped by the ignore command in the Vercel dashboard, consuming no build minutes
- [ ] 3.3 Delete the throwaway branch; confirm the following `main` push still produces a normal production build
