Warning: truncated output (original token count: 28608)
Total output lines: 2253

import React, { useRef, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project, ExperienceItem, EducationItem } from '../../types';
import { initialSiteSettings } from '../../data/initialData';
import { ProjectEditor } from '../../components/admin/ProjectEditor';
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
              <button
                key={tab.id}
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
                <tab.icon
                  size={18}
                  strokeWidth={1.8}
                  className={isActive ? 'text-[#f37021]' : 'text-zinc-400'}
                />
                <span className="admin-nav-copy">
                  <span className={isActive ? 'text-white' : 'text-zinc-300'}>{tab.label}</span>
                  <small className="text-zinc-500">{tab.detail}</small>
                </span>
                {isActive && <ChevronRight className="admin-nav-chevron text-[#f37021]" size={15} />}
              </button>
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
   …14608 tokens truncated…          </div>

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


