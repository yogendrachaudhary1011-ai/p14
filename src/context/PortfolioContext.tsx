import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, Project, ExperienceItem, EducationItem, MediaAsset } from '../types';
import { initialSiteSettings, initialProjects, initialExperience, initialEducation } from '../data/initialData';

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
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
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
  SETTINGS: 'yc_portfolio_settings',
  PROJECTS: 'yc_portfolio_projects_v2', // bumped to permanently clear old projects
  EXPERIENCE: 'yc_portfolio_experience_v2',
  EDUCATION: 'yc_portfolio_education',
  MEDIA: 'yc_portfolio_media',
  AUTH: 'yc_portfolio_admin_auth'
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge old projects from prior storage key
  useEffect(() => {
    try {
      localStorage.removeItem('yc_portfolio_projects');
    } catch {
      // ignore
    }
  }, []);

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
      return stored ? JSON.parse(stored) : initialProjects;
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

  // Sync to local storage on changes
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
      localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(experience));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [experience]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(education));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [education]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [media]);

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
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      seo: {
        ...prev.seo,
        ...(newSettings.seo || {})
      }
    }));
  };

  const addProject = (projectData: Omit<Project, 'id'>): Project => {
    const id = projectData.slug || `proj-${Date.now()}`;
    const newProj: Project = {
      ...projectData,
      id,
      route: `/${projectData.slug}`
    };
    setProjects(prev => [...prev, newProj]);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        if (updates.slug && updates.slug !== p.slug) {
          updated.route = `/${updates.slug}`;
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const deleteAllProjects = () => {
    setProjects([]);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  };

  const addExperience = (item: Omit<ExperienceItem, 'id'>) => {
    const newItem: ExperienceItem = {
      ...item,
      id: `exp-${Date.now()}`
    };
    setExperience(prev => [...prev, newItem]);
  };

  const updateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    setExperience(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExperience = (id: string) => {
    setExperience(prev => prev.filter(e => e.id !== id));
  };

  const addEducation = (item: Omit<EducationItem, 'id'>) => {
    const newItem: EducationItem = {
      ...item,
      id: `edu-${Date.now()}`
    };
    setEducation(prev => [...prev, newItem]);
  };

  const updateEducation = (id: string, updates: Partial<EducationItem>) => {
    setEducation(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEducation = (id: string) => {
    setEducation(prev => prev.filter(e => e.id !== id));
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
    setMedia(prev => [newAsset, ...prev]);
    return newAsset;
  };

  const deleteMedia = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  const resetToDefaults = () => {
    setSettings(initialSiteSettings);
    setProjects([]);
    setExperience(initialExperience);
    setEducation(initialEducation);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.EXPERIENCE);
    localStorage.removeItem(STORAGE_KEYS.EDUCATION);
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
