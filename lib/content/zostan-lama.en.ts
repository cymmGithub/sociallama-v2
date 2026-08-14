/**
 * English twin of `lib/content/zostan-lama.ts`, served at `/en/become-a-lama`.
 *
 * Every block is `satisfies LocalizedCareers['<key>']` — the parity gate, so a
 * missing or mis-shaped key fails the build while real translations compile.
 *
 * Role `id`s and benefit `icon` keys are NOT translated: the ids are the values
 * the form submits and the server action validates against, and the icon keys
 * index the section component's lucide map. Only human-facing text changes.
 */

import type { LocalizedCareers } from './zostan-lama'

// —— Page metadata ———————————————————————————————————————————————————————————

export const careersMeta = {
  title: 'Become a Lama',
  description:
    'Join the Social Lama herd — current openings in social media and performance marketing. Pick a role, send your CV, we reply within 7 days.',
} satisfies LocalizedCareers['careersMeta']

// —— Marquee hero ————————————————————————————————————————————————————————————

export const careersMarquee = {
  text: 'Become a Lama',
} satisfies LocalizedCareers['careersMarquee']

export const careersLede = {
  text: 'Currently hiring:',
} satisfies LocalizedCareers['careersLede']

// —— Open roles ——————————————————————————————————————————————————————————————

export const careersRolesLabel =
  'Open roles' satisfies LocalizedCareers['careersRolesLabel']

export const careersRoles = [
  {
    id: 'social-media-specialist',
    title: 'Social Media Specialist',
    seo: {
      title: 'Social Media Specialist — open role',
      description:
        'Open role: Social Media Specialist at Social Lama. Content, campaigns, client contact, 2+ years of experience. Send your CV — we reply within 7 days.',
    },
    blocks: [
      {
        head: "We're looking for someone who",
        items: [
          'makes content that grabs attention and gets people talking',
          'moves easily across every social platform and its quirks',
          'wants a workplace where relationships do the heavy lifting',
        ],
      },
      {
        head: "You'll be responsible for",
        items: [
          'designing and running campaigns that make people act',
          'delivering social projects in line with the agreed strategy',
          'day-to-day client contact and project budgeting',
          'reporting and analyzing what worked',
        ],
      },
      {
        head: 'What we expect',
        items: [
          'at least 2 years in social media — non-negotiable',
          'fluency in Reels and Instagram Stories, a soft spot for TikTok',
          'a very good pen and solid English',
          'nice to have: META certifications',
        ],
      },
    ],
  },
  {
    id: 'paid-social-media-specialist',
    title: 'Paid Social Media Specialist',
    seo: {
      title: 'Paid Social Media Specialist — open role',
      description:
        'Open role: Paid Social Media Specialist at Social Lama. Campaigns on Meta, TikTok and LinkedIn, optimization and reporting. Send your CV — we reply within 7 days.',
    },
    blocks: [
      {
        head: "We're looking for someone who",
        items: [
          'runs campaigns efficiently and still tests the untested',
          'keeps the client outcome in view at all times',
          'shares performance know-how with the rest of the team',
        ],
      },
      {
        head: "You'll be responsible for",
        items: [
          'running campaigns solo across TikTok, Facebook and LinkedIn',
          'monitoring performance and optimizing what underdelivers',
          'reports and recommendations for clients',
        ],
      },
      {
        head: 'What we expect',
        items: [
          'at least 2 years in performance marketing',
          'Meta, LinkedIn, TikTok, Pinterest and X Ads Manager',
          'genuinely strong analytical skills',
        ],
      },
    ],
  },
] satisfies LocalizedCareers['careersRoles']

export const careersShare = {
  title: 'Share this role',
  linkedin: 'Share “{title}” on LinkedIn',
  facebook: 'Share “{title}” on Facebook',
  copy: 'Copy link to this role',
  copied: 'Link copied',
} satisfies LocalizedCareers['careersShare']

// —— Benefits band ———————————————————————————————————————————————————————————

export const careersBenefits = {
  eyebrow: 'What you get',
  heading: 'Benefits we actually use',
  items: [
    {
      icon: 'heart-pulse',
      title: 'Private healthcare',
      text: 'Medicover or CMP — your pick',
    },
    {
      icon: 'activity',
      title: 'Multisport card',
      text: 'Because spitting far is not a full workout',
    },
    {
      icon: 'utensils',
      title: 'Wednesday lunch',
      text: 'The whole herd at one table',
    },
    {
      icon: 'clock',
      title: 'Fridays until 3:30 pm',
      text: 'Seven hours and the weekend starts',
    },
    {
      icon: 'languages',
      title: 'Language classes',
      text: 'We cover part of the course',
    },
    {
      icon: 'graduation-cap',
      title: 'Learning platform',
      text: 'Plus a budget for outside training',
    },
    {
      icon: 'lightbulb',
      title: 'Brainstorms',
      text: 'Creative sessions and in-house workshops',
    },
    {
      icon: 'trending-up',
      title: 'Real growth',
      text: '13 years on the market, inside a marketing group',
    },
  ],
} satisfies LocalizedCareers['careersBenefits']

// —— Application form ————————————————————————————————————————————————————————

export const careersForm = {
  eyebrow: 'Application',
  heading: 'Apply — boldly\nand creatively',
  lede: 'Can you behave yourself in a group? Does anyone actually like you online? Do you hold the record for long-distance spitting? …then you might just fit in.',
  fields: {
    name: { label: 'Full name', placeholder: 'Anna Kowalska' },
    email: { label: 'Email', placeholder: 'anna@example.com' },
    role: {
      label: 'Role',
      spontaneous: 'Speculative application',
    },
    message: {
      label: 'A few words about you',
      placeholder: 'What are you best at, and why us?',
    },
    cv: {
      label: 'Attach your CV',
      hint: 'PDF or DOCX, up to 5 MB',
    },
  },
  // Translations of the client-supplied Polish clauses — do not reword either
  // without asking (design D12).
  consent: {
    required: {
      label:
        'I consent to my personal data being stored and processed so that you can get back to me.',
    },
    marketing: {
      text: 'I consent to my personal data being stored and processed for marketing purposes, in line with our ',
      linkLabel: 'Privacy Policy',
      linkHref: '/polityka-prywatnosci',
    },
  },
  submit: {
    default: 'Send application',
    pending: 'Sending…',
    success: 'Sent!',
    error: 'Try again',
  },
  email: {
    subjectPrefix: 'Application',
    name: 'Full name',
    email: 'Email',
    role: 'Role',
    message: 'About',
    cv: 'CV',
    consent: 'Recruitment consent',
    marketing: 'Marketing consent',
    granted: 'granted',
    declined: 'not granted',
    none: '—',
  },
  messages: {
    success: 'Thanks! We’ll get back to you within 7 days.',
    error: 'We couldn’t send your application. Please try again in a moment.',
    security: 'Security verification failed. Please refresh the page.',
    rateLimit: 'Too many attempts. Wait a moment and try again.',
  },
  errors: {
    name: 'Please enter your full name.',
    email: 'Please enter a valid email address.',
    role: 'Please pick a role from the list.',
    message: 'Please write a few words about yourself.',
    consent: 'We can’t review your application without this consent.',
    cvRequired: 'Please attach your CV.',
    cvType: 'Your CV must be a PDF or DOCX file.',
    cvSize: 'That file is too large — 5 MB maximum.',
    fallback: 'Please fill in this field.',
    required: 'Required',
  },
} satisfies LocalizedCareers['careersForm']
