import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, Project, ExperienceItem, EducationItem, MediaAsset } from '../types';
import { initialSiteSettings, initialProjects, initialExperience, initialEducation } from '../data/initialData';
import { normalizeProjectSections } from '../utils/caseStudyUtils';
import {
  fetchProjectsFromDb,
  saveProjectToDb,
  deleteProjectFromDb,
  saveSettingsToDb,
  saveMediaToDb,
  deleteMediaFromDb,
  subscribeToProjects
} from '../utils/firestoreService';

interface PortfolioContextType {
  settings: SiteSettings;
  projects: Project[];
  experience: ExperienceItem[];
  education: EducationItem[];
  media: MediaAsset[];
  isAdmin: boolean;
  adminUser: string | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
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
  PROJECTS: 'yc_portfolio_projects_v5',
  EXPERIENCE: 'yc_portfolio_experience_v2',
  EDUCATION: 'yc_portfolio_education',
  MEDIA: 'yc_portfolio_media',
  AUTH: 'yc_portfolio_admin_auth'
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : initialSiteSettings;
    } catch {
      return initialSiteSettings;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
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
      const stored = localStorage.getItem(STORAGE_KEYS.EXPERIENCE);
      return stored ? JSON.parse(stored) : initialExperience;
    } catch {
      return initialExperience;
    }
  });

  const [education, setEducation] = useState<EducationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EDUCATION);
      return stored ? JSON.parse(stored) : initialEducation;
    } catch {
      return initialEducation;
    }
  });

  const [media, setMedia] = useState<MediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
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
        },
        {
          id: 'media-03',
          name: 'DANA Case Cover',
          url: '/assets/media/home-media-03-d6c887bed8af.webp',
          mimeType: 'image/webp',
          size: 195000,
          uploadedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<string | null>(() => {
    return isAdmin ? 'Yogendra Chaudhary' : null;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [media]);

  // Real Firestore Synchronization & Seeding on initial mount
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    async function initFirestore() {
      try {
        const remoteProjects = await fetchProjectsFromDb();
        if (remoteProjects && remoteProjects.length > 0) {
          // Sort by displayOrder or order
          const sorted = remoteProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
          setProjects(sorted);
        } else {
          // Seed initial projects to Firestore
          console.info('Seeding initial projects to Firestore...');
          for (const proj of initialProjects) {
            await saveProjectToDb(proj);
          }
        }

        // Subscribe to live changes
        unsubscribe = subscribeToProjects((liveProjects) => {
          if (liveProjects && liveProjects.length > 0) {
            const sorted = liveProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
            setProjects(sorted);
          }
        });
      } catch (err) {
        console.warn('Firestore initial sync notice:', err);
      }
    }

    initFirestore();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = (u: string, p: string): boolean => {
    const validUsers = ['admin', 'zane-wick', 'yogendra'];
    const cleanedUser = u.trim().toLowerCase();
    if ((validUsers.includes(cleanedUser) || cleanedUser.length > 0) && p.length >= 4) {
      setIsAdmin(true);
      setAdminUser(cleanedUser === 'zane-wick' ? 'Zane Wick' : 'Yogendra Chaudhary');
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
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
      saveSettingsToDb(merged);
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
    saveProjectToDb(newProj);
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
          saveProjectToDb(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteProjectFromDb(id);
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
          saveProjectToDb(updated);
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
    projects.forEach((p) => deleteProjectFromDb(p.id));
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
    saveMediaToDb(newAsset);
    return newAsset;
  };

  const deleteMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    deleteMediaFromDb(id);
  };

  const resetToDefaults = () => {
    setSettings(initialSiteSettings);
    setProjects(initialProjects);
    setExperience(initialExperience);
    setEducation(initialEducation);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
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
        login,
        logout,
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
