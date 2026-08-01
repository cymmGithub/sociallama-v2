import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from '@playwright/test'

/**
 * The port `worktree:new` assigned to this checkout, or undefined in main.
 *
 * Resolved from the config file's own directory rather than `process.cwd()`,
 * so it holds however the suite was invoked.
 */
const worktreePort = (): string | undefined => {
  const meta = join(import.meta.dirname ?? process.cwd(), '.worktree-meta.json')
  if (!existsSync(meta)) return undefined
  try {
    const { port } = JSON.parse(readFileSync(meta, 'utf8'))
    return port ? String(port) : undefined
  } catch {
    // A hand-edited or truncated meta file falls back to the default rather
    // than taking the suite down.
    return undefined
  }
}

/**
 * Which server the suite drives.
 *
 * From a WORKTREE, defaulting to :3000 is actively dangerous:
 * `reuseExistingServer` means Playwright attaches to whatever already answers
 * on the port, so the suite silently exercises main's code and passes green
 * while the branch under test is never loaded. That used to require every
 * operator to remember `PLAYWRIGHT_PORT` — a safeguard that is opt-in and
 * fails silently is not a safeguard, so the worktree's own port is now picked
 * up automatically from `.worktree-meta.json`.
 *
 * Precedence: explicit env > this worktree's assigned port > :3000 (main).
 */
const PORT = process.env.PLAYWRIGHT_PORT ?? worktreePort() ?? '3000'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

/**
 * External-target (monitoring) mode: PLAYWRIGHT_BASE_URL points at a deployed
 * site rather than a server this config would boot. No webServer — the target
 * already exists and `CI=1` + a responding URL would otherwise be a startup
 * error. Retries and traces flip ON only here: locally and in CI flake is
 * signal about our code, but against a remote target it is mostly network
 * noise, and an unattended scheduled run needs an artifact to debug from.
 */
const EXTERNAL_TARGET = !/^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(
  BASE_URL
)

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  // Serial: every test shares ONE dev server, and the WebGL homepage +
  // full-page-scroll + axe tests starve each other's hydration when run in
  // parallel — client-effect assertions (data-theme, data-chrome, gsap
  // intros) then time out flakily. One worker keeps them deterministic.
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: EXTERNAL_TARGET ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: EXTERNAL_TARGET ? 'retain-on-failure' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      grepInvert: /@mobile/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
    // Curated mobile journeys only (@mobile) — desktop-authored specs assert
    // viewport-dependent chrome and are not re-run here (design D4).
    {
      name: 'mobile-chromium',
      grep: /@mobile/,
      use: {
        browserName: 'chromium',
        viewport: { width: 393, height: 852 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      },
    },
  ],
  ...(EXTERNAL_TARGET
    ? {}
    : {
        webServer: {
          command: 'bun run dev',
          url: BASE_URL,
          // `next dev` takes its port from the process env at launch, never from
          // .env.local (see lib/scripts/worktree.ts). Without this, starting a
          // server in a worktree boots it on :3000 while we wait on BASE_URL, and
          // the run dies on the 120s timeout instead of anything legible.
          env: { PORT },
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
})
