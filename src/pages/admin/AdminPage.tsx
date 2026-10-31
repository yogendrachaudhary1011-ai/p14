import React, { useRef, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project, ExperienceItem, EducationItem, AboutCertificate } from '../../types';
import { initialSiteSettings } from '../../data/initialData';
import { ProjectEditor } from '../../components/admin/ProjectEditor';
import { SiteCopyEditor } from '../../components/admin/SiteCopyEditor';
import { MediaUploadField } from '../../components/admin/MediaUploadField';
import { MediaPreview } from '../../components/MediaPreview';
import { SUPABASE_SQL_SCHEMA } from '../../supabase';
import { uploadMediaToSupabase } from '../../utils/supabaseService';
import { inferMediaMimeType } from '../../utils/media';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  Command,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Plus,
  RefreshCw,
  Upload,
  Video,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import './admin.css';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

interface SectionOrderEditorProps<T extends string> {
  title: string;
  order: T[];
  labels: Record<T, string>;
  onChange: (order: T[]) => void;
}

const SectionOrderEditor = <T extends string>({ title, order, labels, onChange }: SectionOrderEditorProps<T>) => (
  <div className="space-y-2">
    <h5 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title} · use arrows to reorder</h5>
    <ol className="space-y-2">
      {order.map((section, index) => (
        <li key={section} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-xs font-semibold text-zinc-300">{index + 1}</span>
          <span className="flex-1 text-sm text-zinc-200">{labels[section]}</span>
          <button type="button" disabled={index === 0} aria-label={`Move ${labels[section]} up`} onClick={() => {
            const next = [...order];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            onChange(next);
          }} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">↑</button>
          <button type="button" disabled={index === order.length - 1} aria-label={`Move ${labels[section]} down`} onClick={() => {
            const next = [...order];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            onChange(next);
          }} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">↓</button>
        </li>
      ))}
    </ol>
  </div>
);

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
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
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'settings' | 'experience' | 'education' | 'media' | 'seo'
  >('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Confirmation dialog modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Project list search & filter state
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<'all' | 'product' | 'archive'>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Project edit state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Experience edit state
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [isCreatingExp, setIsCreatingExp] = useState(false);
  const [expFormData, setExpFormData] = useState<Partial<ExperienceItem>>({
    role: '',
    company: '',
    dates: '',
    duration: '',
    current: false,
    headline: '',
    description: '',
    tags: [],
    order: experience.length + 1,
    visible: true
  });
  const [expTagsInput, setExpTagsInput] = useState('');

  // Education edit state
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [isCreatingEdu, setIsCreatingEdu] = useState(false);
  const [eduFormData, setEduFormData] = useState<Partial<EducationItem>>({
    title: '',
    institution: '',
    location: '',
    dates: '',
    status: 'Graduated',
    description: '',
    tags: [],
    order: education.length + 1,
    visible: true
  });
  const [eduTagsInput, setEduTagsInput] = useState('');

  // Admin password management state
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Media upload state
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAboutVideo, setUploadingAboutVideo] = useState(false);
  const aboutVideoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCertificatesFor, setUploadingCertificatesFor] = useState<string | null>(null);

  // Notification message
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Supabase connection state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.key || '');
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const getCertificatesForExperience = (item: ExperienceItem) =>
    item.certificates ?? (item.id === (experience.find((entry) => entry.visible) ?? experience[0])?.id ? settings.certificates ?? [] : []);

  const saveExperienceCertificates = (itemId: string, certificates: AboutCertificate[]) => {
    const legacyCertificates = settings.certificates ?? [];
    const legacyOwner = experience.find((entry) => entry.visible) ?? experience[0];
    if (legacyCertificates.length && legacyOwner) {
      if (legacyOwner.id !== itemId) {
        updateExperience(legacyOwner.id, { certificates: legacyOwner.certificates ?? legacyCertificates });
      }
      updateSettings({ certificates: undefined });
    }
    updateExperience(itemId, { certificates });
  };

  const cloudStatusLabel = cloudSaveStatus === 'saving'
    ? 'Saving to Supabase…'
    : cloudSaveStatus === 'error'
      ? 'Cloud save failed'
      : cloudSaveStatus === 'saved'
        ? 'Saved to Supabase'
        : isSupabaseConnected
          ? (isAdmin ? 'Supabase connected' : 'Supabase read-only')
          : 'Local persistence active';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Enter your Supabase Auth email and password.');
      return;
    }
    const success = await login(username, password);
    if (success) {
      setLoginError('');
      showNotice('Welcome back to Portfolio Studio!');
    } else {
      setLoginError('Sign-in failed. Check your Supabase Auth email and password.');
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      projectSearchQuery === '' ||
      p.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(projectSearchQuery.toLowerCase()));

    const matchesCategory = projectCategoryFilter === 'all' || p.category === projectCategoryFilter;
    const matchesStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter media
  const filteredMedia = media.filter((m) => {
    if (!mediaSearchQuery) return true;
    return (
      m.name.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(mediaSearchQuery.toLowerCase())
    );
  });

  // ==========================================
  // LOGIN VIEW (IF NOT AUTHENTICATED)
  // ==========================================
  if (!isAdmin) {
    return (
      <div id="loginView">
        {/* Left Side: Editorial Studio Art Panel */}
        <div className="admin-login-art" aria-hidden="true">
          <div className="admin-orbit" />
          <div className="admin-orbit-two" />
          <div className="admin-login-note">
            <span className="admin-note-dot" />
            <span>PORTFOLIO STUDIO CMS</span>
            <span style={{ marginLeft: 'auto', color: '#64748b' }}>v2.4</span>
          </div>

          <div className="admin-art-copy">
            <span>DESIGNER WORKSPACE</span>
            <strong>
              Curate, edit &amp;
              <br />
              publish your craft.
            </strong>
            <p>
              An intentional workspace built for managing case studies, career timelines, and design deliverables with
              live cloud database synchronization.
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="admin-login-panel">
          <div className="admin-login-brand">
            <span className="admin-brand-mark">yc.</span>
            <div>
              <span className="font-bold tracking-wider text-white">YOGENDRA CHAUDHARY</span>
              <small className="block text-[10px] text-zinc-500 font-mono tracking-widest mt-0.5">CONTENT STUDIO</small>
            </div>
          </div>

          <div className="admin-login-card">
            <div className="admin-eyebrow mb-2">
              <LockKeyhole size={14} /> PRIVATE WORKSPACE
            </div>
            <h1>
              Welcome back<span>.</span>
            </h1>
            <p className="admin-login-intro">Sign in with the administrator account created in Supabase Auth.</p>

            {loginError && <div className="admin-login-error">{loginError}</div>}

            <form onSubmit={handleLoginSubmit} className="admin-login-form">
              <div>
                <label>Email address</label>
                <input
                  className="admin-login-input"
                  type="email"
                  value={username}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <div className="relative">
                  <input
                    className="admin-login-input pr-10"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-login-submit">
                <span>Enter Workspace</span>
                <ArrowUpRight size={17} />
              </button>
            </form>

            <div className="admin-login-footer">
              <button onClick={() => onNavigate('/')} className="admin-back-link">
                <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> Back to live portfolio
              </button>
            </div>
          </div>

          <div className="admin-login-bottom">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>End-to-end encrypted session &amp; local data persistence</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // NAVIGATION TABS SPECIFICATION
  // ==========================================
  const navTabs = [
    { id: 'overview', label: 'Overview', detail: 'Portfolio dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', detail: 'Case studies & stories', icon: FolderKanban },
    { id: 'settings', label: 'Profile & Site', detail: 'Bio, contact & credentials', icon: Settings2 },
    { id: 'experience', label: 'Experience', detail: 'Work history & positions', icon: BriefcaseBusiness },
    { id: 'education', label: 'Education', detail: 'Degrees & qualifications', icon: GraduationCap },
    { id: 'media', label: 'Media Library', detail: 'Assets, mockups & CDN', icon: ImageIcon },
    { id: 'seo', label: 'SEO & Metadata', detail: 'Search cards & social', icon: FileText }
  ];

  return (
    <div id="adminApp">
      {/* MOBILE TOP BAR (visible on screens < lg) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#12131a]/95 backdrop-blur-md border-b border-white/10 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="admin-brand-mark" style={{ width: 32, height: 32, fontSize: 14 }}>
              yc.
            </span>
            <span className="font-bold text-sm tracking-wider text-white">STUDIO</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpRight size={14} /> Site
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 cursor-pointer"
          >
            Exit
          </button>
        </div>
      </header>

      {/* BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-45 transition-opacity"
        />
      )}

      {/* SIDEBAR NAVIGATION (Fixed 260px desktop column, off-canvas drawer on mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#12131a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
          <div className="admin-wordmark">
            <span className="admin-brand-mark">yc.</span>
            <div>
              <span>YOGENDRA STUDIO</span>
              <small>PORTFOLIO CMS</small>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-sidebar-caption">STUDIO WORKSPACE</div>
        <nav className="admin-nav flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                {tab.id === 'projects' && <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Portfolio content</div>}
                {tab.id === 'settings' && <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Site settings</div>}
                <button
                  onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsCreatingProject(false);
                  setEditingProject(null);
                  setIsCreatingExp(false);
                  setEditingExp(null);
                  setIsCreatingEdu(false);
                  setEditingEdu(null);
                  setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-left w-full cursor-pointer ${
                  isActive
                    ? 'text-white bg-[#f37021]/15 border border-[#f37021]/30 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.icon size={18} strokeWidth={1.8} className={isActive ? 'text-[#f37021]' : 'text-zinc-400'} />
                  <span className="admin-nav-copy">
                    <span className={isActive ? 'text-white' : 'text-zinc-300'}>{tab.label}</span>
                    <small className="text-zinc-500">{tab.detail}</small>
                  </span>
                  {isActive && <ChevronRight className="admin-nav-chevron text-[#f37021]" size={15} />}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom p-4 border-t border-white/10 flex flex-col gap-2.5 bg-[#12131a]">
          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              onNavigate('/');
            }}
            className="w-full py-2 px-3 bg-[#181923] border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight size={14} className="text-[#f37021]" />
            <span>View live portfolio</span>
          </button>
          <div className="admin-account-row flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="admin-account-avatar">
                {(adminUser || 'Y').slice(0, 1).toUpperCase()}
              </span>
              <div className="admin-account-copy truncate">
                <small className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">ADMINISTRATOR</small>
                <span className="text-xs font-semibold text-white truncate block">{adminUser || 'Yogendra'}</span>
              </div>
            </div>
            <button
              className="admin-signout hover:bg-red-500/20 hover:text-red-400 p-1.5 rounded text-zinc-400"
              onClick={logout}
              title="Sign out of Admin CMS"
              aria-label="Log out"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT AREA (WITH DESKTOP MARGIN OFFSET)
      ========================================== */}
      <main className="flex-1 w-full min-w-0 transition-all">
        {/* Topbar breadcrumb and status banner */}
        <div className="admin-topbar">
          <div className="admin-breadcrumb">
            <span className="text-zinc-500">Studio</span>
            <ChevronRight size={14} className="text-zinc-600" />
            <strong className="text-white">{navTabs.find((tab) => tab.id === activeTab)?.label}</strong>
          </div>
          <div className="admin-topbar-actions">
            <span
              className={`admin-live-status admin-live-status--${cloudSaveStatus}`}
              title={cloudSaveError || undefined}
              role="status"
              aria-live="polite"
            >
              <i /> {cloudStatusLabel}
            </span>
            <button onClick={() => onNavigate('/')}>
              <ArrowUpRight size={14} className="text-[#f37021]" /> View public site
            </button>
          </div>
        </div>

        {/* Page Intro Title */}
        <div className="admin-page-intro">
          <div>
            <div className="admin-eyebrow">
              <Sparkles size={14} /> PORTFOLIO STUDIO
            </div>
            <h1>
              {activeTab === 'overview'
                ? `Good to see you${adminUser ? `, ${adminUser.split(' ')[0]}` : ''}.`
                : navTabs.find((tab) => tab.id === activeTab)?.label}
            </h1>
            <p>
              {navTabs.find((tab) => tab.id === activeTab)?.detail} <span>·</span> Shape your portfolio, one detail at a
              time.
            </p>
          </div>
          <div className="admin-date-chip hidden md:flex items-center gap-1.5">
            <Command size={14} className="text-[#f37021]" />
            <span>PERSONAL WORKSPACE</span>
          </div>
        </div>

        {/* FLOATING SUCCESS NOTIFICATION */}
        {notice && (
          <div className="admin-toast">
            <CheckCircle2 size={17} className="text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* ==========================================
            TAB 1: OVERVIEW DASHBOARD
        ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Your portfolio at a glance</h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Manage live portfolio content, case studies, experience, and assets.
              </p>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('projects')}
                className="p-5 bg-[#12131a] border border-white/10 hover:border-[#f37021]/50 rounded-xl cursor-pointer transition-all hover:bg-[#181923] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Total Projects
                  </span>
                  <FolderKanban size={18} className="text-[#f37021]" />
                </div>
                <div className="text-3xl font-bold text-[#f37021] mt-2 group-hover:scale-105 transition-transform origin-left">
                  {projects.length}
                </div>
                <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                  <span>{projects.filter((p) => p.status === 'published').length} published</span>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">Manage →</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('experience')}
                className="p-5 bg-[#12131a] border border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all hover:bg-[#181923] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Experience
                  </span>
                  <BriefcaseBusiness size={18} className="text-zinc-400" />
                </div>
                <div className="text-3xl font-bold text-white mt-2 group-hover:scale-105 transition-transform origin-left">
                  {experience.length}
                </div>
                <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                  <span>Active career positions</span>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">Manage →</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('media')}
                className="p-5 bg-[#12131a] border border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all hover:bg-[#181923] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Media Assets
                  </span>
                  <ImageIcon size={18} className="text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400 mt-2 group-hover:scale-105 transition-transform origin-left">
                  {media.length}
                </div>
                <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                  <span>Local &amp; CDN images</span>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">View →</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('settings')}
                className="p-5 bg-[#12131a] border border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all hover:bg-[#181923] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Database
                  </span>
                  <RefreshCw
                    size={16}
                    className={isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}
                  />
                </div>
                <div className="text-sm font-bold text-white mt-3 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="truncate">{isSupabaseConnected ? 'Supabase Connected' : 'Local Storage Mode'}</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                  <span>{isSupabaseConnected ? 'PostgreSQL live sync' : 'Connect cloud DB'}</span>
                  <span className="text-zinc-500 group-hover:text-white transition-colors">Settings →</span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setIsCreatingProject(true);
                  }}
                  className="px-4 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Plus size={16} />
                  <span>Add New Case Study</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2.5 bg-[#181923] hover:bg-[#202230] border border-white/10 text-white rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Settings2 size={16} className="text-zinc-400" />
                  <span>Edit Site Profile &amp; Bio</span>
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className="px-4 py-2.5 bg-[#181923] hover:bg-[#202230] border border-white/10 text-white rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <ImageIcon size={16} className="text-zinc-400" />
                  <span>Manage Media Library</span>
                </button>
                <button
                  onClick={() => {
                    setConfirmDialog({
                      title: 'Reset Portfolio Defaults',
                      message:
                        'Are you sure you want to restore all portfolio content, case studies, and settings to original defaults?',
                      confirmLabel: 'Reset Everything',
                      onConfirm: () => {
                        resetToDefaults();
                        showNotice('Portfolio restored to initial defaults.');
                        setConfirmDialog(null);
                      }
                    });
                  }}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs sm:text-sm cursor-pointer transition-all ml-auto"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* RECENT PROJECTS PREVIEW TABLE */}
            <div className="bg-[#12131a] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white text-sm">Published Case Studies</h3>
                  <p className="text-zinc-400 text-xs">Recently active projects displayed on the portfolio.</p>
                </div>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs text-[#f37021] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View All ({projects.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {projects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        alt={proj.title}
                        src={proj.heroImage?.url || proj.coverImage || '/assets/media/home-media-04-f775f2921176.webp'}
                        className="w-12 h-9 object-cover rounded bg-black border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          <span className="truncate">{proj.title}</span>
                          {proj.featured && (
                            <span className="text-[10px] bg-[#f37021]/15 text-[#f37021] px-1.5 py-0.2 rounded font-mono">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
                          {proj.categoryLabel || proj.category} · {proj.route}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigate(proj.route)}
                        className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1 cursor-pointer"
                        title="Preview live page"
                      >
                        <ExternalLink size={12} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setIsCreatingProject(false);
                          setActiveTab('projects');
                        }}
                        className="px-3 py-1 text-xs rounded bg-[#f37021]/15 text-[#f37021] hover:bg-[#f37021]/25 border border-[#f37021]/30 font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: PROJECTS & CASE STUDIES
        ========================================== */}
        {activeTab === 'projects' && (
          <div>
            {isCreatingProject || editingProject ? (
              <ProjectEditor
                initialProject={editingProject}
                existingProjects={projects}
                mediaLibrary={media}
                onUploadMedia={async (file) => {
                  if (!isAdmin) throw new Error('Sign in to Supabase Auth before uploading project media.');
                  const result = await uploadMediaToSupabase(file);
                  if (!result.url) throw new Error(result.error || 'Upload failed.');
                  const asset = addMedia(file.name.replace(/\.[^.]+$/, ''), result.url, file.type || inferMediaMimeType(file.name), file.size);
                  return asset;
                }}
                onSave={(data) => {
                  if (editingProject) {
                    updateProject(editingProject.id, data);
                    showNotice(`Updated case study "${data.title || editingProject.title}"`);
                  } else {
                    addProject(data as any);
                    showNotice(`Created new case study "${data.title}"`);
                  }
                  setIsCreatingProject(false);
                  setEditingProject(null);
                }}
                onCancel={() => {
                  setIsCreatingProject(false);
                  setEditingProject(null);
                }}
              />
            ) : (
              <div className="space-y-5">
                {/* Header with Title and Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Projects &amp; Case Studies</h2>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Build, reorder, publish, and customize case studies with the interactive visual block builder.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingProject(true);
                      setEditingProject(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md transition-all"
                  >
                    <Plus size={16} />
                    <span>Add New Case Study</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-3.5 bg-[#12131a] border border-white/10 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      placeholder="Search case studies by title, slug, or label..."
                      className="w-full pl-9 pr-4 py-2 bg-[#0d0e14] border border-white/10 rounded-lg text-white text-xs sm:text-sm outline-none focus:border-[#f37021]"
                    />
                    {projectSearchQuery && (
                      <button
                        onClick={() => setProjectSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-[#0d0e14] px-2.5 py-1 rounded-lg border border-white/10 text-xs">
                      <Filter size={13} className="text-zinc-500" />
                      <select
                        value={projectCategoryFilter}
                        onChange={(e) => setProjectCategoryFilter(e.target.value as any)}
                        className="bg-transparent text-zinc-300 border-none outline-none cursor-pointer py-1"
                      >
                        <option value="all">All Categories</option>
                        <option value="product">Product</option>
                        <option value="archive">Archive</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#0d0e14] px-2.5 py-1 rounded-lg border border-white/10 text-xs">
                      <select
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value as any)}
                        className="bg-transparent text-zinc-300 border-none outline-none cursor-pointer py-1"
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Projects Table with Responsive Horizontal Scroll Container */}
                <div className="w-full overflow-hidden border border-white/10 rounded-xl bg-[#12131a] shadow-lg">
                  <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center text-xs">
                    <span className="font-mono text-zinc-400">
                      CASE STUDIES ({filteredProjects.length} OF {projects.length})
                    </span>
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          title: 'Delete All Case Studies',
                          message:
                            'Permanently remove all project case studies? This action cannot be undone.',
                          confirmLabel: 'Delete All Projects',
                          onConfirm: () => {
                            deleteAllProjects();
                            showNotice('All projects removed.');
                            setConfirmDialog(null);
                          }
                        });
                      }}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs cursor-pointer transition-colors"
                    >
                      Delete All Projects
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#171822] text-zinc-400">
                          <th className="py-3 px-4 w-14 font-mono">Order</th>
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 font-mono">Route</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredProjects.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-zinc-500">
                              <FolderKanban size={32} className="mx-auto mb-2 text-zinc-600" />
                              <p className="font-medium">No case studies found matching your criteria.</p>
                              <button
                                onClick={() => {
                                  setProjectSearchQuery('');
                                  setProjectCategoryFilter('all');
                                  setProjectStatusFilter('all');
                                }}
                                className="mt-2 text-xs text-[#f37021] hover:underline cursor-pointer"
                              >
                                Clear filters
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredProjects.map((proj, pIdx) => (
                            <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs text-zinc-500 w-4">{pIdx + 1}</span>
                                  <div className="flex flex-col">
                                    <button
                                      onClick={() => {
                                        if (pIdx === 0) return;
                                        const ids = projects.map((p) => p.id);
                                        const temp = ids[pIdx];
                                        ids[pIdx] = ids[pIdx - 1];
                                        ids[pIdx - 1] = temp;
                                        reorderProjects(ids);
                                      }}
                                      disabled={pIdx === 0}
                                      className={`text-[10px] leading-tight ${
                                        pIdx === 0 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white cursor-pointer'
                                      }`}
                                      title="Move up"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (pIdx === projects.length - 1) return;
                                        const ids = projects.map((p) => p.id);
                                        const temp = ids[pIdx];
                                        ids[pIdx] = ids[pIdx + 1];
                                        ids[pIdx + 1] = temp;
                                        reorderProjects(ids);
                                      }}
                                      disabled={pIdx === projects.length - 1}
                                      className={`text-[10px] leading-tight ${
                                        pIdx === projects.length - 1
                                          ? 'text-zinc-700'
                                          : 'text-zinc-400 hover:text-white cursor-pointer'
                                      }`}
                                      title="Move down"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    alt={proj.title}
                                    src={
                                      proj.heroImage?.url ||
                                      proj.coverImage ||
                                      '/assets/media/home-media-04-f775f2921176.webp'
                                    }
                                    className="w-12 h-9 object-cover rounded bg-black border border-white/10 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        '/assets/media/home-media-04-f775f2921176.webp';
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                                      <span>{proj.title}</span>
                                      {proj.featured && (
                                        <span className="text-[#f37021] text-xs" title="Featured on home">
                                          ★
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500">
                                      {proj.year || '2026'} · {proj.sections?.length || 0} chapters
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 border border-white/10 text-zinc-300">
                                  {proj.categoryLabel || proj.category}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                                <div className="flex items-center gap-1">
                                  <span>{proj.route}</span>
                                  <button
                                    onClick={() => handleCopy(proj.route, `route-${proj.id}`)}
                                    className="text-zinc-500 hover:text-white p-0.5"
                                    title="Copy route path"
                                  >
                                    {copiedId === `route-${proj.id}` ? (
                                      <Check size={12} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => {
                                    toggleProjectStatus(proj.id);
                                    showNotice(
                                      `"${proj.title}" is now ${
                                        proj.status === 'published' ? 'Draft' : 'Published'
                                      }`
                                    );
                                  }}
                                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase cursor-pointer transition-colors ${
                                    proj.status === 'published'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {proj.status}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => onNavigate(proj.route)}
                                    className="p-1.5 rounded bg-[#181923] hover:bg-[#202230] border border-white/10 text-zinc-300 hover:text-white cursor-pointer"
                                    title="Preview live case study"
                                  >
                                    <ExternalLink size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const dup = duplicateProject(proj.id);
                                      if (dup) {
                                        showNotice(`Duplicated as "${dup.title}"`);
                                      }
                                    }}
                                    className="p-1.5 rounded bg-[#181923] hover:bg-[#202230] border border-white/10 text-zinc-300 hover:text-white cursor-pointer"
                                    title="Duplicate case study"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingProject(proj);
                                      setIsCreatingProject(false);
                                    }}
                                    className="px-2.5 py-1 rounded bg-[#f37021]/15 hover:bg-[#f37021]/25 border border-[#f37021]/30 text-[#f37021] text-xs font-semibold cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmDialog({
                                        title: `Delete ${proj.title}`,
                                        message: `Are you sure you want to delete case study "${proj.title}"?`,
                                        confirmLabel: 'Delete Case Study',
                                        onConfirm: () => {
                                          deleteProject(proj.id);
                                          showNotice(`Deleted "${proj.title}"`);
                                          setConfirmDialog(null);
                                        }
                                      });
                                    }}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                                    title="Delete case study"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: SITE & PROFILE SETTINGS
        ========================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Site &amp; Profile Settings</h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Update designer branding, contact information, credentials, and Supabase database connection.
              </p>
            </div>

            {/* DESIGNER BRANDING & BIO CARD */}
            <div className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">Designer Identity</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Primary name, title, and public presence.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Brand / Full Name</label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={(e) => updateSettings({ brandName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Designer Role / Title</label>
                  <input
                    type="text"
                    value={settings.brandRole}
                    onChange={(e) => updateSettings({ brandRole: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Location / Base</label>
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => updateSettings({ location: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Availability Status</label>
                  <input
                    type="text"
                    value={settings.availabilityText}
                    onChange={(e) => updateSettings({ availabilityText: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <label className="block text-xs uppercase text-zinc-400 mb-2 font-semibold">Floating ID Card Portrait</label>
                <MediaUploadField
                  value={settings.profileImage || initialSiteSettings.profileImage || ''}
                  onChange={(profileImage) => updateSettings({ profileImage })}
                  mediaLibrary={media}
                  label="ID card portrait"
                  onUploadMedia={async (file) => {
                    if (!isAdmin) throw new Error('Sign in to Supabase Auth before uploading media.');
                    const result = await uploadMediaToSupabase(file);
                    if (!result.url) throw new Error(result.error || 'Image upload failed.');
                    return addMedia(file.name.replace(/\.[^.]+$/, '') || file.name, result.url, file.type, file.size);
                  }}
                />
              </div>

              <div className="border-t border-white/10 pt-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-zinc-400">About section video</label>
                <p className="mb-3 text-xs text-zinc-500">Upload an MP4 or WebM. It replaces the video shown on both the landing page and About page, and saves to Supabase automatically.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="w-full max-w-sm overflow-hidden rounded-lg border border-white/10 bg-black">
                    <video
                      key={settings.aboutVideo || '/assets/media/about-profile-video.mp4'}
                      src={settings.aboutVideo || '/assets/media/about-profile-video.mp4'}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-video w-full object-cover"
                      aria-label="Current About section video"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <input
                      ref={aboutVideoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,.mp4,.webm"
                      className="hidden"
                      onChange={async (event) => {
                        const input = event.currentTarget;
                        const file = input.files?.[0];
                        if (!file) return;
                        if (!isAdmin) {
                          showNotice('Sign in to Supabase Auth before uploading media.');
                          input.value = '';
                          return;
                        }
                        setUploadingAboutVideo(true);
                        try {
                          const result = await uploadMediaToSupabase(file);
                          if (!result.url) throw new Error(result.error || 'Video upload failed.');
                          addMedia(file.name.replace(/\.[^.]+$/, '') || file.name, result.url, file.type, file.size);
                          updateSettings({ aboutVideo: result.url });
                          showNotice('About video uploaded. Saving the new video to Supabase…');
                        } catch (error) {
                          showNotice(error instanceof Error ? error.message : 'Video upload failed.');
                        } finally {
                          setUploadingAboutVideo(false);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingAboutVideo || !isAdmin}
                      onClick={() => aboutVideoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#ff853a]/35 bg-[#ff853a]/10 px-3 py-2.5 text-xs font-semibold text-[#ffb17d] hover:bg-[#ff853a]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingAboutVideo ? <Upload size={14} className="animate-pulse" /> : <Video size={14} />}
                      {uploadingAboutVideo ? 'Uploading video…' : 'Replace About video'}
                    </button>
                    {settings.aboutVideo && (
                      <button
                        type="button"
                        disabled={!isAdmin || uploadingAboutVideo}
                        onClick={() => {
                          updateSettings({ aboutVideo: '' });
                          showNotice('Restored the default About video. Saving to Supabase…');
                        }}
                        className="rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        Restore default video
                      </button>
                    )}
                    {!isAdmin && <p className="text-[11px] text-amber-300">Sign in to upload or change the video.</p>}
                  </div>
                </div>
              </div>

              <details className="border-t border-white/10 pt-5 group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2 text-sm font-semibold text-white hover:text-[#ff9a5b]">
                  <span>About page text <small className="ml-2 font-normal text-zinc-500">Shared by the home page and About page</small></span>
                  <ChevronRight size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
                </summary>
                <div className="pt-4 space-y-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">About Introduction</label>
                  <textarea
                    rows={3}
                    value={settings.aboutIntro ?? initialSiteSettings.aboutIntro}
                    placeholder="Describe your design approach and the work you do."
                    onChange={(e) => updateSettings({ aboutIntro: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021] resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">About Details</label>
                  <textarea
                    rows={3}
                    value={settings.aboutDetails ?? initialSiteSettings.aboutDetails}
                    placeholder="Describe your focus, specialties, and the products you work on."
                    onChange={(e) => updateSettings({ aboutDetails: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021] resize-y"
                  />
                </div>
                </div>
              </details>

              <details className="border-t border-white/10 pt-5 group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2 text-sm font-semibold text-white hover:text-[#ff9a5b]">
                  <span>Page sections &amp; order <small className="ml-2 font-normal text-zinc-500">Show, hide, and arrange page sections</small></span>
                  <ChevronRight size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
                </summary>
                <div className="pt-4 space-y-4">
                <div>
                  <p className="text-zinc-400 text-xs mt-1">Choose which sections appear, then use the arrows to set their order.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(['hero', 'work', 'about', 'connect'] as const).map((section) => (
                    <label key={section} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-xs text-zinc-200 capitalize">
                      <input
                        type="checkbox"
                        checked={(settings.homeSections ?? initialSiteSettings.homeSections)[section]}
                        onChange={(event) => updateSettings({ homeSections: { ...(settings.homeSections ?? initialSiteSettings.homeSections), [section]: event.target.checked } })}
                        className="accent-[#f37021]"
                      />
                      {section === 'connect' ? 'Contact section' : `${section} section`}
                    </label>
                  ))}
                </div>
                <SectionOrderEditor
                  title="Landing page order"
                  order={settings.homeSectionOrder || initialSiteSettings.homeSectionOrder}
                  labels={{ hero: 'Hero', work: 'Selected work', about: 'About', connect: 'Contact' }}
                  onChange={(homeSectionOrder) => updateSettings({ homeSectionOrder })}
                />
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">About page sections</h5>
                  <div className="flex flex-wrap gap-3">
                    {(['profile', 'experience', 'education'] as const).map((section) => (
                      <label key={`about-${section}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-xs text-zinc-200 capitalize">
                        <input
                          type="checkbox"
                          checked={(settings.aboutSections ?? initialSiteSettings.aboutSections)[section]}
                          onChange={(event) => updateSettings({ aboutSections: { ...(settings.aboutSections ?? initialSiteSettings.aboutSections), [section]: event.target.checked } })}
                          className="accent-[#f37021]"
                        />
                        {section}
                      </label>
                    ))}
                  </div>
                  <SectionOrderEditor
                    title="About page order"
                    order={settings.aboutSectionOrder || initialSiteSettings.aboutSectionOrder}
                    labels={{ profile: 'Profile', experience: 'Experience', education: 'Education' }}
                    onChange={(aboutSectionOrder) => updateSettings({ aboutSectionOrder })}
                  />
                </div>
                </div>
              </details>

              <details open className="border-t border-white/10 pt-5 group">
                <summary className="mb-4 flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2 text-sm font-semibold text-white hover:text-[#ff9a5b]">
                  <span>Website text &amp; labels <small className="ml-2 font-normal text-zinc-500">Headings, button text, chips, and descriptions</small></span>
                  <ChevronRight size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
                </summary>
                <SiteCopyEditor
                  defaults={initialSiteSettings.siteCopy || {}}
                  values={settings.siteCopy}
                  onChange={(key, value) => updateSettings({ siteCopy: { ...(settings.siteCopy || initialSiteSettings.siteCopy), [key]: value } })}
                />
              </details>
            </div>

            {/* CONTACT & SOCIAL CARD */}
            <details className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span><strong className="text-base text-white">Contact &amp; social links</strong><small className="mt-1 block text-xs text-zinc-400">Email, resume, and public profiles</small></span>
                <ChevronRight size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
              </summary>
              <div className="pt-5 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-zinc-400">Resume / CV</label>
                  <input
                    ref={resumeFileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={async (event) => {
                      const input = event.currentTarget;
                      const file = input.files?.[0];
                      if (!file) return;
                      if (!isAdmin) {
                        showNotice('Sign in to Supabase Auth before uploading your resume.');
                        input.value = '';
                        return;
                      }
                      setUploadingResume(true);
                      try {
                        const result = await uploadMediaToSupabase(file);
                        if (!result.url) throw new Error(result.error || 'Resume upload failed.');
                        addMedia(file.name.replace(/\.[^.]+$/, '') || file.name, result.url, 'application/pdf', file.size);
                        updateSettings({ resumeUrl: result.url });
                        showNotice('Resume uploaded to Supabase. Saving the new resume…');
                      } catch (error) {
                        showNotice(error instanceof Error ? error.message : 'Resume upload failed.');
                      } finally {
                        setUploadingResume(false);
                        input.value = '';
                      }
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingResume || !isAdmin}
                      onClick={() => resumeFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#ff853a]/35 bg-[#ff853a]/10 px-3 py-2.5 text-xs font-semibold text-[#ffb17d] hover:bg-[#ff853a]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingResume ? <Upload size={14} className="animate-pulse" /> : <FileText size={14} />}
                      {uploadingResume ? 'Uploading resume…' : 'Upload PDF resume'}
                    </button>
                    {settings.resumeUrl && (
                      <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/5">
                        View current resume ↗
                      </a>
                    )}
                    {settings.resumeUrl && settings.resumeUrl !== initialSiteSettings.resumeUrl && (
                      <button
                        type="button"
                        disabled={!isAdmin || uploadingResume}
                        onClick={() => {
                          updateSettings({ resumeUrl: initialSiteSettings.resumeUrl });
                          showNotice('Restored the default resume. Saving to Supabase…');
                        }}
                        className="rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        Restore default
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-500">PDF only, up to 50 MB. The uploaded resume is stored in Supabase and used by the header and About page buttons.</p>
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={settings.linkedinUrl || ''}
                    placeholder="https://www.linkedin.com/in/yogendrach"
                    onChange={(e) => updateSettings({ linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Behance Portfolio URL</label>
                  <input
                    type="text"
                    value={settings.behanceUrl || ''}
                    placeholder="https://www.behance.net/yogendrachaudhary1"
                    onChange={(e) => updateSettings({ behanceUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    const result = await syncAllProjectsToSupabase();
                    showNotice(result.message);
                  }}
                  className="px-5 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md transition-all"
                >
                  Save Profile Settings
                </button>
              </div>
              </div>
            </details>

            {/* ADMIN SECURITY & PASSWORD CARD */}
            <details className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span><strong className="text-base text-white">Admin security</strong><small className="mt-1 block text-xs text-zinc-400">Change the administrator password</small></span>
                <ShieldCheck size={19} className="ml-auto text-[#f37021]" />
                <ChevronRight size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
              </summary>
              <div className="pt-5 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">New Password</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Confirm New Password</label>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!adminNewPassword.trim()) {
                      showNotice('Please enter a new password.');
                      return;
                    }
                    if (adminNewPassword !== adminConfirmPassword) {
                      showNotice('Passwords do not match. Please try again.');
                      return;
                    }
                    const ok = await changeAdminPassword(adminNewPassword);
                    if (ok) {
                      showNotice('Your Supabase Auth password was updated.');
                      setAdminNewPassword('');
                      setAdminConfirmPassword('');
                    } else {
                      showNotice('Password update failed. Use at least 8 characters and try again.');
                    }
                  }}
                  className="px-5 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md transition-all"
                >
                  Update Admin Password
                </button>
              </div>
              </div>
            </details>

            {/* SUPABASE POSTGRESQL CARD */}
            <details className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-white">Cloud database</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isSupabaseConnected
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {isSupabaseConnected ? 'Connected to Cloud DB' : 'Offline / Local Cache'}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs mt-0.5">Supabase connection and portfolio sync</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
              </summary>
              <div className="pt-5 space-y-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Command size={14} className="text-[#f37021]" />
                  <span>View SQL Script</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white font-mono text-xs sm:text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white font-mono text-xs sm:text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const ok = updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                    if (ok) {
                      showNotice(
                        supabaseUrlInput.trim()
                          ? 'Supabase configuration saved!'
                          : 'Cleared Supabase configuration.'
                      );
                    }
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md transition-all"
                >
                  Save &amp; Connect Supabase
                </button>
                <button
                  type="button"
                  disabled={syncingSupabase || !supabaseUrlInput.trim()}
                  onClick={async () => {
                    setSyncingSupabase(true);
                    showNotice('Saving the complete portfolio to Supabase...');
                    const result = await syncAllProjectsToSupabase();
                    setSyncingSupabase(false);
                    showNotice(result.message);
                  }}
                  className="px-4 py-2.5 bg-[#181923] hover:bg-[#202230] border border-white/15 text-white rounded-lg text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className={syncingSupabase ? 'animate-spin' : ''} />
                  <span>{syncingSupabase ? 'Syncing...' : 'Save Full Portfolio to Supabase'}</span>
                </button>
              </div>
              </div>
            </details>

            {/* SQL SCHEMA MODAL */}
            {showSqlModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#12131a] border border-white/15 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Command size={16} className="text-[#f37021]" />
                      <h3 className="font-bold text-white text-sm sm:text-base">Supabase PostgreSQL Schema</h3>
                    </div>
                    <button onClick={() => setShowSqlModal(false)} className="text-zinc-400 hover:text-white p-1">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <pre className="p-3 bg-[#090a0d] border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap rounded-lg">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                  </div>
                  <div className="p-4 border-t border-white/10 flex justify-end gap-2.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="px-4 py-2 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
                    </button>
                    <button
                      onClick={() => setShowSqlModal(false)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: EXPERIENCE TIMELINE
        ========================================== */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Work Experience Timeline</h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Manage roles, companies, descriptions, and skill tags displayed on your About &amp; Home pages.
                </p>
              </div>
              {!isCreatingExp && (
                <button
                  onClick={() => {
                    setIsCreatingExp(true);
                    setEditingExp(null);
                    setExpFormData({
                      role: '',
                      company: '',
                      dates: '',
                      duration: '',
                      current: false,
                      headline: '',
                      description: '',
                      tags: [],
                      order: experience.length + 1,
                      visible: true
                    });
                    setExpTagsInput('');
                  }}
                  className="px-4 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus size={16} />
                  <span>Add Experience</span>
                </button>
              )}
            </div>

            {/* CREATE / EDIT EXPERIENCE FORM */}
            {(isCreatingExp || editingExp) && (
              <div className="p-5 sm:p-6 bg-[#12131a] border border-[#f37021]/30 rounded-xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white">
                    {editingExp ? `Edit Experience: ${editingExp.role}` : 'Add New Experience Position'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingExp(false);
                      setEditingExp(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Role / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Product Designer"
                      value={expFormData.role || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Company &amp; Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Studio · Remote"
                      value={expFormData.company || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Dates / Period</label>
                    <input
                      type="text"
                      placeholder="e.g. Jan 2024 – Present"
                      value={expFormData.dates || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, dates: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="currentRoleCheckbox"
                      checked={expFormData.current || false}
                      onChange={(e) => setExpFormData({ ...expFormData, current: e.target.checked })}
                      className="accent-[#f37021] w-4 h-4 rounded"
                    />
                    <label htmlFor="currentRoleCheckbox" className="text-xs text-zinc-300 cursor-pointer font-medium">
                      Current active position
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Summary of responsibilities, design deliverables, and team impact..."
                      value={expFormData.description || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">
                      Skills &amp; Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={expTagsInput}
                      onChange={(e) => setExpTagsInput(e.target.value)}
                      placeholder="Design Systems, Prototyping, Figma, User Research"
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (!expFormData.role?.trim()) {
                        showNotice('Please enter a role or title.');
                        return;
                      }
                      const tags = expTagsInput.split(',').map((s) => s.trim()).filter(Boolean);
                      if (editingExp) {
                        updateExperience(editingExp.id, { ...expFormData, tags });
                        showNotice(`Updated experience: ${expFormData.role}`);
                        setEditingExp(null);
                      } else {
                        addExperience({ ...expFormData, tags } as any);
                        showNotice(`Added experience: ${expFormData.role}`);
                        setIsCreatingExp(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md"
                  >
                    Save Experience
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingExp(false);
                      setEditingExp(null);
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs sm:text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* EXPERIENCE ITEMS LIST */}
            <div className="space-y-3">
              {experience.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-[#12131a] border border-white/10 hover:border-white/20 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-base truncate">{item.role}</h3>
                      {item.current && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#f37021]/20 text-[#f37021] font-bold shrink-0 border border-[#f37021]/30">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-medium">
                      {item.company} · {item.dates}
                    </div>
                    <p className="text-zinc-300 text-xs sm:text-sm line-clamp-3 max-w-3xl leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-200">Certificates</h4>
                          <p className="mt-0.5 text-[11px] text-zinc-500">Upload one or more files for this experience. They appear beneath this role on the About pages.</p>
                        </div>
                        <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-[#181923] px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-[#202230] ${!isAdmin || uploadingCertificatesFor === item.id ? 'pointer-events-none opacity-50' : ''}`}>
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,image/avif,.pdf,.jpg,.jpeg,.png,.webp,.gif,.avif"
                            multiple
                            className="sr-only"
                            disabled={!isAdmin || uploadingCertificatesFor === item.id}
                            onChange={async (event) => {
                              const input = event.currentTarget;
                              const files = Array.from(input.files || []);
                              if (!files.length) return;
                              if (!isAdmin) {
                                showNotice('Sign in to Supabase Auth before uploading certificates.');
                                input.value = '';
                                return;
                              }
                              setUploadingCertificatesFor(item.id);
                              const existing = getCertificatesForExperience(item);
                              const added: AboutCertificate[] = [];
                              const failures: string[] = [];
                              try {
                                for (const file of files) {
                                  if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
                                    failures.push(`${file.name}: choose an image or PDF`);
                                    continue;
                                  }
                                  const result = await uploadMediaToSupabase(file);
                                  if (!result.url) {
                                    failures.push(`${file.name}: ${result.error || 'upload failed'}`);
                                    continue;
                                  }
                                  const title = file.name.replace(/\.[^.]+$/, '') || file.name;
                                  const asset = addMedia(title, result.url, file.type, file.size);
                                  added.push({ id: asset.id, title, url: asset.url, mimeType: asset.mimeType, size: asset.size, uploadedAt: asset.uploadedAt });
                                }
                                if (added.length) {
                                  saveExperienceCertificates(item.id, [...existing, ...added]);
                                  showNotice(`${added.length} certificate${added.length === 1 ? '' : 's'} uploaded for ${item.role}.${failures.length ? ` ${failures.length} failed.` : ''}`);
                                } else {
                                  showNotice(failures.join(' · ') || 'No certificates were uploaded.');
                                }
                              } finally {
                                setUploadingCertificatesFor(null);
                                input.value = '';
                              }
                            }}
                          />
                          <Upload size={13} className={uploadingCertificatesFor === item.id ? 'animate-pulse' : ''} />
                          {uploadingCertificatesFor === item.id ? 'Uploading…' : 'Upload certificate(s)'}
                        </label>
                      </div>
                      {!!getCertificatesForExperience(item).length && (
                        <div className="space-y-2">
                          {getCertificatesForExperience(item).map((certificate) => (
                            <div key={certificate.id} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#0d0e14] p-3 sm:flex-row sm:items-center">
                              <input
                                aria-label={`Certificate title for ${item.role}`}
                                value={certificate.title}
                                onChange={(event) => {
                                  const certificates = getCertificatesForExperience(item).map((current) => current.id === certificate.id ? { ...current, title: event.target.value } : current);
                                  saveExperienceCertificates(item.id, certificates);
                                }}
                                className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#f37021]"
                              />
                              <a href={certificate.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/10 px-3 py-2 text-center text-xs text-zinc-200 hover:bg-white/5">View certificate ↗</a>
                              <button
                                type="button"
                                onClick={() => {
                                  const certificates = getCertificatesForExperience(item).filter((current) => current.id !== certificate.id);
                                  saveExperienceCertificates(item.id, certificates);
                                }}
                                className="rounded-md border border-red-400/20 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => {
                        setEditingExp(item);
                        setExpFormData(item);
                        setExpTagsInput(item.tags.join(', '));
                        setIsCreatingExp(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#181923] hover:bg-[#202230] border border-white/10 text-white text-xs font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          title: 'Delete Experience',
                          message: `Are you sure you want to delete experience record "${item.role}"?`,
                          confirmLabel: 'Delete',
                          onConfirm: () => {
                            deleteExperience(item.id);
                            showNotice(`Deleted ${item.role}`);
                            setConfirmDialog(null);
                          }
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 5: EDUCATION & CREDENTIALS
        ========================================== */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Education &amp; Qualifications</h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Manage academic degrees, certifications, institutions, and communication skills.
                </p>
              </div>
              {!isCreatingEdu && (
                <button
                  onClick={() => {
                    setEditingEdu(null);
                    setEduFormData({
                      title: '',
                      institution: '',
                      location: '',
                      dates: '',
                      status: 'Graduated',
                      description: '',
                      tags: [],
                      order: education.length + 1,
                      visible: true
                    });
                    setEduTagsInput('');
                    setIsCreatingEdu(true);
                  }}
                  className="px-4 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Plus size={16} />
                  <span>Add Education</span>
                </button>
              )}
            </div>

            {/* CREATE / EDIT EDUCATION FORM */}
            {(isCreatingEdu || editingEdu) && (
              <div className="p-5 sm:p-6 bg-[#12131a] border border-[#f37021]/30 rounded-xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white">
                    {editingEdu ? `Edit: ${editingEdu.title}` : 'Add New Education / Qualification'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingEdu(false);
                      setEditingEdu(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Degree / Program Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor in Information Management"
                      value={eduFormData.title || ''}
                      onChange={(e) => setEduFormData({ ...eduFormData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Institution / University</label>
                    <input
                      type="text"
                      placeholder="e.g. Tribhuvan University"
                      value={eduFormData.institution || ''}
                      onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu, Nepal"
                      value={eduFormData.location || ''}
                      onChange={(e) => setEduFormData({ ...eduFormData, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Dates / Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2019 – 2023"
                      value={eduFormData.dates || ''}
                      onChange={(e) => setEduFormData({ ...eduFormData, dates: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Status / Honors</label>
                    <input
                      type="text"
                      placeholder="e.g. Graduated / First Division / In Progress"
                      value={eduFormData.status || ''}
                      onChange={(e) => setEduFormData({ ...eduFormData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">
                      Focus Areas &amp; Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Design Systems, Human-Computer Interaction, Research"
                      value={eduTagsInput}
                      onChange={(e) => setEduTagsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Details about coursework, major projects, thesis or awards..."
                      value={eduFormData.description || ''}
                      onChange={(e) => setEduFormData({ ...eduFormData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (!eduFormData.title?.trim()) {
                        showNotice('Please enter a degree or education title.');
                        return;
                      }
                      const tags = eduTagsInput.split(',').map((s) => s.trim()).filter(Boolean);
                      if (editingEdu) {
                        updateEducation(editingEdu.id, { ...eduFormData, tags });
                        showNotice(`Updated ${eduFormData.title}`);
                        setEditingEdu(null);
                      } else {
                        addEducation({ ...eduFormData, tags } as any);
                        showNotice(`Added ${eduFormData.title}`);
                        setIsCreatingEdu(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md"
                  >
                    Save Education
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingEdu(false);
                      setEditingEdu(null);
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs sm:text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* EDUCATION CARDS LIST */}
            <div className="space-y-4">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 bg-[#12131a] border border-white/10 hover:border-white/20 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-base truncate">{edu.title}</h3>
                      {edu.status && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#181923] text-[#f37021] font-bold shrink-0 border border-[#f37021]/30">
                          {edu.status}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-medium">
                      {edu.institution} · {edu.location} {edu.dates ? `· ${edu.dates}` : ''}
                    </div>
                    {edu.description && (
                      <p className="text-zinc-300 text-xs sm:text-sm line-clamp-3 max-w-3xl leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {edu.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => {
                        setEditingEdu(edu);
                        setEduFormData(edu);
                        setEduTagsInput(edu.tags.join(', '));
                        setIsCreatingEdu(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#181923] hover:bg-[#202230] border border-white/10 text-white text-xs font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          title: 'Delete Education Entry',
                          message: `Are you sure you want to remove "${edu.title}"?`,
                          confirmLabel: 'Delete',
                          onConfirm: () => {
                            deleteEducation(edu.id);
                            showNotice(`Deleted ${edu.title}`);
                            setConfirmDialog(null);
                          }
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: MEDIA LIBRARY
        ========================================== */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Media Asset Library</h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Upload images and videos to Supabase Storage, then choose them in projects and case studies.
              </p>
            </div>

            {/* ADD NEW ASSET CARD */}
            <div className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Upload images or videos</h3>
                <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WebP, GIF, AVIF, MP4, or WebM · up to 50 MB each · stored in Supabase</p>
              </div>
              <input
                ref={mediaFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm"
                multiple
                className="hidden"
                onChange={async (event) => {
                  const files = Array.from(event.currentTarget.files || []);
                  event.currentTarget.value = '';
                  if (!files.length) return;
                  if (!isAdmin) {
                    showNotice('Sign in to Supabase Auth before uploading media.');
                    return;
                  }

                  setUploadingMedia(true);
                  let uploaded = 0;
                  const failures: string[] = [];
                  for (const file of files) {
                    const result = await uploadMediaToSupabase(file);
                    if (result.url) {
                      const displayName = file.name.replace(/\.[^.]+$/, '') || file.name;
                      addMedia(displayName, result.url, file.type, file.size);
                      uploaded += 1;
                    } else {
                      failures.push(`${file.name}: ${result.error || 'upload failed'}`);
                    }
                  }
                  setUploadingMedia(false);
                  if (uploaded && !failures.length) {
                    showNotice(`Uploaded ${uploaded} ${uploaded === 1 ? 'file' : 'files'} to Supabase.`);
                  } else if (uploaded) {
                    showNotice(`Uploaded ${uploaded}; failed: ${failures.join(' · ')}`);
                  } else {
                    showNotice(failures.join(' · ') || 'No files were uploaded.');
                  }
                }}
              />
              <button
                type="button"
                disabled={uploadingMedia || !isAdmin}
                onClick={() => mediaFileInputRef.current?.click()}
                className="shrink-0 px-4 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload size={15} />
                <span>{uploadingMedia ? 'Uploading to Supabase…' : 'Choose files'}</span>
              </button>
            </div>

            <div className="p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-white">Add New Media Asset</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Asset Name</label>
                  <input
                    type="text"
                    value={newMediaName}
                    onChange={(e) => setNewMediaName(e.target.value)}
                    placeholder="e.g. Dashboard Hero Preview"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Asset URL / Path</label>
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="/assets/media/... or https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (!newMediaName || !newMediaUrl) {
                        showNotice('Please provide both asset name and URL.');
                        return;
                      }
                      addMedia(newMediaName, newMediaUrl, inferMediaMimeType(newMediaUrl), 0);
                      showNotice(`Added asset: ${newMediaName}`);
                      setNewMediaName('');
                      setNewMediaUrl('');
                    }}
                    className="w-full py-2.5 px-4 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} />
                    <span>Add Asset to Library</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SEARCH FILTER */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={mediaSearchQuery}
                onChange={(e) => setMediaSearchQuery(e.target.value)}
                placeholder="Search assets by name or path..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#12131a] border border-white/10 rounded-xl text-white text-xs sm:text-sm outline-none focus:border-[#f37021]"
              />
            </div>

            {/* MEDIA ASSETS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#12131a] border border-white/10 hover:border-white/20 rounded-xl overflow-hidden flex flex-col transition-all shadow-md group"
                >
                  <div className="h-40 bg-[#090a0d] overflow-hidden flex items-center justify-center relative">
                    <MediaPreview
                      alt={item.name}
                      src={item.url}
                      mimeType={item.mimeType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="/assets/media/home-media-04-f775f2921176.webp"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCopy(item.url, item.id)}
                        className="px-3 py-1.5 bg-[#f37021] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-lg flex items-center gap-1"
                      >
                        {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm truncate">{item.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500 truncate mt-1">{item.url}</div>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/5">
                      <button
                        onClick={() => handleCopy(item.url, item.id)}
                        className="px-2.5 py-1 bg-[#181923] hover:bg-[#202230] border border-white/10 text-zinc-300 hover:text-white rounded-lg text-xs cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === item.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Remove Media Asset',
                            message: `Are you sure you want to remove asset "${item.name}"?`,
                            confirmLabel: 'Remove',
                            onConfirm: () => {
                              deleteMedia(item.id);
                              showNotice('Deleted asset');
                              setConfirmDialog(null);
                            }
                          });
                        }}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 7: SEO & OPEN GRAPH METADATA
        ========================================== */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">SEO &amp; Open Graph Metadata</h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Configure search engine title, description, canonical link, and social preview card.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-7 p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Site Title Tag</label>
                    <input
                      type="text"
                      value={settings.seo.title}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, title: e.target.value } })}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Meta Description</label>
                    <textarea
                      rows={3}
                      value={settings.seo.description}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, description: e.target.value } })}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Canonical Site URL</label>
                    <input
                      type="text"
                      value={settings.seo.canonicalUrl}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, canonicalUrl: e.target.value } })}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">
                      Open Graph Social Image URL
                    </label>
                    <input
                      type="text"
                      value={settings.seo.ogImage}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, ogImage: e.target.value } })}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0d0e14] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showNotice('SEO metadata updated successfully.')}
                    className="px-5 py-2.5 bg-[#f37021] hover:bg-[#ff7e33] text-white rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-md transition-all"
                  >
                    Save SEO Settings
                  </button>
                </div>
              </div>

              {/* Social Card Preview Column */}
              <div className="lg:col-span-5 p-5 sm:p-6 bg-[#12131a] border border-white/10 rounded-xl space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white">Social Share Card Preview</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">How your portfolio appears when shared on Twitter/X or LinkedIn.</p>
                </div>

                <div className="bg-[#0d0e14] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <div className="h-44 bg-black overflow-hidden relative">
                    <img
                      alt="Social share card"
                      src={settings.seo.ogImage || '/og-rizka-portfolio.jpg'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/media/home-media-04-f775f2921176.webp';
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-1.5 bg-[#171822]">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      {settings.seo.canonicalUrl ? new URL(settings.seo.canonicalUrl).hostname : 'yogendrach.vercel.app'}
                    </div>
                    <div className="font-bold text-white text-sm line-clamp-1">{settings.seo.title}</div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{settings.seo.description}</p>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 pt-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Configured for Google Search Console, Twitter Card, and OpenGraph.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          GLOBAL CONFIRMATION DIALOG MODAL
      ========================================== */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-white/15 rounded-xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white">{confirmDialog.title}</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs cursor-pointer shadow-md transition-colors"
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

