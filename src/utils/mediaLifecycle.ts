import { Project, SiteSettings, ExperienceItem } from '../types';
import { extractStoragePathFromUrl } from './supabaseService';

/**
 * Returns true if the URL represents an uploaded asset managed by the portfolio
 * (either stored in Supabase Storage or uploaded as an inline data URI fallback).
 * Built-in static `/assets/...` files and external placeholder links are NOT auto-deleted on replacement.
 */
export function isManagedUploadUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (extractStoragePathFromUrl(trimmed) !== null) return true;
  if (trimmed.startsWith('data:')) return true;
  return false;
}

const addIfValid = (set: Set<string>, url?: string | null) => {
  if (typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed) set.add(trimmed);
  }
};

/** Collects every media/file URL referenced anywhere inside a single Project. */
export function collectProjectMediaUrls(project?: Partial<Project> | null): Set<string> {
  const urls = new Set<string>();
  if (!project) return urls;

  addIfValid(urls, project.coverImage);
  addIfValid(urls, project.heroImage?.url);
  addIfValid(urls, project.seo?.image);

  if (Array.isArray(project.sections)) {
    for (const section of project.sections) {
      if (!section || !Array.isArray(section.blocks)) continue;
      for (const block of section.blocks) {
        if (!block) continue;
        if (block.type === 'image' || block.type === 'fullWidthImage') {
          addIfValid(urls, block.url);
        } else if (block.type === 'gallery' && Array.isArray(block.images)) {
          for (const img of block.images) addIfValid(urls, img?.url);
        } else if (block.type === 'carousel' && Array.isArray(block.slides)) {
          for (const slide of block.slides) addIfValid(urls, slide?.url);
        } else if (block.type === 'productShowcase' && Array.isArray(block.screens)) {
          for (const scr of block.screens) addIfValid(urls, scr?.url);
        } else if (block.type === 'decisionList') {
          addIfValid(urls, block.image);
        }
      }
    }
  }

  // Legacy structured fields
  addIfValid(urls, project.problem?.image);
  addIfValid(urls, project.keyDecisions?.image);
  addIfValid(urls, project.solution?.image);
  if (Array.isArray(project.designSystem?.images)) {
    for (const img of project.designSystem.images) addIfValid(urls, img);
  }
  if (Array.isArray(project.product?.screens)) {
    for (const scr of project.product.screens) {
      addIfValid(urls, typeof scr === 'string' ? scr : (scr as { url?: string })?.url);
    }
  }

  return urls;
}

/** Collects every media/file URL referenced in SiteSettings. */
export function collectSettingsMediaUrls(settings?: SiteSettings | null): Set<string> {
  const urls = new Set<string>();
  if (!settings) return urls;

  addIfValid(urls, settings.profileImage);
  addIfValid(urls, settings.aboutVideo);
  addIfValid(urls, settings.resumeUrl);
  addIfValid(urls, settings.seo?.ogImage);
  if (Array.isArray(settings.certificates)) {
    for (const cert of settings.certificates) addIfValid(urls, cert?.url);
  }

  return urls;
}

/** Collects every certificate file URL referenced across all ExperienceItem entries. */
export function collectExperienceMediaUrls(experience?: ExperienceItem[] | null): Set<string> {
  const urls = new Set<string>();
  if (!Array.isArray(experience)) return urls;

  for (const item of experience) {
    if (!item || !Array.isArray(item.certificates)) continue;
    for (const cert of item.certificates) addIfValid(urls, cert?.url);
  }

  return urls;
}

/** Collects every media/file URL actively referenced across the entire portfolio. */
export function collectPortfolioMediaUrls(data: {
  settings: SiteSettings;
  projects: Project[];
  experience: ExperienceItem[];
}): Set<string> {
  const urls = new Set<string>();
  collectSettingsMediaUrls(data.settings).forEach((u) => urls.add(u));
  collectExperienceMediaUrls(data.experience).forEach((u) => urls.add(u));
  for (const project of data.projects) {
    collectProjectMediaUrls(project).forEach((u) => urls.add(u));
  }
  return urls;
}

/** Returns human-readable locations where a given media URL is currently used. */
export function findMediaUrlUsages(
  targetUrl: string,
  data: { settings: SiteSettings; projects: Project[]; experience: ExperienceItem[] }
): string[] {
  const normalized = targetUrl.trim();
  if (!normalized) return [];

  const usages: string[] = [];
  if (data.settings.profileImage?.trim() === normalized) usages.push('Profile ID Card Portrait');
  if (data.settings.aboutVideo?.trim() === normalized) usages.push('About Section Video');
  if (data.settings.resumeUrl?.trim() === normalized) usages.push('Resume / CV');
  if (data.settings.seo?.ogImage?.trim() === normalized) usages.push('SEO Social Image');
  if (data.settings.certificates?.some((c) => c.url?.trim() === normalized)) {
    usages.push('Legacy Profile Certificates');
  }

  for (const exp of data.experience) {
    if (exp.certificates?.some((c) => c.url?.trim() === normalized)) {
      usages.push(`Experience "${exp.role || exp.company}" Certificate`);
    }
  }

  for (const project of data.projects) {
    if (collectProjectMediaUrls(project).has(normalized)) {
      usages.push(`Project "${project.title || project.slug}"`);
    }
  }

  return usages;
}

/**
 * Unlinks any deleted media URLs from settings, experience, and projects so no broken
 * references remain after an explicit permanent deletion from the Media Library.
 */
export function stripMediaUrlsFromPortfolio(
  urlsToRemove: Set<string>,
  data: { settings: SiteSettings; projects: Project[]; experience: ExperienceItem[] },
  defaults?: { resumeUrl?: string; profileImage?: string }
): { settings: SiteSettings; projects: Project[]; experience: ExperienceItem[] } {
  if (urlsToRemove.size === 0) return data;

  const has = (url?: string | null) => Boolean(url && urlsToRemove.has(url.trim()));

  const nextSettings: SiteSettings = {
    ...data.settings,
    profileImage: has(data.settings.profileImage) ? (defaults?.profileImage ?? '') : data.settings.profileImage,
    aboutVideo: has(data.settings.aboutVideo) ? '' : data.settings.aboutVideo,
    resumeUrl: has(data.settings.resumeUrl) ? (defaults?.resumeUrl ?? '') : data.settings.resumeUrl,
    seo: {
      ...data.settings.seo,
      ogImage: has(data.settings.seo?.ogImage) ? '' : data.settings.seo?.ogImage
    },
    certificates: data.settings.certificates
      ? data.settings.certificates.filter((c) => !has(c.url))
      : undefined
  };

  const nextExperience: ExperienceItem[] = data.experience.map((item) =>
    item.certificates
      ? { ...item, certificates: item.certificates.filter((c) => !has(c.url)) }
      : item
  );

  const nextProjects: Project[] = data.projects.map((project) => {
    const nextSections = Array.isArray(project.sections)
      ? project.sections.map((section) => ({
          ...section,
          blocks: Array.isArray(section.blocks)
            ? section.blocks.map((block) => {
                if ((block.type === 'image' || block.type === 'fullWidthImage') && has(block.url)) {
                  return { ...block, url: '' };
                }
                if (block.type === 'gallery') {
                  return { ...block, images: block.images.filter((img) => !has(img.url)) };
                }
                if (block.type === 'carousel') {
                  return { ...block, slides: block.slides.filter((slide) => !has(slide.url)) };
                }
                if (block.type === 'productShowcase') {
                  return { ...block, screens: block.screens.filter((scr) => !has(scr.url)) };
                }
                if (block.type === 'decisionList' && has(block.image)) {
                  return { ...block, image: '' };
                }
                return block;
              })
            : []
        }))
      : project.sections;

    return {
      ...project,
      coverImage: has(project.coverImage) ? '' : project.coverImage,
      heroImage: project.heroImage
        ? { ...project.heroImage, url: has(project.heroImage.url) ? '' : project.heroImage.url }
        : project.heroImage,
      seo: project.seo
        ? { ...project.seo, image: has(project.seo.image) ? '' : project.seo.image }
        : project.seo,
      sections: nextSections
    };
  });

  return {
    settings: nextSettings,
    projects: nextProjects,
    experience: nextExperience
  };
}
