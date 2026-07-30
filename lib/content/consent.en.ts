/**
 * English twin of `lib/content/consent.ts` (add-cookie-consent).
 *
 * Each block `satisfies LocalizedConsent['<key>']`, so a key added on one side
 * and not the other fails the type check rather than review. Cookie names and
 * `privacyHref` values are identifiers, not copy — they are identical to the
 * Polish module by design, and the e2e suite checks both locales against the
 * same observed cookie set.
 */

import type { LocalizedConsent } from '@/lib/content/consent'

// —— Banner ——————————————————————————————————————————————————————————————————

export const consentBanner = {
  regionLabel: 'Cookie consent',
  headingBefore: 'How about some',
  headingIcon: 'cookies',
  headingAfter: '?',
  body: 'We use cookies for essential functions and to better understand how you use Social Lama, so we can make this site better for you.',
  // "all" is kept in English where Polish drops it: "Akceptuję" is already an
  // unambiguous first-person verb, while a bare "Accept" leaves open what is
  // being accepted. The equal-track grid makes the length difference free.
  acceptAll: 'Accept all',
  rejectAll: 'Reject all',
  settings: 'Settings',
} satisfies LocalizedConsent['consentBanner']

// —— Settings panel ——————————————————————————————————————————————————————————

export const consentSettings = {
  title: 'Cookie settings',
  intro:
    'Choose which cookies we may use. Necessary ones are always on — without them the site does not work. We will remember your choice for 12 months, and you can change it whenever you like.',
  save: 'Save choice',
  close: 'Close',
  alwaysOn: 'Always on',
  vendorPolicy: 'Privacy policy',
} satisfies LocalizedConsent['consentSettings']

export const consentTable = {
  category: 'Category',
  vendor: 'Provider',
  cookie: 'Cookie',
  purpose: 'Purpose',
  retention: 'Retention',
} satisfies LocalizedConsent['consentTable']

// —— Withdrawal trigger ——————————————————————————————————————————————————————

export const consentTrigger =
  'Cookie settings' satisfies LocalizedConsent['consentTrigger']

// —— Categories ——————————————————————————————————————————————————————————————

export const consentCategories = [
  {
    id: 'necessary',
    name: 'Necessary',
    required: true,
    purpose:
      'Needed to make the site work and to remember what you decided about cookies. These cannot be switched off.',
    vendors: [
      {
        name: 'Social Lama',
        provider: 'Good One sp. z o.o.',
        purpose: 'Remembers which cookie categories you chose.',
        privacyHref: '/en/privacy-policy',
        cookies: [
          {
            name: 'sl_consent',
            purpose:
              'The categories you chose, when you chose them, and the vendor-list version you chose against.',
            retention: '12 months',
          },
        ],
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    required: false,
    purpose:
      'These show us which stories get read and how people find the site. We read the numbers in aggregate, not to recognize individual people.',
    vendors: [
      {
        name: 'Google Analytics 4',
        provider: 'Google Ireland Limited',
        purpose:
          'Visit statistics: how many people come, where they come from, which pages they read.',
        privacyHref: 'https://policies.google.com/privacy',
        cookies: [
          {
            name: '_ga',
            purpose: 'Tells one visitor apart from another.',
            retention: '2 years',
          },
          {
            name: '_ga_*',
            purpose:
              'Keeps measurement session state (the suffix is the property id).',
            retention: '2 years',
          },
        ],
      },
    ],
  },
] satisfies LocalizedConsent['consentCategories']
