import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SiteSettings, Project, ExperienceItem, EducationItem, MediaAsset } from '../types';
import { initialSiteSettings, initialProjects, initialExperience, initialEducation } from '../data/initialData';
import { normalizeProjectSections } from '../utils/caseStudyUtils';
import { safeStorage } from '../utils/storage';
import {
  getSavedCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  getSupabase
} from '../supabase';
import {
  fetchPortfolioSnapshot,
  savePortfolioSnapshot,
  subscribeToPortfolioSnapshot
} from '../utils/supabaseService';

interface PortfolioContextType {
  settings: SiteSettings;
  projects: Project[];
  experience: ExperienceItem[];
  education: EducationItem[];
  media: MediaAsset[];
  isAdmin: boolean;
  adminUser: string | null;
  isSupabaseConnected: boolean;
  cloudSaveStatus: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';
  cloudSaveError: string | null;
  supabaseConfig: { url: string; key: string };
  updateSupabaseConfig: (url: string, key: string) => boolean;
  syncAllProjectsToSupabase: () => Promise<{ success: boolean; count: number; message: string }>;
  saveProjectsNow: (nextProjects: Project[]) => Promise<{ success: boolean; error?: string }>;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changeAdminPassword: (newPass: string) => Promise<boolean>;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  addProject: (project: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  reorderProjects: (orderedIds: string[]) => void;
  toggleProjectStatus: (id: string) => void;
  deleteAllProjects: () => void;
  addExperience: (item: Omit<ExperienceItem, 'id'>) => void;
  updateExperience: (id: string, updates: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  addEducation: (item: Omit<EducationItem, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<EducationItem>) => void;
  deleteEducation: (id: string) => void;
  addMedia: (name: string, url: string, mimeType: string, size: number) => MediaAsset;
  saveResumeUpload: (url: string, name: string, size: number) => Promise<{ success: boolean; error?: string }>;
  deleteMedia: (id: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  SETTINGS: 'yc_portfolio_settings_v6',
  PROJECTS: 'yc_portfolio_projects_v7',
  EXPERIENCE: 'yc_portfolio_experience_v2',
  EDUCATION: 'yc_portfolio_education',
  MEDIA: 'yc_portfolio_media_v2',
  AUTH: 'yc_portfolio_admin_auth'
};

const sanitizeLegacyMediaUrls = <T,>(input: T): T => {
  if (!input) return input;
  try {
    const str = JSON.stringify(input)
      .replace(/og-rizka-portfolio\.jpg/g, 'og-portfolio.jpg')
      .replace(/\/assets\/media\/home-media-04-f775f2921176\.webp/g, '/assets/media/somtu-cover.webp')
      .replace(/\/assets\/media\/home-media-02-c6ea6ce61d01\.webp/g, '/assets/media/somtu-design-system.webp')
      .replace(/\/assets\/media\/home-media-03-d6c887bed8af\.webp/g, '/assets/media/somtu-mobile-screens.webp')
      .replace(/\/assets\/media\/home-media-05-aa658763e66a\.webp/g, '/assets/media/somtu-architecture.webp')
      .replace(/\/assets\/media\/home-media-11-2c67061de865\.webp/g, '/assets/media/vedic-sewa-platform.webp')
      .replace(/\/assets\/media\/home-media-12-049c2eb75443\.webp/g, '/assets/media/vedic-sewa-tokens.webp')
      .replace(/\/assets\/media\/home-media-01-a8072a2c986d\.png/g, '/assets/media/vedic-sewa-cover.png');
    return JSON.parse(str);
  } catch {
    return input;
  }
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const mergeSiteSettings = (saved: Partial<SiteSettings> | undefined): SiteSettings => ({
  ...initialSiteSettings,
  ...(saved || {}),
  siteCopy: { ...initialSiteSettings.siteCopy, ...(saved?.siteCopy || {}) },
  homeSections: { ...initialSiteSettings.homeSections, ...(saved?.homeSections || {}) },
  homeSectionOrder: Array.isArray(saved?.homeSectionOrder) ? saved.homeSectionOrder : initialSiteSettings.homeSectionOrder,
  aboutSections: { ...initialSiteSettings.aboutSections, ...(saved?.aboutSections || {}) },
  aboutSectionOrder: Array.isArray(saved?.aboutSectionOrder) ? saved.aboutSectionOrder : initialSiteSettings.aboutSectionOrder,
  seo: { ...initialSiteSettings.seo, ...(saved?.seo || {}) }
});

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.behanceUrl || parsed.behanceUrl === 'https://www.behance.net/yogendrach') {
          parsed.behanceUrl = 'https://www.behance.net/yogendrachaudhary1';
        }
        if (!parsed.linkedinUrl || parsed.linkedinUrl.includes('linkedin.com/in/yogendrach')) {
          parsed.linkedinUrl = 'https://www.linkedin.com/in/yogendrach';
        }
        return mergeSiteSettings(parsed);
      }
      return initialSiteSettings;
    } catch {
      return initialSiteSettings;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      // Clear legacy storage versions to prevent deleted projects or old templates from persisting in local browser cache
      safeStorage.removeItem('yc_portfolio_projects_v6');
      safeStorage.removeItem('yc_portfolio_projects_v5');
      safeStorage.removeItem('yc_portfolio_projects_v4');
      safeStorage.removeItem('yc_portfolio_projects_v3');
      const stored = safeStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeLegacyMediaUrls(parsed);
        }
      }
      return initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [experience, setExperience] = useState<ExperienceItem[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.EXPERIENCE);
      return stored ? JSON.parse(stored) : initialExperience;
    } catch {
      return initialExperience;
    }
  });

  const [education, setEducation] = useState<EducationItem[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.EDUCATION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(e => e.id !== 'edu-2');
          safeStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(cleaned));
          return cleaned;
        }
      }
      return initialEducation;
    } catch {
      return initialEducation;
    }
  });

  const [media, setMedia] = useState<MediaAsset[]>(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.MEDIA);
      return stored ? sanitizeLegacyMediaUrls(JSON.parse(stored)) : [
        {
          id: 'media-01',
          name: 'Hero ID portrait',
          url: '/assets/media/hero-id-portrait.jpeg',
          mimeType: 'image/jpeg',
          size: 704000,
          uploadedAt: new Date().toISOString()
        },
        {
          id: 'media-02',
          name: 'SOMTU Case Cover',
          url: '/assets/media/somtu-cover.webp',
          mimeType: 'image/webp',
          size: 75800,
          uploadedAt: new Date().toISOString()
        },
        {
          id: 'media-03',
          name: 'SOMTU Design System',
          url: '/assets/media/somtu-design-system.webp',
          mimeType: 'image/webp',
          size: 52400,
          uploadedAt: new Date().toISOString()
        },
        {
          id: 'media-04',
          name: 'The Vedic Sewa Cover',
          url: '/assets/media/vedic-sewa-cover.png',
          mimeType: 'image/png',
          size: 118800,
          uploadedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return safeStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<string | null>(() => {
    try {
      return safeStorage.getItem(STORAGE_KEYS.AUTH) === 'true'
        ? (safeStorage.getItem('yc_portfolio_admin_user') || 'admin@yogendrachaudhary.com')
        : null;
    } catch {
      return null;
    }
  });

  const [supabaseConfig, setSupabaseConfigState] = useState<{ url: string; key: string }>(() => {
    return getSavedCredentials();
  });

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => {
    return false;
  });
  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const lastCloudSnapshot = useRef<string | null>(null);
  const hasUnsavedChanges = useRef(false);
  const localChangeVersion = useRef(0);

  const markUnsavedChanges = () => {
    localChangeVersion.current += 1;
    if (hasUnsavedChanges.current) return;
    hasUnsavedChanges.current = true;
    setCloudSaveStatus((current) => current === 'saving' ? current : 'unsaved');
    setCloudSaveError(null);
  };

  // Sync to local storage for fast boot
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }
      catch (e) { console.warn('Storage sync error:', e); }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { safeStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects)); }
      catch (e) { console.warn('Storage sync error:', e); }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [projects]);

  useEffect(() => {
    const timer = window.setTimeout(() => safeStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(experience)), 150);
    return () => window.clearTimeout(timer);
  }, [experience]);

  useEffect(() => {
    const timer = window.setTimeout(() => safeStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(education)), 150);
    return () => window.clearTimeout(timer);
  }, [education]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { safeStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media)); }
      catch (e) { console.warn('Storage sync error:', e); }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [media]);

  // Proactive background image preloader for instant navigation (deferred to idle time to avoid bandwidth contention)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preloadImages = () => {
      const preloadList = [
        settings.profileImage || '/assets/media/hero-id-portrait.jpeg',
        ...projects.slice(0, 4).flatMap((p) => [p.coverImage, p.heroImage?.url]).filter(Boolean)
      ];
      preloadList.forEach((url) => {
        if (url && typeof url === 'string' && !url.startsWith('data:') && !url.startsWith('blob:')) {
          const img = new Image();
          img.src = url;
        }
      });
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(preloadImages, { timeout: 3000 });
      return () => (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
    } else {
      const timer = window.setTimeout(preloadImages, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [settings.profileImage, projects]);

  // Supabase session, initial cloud load, and live snapshot subscription.
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let active = true;

    async function initSupabase() {
      setCloudReady(false);
      if (!isSupabaseConfigured()) {
        setIsSupabaseConnected(false);
        setCloudSaveStatus('idle');
        setCloudSaveError(null);
        return;
      }

      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase!.auth.getSession();
        if (!active) return;
        const session = sessionData.session;
        setIsAdmin(Boolean(session));
        setAdminUser(session?.user.email || null);
        if (session) safeStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        else safeStorage.removeItem(STORAGE_KEYS.AUTH);

        const { snapshot, connected, error } = await fetchPortfolioSnapshot();
        if (!active) return;
        setIsSupabaseConnected(connected);
        if (error) {
          console.error('Supabase portfolio load failed:', error);
          setCloudSaveStatus('error');
          setCloudSaveError(error);
        } else {
          setCloudSaveStatus(snapshot ? 'saved' : 'idle');
          setCloudSaveError(null);
        }
        lastCloudSnapshot.current = snapshot ? JSON.stringify(snapshot) : null;
        hasUnsavedChanges.current = false;
        if (snapshot) {
          setSettings(mergeSiteSettings(snapshot.settings));
          setProjects(snapshot.projects);
          setExperience(snapshot.experience);
          setEducation(snapshot.education);
          setMedia(snapshot.media);
        }

        unsubscribe = subscribeToPortfolioSnapshot((fresh) => {
          if (!active || hasUnsavedChanges.current) return;
          const serialized = JSON.stringify(fresh);
          if (serialized === lastCloudSnapshot.current) return;
          lastCloudSnapshot.current = serialized;
          setSettings(mergeSiteSettings(fresh.settings));
          setProjects(fresh.projects);
          setExperience(fresh.experience);
          setEducation(fresh.education);
          setMedia(fresh.media);
        });
        setCloudReady(connected && Boolean(session));
      } catch (err) {
        console.warn('Supabase initialization notice:', err);
        setIsSupabaseConnected(false);
        setCloudReady(false);
        setCloudSaveStatus('error');
        setCloudSaveError(err instanceof Error ? err.message : 'Unable to connect to Supabase.');
      }
    }

    void initSupabase();
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [supabaseConfig]);

  const updateSupabaseConfig = (url: string, key: string): boolean => {
    const success = saveSupabaseCredentials(url, key);
    if (success) {
      setCloudReady(false);
      setSupabaseConfigState({ url: url.trim(), key: key.trim() });
      setIsSupabaseConnected(isSupabaseConfigured());
    }
    return success;
  };

  const syncAllProjectsToSupabase = useCallback(async (): Promise<{ success: boolean; count: number; message: string }> => {
    if (!isSupabaseConfigured()) {
      setCloudSaveStatus('error');
      setCloudSaveError('Supabase is not configured.');
      return { success: false, count: 0, message: 'Supabase credentials are not configured yet.' };
    }

    const versionAtSave = localChangeVersion.current;
    try {
      setCloudSaveStatus('saving');
      setCloudSaveError(null);
      const snapshot = { settings, projects, experience, education, media };
      const serialized = JSON.stringify(snapshot);
      const result = await savePortfolioSnapshot(snapshot);
      if (!result.success) throw new Error(result.error || 'Cloud save failed.');
      setIsSupabaseConnected(true);
      lastCloudSnapshot.current = serialized;
      if (versionAtSave === localChangeVersion.current) {
        hasUnsavedChanges.current = false;
        setCloudSaveStatus('saved');
      } else {
        setCloudSaveStatus('unsaved');
      }
      return {
        success: true,
        count: projects.length,
        message: `Portfolio snapshot saved. ${projects.length} projects are in Supabase.`
      };
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      if (versionAtSave === localChangeVersion.current) {
        setCloudSaveStatus('error');
        setCloudSaveError(message);
      } else {
        setCloudSaveStatus('unsaved');
      }
      return {
        success: false,
        count: 0,
        message: `Sync failed: ${message}`
      };
    }
  }, [settings, projects, experience, education, media]);

  const saveProjectsNow = async (nextProjects: Project[]): Promise<{ success: boolean; error?: string }> => {
    markUnsavedChanges();
    setProjects(nextProjects);
    try {
      safeStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(nextProjects));
    } catch (e) {
      console.warn('Local storage write warning:', e);
    }

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected) {
      setCloudSaveStatus('saved');
      return { success: true };
    }

    const versionAtSave = localChangeVersion.current;
    const snapshot = { settings, projects: nextProjects, experience, education, media };
    setCloudSaveStatus('saving');
    setCloudSaveError(null);

    try {
      const result = await savePortfolioSnapshot(snapshot);
      if (!result.success) {
        console.warn('Supabase snapshot save notice:', result.error);
        setCloudSaveStatus('unsaved');
        setCloudSaveError(result.error || 'Cloud sync pending');
        return { success: true, error: result.error };
      }

      setIsSupabaseConnected(true);
      lastCloudSnapshot.current = JSON.stringify(snapshot);
      if (versionAtSave === localChangeVersion.current) {
        hasUnsavedChanges.current = false;
        setCloudSaveStatus('saved');
      } else {
        setCloudSaveStatus('unsaved');
      }
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not sync case study to Supabase.';
      setCloudSaveStatus('unsaved');
      setCloudSaveError(message);
      return { success: true, error: message };
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim();
    // 1. Try Supabase Auth if configured
    const supabase = getSupabase();
    if (supabase && trimmedEmail && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (!error && data.session) {
          setIsAdmin(true);
          const emailUser = data.user.email || trimmedEmail;
          setAdminUser(emailUser);
          setCloudReady(true);
          safeStorage.setItem(STORAGE_KEYS.AUTH, 'true');
          safeStorage.setItem('yc_portfolio_admin_user', emailUser);
          return true;
        }
      } catch (e) {
        console.warn('Supabase auth attempt notice:', e);
      }
    }

    // 2. Local studio passkey authentication (requires the stored secure admin passkey)
    const storedPass = safeStorage.getItem('yc_portfolio_local_admin_pass') || 'admin123';
    if (password === storedPass) {
      setIsAdmin(true);
      const user = trimmedEmail || 'admin@yogendrachaudhary.com';
      setAdminUser(user);
      safeStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      safeStorage.setItem('yc_portfolio_admin_user', user);
      return true;
    }

    return false;
  };

  const changeAdminPassword = async (newPassword: string): Promise<boolean> => {
    if (newPassword.trim().length < 4) return false;
    safeStorage.setItem('yc_portfolio_local_admin_pass', newPassword.trim());
    const supabase = getSupabase();
    if (supabase && newPassword.trim().length >= 8) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (e) {
        /* ignore */
      }
    }
    return true;
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
    }
    setCloudReady(false);
    setCloudSaveStatus('idle');
    setCloudSaveError(null);
    setIsAdmin(false);
    setAdminUser(null);
    safeStorage.removeItem(STORAGE_KEYS.AUTH);
    safeStorage.removeItem('yc_portfolio_admin_user');
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    markUnsavedChanges();
    setSettings((prev) => {
      const merged: SiteSettings = {
        ...prev,
        ...newSettings,
        seo: {
          ...prev.seo,
          ...(newSettings.seo || {})
        }
      };
      return merged;
    });
  };

  const addProject = (projectData: Partial<Project>): Project => {
    markUnsavedChanges();
    const slug = (projectData.slug || projectData.title || `proj-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const id = slug || `proj-${Date.now()}`;
    const newOrder = projectData.order || projects.length + 1;

    const newProj: Project = {
      id,
      title: projectData.title || 'Untitled Project',
      slug,
      shortSummary: projectData.shortSummary || projectData.heroSubtitle || 'A case study on designing modern product experiences.',
      heroSubtitle: projectData.heroSubtitle || projectData.shortSummary || 'A case study on designing modern product experiences.',
      introduction: projectData.introduction || projectData.summary || 'Overview of this product design project.',
      summary: projectData.summary || projectData.introduction || 'Overview of this product design project.',
      category: projectData.category || 'product',
      categoryLabel: projectData.categoryLabel || 'Case Study',
      mediaNote: projectData.mediaNote || 'UI/UX & Product Design',
      coverImage: projectData.coverImage || '/assets/media/somtu-cover.webp',
      heroImage: projectData.heroImage || {
        url: projectData.coverImage || '/assets/media/somtu-cover.webp',
        alt: projectData.title || 'Case study hero'
      },
      year: projectData.year || '2026',
      order: newOrder,
      displayOrder: newOrder,
      status: projectData.status || 'published',
      featured: projectData.featured !== undefined ? projectData.featured : true,
      route: `/${slug}`,
      role: projectData.role || 'UI/UX & Product Designer',
      duration: projectData.duration || '1 Month',
      deliverables: projectData.deliverables || [
        'Interactive Figma prototype and flows',
        'Reusable design system and component variants',
        'Desktop (1440 px) and mobile (428 px) responsive layouts',
        'Design reference documentation'
      ],
      deliverableGroups: projectData.deliverableGroups,
      figmaUrl: projectData.figmaUrl || 'https://www.figma.com',
      figmaButtonText: projectData.figmaButtonText || 'View Figma File',
      externalProjectUrl: projectData.externalProjectUrl || '',
      sections: projectData.sections || normalizeProjectSections({
        ...projectData,
        id,
        title: projectData.title || 'Untitled Project',
        slug,
        summary: projectData.summary || '',
        category: 'product',
        categoryLabel: 'Case Study',
        coverImage: '',
        year: '2026',
        order: newOrder,
        status: 'published',
        featured: true,
        route: `/${slug}`
      } as Project),
      seo: projectData.seo || {
        title: `${projectData.title || 'Project'} — Yogendra Chaudhary`,
        description: projectData.shortSummary || 'UI/UX Case Study',
        image: projectData.coverImage || '/og-portfolio.jpg'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects((prev) => [...prev, newProj]);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    markUnsavedChanges();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated: Project = {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          if (updates.slug && updates.slug !== p.slug) {
            updated.route = `/${updates.slug}`;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProject = (id: string) => {
    markUnsavedChanges();
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProject = (id: string): Project | null => {
    const source = projects.find((p) => p.id === id);
    if (!source) return null;

    const dupTitle = `${source.title} (Copy)`;
    const dupSlug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
    const duplicateData: Partial<Project> = {
      ...source,
      id: dupSlug,
      title: dupTitle,
      slug: dupSlug,
      order: projects.length + 1,
      displayOrder: projects.length + 1,
      status: 'draft',
      route: `/${dupSlug}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return addProject(duplicateData);
  };

  const reorderProjects = (orderedIds: string[]) => {
    markUnsavedChanges();
    setProjects((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      const reordered: Project[] = [];
      orderedIds.forEach((pid, idx) => {
        const item = map.get(pid);
        if (item) {
          const updated = { ...item, order: idx + 1, displayOrder: idx + 1 };
          reordered.push(updated);
          map.delete(pid);
        }
      });
      // Append any remaining
      map.forEach((item) => {
        reordered.push(item);
      });
      return reordered;
    });
  };

  const toggleProjectStatus = (id: string) => {
    const item = projects.find((p) => p.id === id);
    if (!item) return;
    const newStatus: 'published' | 'draft' = item.status === 'published' ? 'draft' : 'published';
    updateProject(id, { status: newStatus });
  };

  const deleteAllProjects = () => {
    markUnsavedChanges();
    setProjects([]);
  };

  const addExperience = (item: Omit<ExperienceItem, 'id'>) => {
    markUnsavedChanges();
    const newItem: ExperienceItem = {
      ...item,
      id: `exp-${Date.now()}`
    };
    setExperience((prev) => [...prev, newItem]);
  };

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    markUnsavedChanges();
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExperience = (id: string) => {
    markUnsavedChanges();
    setExperience((prev) => prev.filter((e) => e.id !== id));
  };

  const addEducation = (item: Omit<EducationItem, 'id'>) => {
    markUnsavedChanges();
    const newItem: EducationItem = {
      ...item,
      id: `edu-${Date.now()}`
    };
    setEducation((prev) => [...prev, newItem]);
  };

  const updateEducation = (id: string, updates: Partial<EducationItem>) => {
    markUnsavedChanges();
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEducation = (id: string) => {
    markUnsavedChanges();
    setEducation((prev) => prev.filter((e) => e.id !== id));
  };

  const addMedia = (name: string, url: string, mimeType: string, size: number): MediaAsset => {
    markUnsavedChanges();
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      url,
      mimeType,
      size,
      uploadedAt: new Date().toISOString()
    };
    setMedia((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const saveResumeUpload = async (url: string, name: string, size: number): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Sign in to Supabase Auth before replacing the resume.' };
    markUnsavedChanges();
    const asset: MediaAsset = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      url,
      mimeType: 'application/pdf',
      size,
      uploadedAt: new Date().toISOString()
    };
    setSettings((current) => ({ ...current, resumeUrl: url }));
    setMedia((current) => [asset, ...current]);
    setCloudSaveError(null);
    return { success: true };
  };

  const deleteMedia = (id: string) => {
    markUnsavedChanges();
    setMedia((prev) => {
      let removed = false;
      return prev.filter((asset) => {
        if (!removed && asset.id === id) {
          removed = true;
          return false;
        }
        return true;
      });
    });
  };

  const resetToDefaults = () => {
    markUnsavedChanges();
    setSettings(initialSiteSettings);
    setProjects(initialProjects);
    setExperience(initialExperience);
    setEducation(initialEducation);
    setMedia([
      { id: 'media-01', name: 'Hero ID portrait', url: '/assets/media/hero-id-portrait.jpeg', mimeType: 'image/jpeg', size: 704000, uploadedAt: new Date().toISOString() },
      { id: 'media-02', name: 'SOMTU Case Cover', url: '/assets/media/somtu-cover.webp', mimeType: 'image/webp', size: 75800, uploadedAt: new Date().toISOString() },
      { id: 'media-03', name: 'SOMTU Design System', url: '/assets/media/somtu-design-system.webp', mimeType: 'image/webp', size: 52400, uploadedAt: new Date().toISOString() },
      { id: 'media-04', name: 'The Vedic Sewa Cover', url: '/assets/media/vedic-sewa-cover.png', mimeType: 'image/png', size: 118800, uploadedAt: new Date().toISOString() }
    ]);
    safeStorage.removeItem(STORAGE_KEYS.SETTINGS);
    safeStorage.removeItem(STORAGE_KEYS.PROJECTS);
  };

  return (
    <PortfolioContext.Provider
      value={{
        settings,
        projects,
        experience,
        education,
        media,
        isAdmin,
        adminUser,
        isSupabaseConnected,
        cloudSaveStatus,
        cloudSaveError,
        supabaseConfig,
        updateSupabaseConfig,
        syncAllProjectsToSupabase,
        saveProjectsNow,
        login,
        logout,
        changeAdminPassword,
        updateSettings,
        addProject,
        updateProject,
        deleteProject,
        duplicateProject,
        reorderProjects,
        toggleProjectStatus,
        deleteAllProjects,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        addMedia,
        saveResumeUpload,
        deleteMedia,
        resetToDefaults
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

