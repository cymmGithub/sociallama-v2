/**
 * English `/case-studies` chrome — EN twin of `case-studies.ts`.
 * Voice: playful but clean, American spelling (user-approved 2026-07-22).
 */
import type { LocalizedCaseStudies } from '@/lib/content/case-studies'

export const caseStudiesListing = {
  metaTitle: 'Case studies',
  metaDescription:
    'Social Lama case studies — the real results of our social media work. Strategies, campaigns, and numbers for brands like iRobot, Pracuj.pl, and Volvo.',
  heading: 'Case studies',
  subhead:
    'How we work and what comes of it — selected Social Lama projects, with the numbers that describe them.',
  cardRead: 'VIEW CASE STUDY',
  empty: {
    title: 'Coming soon',
    text: "We're writing up our projects — check back shortly.",
  },
} satisfies LocalizedCaseStudies['caseStudiesListing']

export const caseStudyChrome = {
  breadcrumbAria: 'Breadcrumb',
  listingLabel: 'Case studies',
  sections: {
    client: 'Our client',
    challenge: 'The challenge',
    approach: 'Our approach',
    results: 'Results',
    gallery: 'Gallery',
  },
  cta: {
    eyebrow: 'Your move',
    title: "Let's build something like this for your brand",
    text: "Tell us about your challenge — we'll show you how we can help.",
    primary: 'Free consultation',
    secondary: 'See other case studies',
  },
} satisfies LocalizedCaseStudies['caseStudyChrome']
