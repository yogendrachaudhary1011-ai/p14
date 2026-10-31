import { SiteSettings, Project, ExperienceItem, EducationItem } from '../types';

export const initialSiteSettings: SiteSettings = {
  siteTitle: 'Yogendra Chaudhary — UI/UX & Product Designer Portfolio',
  brandName: 'YOGENDRA',
  brandRole: 'PRODUCT DESIGNER',
  email: 'yogendrachaudhary2061@gmail.com',
  phone: '9843688407',
  location: 'Kathmandu, Nepal',
  aboutIntro: 'I design intuitive software interfaces, reusable UI components, and user-centered workflows. My process combines interaction design, usability testing, and close developer collaboration to make complex products easier to understand and use.',
  aboutDetails: 'I work on multi-step workflows, enterprise software, service platforms, and responsive design systems. My focus is on making product states visible, actions safe, and component handoff precise.',
  profileImage: '/assets/media/hero-id-portrait.jpeg',
  homeSections: { hero: true, work: true, about: true, connect: true },
  homeSectionOrder: ['hero', 'work', 'about', 'connect'],
  aboutSections: { profile: true, experience: true, education: true },
  aboutSectionOrder: ['profile', 'experience', 'education'],
  siteCopy: {
    navHome: 'Home', navWork: 'Work', navAbout: 'About', navResume: 'Resume', navContact: "Let's Talk",
    heroFirstName: 'YOGENDRA', heroLastName: 'CHAUDHARY', heroRole: 'PRODUCT DESIGNER',
    heroDescription: 'A UI/UX and Product Designer focused on intuitive software interfaces and reusable components — turning complex product requirements into clear workflows and usable experiences people can navigate with confidence.',
    heroAboutButton: 'Get to Know Me', heroWorkButton: 'Work Overview',
    idCardName: 'Yogendra Chaudhary', idCardTopline: 'Design practice / 2026', idCardRole: 'Product Designer', idCardMicroline: 'Flows → Interfaces → Products', idCardDescription: 'Designing clear, usable product experiences.',
    orbitFigma: 'Figma', orbitPhotoshop: 'Photoshop', orbitIllustrator: 'Illustrator', orbitPremiere: 'Premiere', orbitFramer: 'Framer',
    orbitPhotoshopMark: 'Ps', orbitIllustratorMark: 'Ai', orbitPremiereMark: 'Pr', orbitFramerMark: 'Fr',
    workHeading: 'SELECTED WORK', workDescription: 'Product design work across business software, web experiences, and service platforms.',
    filterAll: 'All', filterProduct: 'Product Design', filterArchive: 'Design Practice',
    emptyProjectsHeading: 'No projects currently published', emptyProjectsDescription: 'New case studies can be created anytime from the admin panel.', emptyProjectsButton: '+ Add Project',
    aboutHeading: 'ABOUT ME', aboutCaption: 'Yogendra / flows → interfaces → products', aboutNavAbout: '01 / About', aboutNavExperience: '02 / Experience', aboutNavEducation: '03 / Education',
    viewResume: 'View Resume', behance: 'Behance', linkedIn: 'LinkedIn',
    experienceHeading: 'Experience', certificatesHeading: 'Certificates & Credentials', certificateView: 'View certificate / PDF', educationHeading: 'EDUCATION', currentLabel: 'CURRENT', connectHeading: "LET'S CONNECT",
    footerEmail: 'Email', footerResume: 'Resume',
    backToOverview: 'Back to Overview', backToProjects: 'Back to All Projects', backToTop: 'Back to top', viewNextProject: 'View next project', caseStudyLabel: 'Case Study',
    roleLabel: 'My Role:', durationLabel: 'Duration:', deliverablesLabel: 'Deliverables', figmaButton: 'View Figma File', liveProjectButton: 'Live Project URL',
    jumpTo: 'Jump to:', sectionsFallback: 'Sections', navMenuOpen: 'Menu', navMenuClose: 'Close',
    comparisonFirstAttempt: 'First Attempt:', comparisonProblem: 'Problem', comparisonFix: 'Fix:', comparisonLearning: 'Learning:',
    decisionConstraint: 'Constraint:', decisionAction: 'What I did:', decisionWhy: 'Why'
  },
  behanceUrl: 'https://www.behance.net/yogendrachaudhary1',
  linkedinUrl: 'https://www.linkedin.com/in/yogendrach',
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
  }
];

