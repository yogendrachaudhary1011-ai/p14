import React, { useState, useEffect } from 'react';
import { Project } from '../../types';

interface ProjectDetailTemplateProps {
  project: Project;
  onNavigate?: (path: string) => void;
}

export const ProjectDetailTemplate: React.FC<ProjectDetailTemplateProps> = ({ project, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<string>('the-problem');
  const [designSlideIndex, setDesignSlideIndex] = useState<number>(0);

  // Active section tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = [
        'the-problem',
        'my-challenge',
        'insights',
        'key-decisions',
        'solutions',
        'what-didnt-work',
        'design-system',
        'the-product',
        'learnings',
        'differently',
        'constraints'
      ];
      
      const scrollPosition = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Safe fallback data mirroring the exact template if any field is not customized
  const heroSubtitle = project.heroSubtitle || 
    'A case study on designing the complete School of Management, Tribhuvan University website, from landing page to registration, across desktop and mobile, as a design intern at Aarawan Media & Tech.';
  
  const overviewText = project.summary || 
    'The School of Management at Tribhuvan University (SOMTU) is a Kathmandu-based management school. I designed its public website: how people discover programs, apply, read notices, join events, explore research, and find official documents.';

  const roleText = project.role || 'UI/UX Design Intern';
  const durationText = project.duration || '1 Month';
  const deliverablesList = project.deliverables && project.deliverables.length > 0 ? project.deliverables : [
    '87 screens and states in Figma',
    '81 component variants',
    'Desktop (1440 px) and mobile (428 px)',
    'A design reference document for developers'
  ];

  const problem = project.problem || {
    headline: 'THE PROBLEM',
    intro: 'Existing pet tracking apps had less than 20% weekly retention. Dog owners were downloading them, logging a few activities, then abandoning them within days.',
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
    image: project.coverImage || 'https://placehold.co/1079x660/111418/f37021?text=SOMTU+Research+%26+Problem+Discovery'
  };

  const challenge = project.challenge || {
    headline: 'MY CHALLENGE',
    statement: 'Design one connected website where every audience can reach their task in a few taps, on desktop and mobile, while keeping the School of Management’s brand consistent across more than ten feature areas.',
    constraints: [
      'Many content types: programs, news, notices, events, research, forms, documents',
      'An established blue and orange brand to extend, not replace',
      'Real content, long lists, and PDF-based notices',
      'Two target sizes, 1440 px and 428 px, designed as equals'
    ]
  };

  const insights = project.insights || {
    headline: 'The aha moment - insights',
    tagline: 'Consistency is emotional, not functional.',
    cards: [
      {
        title: 'People come to do one thing.',
        desc: 'Apply, check a result, find a notice. Every page should make its main action obvious.'
      },
      {
        title: 'Lists are the website.',
        desc: 'News, notices, events, research, and documents are all lists, so one search and filter pattern can serve them all.'
      },
      {
        title: 'Long forms need a map.',
        desc: 'A stepper, a review step, and a confirmation turn a heavy application into a guided path.'
      }
    ]
  };

  const keyDecisions = project.keyDecisions?.decisions || [
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
      constraint: 'A university home page can say everything and help no one.',
      whatIDid: 'A full-width “Knowledge Without Borders” hero with Explore Programs and Apply Now, then programs, milestones, and faculty.',
      why: 'Browsers and ready-to-apply visitors both get an obvious first tap.'
    },
    {
      title: 'Updates and notices as two different experiences',
      constraint: 'Stories are browsed, notices are looked up.',
      whatIDid: 'Two tabs with shared search and filters. Updates lead with a featured story. Notices use date-first cards, category chips with counts, and a mobile filter sheet. Notice pages add status, dates, Share, and Download PDF.',
      why: 'Each content type gets the layout that suits how it is read.'
    },
    {
      title: 'Event pages that change with the event',
      constraint: 'Events have different states before, during, and after.',
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
      constraint: 'Academic works need credibility and structured citation.',
      whatIDid: 'A featured study, filters for publications, research projects, working projects, and case studies, a sort control, pagination, and detail pages with Download PDF and an accordion for long content on mobile.',
      why: 'Academic content gets credibility and depth without overwhelming a small screen.'
    }
  ];

  const solution = project.solution || {
    headline: 'SOLUTION',
    tagline: 'Six ideas held the whole website together.',
    cards: [
      {
        title: 'One shell',
        desc: 'Shared header, footer, and Apply Now on every page.'
      },
      {
        title: 'Action-first pages',
        desc: 'Each page makes its main action obvious.'
      },
      {
        title: 'One list pattern',
        desc: 'Search, chips, and pagination reused for news, notices, events, research, and resources.'
      },
      {
        title: 'Guided forms',
        desc: 'Steppers, review, and confirmation for long tasks.'
      },
      {
        title: 'State-aware screens',
        desc: 'Upcoming, ended, empty, and success states designed, not left to chance.'
      },
      {
        title: 'Mobile as an equal',
        desc: 'Every chapter designed at 428 px with its own patterns.'
      }
    ],
    image: project.coverImage || 'https://placehold.co/1079x660/111418/f37021?text=SOMTU+Integrated+Interface+Solutions'
  };

  const whyWorksCards = project.whyWorks?.cards || [
    {
      title: 'Familiar everywhere',
      desc: 'Learn one page and you know the rest.'
    },
    {
      title: 'Faster tasks',
      desc: 'Search and filters reach any item in a few taps.'
    },
    {
      title: 'Easier to build',
      desc: 'Repeated patterns and a documented library cut handoff questions.'
    }
  ];

  const whatNeededWork = project.whatNeededWork || {
    headline: 'but.. WHAT NEEDED WORK?',
    firstAttempt: 'Show every category chip on mobile, as on desktop.',
    problem: 'Seven chips with counts overflowed a 428 px screen and pushed results out of sight.',
    fix: 'Moved the full set into a Filter Content sheet with sort, reset, and apply, and kept the main screen focused on results.',
    learning: 'Desktop patterns do not shrink. They have to be redesigned for thumbs.'
  };

  const designSystemDesc = project.designSystem?.desc || 
    'I extended the School of Management’s blue and orange brand into a system for content-heavy pages: a campus-photo banner under the header, white cards on a pale surface, and orange reserved for actions. All 81 component variants are documented.';

  const designSystemImages = (project.designSystem?.images && project.designSystem.images.length > 0)
    ? project.designSystem.images
    : [
        'https://placehold.co/884x660/161922/ffffff?text=Design+System+Typography+%26+Colors',
        'https://placehold.co/884x660/181c26/ffffff?text=Component+Variants+%26+Buttons',
        'https://placehold.co/884x660/141822/ffffff?text=Form+Steppers+%26+Input+States',
        'https://placehold.co/884x660/1c1f2b/ffffff?text=Navigation+Bar+%26+Filter+Chips',
        'https://placehold.co/884x660/171a25/ffffff?text=Card+Grids+%26+Tables'
      ];

  const productScreens = (project.product?.screens && project.product.screens.length > 0)
    ? project.product.screens
    : [
        'https://placehold.co/554x1200/181c25/ffffff?text=SOMTU+Homepage+Desktop',
        'https://placehold.co/554x1200/141721/ffffff?text=Programs+Catalog+View',
        'https://placehold.co/554x1200/191d27/ffffff?text=Admissions+7-Step+Application',
        'https://placehold.co/554x1200/171b25/ffffff?text=Notices+%26+Examinations+List',
        'https://placehold.co/554x1200/151924/ffffff?text=Research+Publications+Page',
        'https://placehold.co/554x1200/1b1e2a/ffffff?text=Event+Detail+%26+Registration',
        'https://placehold.co/554x1200/161a23/ffffff?text=Mobile+428px+Experience'
      ];

  const learningsCards = project.learnings?.cards || [
    {
      title: 'Systems beat pages',
      desc: 'A shared shell and list pattern made ten feature areas feel like one product.'
    },
    {
      title: 'Design every state',
      desc: 'Upcoming, ended, empty, and success states are part of the experience.'
    },
    {
      title: 'Match layout to reading',
      desc: 'Stories, notices, and research each needed their own layout.'
    },
    {
      title: 'Mobile is its own design',
      desc: 'Filters, forms, and long pages needed new patterns, not smaller ones.'
    }
  ];

  const whatDoDifferentlyCards = project.whatDoDifferently?.cards || [
    {
      title: 'Test with real users',
      desc: 'Run quick tests on applying and finding a notice.'
    },
    {
      title: 'Document rationale',
      desc: 'Write short decision notes beside each chapter.'
    },
    {
      title: 'Plan for language',
      desc: 'Design an English and Nepali toggle for notices and forms.'
    }
  ];

  const constraintsList = project.projectConstraints?.items || [
    'Internship project at Aarawan Media & Tech',
    'An existing School of Management brand',
    'Real content, including Nepali notices and PDFs',
    'Desktop at 1440 px and mobile at 428 px as the two target sizes'
  ];

  const heroImageSrc = project.coverImage || 'https://placehold.co/1539x728/111317/f37021?text=SOMTU+Flagship+Case+Study';

  return (
    <div className="w-full bg-black text-white font-['Plus_Jakarta_Sans'] flex flex-col items-center overflow-x-hidden selection:bg-[#f37021] selection:text-white">
      {/* Top back navigation bar */}
      <div className="w-full max-w-[1521px] px-8 pt-8 pb-4 flex justify-between items-center z-20">
        <button
          onClick={() => onNavigate ? onNavigate('/projects') : window.history.back()}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium py-2 px-3 rounded hover:bg-white/5 cursor-pointer"
        >
          <span className="material-symbols-rounded text-lg">arrow_back</span>
          <span>Back to All Projects</span>
        </button>
        <div className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
          Project Case Study · {project.year || '2026'}
        </div>
      </div>

      {/* Main Container matching w-[1521px] from provided code */}
      <div className="w-[1521px] max-w-full relative bg-black inline-flex flex-col justify-start items-start">
        {/* Subtle Decorative Background Grid lines exactly as provided */}
        <div className="w-full h-[735.20px] left-0 top-[1px] absolute opacity-5 pointer-events-none select-none overflow-hidden">
          <div className="w-px h-[735.20px] left-[108.63px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-px h-[735.20px] left-[325.88px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-px h-[735.20px] left-[543.14px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-px h-[735.20px] left-[760.40px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-px h-[735.20px] left-[977.65px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-px h-[735.20px] left-[1194.91px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-px h-[735.20px] left-[1412.16px] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[52.51px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[157.54px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[262.56px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[367.60px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[472.63px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[577.65px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
          <div className="w-[1520.80px] h-px left-0 top-[682.67px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0 rounded-xs"></div>
        </div>

        {/* Hero Header Section */}
        <div className="w-full max-w-[1520.80px] py-6 flex flex-col justify-between items-center relative z-10">
          <div className="w-[1399.13px] max-w-[94vw] flex flex-col justify-center items-center gap-6">
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="w-full md:w-[699.56px] flex flex-col justify-center items-start">
                <h1 className="text-white text-6xl sm:text-7xl md:text-9xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] leading-none md:leading-[179.20px] uppercase">
                  {project.title}
                </h1>
              </div>
              <div className="w-full md:w-[559.65px] pb-2 md:pb-5 flex flex-col justify-start items-start">
                <p className="text-white text-lg md:text-xl font-normal font-['Plus_Jakarta_Sans'] leading-7">
                  {heroSubtitle}
                </p>
              </div>
            </div>
            <div className="w-full h-0.5 bg-white opacity-80 my-2"></div>
          </div>
        </div>

        {/* Hero Banner Image + Metadata Overview Grid */}
        <div className="w-full max-w-[1520.80px] pb-20 flex flex-col justify-center items-center gap-16 relative z-10">
          <div className="w-[1399.13px] max-w-[94vw] flex flex-col justify-center items-center gap-16">
            {/* Top Large Hero Image */}
            <div className="w-full rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 flex justify-center items-center max-h-[728px]">
              <img
                src={heroImageSrc}
                alt={project.title}
                className="w-full h-auto object-cover max-h-[728px]"
                loading="eager"
              />
            </div>

            {/* Overview text + Metadata Table */}
            <div className="w-full flex flex-col justify-start items-start gap-12">
              <div className="w-full">
                <p className="text-white text-xl md:text-2xl font-normal font-['Plus_Jakarta_Sans'] leading-relaxed max-w-4xl">
                  {overviewText}
                </p>
              </div>

              {/* Metadata specs */}
              <div className="w-full md:w-[699.56px] flex flex-col justify-center items-start gap-8">
                <div className="w-full flex flex-col justify-center items-start gap-6">
                  {/* Role */}
                  <div className="w-full flex flex-col gap-4">
                    <div className="w-full flex justify-between items-baseline border-b border-white/10 pb-4">
                      <span className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">My Role:</span>
                      <span className="text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans']">{roleText}</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="w-full flex flex-col gap-4">
                    <div className="w-full flex justify-between items-baseline border-b border-white/10 pb-4">
                      <span className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">Duration:</span>
                      <span className="text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans']">{durationText}</span>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="w-full flex flex-col gap-4">
                    <div className="w-full flex justify-between items-start border-b border-white/10 pb-4">
                      <span className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">Deliverables</span>
                      <div className="text-right flex flex-col gap-1.5">
                        {deliverablesList.map((item, idx) => (
                          <div key={idx} className="text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans']">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Figma File Button */}
                {project.figmaUrl && (
                  <div className="pt-2">
                    <a
                      href={project.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded border border-white text-white text-base font-medium tracking-wide hover:bg-white hover:text-black transition-all duration-200"
                    >
                      {project.figmaButtonText || 'View Figma File'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-[1399.13px] max-w-[94vw] h-px bg-white/20 my-4"></div>

          {/* TWO-COLUMN CASE STUDY BODY: Left Sticky Anchor Menu + Right Rich Content */}
          <div className="w-[1399.13px] max-w-[94vw] flex flex-col lg:flex-row justify-between items-start gap-12 relative">
            
            {/* LEFT ANCHOR NAVIGATION MENU (w-72 sticky) */}
            <div className="w-full lg:w-72 sticky top-28 self-start flex flex-col gap-3 py-4 z-20 bg-black/80 backdrop-blur-md lg:bg-transparent rounded-lg">
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono mb-2 hidden lg:block">Contents</div>
              {[
                { id: 'the-problem', label: 'The Problem' },
                { id: 'my-challenge', label: 'My Challenge' },
                { id: 'insights', label: 'Insights' },
                { id: 'key-decisions', label: 'Key Decisions & Why?' },
                { id: 'solutions', label: 'Solutions' },
                { id: 'what-didnt-work', label: 'What didn’t work' },
                { id: 'design-system', label: 'Design System' },
                { id: 'the-product', label: 'The Product' },
                { id: 'learnings', label: 'Learnings' },
                { id: 'differently', label: "What I'd do differently" },
                { id: 'constraints', label: 'Constraints' }
              ].map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left py-2 px-3 rounded flex items-center justify-between text-base transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'text-white font-semibold bg-white/10 translate-x-1'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#f37021]"></div>}
                  </button>
                );
              })}
            </div>

            {/* RIGHT CONTENT COLUMN (w-[1079.30px] max-w-[1200px]) */}
            <div className="w-full lg:w-[1079.30px] max-w-[1200px] flex flex-col gap-24">

              {/* 1. THE PROBLEM */}
              <section id="the-problem" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    {problem.headline || 'THE PROBLEM'}
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">01 / PROBLEM</span>
                </div>
                <p className="text-white text-xl font-normal leading-relaxed">
                  {problem.intro}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {problem.cards.map((card, idx) => (
                    <div key={idx} className="flex flex-col gap-4 p-6 rounded-lg bg-zinc-950 border border-white/5">
                      <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">{card.title}</h3>
                      <ul className="flex flex-col gap-2 text-zinc-400 text-base">
                        {card.items.map((it, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-2">
                            <span className="text-zinc-600 select-none">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {problem.image && (
                  <div className="w-full rounded-lg overflow-hidden border border-white/10 mt-4">
                    <img src={problem.image} alt="Problem discovery" className="w-full h-auto object-cover max-h-[660px]" />
                  </div>
                )}
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 2. MY CHALLENGE */}
              <section id="my-challenge" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    {challenge.headline || 'MY CHALLENGE'}
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">02 / CHALLENGE</span>
                </div>
                <p className="text-white text-xl font-normal leading-relaxed">
                  {challenge.statement}
                </p>
                <div className="flex flex-col gap-4 p-6 rounded-lg bg-zinc-950 border border-white/5">
                  <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">Constraints:</h3>
                  <div className="flex flex-col gap-3">
                    {challenge.constraints.map((c, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-zinc-400 text-base">
                        <span className="text-[#f37021] font-mono text-sm select-none">[{idx + 1}]</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 3. INSIGHTS */}
              <section id="insights" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    {insights.headline || 'The aha moment - insights'}
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">03 / INSIGHTS</span>
                </div>
                <p className="text-white text-xl font-normal leading-relaxed text-[#ff853a]">
                  {insights.tagline}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.cards.map((c, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-3 border border-white/5 hover:border-white/10 transition-colors">
                      <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">{c.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 4. KEY DECISIONS & WHY? */}
              <section id="key-decisions" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    KEY DECISIONS &amp; WHY?
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">04 / ARCHITECTURE</span>
                </div>
                {keyDecisions.length > 0 && (
                  <div className="w-full rounded-lg overflow-hidden border border-white/10 bg-zinc-950">
                    <img
                      src={project.keyDecisions?.image || project.coverImage || 'https://placehold.co/1079x660/111418/f37021?text=SOMTU+Key+Architecture+Decisions'}
                      alt="Key Decisions"
                      className="w-full h-auto object-cover max-h-[660px]"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {keyDecisions.map((dec, idx) => (
                    <div key={idx} className="flex flex-col gap-4 p-6 rounded-lg bg-zinc-950 border border-white/5">
                      <h3 className="text-white text-lg font-semibold font-['Plus_Jakarta_Sans'] border-b border-white/10 pb-2">
                        {dec.title}
                      </h3>
                      <div className="flex flex-col gap-3 text-sm">
                        <div>
                          <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                            {dec.constraintLabel || 'Constraint:'}
                          </span>
                          <p className="text-zinc-300 leading-relaxed">{dec.constraint}</p>
                        </div>
                        <div>
                          <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                            {dec.whatIDidLabel || 'What I did:'}
                          </span>
                          <p className="text-zinc-300 leading-relaxed">{dec.whatIDid}</p>
                        </div>
                        <div>
                          <span className="text-xs font-mono uppercase text-[#ff853a] block mb-1">
                            {dec.whyLabel || 'Why:'}
                          </span>
                          <p className="text-zinc-400 leading-relaxed">{dec.why}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 5. SOLUTION */}
              <section id="solutions" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    {solution.headline || 'SOLUTION'}
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">05 / SOLUTION</span>
                </div>
                <p className="text-white text-xl font-normal leading-relaxed text-[#ff853a]">
                  {solution.tagline}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {solution.cards.map((c, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-2.5 border border-white/5">
                      <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">{c.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
                {solution.image && (
                  <div className="w-full rounded-lg overflow-hidden border border-white/10 mt-4">
                    <img src={solution.image} alt="Final Design Solution" className="w-full h-auto object-cover max-h-[660px]" />
                  </div>
                )}
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 6. WHY THIS APPROACH WORKS? */}
              <section className="flex flex-col gap-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    Why this approach works?
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">06 / VALIDATION</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {whyWorksCards.map((c, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-2 border border-white/5">
                      <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">{c.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 7. BUT.. WHAT NEEDED WORK? */}
              <section id="what-didnt-work" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    {whatNeededWork.headline || 'but.. WHAT NEEDED WORK?'}
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">07 / ITERATION</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-4 border border-red-500/20">
                    <div>
                      <div className="text-xs font-mono uppercase text-red-400 mb-1">First Attempt:</div>
                      <p className="text-zinc-300 text-sm">{whatNeededWork.firstAttempt}</p>
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase text-red-400 mb-1">Problem:</div>
                      <p className="text-zinc-400 text-sm">{whatNeededWork.problem}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-4 border border-emerald-500/20">
                    <div>
                      <div className="text-xs font-mono uppercase text-emerald-400 mb-1">Fix:</div>
                      <p className="text-zinc-300 text-sm">{whatNeededWork.fix}</p>
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase text-emerald-400 mb-1">Learning:</div>
                      <p className="text-zinc-400 text-sm">{whatNeededWork.learning}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 8. DESIGN SYSTEM */}
              <section id="design-system" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    DESIGN SYSTEM
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">08 / SYSTEM</span>
                </div>
                <p className="text-white text-xl font-normal leading-relaxed">
                  {designSystemDesc}
                </p>

                {/* Interactive Carousel of Design System Screens */}
                <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-zinc-950 aspect-[16/10]">
                  <img
                    src={designSystemImages[designSlideIndex] || designSystemImages[0]}
                    alt={`Design System Slide ${designSlideIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  
                  {/* Slide controls */}
                  {designSystemImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setDesignSlideIndex((prev) => (prev > 0 ? prev - 1 : designSystemImages.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 cursor-pointer"
                        aria-label="Previous slide"
                      >
                        <span className="material-symbols-rounded">chevron_left</span>
                      </button>
                      <button
                        onClick={() => setDesignSlideIndex((prev) => (prev < designSystemImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 cursor-pointer"
                        aria-label="Next slide"
                      >
                        <span className="material-symbols-rounded">chevron_right</span>
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                        {designSystemImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setDesignSlideIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                              designSlideIndex === idx ? 'bg-[#f37021] w-6' : 'bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 9. THE PRODUCT */}
              <section id="the-product" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    THE PRODUCT
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">09 / PRODUCT</span>
                </div>
                <p className="text-white text-lg font-normal leading-relaxed">
                  Eleven feature areas, each designed for desktop and mobile. Scroll horizontally to explore screens.
                </p>
                <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-700">
                  <div className="inline-flex gap-6 min-w-max">
                    {productScreens.map((screen, idx) => (
                      <div
                        key={idx}
                        className="w-[360px] md:w-[480px] h-[580px] rounded-lg overflow-hidden border border-white/10 bg-zinc-950 flex flex-col shadow-xl"
                      >
                        <div className="px-4 py-2 bg-zinc-900 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                          <span>Screen {idx + 1} of {productScreens.length}</span>
                          <span className="text-[#f37021]">1440px / 428px</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          <img src={screen} alt={`Product Screen ${idx + 1}`} className="w-full h-auto object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 10. LEARNINGS */}
              <section id="learnings" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    LEARNINGS
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">10 / RETRO</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningsCards.map((c, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-2.5 border border-white/5">
                      <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">{c.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 11. WHAT I'D DO DIFFERENTLY */}
              <section id="differently" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    WHAT I'D DO DIFFERENTLY
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">11 / GROWTH</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {whatDoDifferentlyCards.map((c, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900 rounded-lg flex flex-col gap-2.5 border border-white/5">
                      <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">{c.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-white/20"></div>

              {/* 12. PROJECT CONSTRAINTS */}
              <section id="constraints" className="flex flex-col gap-8 scroll-mt-28">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <h2 className="text-white text-3xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                    PROJECT CONSTRAINTS
                  </h2>
                  <span className="text-zinc-600 font-mono text-xs">12 / SCOPE</span>
                </div>
                <div className="p-6 rounded-lg bg-zinc-950 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-white text-lg font-medium font-['Plus_Jakarta_Sans']">What shaped the work:</h3>
                  <div className="flex flex-col gap-3">
                    {constraintsList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-zinc-400 text-base">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Bottom footer bar inside case */}
              <div className="pt-12 pb-20 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-6">
                <button
                  onClick={() => onNavigate ? onNavigate('/projects') : window.history.back()}
                  className="inline-flex items-center gap-2 text-white hover:text-[#f37021] transition-colors text-base font-medium cursor-pointer"
                >
                  <span className="material-symbols-rounded">arrow_back</span>
                  <span>Explore other projects</span>
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm cursor-pointer"
                >
                  <span>Back to top</span>
                  <span className="material-symbols-rounded">arrow_upward</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
