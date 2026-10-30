import { Project, CaseStudySection, CaseStudyBlock, SectionType, CaseStudyBlockType } from '../types';

export function normalizeProjectSections(project: Project): CaseStudySection[] {
  // If the project already has custom sections defined and not empty, use them
  if (project.sections && Array.isArray(project.sections) && project.sections.length > 0) {
    return project.sections.sort((a, b) => a.order - b.order);
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
    if (project.product.screens && project.product.screens.length > 0) {
      blocks.push({
        id: `blk-${order}-ps`,
        type: 'productShowcase',
        subtitle: 'Desktop & Mobile responsive flows',
        screens: project.product.screens.map((url, idx) => ({
          url,
          label: `Flow Screen ${idx + 1}`,
          device: idx % 2 === 0 ? 'desktop' : 'mobile'
        }))
      });
    }

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
  } else if (type === 'keyDecisions') {
    defaultBlocks = [
      {
        id: `blk-${Date.now()}-1`,
        type: 'decisionList',
        decisions: [
          {
            title: 'Unified Component Architecture',
            constraint: 'Multiple sub-teams building inconsistent flows.',
            whatIDid: 'Created a standardized design system token kit with reusable navigation, cards, and input states.',
            why: 'Ensures consistent mental models across every screen and saves developer implementation time.'
          }
        ]
      }
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
        url: 'https://placehold.co/1079x660/111418/ffffff?text=Design+Artifact+Preview',
        alt: 'Design artifact preview'
      };
    case 'gallery':
      return {
        id,
        type: 'gallery',
        columns: 2,
        images: [
          { url: 'https://placehold.co/800x600/181c26/ffffff?text=Screen+1', alt: 'Screen 1' },
          { url: 'https://placehold.co/800x600/141822/ffffff?text=Screen+2', alt: 'Screen 2' }
        ]
      };
    case 'carousel':
      return {
        id,
        type: 'carousel',
        slides: [
          { url: 'https://placehold.co/884x660/161922/ffffff?text=Slide+1', title: 'Component Spec 1' },
          { url: 'https://placehold.co/884x660/181c26/ffffff?text=Slide+2', title: 'Component Spec 2' },
          { url: 'https://placehold.co/884x660/141822/ffffff?text=Slide+3', title: 'Component Spec 3' }
        ]
      };
    case 'productShowcase':
      return {
        id,
        type: 'productShowcase',
        subtitle: 'Desktop and Mobile responsive layouts',
        screens: [
          { url: 'https://placehold.co/554x1200/181c25/ffffff?text=Screen+1', label: 'Primary Workflow', device: 'desktop' },
          { url: 'https://placehold.co/554x1200/141721/ffffff?text=Screen+2', label: 'Mobile Experience', device: 'mobile' }
        ]
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
