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

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: 'product' | 'archive';
  categoryLabel: string;
  mediaNote: string;
  coverImage: string;
  coverClass?: string;
  year: string;
  order: number;
  status: 'published' | 'draft';
  featured: boolean;
  summary: string;
  route: string;
  customTemplate?: string;
  // Optional rich dynamic content blocks
  contentBlocks?: ProjectContentBlock[];
}

export interface ProjectContentBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'callout' | 'quote' | 'two-column';
  title?: string;
  text?: string;
  imageUrl?: string;
  imageCaption?: string;
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
