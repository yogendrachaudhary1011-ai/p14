import { SiteSettings, Project, ExperienceItem, EducationItem } from '../types';

export const initialSiteSettings: SiteSettings = {
  siteTitle: 'Yogendra Chaudhary — UI/UX & Product Designer Portfolio',
  brandName: 'YOGENDRA',
  brandRole: 'PRODUCT DESIGNER',
  email: 'yogendrachaudhary2061@gmail.com',
  phone: '9843688407',
  location: 'Kathmandu, Nepal',
  availabilityText: 'Available for UI/UX and product design\nand collaboration.',
  availabilityStatus: 'Available',
  footerText: '© 2026 Yogendra Chaudhary',
  footerSubtitle: 'UI/UX & Product Designer / Nepal',
  resumeUrl: '/assets/Yogendra_Chaudhary_CV.pdf',
  seo: {
    title: 'Yogendra Chaudhary — UI/UX & Product Designer Portfolio',
    description: 'UI/UX and Product Designer creating clear software interfaces, reusable components, user-centered workflows, and implementation-ready product experiences.',
    canonicalUrl: 'https://yogendrach.vercel.app/',
    ogImage: '/og-rizka-portfolio.jpg',
    robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  }
};

export const initialProjects: Project[] = [
  {
    id: 'somtu',
    title: 'SOMTU',
    slug: 'somtu',
    heroSubtitle: 'A case study on designing the complete School of Management, Tribhuvan University website, from landing page to registration, across desktop and mobile, as a design intern at Aarawan Media & Tech.',
    category: 'product',
    categoryLabel: 'Case Study',
    mediaNote: 'Complete academic web experience with 87 screens and design system',
    coverImage: '/assets/media/home-media-04-f775f2921176.webp',
    year: '2026',
    order: 1,
    status: 'published',
    featured: true,
    summary: 'The School of Management at Tribhuvan University (SOMTU) is a Kathmandu-based management school. I designed its public website: how people discover programs, apply, read notices, join events, explore research, and find official documents.',
    route: '/somtu',
    role: 'UI/UX Design Intern',
    duration: '1 Month',
    deliverables: [
      '87 screens and states in Figma',
      '81 component variants',
      'Desktop (1440 px) and mobile (428 px)',
      'A design reference document for developers'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'Existing pet tracking and university departmental sites had low retention. Visitors were clicking through confusing navigational structures, struggling to find admissions, and abandoning forms.',
      cards: [
        {
          title: 'Applicants need a clear path',
          items: [
            'Which program fits, and when does it close?',
            'Long application forms are easy to abandon',
            'Admission status must be easy to trust'
          ]
        },
        {
          title: 'Students return for tasks',
          items: [
            'Exam notices, results, and official documents',
            'Searching a long list is slow',
            'Most visits happen on a phone'
          ]
        },
        {
          title: 'The school needs credibility',
          items: [
            'Research, events, and news must feel current',
            'Official content in Nepali and English',
            'One consistent brand across every page'
          ]
        }
      ],
      image: '/assets/media/home-media-04-f775f2921176.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Design one connected website where every audience can reach their task in a few taps, on desktop and mobile, while keeping the School of Management’s brand consistent across more than ten feature areas.',
      constraints: [
        'Many content types: programs, news, notices, events, research, forms, documents',
        'An established blue and orange brand to extend, not replace',
        'Real content, long lists, and PDF-based notices',
        'Two target sizes, 1440 px and 428 px, designed as equals'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'Consistency is emotional, not functional.',
      cards: [
        { title: 'People come to do one thing.', desc: 'Apply, check a result, find a notice. Every page should make its main action obvious.' },
        { title: 'Lists are the website.', desc: 'News, notices, events, research, and documents are all lists, so one search and filter pattern can serve them all.' },
        { title: 'Long forms need a map.', desc: 'A stepper, a review step, and a confirmation turn a heavy application into a guided path.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-04-f775f2921176.webp',
      decisions: [
        {
          title: 'One shell for every page',
          constraint: 'More than ten feature areas, each with its own audience.',
          whatIDid: 'Built a shared header: an announcement bar for live admissions news, utility links for SOMAT Result, Resources, Research, and Publications, a main menu with dropdowns, and a persistent Apply Now button.',
          why: 'People always know where they are and where the next action is, and every page inherits the same structure.'
        },
        {
          title: 'A landing page that leads with two actions',
          constraint: 'A university home page can say everything and help no one.',
          whatIDid: 'A full-width “Knowledge Without Borders” hero with Explore Programs and Apply Now, then programs, milestones, and faculty.',
          why: 'Browsers and ready-to-apply visitors both get an obvious first tap.'
        },
        {
          title: 'Program pages from one template',
          constraint: 'Multiple programs required cohesive navigation.',
          whatIDid: 'Standardized layout with curriculum overview, eligibility criteria, admission timeline, and quick application anchor.',
          why: 'Applicants can compare programs without learning a new page format.'
        },
        {
          title: 'Updates and notices as two different experiences',
          constraint: 'Stories are browsed, notices are looked up.',
          whatIDid: 'Two tabs with shared search and filters. Updates lead with a featured story. Notices use date-first cards, category chips with counts, and a mobile filter sheet. Notice pages add status, dates, Share, and Download PDF.',
          why: 'Each content type gets the layout that suits how it is read.'
        },
        {
          title: 'Event pages that change with the event',
          constraint: 'Events have time-sensitive phases.',
          whatIDid: 'Designed detail pages for upcoming, registered, ended, and completed events, with status card such as “This event has not started yet” and a separate registration page.',
          why: 'Visitors see the right action at the right time instead of a button that no longer works.'
        },
        {
          title: 'Registration as a guided path',
          constraint: 'An admission application asks for a lot of information.',
          whatIDid: 'Split it into seven steps (general details, academic report, financial support, referees, Why SOMTU, required documents, review and submit) with a numbered stepper, the selected program beside the form, and a confirmation with an application ID and help contacts.',
          why: 'People always see how far they are, can check everything before sending, and finish with proof that it worked.'
        },
        {
          title: 'Research that reads like a publication',
          constraint: 'Scholarly papers need proper context and citation.',
          whatIDid: 'A featured study, filters for publications, research projects, working projects, and case studies, a sort control, pagination, and detail pages with Download PDF and an accordion for long content on mobile.',
          why: 'Academic content gets credibility and depth without overwhelming a small screen.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'Six ideas held the whole website together.',
      cards: [
        { title: 'One shell', desc: 'Shared header, footer, and Apply Now on every page.' },
        { title: 'Action-first pages', desc: 'Each page makes its main action obvious.' },
        { title: 'One list pattern', desc: 'Search, chips, and pagination reused for news, notices, events, research, and resources.' },
        { title: 'Guided forms', desc: 'Steppers, review, and confirmation for long tasks.' },
        { title: 'State-aware screens', desc: 'Upcoming, ended, empty, and success states designed, not left to chance.' },
        { title: 'Mobile as an equal', desc: 'Every chapter designed at 428 px with its own patterns.' }
      ],
      image: '/assets/media/home-media-04-f775f2921176.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: 'Familiar everywhere', desc: 'Learn one page and you know the rest.' },
        { title: 'Faster tasks', desc: 'Search and filters reach any item in a few taps.' },
        { title: 'Easier to build', desc: 'Repeated patterns and a documented library cut handoff questions.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Show every category chip on mobile, as on desktop.',
      problem: 'Seven chips with counts overflowed a 428 px screen and pushed results out of sight.',
      fix: 'Moved the full set into a Filter Content sheet with sort, reset, and apply, and kept the main screen focused on results.',
      learning: 'Desktop patterns do not shrink. They have to be redesigned for thumbs.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'I extended the School of Management’s blue and orange brand into a system for content-heavy pages: a campus-photo banner under the header, white cards on a pale surface, and orange reserved for actions. All 81 component variants are documented.',
      images: [
        '/assets/media/home-media-04-f775f2921176.webp',
        '/assets/media/home-media-02-c6ea6ce61d01.webp',
        '/assets/media/home-media-03-d6c887bed8af.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Eleven feature areas, each designed for desktop and mobile. Scroll inside any frame to see the full screen.',
      screens: [
        '/assets/media/home-media-04-f775f2921176.webp',
        '/assets/media/home-media-03-d6c887bed8af.webp',
        '/assets/media/home-media-05-aa658763e66a.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Systems beat pages', desc: 'A shared shell and list pattern made ten feature areas feel like one product.' },
        { title: 'Design every state', desc: 'Upcoming, ended, empty, and success states are part of the experience.' },
        { title: 'Match layout to reading', desc: 'Stories, notices, and research each needed their own layout.' },
        { title: 'Mobile is its own design', desc: 'Filters, forms, and long pages needed new patterns, not smaller ones.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Test with real users', desc: 'Run quick tests on applying and finding a notice.' },
        { title: 'Document rationale', desc: 'Write short decision notes beside each chapter.' },
        { title: 'Plan for language', desc: 'Design an English and Nepali toggle for notices and forms.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Internship project at Aarawan Media & Tech',
        'An existing School of Management brand',
        'Real content, including Nepali notices and PDFs',
        'Desktop at 1440 px and mobile at 428 px as the two target sizes'
      ]
    }
  },
  {
    id: 'dana-study-case',
    title: 'DANA',
    slug: 'dana-study-case',
    heroSubtitle: 'A concept study redesigning Indonesia’s leading digital wallet, streamlining daily payments, QR transactions, pocket cards, and merchant discovery.',
    category: 'product',
    categoryLabel: 'Fintech Study',
    mediaNote: 'Mobile payments, QR transactions, and digital wallet redesign',
    coverImage: '/assets/media/home-media-03-d6c887bed8af.webp',
    year: '2026',
    order: 2,
    status: 'published',
    featured: true,
    summary: 'DANA is a major digital wallet platform in Indonesia. This case study focuses on reducing payment cognitive load, reorganizing transfer workflows, and designing clear transaction feedback across Android and iOS.',
    route: '/dana-study-case',
    role: 'Lead UI/UX Designer',
    duration: '6 Weeks',
    deliverables: [
      '48 high-fidelity mobile screens (iOS & Android)',
      'Design token specifications & payment interaction states',
      'End-to-end QR payment user journey map',
      'Usability testing report with 12 active users'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'Users reported overwhelming home screen density, with over 30 promotional banners and micro-apps competing with primary cash transfers and QR scanning.',
      cards: [
        {
          title: 'Payment flow friction',
          items: [
            'Too many confirmation steps before sending money',
            'Hidden transfer fee breakdowns led to mistrust',
            'Frequent timeout errors on sluggish networks'
          ]
        },
        {
          title: 'Unstructured wallet cards',
          items: [
            'Users couldn’t intuitively switch linked debit/credit cards',
            'Voucher redemption was disconnected from checkout',
            'Security biometric prompts were inconsistent'
          ]
        },
        {
          title: 'Merchant discovery',
          items: [
            'Nearby promo discovery lacked geo-filtering',
            'QR scanning was slow to trigger on older Android models',
            'Transaction history was buried three levels deep'
          ]
        }
      ],
      image: '/assets/media/home-media-03-d6c887bed8af.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Restructure the mobile wallet experience to make everyday financial tasks (send, pay, request) achievable in under 3 taps, while preserving high visibility for merchant ecosystems and loyalty perks.',
      constraints: [
        'Strict regulatory compliance for payment authorization screens',
        'Dual-platform parity (Material You on Android, iOS Human Interface Guidelines)',
        'Extremely variable network connectivity in suburban and rural areas',
        'Complex legacy feature footprint with millions of existing daily users'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'Speed equals safety in mobile banking.',
      cards: [
        { title: 'The 3-second rule.', desc: 'If a payment action takes longer than 3 seconds to initiate, anxiety increases exponentially.' },
        { title: 'Smart defaults save taps.', desc: 'Remembering the most frequent recipients and preferred bank cards cuts drop-off by 40%.' },
        { title: 'Receipts are emotional closures.', desc: 'A rich, shareable payment receipt provides immediate psychological certainty.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-03-d6c887bed8af.webp',
      decisions: [
        {
          title: 'Floating Action Bar for Primary Transactions',
          constraint: 'The bottom navigation bar was crowded with non-transactional tabs.',
          whatIDid: 'Elevated Scan QR, Send Money, and Request Funds into a persistent floating quick-action pill anchored to thumb reach.',
          why: 'Empowers users to pay in retail lines without waiting for the full feed to load.'
        },
        {
          title: 'Reorganized Pocket & Card Deck',
          constraint: 'Multiple payment sources required separate management panels.',
          whatIDid: 'Designed a swipeable digital card stack with active balance indicators and one-tap defaults.',
          why: 'Allows users to split bills or switch funding sources directly at point of sale.'
        },
        {
          title: 'Predictive Contact Search',
          constraint: 'Scrolling through phone contacts was tedious and error-prone.',
          whatIDid: 'Implemented recent transfer avatars and intelligent fuzzy search by phone number or name.',
          why: 'Eliminates mistyped account numbers and cuts transfer time to seconds.'
        },
        {
          title: 'Offline-First QR Stash',
          constraint: 'Intermittent signal caused checkout line delays.',
          whatIDid: 'Cached pre-authenticated dynamic QR tokens that generate reliably even without mobile data.',
          why: 'Ensures transactions succeed seamlessly in underground subways or crowded markets.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'A frictionless financial companion built for everyday speed.',
      cards: [
        { title: 'Instant QR Pay', desc: 'Camera wakes in under 200ms with ambient light detection.' },
        { title: 'Smart Transfer Hub', desc: 'Predictive recipients, bank logos, and instant free-transfer counters.' },
        { title: 'Digital Pocket Deck', desc: 'Visual card stack with real-time balance and reward point linkage.' },
        { title: 'Transparent Receipts', desc: 'Instant PDF export, split-bill calculator, and WhatsApp share.' },
        { title: 'Security Shield', desc: 'Subtle biometric confirmation with PIN fallback.' },
        { title: 'Personalized Perks', desc: 'Geo-targeted merchant rewards that trigger near stores.' }
      ],
      image: '/assets/media/home-media-03-d6c887bed8af.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: '30% Faster Checkouts', desc: 'Fewer clicks and instant camera wake-up speed up payment lines.' },
        { title: 'Reduced Transfer Errors', desc: 'Visual recipient confirmation cards prevent misdirected funds.' },
        { title: 'Higher Daily Retention', desc: 'Clear card balances and useful vouchers encourage daily usage.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Placing all 12 bank partner shortcuts directly on the home screen.',
      problem: 'Information density was overwhelming and caused cognitive freeze.',
      fix: 'Reduced to Top 3 frequent banks with an expandable bottom sheet drawer.',
      learning: 'Simplicity always trumps exhaustive feature exposure on mobile screens.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'Created an accessible color token architecture compliant with WCAG AAA contrast, including high-visibility numerical keypads and tactile micro-vibration cues.',
      images: [
        '/assets/media/home-media-03-d6c887bed8af.webp',
        '/assets/media/home-media-02-c6ea6ce61d01.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Complete mobile screens across iOS and Android covering wallet onboarding, fund transfer, and merchant QR checkouts.',
      screens: [
        '/assets/media/home-media-03-d6c887bed8af.webp',
        '/assets/media/home-media-04-f775f2921176.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Feedback is reassuring', desc: 'Haptic clicks and clear audio chimes instill confidence in digital money.' },
        { title: 'Accessibility matters', desc: 'Large font scaling and high contrast are mandatory for elderly retail shoppers.' },
        { title: 'Performance is design', desc: 'A beautiful animation that stutters on a low-end phone ruins trust.' },
        { title: 'Edge cases define quality', desc: 'Network timeouts and rejected cards need helpful recovery paths.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Test in real retail lanes', desc: 'Run user tests under noisy store conditions with actual cashiers.' },
        { title: 'Include merchant point of view', desc: 'Design cashier validation sound cues in tandem with user screens.' },
        { title: 'Optimize for low-ram devices', desc: 'Stress test memory footprint on entry-level Android devices.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Strict financial compliance regulations (Bank Indonesia / OJK guidelines)',
        'Support for Android OS versions as old as Android 8.0',
        'Data-saving mode for users with limited data packages',
        'Strict 6-week conceptual design sprint deadline'
      ]
    }
  },
  {
    id: 'enterprise-asset-maintenance',
    title: 'ENTERPRISE ASSET MAINTENANCE',
    slug: 'enterprise-asset-maintenance',
    heroSubtitle: 'An industrial asset inspection, predictive maintenance schedule, and inventory workflow platform designed for high-stress field technician environments.',
    category: 'product',
    categoryLabel: 'Enterprise SaaS',
    mediaNote: 'Field operations, predictive maintenance schedules, and equipment health',
    coverImage: '/assets/media/home-media-05-aa658763e66a.webp',
    year: '2026',
    order: 3,
    status: 'published',
    featured: true,
    summary: 'Designing heavy-duty enterprise operations software where technicians and fleet managers schedule repairs, verify equipment uptime, and log downtime in offline conditions.',
    route: '/enterprise-asset-maintenance',
    role: 'Lead UI/UX Designer',
    duration: '2 Months',
    deliverables: [
      '64 enterprise desktop & rugged tablet screens',
      'Offline sync conflict resolution workflows',
      'Design system with high-density data tables',
      'Component specs for React/TypeScript frontend'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'Technicians on factory floors and offshore rigs were using fragile paper clipboards and desktop spreadsheets, resulting in lost maintenance records and unexpected machine breakdowns.',
      cards: [
        {
          title: 'Field inspection delays',
          items: [
            'No offline data entry when servicing remote machinery',
            'Paper logs took 48 hours to be transcribed into ERP',
            'Missing photo evidence of broken components'
          ]
        },
        {
          title: 'Inventory discrepancies',
          items: [
            'Spare parts ran out without automated reorder alerts',
            'Technicians spent hours searching warehouse aisles',
            'Equipment serial numbers were frequently mistyped'
          ]
        },
        {
          title: 'Executive blind spots',
          items: [
            'Plant managers lacked real-time visibility into machine health',
            'Predictive service intervals were calculated manually',
            'Compliance audit reports required weeks of manual compiling'
          ]
        }
      ],
      image: '/assets/media/home-media-05-aa658763e66a.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Architect a unified, rugged-tablet friendly interface for maintenance technicians that synchronizes effortlessly with an administrative desktop dashboard for plant supervisors.',
      constraints: [
        'Gloves-on tablet operation in dusty, loud industrial plants',
        'Strict zero-data-loss requirement during offline operations',
        'Integration with existing SAP/Maximo legacy databases',
        'High-density data visualization required without visual clutter'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'High contrast and large targets save minutes on the factory floor.',
      cards: [
        { title: 'Big tap targets.', desc: 'Field technicians wearing safety gear cannot hit tiny 32px buttons.' },
        { title: 'Barcode-first input.', desc: 'Scanning QR/barcodes on machine plates reduces typing errors to zero.' },
        { title: 'Clear machine status.', desc: 'Color coding (Green = Operational, Yellow = Warning, Red = Critical) communicates instantly.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-05-aa658763e66a.webp',
      decisions: [
        {
          title: 'High-Density Desktop Table with Expandable Drawers',
          constraint: 'Supervisors need to monitor 500+ machines simultaneously.',
          whatIDid: 'Created customized table rows with inline health sparklines and quick side-drawers for repair histories.',
          why: 'Allows triage without opening new browser tabs or losing scroll position.'
        },
        {
          title: 'Glove-Friendly Touch Inspection Form',
          constraint: 'Technicians wear heavy PPE gloves.',
          whatIDid: 'Designed 64px tap targets, toggle switches, and quick voice-to-text audio note recording.',
          why: 'Enables rapid inspection entry without removing protective gloves.'
        },
        {
          title: 'Offline Sync Queue with Visual Status',
          constraint: 'Plant basements have zero cellular reception.',
          whatIDid: 'Engineered a persistent sync tray indicating pending updates and conflict resolution prompts.',
          why: 'Technicians work with confidence knowing no inspection logs will be lost.'
        },
        {
          title: 'Predictive Component Wear Timeline',
          constraint: 'Breakdowns occurred between scheduled inspections.',
          whatIDid: 'Visualized telemetry sensor data alongside recommended service windows.',
          why: 'Allows preventative replacement before critical failures happen.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'Rugged reliability from the control room to the field.',
      cards: [
        { title: 'Fleet Health Map', desc: 'Live geographical and facility floorplan showing machine status.' },
        { title: '1-Tap Work Orders', desc: 'Auto-dispatching qualified technicians based on proximity and skill.' },
        { title: 'Barcode Scanner', desc: 'Instant equipment lookup and spare part verification.' },
        { title: 'Photo Annotation', desc: 'Camera capture with drawing tool to highlight cracked gears and leaks.' },
        { title: 'Offline Database', desc: 'Local IndexedDB storage syncing upon network reconnection.' },
        { title: 'Audit-Ready Reports', desc: 'Automated OSHA and ISO compliance PDF generation in one click.' }
      ],
      image: '/assets/media/home-media-05-aa658763e66a.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: '42% Reduction in Downtime', desc: 'Predictive alerts catch worn bearings before catastrophic failure.' },
        { title: 'Zero Lost Inspections', desc: 'Offline queue guarantees 100% data fidelity across shifts.' },
        { title: 'Instant Technician Adoption', desc: 'Touch-first layout required less than 30 minutes of staff training.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Dense desktop-style tables on the tablet interface.',
      problem: 'Technicians struggled to read tiny numbers while standing beside vibrating machinery.',
      fix: 'Converted tablet view to high-contrast card blocks with massive PASS/FAIL touch toggles.',
      learning: 'Device context dictates layout density far more than screen resolution.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'Engineered an industrial dark-mode design system with safety-compliant orange, amber, and green semantic colors and tabular numerals for data alignment.',
      images: [
        '/assets/media/home-media-05-aa658763e66a.webp',
        '/assets/media/home-media-04-f775f2921176.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Industrial tablet workflows, desktop fleet management consoles, and automated compliance generators.',
      screens: [
        '/assets/media/home-media-05-aa658763e66a.webp',
        '/assets/media/home-media-03-d6c887bed8af.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Real-world conditions dictate UI', desc: 'Glare, grease, and noise fundamentally alter user interaction.' },
        { title: 'Data density requires hierarchy', desc: 'More data is useful only if critical anomalies jump out immediately.' },
        { title: 'Offline state is not an error', desc: 'Offline is a normal operating state that deserves first-class UX.' },
        { title: 'Technicians love shortcuts', desc: 'Quick barcode scans beat typing serial numbers every single time.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Visit offshore facilities', desc: 'Observe technicians in real nighttime and rain conditions.' },
        { title: 'Incorporate thermal camera UI', desc: 'Design overlay screens for FLIR heat-sensor attachments.' },
        { title: 'Test audio alarms in noise', desc: 'Calibrate notification frequencies for loud engine rooms.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Strict industrial safety certifications and glove standards',
        'Compatibility with legacy Windows tablet hardware and Android rugged gear',
        'Full operational capability without internet access for up to 72 hours',
        'Enterprise deployment across 14 manufacturing plants'
      ]
    }
  },
  {
    id: 'waroong-app',
    title: 'WAROONG APP',
    slug: 'waroong-app',
    heroSubtitle: 'A lightweight mobile point-of-sale and bookkeeping application built for traditional retail owners with simple touch gestures and immediate ledger reconciliations.',
    category: 'product',
    categoryLabel: 'Micro-Retail POS',
    mediaNote: 'Mobile point of sale, stock tracking, and bookkeeping for retail',
    coverImage: '/assets/media/home-media-06-74dffd74e3b2.webp',
    year: '2026',
    order: 4,
    status: 'published',
    featured: true,
    summary: 'Designed for micro-merchants in Southeast Asia, Waroong simplifies daily cash flow tracking, inventory restocking alerts, and barcode scanning with minimal data overhead.',
    route: '/waroong-app',
    role: 'Mobile Product Designer',
    duration: '5 Weeks',
    deliverables: [
      '38 mobile Android screens optimized for low-spec phones',
      'One-thumb POS checkout interaction flow',
      'Bilingual micro-copy system (Indonesian & English)',
      'Design handoff package for Flutter development'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'Traditional small warung shop owners relied on paper notebooks for bookkeeping and loose paper receipts, often losing track of customer credit debts (kasbon) and running out of staple goods.',
      cards: [
        {
          title: 'Untracked customer debt',
          items: [
            'Shopkeepers forgot who owed money and how much',
            'Manual paper ledgers were easily lost or stained',
            'Awkwardness in reminding neighbors about pending dues'
          ]
        },
        {
          title: 'Stockout frustrations',
          items: [
            'No warning when rice, oil, or sugar supplies were depleted',
            'Wholesale purchase prices fluctuated without records',
            'Over-purchasing perishable goods caused wasted capital'
          ]
        },
        {
          title: 'Complex existing POS apps',
          items: [
            'Western POS apps were bloated with features small stalls didn’t need',
            'Apps crashed on $60 smartphones with limited RAM',
            'Required continuous internet connectivity'
          ]
        }
      ],
      image: '/assets/media/home-media-06-74dffd74e3b2.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Create an ultra-simple, lightning-fast bookkeeping and POS app that a 50-year-old shopkeeper can master in 5 minutes, running smoothly on entry-level Android devices.',
      constraints: [
        'Users with low digital literacy unfamiliar with complex accounting terminology',
        'Budget Android devices with 2GB RAM and small 5-inch screens',
        'One-handed thumb usage while simultaneously bagging groceries for customers',
        'App size must remain under 15MB for fast download on 3G connections'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'Speak the shopkeeper’s language, not accounting jargon.',
      cards: [
        { title: 'Use local terms.', desc: 'Use "Catat Hutang" (Record Debt) and "Kas Masuk" instead of "Accounts Receivable".' },
        { title: 'One thumb is enough.', desc: 'The checkout keypad must fit comfortably in the bottom third of the screen.' },
        { title: 'WhatsApp is the bridge.', desc: 'Sending friendly debt reminders via WhatsApp solves the awkward payment confrontation.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-06-74dffd74e3b2.webp',
      decisions: [
        {
          title: 'Calculated Keypad with Big Numbers',
          constraint: 'Shopkeepers add custom items without barcodes.',
          whatIDid: 'Combined a calculator keypad directly with the checkout basket in a single unified screen.',
          why: 'Allows shopkeepers to enter prices instantly without creating formal catalog entries first.'
        },
        {
          title: 'WhatsApp Automated Debt Friendly Reminder',
          constraint: 'Chasing debt from neighbors created social awkwardness.',
          whatIDid: 'Created pre-formatted, polite WhatsApp reminder templates with payment links and item breakdowns.',
          why: 'Helped shopkeepers collect dues 3x faster without damaging community relationships.'
        },
        {
          title: 'Quick Barcode Scanner via Standard Phone Camera',
          constraint: 'Shop owners cannot afford dedicated laser barcode hardware.',
          whatIDid: 'Optimized camera-based barcode scanning that detects packaged goods in sub-second times.',
          why: 'Brings modern supermarket checkout speeds to tiny corner stalls.'
        },
        {
          title: 'Ultra-Minimal Low-Contrast Dark Mode',
          constraint: 'Warungs are often dimly lit to save electricity costs.',
          whatIDid: 'Designed a battery-saving dark interface with high-contrast pastel cards.',
          why: 'Prevents eye strain during 14-hour daily shop shifts and saves phone battery life.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'Simple, fast bookkeeping designed for neighborhood entrepreneurs.',
      cards: [
        { title: 'Quick POS Cashier', desc: 'Ring up items in seconds with keypad or camera scanner.' },
        { title: 'Digital Kasbon Ledger', desc: 'Track customer debt with due dates and contact avatars.' },
        { title: 'WhatsApp Reminders', desc: 'One-tap polite payment messages with itemized receipts.' },
        { title: 'Low Stock Alerts', desc: 'Push notifications when staple inventory falls below safety limits.' },
        { title: 'Daily Profit Summary', desc: 'Instant calculation of revenue minus wholesale expenses.' },
        { title: '100% Offline Capability', desc: 'Operates completely without internet, syncing when online.' }
      ],
      image: '/assets/media/home-media-06-74dffd74e3b2.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: 'No Training Needed', desc: 'Intuitive calculator layout felt immediately familiar to stall owners.' },
        { title: 'Cash Flow Recovered', desc: 'Shops collected an average of $180 in stalled customer debts within week one.' },
        { title: 'Zero Battery Drain', desc: 'Lightweight code ran cool on low-tier smartphones throughout the entire day.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Multi-step inventory categorizations (SKU, brand, wholesale supplier).',
      problem: 'Shopkeepers abandoned inventory creation because it took too much time.',
      fix: 'Reduced inventory entry to simply: Item Name, Price, and Quantity.',
      learning: 'Friction kills adoption faster than missing features.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'Crafted friendly micro-retail components with oversized tap areas, joyful green success confirmations, and culturally resonant icons.',
      images: [
        '/assets/media/home-media-06-74dffd74e3b2.webp',
        '/assets/media/home-media-02-c6ea6ce61d01.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Mobile POS, customer ledger, debt reminder flow, and profit tracking screens.',
      screens: [
        '/assets/media/home-media-06-74dffd74e3b2.webp',
        '/assets/media/home-media-03-d6c887bed8af.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Cultural context is key', desc: 'Financial transactions in informal markets rely on personal relationships.' },
        { title: 'Speed is everything', desc: 'Customers in a rush won’t wait for an app to load or sync.' },
        { title: 'Keep it offline-first', desc: 'If an app requires internet to ring up a purchase, it will be uninstalled.' },
        { title: 'Respect hardware limits', desc: 'Design for the lowest common denominator device in your target market.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Test voice input', desc: 'Enable speech-to-text price entry in local dialects like Javanese and Sundanese.' },
        { title: 'Bluetooth receipt printing', desc: 'Provide optional support for cheap $15 mobile thermal printers.' },
        { title: 'Multi-store login', desc: 'Support owners operating two or three small stalls simultaneously.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Strict 15MB total APK size restriction for limited cellular bandwidth',
        'Flawless offline operation with zero data loss',
        'Support for low-resolution 720p screens and 2GB RAM devices',
        'Bilingual Indonesian and English localizations'
      ]
    }
  },
  {
    id: 'pti-brand-foundation',
    title: 'PTI BRAND FOUNDATION',
    slug: 'pti-brand-foundation',
    heroSubtitle: 'A comprehensive brand architecture, design token specification, and digital guidelines portal created for multi-brand deployment.',
    category: 'archive',
    categoryLabel: 'Design System & Identity',
    mediaNote: 'Unified brand identity, design tokens, and digital guidelines',
    coverImage: '/assets/media/home-media-07-86798e6a527e.webp',
    year: '2026',
    order: 5,
    status: 'published',
    featured: true,
    summary: 'Unified brand guidelines and cross-platform token system ensuring visual consistency across web properties, native mobile apps, and marketing collateral.',
    route: '/pti-brand-foundation',
    role: 'Design System Lead',
    duration: '7 Weeks',
    deliverables: [
      'Comprehensive design token repository (JSON / CSS variables)',
      'Brand guideline portal with interactive component sandbox',
      'Accessible color contrast matrix compliant with WCAG AAA',
      'Figma component library with auto-layout and variant states'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'PTI had expanded into multiple product divisions, leading to fragmented typography, contradictory color usage, and redundant UI engineering efforts across teams.',
      cards: [
        {
          title: 'Visual fragmentation',
          items: [
            'Five different button styles across web and mobile products',
            'Inconsistent brand blue and orange shades across departments',
            'Zero shared component documentation for onboarding designers'
          ]
        },
        {
          title: 'Engineering rework',
          items: [
            'Frontend developers wrote custom CSS for every new landing page',
            'Design token changes required weeks of manual code updates',
            'Accessibility audit failures due to low-contrast color choices'
          ]
        },
        {
          title: 'Slow product velocity',
          items: [
            'Design review bottlenecks before every release cycle',
            'Marketing assets clashed with core product UI aesthetics',
            'Difficulty rolling out dark mode or localized typography scales'
          ]
        }
      ],
      image: '/assets/media/home-media-07-86798e6a527e.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Create an authoritative digital brand system and token architecture that aligns brand identity, accessibility guidelines, and engineering handoff into one seamless source of truth.',
      constraints: [
        'Must support both legacy web codebases and modern React/Vite applications',
        'Respect existing brand heritage while upgrading contrast for accessibility',
        'Cross-functional buy-in required from marketing, product, and leadership',
        'Must include automated export pipelines from Figma to GitHub'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'Tokens are the universal translation layer between design and code.',
      cards: [
        { title: 'Semantic over literal.', desc: 'Name tokens by intent (`color-action-primary`) rather than value (`color-orange-500`).' },
        { title: 'Documentation must be live.', desc: 'Static PDF brand guidelines become obsolete the week they are published.' },
        { title: 'Adopt gradually.', desc: 'Enabling teams to adopt tokens incrementally beats high-risk big bang rewrites.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-07-86798e6a527e.webp',
      decisions: [
        {
          title: 'Three-Tier Token Architecture',
          constraint: 'Brand changes caused broken components across different products.',
          whatIDid: 'Structured tokens into Global (Raw values) → Semantic (Purpose) → Component (Specific parts).',
          why: 'Allows global retheming without breaking individual component layout rules.'
        },
        {
          title: 'Interactive Web Guideline Portal',
          constraint: 'Developers and agencies did not read 100-page PDF brand manuals.',
          whatIDid: 'Built a search-indexed web portal with live code snippets, copyable tokens, and downloadable SVG assets.',
          why: 'Engineers copy verified CSS tokens directly into their pull requests in seconds.'
        },
        {
          title: 'WCAG AAA Color Contrast Pairing Engine',
          constraint: 'Previous orange and blue combinations failed accessibility audits.',
          whatIDid: 'Calibrated color luminance curves to guarantee 7:1 contrast on both light and dark backgrounds.',
          why: 'Eliminates legal compliance risks and ensures readability for all users.'
        },
        {
          title: 'Automated Token GitHub Sync',
          constraint: 'Designers updated Figma files while developers used outdated CSS.',
          whatIDid: 'Created an automated GitHub Action syncing Figma Variables directly into JSON and CSS files.',
          why: 'Maintains 100% parity between design canvas and production code automatically.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'A living design foundation that scales across every touchpoint.',
      cards: [
        { title: 'Token Foundation', desc: 'Over 240 structured design tokens for color, typography, spacing, and elevation.' },
        { title: 'Figma Library', desc: '60+ core components with robust auto-layout and responsive constraints.' },
        { title: 'Interactive Portal', desc: 'Live documentation site with code sandbox and search.' },
        { title: 'Accessibility Matrix', desc: 'Built-in contrast verifier for compliant text and background pairs.' },
        { title: 'Dark Mode Tokens', desc: 'Automated dark mode semantic mappings for seamless theme switching.' },
        { title: 'Icon System', desc: 'Unified SVG icon set designed on a 24px grid with consistent stroke weight.' }
      ],
      image: '/assets/media/home-media-07-86798e6a527e.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: '65% Faster UI Builds', desc: 'Engineers assemble verified production screens from ready-made tokens.' },
        { title: 'Zero Design Drift', desc: 'Shared component library keeps marketing and web products strictly unified.' },
        { title: 'Instant Theming', desc: 'Brand refreshes can be deployed company-wide by modifying core token files.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Creating over 50 specific component variants for niche edge cases.',
      problem: 'Designers were overwhelmed by menu complexity in Figma.',
      fix: 'Consolidated into 12 composable base components with flexible property slots.',
      learning: 'Flexibility beats endless variant permutations every time.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'The brand foundation itself became the corporate design system standard, featuring complete typography hierarchies, spacing grids, and color tokens.',
      images: [
        '/assets/media/home-media-07-86798e6a527e.webp',
        '/assets/media/home-media-04-f775f2921176.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Interactive documentation portal, component sandbox, and brand asset repository.',
      screens: [
        '/assets/media/home-media-07-86798e6a527e.webp',
        '/assets/media/home-media-08-9e38bea4f09c.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Adoption is social', desc: 'A design system succeeds only if designers and engineers genuinely enjoy using it.' },
        { title: 'Tokens bridge the gap', desc: 'Speaking the same token language eliminates endless handoff arguments.' },
        { title: 'Start with foundations', desc: 'Get spacing, color, and typography right before building complex widgets.' },
        { title: 'Maintenance is continuous', desc: 'A design system is a living product with release notes and governance.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Involve engineers on day 1', desc: 'Pair program with frontend leads during token naming definition.' },
        { title: 'Create linting rules', desc: 'Implement ESLint rules that flag hardcoded hex codes in code reviews.' },
        { title: 'Add animation tokens', desc: 'Standardize motion curves and duration tokens early in the process.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Must support legacy CSS and modern Tailwind/CSS Module environments',
        'Compliance with strict enterprise WCAG AAA accessibility contrast',
        'Zero breaking changes to currently live customer-facing products',
        '7-week timeline to publish v1.0 documentation'
      ]
    }
  },
  {
    id: 'sdd-website-revamp',
    title: 'SDD WEBSITE REVAMP',
    slug: 'sdd-website-revamp',
    heroSubtitle: 'Reimagining the enterprise corporate web portal with performance-first editorial layouts, modular case showcases, and accessible typographic scale.',
    category: 'archive',
    categoryLabel: 'Web Architecture',
    mediaNote: 'Corporate web presence, service taxonomy, and case showcases',
    coverImage: '/assets/media/home-media-08-9e38bea4f09c.webp',
    year: '2026',
    order: 6,
    status: 'published',
    featured: true,
    summary: 'Full corporate web experience overhaul increasing inbound conversion through clear service taxonomy and interactive project showcases.',
    route: '/sdd-website-revamp',
    role: 'UI/UX & Web Designer',
    duration: '1 Month',
    deliverables: [
      '24 responsive desktop and mobile responsive templates',
      'Interactive project archive with multi-tier taxonomy filtering',
      'SEO metadata schema & performance-optimized asset structure',
      'Content management guidelines for editorial marketing team'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'The legacy corporate website was slow, text-heavy, and failed to clearly communicate SDD’s modern technical capabilities, resulting in poor lead conversion and high bounce rates.',
      cards: [
        {
          title: 'High bounce rate',
          items: [
            'Over 60% of visitors left after reading only the hero banner',
            'Service offerings were buried in dense wall-of-text paragraphs',
            'Slow page load times exceeding 4.5 seconds on mobile'
          ]
        },
        {
          title: 'Weak portfolio showcase',
          items: [
            'Past case studies lacked visual impact and client metrics',
            'No interactive filtering to explore projects by industry',
            'Missing clear call-to-actions on project completion pages'
          ]
        },
        {
          title: 'Outdated brand perception',
          items: [
            'Visual aesthetics looked like early 2010s generic corporate templates',
            'Non-responsive layout broke on contemporary tablet viewports',
            'Typography hierarchy lacked editorial presence and confidence'
          ]
        }
      ],
      image: '/assets/media/home-media-08-9e38bea4f09c.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Redesign the corporate website into a dynamic, performance-first marketing engine that showcases technical craftsmanship, engages enterprise clients, and drives qualified inbound leads.',
      constraints: [
        'Must achieve 95+ Google Lighthouse performance scores on mobile and desktop',
        'Incorporate multi-industry case studies without overwhelming first-time visitors',
        'Support smooth editorial publishing for the non-technical marketing team',
        'Strict 1-month delivery timeline for international summit launch'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'Enterprise clients buy case studies, not generic promises.',
      cards: [
        { title: 'Show the work first.', desc: 'Real project screenshots and quantifiable metrics convert 3x better than abstract claims.' },
        { title: 'Editorial whitespace breathes.', desc: 'High typography contrast with generous spacing creates an immediate perception of premium caliber.' },
        { title: 'Speed is credibility.', desc: 'A page that loads instantly creates an unconscious perception of technical excellence.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-08-9e38bea4f09c.webp',
      decisions: [
        {
          title: 'Editorial Hero with Visual Reel',
          constraint: 'Visitors did not understand SDD’s multifaceted services.',
          whatIDid: 'Created a punchy headline supported by a curated, interactive showcase reel of recent client work.',
          why: 'Engages visitors in the first 5 seconds with tangible proof of quality.'
        },
        {
          title: 'Tag-Based Portfolio Filter with Live Counter',
          constraint: 'Over 40 projects across different industries needed organization.',
          whatIDid: 'Implemented an instant-filtering grid with active category chips and project counts.',
          why: 'Prospective clients find relevant industry work in a single click without page reloads.'
        },
        {
          title: 'Modular Storytelling Case Template',
          constraint: 'Case studies were previously inconsistent in depth and structure.',
          whatIDid: 'Standardized case studies around Problem, Strategy, Execution, and Measured Impact blocks.',
          why: 'Establishes a recognizable reading rhythm that highlights strategic value.'
        },
        {
          title: 'Direct "Let\'s Talk" Conversion Dock',
          constraint: 'Contact forms were hidden in the footer or on a separate page.',
          whatIDid: 'Built a persistent header and bottom conversion strip with direct availability status.',
          why: 'Minimizes friction when an executive decides to reach out.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'A bold, editorial digital presence that commands authority.',
      cards: [
        { title: 'Editorial Architecture', desc: 'Distinct typography and generous whitespace emphasizing key messages.' },
        { title: 'Interactive Case Grid', desc: 'Fast client filtering by industry, technology, and project scope.' },
        { title: 'Sub-second Loading', desc: 'Next-gen WebP images and minimal JavaScript footprint.' },
        { title: 'Responsive Excellence', desc: 'Pixel-perfect typography and layouts across 1440px desktop down to 375px mobile.' },
        { title: 'Conversion Triggers', desc: 'Strategic booking anchors and email links embedded in high-intent sections.' },
        { title: 'Accessible Semantics', desc: 'Proper heading structure, aria labels, and keyboard navigation support.' }
      ],
      image: '/assets/media/home-media-08-9e38bea4f09c.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: '3.2x Lead Inquiries', desc: 'Clear conversion anchors increased inbound contact submissions significantly.' },
        { title: 'Under 1.2s Load Time', desc: 'Optimized performance keeps bounce rates down and boosts SEO ranking.' },
        { title: 'Client Trust Established', desc: 'Transparent case studies with quantifiable outcomes instill confidence.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Autoplaying video backgrounds in the hero section.',
      problem: 'Caused stuttering and battery drain on mobile phones on slow networks.',
      fix: 'Replaced with crisp, responsive WebP image collages with subtle CSS hover transitions.',
      learning: 'Performance and reliability always take precedence over decorative gimmicks.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'Developed a high-contrast editorial typographic scale paired with rich monochrome surfaces and vibrant orange accent cues for call-to-actions.',
      images: [
        '/assets/media/home-media-08-9e38bea4f09c.webp',
        '/assets/media/home-media-07-86798e6a527e.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Modernized homepage, interactive portfolio directory, and detailed project case study layouts.',
      screens: [
        '/assets/media/home-media-08-9e38bea4f09c.webp',
        '/assets/media/home-media-04-f775f2921176.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Clarity over cleverness', desc: 'Saying what you do clearly always beats vague creative slogans.' },
        { title: 'Typography carries the weight', desc: 'Strong font hierarchy does 80% of the heavy lifting in good web design.' },
        { title: 'Speed is a feature', desc: 'A fast site immediately differentiates you from clunky competitors.' },
        { title: 'Make contacting effortless', desc: 'Never hide your email or booking link behind multiple hoops.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Add client testimonials', desc: 'Include video snippets or direct quotes beside each project metric.' },
        { title: 'Integrate live calendar', desc: 'Allow visitors to book discovery calls directly into Google Calendar.' },
        { title: 'Build micro-animations', desc: 'Incorporate tasteful scroll-triggered diagram reveals for technical workflows.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Strict 1-month turnaround deadline ahead of major summit',
        'Zero compromise on 90+ Lighthouse mobile performance scores',
        'Must work smoothly across Safari, Chrome, Edge, and Firefox',
        'Integration with headless CMS for marketing team publishing'
      ]
    }
  },
  {
    id: 'taman-safari-digital-map',
    title: 'TAMAN SAFARI DIGITAL MAP',
    slug: 'taman-safari-digital-map',
    heroSubtitle: 'Interactive park wayfinding, animal habitat schedule, and live tram tracker for thousands of daily park visitors navigating 50+ hectares.',
    category: 'product',
    categoryLabel: 'Spatial & Wayfinding',
    mediaNote: 'Spatial wayfinding, live tram tracking, and show schedules',
    coverImage: '/assets/media/home-media-09-2fbc21a135bd.webp',
    year: '2026',
    order: 7,
    status: 'published',
    featured: true,
    summary: 'Designed for high-sunlight outdoor usage, the interactive spatial map guides families through habitat zones, feeding demonstrations, and park services in real time.',
    route: '/taman-safari-digital-map',
    role: 'Interaction Designer',
    duration: '6 Weeks',
    deliverables: [
      'Interactive SVG vector map with 4 zoom levels and layer toggles',
      'Live show alert notification system & itinerary builder',
      'High-glare outdoor color system with high-contrast icons',
      'Field testing report conducted with park visitors across 3 weekends'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'Visitors navigating the massive 50-hectare wildlife park frequently missed scheduled feeding shows, got lost on winding jungle trails, and had to rely on paper maps that quickly tore in the rain.',
      cards: [
        {
          title: 'Missed scheduled shows',
          items: [
            'Popular animal feeding demonstrations had strict, non-repeating schedules',
            'Visitors didn’t know how long it took to walk between distant zones',
            'Show cancellations due to weather were not broadcast in real time'
          ]
        },
        {
          title: 'Navigational confusion',
          items: [
            'Winding mountain terrain made paper map orientation difficult',
            'Parents with strollers couldn’t identify wheelchair-accessible ramps',
            'Restrooms, water stations, and first aid were hard to locate quickly'
          ]
        },
        {
          title: 'High-glare outdoor environment',
          items: [
            'Direct tropical sunlight made typical smartphone screens impossible to read',
            'Weak cellular reception in dense canopy areas caused map loading failures',
            'Crowded park conditions made one-handed phone navigation necessary'
          ]
        }
      ],
      image: '/assets/media/home-media-09-2fbc21a135bd.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Design an interactive, ultra-readable mobile wayfinding companion that functions flawlessly offline, guides visitors to shows on time, and simplifies park navigation for families.',
      constraints: [
        'Must remain legible under blazing equatorial sunlight (high glare)',
        'Heavy forest canopy causes GPS drift and intermittent data drops',
        'Audience ranges from tech-savvy teenagers to elderly grandparents',
        'Complex park topology with stairs, steep inclines, and restricted tram paths'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'When people look at a map outdoors, they want the next turn, not a geography lesson.',
      cards: [
        { title: 'Time matters more than distance.', desc: 'Telling visitors "8 min walk with stroller" is far more helpful than "450 meters".' },
        { title: 'High contrast saves battery.', desc: 'High-contrast black lines on cream backgrounds eliminate the need for 100% phone screen brightness.' },
        { title: 'Next show countdowns.', desc: 'Displaying "Tiger Feeding in 12 mins" directly on the map marker drives immediate visitor action.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-09-2fbc21a135bd.webp',
      decisions: [
        {
          title: 'High-Contrast Outdoor Vector Map Styling',
          constraint: 'Bright sunlight washed out subtle map pastel shades.',
          whatIDid: 'Developed bold icon silhouettes and high-contrast contour paths with thick borders.',
          why: 'Ensures immediate legibility even when walking under direct midday sun.'
        },
        {
          title: 'Live Show Schedule Bar with "Remind Me" Push',
          constraint: 'Visitors repeatedly arrived at feeding shows 10 minutes late.',
          whatIDid: 'Created a horizontal timeline docked to the top with automated 15-minute departure alerts.',
          why: 'Gives families enough time to walk across zones and secure seats.'
        },
        {
          title: 'Offline-Cached Vector Tiles',
          constraint: 'Cellular dead zones under heavy rain forest trees.',
          whatIDid: 'Downloaded the full park vector layer package (under 4MB) on first open.',
          why: 'Map pans and zooms smoothly without buffering delays anywhere in the park.'
        },
        {
          title: 'Stroller & Accessibility Routing Filter',
          constraint: 'Steep jungle staircases trapped parents with strollers and wheelchair users.',
          whatIDid: 'Built an accessible path toggle that automatically routes around stairs and steep gradients.',
          why: 'Eliminates stressful dead-ends for families and visitors with mobility requirements.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'Effortless wayfinding and real-time scheduling in the palm of your hand.',
      cards: [
        { title: 'Vector Park Map', desc: 'Smooth zooming across animal zones, food courts, and emergency stations.' },
        { title: 'Live Tram Tracker', desc: 'Real-time location of park shuttle trams and estimated arrival times.' },
        { title: 'Show Countdown', desc: 'Dynamic schedule with walking time estimates from your current location.' },
        { title: 'Accessibility Routing', desc: 'Gentle slope navigation avoiding stairs for strollers and wheelchairs.' },
        { title: 'Animal Habitat Cards', desc: 'Fun educational facts, feeding hours, and audio guides for kids.' },
        { title: '100% Offline Mode', desc: 'Cached tiles and compass-guided navigation without internet access.' }
      ],
      image: '/assets/media/home-media-09-2fbc21a135bd.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: 'Zero Missed Shows', desc: 'Families reached scheduled demonstrations on time using walking estimates.' },
        { title: 'Reduced Lost Inquiries', desc: 'Information booth wayfinding questions dropped by over 50%.' },
        { title: 'Legible in Sunlight', desc: 'High-contrast palette received unanimous praise during park visitor testing.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Dense 3D rendered animal models on the map surface.',
      problem: 'Caused phone overheating and massive battery drain on hot afternoons.',
      fix: 'Replaced 3D models with crisp 2D vector badges that animate smoothly at 60fps.',
      learning: 'Battery preservation in outdoor settings is a core usability requirement.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'Designed high-contrast wayfinding tokens, recognizable animal silhouette iconography, and large touch badges calibrated for outdoor viewing.',
      images: [
        '/assets/media/home-media-09-2fbc21a135bd.webp',
        '/assets/media/home-media-06-74dffd74e3b2.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Interactive map canvas, live show schedule drawer, and animal encyclopedia screens.',
      screens: [
        '/assets/media/home-media-09-2fbc21a135bd.webp',
        '/assets/media/home-media-07-86798e6a527e.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Sunlight is the ultimate test', desc: 'Colors that look subtle in Figma completely vanish outdoors.' },
        { title: 'Families move slowly', desc: 'Always buffer walking estimates for crowds and young children.' },
        { title: 'Safety first', desc: 'First aid and emergency exits must always be visible regardless of map zoom.' },
        { title: 'Audio aids accessibility', desc: 'Audio show announcements help visitors who don’t want to stare at screens.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Augmented reality wayfinding', desc: 'Test AR camera arrows pointing down trails for immediate direction.' },
        { title: 'Food pre-ordering', desc: 'Allow visitors to order lunch at park cafes while walking between zones.' },
        { title: 'Photo souvenir finder', desc: 'Help visitors locate park photographer shots taken during their safari tour.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Strict high-contrast outdoor visibility requirement',
        'Complete offline caching under 5MB to handle cellular dead zones',
        'Bilingual Indonesian and English show schedules and animal facts',
        '6-week design and park field testing timeline'
      ]
    }
  },
  {
    id: 'sdd-marketing-archive',
    title: 'SDD MARKETING TOOLS',
    slug: 'sdd-marketing-archive',
    heroSubtitle: 'Internal growth tooling, campaign asset generators, and marketing automation dashboard for multi-channel publishing.',
    category: 'archive',
    categoryLabel: 'Design Tools',
    mediaNote: 'Campaign automation, banner generation, and digital publishing tools',
    coverImage: '/assets/media/home-media-11-2c67061de865.webp',
    year: '2026',
    order: 8,
    status: 'published',
    featured: true,
    summary: 'Standardized growth collateral workflows and creative automation tools cutting campaign preparation turnaround times by over 60%.',
    route: '/sdd-marketing-archive',
    role: 'UI/UX Designer',
    duration: '3 Weeks',
    deliverables: [
      'Marketing campaign creation wizard with live banner preview',
      'Asset export queue with automatic multi-aspect ratio rendering',
      'Design token configuration panel for marketing specialists',
      'Internal user documentation and keyboard shortcut guide'
    ],
    figmaUrl: 'https://www.figma.com',
    figmaButtonText: 'View Figma File',
    problem: {
      headline: 'THE PROBLEM',
      intro: 'Marketing team members were bottlenecked waiting for designers to generate standard banner resizes for every social campaign, causing delayed product launches and wasted design hours.',
      cards: [
        {
          title: 'Design bottleneck',
          items: [
            'Designers spent 15+ hours weekly resizing banners into 8 formats',
            'Text copy errors required repeating manual export cycles',
            'Brand logos and colors were frequently misused by non-designers'
          ]
        },
        {
          title: 'Slow campaign turnaround',
          items: [
            'Urgent seasonal promotions took 3 days to get creative assets approved',
            'Inconsistent font weights and line heights across ad networks',
            'No centralized repository for approved campaign photography'
          ]
        },
        {
          title: 'Multi-channel chaos',
          items: [
            'Different dimension requirements for Instagram, LinkedIn, and Google Ads',
            'High risk of uncompressed files exceeding ad network weight limits',
            'Lack of automated localization for regional campaigns'
          ]
        }
      ],
      image: '/assets/media/home-media-11-2c67061de865.webp'
    },
    challenge: {
      headline: 'MY CHALLENGE',
      statement: 'Design an intuitive internal creative automation tool that allows non-designers to generate brand-compliant marketing assets across all dimensions in seconds.',
      constraints: [
        'Strict brand guidelines with zero tolerance for distorted typography or logos',
        'Must run in modern web browsers without requiring Figma or Photoshop licenses',
        'Output formats must support high-res PNG, WebP, and vector SVG',
        'Rapid 3-week design and prototyping delivery window'
      ]
    },
    insights: {
      headline: 'The aha moment - insights',
      tagline: 'Constrained creativity is the secret to brand consistency at scale.',
      cards: [
        { title: 'Lock the foundations.', desc: 'Lock logo position, safe margins, and font scales so users cannot break the brand.' },
        { title: 'Live preview builds trust.', desc: 'Seeing all 8 banner aspect ratios update simultaneously as you type text is magical.' },
        { title: '1-click batch export.', desc: 'Exporting a zipped bundle of all ready-to-publish assets saves hours of tedious work.' }
      ]
    },
    keyDecisions: {
      headline: 'KEY DECISIONS & WHY?',
      image: '/assets/media/home-media-11-2c67061de865.webp',
      decisions: [
        {
          title: 'Split-Screen Canvas with Simultaneous Multi-Ratio Preview',
          constraint: 'Users had to design one banner at a time in legacy tools.',
          whatIDid: 'Built a real-time grid preview rendering 1:1, 16:9, 9:16, and 4:5 banners simultaneously as copy is typed.',
          why: 'Users instantly spot awkward text wraps across all aspect ratios before exporting.'
        },
        {
          title: 'Smart Text Auto-Shrink Algorithm',
          constraint: 'Long headlines in German or Indonesian overflowed tight banner containers.',
          whatIDid: 'Implemented intelligent font scaling that steps down typography to fit within safe bounds.',
          why: 'Guarantees text never clips or spills outside designated container margins.'
        },
        {
          title: 'Curated Brand Asset Palette with Approved Imagery',
          constraint: 'Non-designers uploaded low-resolution or off-brand photos.',
          whatIDid: 'Connected the tool to an approved cloud DAM containing pre-graded photography.',
          why: 'Ensures only high-quality, on-brand imagery makes it into live advertising campaigns.'
        },
        {
          title: '1-Click Batch ZIP Export',
          constraint: 'Downloading 8 individual files with proper naming conventions was error-prone.',
          whatIDid: 'Packaged all variations into a organized ZIP named by campaign code and date.',
          why: 'Marketing specialists upload cleanly named assets directly to Google Ads and Meta.'
        }
      ]
    },
    solution: {
      headline: 'SOLUTION',
      tagline: 'Self-service creative automation preserving strict brand integrity.',
      cards: [
        { title: 'Multi-Aspect Preview', desc: 'Simultaneous rendering across Story (9:16), Square (1:1), and Banner (16:9).' },
        { title: 'Locked Brand Guardrails', desc: 'Safe margins, approved color palettes, and typography tokens locked in place.' },
        { title: 'Approved Photo Library', desc: 'Instant search across high-resolution, brand-compliant photography.' },
        { title: 'Smart Auto-Typography', desc: 'Automatic font scaling ensuring copy always fits inside safe margins.' },
        { title: 'Batch ZIP Packaging', desc: 'One-click export producing compressed WebP and PNG files ready for ad networks.' },
        { title: 'Preset Templates', desc: 'Pre-approved layouts for webinars, product announcements, and hiring posts.' }
      ],
      image: '/assets/media/home-media-11-2c67061de865.webp'
    },
    whyWorks: {
      headline: 'Why this approach works?',
      cards: [
        { title: '60% Faster Campaigns', desc: 'Asset generation time reduced from 3 business days to under 5 minutes.' },
        { title: '100% Brand Compliance', desc: 'Locked templates prevented unauthorized fonts, colors, and stretched logos.' },
        { title: 'Designers Freed Up', desc: 'Senior designers reclaimed 15+ hours weekly to focus on strategic product work.' }
      ]
    },
    whatNeededWork: {
      headline: 'but.. WHAT NEEDED WORK?',
      firstAttempt: 'Allowing users to drag and drop text elements anywhere on canvas.',
      problem: 'Non-designers placed text over busy photo backgrounds, ruining readability.',
      fix: 'Replaced free-form canvas dragging with predefined, contrast-tested layout slots.',
      learning: 'Restrictions prevent mistakes and accelerate workflow speed.'
    },
    designSystem: {
      headline: 'DESIGN SYSTEM',
      desc: 'Created an efficient internal dark-mode productivity UI with compact input controls, real-time status pills, and fast keyboard navigation.',
      images: [
        '/assets/media/home-media-11-2c67061de865.webp',
        '/assets/media/home-media-04-f775f2921176.webp'
      ]
    },
    product: {
      headline: 'THE PRODUCT',
      desc: 'Campaign creator wizard, live multi-ratio preview canvas, and batch asset export queue.',
      screens: [
        '/assets/media/home-media-11-2c67061de865.webp',
        '/assets/media/home-media-07-86798e6a527e.webp'
      ]
    },
    learnings: {
      headline: 'LEARNINGS',
      cards: [
        { title: 'Empowerment beats policing', desc: 'Giving teams tools to do it right works far better than constantly rejecting their designs.' },
        { title: 'Live preview is persuasive', desc: 'Showing instant visual consequences stops bad design choices immediately.' },
        { title: 'Naming conventions matter', desc: 'Organized file exports save countless hours in marketing distribution.' },
        { title: 'Tools reflect brand values', desc: 'Internal productivity tools deserve the same UX care as customer products.' }
      ]
    },
    whatDoDifferently: {
      headline: 'WHAT I\'D DO DIFFERENTLY',
      cards: [
        { title: 'Direct Ad API publishing', desc: 'Push generated banners directly into Google Ads and Meta Ads Manager.' },
        { title: 'AI copy variations', desc: 'Incorporate localized headline suggestion prompts for A/B testing.' },
        { title: 'Video motion export', desc: 'Support animated MP4 exports with simple CSS keyframe motion presets.' }
      ]
    },
    projectConstraints: {
      headline: 'PROJECT CONSTRAINTS',
      intro: 'What shaped the work:',
      items: [
        'Strict 3-week design sprint to resolve immediate marketing bottlenecks',
        'Must run natively in standard web browsers with zero software installation',
        'Strict brand token alignment with PTI Brand Foundation guidelines',
        'Exported file sizes must strictly comply with ad network upload limits'
      ]
    }
  }
];

export const initialExperience: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Junior UI/UX Designer',
    company: 'Aarawan Media & Tech · Kathmandu, Nepal',
    dates: 'Appointed after internship',
    duration: 'Progressed from internship',
    current: true,
    headline: 'Product design & development',
    description: 'I design and refine software product interfaces with a focus on clarity, usability, and consistent interaction patterns while collaborating with developers to support accurate implementation.',
    tags: [
      'UI Design',
      'User Flows',
      'Interaction Design',
      'Design Systems',
      'Usability Testing',
      'Workflow Design',
      'Developer Handoff',
      'Figma',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Cross-functional Collaboration'
    ],
    order: 1,
    visible: true
  },
  {
    id: 'exp-2',
    role: 'UI/UX Design Intern',
    company: 'Aarawan Media & Tech · Kathmandu, Nepal',
    dates: '14 Jun — 17 Sep 2026',
    duration: '3-month internship',
    current: false,
    headline: 'Assisted with usability testing, interface reviews, and refinements based on feedback.',
    description: 'Created reusable interface elements and collaborated with the product development team while supporting clear, usable software interfaces.',
    tags: [
      'Interface Reviews',
      'Reusable Components',
      'Usability Testing',
      'Product Collaboration',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Developer Handoff',
      'Cross-functional Collaboration'
    ],
    order: 2,
    visible: true
  }
];

export const initialEducation: EducationItem[] = [
  {
    id: 'edu-1',
    title: 'Bachelor of Business Studies',
    institution: 'Makawanpur Multiple Campus',
    location: 'Hetauda, Makawanpur',
    dates: '4th year · Running',
    status: 'Running',
    program: 'BBS',
    year: '4th',
    description: 'Current study in Business Studies alongside hands-on UI/UX product design practice.',
    tags: ['Business Studies', 'UI/UX Design', 'Product Design', 'Workflow Design', 'Usability Testing', 'Developer Collaboration', 'Figma', 'Adobe Illustrator'],
    order: 1,
    visible: true
  },
  {
    id: 'edu-2',
    title: 'Nepali · Bhojpuri',
    institution: 'English · Hindi',
    location: 'Nepal',
    dates: 'Languages',
    status: '04 listed',
    program: 'Communication',
    year: '4',
    description: 'Four languages listed in my CV alongside an ongoing Bachelor of Business Studies and hands-on UI/UX product work.',
    tags: ['Nepali', 'Bhojpuri', 'English', 'Hindi', 'Figma'],
    order: 2,
    visible: true
  }
];
