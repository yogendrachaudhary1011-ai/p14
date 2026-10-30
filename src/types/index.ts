export interface SiteSettings {
  siteTitle: string;
  brandName: string;
  brandRole: string;
  email: string;
  phone: string;
  location: string;
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
  heroSubtitle?: string;
  category: 'product' | 'archive';
  categoryLabel: string;
  mediaNote?: string;
  coverImage: string;
  coverClass?: string;
  year: string;
  order: number;
  status: 'published' | 'draft';
  featured: boolean;
  summary: string;
  route: string;

  // Case Study Blueprint Fields
  role?: string;
  duration?: string;
  deliverables?: string[];
  figmaUrl?: string;
  figmaButtonText?: string;

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
