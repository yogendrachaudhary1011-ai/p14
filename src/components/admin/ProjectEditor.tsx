import React, { useRef, useState } from 'react';
import { Project, CaseStudySection, DeliverableGroup, MediaAsset, ProjectTheme } from '../../types';
import { CaseStudyBuilder } from './CaseStudyBuilder';
import { ProjectCaseStudyTemplate } from '../project-case-study/ProjectCaseStudyTemplate';
import { normalizeProjectSections, getFullCaseStudyTemplate } from '../../utils/caseStudyUtils';
import { MediaPreview } from '../MediaPreview';
import { MediaUploadField } from './MediaUploadField';
import { BufferedTextInput, BufferedTextarea } from './BufferedTextField';
import { isVideoMedia } from '../../utils/media';
import { ImageCropPanZoomModal } from './ImageCropPanZoomModal';
import { ProjectThemeEditor } from './ProjectThemeEditor';
import { DEFAULT_THEME } from '../../utils/themePresets';
import { Crop, Move, ZoomIn, Maximize2, Minimize2, Eye, Sliders, Check } from 'lucide-react';

interface ProjectEditorProps {
  initialProject?: Project | null;
  existingProjects: Project[];
  mediaLibrary: MediaAsset[];
  initialTab?: TabType;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  onUploadMedia: (file: File) => Promise<MediaAsset>;
  onCancel: () => void;
}

export type TabType = 'basic' | 'hero' | 'theme' | 'media' | 'caseStudy' | 'seo';

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  initialProject,
  existingProjects,
  mediaLibrary,
  initialTab,
  onSave,
  onUploadMedia,
  onCancel
}) => {
  const isEditing = !!initialProject;

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'basic');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [projectMedia, setProjectMedia] = useState(mediaLibrary);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const projectMediaInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialProject?.title || '');
  const [slug, setSlug] = useState(initialProject?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
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
  const [deliverableGroups, setDeliverableGroups] = useState<DeliverableGroup[]>(() => {
    if (initialProject?.deliverableGroups?.length) return initialProject.deliverableGroups;
    if (initialProject?.deliverables?.length) {
      return [{ id: 'deliverables-default', label: 'Deliverables', items: initialProject.deliverables }];
    }
    return [{ id: 'deliverables-default', label: 'Deliverables', items: ['87 screens and states in Figma', '81 component variants', 'Desktop (1440 px) and mobile (428 px)', 'A design reference document for developers'] }];
  });
  const [figmaUrl, setFigmaUrl] = useState(initialProject?.figmaUrl || 'https://www.figma.com');
  const [figmaButtonText, setFigmaButtonText] = useState(initialProject?.figmaButtonText || 'View Figma File');
  const [externalProjectUrl, setExternalProjectUrl] = useState(initialProject?.externalProjectUrl || '');

  // Media
  const [coverImage, setCoverImage] = useState(
    initialProject?.coverImage || '/assets/media/home-media-04-f775f2921176.webp'
  );
  const [coverClass, setCoverClass] = useState<string>(
    initialProject?.coverClass || ''
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialProject?.heroImage?.url || initialProject?.coverImage || '/assets/media/home-media-04-f775f2921176.webp'
  );
  const [heroImageAlt, setHeroImageAlt] = useState(initialProject?.heroImage?.alt || '');
  const [adjustingCropTarget, setAdjustingCropTarget] = useState<'hero' | 'cover' | null>(null);
  const [previewHeroAspect, setPreviewHeroAspect] = useState<'21:9' | '16:9' | '16:10'>('21:9');
  const [previewCoverAspect, setPreviewCoverAspect] = useState<'16:9' | '4:3' | '1:1'>('16:9');

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProject?.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialProject?.seo?.description || '');
  const [seoImage, setSeoImage] = useState(initialProject?.seo?.image || '');

  // Theme & Styling Customization
  const [theme, setTheme] = useState<ProjectTheme>(
    initialProject?.theme || { ...DEFAULT_THEME, preset: 'default' }
  );

  // Case Study Sections
  const [sections, setSections] = useState<CaseStudySection[]>(() => {
    if (initialProject) {
      return normalizeProjectSections(initialProject);
    }
    // New project default sections: comprehensive 12-chapter template with all block types
    return getFullCaseStudyTemplate('New Case Study');
  });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slugManuallyEdited) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const uploadProjectMedia = async (file: File): Promise<MediaAsset> => {
    const asset = await onUploadMedia(file);
    setProjectMedia((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
    return asset;
  };

  const handleProjectMediaUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingFiles(true);
    setUploadMessage(null);
    const fileArray = Array.from(files);
    const results = await Promise.allSettled(
      fileArray.map((file) => uploadProjectMedia(file))
    );
    const uploaded: MediaAsset[] = [];
    const failures: string[] = [];
    results.forEach((res, index) => {
      const file = fileArray[index];
      if (res.status === 'fulfilled') {
        uploaded.push(res.value);
      } else {
        failures.push(`${file.name}: ${res.reason instanceof Error ? res.reason.message : 'Upload failed'}`);
      }
    });

    if (uploaded.length) {
      const firstImage = uploaded.find((asset) => !isVideoMedia(asset.url, asset.mimeType));
      if (firstImage) {
        setHeroImageUrl((current) => current || firstImage.url);
        setCoverImage((current) => current || firstImage.url);
        setSeoImage((current) => current || firstImage.url);
      }
    }
    setUploadMessage([
      uploaded.length ? `${uploaded.length} file${uploaded.length === 1 ? '' : 's'} uploaded to Supabase and added to this project.` : '',
      failures.join(' · ')
    ].filter(Boolean).join(' '));
    setUploadingFiles(false);
    if (projectMediaInputRef.current) projectMediaInputRef.current.value = '';
  };

  const getCleanFormData = (): Partial<Project> => {
    const cleanDeliverableGroups = deliverableGroups.map((group) => ({
      ...group,
      label: group.label.trim() || 'Untitled section',
      items: group.items.map((item) => item.trim()).filter(Boolean),
      visible: group.visible !== false
    }));
    const deliverables = cleanDeliverableGroups.filter((g) => g.visible !== false).flatMap((group) => group.items);

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
      deliverableGroups: cleanDeliverableGroups,
      figmaUrl: figmaUrl.trim(),
      figmaButtonText: figmaButtonText.trim() || 'View Figma File',
      externalProjectUrl: externalProjectUrl.trim(),
      coverImage: coverImage.trim(),
      coverClass: coverClass.trim() || undefined,
      heroImage: {
        url: heroImageUrl.trim() || coverImage.trim(),
        alt: heroImageAlt.trim() || title.trim()
      },
      seo: {
        title: seoTitle.trim() || `${title} — Yogendra Chaudhary`,
        description: seoDescription.trim() || heroSubtitle.trim(),
        image: seoImage.trim() || coverImage.trim()
      },
      theme,
      sections
    };
  };

  const handleSaveAttempt = async (forcedStatus?: 'published' | 'draft') => {
    if (savingProject) return;
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
      (p) => p.slug?.trim().toLowerCase() === cleanSlug && (!initialProject || p.id !== initialProject.id)
    );
    if (duplicateSlug) {
      setValidationError(`The slug "${cleanSlug}" is already used by "${duplicateSlug.title}". Choose a unique slug.`);
      setActiveTab('basic');
      return;
    }

    const reservedSlugs = new Set(['admin', 'about', 'projects', 'work']);
    if (reservedSlugs.has(cleanSlug) || cleanSlug.startsWith('admin')) {
      setValidationError(`The slug "${cleanSlug}" is reserved for a website page. Choose a different slug.`);
      setActiveTab('basic');
      return;
    }

    const payload = getCleanFormData();
    payload.status = targetStatus;
    setSavingProject(true);
    try {
      await onSave(payload);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Could not save the case study to Supabase.');
    } finally {
      setSavingProject(false);
    }
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
              {isEditing ? `Edit project · ${initialProject.title}` : 'Create a project'}
            </h2>
          </div>
          <p className="text-zinc-400 text-xs">
            Add the project details, upload its images, then save as a draft or publish it.
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
            onClick={() => void handleSaveAttempt('draft')}
            disabled={savingProject}
            className="px-3.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <span className="material-symbols-rounded text-sm">save</span>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSaveAttempt('published')}
            disabled={savingProject}
            className="px-4 py-2 rounded bg-[#ff853a] hover:bg-[#ff721a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff853a]/20"
          >
            <span className="material-symbols-rounded text-sm">publish</span>
            <span>{savingProject ? 'Saving to Supabase…' : 'Publish project'}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={savingProject}
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
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
        {[
          { id: 'basic', label: 'Project details', icon: 'info', hint: 'Name, category, and publishing status' },
          { id: 'hero', label: 'Overview & links', icon: 'overview', hint: 'Introduction, role, and project links' },
          { id: 'theme', label: 'Theme & styling', icon: 'palette', hint: 'Colors, typography, card shapes, and background pattern' },
          { id: 'media', label: 'Images & video', icon: 'image', hint: 'Upload and choose project images and videos' },
          { id: 'caseStudy', label: 'Case study content', icon: 'view_quilt', hint: 'Build the sections shown on the project page' },
          { id: 'seo', label: 'Search appearance', icon: 'search', hint: 'Search title, description, and preview image' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const stepNumber = ['basic', 'hero', 'theme', 'media', 'caseStudy', 'seo'].indexOf(tab.id) + 1;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-t-[6px] text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-zinc-800 text-white border-t-2 border-[#ff853a]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <span className={`inline-flex items-center justify-center shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] rounded-full text-[10px] font-bold leading-none select-none text-center ${isActive ? 'bg-[#ff853a] text-white shadow-xs' : 'bg-white/10 text-zinc-300'}`}>{stepNumber}</span>
              <span>{tab.label}</span>
              {tab.id === 'caseStudy' && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#ff853a]/20 text-[#ff853a] text-[10px] font-medium leading-none">
                  {sections.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="-mt-4 flex items-center gap-2 text-xs text-zinc-400" aria-live="polite">
        <span className="font-semibold text-[#ff9a5b]">Step {['basic', 'hero', 'theme', 'media', 'caseStudy', 'seo'].indexOf(activeTab) + 1} of 6</span>
        <span aria-hidden="true">·</span>
        <span>{{ basic: 'Set the project name, category, and publishing status.', hero: 'Add the overview visitors read before opening the case study.', theme: 'Customize the colors, typography, and card aesthetic for this detail page.', media: 'Upload the project cover, hero, and related media.', caseStudy: 'Add and arrange the content blocks for the project detail page.', seo: 'Control how this project appears in search and social previews.' }[activeTab]}</span>
      </div>

      {/* TAB 1: BASIC INFO */}
      {activeTab === 'basic' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Project Title *
              </label>
              <BufferedTextInput
                type="text"
                value={title}
                onCommit={handleTitleChange}
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
                <BufferedTextInput
                  type="text"
                  value={slug}
                  onCommit={(value) => { setSlug(value); setSlugManuallyEdited(true); }}
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
              <BufferedTextInput
                type="text"
                value={categoryLabel}
                onCommit={setCategoryLabel}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                placeholder="e.g. Case Study"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Project Year
              </label>
              <BufferedTextInput
                type="text"
                value={year}
                onCommit={setYear}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                placeholder="2026"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Display Order
              </label>
              <BufferedTextInput
                type="number"
                value={String(order)}
                onCommit={(value) => setOrder(Number(value) || 1)}
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
            <BufferedTextarea
              rows={3}
              value={heroSubtitle}
              onCommit={setHeroSubtitle}
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
            <BufferedTextarea
              rows={3}
              value={introduction}
              onCommit={setIntroduction}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder="The School of Management at Tribhuvan University (SOMTU) is a Kathmandu-based management school. I designed its public website..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                My Role
              </label>
              <BufferedTextInput
                type="text"
                value={role}
                onCommit={setRole}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="e.g. UI/UX Design Intern or Lead Product Designer"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Duration
              </label>
              <BufferedTextInput
                type="text"
                value={duration}
                onCommit={setDuration}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="e.g. 1 Month or 6 Weeks"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400">Overview lists</label>
                <p className="mt-1 text-xs text-zinc-500">Add one or more lists and rename each heading, such as “Web Experience”.</p>
              </div>
              <button type="button" onClick={() => setDeliverableGroups((groups) => [...groups, { id: `overview-list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: 'New section', items: [] }])} className="rounded border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-[#ff853a] hover:text-[#ffb17d]">
                + Add overview list
              </button>
            </div>
            {deliverableGroups.map((group, index) => {
              const isGroupVisible = group.visible !== false;
              return (
                <section
                  key={group.id}
                  className={`rounded-lg border p-3 sm:p-4 space-y-3 transition-all ${
                    isGroupVisible
                      ? 'border-white/10 bg-zinc-950/70'
                      : 'border-dashed border-amber-500/30 bg-zinc-950/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <BufferedTextInput
                      aria-label={`Overview list ${index + 1} heading`}
                      type="text"
                      value={group.label}
                      onCommit={(value) =>
                        setDeliverableGroups((groups) =>
                          groups.map((item) => (item.id === group.id ? { ...item, label: value } : item))
                        )
                      }
                      className="min-w-0 flex-1 rounded border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
                      placeholder="e.g. Web Experience"
                    />

                    {/* Enable / Disable Toggle Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setDeliverableGroups((groups) =>
                          groups.map((item) =>
                            item.id === group.id ? { ...item, visible: !isGroupVisible } : item
                          )
                        )
                      }
                      title={isGroupVisible ? 'Disable list (hide from project overview without deleting)' : 'Enable list (show on project overview)'}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium cursor-pointer transition-colors border ${
                        isGroupVisible
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      }`}
                      aria-label={isGroupVisible ? `Disable ${group.label || 'list'}` : `Enable ${group.label || 'list'}`}
                    >
                      <span className="material-symbols-rounded text-sm">
                        {isGroupVisible ? 'visibility' : 'visibility_off'}
                      </span>
                      <span>{isGroupVisible ? 'Enabled' : 'Disabled'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={deliverableGroups.length <= 1}
                      onClick={() => setDeliverableGroups((groups) => groups.filter((item) => item.id !== group.id))}
                      className="rounded px-3 py-2 text-xs text-zinc-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40 cursor-pointer"
                      aria-label={`Remove ${group.label || `list ${index + 1}`}`}
                      title="Permanently remove list"
                    >
                      Remove
                    </button>
                  </div>
                  <BufferedTextarea
                    rows={Math.min(8, Math.max(3, group.items.length))}
                    value={group.items.join('\\n')}
                    onCommit={(value) =>
                      setDeliverableGroups((groups) =>
                        groups.map((item) => (item.id === group.id ? { ...item, items: value.split('\\n') } : item))
                      )
                    }
                    className="w-full rounded border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
                    placeholder="Add one line per item"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Each list is displayed in two columns on the project page.</span>
                    {!isGroupVisible && (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <span className="material-symbols-rounded text-xs">visibility_off</span>
                        Hidden on live project
                      </span>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Figma Prototype / File URL
              </label>
              <BufferedTextInput
                type="url"
                value={figmaUrl}
                onCommit={setFigmaUrl}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="https://www.figma.com/design/..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Figma Button Label
              </label>
              <BufferedTextInput
                type="text"
                value={figmaButtonText}
                onCommit={setFigmaButtonText}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="View Figma File"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                External Live Project URL (Optional)
              </label>
              <BufferedTextInput
                type="url"
                value={externalProjectUrl}
                onCommit={setExternalProjectUrl}
                className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
                placeholder="https://somtu.edu.np"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: THEME & STYLING */}
      {activeTab === 'theme' && (
        <ProjectThemeEditor
          theme={theme}
          onChange={setTheme}
          projectTitle={title || 'Untitled Project'}
          onOpenLivePreview={() => setShowPreviewModal(true)}
        />
      )}

      {/* TAB 3: CASE STUDY BUILDER */}
      {activeTab === 'caseStudy' && (
        <div className="flex flex-col gap-4">
          {/* Quick Case Study Template Presets */}
          <div className="p-4 rounded-[8px] bg-zinc-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-rounded text-[#ff853a] text-xl">auto_stories</span>
              <div>
                <span className="text-white text-xs font-semibold block">Case Study Template Presets</span>
                <span className="text-zinc-400 text-[11px]">
                  Apply all 12 standard chapters (Problem with image block, Key Decisions with constraint/what/why, Design System carousel, Two-column comparisons, Product showcase) to this project.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setSections(getFullCaseStudyTemplate(title || 'Project'))}
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 cursor-pointer transition-colors"
                title="Populate complete 12 standard chapters with all visual block options"
              >
                Reset to Full 12-Section Template
              </button>
              {existingProjects.some((p) => p.slug === 'somtu' || p.id === 'somtu') && (
                <button
                  type="button"
                  onClick={() => {
                    const somtu = existingProjects.find((p) => p.slug === 'somtu' || p.id === 'somtu');
                    if (somtu) setSections(normalizeProjectSections(somtu));
                  }}
                  className="px-3 py-1.5 rounded bg-[#ff853a]/15 hover:bg-[#ff853a]/25 text-[#ff853a] text-xs font-medium border border-[#ff853a]/30 cursor-pointer transition-colors"
                >
                  Copy All from SOMTU
                </button>
              )}
              {existingProjects.some((p) => p.slug === 'the-vedic-sewa' || p.id === 'the-vedic-sewa') && (
                <button
                  type="button"
                  onClick={() => {
                    const vedic = existingProjects.find((p) => p.slug === 'the-vedic-sewa' || p.id === 'the-vedic-sewa');
                    if (vedic) setSections(normalizeProjectSections(vedic));
                  }}
                  className="px-3 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium border border-emerald-500/30 cursor-pointer transition-colors"
                >
                  Copy All from The Vedic Sewa
                </button>
              )}
            </div>
          </div>

          <CaseStudyBuilder
            sections={sections}
            onChange={(newSections) => setSections(newSections)}
            mediaLibrary={projectMedia}
            onUploadMedia={uploadProjectMedia}
          />
        </div>
      )}

      {/* TAB 4: MEDIA ASSETS */}
      {activeTab === 'media' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <section className="rounded-xl border border-[#ff853a]/25 bg-[#ff853a]/[0.06] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white text-base font-semibold">Upload project media</h3>
                <p className="text-zinc-400 text-sm mt-1">Choose images or videos here. They upload to Supabase and become available throughout this project editor.</p>
                <p className="text-zinc-500 text-xs mt-2">JPG, PNG, WebP, GIF, AVIF, MP4, WebM · up to 50 MB each</p>
              </div>
              <input
                ref={projectMediaInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm"
                multiple
                className="hidden"
                onChange={(event) => void handleProjectMediaUpload(event.target.files)}
              />
              <button type="button" disabled={uploadingFiles} onClick={() => projectMediaInputRef.current?.click()} className="shrink-0 rounded-lg bg-[#ff853a] hover:bg-[#ff721a] disabled:opacity-60 px-4 py-2.5 text-sm font-semibold text-white">
                {uploadingFiles ? 'Uploading…' : 'Choose files'}
              </button>
            </div>
            {uploadMessage && <p role="status" className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200">{uploadMessage}</p>}
            {projectMedia.length > 0 && <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{projectMedia.slice(0, 10).map((asset) => <div key={asset.id} className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950"><div className="aspect-video"><MediaPreview src={asset.url} alt={asset.name} mimeType={asset.mimeType} className="h-full w-full object-cover" /></div><p className="truncate px-2.5 py-2 text-xs text-zinc-300">{asset.name}</p></div>)}</div>}
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PRIMARY HERO BANNER IMAGE */}
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-zinc-950/70 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#ff853a] font-semibold">
                    Primary Hero Banner Image
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Displayed prominently at the top of the case study in wide cinematic framing.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                  Case Study Top
                </span>
              </div>

              <MediaUploadField
                value={heroImageUrl}
                onChange={setHeroImageUrl}
                onUploadMedia={uploadProjectMedia}
                mediaLibrary={projectMedia}
                label="hero image"
                cropAspectRatio={previewHeroAspect}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-zinc-400 font-medium">Hero Image Alt Text</label>
                <BufferedTextInput
                  type="text"
                  value={heroImageAlt}
                  onCommit={setHeroImageAlt}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                  placeholder="Alt description for screen readers and accessibility..."
                />
              </div>

              {/* Framing, Pan/Zoom & Crop Cutoff Inspector */}
              {heroImageUrl && (
                <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sliders size={13} className="text-[#ff853a]" />
                      <span>Live Framing &amp; Cutoff Preview</span>
                    </span>

                    {/* Aspect Ratio Preview Selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 font-mono mr-1">RATIO:</span>
                      {(['21:9', '16:9', '16:10'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setPreviewHeroAspect(ratio)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                            previewHeroAspect === ratio
                              ? 'bg-[#ff853a] text-white font-bold'
                              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Framing Viewport with interactive launcher */}
                  <div
                    style={{ aspectRatio: previewHeroAspect.replace(':', '/') }}
                    className="w-full rounded-lg border border-white/20 overflow-hidden bg-black relative group flex items-center justify-center shadow-inner"
                  >
                    <MediaPreview
                      src={heroImageUrl}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Framing corner guides */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff853a] pointer-events-none" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff853a] pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff853a] pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff853a] pointer-events-none" />

                    {/* Live frame badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-zinc-300">
                      Hero Framing: {previewHeroAspect}
                    </div>

                    {/* Hover Pan & Zoom action */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={() => setAdjustingCropTarget('hero')}
                        className="px-3.5 py-2 rounded-lg bg-[#ff853a] hover:bg-[#ff721a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff853a]/30"
                      >
                        <Crop size={14} />
                        <span>Pan, Zoom &amp; Reframe</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-zinc-400">
                      Prevent parts from getting cut off by adjusting position and zoom.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAdjustingCropTarget('hero')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff853a]/40 bg-[#ff853a]/10 hover:bg-[#ff853a]/20 text-[#ffb17d] hover:text-white text-xs font-medium cursor-pointer transition-colors shrink-0"
                    >
                      <Move size={12} />
                      <ZoomIn size={12} />
                      <span>Adjust Size, Pan &amp; Zoom</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LISTING & CARD COVER IMAGE */}
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-zinc-950/70 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#ff853a] font-semibold">
                    Listing &amp; Card Cover Image
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Displayed on homepage Selected Work cards and archive directory.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                  Homepage Cards
                </span>
              </div>

              <MediaUploadField
                value={coverImage}
                onChange={setCoverImage}
                onUploadMedia={uploadProjectMedia}
                mediaLibrary={projectMedia}
                label="cover image"
                cropAspectRatio={previewCoverAspect}
              />

              {/* Fit Mode Selector (Cover vs Contain / No Crop) */}
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-900 border border-white/10">
                <label className="text-[11px] text-zinc-300 font-medium flex items-center justify-between">
                  <span>Card Display Mode (Prevent Cropping)</span>
                  <span className="text-[10px] font-mono text-zinc-500">HOMEPAGE GRID</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverClass('')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left border cursor-pointer transition-all flex flex-col gap-0.5 ${
                      !coverClass.includes('object-contain')
                        ? 'bg-[#ff853a]/15 border-[#ff853a]/60 text-white shadow-xs'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <Maximize2 size={12} className={!coverClass.includes('object-contain') ? 'text-[#ff853a]' : ''} />
                      <span>Fill Card (Cover)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      Fills entire card frame (edges cropped if aspect differs)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverClass('object-contain bg-zinc-950 p-2')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left border cursor-pointer transition-all flex flex-col gap-0.5 ${
                      coverClass.includes('object-contain')
                        ? 'bg-[#8be28b]/15 border-[#8be28b]/60 text-[#8be28b] shadow-xs'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <Minimize2 size={12} className={coverClass.includes('object-contain') ? 'text-[#8be28b]' : ''} />
                      <span>Fit Entire Image (No Crop)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      Never crops; preserves 100% of image with dark border
                    </span>
                  </button>
                </div>
              </div>

              {/* Framing, Pan/Zoom & Crop Cutoff Inspector */}
              {coverImage && (
                <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sliders size={13} className="text-[#ff853a]" />
                      <span>Card Framing Preview</span>
                    </span>

                    {/* Aspect Ratio Preview Selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 font-mono mr-1">CARD:</span>
                      {(['16:9', '4:3', '1:1'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setPreviewCoverAspect(ratio)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                            previewCoverAspect === ratio
                              ? 'bg-[#ff853a] text-white font-bold'
                              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Framing Viewport with interactive launcher */}
                  <div
                    style={{ aspectRatio: previewCoverAspect.replace(':', '/') }}
                    className="w-full rounded-lg border border-white/20 overflow-hidden bg-black relative group flex items-center justify-center shadow-inner"
                  >
                    <MediaPreview
                      src={coverImage}
                      alt="Cover preview"
                      className={`w-full h-full ${coverClass.includes('object-contain') ? 'object-contain bg-zinc-950 p-2' : 'object-cover'}`}
                    />

                    {/* Framing corner guides */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff853a] pointer-events-none" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff853a] pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff853a] pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff853a] pointer-events-none" />

                    {/* Live frame badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-zinc-300">
                      Card: {previewCoverAspect} · {coverClass.includes('object-contain') ? 'Fit Mode (No Crop)' : 'Cover Mode'}
                    </div>

                    {/* Hover Pan & Zoom action */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={() => setAdjustingCropTarget('cover')}
                        className="px-3.5 py-2 rounded-lg bg-[#ff853a] hover:bg-[#ff721a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff853a]/30"
                      >
                        <Crop size={14} />
                        <span>Pan, Zoom &amp; Reframe</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-zinc-400">
                      {coverClass.includes('object-contain')
                        ? 'Fit mode enabled: whole image is shown without cropping.'
                        : 'Cover mode enabled: use Pan & Zoom to align focal points.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAdjustingCropTarget('cover')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff853a]/40 bg-[#ff853a]/10 hover:bg-[#ff853a]/20 text-[#ffb17d] hover:text-white text-xs font-medium cursor-pointer transition-colors shrink-0"
                    >
                      <Move size={12} />
                      <ZoomIn size={12} />
                      <span>Adjust Size, Pan &amp; Zoom</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Pan, Zoom & Crop Cutoff Modal */}
          <ImageCropPanZoomModal
            isOpen={adjustingCropTarget !== null}
            onClose={() => setAdjustingCropTarget(null)}
            imageUrl={adjustingCropTarget === 'hero' ? heroImageUrl : coverImage}
            imageTitle={
              adjustingCropTarget === 'hero'
                ? 'Adjust Hero Banner Framing (Pan, Zoom & Size)'
                : 'Adjust Listing Cover Framing (Pan, Zoom & Size)'
            }
            defaultAspectRatio={adjustingCropTarget === 'hero' ? previewHeroAspect : previewCoverAspect}
            onApplyCrop={async (dataUrl, blob) => {
              const target = adjustingCropTarget;
              const fileName = `${target || 'asset'}-${Date.now()}.png`;
              const file = new File([blob], fileName, { type: 'image/png' });
              try {
                const asset = await uploadProjectMedia(file);
                if (target === 'hero') {
                  setHeroImageUrl(asset.url);
                } else {
                  setCoverImage(asset.url);
                }
              } catch {
                if (target === 'hero') {
                  setHeroImageUrl(dataUrl);
                } else {
                  setCoverImage(dataUrl);
                }
              }
              setAdjustingCropTarget(null);
            }}
          />

        </div>
      )}

      {/* TAB 5: SEO */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-[8px] bg-zinc-900/60 border border-white/10 flex flex-col gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Custom Page SEO Title
            </label>
            <BufferedTextInput
              type="text"
              value={seoTitle}
              onCommit={setSeoTitle}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder={`${title || 'Project'} — Yogendra Chaudhary Portfolio`}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Meta Description
            </label>
            <BufferedTextarea
              rows={3}
              value={seoDescription}
              onCommit={setSeoDescription}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-sm"
              placeholder="Concise overview for search engine result snippets and social shares..."
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Social share image
            </label>
            <MediaUploadField value={seoImage} onChange={setSeoImage} onUploadMedia={uploadProjectMedia} mediaLibrary={projectMedia} label="social preview image" />
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          {/* Preview Modal Header */}
          <div className="px-4 sm:px-6 py-3 bg-zinc-900 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff853a] animate-pulse shrink-0"></span>
              <span className="text-white text-xs sm:text-sm font-semibold font-mono truncate">
                Preview: {previewProject.title}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleSaveAttempt('published')}
                className="px-3.5 sm:px-4 py-1.5 rounded bg-[#ff853a] text-white text-xs font-semibold hover:bg-[#ff721a] cursor-pointer"
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
