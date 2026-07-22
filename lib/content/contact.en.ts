/**
 * English `/kontakt` (Contact) content — EN twin of `contact.ts`.
 *
 * Each block `satisfies LocalizedContact['<key>']` (design D2). Service `value`s
 * are locale-independent (they key the email + schema) and kept identical to the
 * Polish module; only labels, copy, and the privacy-link href differ.
 *
 * Voice: playful but clean, American spelling (user-approved 2026-07-22).
 */
import type { LocalizedContact } from '@/lib/content/contact'

export const contactMeta = {
  title: 'Contact',
  description:
    "Let's talk about your business. Write to Social Lama — social media, campaigns, video, strategy, and collaboration. We reply fast.",
} satisfies LocalizedContact['contactMeta']

export const contactMarquee = {
  fill: "Let's talk",
  outline: 'about your business',
} satisfies LocalizedContact['contactMarquee']

export const contactLede = {
  text: 'Got an idea or a brand to get rolling? Drop us a few words and ',
  cta: 'book a free consultation',
} satisfies LocalizedContact['contactLede']

export const contactStepsHead =
  "What's next?" satisfies LocalizedContact['contactStepsHead']

export const contactSteps = [
  { step: '1', title: 'You write', text: 'A few words is plenty.' },
  { step: '2', title: 'We reply', text: 'Within 24h, on business days.' },
  {
    step: '3',
    title: 'We talk specifics',
    text: 'Ideas, scope, next steps.',
  },
] satisfies LocalizedContact['contactSteps']

export const contactServices = [
  { label: 'Social media', value: 'social-media' },
  { label: 'Campaigns', value: 'kampanie' },
  { label: 'Video', value: 'wideo' },
  { label: 'Strategy', value: 'strategia' },
  { label: 'Collaboration', value: 'wspolpraca' },
] satisfies LocalizedContact['contactServices']

export const contactForm = {
  fields: {
    name: { label: 'Name', placeholder: 'What should we call you?' },
    email: { label: 'Email', placeholder: 'you@address.com' },
    phone: {
      label: 'Phone',
      optional: 'optional',
      placeholder: 'Prefer a callback? Leave your number.',
    },
    services: { label: "What's it about?", optional: 'optional' },
    message: {
      label: 'Your message',
      placeholder: 'Tell us a bit about your project.',
    },
  },
  submit: {
    default: 'Book a free consultation',
    pending: 'Sending…',
    success: 'Sent!',
    error: 'Try again',
  },
  note: 'We reply within 24h, on business days.',
  privacyNote: {
    text: "We'll only use your details to reply to your message (and call you back if you leave a number).",
    linkLabel: 'Privacy Policy',
    linkHref: '/en/privacy-policy',
  },
  email: {
    subjectPrefix: 'New message from the form',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    services: 'Interests',
    message: 'Message',
    none: '—',
  },
  messages: {
    success: "Thanks! We'll get back to you as soon as we can.",
    error: "We couldn't send your message. Please try again in a moment.",
    security: 'Security verification failed. Please refresh the page.',
    rateLimit: 'Too many attempts. Wait a moment and try again.',
  },
  errors: {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    message: 'Please write a message.',
    fallback: 'Please fill in this field.',
    required: 'Required',
  },
} satisfies LocalizedContact['contactForm']

export const contactMetricsHead =
  'A few numbers on what we do for brands:' satisfies LocalizedContact['contactMetricsHead']

export const contactMetrics = [
  { value: '500,000', caption: 'engaged fans' },
  { value: '528', caption: 'campaigns run' },
  { value: '80', caption: 'happy clients' },
  { value: '7,000,000', caption: 'reach on Facebook' },
] satisfies LocalizedContact['contactMetrics']
