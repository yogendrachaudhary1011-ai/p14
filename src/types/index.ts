export interface SiteSettings {
  siteTitle: string;
  brandName: string;
  brandRole: string;
  email: string;
  phone: string;
  location: string;
  aboutIntro?: string;
  aboutDetails?: string;
  siteCopy?: Record<string, string>;
  homeSections?: { hero: boolean; work: boolean; about: boolean; connect: boolean };
  homeSectionOrder?: Array<'hero' | 'work' | 'about' | 'connect'>;
  aboutSections?: { profile: boolean; experience: boolean; education: boolean };
  aboutSectionOrder?: Array<'profile' | 'experience' | 'education'>;
  profileImage?: string;
  aboutVideo?: string;
  /** @deprecated Certificates now belong to individual ExperienceItem records. */
  certificates?: AboutCertificate[];
  behanceUrl?: string;
  linkedinUrl?: string;
  availabilityText: string;
  availabilityStatus: string;
  footerText: string;
  footerSubtitle: string;
  resumeUrl: string;
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage: string;
    robots: string;
  };
}

export interface AboutCertificate {
  id: string;
  title: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export type CaseStudyBlockType =
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'twoColumnComparison'
  | 'cardGrid'
  | 'decisionList'
  | 'image'
  | 'fullWidthImage'
  | 'gallery'
  | 'carousel'
  | 'productShowcase'
  | 'quote'
  | 'cta'
  | 'divider'
  | 'spacer';

export interface BaseBlock {
  id: string;
  type: CaseStudyBlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
  highlight?: boolean;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level?: 2 | 3 | 4;
  text: string;
}

export interface BulletListBlock extends BaseBlock {
  type: 'bulletList';
  title?: string;
  items: string[];
}

export interface TwoColumnComparisonBlock extends BaseBlock {
  type: 'twoColumnComparison';
  firstAttempt: string;
  problem: string;
  fix: string;
  learning: string;
}

export interface CardGridItem {
  title: string;
  desc?: string;
  items?: string[];
  badge?: string;
}

export interface CardGridBlock extends BaseBlock {
  type: 'cardGrid';
  columns?: 2 | 3 | 4;
  cards: CardGridItem[];
}

export interface DecisionItem {
  title: string;
  details?: DecisionDetail[];
  constraintLabel?: string;
  constraint: string;
  whatIDidLabel?: string;
  whatIDid: string;
  whyLabel?: string;
  why: string;
}

export interface DecisionDetail {
  label: string;
  text: string;
}

export interface DecisionListBlock extends BaseBlock {
  type: 'decisionList';
  image?: string;
  imageAlt?: string;
  decisions: DecisionItem[];
}

export interface ImageBlockItem extends BaseBlock {
  type: 'image' | 'fullWidthImage';
  url: string;
  alt?: string;
  caption?: string;
  aspectRatio?: string;
}

export interface GalleryItem {
  url: string;
  alt?: string;
  caption?: string;
}

export interface GalleryBlockItem extends BaseBlock {
  type: 'gallery';
  images: GalleryItem[];
  columns?: 2 | 3 | 4;
}

export interface CarouselSlide {
  url: string;
  title?: string;
  alt?: string;
}

export interface CarouselBlockItem extends BaseBlock {
  type: 'carousel';
  slides: CarouselSlide[];
}

export interface ProductScreenItem {
  url: string;
  label?: string;
  device?: 'desktop' | 'mobile';
}

export interface ProductShowcaseBlockItem extends BaseBlock {
  type: 'productShowcase';
  subtitle?: string;
  screens: ProductScreenItem[];
}

export interface QuoteBlockItem extends BaseBlock {
  type: 'quote';
  quote: string;
  author?: string;
  role?: string;
}

export interface CtaBlockItem extends BaseBlock {
  type: 'cta';
  label: string;
  url: string;
  style?: 'primary' | 'outline';
  isExternal?: boolean;
}

export interface DividerBlockItem extends BaseBlock {
  type: 'divider';
}

export interface SpacerBlockItem extends BaseBlock {
  type: 'spacer';
  height?: 'sm' | 'md' | 'lg';
}

export type CaseStudyBlock =
  | ParagraphBlock
  | HeadingBlock
  | BulletListBlock
  | TwoColumnComparisonBlock
  | CardGridBlock
  | DecisionListBlock
  | ImageBlockItem
  | GalleryBlockItem
  | CarouselBlockItem
  | ProductShowcaseBlockItem
  | QuoteBlockItem
  | CtaBlockItem
  | DividerBlockItem
  | SpacerBlockItem;

export type SectionType =
  | 'problem'
  | 'challenge'
  | 'insights'
  | 'keyDecisions'
  | 'solution'
  | 'whyItWorks'
  | 'whatDidNotWork'
  | 'designSystem'
  | 'product'
  | 'learnings'
  | 'whatIdDoDifferently'
  | 'constraints'
  | 'custom';

export interface CaseStudySection {
  id: string;
  type: SectionType;
  navigationLabel: string;
  heading: string;
  intro?: string;
  visible: boolean;
  order: number;
  blocks: CaseStudyBlock[];
}

export interface ProblemSection {
  headline?: string;
  intro: string;
  cards: { title: string; items: string[] }[];
  image?: string;
}

export interface ChallengeSection {
  headline?: string;
  statement: string;
  constraints: string[];
}

export interface InsightsSection {
  headline?: string;
  tagline: string;
  cards: { title: string; desc: string }[];
}

export interface KeyDecisionItem {
  title: string;
  constraintLabel?: string;
  constraint: string;
  whatIDidLabel?: string;
  whatIDid: string;
  whyLabel?: string;
  why: string;
}

export interface KeyDecisionsSection {
  headline?: string;
  image?: string;
  decisions: KeyDecisionItem[];
}

export interface SolutionSection {
  headline?: string;
  tagline: string;
  cards: { title: string; desc: string }[];
  image?: string;
}

export interface WhyWorksSection {
  headline?: string;
  cards: { title: string; desc: string }[];
}

export interface WhatNeededWorkSection {
  headline?: string;
  firstAttempt: string;
  problem: string;
  fix: string;
  learning: string;
}

export interface DesignSystemSection {
  headline?: string;
  desc: string;
  images: string[];
}

export interface ProductSection {
  headline?: string;
  desc: string;
  screens: string[];
}

export interface LearningsSection {
  headline?: string;
  cards: { title: string; desc: string }[];
}

export interface WhatDoDifferentlySection {
  headline?: string;
  cards: { title: string; desc: string }[];
}

export interface ProjectConstraintsSection {
  headline?: string;
  intro?: string;
  items: string[];
}

export interface DeliverableGroup {
  id: string;
  label: string;
  items: string[];
}

export interface ProjectTheme {
  preset?: 'default' | 'cyberpunk' | 'amber' | 'emerald' | 'minimal' | 'rose' | 'light' | 'custom';
  backgroundColor?: string;

  // Comprehensive Text Colors
  textColor?: string;           // Master fallback text color
  headingColor?: string;        // Fallback headings (H1, H2, H3, H4)
  heroTitleColor?: string;      // Hero H1 Project Title
  heroSubtitleColor?: string;   // Hero Subtitle / Lead narrative
  sectionHeadingColor?: string; // Chapter & Section titles (01. The Problem, etc.)
  bodyTextColor?: string;       // Narrative paragraphs, overview intro, block copy
  mutedTextColor?: string;      // Subtitles, footnotes, image captions
  metadataLabelColor?: string;  // Metadata column labels (Role, Duration, Deliverables)
  metadataValueColor?: string;  // Metadata values & detail list items
  cardTitleColor?: string;      // Card titles, decision titles, comparison headers
  cardTextColor?: string;       // Card descriptions, bullet points, detail text
  bulletTextColor?: string;     // Bullet list text
  bulletDotColor?: string;      // Bullet dot / indicator accent
  quoteTextColor?: string;      // Blockquote text
  quoteAuthorColor?: string;    // Blockquote author & role
  quoteBorderColor?: string;    // Blockquote decorative left border

  // Navigation, Badges & Numbers
  navTextColor?: string;            // Table of contents inactive links
  navActiveTextColor?: string;      // Table of contents active link
  navActiveIndicatorColor?: string; // Table of contents active indicator bar/glow
  accentTextColor?: string;         // Chapter index numbers (01, 02), tags, active nav indicator
  chapterNumberColor?: string;      // Section index number text (e.g. 01, 02)
  chapterNumberBg?: string;         // Section index number background pill
  badgeTextColor?: string;          // Top Case Study / Year pill text
  badgeBgColor?: string;            // Top Case Study / Year pill background
  badgeBorderColor?: string;        // Top Case Study / Year pill border
  backButtonTextColor?: string;     // Top & bottom "Back to Projects" button text & icon

  // Buttons & Interactive Elements
  accentColor?: string;             // Main primary accent & scroll progress
  buttonTextColor?: string;         // Action button text
  primaryButtonBg?: string;         // Primary button background (e.g. Live Project CTA)
  primaryButtonText?: string;       // Primary button text
  primaryButtonBorder?: string;     // Primary button border
  secondaryButtonBg?: string;       // Secondary / Outline button background (e.g. Figma file)
  secondaryButtonText?: string;     // Secondary / Outline button text
  secondaryButtonBorder?: string;   // Secondary / Outline button border
  nextProjectCardBg?: string;       // "Next Project" teaser card background
  nextProjectCardBorder?: string;   // "Next Project" teaser card border
  nextProjectTextColor?: string;    // "Next Project" title text color
  nextProjectAccentColor?: string;  // "Next Project" action label & arrow color

  // Top Site Header Customization (for this specific project)
  headerBg?: string;                // Header background color
  headerBorderColor?: string;       // Header bottom border stroke
  headerNavTextColor?: string;      // Header navigation links text color
  headerNavActiveColor?: string;    // Header active navigation link highlight
  headerAvailabilityBg?: string;    // Availability status badge background
  headerAvailabilityText?: string;  // Availability status badge text color
  headerContactBtnBg?: string;      // "Get in touch" / contact button background
  headerContactBtnText?: string;    // "Get in touch" / contact button text
  headerContactBtnBorder?: string;  // "Get in touch" / contact button border

  // Surfaces, Accents & Dividers
  cardBackground?: string;
  cardBorderColor?: string;
  dividerColor?: string;
  progressBarColor?: string;

  // Typography & Layout Options
  fontFamily?: 'plus-jakarta' | 'dm-sans' | 'inter' | 'serif' | 'mono';
  titleSize?: 'compact' | 'normal' | 'large' | 'oversized';
  cardRadius?: 'sharp' | 'subtle' | 'rounded' | 'pill';
  backgroundPattern?: 'grid' | 'dots' | 'glow' | 'none';
  showProgressBar?: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortSummary?: string;
  introduction?: string;
  heroSubtitle?: string;
  summary: string;
  heroImage?: {
    url: string;
    alt?: string;
  };
  coverImage: string;
  coverClass?: string;
  category: 'product' | 'archive';
  categoryLabel: string;
  mediaNote?: string;
  year: string;
  order: number;
  displayOrder?: number;
  status: 'published' | 'draft';
  featured: boolean;
  route: string;

  // Metadata
  role?: string;
  duration?: string;
  deliverables?: string[];
  deliverableGroups?: DeliverableGroup[];
  figmaUrl?: string;
  figmaButtonText?: string;
  externalProjectUrl?: string;

  // Case Study Sections
  sections?: CaseStudySection[];

  // Theme & Styling Customization
  theme?: ProjectTheme;

  // SEO
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };

  createdAt?: string;
  updatedAt?: string;

  // Legacy structured sections
  problem?: ProblemSection;
  challenge?: ChallengeSection;
  insights?: InsightsSection;
  keyDecisions?: KeyDecisionsSection;
  solution?: SolutionSection;
  whyWorks?: WhyWorksSection;
  whatNeededWork?: WhatNeededWorkSection;
  designSystem?: DesignSystemSection;
  product?: ProductSection;
  learnings?: LearningsSection;
  whatDoDifferently?: WhatDoDifferentlySection;
  projectConstraints?: ProjectConstraintsSection;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  dates: string;
  duration?: string;
  current: boolean;
  headline?: string;
  description: string;
  tags: string[];
  certificates?: AboutCertificate[];
  order: number;
  visible: boolean;
}

export interface EducationItem {
  id: string;
  title: string;
  institution: string;
  location: string;
  dates: string;
  status: string;
  program: string;
  year?: string;
  description: string;
  tags: string[];
  order: number;
  visible: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

