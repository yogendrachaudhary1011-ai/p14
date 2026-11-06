import { Project, CaseStudySection, CaseStudyBlock, SectionType, CaseStudyBlockType } from '../types';
import { initialProjects } from '../data/initialData';

function extractScreenInfo(screen: any, defaultIndex: number): { url: string; alt: string } | null {
  if (!screen) return null;
  if (typeof screen === 'string') {
    const url = screen.trim();
    return url ? { url, alt: `Product Screen #${defaultIndex}` } : null;
  }
  if (typeof screen === 'object') {
    const url = (screen.url || screen.src || '').trim();
    if (!url) return null;
    const alt = (screen.label || screen.alt || screen.title || `Product Screen #${defaultIndex}`).trim();
    return { url, alt };
  }
  return null;
}

/** Convert legacy Product screen showcases into the same vertical full-width image blocks used by other sections. */
export function stackProductSectionImages(sections: CaseStudySection[]): CaseStudySection[] {
  return sections.map((section) => {
    const blocks = section.blocks || [];
    const hasProductShowcase = blocks.some((b) => b.type === 'productShowcase');
    const isProduct =
      section.type === 'product' ||
      section.id === 'the-product' ||
      section.id?.toLowerCase().startsWith('product') ||
      section.navigationLabel?.toLowerCase().includes('product') ||
      section.heading?.toLowerCase().includes('product');

    if (!isProduct && !hasProductShowcase) return section;

    const flattened = blocks.flatMap((block): CaseStudyBlock[] => {
      if (block.type !== 'productShowcase') return [block];

      const screens = Array.isArray(block.screens) ? block.screens : [];
      const imageBlocks = screens
        .map((screen, index) => extractScreenInfo(screen, index + 1))
        .filter((info): info is { url: string; alt: string } => info !== null)
        .map((info, index) => ({
          id: `${block.id}-image-${index + 1}`,
          type: 'fullWidthImage' as const,
          url: info.url,
          alt: info.alt
        }));

      const result: CaseStudyBlock[] = [];
      if (block.subtitle && block.subtitle.trim()) {
        result.push({
          id: `${block.id}-subtitle`,
          type: 'paragraph',
          text: block.subtitle
        });
      }
      result.push(...imageBlocks);
      return result.length > 0 ? result : [block];
    });

    return {
      ...section,
      blocks: flattened
    };
  });
}

export function normalizeProjectSections(project: Project): CaseStudySection[] {
  // If the project already has custom sections defined and not empty, use them
  if (project.sections && Array.isArray(project.sections) && project.sections.length > 0) {
    const sections = stackProductSectionImages(project.sections).map((section) => {
      const isProduct =
        section.type === 'product' ||
        section.id === 'the-product' ||
        section.id?.toLowerCase().startsWith('product') ||
        section.navigationLabel?.toLowerCase().includes('product') ||
        section.heading?.toLowerCase().includes('product');

      if (isProduct) {
        const blocks = [...(section.blocks || [])];
        const hasImages = blocks.some(
          (b) =>
            ((b.type === 'fullWidthImage' || b.type === 'image') && Boolean(b.url?.trim())) ||
            (b.type === 'gallery' && b.images?.length > 0) ||
            (b.type === 'productShowcase' && b.screens?.length > 0)
        );

        if (!hasImages) {
          // If the product section was saved with only a text description, restore screens from project.product, matching initialProjects, or default portfolio screens
          const legacyScreens = (project.product?.screens || []).filter((s) => typeof s === 'string' && s.trim());
          const cleanKey = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const projKey = cleanKey(project.slug || project.id || project.title);
          const matchedInitial = initialProjects.find(
            (p) =>
              p.id === project.id ||
              p.slug === project.slug ||
              cleanKey(p.slug) === projKey ||
              cleanKey(p.id) === projKey ||
              cleanKey(p.title) === projKey
          );

          const fallbackScreens =
            legacyScreens.length > 0
              ? legacyScreens
              : (matchedInitial?.product?.screens?.filter((s) => s.trim()) || [
                  '/assets/media/home-media-04-f775f2921176.webp',
                  '/assets/media/home-media-03-d6c887bed8af.webp'
                ]);

          if (fallbackScreens.length > 0) {
            const screenBlocks: CaseStudyBlock[] = fallbackScreens.map((url, idx) => ({
              id: `${section.id}-screen-${idx + 1}`,
              type: 'fullWidthImage' as const,
              url,
              alt: `${project.title} Product Screen #${idx + 1}`
            }));
            blocks.push(...screenBlocks);
            return { ...section, blocks };
          }
        }
      }

      const isDesignSystem =
        section.type === 'designSystem' ||
        section.id === 'design-system' ||
        section.id?.toLowerCase().startsWith('designsystem') ||
        section.navigationLabel?.toLowerCase().includes('design system') ||
        section.heading?.toLowerCase().includes('design system');

      if (!isDesignSystem) return section;

      const blocks = [...(section.blocks || [])];
      const existingCarouselIndex = blocks.findIndex((block) => block.type === 'carousel');
      const existingSlides = existingCarouselIndex >= 0 && blocks[existingCarouselIndex].type === 'carousel'
        ? (blocks[existingCarouselIndex].slides || []).filter((slide) => slide && typeof slide.url === 'string' && slide.url.trim())
        : [];

      const cleanKey = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const projKey = cleanKey(project.slug || project.id || project.title);
      const matchedInitial = initialProjects.find(
        (p) =>
          p.id === project.id ||
          p.slug === project.slug ||
          cleanKey(p.slug) === projKey ||
          cleanKey(p.id) === projKey ||
          cleanKey(p.title) === projKey
      );

      const legacySlides = (project.designSystem?.images || matchedInitial?.designSystem?.images || [])
        .filter((url) => typeof url === 'string' && url.trim())
        .map((url, index) => ({
          url,
          title: `Design System Component Spec #${index + 1}`,
          alt: `Design System Slide ${index + 1}`
        }));

      const imageBlockIndexes = blocks
        .map((block, index) => ({ block, index }))
        .filter(({ block }) => block.type === 'image' || block.type === 'fullWidthImage');
      const blockSlides = imageBlockIndexes.flatMap(({ block }) =>
        block.type === 'image' || block.type === 'fullWidthImage'
          ? block.url?.trim() ? [{ url: block.url, title: block.caption, alt: block.alt }] : []
          : []
      );

      const defaultFallbackSlides = [
        { url: '/assets/media/home-media-04-f775f2921176.webp', title: 'Component Library & Variants', alt: 'Design System Slide 1' },
        { url: '/assets/media/home-media-02-c6ea6ce61d01.webp', title: 'Typography & Elevation Tokens', alt: 'Design System Slide 2' },
        { url: '/assets/media/home-media-03-d6c887bed8af.webp', title: 'Layout Guidelines & Navigation', alt: 'Design System Slide 3' }
      ];

      const slides = existingSlides.length
        ? existingSlides
        : legacySlides.length
        ? legacySlides
        : blockSlides.length
        ? blockSlides
        : defaultFallbackSlides;

      const carousel = existingCarouselIndex >= 0 && blocks[existingCarouselIndex].type === 'carousel'
        ? { ...blocks[existingCarouselIndex], slides }
        : { id: `${section.id}-carousel`, type: 'carousel' as const, slides };

      const firstImageIndex = imageBlockIndexes[0]?.index;
      const withoutImages = blocks.filter((block) => block.type !== 'image' && block.type !== 'fullWidthImage');
      if (existingCarouselIndex >= 0) {
        const carouselIndex = withoutImages.findIndex((block) => block.type === 'carousel');
        if (carouselIndex >= 0) {
          withoutImages[carouselIndex] = carousel;
        } else {
          withoutImages.push(carousel);
        }
      } else {
        const insertAt = Math.min(firstImageIndex ?? withoutImages.length, withoutImages.length);
        withoutImages.splice(insertAt, 0, carousel);
      }
      return { ...section, blocks: withoutImages };
    });

    return sections.sort((a, b) => a.order - b.order);
  }

  // Otherwise, construct sections from the project's legacy/structured properties
  const sections: CaseStudySection[] = [];
  let order = 1;

  // 1. THE PROBLEM
  if (project.problem) {
    const blocks: CaseStudyBlock[] = [];
    if (project.problem.cards && project.problem.cards.length > 0) {
      blocks.push({
        id: `blk-${order}-cg`,
        type: 'cardGrid',
        columns: project.problem.cards.length >= 3 ? 3 : 2,
        cards: project.problem.cards.map(c => ({
          title: c.title,
          items: c.items
        }))
      });
    }
    if (project.problem.image) {
      blocks.push({
        id: `blk-${order}-img`,
        type: 'fullWidthImage',
        url: project.problem.image,
        alt: `${project.title} Problem Discovery`
      });
    }

    sections.push({
      id: 'the-problem',
      type: 'problem',
      navigationLabel: 'The Problem',
      heading: project.problem.headline || 'THE PROBLEM',
      intro: project.problem.intro,
      visible: true,
      order: order++,
      blocks
    });
  }

  // 2. MY CHALLENGE
  if (project.challenge) {
    const blocks: CaseStudyBlock[] = [];
    if (project.challenge.statement) {
      blocks.push({
        id: `blk-${order}-p`,
        type: 'paragraph',
        text: project.challenge.statement
      });
    }
    if (project.challenge.constraints && project.challenge.constraints.length > 0) {
      blocks.push({
        id: `blk-${order}-bl`,
        type: 'bulletList',
        title: 'Constraints:',
        items: project.challenge.constraints
      });
    }

    sections.push({
      id: 'my-challenge',
      type: 'challenge',
      navigationLabel: 'My Challenge',
      heading: project.challenge.headline || 'MY CHALLENGE',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 3. INSIGHTS
  if (project.insights) {
    const blocks: CaseStudyBlock[] = [];
    if (project.insights.tagline) {
      blocks.push({
        id: `blk-${order}-tagline`,
        type: 'paragraph',
        text: project.insights.tagline,
        highlight: true
      });
    }
    if (project.insights.cards && project.insights.cards.length > 0) {
      blocks.push({
        id: `blk-${order}-cg`,
        type: 'cardGrid',
        columns: 3,
        cards: project.insights.cards.map(c => ({
          title: c.title,
          desc: c.desc
        }))
      });
    }

    sections.push({
      id: 'insights',
      type: 'insights',
      navigationLabel: 'Insights',
      heading: project.insights.headline || 'The aha moment - insights',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 4. KEY DECISIONS & WHY?
  if (project.keyDecisions) {
    const blocks: CaseStudyBlock[] = [];
    if (project.keyDecisions.image) {
      blocks.push({
        id: `blk-${order}-img`,
        type: 'fullWidthImage',
        url: project.keyDecisions.image,
        alt: `${project.title} Key Decisions`
      });
    }
    if (project.keyDecisions.decisions && project.keyDecisions.decisions.length > 0) {
      blocks.push({
        id: `blk-${order}-dec`,
        type: 'decisionList',
        decisions: project.keyDecisions.decisions
      });
    }

    sections.push({
      id: 'key-decisions',
      type: 'keyDecisions',
      navigationLabel: 'Key Decisions & Why?',
      heading: project.keyDecisions.headline || 'KEY DECISIONS & WHY?',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 5. SOLUTION
  if (project.solution) {
    const blocks: CaseStudyBlock[] = [];
    if (project.solution.tagline) {
      blocks.push({
        id: `blk-${order}-tagline`,
        type: 'paragraph',
        text: project.solution.tagline,
        highlight: true
      });
    }
    if (project.solution.cards && project.solution.cards.length > 0) {
      blocks.push({
        id: `blk-${order}-cg`,
        type: 'cardGrid',
        columns: 3,
        cards: project.solution.cards.map(c => ({
          title: c.title,
          desc: c.desc
        }))
      });
    }
    if (project.solution.image) {
      blocks.push({
        id: `blk-${order}-img`,
        type: 'fullWidthImage',
        url: project.solution.image,
        alt: `${project.title} Integrated Solution`
      });
    }

    sections.push({
      id: 'solutions',
      type: 'solution',
      navigationLabel: 'Solutions',
      heading: project.solution.headline || 'SOLUTION',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 6. WHY THIS APPROACH WORKS
  if (project.whyWorks) {
    const blocks: CaseStudyBlock[] = [];
    if (project.whyWorks.cards && project.whyWorks.cards.length > 0) {
      blocks.push({
        id: `blk-${order}-cg`,
        type: 'cardGrid',
        columns: 3,
        cards: project.whyWorks.cards.map(c => ({
          title: c.title,
          desc: c.desc
        }))
      });
    }

    sections.push({
      id: 'why-works',
      type: 'whyItWorks',
      navigationLabel: 'Why it Works',
      heading: project.whyWorks.headline || 'Why this approach works?',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 7. WHAT NEEDED WORK / WHAT DIDN'T WORK
  if (project.whatNeededWork) {
    const blocks: CaseStudyBlock[] = [
      {
        id: `blk-${order}-comp`,
        type: 'twoColumnComparison',
        firstAttempt: project.whatNeededWork.firstAttempt,
        problem: project.whatNeededWork.problem,
        fix: project.whatNeededWork.fix,
        learning: project.whatNeededWork.learning
      }
    ];

    sections.push({
      id: 'what-didnt-work',
      type: 'whatDidNotWork',
      navigationLabel: 'What didn’t work',
      heading: project.whatNeededWork.headline || 'but.. WHAT NEEDED WORK?',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 8. DESIGN SYSTEM
  if (project.designSystem) {
    const blocks: CaseStudyBlock[] = [];
    if (project.designSystem.desc) {
      blocks.push({
        id: `blk-${order}-desc`,
        type: 'paragraph',
        text: project.designSystem.desc
      });
    }
    if (project.designSystem.images && project.designSystem.images.length > 0) {
      blocks.push({
        id: `blk-${order}-car`,
        type: 'carousel',
        slides: project.designSystem.images.map((url, i) => ({
          url,
          title: `Design System Component Spec #${i + 1}`,
          alt: `Design System Slide ${i + 1}`
        }))
      });
    }

    sections.push({
      id: 'design-system',
      type: 'designSystem',
      navigationLabel: 'Design System',
      heading: project.designSystem.headline || 'DESIGN SYSTEM',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 9. THE PRODUCT
  if (project.product) {
    const blocks: CaseStudyBlock[] = [];
    if (project.product.desc) {
      blocks.push({
        id: `blk-${order}-desc`,
        type: 'paragraph',
        text: project.product.desc
      });
    }
    project.product.screens?.filter((url) => url.trim()).forEach((url, idx) => {
      blocks.push({
        id: `blk-${order}-product-image-${idx + 1}`,
        type: 'fullWidthImage',
        url,
        alt: `${project.title} Product image ${idx + 1}`
      });
    });

    sections.push({
      id: 'the-product',
      type: 'product',
      navigationLabel: 'The Product',
      heading: project.product.headline || 'THE PRODUCT',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 10. LEARNINGS
  if (project.learnings) {
    const blocks: CaseStudyBlock[] = [];
    if (project.learnings.cards && project.learnings.cards.length > 0) {
      blocks.push({
        id: `blk-${order}-cg`,
        type: 'cardGrid',
        columns: 2,
        cards: project.learnings.cards.map(c => ({
          title: c.title,
          desc: c.desc
        }))
      });
    }

    sections.push({
      id: 'learnings',
      type: 'learnings',
      navigationLabel: 'Learnings',
      heading: project.learnings.headline || 'LEARNINGS',
      visible: true,
      order: order++,
      blocks
    });
  }

  // 11. WHAT I'D DO DIFFERENTLY
  if (project.whatDoDifferently) {
    const blocks: CaseStudyBlock[] = [];
    if (project.whatDoDifferently.cards && project.whatDoDifferently.cards.length > 0) {
      blocks.push({
        id: `blk-${order}-cg`,
        type: 'cardGrid',
        columns: 3,
        cards: project.whatDoDifferently.cards.map(c => ({
          title: c.title,
          desc: c.desc
        }))
      });
    }

    sections.push({
      id: 'differently',
      type: 'whatIdDoDifferently',
      navigationLabel: "What I'd do differently",
      heading: project.whatDoDifferently.headline || "WHAT I'D DO DIFFERENTLY",
      visible: true,
      order: order++,
      blocks
    });
  }

  // 12. PROJECT CONSTRAINTS
  if (project.projectConstraints) {
    const blocks: CaseStudyBlock[] = [];
    if (project.projectConstraints.items && project.projectConstraints.items.length > 0) {
      blocks.push({
        id: `blk-${order}-bl`,
        type: 'bulletList',
        title: project.projectConstraints.intro || 'What shaped the work:',
        items: project.projectConstraints.items
      });
    }

    sections.push({
      id: 'constraints',
      type: 'constraints',
      navigationLabel: 'Constraints',
      heading: project.projectConstraints.headline || 'PROJECT CONSTRAINTS',
      visible: true,
      order: order++,
      blocks
    });
  }

  return sections;
}

/** Provides a complete 12-chapter case study template matching the standard editorial design with all image, card, comparison, carousel, and decision blocks. */
export function getFullCaseStudyTemplate(projectTitle = 'Case Study'): CaseStudySection[] {
  let order = 1;
  return [
    {
      id: 'the-problem',
      type: 'problem',
      navigationLabel: 'The Problem',
      heading: 'THE PROBLEM',
      intro: 'Users were experiencing friction navigating multi-step workflows and locating core actions.',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-prob-cg`,
          type: 'cardGrid',
          columns: 2,
          cards: [
            {
              title: 'Audience needs a clear path',
              items: ['Primary actions are easily lost in dense navigation', 'Multi-step tasks require clear progression indicators', 'Mobile views must prioritize quick-lookup items']
            },
            {
              title: 'Returning users need speed',
              items: ['Fast status verification and search', 'One-tap access to primary services', 'Immediate feedback on form submission states']
            }
          ]
        },
        {
          id: `blk-${Date.now()}-prob-img`,
          type: 'fullWidthImage',
          url: '/assets/media/home-media-04-f775f2921176.webp',
          alt: `${projectTitle} Problem Discovery and Research`
        }
      ]
    },
    {
      id: 'my-challenge',
      type: 'challenge',
      navigationLabel: 'My Challenge',
      heading: 'MY CHALLENGE',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-chal-p`,
          type: 'paragraph',
          text: 'Design an intuitive, connected digital experience where every audience can accomplish their primary goal in a few taps across desktop and mobile, while maintaining design system consistency across every view.'
        },
        {
          id: `blk-${Date.now()}-chal-bl`,
          type: 'bulletList',
          title: 'Constraints:',
          items: [
            'Support multi-step forms and status-aware workflows',
            'Cohesive brand identity across all customer and admin touchpoints',
            'Desktop (1440 px) and mobile (428 px) responsive designs as equal priorities',
            'Comprehensive developer documentation and component specs'
          ]
        }
      ]
    },
    {
      id: 'insights',
      type: 'insights',
      navigationLabel: 'Insights',
      heading: 'The aha moment - insights',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-ins-tag`,
          type: 'paragraph',
          text: 'Consistency is emotional, not functional.',
          highlight: true
        },
        {
          id: `blk-${Date.now()}-ins-cg`,
          type: 'cardGrid',
          columns: 3,
          cards: [
            { title: 'People come to do one thing.', desc: 'Every key screen should make its main action obvious in the first viewport.' },
            { title: 'Standardize core patterns.', desc: 'Shared search, filter sheets, and card styles establish immediate familiarity.' },
            { title: 'Long tasks need a guided stepper.', desc: 'A visible stepper, review step, and clear confirmation eliminate drop-offs.' }
          ]
        }
      ]
    },
    {
      id: 'key-decisions',
      type: 'keyDecisions',
      navigationLabel: 'Key Decisions & Why?',
      heading: 'KEY DECISIONS & WHY?',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-dec-img`,
          type: 'fullWidthImage',
          url: '/assets/media/home-media-04-f775f2921176.webp',
          alt: `${projectTitle} Key Architecture Decisions`
        },
        {
          id: `blk-${Date.now()}-dec-list`,
          type: 'decisionList',
          decisions: [
            {
              title: 'One shell for every page',
              constraint: 'Multiple feature areas, each with its own target audience.',
              whatIDid: 'Built a shared header with utility links, category navigation, and a persistent action button.',
              why: 'Users always recognize where they are and every view inherits predictable structure.'
            },
            {
              title: 'Action-first landing page',
              constraint: 'Homepages often present too much information at once.',
              whatIDid: 'Created a focused hero with two primary paths, leading directly into core catalog highlights.',
              why: 'Both exploratory visitors and goal-driven users get an immediate starting tap.'
            },
            {
              title: 'Registration & booking as a guided stepper',
              constraint: 'Complex data collection creates cognitive fatigue and abandonment.',
              whatIDid: 'Split dense forms into bite-sized steps with review summaries and confirmation IDs.',
              why: 'People track progress easily, can inspect inputs before submission, and receive verified confirmation.'
            }
          ]
        }
      ]
    },
    {
      id: 'solutions',
      type: 'solution',
      navigationLabel: 'Solutions',
      heading: 'SOLUTION',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-sol-tag`,
          type: 'paragraph',
          text: 'Six core principles held the entire product interface together.',
          highlight: true
        },
        {
          id: `blk-${Date.now()}-sol-cg`,
          type: 'cardGrid',
          columns: 3,
          cards: [
            { title: 'One shell', desc: 'Shared header, footer, and navigation cues across all pages.' },
            { title: 'Action-first pages', desc: 'Each page makes its main call to action prominent.' },
            { title: 'Reusable pattern library', desc: 'Shared search, filter cards, and pagination across all lists.' },
            { title: 'Guided multi-step forms', desc: 'Step-by-step progress, validation, and review steps.' },
            { title: 'State-aware screens', desc: 'Upcoming, active, empty, and success states designed explicitly.' },
            { title: 'Mobile as an equal', desc: 'Every workflow tailored for thumb-reach and mobile viewports.' }
          ]
        },
        {
          id: `blk-${Date.now()}-sol-img`,
          type: 'fullWidthImage',
          url: '/assets/media/home-media-04-f775f2921176.webp',
          alt: `${projectTitle} Solution Overview`
        }
      ]
    },
    {
      id: 'why-works',
      type: 'whyItWorks',
      navigationLabel: 'Why it Works',
      heading: 'Why this approach works?',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-why-cg`,
          type: 'cardGrid',
          columns: 3,
          cards: [
            { title: 'Familiar everywhere', desc: 'Learn one flow and you instantly understand the rest of the product.' },
            { title: 'Faster task completion', desc: 'Prominent search, filters, and shortcuts reach any item in a few taps.' },
            { title: 'Reliable engineering handoff', desc: 'Repeated patterns and documented Figma tokens reduce development revisions.' }
          ]
        }
      ]
    },
    {
      id: 'what-didnt-work',
      type: 'whatDidNotWork',
      navigationLabel: 'What didn’t work',
      heading: 'but.. WHAT NEEDED WORK?',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-comp`,
          type: 'twoColumnComparison',
          firstAttempt: 'Displaying complete desktop filter button arrays inline across mobile screens.',
          problem: 'Numerous chips with counters overflowed small screens and pushed content below the fold.',
          fix: 'Moved the full filter set into a dedicated bottom sheet with sort, reset, and apply buttons.',
          learning: 'Desktop patterns do not simply scale down. Mobile layouts must be purpose-designed for thumb reach.'
        }
      ]
    },
    {
      id: 'design-system',
      type: 'designSystem',
      navigationLabel: 'Design System',
      heading: 'DESIGN SYSTEM',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-ds-desc`,
          type: 'paragraph',
          text: 'Extended the brand visual identity into a robust tokenized component system: primary actions, input fields, state cards, modal dialogs, and navigation headers across responsive viewports.'
        },
        {
          id: `blk-${Date.now()}-ds-car`,
          type: 'carousel',
          slides: [
            { url: '/assets/media/home-media-04-f775f2921176.webp', title: 'Component Library & Variants Spec', alt: 'Design system components' },
            { url: '/assets/media/home-media-02-c6ea6ce61d01.webp', title: 'Typography, Grid & Color Tokens', alt: 'Design system typography' },
            { url: '/assets/media/home-media-03-d6c887bed8af.webp', title: 'Responsive Mobile UI Tokens', alt: 'Mobile UI components' }
          ]
        }
      ]
    },
    {
      id: 'the-product',
      type: 'product',
      navigationLabel: 'The Product',
      heading: 'THE PRODUCT',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-prod-desc`,
          type: 'paragraph',
          text: 'Key responsive feature workflows designed for both desktop (1440 px) and mobile (428 px).'
        },
        {
          id: `blk-${Date.now()}-prod-img-1`,
          type: 'fullWidthImage',
          url: '/assets/media/home-media-04-f775f2921176.webp',
          alt: `${projectTitle} Desktop & Mobile Screens`
        },
        {
          id: `blk-${Date.now()}-prod-img-2`,
          type: 'fullWidthImage',
          url: '/assets/media/home-media-02-c6ea6ce61d01.webp',
          alt: `${projectTitle} Detailed Workflows`
        }
      ]
    },
    {
      id: 'learnings',
      type: 'learnings',
      navigationLabel: 'Learnings',
      heading: 'LEARNINGS',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-learn-cg`,
          type: 'cardGrid',
          columns: 2,
          cards: [
            { title: 'Systems beat isolated pages', desc: 'A unified layout shell and shared components unify complex products.' },
            { title: 'Design every state explicitly', desc: 'Empty, loading, active, and completed states are integral to usability.' },
            { title: 'Match layout to reading behavior', desc: 'Browse vs lookup tasks each require distinct typographic and spatial hierarchy.' },
            { title: 'Mobile demands bespoke patterns', desc: 'Filters, steppers, and long lists require thumb-friendly mobile patterns.' }
          ]
        }
      ]
    },
    {
      id: 'differently',
      type: 'whatIdDoDifferently',
      navigationLabel: "What I'd do differently",
      heading: "WHAT I'D DO DIFFERENTLY",
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-diff-cg`,
          type: 'cardGrid',
          columns: 3,
          cards: [
            { title: 'Test with target users early', desc: 'Conduct usability sessions on critical registration and booking paths.' },
            { title: 'Document design rationale', desc: 'Include brief rationale notes beside each Figma component for developers.' },
            { title: 'Plan localization from day one', desc: 'Account for variable string lengths across multiple language translations.' }
          ]
        }
      ]
    },
    {
      id: 'constraints',
      type: 'constraints',
      navigationLabel: 'Constraints',
      heading: 'PROJECT CONSTRAINTS',
      visible: true,
      order: order++,
      blocks: [
        {
          id: `blk-${Date.now()}-const-bl`,
          type: 'bulletList',
          title: 'What shaped the work:',
          items: [
            'Real-world business and client workflow constraints',
            'Brand continuity requiring evolution rather than total replacement',
            'High volume of state-dependent content, forms, and documents',
            'Desktop at 1440 px and mobile at 428 px as equal design priorities'
          ]
        }
      ]
    }
  ];
}

export function createDefaultSection(type: SectionType, order: number): CaseStudySection {
  const titles: Record<SectionType, { label: string; heading: string }> = {
    problem: { label: 'The Problem', heading: 'THE PROBLEM' },
    challenge: { label: 'My Challenge', heading: 'MY CHALLENGE' },
    insights: { label: 'Insights', heading: 'The aha moment - insights' },
    keyDecisions: { label: 'Key Decisions & Why?', heading: 'KEY DECISIONS & WHY?' },
    solution: { label: 'Solutions', heading: 'SOLUTION' },
    whyItWorks: { label: 'Why it Works', heading: 'Why this approach works?' },
    whatDidNotWork: { label: 'What didn’t work', heading: 'but.. WHAT NEEDED WORK?' },
    designSystem: { label: 'Design System', heading: 'DESIGN SYSTEM' },
    product: { label: 'The Product', heading: 'THE PRODUCT' },
    learnings: { label: 'Learnings', heading: 'LEARNINGS' },
    whatIdDoDifferently: { label: "What I'd do differently", heading: "WHAT I'D DO DIFFERENTLY" },
    constraints: { label: 'Constraints', heading: 'PROJECT CONSTRAINTS' },
    custom: { label: 'Custom Section', heading: 'CUSTOM SECTION' }
  };

  const meta = titles[type] || titles.custom;
  const id = `${type}-${Date.now()}`;

  let defaultBlocks: CaseStudyBlock[] = [];
  if (type === 'problem') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Users were facing significant drop-off rates due to complex navigation and unclear user flows.' },
      { id: `blk-${Date.now()}-2`, type: 'cardGrid', columns: 2, cards: [
        { title: 'Core Friction Point 1', items: ['Unclear primary action', 'Cognitive overload', 'Lack of immediate feedback'] },
        { title: 'Core Friction Point 2', items: ['Slow mobile performance', 'Dense tables without search', 'Inconsistent UI styling'] }
      ]},
      { id: `blk-${Date.now()}-3`, type: 'fullWidthImage', url: '', alt: 'Problem Discovery and Research' }
    ];
  } else if (type === 'challenge') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Design one connected interface where every audience can reach their task in a few taps across desktop and mobile.' },
      { id: `blk-${Date.now()}-2`, type: 'bulletList', title: 'Constraints:', items: ['Desktop & mobile responsive layouts', 'Scalable component library'] }
    ];
  } else if (type === 'insights') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Consistency is emotional, not functional.', highlight: true },
      { id: `blk-${Date.now()}-2`, type: 'cardGrid', columns: 3, cards: [
        { title: 'People come to do one thing.', desc: 'Every key screen should make its main action obvious.' },
        { title: 'Shared patterns build trust.', desc: 'Shared search and chips provide instant familiarity.' },
        { title: 'Guided steps ease dense flows.', desc: 'Steppers and clear confirmations keep users oriented.' }
      ]}
    ];
  } else if (type === 'keyDecisions') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-0`, type: 'fullWidthImage', url: '', alt: 'Key Decisions Architecture' },
      {
        id: `blk-${Date.now()}-1`,
        type: 'decisionList',
        decisions: [
          {
            title: 'Unified Component Architecture',
            constraint: 'Multiple sub-teams building inconsistent flows.',
            whatIDid: 'Created a standardized design system token kit with reusable navigation, cards, and input states.',
            why: 'Ensures consistent mental models across every screen and saves developer implementation time.'
          },
          {
            title: 'Action-First Layout Hierarchy',
            constraint: 'Users overwhelmed by competing interface elements.',
            whatIDid: 'Structured pages around one primary action with secondary utilities grouped clearly.',
            why: 'Directs user attention and increases completion rates.'
          }
        ]
      }
    ];
  } else if (type === 'solution') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Core principles that held the product interface together.', highlight: true },
      { id: `blk-${Date.now()}-2`, type: 'cardGrid', columns: 3, cards: [
        { title: 'One shell', desc: 'Shared header, footer, and navigation cues across all pages.' },
        { title: 'Action-first pages', desc: 'Each page makes its main call to action prominent.' },
        { title: 'Reusable pattern library', desc: 'Shared search, filter cards, and pagination across all lists.' }
      ]},
      { id: `blk-${Date.now()}-3`, type: 'fullWidthImage', url: '', alt: 'Solution Overview' }
    ];
  } else if (type === 'whyItWorks') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'cardGrid', columns: 3, cards: [
        { title: 'Familiar everywhere', desc: 'Learn one page and you know the rest.' },
        { title: 'Faster tasks', desc: 'Search and filters reach any item in a few taps.' },
        { title: 'Easier to build', desc: 'Repeated patterns cut developer questions.' }
      ]}
    ];
  } else if (type === 'whatDidNotWork') {
    defaultBlocks = [
      {
        id: `blk-${Date.now()}-1`,
        type: 'twoColumnComparison',
        firstAttempt: 'Displaying complete filter arrays inline on mobile.',
        problem: 'Seven chips with counts overflowed a 428 px screen and pushed results out of sight.',
        fix: 'Moved the full set into a Filter Content sheet with sort, reset, and apply, and kept the main screen focused on results.',
        learning: 'Desktop patterns do not shrink. They have to be redesigned for thumbs.'
      }
    ];
  } else if (type === 'designSystem') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Extended the brand into a reusable tokenized component library with documented variants.' },
      { id: `blk-${Date.now()}-2`, type: 'carousel', slides: [
        { url: '/assets/media/home-media-04-f775f2921176.webp', title: 'Component Library & Variants', alt: 'Design system slide 1' },
        { url: '/assets/media/home-media-02-c6ea6ce61d01.webp', title: 'Typography & Elevation Tokens', alt: 'Design system slide 2' },
        { url: '/assets/media/home-media-03-d6c887bed8af.webp', title: 'Layout Guidelines & Navigation', alt: 'Design system slide 3' }
      ]}
    ];
  } else if (type === 'product') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Core responsive feature areas designed for desktop and mobile viewports.' },
      { id: `blk-${Date.now()}-2`, type: 'fullWidthImage', url: '/assets/media/home-media-04-f775f2921176.webp', alt: 'Product Screen 1' },
      { id: `blk-${Date.now()}-3`, type: 'fullWidthImage', url: '/assets/media/home-media-03-d6c887bed8af.webp', alt: 'Product Screen 2' }
    ];
  } else if (type === 'learnings') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'cardGrid', columns: 2, cards: [
        { title: 'Systems beat pages', desc: 'A shared shell and list pattern made distinct feature areas feel like one product.' },
        { title: 'Design every state', desc: 'Upcoming, ended, empty, and success states are part of the experience.' }
      ]}
    ];
  } else if (type === 'whatIdDoDifferently') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'cardGrid', columns: 3, cards: [
        { title: 'Test with real users earlier', desc: 'Run quick usability sessions on core checkout and registration flows.' },
        { title: 'Document design rationale', desc: 'Write short decision notes beside each Figma chapter.' },
        { title: 'Plan for localization', desc: 'Account for multilingual typography and varying text lengths.' }
      ]}
    ];
  } else if (type === 'constraints') {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'bulletList', title: 'What shaped the work:', items: ['Established brand constraints', 'Dense forms and documents', 'Desktop and mobile as equal priorities'] }
    ];
  } else {
    defaultBlocks = [
      { id: `blk-${Date.now()}-1`, type: 'paragraph', text: 'Section description and key contextual takeaways.' }
    ];
  }

  return {
    id,
    type,
    navigationLabel: meta.label,
    heading: meta.heading,
    visible: true,
    order,
    blocks: defaultBlocks
  };
}

export function createDefaultBlock(type: CaseStudyBlockType): CaseStudyBlock {
  const id = `blk-${Date.now()}`;
  switch (type) {
    case 'paragraph':
      return { id, type: 'paragraph', text: 'Add your paragraph narrative text here.' };
    case 'heading':
      return { id, type: 'heading', level: 3, text: 'New Subsection Heading' };
    case 'bulletList':
      return { id, type: 'bulletList', title: 'Key Highlights:', items: ['First key observation or deliverable', 'Second key observation or deliverable'] };
    case 'cardGrid':
      return {
        id,
        type: 'cardGrid',
        columns: 3,
        cards: [
          { title: 'Card One', desc: 'Detailed description of the card insight or feature.' },
          { title: 'Card Two', desc: 'Detailed description of the card insight or feature.' },
          { title: 'Card Three', desc: 'Detailed description of the card insight or feature.' }
        ]
      };
    case 'twoColumnComparison':
      return {
        id,
        type: 'twoColumnComparison',
        firstAttempt: 'Initial concept or approach tested with users.',
        problem: 'Why this initial direction failed or caused user friction.',
        fix: 'The strategic adjustment and design solution implemented.',
        learning: 'Core takeaway for future product iterations.'
      };
    case 'decisionList':
      return {
        id,
        type: 'decisionList',
        decisions: [
          {
            title: 'Key Design Decision Title',
            constraint: 'The user or business constraint faced.',
            whatIDid: 'What was specifically designed or architected.',
            why: 'Why this solution succeeded.'
          }
        ]
      };
    case 'image':
    case 'fullWidthImage':
      return {
        id,
        type: 'fullWidthImage',
        url: '',
        alt: ''
      };
    case 'gallery':
      return {
        id,
        type: 'gallery',
        columns: 2,
        images: []
      };
    case 'carousel':
      return {
        id,
        type: 'carousel',
        slides: []
      };
    case 'productShowcase':
      return {
        id,
        type: 'productShowcase',
        subtitle: 'Desktop and Mobile responsive layouts',
        screens: []
      };
    case 'quote':
      return {
        id,
        type: 'quote',
        quote: 'Consistency is emotional, not functional.',
        author: 'Yogendra Chaudhary',
        role: 'UI/UX Designer'
      };
    case 'cta':
      return {
        id,
        type: 'cta',
        label: 'View Live Prototype',
        url: 'https://figma.com',
        style: 'primary',
        isExternal: true
      };
    case 'divider':
      return { id, type: 'divider' };
    case 'spacer':
      return { id, type: 'spacer', height: 'md' };
    default:
      return { id, type: 'paragraph', text: 'Text block' };
  }
}


