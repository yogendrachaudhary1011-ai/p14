import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project, ExperienceItem, EducationItem } from '../../types';
import { ProjectEditor } from '../../components/admin/ProjectEditor';
import { SUPABASE_SQL_SCHEMA } from '../../supabase';

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
    supabaseConfig,
    updateSupabaseConfig,
    syncAllProjectsToSupabase,
    login,
    logout,
    updateSettings,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
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

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'settings' | 'experience' | 'education' | 'media' | 'seo'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

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

  // Media upload state
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Notification message
  const [notice, setNotice] = useState<string | null>(null);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setLoginError('');
      showNotice('Welcome back to Portfolio Admin CMS!');
    } else {
      setLoginError('Invalid credentials. Password must be at least 4 characters.');
    }
  };

  if (!isAdmin) {
    return (
      <div id="loginView" className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-[#0a0a0c]">
        <div className="w-full max-w-md bg-[#131418] border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="text-lg sm:text-xl font-bold text-white mb-1">
            PORTFOLIO <span className="text-[#f37021]">ADMIN CMS</span>
          </div>
          <div className="text-zinc-400 text-xs sm:text-sm mb-6">
            Yogendra Chaudhary Portfolio Management Portal
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-md mb-4 text-xs sm:text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">
                Username
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm focus:border-[#f37021] outline-none"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm focus:border-[#f37021] outline-none"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#f37021] hover:bg-[#ff721a] text-white font-semibold rounded-md text-sm transition-colors cursor-pointer"
            >
              Sign In to CMS
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
            <button
              onClick={() => onNavigate('/')}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              ← Back to Public Website
            </button>
            <span className="text-zinc-600 font-mono">Demo: admin / admin123</span>
          </div>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'dashboard' },
    { id: 'projects', label: 'Projects & Case Studies', icon: 'folder' },
    { id: 'settings', label: 'Site & Profile Settings', icon: 'person' },
    { id: 'experience', label: 'Work Experience', icon: 'work' },
    { id: 'education', label: 'Education & Languages', icon: 'school' },
    { id: 'media', label: 'Media Library', icon: 'image' },
    { id: 'seo', label: 'SEO & Metadata', icon: 'public' }
  ];

  return (
    <div id="adminApp" className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* MOBILE TOP BAR (visible on screens < lg) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#131418]/95 backdrop-blur-md border-b border-white/10 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="w-9 h-9 rounded bg-white/5 border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/10"
            aria-label="Toggle navigation drawer"
          >
            <span className="material-symbols-rounded text-xl">
              {mobileSidebarOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="text-sm font-bold text-white tracking-wide">
            PORTFOLIO <span className="text-[#f37021]">CMS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="px-2.5 py-1 text-xs rounded bg-white/5 text-zinc-300 hover:text-white border border-white/10 cursor-pointer"
          >
            ↗ Site
          </button>
          <button
            onClick={logout}
            className="px-2.5 py-1 text-xs rounded bg-red-500/15 text-red-400 border border-red-500/30 cursor-pointer"
          >
            Exit
          </button>
        </div>
      </header>

      {/* BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-45 transition-opacity"
        />
      )}

      {/* SIDEBAR (Responsive drawer on mobile, fixed column on desktop) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-[#131418] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm sm:text-base font-bold text-white">
            PORTFOLIO <span className="text-[#f37021]">CMS</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5"
            aria-label="Close navigation"
          >
            <span className="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
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
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors text-left w-full cursor-pointer ${
                  isActive
                    ? 'text-[#f37021] bg-[#f37021]/15 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-rounded text-lg">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 flex flex-col gap-2">
          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              onNavigate('/');
            }}
            className="w-full py-2 px-3 bg-[#1a1b22] border border-white/10 text-zinc-200 hover:text-white rounded-md text-xs text-center cursor-pointer transition-colors"
          >
            ↗ View Public Site
          </button>
          <button
            onClick={logout}
            className="w-full py-2 px-3 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-md text-xs text-center cursor-pointer transition-colors"
          >
            Log Out ({adminUser})
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-w-0 pt-16 lg:pt-0 lg:ml-64 p-4 sm:p-6 md:p-8 lg:p-10 transition-all">
        {notice && (
          <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 bg-[#10b981] text-white py-2.5 px-4 rounded-lg shadow-xl font-medium text-xs sm:text-sm animate-fade-in flex items-center gap-2">
            <span className="material-symbols-rounded text-base">check_circle</span>
            <span>{notice}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">CMS Dashboard Overview</h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Manage live portfolio content, case studies, experience, and assets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 bg-[#131418] border border-white/10 rounded-xl">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Total Projects</span>
                <div className="text-2xl sm:text-3xl font-bold text-[#f37021] mt-2">{projects.length}</div>
                <div className="text-xs text-zinc-500 mt-1">{projects.filter(p => p.status === 'published').length} published</div>
              </div>

              <div className="p-4 sm:p-5 bg-[#131418] border border-white/10 rounded-xl">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Experience</span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{experience.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Active career positions</div>
              </div>

              <div className="p-4 sm:p-5 bg-[#131418] border border-white/10 rounded-xl">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Media Assets</span>
                <div className="text-2xl sm:text-3xl font-bold text-[#10b981] mt-2">{media.length}</div>
                <div className="text-xs text-zinc-500 mt-1">In local storage &amp; CDN</div>
              </div>

              <div className="p-4 sm:p-5 bg-[#131418] border border-white/10 rounded-xl">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Database Status</span>
                <div className="text-sm font-semibold text-[#10b981] mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0"></span>
                  <span className="truncate">{isSupabaseConnected ? 'Connected to Supabase' : 'Offline / Local Cache'}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Live state persistence active</div>
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-[#131418] border border-white/10 rounded-xl">
              <h2 className="text-base font-semibold text-white mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setActiveTab('projects'); setIsCreatingProject(true); }}
                  className="px-4 py-2.5 bg-[#f37021] hover:bg-[#ff721a] text-white rounded-md text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  + Add New Project
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2.5 bg-[#1a1b22] hover:bg-[#252630] border border-white/10 text-white rounded-md text-xs sm:text-sm cursor-pointer"
                >
                  Edit Site Profile
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all content to original Yogendra Chaudhary portfolio defaults?')) {
                      resetToDefaults();
                      showNotice('Portfolio restored to initial defaults.');
                    }
                  }}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs sm:text-sm cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS & CASE STUDIES */}
        {activeTab === 'projects' && (
          <div>
            {isCreatingProject || editingProject ? (
              <ProjectEditor
                initialProject={editingProject}
                existingProjects={projects}
                mediaLibrary={media}
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
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Projects &amp; Case Studies</h1>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Build, reorder, publish, and customize case studies with the visual block builder.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingProject(true);
                      setEditingProject(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#f37021] hover:bg-[#ff721a] text-white rounded-md text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-rounded text-lg">add</span>
                    <span>Add New Case Study</span>
                  </button>
                </div>

                {/* Projects Table with Responsive Horizontal Scroll Container */}
                <div className="w-full overflow-hidden border border-white/10 rounded-xl bg-[#131418]">
                  <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center text-xs">
                    <span className="font-mono text-zinc-400">ALL CASE STUDIES ({projects.length})</span>
                    <button
                      onClick={() => {
                        if (window.confirm('Permanently delete all projects? This action cannot be undone.')) {
                          projects.forEach(p => deleteProject(p.id));
                          showNotice('All projects removed.');
                        }
                      }}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs cursor-pointer"
                    >
                      Delete All Projects
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#181920] text-zinc-400">
                          <th className="py-3 px-4 w-14">Order</th>
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Route</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((proj, pIdx) => (
                          <tr key={proj.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-zinc-500">{pIdx + 1}</span>
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => {
                                      if (pIdx === 0) return;
                                      const ids = projects.map(p => p.id);
                                      const temp = ids[pIdx];
                                      ids[pIdx] = ids[pIdx - 1];
                                      ids[pIdx - 1] = temp;
                                      reorderProjects(ids);
                                    }}
                                    disabled={pIdx === 0}
                                    className={`text-[10px] leading-tight ${pIdx === 0 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white cursor-pointer'}`}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (pIdx === projects.length - 1) return;
                                      const ids = projects.map(p => p.id);
                                      const temp = ids[pIdx];
                                      ids[pIdx] = ids[pIdx + 1];
                                      ids[pIdx + 1] = temp;
                                      reorderProjects(ids);
                                    }}
                                    disabled={pIdx === projects.length - 1}
                                    className={`text-[10px] leading-tight ${pIdx === projects.length - 1 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white cursor-pointer'}`}
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  alt={proj.title}
                                  src={proj.heroImage?.url || proj.coverImage || '/assets/media/home-media-04-f775f2921176.webp'}
                                  className="w-12 h-9 object-cover rounded bg-black border border-white/10 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-white flex items-center gap-1.5">
                                    <span>{proj.title}</span>
                                    {proj.featured && <span className="text-[#f37021] text-xs">★</span>}
                                  </div>
                                  <div className="text-[11px] text-zinc-500">
                                    {proj.year || '2026'} · {proj.sections?.length || 11} sections
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-zinc-400">{proj.categoryLabel || proj.category}</td>
                            <td className="py-3 px-4 font-mono text-xs text-zinc-400">{proj.route}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                proj.status === 'published'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}>
                                {proj.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setIsCreatingProject(false);
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#1a1b22] hover:bg-[#252630] border border-white/10 text-white text-xs cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete project "${proj.title}"?`)) {
                                      deleteProject(proj.id);
                                      showNotice(`Deleted "${proj.title}"`);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Site &amp; Profile Settings</h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Update designer branding, contact information, and availability status.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-[#131418] border border-white/10 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Brand Name</label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={(e) => updateSettings({ brandName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Brand Role</label>
                  <input
                    type="text"
                    value={settings.brandRole}
                    onChange={(e) => updateSettings({ brandRole: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Location</label>
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => updateSettings({ location: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Resume / CV URL</label>
                  <input
                    type="text"
                    value={settings.resumeUrl}
                    onChange={(e) => updateSettings({ resumeUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Availability Text</label>
                  <textarea
                    rows={2}
                    value={settings.availabilityText}
                    onChange={(e) => updateSettings({ availabilityText: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none focus:border-[#f37021]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => showNotice('Profile settings saved successfully.')}
                  className="px-5 py-2.5 bg-[#f37021] hover:bg-[#ff721a] text-white rounded-md text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>

            {/* SUPABASE CARD */}
            <div className="p-4 sm:p-6 bg-[#131418] border border-white/10 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-base sm:text-lg font-bold text-white">Supabase Integration</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isSupabaseConnected ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {isSupabaseConnected ? 'Connected to Supabase' : 'Offline / Local Cache'}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                    Connect your portfolio to Supabase PostgreSQL for persistent database storage and media.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-rounded text-sm">terminal</span>
                  <span>View SQL Script</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white font-mono text-xs sm:text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1.5 font-semibold">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white font-mono text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const ok = updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                    if (ok) {
                      showNotice(supabaseUrlInput.trim() ? 'Supabase configuration saved!' : 'Cleared Supabase configuration.');
                    }
                  }}
                  className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-md text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Save &amp; Connect Supabase
                </button>
                <button
                  type="button"
                  disabled={syncingSupabase || !supabaseUrlInput.trim()}
                  onClick={async () => {
                    setSyncingSupabase(true);
                    showNotice('Synchronizing projects to Supabase...');
                    const result = await syncAllProjectsToSupabase();
                    setSyncingSupabase(false);
                    showNotice(result.message);
                  }}
                  className="px-4 py-2 bg-[#1a1b22] hover:bg-[#252630] border border-white/15 text-white rounded-md text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {syncingSupabase ? 'Syncing...' : 'Sync Projects to Supabase'}
                </button>
              </div>
            </div>

            {/* SQL MODAL */}
            {showSqlModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#131418] border border-white/15 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm sm:text-base">Supabase SQL Schema</h3>
                    <button
                      onClick={() => setShowSqlModal(false)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <pre className="p-3 bg-[#0a0a0c] border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap rounded">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                  </div>
                  <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-[#f37021] text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      {copiedSql ? '✓ Copied' : 'Copy SQL Script'}
                    </button>
                    <button
                      onClick={() => setShowSqlModal(false)}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Work Experience Timeline</h1>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Manage roles, companies, descriptions, and skill tags.
                </p>
              </div>
              {!isCreatingExp && (
                <button
                  onClick={() => {
                    setIsCreatingExp(true);
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
                  className="px-4 py-2.5 bg-[#f37021] hover:bg-[#ff721a] text-white rounded-md text-xs sm:text-sm font-semibold cursor-pointer shrink-0"
                >
                  + Add Experience
                </button>
              )}
            </div>

            {/* FORM */}
            {(isCreatingExp || editingExp) && (
              <div className="p-4 sm:p-6 bg-[#131418] border border-white/10 rounded-xl space-y-4">
                <h2 className="text-base font-semibold text-white">
                  {editingExp ? 'Edit Experience' : 'New Experience Item'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Role / Title</label>
                    <input
                      type="text"
                      value={expFormData.role || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Company &amp; Location</label>
                    <input
                      type="text"
                      value={expFormData.company || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Dates</label>
                    <input
                      type="text"
                      value={expFormData.dates || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, dates: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="currentRoleCheckbox"
                      checked={expFormData.current || false}
                      onChange={(e) => setExpFormData({ ...expFormData, current: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="currentRoleCheckbox" className="text-xs text-zinc-300 cursor-pointer">
                      Current active position
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Description</label>
                    <textarea
                      rows={3}
                      value={expFormData.description || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Skills &amp; Tags (comma separated)</label>
                    <input
                      type="text"
                      value={expTagsInput}
                      onChange={(e) => setExpTagsInput(e.target.value)}
                      placeholder="UI Design, User Flows, Figma, Design Systems"
                      className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      const tags = expTagsInput.split(',').map(s => s.trim()).filter(Boolean);
                      if (editingExp) {
                        updateExperience(editingExp.id, { ...expFormData, tags });
                        showNotice('Updated experience record.');
                        setEditingExp(null);
                      } else {
                        addExperience({ ...expFormData, tags } as any);
                        showNotice('Added new experience record.');
                        setIsCreatingExp(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#f37021] text-white rounded text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    Save Experience
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingExp(false);
                      setEditingExp(null);
                    }}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded text-xs sm:text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* EXPERIENCE LIST */}
            <div className="space-y-3">
              {experience.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 bg-[#131418] border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-sm sm:text-base truncate">{item.role}</h3>
                      {item.current && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#f37021]/20 text-[#f37021] font-bold shrink-0">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400">{item.company} · {item.dates}</div>
                    <p className="text-zinc-300 text-xs sm:text-sm line-clamp-3 max-w-3xl">{item.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((t, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                          {t}
                        </span>
                      ))}
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
                      className="px-3 py-1.5 rounded bg-[#1a1b22] hover:bg-[#252630] border border-white/10 text-white text-xs cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete experience record: ${item.role}?`)) {
                          deleteExperience(item.id);
                          showNotice(`Deleted ${item.role}`);
                        }
                      }}
                      className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Education &amp; Languages</h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Academic degree information, listed spoken languages, and communication skills.
              </p>
            </div>

            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 sm:p-5 bg-[#131418] border border-white/10 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">{edu.title}</h3>
                      <div className="text-xs text-zinc-400 mt-0.5">{edu.institution} · {edu.location}</div>
                      <p className="text-zinc-300 text-xs sm:text-sm mt-2">{edu.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1a1b22] text-[#f37021] text-xs font-semibold shrink-0">
                      {edu.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {edu.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Media Asset Library</h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Images and videos used across home, projects, and case study pages.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-[#131418] border border-white/10 rounded-xl space-y-3">
              <h2 className="text-base font-semibold text-white">Add New Asset Link</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Asset Name</label>
                  <input
                    type="text"
                    value={newMediaName}
                    onChange={(e) => setNewMediaName(e.target.value)}
                    placeholder="e.g. Dashboard preview"
                    className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Asset URL</label>
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="/assets/media/... or https://..."
                    className="w-full px-3 py-2 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (!newMediaName || !newMediaUrl) {
                        alert('Please provide name and URL');
                        return;
                      }
                      addMedia(newMediaName, newMediaUrl, 'image/webp', 120000);
                      showNotice('Media asset added.');
                      setNewMediaName('');
                      setNewMediaUrl('');
                    }}
                    className="w-full py-2.5 px-4 bg-[#f37021] hover:bg-[#ff721a] text-white rounded-md text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    Add Asset
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {media.map((item) => (
                <div key={item.id} className="bg-[#131418] border border-white/10 rounded-xl overflow-hidden flex flex-col">
                  <div className="h-36 bg-[#0a0a0c] overflow-hidden flex items-center justify-center">
                    <img
                      alt={item.name}
                      src={item.url}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/media/home-media-03-d6c887bed8af.webp';
                      }}
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-white text-xs sm:text-sm truncate">{item.name}</div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">{item.url}</div>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(item.url);
                          showNotice('Copied URL to clipboard');
                        }}
                        className="px-2.5 py-1 bg-[#1a1b22] hover:bg-[#252630] border border-white/10 text-zinc-300 hover:text-white rounded text-xs cursor-pointer"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => {
                          deleteMedia(item.id);
                          showNotice('Deleted asset');
                        }}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs cursor-pointer"
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

        {/* TAB 7: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">SEO &amp; Open Graph Metadata</h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Search engine optimization, social cards, and crawl instructions.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-[#131418] border border-white/10 rounded-xl space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Site Title</label>
                  <input
                    type="text"
                    value={settings.seo.title}
                    onChange={(e) => updateSettings({ seo: { ...settings.seo, title: e.target.value } })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.seo.description}
                    onChange={(e) => updateSettings({ seo: { ...settings.seo, description: e.target.value } })}
                    className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Canonical URL</label>
                    <input
                      type="text"
                      value={settings.seo.canonicalUrl}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, canonicalUrl: e.target.value } })}
                      className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 mb-1 font-semibold">Open Graph Image URL</label>
                    <input
                      type="text"
                      value={settings.seo.ogImage}
                      onChange={(e) => updateSettings({ seo: { ...settings.seo, ogImage: e.target.value } })}
                      className="w-full px-3 py-2.5 rounded-md bg-[#101115] border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => showNotice('SEO metadata updated successfully.')}
                  className="px-5 py-2.5 bg-[#f37021] hover:bg-[#ff721a] text-white rounded-md text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Save SEO Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
