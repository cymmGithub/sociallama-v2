# Satus - AI Agent Guide

Engineering standards for this repo live in [AGENTS.md](./AGENTS.md). Read it first.

`AGENTS.md` covers: enforced rules (Biome + TypeScript CI), house style conventions, code patterns, React 19 / Next.js 16 / Tailwind v4 specifics, integrations, and commands.

Shared flows — worktree handoff and closing, migration rules, git/deploy
hygiene — live in the parent guide (`../CLAUDE.md`). This file holds only
sociallama-specific facts.

## Project facts

- Local Postgres runs in the `sociallama-postgres` container on **:5434**;
  the shared dev database is `sociallama_dev`.
- Isolated worktree DBs are seeded by the four scripts listed in the
  `"worktree"` config in `package.json` (base content, case studies, social
  platforms, authors).
