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
  PROJECTS: 'yc_portfolio_projects_v3', // unified to brand new case study design system
  EXPERIENCE: 'yc_portfolio_experience_v2',
  EDUCATION: 'yc_portfolio_education',
  MEDIA: 'yc_portfolio_media',
  AUTH: 'yc_portfolio_admin_auth'
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge old projects from prior storage keys
  useEffect(() => {
    try {
      localStorage.removeItem('yc_portfolio_projects');
      localStorage.removeItem('yc_portfolio_projects_v2');
      localStorage.removeItem('portfolio_cms_projects');
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
      heroSubtitle: projectData.heroSubtitle || `A case study on designing ${projectData.title}, covering user research, component architecture, and implementation-ready flows across desktop and mobile.`,
      role: projectData.role || 'UI/UX & Product Designer',
      duration: projectData.duration || '1 Month',
      deliverables: projectData.deliverables || [
        'Interactive Figma prototype and flows',
        'Reusable design system and component variants',
        'Desktop (1440 px) and mobile (428 px) responsive layouts',
        'A design reference document for developers'
      ],
      figmaUrl: projectData.figmaUrl || 'https://www.figma.com',
      figmaButtonText: projectData.figmaButtonText || 'View Figma File',
      problem: projectData.problem || {
        headline: 'THE PROBLEM',
        intro: `Users experienced notable friction navigating workflows in ${projectData.title}, leading to low task completion rates and frequent user drop-off.`,
        cards: [
          {
            title: 'Users need a clear path',
            items: [
              'Primary actions were obscured by dense information',
              'Multi-step processes lacked progress clarity',
              'Confirmation and system feedback were hard to verify'
            ]
          },
          {
            title: 'Returning users need speed',
            items: [
              'Frequent lookups and repeat tasks took too many clicks',
              'Complex lists were difficult to filter',
              'High mobile traffic demanded touch-optimized flows'
            ]
          },
          {
            title: 'The product needs trust & authority',
            items: [
              'Visual hierarchy needed consistent polish',
              'Bilingual or multi-format content needed clear hierarchy',
              'Unified brand identity was required across all screens'
            ]
          }
        ],
        image: projectData.coverImage
      },
      challenge: projectData.challenge || {
        headline: 'MY CHALLENGE',
        statement: `Design one connected interface where every audience can reach their task in a few taps, on desktop and mobile, while keeping the brand cohesive across all feature areas.`,
        constraints: [
          'Multiple distinct audience segments and content types',
          'Established brand foundation to extend and modernize',
          'Rich data, lists, and document attachments',
          'Two target sizes, 1440 px and 428 px, designed as equals'
        ]
      },
      insights: projectData.insights || {
        headline: 'The aha moment - insights',
        tagline: 'Consistency is emotional, not functional.',
        cards: [
          {
            title: 'People come to do one thing.',
            desc: 'Every key screen should make its main action obvious immediately.'
          },
          {
            title: 'Lists are the website.',
            desc: 'Shared search, chips, and pagination provide an instantly familiar interaction model.'
          },
          {
            title: 'Long forms need a map.',
            desc: 'A clear stepper, review checkpoint, and confirmation convert daunting workflows into guided paths.'
          }
        ]
      },
      keyDecisions: projectData.keyDecisions || {
        headline: 'KEY DECISIONS & WHY?',
        decisions: [
          {
            title: 'One shell for every page',
            constraint: 'Multiple feature areas, each with distinct tasks.',
            whatIDid: 'Built a shared header with announcement banner, utility links, search, and a persistent primary action button.',
            why: 'Users always know their orientation and next step regardless of entry point.'
          },
          {
            title: 'Action-first landing experience',
            constraint: 'Overwhelming initial choices cause decision paralysis.',
            whatIDid: 'Organized the hero around primary action paths followed by curated exploration tiers.',
            why: 'Direct visitors convert quickly while casual browsers discover content organically.'
          },
          {
            title: 'Standardized list pattern',
            constraint: 'Multiple listings risked inconsistent mental models.',
            whatIDid: 'Standardized filters, search inputs, tags, and detail view modals.',
            why: 'Learning one screen prepares the user for every other section.'
          },
          {
            title: 'Guided multi-step forms',
            constraint: 'Extensive data submission causes user fatigue.',
            whatIDid: 'Segmented flows into focused steps with real-time feedback and validation summaries.',
            why: 'Minimizes drop-off and provides confidence before final submission.'
          }
        ]
      },
      solution: projectData.solution || {
        headline: 'SOLUTION',
        tagline: 'Six core principles held the whole website together.',
        cards: [
          { title: 'One shell', desc: 'Shared header, footer, and primary CTA on every page.' },
          { title: 'Action-first pages', desc: 'Each page makes its main action obvious.' },
          { title: 'One list pattern', desc: 'Search, chips, and pagination reused across all content types.' },
          { title: 'Guided forms', desc: 'Steppers, review steps, and confirmation for long tasks.' },
          { title: 'State-aware screens', desc: 'Upcoming, ended, empty, and success states designed, not left to chance.' },
          { title: 'Mobile as an equal', desc: 'Every chapter designed at 428 px with its own patterns.' }
        ],
        image: projectData.coverImage
      },
      whyWorks: projectData.whyWorks || {
        headline: 'Why this approach works?',
        cards: [
          { title: 'Familiar everywhere', desc: 'Learn one page and you know the rest.' },
          { title: 'Faster tasks', desc: 'Search and filters reach any item in a few taps.' },
          { title: 'Easier to build', desc: 'Repeated patterns and documented component tokens cut handoff questions.' }
        ]
      },
      whatNeededWork: projectData.whatNeededWork || {
        headline: 'but.. WHAT NEEDED WORK?',
        firstAttempt: 'Displaying complete filter arrays inline on mobile.',
        problem: 'Too many category tags caused horizontal overflow and pushed results below the fold.',
        fix: 'Shifted full filter controls into a dedicated modal bottom sheet with apply and reset actions.',
        learning: 'Desktop patterns do not shrink. They have to be redesigned for thumbs.'
      },
      designSystem: projectData.designSystem || {
        headline: 'DESIGN SYSTEM',
        desc: 'Extended brand assets into a comprehensive UI kit: typography scale, color semantics, card structures, and responsive component variants.',
        images: [
          'https://placehold.co/884x660/161922/ffffff?text=Design+System+Typography+%26+Colors',
          'https://placehold.co/884x660/181c26/ffffff?text=Component+Variants+%26+Buttons',
          'https://placehold.co/884x660/141822/ffffff?text=Input+States+%26+Form+Steppers'
        ]
      },
      product: projectData.product || {
        headline: 'THE PRODUCT',
        desc: 'Feature areas designed for desktop and mobile with complete interactive states.',
        screens: [
          'https://placehold.co/554x1200/181c25/ffffff?text=Product+Overview+Screen+1',
          'https://placehold.co/554x1200/141721/ffffff?text=Product+Overview+Screen+2',
          'https://placehold.co/554x1200/191d27/ffffff?text=Product+Overview+Screen+3'
        ]
      },
      learnings: projectData.learnings || {
        headline: 'LEARNINGS',
        cards: [
          { title: 'Systems beat pages', desc: 'A shared shell and list pattern made distinct feature areas feel like one cohesive product.' },
          { title: 'Design every state', desc: 'Upcoming, empty, active, and success states are critical for user confidence.' },
          { title: 'Match layout to reading', desc: 'Articles, notices, and directory listings each deserve appropriate layout hierarchy.' },
          { title: 'Mobile is its own design', desc: 'Filters, forms, and dense tables require mobile-native interaction models.' }
        ]
      },
      whatDoDifferently: projectData.whatDoDifferently || {
        headline: "WHAT I'D DO DIFFERENTLY",
        cards: [
          { title: 'Test with real users', desc: 'Conduct quick usability validation on primary conversion funnels.' },
          { title: 'Document rationale', desc: 'Write concise architectural rationale beside each component group.' },
          { title: 'Plan for language', desc: 'Incorporate multilingual copy expansion and localization early.' }
        ]
      },
      projectConstraints: projectData.projectConstraints || {
        headline: 'PROJECT CONSTRAINTS',
        intro: 'What shaped the work:',
        items: [
          'Strict delivery timeline with milestone reviews',
          'Existing brand foundation to respect and elevate',
          'Real production content and document downloads',
          'Desktop at 1440 px and mobile at 428 px as equal priorities'
        ]
      },
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
