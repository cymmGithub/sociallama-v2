import { defineConfig } from '@playwright/test'

/**
 * Which server the suite drives.
 *
 * Defaults to :3000, the main checkout's dev server. From a WORKTREE that
 * default is actively dangerous: `reuseExistingServer` means Playwright
 * attaches to whatever already answers on the port, so a worktree's suite
 * silently exercises main's code and passes green while the branch under test
 * is never loaded. Set `PLAYWRIGHT_PORT` to the worktree's own port (the one
 * `worktree:new` assigned) to test the code you are actually changing.
 */
const PORT = process.env.PLAYWRIGHT_PORT ?? '3000'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

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
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
