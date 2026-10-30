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
  supabaseConfig: { url: string; key: string };
  updateSupabaseConfig: (url: string, key: string) => boolean;
  syncAllProjectsToSupabase: () => Promise<{ success: boolean; count: number; message: string }>;
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
  deleteMedia: (id: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  SETTINGS: 'yc_portfolio_settings_v5',
  PROJECTS: 'yc_portfolio_projects_v6',
  EXPERIENCE: 'yc_portfolio_experience_v2',
  EDUCATION: 'yc_portfolio_education',
  MEDIA: 'yc_portfolio_media',
  AUTH: 'yc_portfolio_admin_auth'
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

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
        return { ...initialSiteSettings, ...parsed };
      }
      return initialSiteSettings;
    } catch {
      return initialSiteSettings;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      // Clear legacy storage versions to prevent deleted projects from persisting in local browser cache
      safeStorage.removeItem('yc_portfolio_projects_v5');
      safeStorage.removeItem('yc_portfolio_projects_v4');
      safeStorage.removeItem('yc_portfolio_projects_v3');
      const stored = safeStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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
      return stored ? JSON.parse(stored) : [
        {
          id: 'media-01',
          name: 'Home portrait',
          url: '/assets/media/home-media-02-c6ea6ce61d01.webp',
          mimeType: 'image/webp',
          size: 142000,
          uploadedAt: new Date().toISOString()
        },
        {
          id: 'media-02',
          name: 'SOMTU Case Cover',
          url: '/assets/media/home-media-04-f775f2921176.webp',
          mimeType: 'image/webp',
          size: 218000,
          uploadedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return false;
  });

  const [adminUser, setAdminUser] = useState<string | null>(() => {
    return null;
  });

  const [supabaseConfig, setSupabaseConfigState] = useState<{ url: string; key: string }>(() => {
    return getSavedCredentials();
  });

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => {
    return false;
  });
  const [cloudReady, setCloudReady] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const lastCloudSnapshot = useRef<string | null>(null);

  // Sync to local storage for fast boot
  useEffect(() => {
    try {
      safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      safeStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [projects]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(experience));
  }, [experience]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(education));
  }, [education]);

  useEffect(() => {
    try {
      safeStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [media]);

  // Supabase session, initial cloud load, and live snapshot subscription.
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let active = true;

    async function initSupabase() {
      setCloudReady(false);
      if (!isSupabaseConfigured()) {
        setIsSupabaseConnected(false);
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
        if (error) console.error('Supabase portfolio load failed:', error);
        lastCloudSnapshot.current = snapshot ? JSON.stringify(snapshot) : null;
        if (snapshot) {
          setSettings(snapshot.settings);
          setProjects(snapshot.projects);
          setExperience(snapshot.experience);
          setEducation(snapshot.education);
          setMedia(snapshot.media);
        }

        unsubscribe = subscribeToPortfolioSnapshot((fresh) => {
          if (!active) return;
          const serialized = JSON.stringify(fresh);
          if (serialized === lastCloudSnapshot.current) return;
          lastCloudSnapshot.current = serialized;
          setSettings(fresh.settings);
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
      }
    }

    void initSupabase();
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [supabaseConfig]);

  // Queue atomic saves so rapid edits cannot finish out of order and overwrite newer state.
  useEffect(() => {
    if (!cloudReady) return;
    const snapshot = { settings, projects, experience, education, media };
    const serialized = JSON.stringify(snapshot);
    if (serialized === lastCloudSnapshot.current) return;
    const timer = window.setTimeout(() => {
      saveQueue.current = saveQueue.current.then(async () => {
        const result = await savePortfolioSnapshot(snapshot);
        setIsSupabaseConnected(result.success);
        if (result.success) lastCloudSnapshot.current = serialized;
        if (!result.success) console.error('Supabase portfolio save failed:', result.error);
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [cloudReady, settings, projects, experience, education, media]);

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
      return { success: false, count: 0, message: 'Supabase credentials are not configured yet.' };
    }

    try {
      const result = await savePortfolioSnapshot({ settings, projects, experience, education, media });
      if (!result.success) throw new Error(result.error || 'Cloud save failed.');
      setIsSupabaseConnected(true);
      return {
        success: true,
        count: projects.length,
        message: `Portfolio snapshot saved. ${projects.length} projects are in Supabase.`
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: `Sync failed: ${err.message || 'Unknown error'}`
      };
    }
  }, [settings, projects, experience, education, media]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase || !email.trim() || !password) return false;
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session) return false;
    setIsAdmin(true);
    setAdminUser(data.user.email || email.trim());
    setCloudReady(true);
    safeStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    return true;
  };

  const changeAdminPassword = async (newPassword: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase || newPassword.trim().length < 8) return false;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setCloudReady(false);
    setIsAdmin(false);
    setAdminUser(null);
    safeStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
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
      coverImage: projectData.coverImage || '/assets/media/home-media-04-f775f2921176.webp',
      heroImage: projectData.heroImage || {
        url: projectData.coverImage || '/assets/media/home-media-04-f775f2921176.webp',
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
        image: projectData.coverImage || '/og-rizka-portfolio.jpg'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects((prev) => [...prev, newProj]);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
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
    setProjects([]);
  };

  const addExperience = (item: Omit<ExperienceItem, 'id'>) => {
    const newItem: ExperienceItem = {
      ...item,
      id: `exp-${Date.now()}`
    };
    setExperience((prev) => [...prev, newItem]);
  };

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExperience = (id: string) => {
    setExperience((prev) => prev.filter((e) => e.id !== id));
  };

  const addEducation = (item: Omit<EducationItem, 'id'>) => {
    const newItem: EducationItem = {
      ...item,
      id: `edu-${Date.now()}`
    };
    setEducation((prev) => [...prev, newItem]);
  };

  const updateEducation = (id: string, updates: Partial<EducationItem>) => {
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEducation = (id: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== id));
  };

  const addMedia = (name: string, url: string, mimeType: string, size: number): MediaAsset => {
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      name,
      url,
      mimeType,
      size,
      uploadedAt: new Date().toISOString()
    };
    setMedia((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const deleteMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToDefaults = () => {
    setSettings(initialSiteSettings);
    setProjects(initialProjects);
    setExperience(initialExperience);
    setEducation(initialEducation);
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
        supabaseConfig,
        updateSupabaseConfig,
        syncAllProjectsToSupabase,
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

