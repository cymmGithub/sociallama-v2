/**
 * worktree.ts — reproducible per-feature worktree bring-up + teardown.
 *
 * Run from the MAIN worktree (it owns `.env.local` + `docker-compose.yml`):
 *
 *   bun run worktree:new <name> <port> [--isolated] [--change <slug>]
 *   bun run worktree:rm  <name> [--force]
 *
 * `new` does the whole dance so a fresh terminal tab lands on a live app:
 *   1. ensure the shared Postgres container is up (docker compose up -d)
 *   2. git worktree add ../<name> -b <name>   (off main HEAD)
 *   3. copy main's .env.local → worktree, overriding DATABASE_URL when isolated
 *   4. bun install  (real install — symlinked node_modules breaks Turbopack)
 *   5. --isolated: create a dedicated DB on :5434, then dev-push + seed it
 *   6. --change: relocate the untracked OpenSpec proposal + commit it on branch
 *   7. boot `bun dev` detached on <port>, logging to the worktree
 *
 * State lands in <worktree>/.worktree-meta.json so `rm` can stop dev, drop the
 * isolated DB, and remove the worktree.
 *
 * DB isolation rule of thumb: only reach for --isolated when the worktree
 * changes the Payload schema (new/edited collections). Pure content/frontend
 * work shares the pre-seeded dev DB — no clobber risk since it never pushes.
 */

import { spawn as nodeSpawn } from 'node:child_process'
import { openSync } from 'node:fs'
import { cp, rename, rm } from 'node:fs/promises'
import { connect } from 'node:net'
import { bunExecutable, getFlagValue, pathExists } from './utils'

const DB_CONTAINER = 'sociallama-postgres'
const repoRoot = process.cwd()

// —— tiny process helpers ————————————————————————————————————————————————————

/** Run a command with inherited stdio; throw on non-zero unless allowFail. */
const run = async (
  cmd: string[],
  opts: { cwd?: string; allowFail?: boolean } = {}
): Promise<number> => {
  const proc = Bun.spawn(cmd, {
    cwd: opts.cwd ?? repoRoot,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
    env: process.env,
  })
  const code = await proc.exited
  if (code !== 0 && !opts.allowFail) {
    throw new Error(`Command failed (exit ${code}): ${cmd.join(' ')}`)
  }
  return code
}

/** Run a command and capture trimmed stdout. */
const capture = async (cmd: string[]): Promise<string> => {
  const proc = Bun.spawn(cmd, { stdout: 'pipe', stderr: 'ignore' })
  const out = await new Response(proc.stdout).text()
  await proc.exited
  return out.trim()
}

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

/** Exit with `msg` unless `cond` holds; narrows `cond` for the type-checker. */
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg)
}

const log = (msg: string) => console.log(msg)
const step = (n: number, msg: string) => console.log(`\n[${n}] ${msg}`)

/** True when nothing is listening on the port (connection refused/timeout). */
const portFree = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const sock = connect({ host: '127.0.0.1', port }, () => {
      sock.destroy()
      resolve(false) // connected → something is there
    })
    sock.on('error', () => resolve(true))
    sock.setTimeout(1000, () => {
      sock.destroy()
      resolve(true)
    })
  })

/** Poll until the dev server answers (any HTTP status = up), or time out. */
const waitReady = async (port: number, ms = 90_000): Promise<boolean> => {
  const start = Date.now()
  while (Date.now() - start < ms) {
    try {
      await fetch(`http://localhost:${port}/`, {
        signal: AbortSignal.timeout(2000),
      })
      return true
    } catch {
      // not up yet
    }
    await Bun.sleep(1500)
  }
  return false
}

// —— new ————————————————————————————————————————————————————————————————————

const newWorktree = async (argv: string[]) => {
  const positional = argv.filter((a) => !a.startsWith('--'))
  const name = positional[0]
  const port = Number(positional[1])
  const isolated = argv.includes('--isolated')
  // Ternary (not ||/??) so an empty --change value also collapses to undefined.
  const changeArg = getFlagValue(argv, '--change')
  const change = changeArg ? changeArg : undefined

  assert(
    !!name && /^[a-z0-9-]+$/.test(name),
    'Usage: worktree:new <name> <port> — <name> must be [a-z0-9-]'
  )
  assert(
    Number.isInteger(port) && port >= 1024 && port <= 65535,
    'Usage: worktree:new <name> <port> — <port> must be 1024–65535'
  )
  if (!(await pathExists(`${repoRoot}/docker-compose.yml`))) {
    fail('Run this from the main worktree (docker-compose.yml not found here).')
  }
  const envSrc = `${repoRoot}/.env.local`
  if (!(await pathExists(envSrc))) {
    fail('.env.local missing in the main worktree — nothing to copy from.')
  }

  // Idempotency guard: bail BEFORE any mutation if this name is already taken —
  // as a live worktree dir, or as a dangling branch from a half-failed run.
  const worktreePath = `${repoRoot}/../${name}`
  if (await pathExists(worktreePath)) {
    fail(
      `../${name} already exists — remove it first: bun run worktree:rm ${name}`
    )
  }
  const branchExists =
    (await capture(['git', 'branch', '--list', name])).trim() !== ''
  if (branchExists) {
    fail(
      `Branch "${name}" already exists (leftover from a prior run?). ` +
        `Clean up: bun run worktree:rm ${name} && git branch -D ${name}`
    )
  }
  if (!(await portFree(port))) fail(`Port ${port} is already in use.`)

  // 1. shared DB container — idempotent, cheap if already up ("only if needed")
  step(1, `Ensuring the ${DB_CONTAINER} container is up`)
  const running = await capture([
    'docker',
    'ps',
    '--filter',
    `name=${DB_CONTAINER}`,
    '--format',
    '{{.Names}}',
  ])
  if (running === DB_CONTAINER) log('  already running ✓')
  else await run(['docker', 'compose', 'up', '-d'])

  // 2. worktree off main HEAD
  step(2, `Creating worktree ../${name} (branch ${name})`)
  await run(['git', 'worktree', 'add', worktreePath, '-b', name])

  // 3. env — copy, then swap DATABASE_URL for isolated (NOT PORT: Next reads
  //    PORT from the process env at launch, never from .env.local).
  step(3, 'Copying .env.local')
  const envText = await Bun.file(envSrc).text()
  const dbName = `sociallama_${name.replace(/-/g, '_')}`
  let outEnv = envText
  if (isolated) {
    const dbUrl = envText.match(/^DATABASE_URL=["']?(?<url>[^"'\n]+)["']?/m)
      ?.groups?.url
    assert(dbUrl, 'No active DATABASE_URL in .env.local to derive from.')
    const url = new URL(dbUrl)
    url.pathname = `/${dbName}`
    outEnv = envText.replace(
      /^DATABASE_URL=.*$/m,
      `DATABASE_URL="${url.toString()}"`
    )
    log(`  isolated DB → ${dbName}`)
  } else {
    log('  shared dev DB (pre-seeded)')
  }
  await Bun.write(`${worktreePath}/.env.local`, outEnv)

  // 4. deps
  step(4, 'Installing dependencies (bun install)')
  await run([bunExecutable, 'install'], { cwd: worktreePath })

  // 5. isolated DB: create + dev-push/seed. The first seed's Payload init pushes
  //    the schema (dev mode) — clean on an empty DB, no destructive prompt.
  if (isolated) {
    step(5, `Provisioning isolated DB ${dbName}`)
    const exists = await capture([
      'docker',
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-tAc',
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`,
    ])
    if (exists !== '1') {
      await run([
        'docker',
        'exec',
        DB_CONTAINER,
        'psql',
        '-U',
        'postgres',
        '-c',
        `CREATE DATABASE ${dbName}`,
      ])
    }
    for (const s of [
      'payload:seed',
      'payload:seed:case-studies',
      'payload:seed:platforms',
    ]) {
      log(`  ${s}`)
      await run([bunExecutable, 'run', s], { cwd: worktreePath })
    }
  }

  // 6. fold in the OpenSpec proposal (untracked in main) → commit on the branch
  if (change) {
    step(6, `Folding in OpenSpec proposal ${change}`)
    const src = `${repoRoot}/openspec/changes/${change}`
    if (await pathExists(src)) {
      const dst = `${worktreePath}/openspec/changes/${change}`
      try {
        await rename(src, dst)
      } catch {
        await cp(src, dst, { recursive: true })
        await rm(src, { recursive: true, force: true })
      }
      await run(['git', 'add', `openspec/changes/${change}`], {
        cwd: worktreePath,
      })
      await run(
        [
          'git',
          'commit',
          '-m',
          `docs: openspec proposal — ${change}\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`,
        ],
        { cwd: worktreePath }
      )
    } else {
      log(`  (no openspec/changes/${change} in main — skipping)`)
    }
  }

  // 7. detached dev — survives this script exiting; own process group so `rm`
  //    can kill the whole Turbopack worker tree with one signal.
  step(7, `Booting dev on :${port} (detached)`)
  const logPath = `${worktreePath}/.worktree-dev.log`
  const fd = openSync(logPath, 'a')
  const child = nodeSpawn(bunExecutable, ['run', 'dev'], {
    cwd: worktreePath,
    env: { ...process.env, PORT: String(port), FORCE_COLOR: '0' },
    detached: true,
    stdio: ['ignore', fd, fd],
  })
  child.unref()
  const devPid = child.pid ?? null

  await Bun.write(
    `${worktreePath}/.worktree-meta.json`,
    `${JSON.stringify(
      {
        name,
        port,
        branch: name,
        isolated,
        dbName: isolated ? dbName : 'sociallama_dev (shared)',
        devPid,
        devLog: '.worktree-dev.log',
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  )

  log('\n  waiting for dev to answer…')
  const ready = await waitReady(port)

  console.log(`
${ready ? '✓' : '⚠'} worktree ready — ../${name}
    url:   http://localhost:${port}${ready ? '' : '   (not answering yet — tail the log)'}
    dev:   pid ${devPid ?? '?'}  →  logs at ../${name}/.worktree-dev.log
    db:    ${isolated ? `${dbName} (isolated)` : 'sociallama_dev (shared)'}

  Next: open a new tab →  cd ../${name}  →  start a Claude session.
  Stop it later with:     bun run worktree:rm ${name}
`)
}

// —— rm —————————————————————————————————————————————————————————————————————

const rmWorktree = async (argv: string[]) => {
  const positional = argv.filter((a) => !a.startsWith('--'))
  const name = positional[0]
  const force = argv.includes('--force')
  if (!name) fail('Usage: worktree:rm <name> [--force]')

  const worktreePath = `${repoRoot}/../${name}`
  if (!(await pathExists(worktreePath))) fail(`../${name} does not exist.`)

  const metaPath = `${worktreePath}/.worktree-meta.json`
  const meta = (await pathExists(metaPath))
    ? JSON.parse(await Bun.file(metaPath).text())
    : null

  // stop the detached dev tree (negative pid = process group)
  if (meta?.devPid) {
    log(`Stopping dev (pid ${meta.devPid})`)
    try {
      process.kill(-meta.devPid, 'SIGTERM')
    } catch {
      // already gone
    }
  }

  // drop the isolated DB (FORCE terminates any lingering connections; pg 13+)
  if (meta?.isolated && typeof meta.dbName === 'string') {
    log(`Dropping isolated DB ${meta.dbName}`)
    await run(
      [
        'docker',
        'exec',
        DB_CONTAINER,
        'psql',
        '-U',
        'postgres',
        '-c',
        `DROP DATABASE IF EXISTS ${meta.dbName} WITH (FORCE)`,
      ],
      { allowFail: true }
    )
  }

  // Delete the runtime files we created so they can't block `git worktree
  // remove` as untracked-and-unignored (worktrees cut before the .gitignore
  // rule landed don't ignore them).
  for (const f of ['.worktree-meta.json', '.worktree-dev.log']) {
    await rm(`${worktreePath}/${f}`, { force: true })
  }

  log(`Removing worktree ../${name}`)
  const code = await run(
    ['git', 'worktree', 'remove', worktreePath, ...(force ? ['--force'] : [])],
    { allowFail: true }
  )
  if (code !== 0) {
    fail(
      `git worktree remove failed — ../${name} likely has uncommitted work. ` +
        `Re-run to discard it: bun run worktree:rm ${name} --force`
    )
  }
  console.log(
    `\n✓ removed ../${name}. Branch "${name}" kept (delete with: git branch -D ${name}).\n`
  )
}

// —— dispatch ————————————————————————————————————————————————————————————————

const [sub, ...rest] = process.argv.slice(2)
if (sub === 'new') await newWorktree(rest)
else if (sub === 'rm') await rmWorktree(rest)
else fail('Usage: worktree.ts <new|rm> …')
