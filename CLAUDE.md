# Satus - AI Agent Guide

Engineering standards for this repo live in [AGENTS.md](./AGENTS.md). Read it first.

`AGENTS.md` covers: enforced rules (Biome + TypeScript CI), house style conventions, code patterns, React 19 / Next.js 16 / Tailwind v4 specifics, integrations, and commands.

## Claude Code Notes

### Starting a change in a worktree is a HANDOFF, not a licence to implement

When I say any of:

- "start `<change>` in a new/separate worktree"
- "start the audit / the spec / this on a separate worktree"
- "spin up a worktree for `<change>`"

I mean **set up the environment and stop**. The work is done by a *different*
Claude session running inside that worktree's own tab — not by the session I am
currently talking to. The session that builds the worktree must never also start
implementing the change.

**The whole flow, in order:**

1. `bun run worktree:new <change-name> <port>` from the **main** worktree.
   - Add `--isolated` **only** when the change edits the Payload schema
     (new/edited collections). Content and frontend work shares the pre-seeded
     dev DB.
   - Pick a free port: 3001, 3002, 3003, … (`git worktree list` and each
     worktree's `.worktree-meta.json` show what is taken).
   - The script does everything: DB container, `git worktree add`, `.env.local`,
     `bun install`, folding in the OpenSpec proposal, and booting `bun dev`
     detached.
2. `herdr tab create --cwd <worktree-path> --label "<short>:<port>"`.
   - Label format is **`<feat>:<port>`**, matching the existing tabs
     (`polish:3001`, `cs-audit:3002`). Shorten the feature name; do not paste
     the full change slug.
3. Start a Claude session **in that tab's pane** so it is ready to work:
   `herdr pane send-text <pane_id> 'claude'` then
   `herdr pane send-keys <pane_id> Enter`.
   - Do **not** use `herdr agent start` — it splits a pane instead of using the
     tab that was just created.
4. **Report and stop.** Give me the path, branch, port, tab label and pane id.
   Do not read the change's tasks, do not write code, do not run its scripts,
   do not commit. The new session owns all of that.

**Do not** invoke `openspec-apply-change` / `/opsx:apply` in the setup session.
That skill belongs to the session running inside the worktree.

If it is genuinely unclear whether I want a handoff or want you to implement
something right here, ask — but "start X in a worktree" is not ambiguous.
