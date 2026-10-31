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
  constraintLabel?: string;
  constraint: string;
  whatIDidLabel?: string;
  whatIDid: string;
  whyLabel?: string;
  why: string;
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
  figmaUrl?: string;
  figmaButtonText?: string;
  externalProjectUrl?: string;

  // Case Study Sections
  sections?: CaseStudySection[];

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

