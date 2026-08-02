/**
 * Unit tests for fetch utilities
 *
 * Tests fetchWithTimeout -- a wrapper function that adds timeout protection
 * to the native fetch API.
 *
 * Run with: bun test lib/utils/fetch.test.ts
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { fetchWithTimeout } from './fetch'

/**
 * A minimal local HTTP server for testing fetch behavior without mocks.
 * Serves JSON, delayed responses, and error status codes.
 */
let server: ReturnType<typeof Bun.serve>
let baseURL: string

beforeAll(() => {
  server = Bun.serve({
    port: 0, // random available port
    fetch(req) {
      const url = new URL(req.url)

      if (url.pathname === '/json') {
        return new Response(JSON.stringify({ message: 'hello', count: 42 }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (url.pathname === '/text') {
        return new Response('plain text', {
          headers: { 'Content-Type': 'text/plain' },
        })
      }

      if (url.pathname === '/slow') {
        // Delay 2 seconds
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(JSON.stringify({ delayed: true }), {
                  headers: { 'Content-Type': 'application/json' },
                })
              ),
            2000
          )
        )
      }

      if (url.pathname === '/error-500') {
        return new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        })
      }

      if (url.pathname === '/echo-method') {
        return new Response(JSON.stringify({ method: req.method }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response('Not Found', { status: 404 })
    },
  })

  baseURL = `http://localhost:${server.port}`
})

afterAll(() => {
  server.stop()
})

describe('fetchWithTimeout', () => {
  it('should successfully fetch a response', async () => {
    const response = await fetchWithTimeout(`${baseURL}/json`)
    expect(response.ok).toBe(true)
    expect(response.status).toBe(200)
  })

  it('should parse JSON from response', async () => {
    const response = await fetchWithTimeout(`${baseURL}/json`)
    const data = (await response.json()) as { message: string; count: number }
    expect(data.message).toBe('hello')
    expect(data.count).toBe(42)
  })

  it('should use default timeout of 10000ms (not abort fast requests)', async () => {
    // This should succeed well within the default 10s timeout
    const response = await fetchWithTimeout(`${baseURL}/json`)
    expect(response.ok).toBe(true)
  })

  it('should abort when timeout is exceeded', async () => {
    await expect(
      fetchWithTimeout(`${baseURL}/slow`, { timeout: 100 })
    ).rejects.toThrow()
  })

  it('should pass through fetch options like method', async () => {
    const response = await fetchWithTimeout(`${baseURL}/echo-method`, {
      method: 'POST',
    })
    const data = (await response.json()) as { method: string }
    expect(data.method).toBe('POST')
  })

  it('should respect an external AbortSignal that fires after creation', async () => {
    const controller = new AbortController()

    // Abort after a brief delay (the implementation listens for the abort event,
    // so the signal must not be pre-aborted -- it needs to fire the event)
    const promise = fetchWithTimeout(`${baseURL}/slow`, {
      signal: controller.signal,
      timeout: 30000, // long timeout so only the signal causes abort
    })

    // Abort shortly after the request starts
    setTimeout(() => controller.abort(), 50)

    await expect(promise).rejects.toThrow()
  })

  it('should return non-ok responses without throwing', async () => {
    const response = await fetchWithTimeout(`${baseURL}/error-500`)
    expect(response.ok).toBe(false)
    expect(response.status).toBe(500)
  })
})
