/**
 * English `/kontakt` (Contact) content — EN twin of `contact.ts`.
 *
 * Each block `satisfies LocalizedContact['<key>']` (design D2). Only labels,
 * copy, and the privacy-link href differ from the Polish module.
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

export const contactForm = {
  fields: {
    name: { label: 'Name', placeholder: 'What should we call you?' },
    email: { label: 'Email', placeholder: 'you@address.com' },
    phone: {
      label: 'Phone',
      optional: 'optional',
      placeholder: "Leave a number, we'll call back.",
    },
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
  consent: {
    text: 'I consent to the processing of my personal data so that Social Lama can reply to this message.',
  },
  marketingConsent: {
    text: 'I consent to my personal data being stored and processed for marketing purposes, in line with our ',
    linkLabel: 'Privacy Policy',
    linkHref: '/en/privacy-policy',
  },
  email: {
    subjectPrefix: 'New message from the form',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    consent: 'Consent (GDPR)',
    marketing: 'Marketing consent',
    granted: 'granted',
    declined: 'not granted',
    consentBody: 'Text of the granted consents',
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
    consent: 'We need your consent before we can reply.',
    fallback: 'Please fill in this field.',
    required: 'Required',
  },
} satisfies LocalizedContact['contactForm']

export const contactMetricsHead =
  'A few numbers on what we do for brands:' satisfies LocalizedContact['contactMetricsHead']

export const contactMetrics = [
  { value: '514,000', caption: 'engaged fans' },
  { value: '528', caption: 'campaigns run' },
  { value: '80', caption: 'happy clients' },
  { value: '7,260,000', caption: 'reach on Facebook' },
] satisfies LocalizedContact['contactMetrics']
