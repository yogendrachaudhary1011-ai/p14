import React, { useState } from 'react';
import { Project, CaseStudySection, MediaAsset } from '../../types';
import { CaseStudyBuilder } from './CaseStudyBuilder';
import { ProjectCaseStudyTemplate } from '../project-case-study/ProjectCaseStudyTemplate';
import { normalizeProjectSections } from '../../utils/caseStudyUtils';

interface ProjectEditorProps {
  initialProject?: Project | null;
  existingProjects: Project[];
  mediaLibrary: MediaAsset[];
  onSave: (projectData: Partial<Project>) => void;
  onCancel: () => void;
}

type TabType = 'basic' | 'hero' | 'caseStudy' | 'media' | 'seo';

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  initialProject,
  existingProjects,
  mediaLibrary,
  onSave,
  onCancel
}) => {
  const isEditing = !!initialProject;

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(initialProject?.title || '');
  const [slug, setSlug] = useState(initialProject?.slug || '');
  const [category, setCategory] = useState<'product' | 'archive'>(initialProject?.category || 'product');
  const [categoryLabel, setCategoryLabel] = useState(initialProject?.categoryLabel || 'Case Study');
  const [year, setYear] = useState(initialProject?.year || '2026');
  const [status, setStatus] = useState<'published' | 'draft'>(initialProject?.status || 'published');
  const [featured, setFeatured] = useState<boolean>(initialProject?.featured ?? true);
  const [order, setOrder] = useState<number>(initialProject?.order || existingProjects.length + 1);

  // Hero & Overview
  const [heroSubtitle, setHeroSubtitle] = useState(
    initialProject?.heroSubtitle || initialProject?.shortSummary || ''
  );
  const [introduction, setIntroduction] = useState(
    initialProject?.introduction || initialProject?.summary || ''
  );
  const [role, setRole] = useState(initialProject?.role || 'UI/UX & Product Designer');
  const [duration, setDuration] = useState(initialProject?.duration || '1 Month');
  const [deliverablesInput, setDeliverablesInput] = useState(
    initialProject?.deliverables?.join('\n') ||
      '87 screens and states in Figma\n81 component variants\nDesktop (1440 px) and mobile (428 px)\nA design reference document for developers'
  );
  const [figmaUrl, setFigmaUrl] = useState(initialProject?.figmaUrl || 'https://www.figma.com');
  const [figmaButtonText, setFigmaButtonText] = useState(initialProject?.figmaButtonText || 'View Figma File');
  const [externalProjectUrl, setExternalProjectUrl] = useState(initialProject?.externalProjectUrl || '');

  // Media
  const [coverImage, setCoverImage] = useState(
    initialProject?.coverImage || '/assets/media/home-media-04-f775f2921176.webp'
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialProject?.heroImage?.url || initialProject?.coverImage || '/assets/media/home-media-04-f775f2921176.webp'
  );
  const [heroImageAlt, setHeroImageAlt] = useState(initialProject?.heroImage?.alt || '');

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProject?.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialProject?.seo?.description || '');
  const [seoImage, setSeoImage] = useState(initialProject?.seo?.image || '');

  // Case Study Sections
  const [sections, setSections] = useState<CaseStudySection[]>(() => {
    if (initialProject) {
      return normalizeProjectSections(initialProject);
    }
    // New project default sections matching SOMTU template
    return normalizeProjectSections({
      id: 'template',
      title: 'New Case Study',
      slug: 'new-case-study',
      summary: '',
      category: 'product',
      categoryLabel: 'Case Study',
      coverImage: '/assets/media/home-media-04-f775f2921176.webp',
      year: '2026',
      order: 1,
      status: 'published',
      featured: true,
      route: '/new-case-study',
      role: 'UI/UX Designer',
      duration: '1 Month',
      problem: {
        headline: 'THE PROBLEM',
        intro: 'Users were experiencing friction navigating workflows.',
        cards: [
          { title: 'Users need a clear path', items: ['Clear primary actions', 'Fewer clicks'] },
          { title: 'Returning users need speed', items: ['Fast lookups', 'Mobile-first layout'] }
        ]
      },
      challenge: {
        headline: 'MY CHALLENGE',
        statement: 'Design one connected interface where every audience can reach their task in a few taps.',
        constraints: ['Responsive desktop & mobile', 'Scalable component system']
      },
      insights: {
        headline: 'The aha moment - insights',
        tagline: 'Consistency is emotional, not functional.',
        cards: [
          { title: 'People come to do one thing.', desc: 'Every key screen should make its main action obvious.' },
          { title: 'Lists are the website.', desc: 'Shared search and chips provide instant familiarity.' }
        ]
      }
    } as Project);
  });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === '')) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const getCleanFormData = (): Partial<Project> => {
    const deliverables = deliverablesInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return {
      title: title.trim() || 'Untitled Project',
      slug: cleanSlug,
      category,
      categoryLabel: categoryLabel.trim() || 'Case Study',
      year: year.trim() || '2026',
      status,
      featured,
      order: Number(order) || 1,
      displayOrder: Number(order) || 1,
      heroSubtitle: heroSubtitle.trim(),
      shortSummary: heroSubtitle.trim(),
      introduction: introduction.trim(),
      summary: introduction.trim(),
      role: role.trim(),
      duration: duration.trim(),
      deliverables,
      figmaUrl: figmaUrl.trim(),
      figmaButtonText: figmaButtonText.trim() || 'View Figma File',
      externalProjectUrl: externalProjectUrl.trim(),
      coverImage: coverImage.trim(),
      heroImage: {
        url: heroImageUrl.trim() || coverImage.trim(),
        alt: heroImageAlt.trim() || title.trim()
      },
      seo: {
        title: seoTitle.trim() || `${title} — Yogendra Chaudhary`,
        description: seoDescription.trim() || heroSubtitle.trim(),
        image: seoImage.trim() || coverImage.trim()
      },
      sections
    };
  };

  const handleSaveAttempt = (forcedStatus?: 'published' | 'draft') => {
    setValidationError(null);

    const targetStatus = forcedStatus || status;

    if (!title.trim()) {
      setValidationError('Project title is required.');
      setActiveTab('basic');
      return;
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!cleanSlug) {
      setValidationError('Project slug is required for URL generation.');
      setActiveTab('basic');
      return;
    }

    // Slug uniqueness check
    const duplicateSlug = existingProjects.find(
      (p) => p.slug === cleanSlug && (!initialProject || p.id !== initialProject.id)
    );
    if (duplicateSlug) {
      setValidationError(`The slug "${cleanSlug}" is already used by "${duplicateSlug.title}". Choose a unique slug.`);
      setActiveTab('basic');
      return;
    }

    const payload = getCleanFormData();
    payload.status = targetStatus;
    onSave(payload);
  };

  // Preview project mock
  const previewProject: Project = {
    ...(getCleanFormData() as Project),
    id: initialProject?.id || slug || 'preview-id',
    route: `/${slug}`
  };

  return (
    <div className="w-full flex flex-col gap-6 font-['Plus_Jakarta_Sans']">
      {/* Top Header & Action Controls */}
      <div className="p-4 rounded-[8px] bg-zinc-900 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[#ff853a]">
              {isEditing ? 'edit_document' : 'add_circle'}
            </span>
            <h2 className="text-white font-bold text-lg">
              {isEditing ? `Edit Case Study: ${initialProject.title}` : 'Create New Project Case Study'}
            </h2>
          </div>
          <p className="text-zinc-400 text-xs">
            Build and manage database-driven case study chapters, deliverables, metadata, and visual blocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <span className="material-symbols-rounded text-sm">visibility</span>
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAttempt('draft')}
            className="px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <span className="material-symbols-rounded text-sm">save</span>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAttempt('published')}
            className="px-4 py-2 rounded bg-[#ff853a] hover:bg-[#ff721a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff853a]/20"
          >
            <span className="material-symbols-rounded text-sm">publish</span>
            <span>Publish Case Study</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="p-3 rounded bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <span className="material-symbols-rounded text-base text-red-400">error</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'basic', label: '1. Basic Info & URL', icon: 'info' },
          { id: 'hero', label: '2. Hero & Metadata', icon: 'overview' },
          { id: 'caseStudy', label: '3. Case Study Builder', icon: 'view_quilt' },
          { id: 'media', label: '4. Media Assets', icon: 'image' },
          { id: 'seo', label: '5. SEO & Social', icon: 'search' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-t-[6px] text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-800 text-white border-t-2 border-[#ff853a]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <span className="material-symbols-rounded text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'caseStudy' && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#ff853a]/20 text-[#ff853a] text-[10px]">
                  {sections.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASIC INFO */}
      {activeTab === 'basic' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="e.g. SOMTU or DANA"
                required
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                The primary uppercase hero title displayed in 9XL font.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                URL Slug * (Unique)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-zinc-900 border border-r-0 border-white/10 text-zinc-500 text-xs rounded-l">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-r bg-zinc-950 border border-white/10 text-white text-sm font-mono"
                  placeholder="e.g. somtu"
                  required
                />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Unique permanent route for direct visits (e.g. /somtu).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'product' | 'archive')}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
              >
                <option value="product">Product Case Study</option>
                <option value="archive">Archive / Concept</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Badge / Tag Label
              </label>
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                placeholder="e.g. Case Study"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Project Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                placeholder="2026"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
              >
                <option value="published">Published (Publicly accessible)</option>
                <option value="draft">Draft (Admin preview only)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-[#ff853a]"
                />
                <span>Feature on Homepage Selected Work</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO & METADATA */}
      {activeTab === 'hero' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Hero Subtitle / Short Summary (Right Column of Hero)
            </label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder="A case study on designing the complete School of Management, Tribhuvan University website, from landing page to registration, across desktop and mobile..."
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Displays right beside the large uppercase project title.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Introduction Paragraph (Under Hero Image)
            </label>
            <textarea
              rows={3}
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder="The School of Management at Tribhuvan University (SOMTU) is a Kathmandu-based management school. I designed its public website..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                My Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="e.g. UI/UX Design Intern or Lead Product Designer"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="e.g. 1 Month or 6 Weeks"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Deliverables List (One per line)
            </label>
            <textarea
              rows={4}
              value={deliverablesInput}
              onChange={(e) => setDeliverablesInput(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm font-mono text-xs"
              placeholder="87 screens and states in Figma&#10;81 component variants&#10;Desktop (1440 px) and mobile (428 px)&#10;A design reference document for developers"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Figma Prototype / File URL
              </label>
              <input
                type="url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="https://www.figma.com/design/..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Figma Button Label
              </label>
              <input
                type="text"
                value={figmaButtonText}
                onChange={(e) => setFigmaButtonText(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="View Figma File"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                External Live Project URL (Optional)
              </label>
              <input
                type="url"
                value={externalProjectUrl}
                onChange={(e) => setExternalProjectUrl(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="https://somtu.edu.np"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASE STUDY BUILDER */}
      {activeTab === 'caseStudy' && (
        <CaseStudyBuilder
          sections={sections}
          onChange={(newSections) => setSections(newSections)}
          mediaLibrary={mediaLibrary}
        />
      )}

      {/* TAB 4: MEDIA ASSETS */}
      {activeTab === 'media' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-mono uppercase text-zinc-400">
                Primary Hero Banner Image
              </label>
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="Path or URL to hero image..."
              />
              <input
                type="text"
                value={heroImageAlt}
                onChange={(e) => setHeroImageAlt(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                placeholder="Alt description..."
              />
              {heroImageUrl && (
                <div className="w-full rounded border border-white/10 overflow-hidden bg-black aspect-[16/9] flex items-center justify-center">
                  <img src={heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-xs font-mono uppercase text-zinc-400">
                Listing &amp; Card Cover Image
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="Path or URL to card cover..."
              />
              {coverImage && (
                <div className="w-full rounded border border-white/10 overflow-hidden bg-black aspect-[16/9] flex items-center justify-center">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Quick select from media library */}
          {mediaLibrary.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="text-xs font-mono uppercase text-zinc-400">
                Select from Media Library:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {mediaLibrary.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setHeroImageUrl(m.url);
                      setCoverImage(m.url);
                    }}
                    className="group relative rounded border border-white/10 overflow-hidden bg-black aspect-video cursor-pointer hover:border-[#ff853a]"
                  >
                    <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white p-1 text-center font-mono">
                      Set as Hero
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SEO */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Custom Page SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder={`${title || 'Project'} — Yogendra Chaudhary Portfolio`}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder="Concise overview for search engine result snippets and social shares..."
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              OpenGraph Social Share Image URL
            </label>
            <input
              type="text"
              value={seoImage}
              onChange={(e) => setSeoImage(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder="/og-rizka-portfolio.jpg"
            />
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          {/* Preview Modal Header */}
          <div className="px-6 py-3 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff853a] animate-pulse"></span>
              <span className="text-white text-sm font-semibold font-mono">
                Live Case Study Preview: {previewProject.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveAttempt('published')}
                className="px-4 py-1.5 rounded bg-[#ff853a] text-white text-xs font-semibold hover:bg-[#ff721a] cursor-pointer"
              >
                Publish Directly
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 cursor-pointer"
              >
                Exit Preview
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-y-auto bg-black">
            <ProjectCaseStudyTemplate project={previewProject} isAdminPreview={true} />
          </div>
        </div>
      )}
    </div>
  );
};
