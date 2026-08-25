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

import { STARTING_PRICE } from '@/lib/content/pricing'
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
            link: {
              label: 'Looking for Meta or TikTok? See Sales',
              href: '/en/services/sales',
            },
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
        copy: [
          'Good marketing does not stop at one channel. A brand that owns social can still be invisible to someone typing its product into Google — which is why we joined forces with SEOFly, an agency built around SEO and performance marketing.',
          'For a brand that means one team instead of two agencies to coordinate, one brief instead of explaining the strategy a second time, and one place where every capability in the Good One Group meets — social, SEO and performance, PR, influencer marketing, employer branding.',
          'One partner. Many capabilities. BETTER WORKS.',
        ],
        split: {
          partner: {
            label: 'SEOFly',
            items: [
              'SEO and visibility in Google',
              'Google Ads campaigns',
              'Websites',
              'Analytics and reporting',
            ],
          },
          lama: {
            label: 'Social Lama',
            items: [
              'Communication strategy',
              'Content and profile management',
              'Paid social campaigns',
              'Influencer marketing',
            ],
          },
        },
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
      // Mirrors the Polish title's new shape so the pair describes one page.
      // Not a keyword play: EN gets parity content, not search targeting.
      title: 'Social media audit — profile analysis and consulting',
      description:
        'An audit of your social media presence: profiles, communication, content, and advertising. Concrete findings, recommendations you can put to work right away, and a session with a specialist.',
    },
    summary:
      'An outside look at your communication — concrete findings and recommendations.',
    sections: [
      {
        kind: 'hero',
        title: 'Audit & consulting',
        intro:
          "You don't always need a new strategy — sometimes a fresh pair of eyes from outside is enough. Need to check whether your social media work is actually paying off, or run an idea past an expert? We analyze your profile, point out the strengths and the places that need work, and walk you through concrete recommendations and next steps in a one-on-one consultation.",
        cta: { label: 'Book a consultation', href: '/en/contact' },
      },
      {
        kind: 'checklist',
        kicker: 'SCOPE',
        heading: 'See your brand from a new angle',
        intro:
          "We analyze the brand's social profiles, review the communication, content, results, and advertising, then talk the findings through with you one to one. Here's what's included:",
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
          { name: 'X', icon: 'x' },
          { name: 'YouTube', icon: 'youtube' },
          { name: 'Pinterest', icon: 'pinterest' },
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
            logo: '/case-studies/volvo/volvo-logo.png?v=2',
            kicker: 'CASE STUDY',
            brand: 'Volvo',
            title: 'Building the brands on LinkedIn, Facebook, and Instagram',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'seofly',
        name: 'SEOFly',
        logo: '/assets/seofly-logo-light.png',
        copy: [
          'Our audit stops where social media stops. Past that line it is SEOFly — our sibling agency in the Good One Group, who audit websites and how they show up in Google.',
          'Take one audit or take both. Take both and the findings from social and from search come back as a single direction to act on, rather than two separate documents somebody has to reconcile afterwards.',
          'One partner. Many capabilities. BETTER WORKS.',
        ],
        split: {
          partner: {
            label: 'SEOFly audits',
            items: [
              'The technical state of the site',
              'Visibility in Google',
              'Content written for search',
              'The link profile',
            ],
          },
          lama: {
            label: 'We audit',
            items: [
              'Social media profiles',
              'Communication and content',
              'Results and engagement',
              'Advertising activity',
            ],
          },
        },
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

  // 7 — Influencer marketing
  {
    id: 'influencer-marketing',
    slug: 'influencer-marketing',
    pairSlug: 'influencer-marketing',
    label: 'Influencer marketing',
    meta: {
      title: 'Influencer marketing agency — campaigns with creators',
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
        copy: [
          'Effective influencer marketing is a great deal more than a one-off post from a creator. What counts is picking people who genuinely fit the brand, and a relationship that outlasts a single campaign — which is why we joined forces with Folks, an agency built around authentic relationships between brands and the people who follow them.',
          'For a brand that means one campaign run end to end in one place, consistent with everything else the brand is saying, plus access to every capability in the Good One Group — social and content, SEO and performance, PR, employer branding.',
          'One partner. Many capabilities. BETTER WORKS.',
        ],
        split: {
          partner: {
            label: 'Folks',
            items: [
              'Creator network',
              'Briefing and negotiation',
              'Content production',
              'Settlement and reporting',
            ],
          },
          lama: {
            label: 'Social Lama',
            items: [
              'Campaign strategy',
              "The brand's content and social media",
              'Fit with everything else the brand says',
              'Analysis of the results',
            ],
          },
        },
        href: '/en/contact',
        video: {
          src: '/clips/folks-cover-2.mp4',
          mobileSrc: '/clips/folks-cover-2-mobile.mp4',
          poster: '/clips/folks-cover-2-poster.jpg',
          alt: 'A creator presenting a product to a phone camera while someone else films',
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

// —— SEO landings (outside the roster — see the note in uslugi.ts) —————————————

/**
 * The English twin of the Polish landing. Parity content, not an English
 * keyword play: the EN locale exists so the pair resolves and the page reads
 * naturally, while the search targeting is Polish-only (design non-goal).
 *
 * COPY STATUS: approved by the content team 2026-08-14, slug included.
 */
export const seoLandings = [
  {
    id: 'prowadzenie-social-media',
    slug: 'social-media-management',
    pairSlug: 'prowadzenie-social-media',
    label: 'Social media management',
    meta: {
      title: 'Social media management — what it covers and what it costs',
      description: `Social media management for brands: strategy, content, publishing, moderation, and monthly reporting. See the full scope and what it costs — from ${STARTING_PRICE} PLN net.`,
    },
    summary:
      'Full-service profile management — strategy, content, publishing, moderation, reporting. See the scope and the price range.',
    sections: [
      {
        kind: 'hero',
        title: 'Social media management',
        intro:
          "Running social media is not a publishing calendar — it's strategy, content, conversation, and constant tuning against the brand's business goals. We take over your profiles on Facebook, Instagram, TikTok, LinkedIn, YouTube, X and Pinterest: we plan the communication, produce the content, publish it, moderate the replies, and report the results every month.",
        cta: { label: 'Ask for a quote', href: '/en/contact' },
      },
      {
        kind: 'checklist',
        kicker: 'SCOPE',
        heading: 'What does social media management cover?',
        intro:
          'We set the scope per brand — how many platforms, how often you publish, what the goals are. Full-service management of one profile usually covers:',
        items: [
          'Communication strategy and a content plan',
          'Copywriting and post design',
          'Video, reels, and animation production',
          'Publishing and calendar management',
          'Comment and message moderation',
          'Ad campaigns and ongoing optimization',
          'A monthly report with results and recommendations',
        ],
        media: {
          src: '/assets/prowadzenie-zakres-lamy.webp',
          alt: 'A llama crew running a brand profile: a camera operator, jugglers throwing the Facebook, Instagram and LinkedIn marks, and a llama working on a laptop',
          width: 1150,
          height: 1005,
        },
      },
      {
        kind: 'banner',
        heading: 'What does social media management cost?',
        body: `Professional management of a single profile starts around ${STARTING_PRICE} PLN net per month. Running a brand across several platforms, graphics and video production included, sits in the 3,000–15,000 PLN a month range — the final quote depends on how many channels there are, how much you publish, and how much material has to be made from scratch. The ad budget is always billed separately from the work, so quotes stay comparable.`,
        cta: { label: 'Ask for a quote', href: '/en/contact' },
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'What it looks like in practice',
        cases: [
          {
            slug: 'dolina-charlotty',
            logo: '/case-studies/dolina-charlotty/dolina-charlotty-logo.png',
            kicker: 'CASE STUDY',
            brand: 'Dolina Charlotty',
            title: 'A resort talking all year round on Facebook and Instagram',
          },
        ],
        // Artwork is shared with the Polish page; only the alt is localized.
        figure: {
          src: '/assets/prowadzenie-dowod-lama.webp',
          alt: 'A llama in a navy blazer tossing a fluffy cube carrying the Facebook, Instagram and X marks',
          width: 819,
          height: 1034,
        },
      },
      {
        kind: 'faq',
        kicker: 'FAQ',
        heading: 'Questions about social media management',
        items: [
          {
            question: 'How much does social media management cost?',
            answer: `Managing one profile starts around ${STARTING_PRICE} PLN net per month. Running a brand across several platforms, with graphics and video production, sits in the 3,000–15,000 PLN a month range. The price depends on the number of channels, how much you publish, and how much of the material is made from scratch. The ad budget is billed separately.`,
          },
          {
            question: 'What does social media management include?',
            answer:
              'Communication strategy, content planning and production — copy, graphics, video — publishing, comment and message moderation, running ad campaigns, and a monthly report with results and recommendations for the next period. We write the scope down before we start, so everyone knows exactly what the fee buys.',
          },
          {
            question: 'Is the ad budget included in the fee?',
            answer:
              'No. The fee for running your profiles and the media budget for campaigns are always billed separately. That way you can see what the team costs and what goes to the ad platforms — and compare agency quotes that bundle the two.',
          },
          {
            question: 'Which platforms do you run?',
            answer:
              'Facebook, Instagram, TikTok, LinkedIn, YouTube, X and Pinterest. Never all of them at once — we pick the channels around your audience and your goals, because a profile with no audience costs the same as one that sells.',
          },
          {
            question: 'How quickly do results show up?',
            answer:
              'The first qualitative results — a coherent look, higher engagement, a better-described profile — usually show after 4–8 weeks. Sales results depend on the ad budget and the buying cycle, which is why we normally start with a three-month engagement.',
          },
        ],
      },
      // No `posts` section: the blog is Polish-only, so it would render nothing
      // (the same reason Strategy omits it).
    ],
  },
] satisfies LocalizedUslugi['seoLandings']

// —— Derived navigation ————————————————————————————————————————————————————————

export const serviceNav = SERVICES.map((service) => ({
  label: service.label,
  href: `/en/services/${service.slug}`,
}))

/** Roster ∪ landings — the EN twin of `USLUGI_PAGES`. */
export const USLUGI_PAGES = [...SERVICES, ...seoLandings]

/**
 * Lookup by this-locale (English) slug. Resolves the roster AND the SEO
 * landings — see the note on the Polish `findService`.
 */
export function findService(slug: string) {
  return USLUGI_PAGES.find((page) => page.slug === slug)
}
