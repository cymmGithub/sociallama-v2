/**
 * English service list + page content — the EN twin of `uslugi.ts`.
 *
 * Each export `satisfies LocalizedUslugi['<key>']`, so a missing or mis-shaped
 * translation fails the build (the parity gate). Order, section sequences,
 * icons, cube/dashboard assets, and case-study slugs mirror the Polish module;
 * `slug` holds the clean English form under `/en/services/*`, `pairSlug` the
 * Polish slug, and `id` the stable locale-neutral key (= the Polish slug).
 * Voice: playful but clean, American spelling (established EN locale voice).
 *
 * Section sequences mirror `uslugi.ts` with one deliberate exception: Strategia
 * omits the `posts` section, because the blog is Polish-only and there is
 * nothing for it to link to. The client's copy documents are Polish-only too,
 * so the English text follows the locale voice rather than a source translation.
 */

import type { LocalizedUslugi } from '@/lib/content/uslugi'

// —— Shared chrome copy ————————————————————————————————————————————————————————

export const chrome = {
  sectionLabel: 'SERVICES',
  relatedKicker: 'READ NEXT',
  proofCta: 'VIEW CASE STUDY',
  partnerKicker: 'PART OF THE GOOD ONE GROUP',
  ctaHeadline: "Let's do this together",
  ctaText: "Tell us about your challenge — we'll show you how we can help.",
  ctaButton: "Let's talk about your business",
  ctaHref: '/en/contact',
  index: {
    title: 'Services',
    intro:
      'From strategy to sales — the full spectrum of social media work. Pick the area where we can help your brand.',
    cardCta: 'Learn more',
  },
} satisfies LocalizedUslugi['chrome']

// —— Canonical list (same order + sequences as uslugi.ts) ——————————————————————

export const SERVICES = [
  // 1 — Strategy
  {
    id: 'strategia',
    slug: 'strategy',
    pairSlug: 'strategia',
    label: 'Strategy',
    meta: {
      title: 'Social media strategy',
      description:
        'We build a data-driven social media communication strategy — from the audit and target audience to measurable goals and rollout.',
    },
    summary:
      'The starting point of every partnership — a plan built on data, not on a hunch.',
    sections: [
      {
        kind: 'hero',
        title: 'Strategy',
        intro:
          "Effective social media communication doesn't begin with a post, an ad campaign, or picking an influencer — it begins with strategy. Strategy is what settles who the brand is talking to, what it wants to achieve, and what sets it apart from the competition. We build social and digital strategy for brands that want to work deliberately, consistently, and for the long haul.",
      },
      {
        kind: 'triptych',
        kicker: 'WHAT YOU GET',
        items: [
          {
            icon: 'Compass',
            title: 'A clear direction',
            body: 'Strategy puts communication in order and sets the priorities. The team knows which work supports the brand goals — and which merely fills the calendar.',
          },
          {
            icon: 'MessageSquare',
            title: 'Consistent communication',
            body: 'Audiences expect brands to be consistent. We settle one way of speaking across every channel, whatever the format or the platform.',
          },
          {
            icon: 'Wallet',
            title: 'A budget that works harder',
            body: 'Planned work means fewer bets that miss. We point to the channels and formats that will return the most business value.',
          },
          {
            icon: 'BarChart3',
            title: 'Measurable results',
            body: 'Every strategy carries concrete goals and performance indicators, so results can be assessed rather than merely debated.',
          },
        ],
      },
      {
        kind: 'checklist',
        kicker: 'SCOPE',
        heading: "What's in a strategy?",
        intro:
          'Every strategy is built from scratch — around the brand, its business goals, and what it needs to say. Depending on the project, the document covers things like:',
        items: [
          'Brand, market, and competitor analysis',
          'A profile of the target audience',
          'Communication goals',
          'Tone of voice and content pillars',
          'Recommended communication activity',
        ],
        backdrop: {
          src: '/clips/strategia-zakres.mp4',
          mobileSrc: '/clips/strategia-zakres-mobile.mp4',
          poster: '/clips/strategia-zakres-poster.jpg',
          alt: 'A team working through strategy materials at a table',
        },
      },
      {
        kind: 'timeline',
        kicker: 'PROCESS',
        heading: 'How it works',
        steps: [
          {
            title: 'Workshop',
            body: 'Every project starts with a conversation. We get to know the brand, its goals, its challenges, and what it expects from marketing.',
          },
          {
            title: 'Analysis',
            body: 'We study the market, the competition, the communication so far, and how audiences behave. We gather the data and draw conclusions from it.',
          },
          {
            title: 'Recommendations',
            body: 'On that basis we prepare strategic recommendations — communication, content, channels, and advertising.',
          },
          {
            title: 'Presentation',
            body: 'We walk you through the finished strategy in a meeting, explain the recommendations, answer questions, and agree the next steps.',
          },
        ],
      },
      {
        kind: 'banner',
        heading: 'Just the strategy? That works too.',
        body: "Most often we deliver strategy alongside the rollout, but we'll happily prepare the document on its own — for companies with an in-house marketing team, or brands that want a second opinion on their current direction. We'll quote to the scope of the project.",
        cta: { label: 'Ask for a strategy quote', href: '/en/contact' },
      },
      // No `posts` section: the blog is Polish-only, so there is nothing to
      // link to here. No `proof` section either — see the note in uslugi.ts.
    ],
  },

  // 2 — Content
  {
    id: 'content',
    slug: 'content',
    pairSlug: 'content',
    label: 'Content',
    meta: {
      title: 'Content & social media management',
      description:
        'We run brands on seven platforms — Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, YouTube. Content tailored to every channel.',
    },
    summary:
      'Running your profiles with content tailored to the quirks of each platform.',
    sections: [
      {
        kind: 'hero',
        title: 'Content',
        intro:
          'Every platform plays by its own rules — a different format, a different language, a different audience. We craft content tuned to each channel and build a consistent brand presence right where your audience already is.',
      },
      {
        kind: 'platforms',
        items: [
          {
            platform: 'facebook',
            name: 'Facebook',
            copy: 'We build community and keep a steady line to your audience — from engaging posts to community management and group conversations.',
            cube: '/assets/cube-facebook-70862a.png',
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'An aesthetic feed, reels, and stories that build desire around the brand. We pair a consistent look with formats that drive reach.',
            cube: '/assets/cube-instagram.png',
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'Short video, trends, and real-time marketing. We make content that speaks the language of the platform and genuinely spreads.',
            cube: '/assets/cube-tiktok.png',
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Fast, reactive communication and building an expert brand voice in real time.',
            cube: '/assets/cube-x-5d9863.png',
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Expert personal branding and B2B communication that builds authority and real business relationships.',
            cube: '/assets/cube-linkedin.png',
          },
          {
            platform: 'pinterest',
            name: 'Pinterest',
            copy: 'Content that lives long and drives traffic — inspiration, how-tos, and visual collections built around search intent.',
            cube: '/assets/cube-pinterest-6e33ed.png',
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Long and short video that build subscribers and position the brand as a source of knowledge in its category.',
            cube: '/assets/cube-youtube.png',
          },
        ],
      },
    ],
  },

  // 3 — Sales
  {
    id: 'sprzedaz',
    slug: 'sales',
    pairSlug: 'sprzedaz',
    label: 'Sales',
    meta: {
      title: 'Social media that sells',
      description:
        'We run social media built for sales. We measure success not in likes but in your business results — backed by hard campaign data.',
    },
    summary:
      'Selling on social — campaigns on Facebook, Instagram, and TikTok, judged on results.',
    sections: [
      {
        kind: 'hero',
        title: 'Sales',
        intro:
          "As we build your brand's offer, we make sure communication does its most important job: selling products or services. We measure our work not only by social media metrics, but above all by the success of your business.",
      },
      {
        kind: 'triptych',
        kicker: 'HOW WE SELL',
        items: [
          {
            icon: 'Target',
            title: 'Goal',
            body: 'We start from a concrete business goal — sales, leads, traffic — and shape the whole of communication around it.',
          },
          {
            icon: 'ShoppingCart',
            title: 'Campaign',
            body: 'We combine organic content with paid campaigns, reaching the right people at the right moment in the buying journey.',
          },
          {
            icon: 'BarChart3',
            title: 'Result',
            body: 'We measure, optimize, and report. What counts is what happens after the click — not reach for its own sake.',
          },
        ],
      },
      {
        kind: 'platforms',
        items: [
          {
            platform: 'facebook',
            name: 'Meta Ads',
            copy: 'Sales campaigns across the Meta ecosystem — precise targeting held to account for real conversion.',
            dashboard: {
              src: '/assets/sprzedaz-meta-ads.png',
              alt: 'Meta Ads Manager — sales campaign results',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Growth in impressions and engagement turned into traffic and brand awareness.',
            dashboard: {
              src: '/assets/sprzedaz-x.png',
              alt: 'X analytics — growth in impressions and engagement',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'View and follower stats that climb alongside the reach of sales-focused video campaigns.',
            dashboard: {
              src: '/assets/sprzedaz-tiktok.png',
              alt: 'TikTok Studio — view and follower statistics',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Growth in views and subscribers that builds a lasting brand presence in video.',
            dashboard: {
              src: '/assets/sprzedaz-youtube.png',
              alt: 'YouTube channel statistics — growth in views',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Growth in company-page visits and followers that translates into B2B relationships.',
            dashboard: {
              src: '/assets/sprzedaz-linkedin.png',
              alt: 'LinkedIn page analytics — growth in visits and followers',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'Growth in reach and followers that turns attention into real traffic to your site.',
            dashboard: {
              src: '/assets/sprzedaz-instagram.png',
              alt: 'Instagram statistics — growth in reach and followers',
              width: 900,
              height: 1117,
            },
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'Results that speak for themselves',
        cases: [
          {
            slug: 'irobot',
            logo: '/case-studies/irobot/irobot-logo.png',
            kicker: 'CASE STUDY',
            brand: 'iRobot',
            title:
              'Humor and education that build a brand on YouTube and TikTok',
          },
        ],
      },
      {
        kind: 'banner',
        heading: 'Looking for SEO and Google campaigns?',
        body: 'Search is SEOFly territory — our sibling agency in the Good One Group. Social selling lives here; visibility and campaigns in Google live there.',
        cta: {
          label: 'See ad campaigns',
          href: '/en/services/ad-campaigns',
        },
      },
    ],
  },

  // 4 — Ad campaigns
  {
    id: 'kampanie-reklamowe',
    slug: 'ad-campaigns',
    pairSlug: 'kampanie-reklamowe',
    label: 'Ad campaigns',
    meta: {
      title: 'SEO and Google Ads — ad campaigns',
      description:
        'SEO, Google Ads campaigns, SEO audits, websites, and analytics & reporting. We run search and performance with SEOFly — an agency in the Good One Group.',
    },
    summary:
      'Visibility in search — SEO, Google Ads, and websites, together with SEOFly.',
    sections: [
      {
        kind: 'hero',
        title: 'Ad campaigns',
        intro:
          'Visibility in search, campaigns in Google, and websites built to hit business goals. We grow the SEO and performance side together with SEOFly — our sibling agency in the Good One Group. From rankings and audits, through content written for search, to analytics and reporting.',
      },
      {
        kind: 'triptych',
        kicker: 'WHAT WE DO',
        unnumbered: true,
        items: [
          {
            icon: 'Search',
            title: 'SEO',
            body: 'We grow brand visibility in Google, reaching people at the exact moment they go looking for a product or service. We back the work that turns into real traffic and real business results.',
          },
          {
            icon: 'MousePointerClick',
            title: 'Ads',
            body: 'We run Google Ads campaigns that support sales, generate leads, and build brand awareness. We match the work to your business goals and keep optimizing as it runs.',
          },
          {
            icon: 'PenTool',
            title: 'Content marketing',
            body: "We create content written for search — the kind that builds a brand's authority and answers what people actually need at every stage of the buying journey.",
          },
          {
            icon: 'ClipboardCheck',
            title: 'SEO audits',
            body: 'We analyze websites, pinpoint what needs fixing, and hand over concrete recommendations that lift visibility and make the work more effective.',
          },
          {
            icon: 'Globe',
            title: 'Websites',
            body: 'We design and build modern websites that not only look the part, but above all hit business goals and help bring in customers.',
          },
          {
            icon: 'BarChart3',
            title: 'Analytics & reporting',
            body: 'We measure the results and read the data, so marketing decisions land. Regular reporting is what lets us keep developing and optimizing the work.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'seofly',
        name: 'SEOFly',
        logo: '/assets/seofly-logo-light.png',
        copy: 'Good marketing does not stop at one channel — which is why we joined forces with SEOFly, an agency built around SEO and performance marketing. Social Lama handles strategy, content, and social media; SEOFly grows brand visibility in search and runs performance campaigns. Both belong to the Good One Group, so the competencies — social, SEO and performance, PR, influencer marketing, employer branding — all sit in one place. One partner. Many competencies. BETTER WORKS.',
        href: '/en/contact',
        video: {
          src: '/clips/seofly-cover.mp4',
          mobileSrc: '/clips/seofly-cover-mobile.mp4',
          poster: '/clips/seofly-cover-poster.jpg',
          alt: 'Working at a laptop on search results',
        },
      },
    ],
  },

  // 5 — Creative & Video
  {
    id: 'kreacje-wideo',
    slug: 'creative-video',
    pairSlug: 'kreacje-wideo',
    label: 'Creative & Video',
    meta: {
      title: 'Graphic creative & video',
      description:
        'Graphics, video, reels, and animation — the full spectrum of social media creative. Deep video and copywriting resources, tuned to the trends.',
    },
    summary:
      'The full spectrum of creative — from graphics and copy to video and animation.',
    sections: [
      {
        kind: 'hero',
        title: 'Creative & Video',
        intro:
          'Graphics, carousels, infographics, reels, animation, visualizations — deep video and copywriting resources let us offer the full spectrum of social media creative. We keep the messages varied and tuned to the trends and preferences of your audience.',
      },
      {
        kind: 'triptych',
        kicker: 'WHAT WE MAKE',
        items: [
          {
            icon: 'PenTool',
            title: 'Graphic support',
            body: 'Posts, carousels, infographics, and key visuals — a consistent visual system that sets the brand apart in the feed.',
          },
          {
            icon: 'Video',
            title: 'Video production',
            body: 'From concept through shoot to edit. Reels, ads, and native formats filmed with the platform in mind.',
          },
          {
            icon: 'Sparkles',
            title: 'Animation',
            body: 'Motion design and animation that give brands movement — from simple bumpers to full-scale visualizations.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'diea',
        name: 'Diea',
        logo: '/assets/diea-logo-light.png',
        tagline: 'from idea to Design',
        copy: 'Our biggest video productions are made with DIEA — a production studio from the Good One group. Full equipment and production resources let us take on projects of any scale.',
        href: '/en/contact',
        video: {
          src: '/clips/diea-showreel.mp4',
          mobileSrc: '/clips/diea-showreel-mobile.mp4',
          poster: '/clips/diea-showreel-poster.jpg',
          alt: 'DIEA 2025 video showreel — advertising, event, and product work',
        },
      },
    ],
  },

  // 6 — Audit & consulting
  {
    id: 'audyt-i-konsultacje',
    slug: 'audit-consulting',
    pairSlug: 'audyt-i-konsultacje',
    label: 'Audit & consulting',
    meta: {
      title: 'Social media audit & consulting',
      description:
        'An audit of your social media presence and strategic consulting. Concrete findings and recommendations you can put to work right away.',
    },
    summary:
      'An outside look at your communication — concrete findings and recommendations.',
    sections: [
      {
        kind: 'hero',
        title: 'Audit & consulting',
        intro:
          'Need to check whether your social media work is actually paying off, or run an idea past an expert? We analyze your profile, point out the strengths and the places that need work, and walk you through concrete recommendations and next steps in a one-on-one consultation.',
        cta: { label: 'Book a consultation', href: '/en/contact' },
      },
      {
        kind: 'checklist',
        kicker: 'SCOPE',
        heading: "What's included?",
        intro:
          "You don't always need a new strategy — sometimes a fresh expert perspective is enough. We analyze the brand's social profiles, review the communication, content, results, and advertising, then talk the findings through with you one to one.",
        items: [
          'Analysis of your social media profiles',
          'An assessment of communication strategy and content',
          'Analysis of advertising activity',
          'The strengths and the areas that need work, named',
          'Practical recommendations you can act on',
          'A 45-minute online consultation with a Social Lama specialist',
        ],
      },
      {
        kind: 'logoStrip',
        heading: 'We audit profiles on:',
        logos: [
          { name: 'Facebook', icon: 'facebook' },
          { name: 'Instagram', icon: 'instagram' },
          { name: 'LinkedIn', icon: 'linkedin' },
          { name: 'TikTok', icon: 'tiktok' },
          { name: 'Pinterest', icon: 'pinterest' },
          { name: 'YouTube', icon: 'youtube' },
        ],
      },
      {
        kind: 'banner',
        heading: 'Book an online consultation',
        body: "Got a question, need a second opinion, or want to talk through the challenges facing your brand? Book a 45-minute online consultation with a Social Lama specialist — we'll look at your situation together, answer your questions, and point to the best way forward.",
        cta: { label: 'Ask about a slot', href: '/en/contact' },
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'We know what to look for',
        cases: [
          {
            slug: 'volvo',
            logo: '/case-studies/volvo/volvo-logo.png',
            kicker: 'CASE STUDY',
            brand: 'Volvo',
            title: 'Building the brands on LinkedIn, Facebook, and Instagram',
          },
        ],
      },
    ],
  },

  // 7 — Influencer marketing
  {
    id: 'influencer-marketing',
    slug: 'influencer-marketing',
    pairSlug: 'influencer-marketing',
    label: 'Influencer marketing',
    meta: {
      title: 'Influencer marketing',
      description:
        'Influencer marketing campaigns — creator selection, partnership strategy, and delivery. Authentic content that builds reach and trust.',
    },
    summary:
      'Creator campaigns — from picking the right influencers to delivery and reporting.',
    sections: [
      {
        kind: 'hero',
        title: 'Influencer marketing',
        intro:
          'Influencer marketing lets brands build credibility, engage audiences, and reach new target groups that ads alone rarely touch. We shape campaigns around your business goals — from awareness through education to sales support — and run the whole thing with creators end to end: strategy, influencer selection, campaign coordination, and analysis of the results.',
      },
      {
        kind: 'triptych',
        kicker: 'HOW WE WORK',
        items: [
          {
            icon: 'Users',
            title: 'Creator selection',
            body: 'We pick influencers by brand fit and real community engagement — not by follower count alone.',
          },
          {
            icon: 'Megaphone',
            title: 'Campaign',
            body: 'We shape the partnership strategy, brief the creators, and make sure the content is authentic and on-brand.',
          },
          {
            icon: 'HeartHandshake',
            title: 'Relationships',
            body: 'We build long-term relationships with creators — recurring collaborations work better than one-off pushes.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'folks',
        name: 'Folks',
        logo: '/assets/folks-logo-light.png',
        tagline: 'from creators to results',
        copy: 'Effective influencer marketing is a great deal more than a one-off post from a creator — which is why we joined forces with Folks, an agency built around authentic relationships between brands and the people who follow them. Both of us belong to the Good One Group, so social media, strategy, content, and influencer marketing all sit under one roof: a wide creator network, seasoned specialists, and full campaign management — from the first idea to the final report. One partner. Many capabilities. BETTER WORKS.',
        href: '/en/contact',
        video: {
          src: '/clips/folks-cover.mp4',
          mobileSrc: '/clips/folks-cover-mobile.mp4',
          poster: '/clips/folks-cover-poster.jpg',
          alt: 'Content creator filming with a ring light',
        },
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'Creators who deliver',
        cases: [
          {
            slug: 'pracuj-pl',
            logo: '/case-studies/pracuj-pl/pracuj-pl-logo.png',
            kicker: 'CASE STUDY',
            brand: 'Pracuj.pl',
            title: 'Humor, creators, and an AR filter on TikTok',
          },
        ],
      },
    ],
  },
] satisfies LocalizedUslugi['services']

// —— Derived navigation ————————————————————————————————————————————————————————

export const serviceNav = SERVICES.map((service) => ({
  label: service.label,
  href: `/en/services/${service.slug}`,
}))

/** Lookup by this-locale (English) slug. Returns the widened EN service. */
export function findService(slug: string) {
  return SERVICES.find((service) => service.slug === slug)
}
