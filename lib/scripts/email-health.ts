/**
 * Email delivery health probe (design D4 of add-resend-email-delivery).
 *
 * Verifies, against the live Resend API, that form delivery still works:
 *   1. GET /domains — the domain of EMAIL_FROM must be `verified` in the
 *      account. Catches revoked keys and DNS drift without sending anything.
 *   2. POST /emails to `delivered@resend.dev` — Resend's official test sink:
 *      proves the send path end to end, reaches no human inbox, never touches
 *      domain reputation. Costs 1 of the 100/day free-tier quota.
 *
 * Needs a FULL-ACCESS key: step 1 reads /domains, which a sending-only key
 * (the app's) cannot. Zero imports on purpose: the CI job runs it with
 * checkout + bun and no `bun install`. Locally, pass the key per command —
 * `RESEND_API_KEY=… bun run email:health` — since a full-access key does not
 * belong in `.env.local`; the shell value wins over Bun's env-file loading.
 * Exits non-zero with a plain message per failure mode; the daily workflow
 * turns that into a GitHub failure notification.
 */

// Import-free files aren't modules, and top-level await requires one (TS1375).
export {}

const API = 'https://api.resend.com'

const apiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM

if (!(apiKey && emailFrom)) {
  console.error(
    '[email-health] RESEND_API_KEY and EMAIL_FROM must be set (env or .env.local)'
  )
  process.exit(1)
}

// EMAIL_FROM may be a bare address or the `Name <addr>` form.
const address = emailFrom.match(/<([^>]+)>/)?.[1] ?? emailFrom
const domain = address.trim().split('@')[1]
if (!domain) {
  console.error(
    `[email-health] cannot extract a domain from EMAIL_FROM: ${emailFrom}`
  )
  process.exit(1)
}

// --- 1. Domain verification status --------------------------------------

const domainsRes = await fetch(`${API}/domains`, {
  headers: { Authorization: `Bearer ${apiKey}` },
})
if (!domainsRes.ok) {
  console.error(
    `[email-health] GET /domains failed (${domainsRes.status}): ${await domainsRes.text()}`
  )
  process.exit(1)
}

const domains = (await domainsRes.json()) as {
  data?: { name?: string; status?: string }[]
}
const entry = domains.data?.find((d) => d.name === domain)
if (!entry) {
  console.error(
    `[email-health] domain "${domain}" (from EMAIL_FROM) is not in the Resend account`
  )
  process.exit(1)
}
if (entry.status !== 'verified') {
  console.error(
    `[email-health] domain "${domain}" is "${entry.status}", expected "verified" — check its DNS records in Resend`
  )
  process.exit(1)
}

// --- 2. Real send to the test sink ---------------------------------------

const sendRes = await fetch(`${API}/emails`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: emailFrom,
    to: 'delivered@resend.dev',
    subject: 'sociallama.pl email health probe',
    text: 'Automated delivery check — see .github/workflows/email-health.yml',
  }),
})
if (!sendRes.ok) {
  console.error(
    `[email-health] test send failed (${sendRes.status}): ${await sendRes.text()}`
  )
  process.exit(1)
}

console.log(
  `[email-health] ok — "${domain}" verified, test send from ${address} accepted`
)
