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
    duplicateProject,
    reorderProjects,
    toggleProjectStatus,
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

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Project edit state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({
    title: '',
    slug: '',
    category: 'product',
    categoryLabel: 'Product Case Study',
    mediaNote: 'Product design',
    coverImage: '/assets/media/home-media-03-d6c887bed8af.webp',
    year: '2026',
    order: projects.length + 1,
    status: 'published',
    featured: true,
    summary: ''
  });

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

  // Media upload simulation state
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
      <div id="loginView" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', background: 'radial-gradient(circle at 50% 20%, rgba(243, 112, 33, 0.06), transparent 70%), #0a0a0c' }}>
        <div className="login-card" style={{ width: '100%', maxWidth: '420px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '36px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div className="login-brand" style={{ fontSize: '18px', fontWeight: 700, color: '#f0f0f4', marginBottom: '6px' }}>
            PORTFOLIO <span style={{ color: '#f37021' }}>ADMIN CMS</span>
          </div>
          <div className="login-sub" style={{ color: '#8e8ea0', fontSize: '13px', marginBottom: '24px' }}>
            Yogendra Chaudhary Portfolio Management Portal
          </div>

          {loginError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>
                Username
              </label>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>
                Password
              </label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
              />
            </div>

            <button
              className="btn btn-primary btn-block"
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
            >
              Sign In to CMS
            </button>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                style={{ background: 'none', border: 'none', color: '#8e8ea0', fontSize: '13px', cursor: 'pointer' }}
              >
                ← Back to Public Site
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="adminApp" style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c', color: '#f0f0f4' }}>
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ width: '260px', background: '#131418', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div className="sidebar-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sidebar-brand" style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f4' }}>
            PORTFOLIO <span style={{ color: '#f37021' }}>CMS</span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: 'dashboard' },
            { id: 'projects', label: 'Projects & Case Studies', icon: 'folder' },
            { id: 'settings', label: 'Site & Profile Settings', icon: 'person' },
            { id: 'experience', label: 'Work Experience', icon: 'work' },
            { id: 'education', label: 'Education & Languages', icon: 'school' },
            { id: 'media', label: 'Media Library', icon: 'image' },
            { id: 'seo', label: 'SEO & Metadata', icon: 'public' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsCreatingProject(false);
                setEditingProject(null);
                setIsCreatingExp(false);
                setEditingExp(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '6px',
                color: activeTab === tab.id ? '#f37021' : '#8e8ea0',
                background: activeTab === tab.id ? 'rgba(243, 112, 33, 0.15)' : 'none',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => onNavigate('/')}
            style={{ width: '100%', padding: '8px 12px', background: '#1a1b22', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f4', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            ↗ View Public Site
          </button>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
          >
            Log Out ({adminUser})
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '32px 40px', minHeight: '100vh' }}>
        {notice && (
          <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 9999, background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', fontWeight: 600 }}>
            {notice}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>CMS Dashboard Overview</h1>
              <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                Manage live portfolio content, case studies, experience, and assets.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', fontWeight: 600 }}>Total Projects</span>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f37021', marginTop: '8px' }}>{projects.length}</div>
                <div style={{ fontSize: '12px', color: '#5c5c6e', marginTop: '4px' }}>{projects.filter(p => p.status === 'published').length} published</div>
              </div>
              <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', fontWeight: 600 }}>Experience Records</span>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f0f0f4', marginTop: '8px' }}>{experience.length}</div>
                <div style={{ fontSize: '12px', color: '#5c5c6e', marginTop: '4px' }}>1 currently active</div>
              </div>
              <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', fontWeight: 600 }}>Media Assets</span>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginTop: '8px' }}>{media.length}</div>
                <div style={{ fontSize: '12px', color: '#5c5c6e', marginTop: '4px' }}>In local storage &amp; CDN</div>
              </div>
              <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', fontWeight: 600 }}>System Status</span>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#10b981', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  React Runtime Healthy
                </div>
                <div style={{ fontSize: '12px', color: '#8e8ea0', marginTop: '4px' }}>Database sync enabled</div>
              </div>
            </div>

            <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Quick Navigation</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setActiveTab('projects'); setIsCreatingProject(true); }}
                  style={{ padding: '10px 18px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add New Project
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{ padding: '10px 18px', background: '#1a1b22', color: '#f0f0f4', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer' }}
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
                  style={{ padding: '10px 18px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            {(isCreatingProject || editingProject) ? (
              <ProjectEditor
                initialProject={editingProject}
                existingProjects={projects}
                mediaLibrary={media}
                onSave={(payload) => {
                  if (editingProject) {
                    updateProject(editingProject.id, payload);
                    showNotice(`Saved changes to "${payload.title}"`);
                  } else {
                    const created = addProject(payload);
                    showNotice(`Created new project "${created.title}"`);
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
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Projects &amp; Case Studies</h1>
                    <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                      Build, reorder, publish, and customize responsive case studies with the visual block builder.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setIsCreatingProject(true);
                        setEditingProject(null);
                      }}
                      style={{ padding: '10px 18px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span>
                      <span>Add New Case Study</span>
                    </button>
                  </div>
                </div>

                {/* Status KPI summary row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px 16px', background: '#131418', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#8e8ea0', textTransform: 'uppercase', fontFamily: 'monospace' }}>Total Case Studies</span>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#f0f0f4', marginTop: '2px' }}>{projects.length}</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#131418', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', fontFamily: 'monospace' }}>Published (Public)</span>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{projects.filter(p => p.status === 'published').length}</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#131418', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Drafts (Preview only)</span>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>{projects.filter(p => p.status === 'draft').length}</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#131418', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#f37021', textTransform: 'uppercase', fontFamily: 'monospace' }}>Featured Work</span>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#f37021', marginTop: '2px' }}>{projects.filter(p => p.featured).length}</div>
                  </div>
                </div>

                {/* Projects Table */}
                {projects.length === 0 ? (
                  <div style={{ padding: '48px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#8e8ea0', marginBottom: '8px' }}>folder_open</span>
                    <p style={{ color: '#8e8ea0', fontSize: '14px' }}>No projects found in database.</p>
                    <button
                      onClick={() => setIsCreatingProject(true)}
                      style={{ marginTop: '16px', padding: '10px 20px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Create First Case Study
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '12px', color: '#8e8ea0', fontFamily: 'monospace' }}>
                        ALL CASE STUDIES ({projects.length})
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Permanently delete all projects? This action cannot be undone.')) {
                            projects.forEach(p => deleteProject(p.id));
                            showNotice('All projects removed.');
                          }
                        }}
                        style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Delete All Projects
                      </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#181920', color: '#8e8ea0' }}>
                          <th style={{ padding: '12px 18px', width: '50px' }}>Order</th>
                          <th style={{ padding: '12px 18px' }}>Project</th>
                          <th style={{ padding: '12px 18px' }}>Category</th>
                          <th style={{ padding: '12px 18px' }}>Route</th>
                          <th style={{ padding: '12px 18px' }}>Status</th>
                          <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((proj, pIdx) => (
                          <tr key={proj.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {/* Order reordering */}
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8e8ea0', minWidth: '16px' }}>
                                  {pIdx + 1}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                                    style={{ border: 'none', background: 'none', color: pIdx === 0 ? '#333' : '#8e8ea0', cursor: pIdx === 0 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}
                                    title="Move Up"
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
                                    style={{ border: 'none', background: 'none', color: pIdx === projects.length - 1 ? '#333' : '#8e8ea0', cursor: pIdx === projects.length - 1 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}
                                    title="Move Down"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Project visual & title */}
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  alt={proj.title}
                                  src={proj.heroImage?.url || proj.coverImage || '/assets/media/home-media-04-f775f2921176.webp'}
                                  style={{ width: '48px', height: '34px', objectFit: 'cover', borderRadius: '4px', background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/media/home-media-04-f775f2921176.webp';
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600, color: '#f0f0f4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{proj.title}</span>
                                    {proj.featured && (
                                      <span title="Featured Work" style={{ color: '#f37021', fontSize: '14px' }}>★</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#8e8ea0' }}>
                                    {proj.year || '2026'} · {proj.sections?.length || 11} sections
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '12px 18px', color: '#8e8ea0' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#1c1d24', fontSize: '11px' }}>
                                {proj.categoryLabel || 'Case Study'}
                              </span>
                            </td>

                            {/* Route slug */}
                            <td style={{ padding: '12px 18px' }}>
                              <button
                                onClick={() => onNavigate(proj.route || `/${proj.slug}`)}
                                style={{ background: 'none', border: 'none', fontFamily: 'monospace', color: '#f37021', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                                title="Open project detail route"
                              >
                                {proj.route || `/${proj.slug}`}
                              </button>
                            </td>

                            {/* Status toggle */}
                            <td style={{ padding: '12px 18px' }}>
                              <button
                                onClick={() => {
                                  toggleProjectStatus(proj.id);
                                  showNotice(`Toggled status for "${proj.title}"`);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: proj.status === 'published' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                  color: proj.status === 'published' ? '#10b981' : '#f59e0b',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Click to toggle publish status"
                              >
                                {proj.status === 'published' ? 'Published' : 'Draft'}
                              </button>
                            </td>

                            {/* Actions toolbar */}
                            <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  onClick={() => onNavigate(proj.route || `/${proj.slug}`)}
                                  style={{ padding: '6px 10px', background: '#1a1b22', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f4', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  title="View Public Page"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setIsCreatingProject(false);
                                  }}
                                  style={{ padding: '6px 10px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                                  title="Edit Project and Case Study Builder"
                                >
                                  Edit &amp; Build
                                </button>
                                <button
                                  onClick={() => {
                                    const dup = duplicateProject(proj.id);
                                    if (dup) showNotice(`Duplicated as "${dup.title}"`);
                                  }}
                                  style={{ padding: '6px 10px', background: '#1a1b22', border: '1px solid rgba(255,255,255,0.08)', color: '#8e8ea0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  title="Duplicate Project"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete project "${proj.title}" permanently?`)) {
                                      deleteProject(proj.id);
                                      showNotice(`Deleted ${proj.title}`);
                                    }
                                  }}
                                  style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  title="Delete Project"
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
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Site &amp; Profile Settings</h1>
              <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                Update designer branding, contact information, and availability status.
              </p>
            </div>

            <div style={{ padding: '28px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Brand Name</label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={(e) => updateSettings({ brandName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Brand Role</label>
                  <input
                    type="text"
                    value={settings.brandRole}
                    onChange={(e) => updateSettings({ brandRole: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Phone Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Location</label>
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => updateSettings({ location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Resume / CV URL</label>
                  <input
                    type="text"
                    value={settings.resumeUrl}
                    onChange={(e) => updateSettings({ resumeUrl: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Availability Text</label>
                  <textarea
                    rows={2}
                    value={settings.availabilityText}
                    onChange={(e) => updateSettings({ availabilityText: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => showNotice('Profile settings saved successfully.')}
                  style={{ padding: '10px 24px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Profile Settings
                </button>
              </div>
            </div>

            {/* SUPABASE DATABASE & REALTIME SYNC CARD */}
            <div style={{ marginTop: '32px', padding: '28px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Supabase Database Integration</h2>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: isSupabaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: isSupabaseConnected ? '#10b981' : '#eab308',
                      border: `1px solid ${isSupabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSupabaseConnected ? '#10b981' : '#eab308' }} />
                      {isSupabaseConnected ? 'Connected to Supabase' : 'Offline / Local Cache'}
                    </span>
                  </div>
                  <p style={{ color: '#8e8ea0', fontSize: '13px', marginTop: '6px' }}>
                    Connect your project to Supabase PostgreSQL for persistent database storage, real-time sync, and media uploads.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#f0f0f4',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>terminal</span>
                  <span>View Supabase SQL Setup</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setsupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '11px', color: '#8e8ea0', marginTop: '4px' }}>
                    Found in Supabase Dashboard → Settings → API → Project URL
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '11px', color: '#8e8ea0', marginTop: '4px' }}>
                    Found in Supabase Dashboard → Settings → API → Project API Keys (anon/public)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    const ok = updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                    if (ok) {
                      showNotice(supabaseUrlInput.trim() ? 'Supabase configuration saved & connected!' : 'Cleared Supabase configuration.');
                    } else {
                      showNotice('Failed to update Supabase configuration.');
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
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
                  style={{
                    padding: '10px 20px',
                    background: '#1a1b22',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: syncingSupabase || !supabaseUrlInput.trim() ? '#666' : '#f0f0f4',
                    borderRadius: '6px',
                    fontWeight: 500,
                    cursor: syncingSupabase || !supabaseUrlInput.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {syncingSupabase ? 'Syncing...' : 'Sync All Projects to Supabase'}
                </button>
              </div>
            </div>

            {/* SQL SCHEMA MODAL */}
            {showSqlModal && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ background: '#131418', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', width: '100%', maxWidth: '780px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f0f0f4' }}>Supabase SQL Migration Script</h3>
                      <p style={{ margin: '4px 0 0', color: '#8e8ea0', fontSize: '12px' }}>
                        Run this in your Supabase Dashboard → <b>SQL Editor</b> to create tables and RLS security policies.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSqlModal(false)}
                      style={{ background: 'none', border: 'none', color: '#8e8ea0', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
                    <pre style={{
                      background: '#0a0a0c',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#34d399',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto',
                      lineHeight: '1.5'
                    }}>
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                  </div>

                  <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#8e8ea0' }}>
                      Ready to execute in Supabase SQL Editor
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 2500);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: copiedSql ? '#10b981' : '#f37021',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedSql ? '✓ Copied SQL to Clipboard!' : 'Copy SQL Script'}
                      </button>
                      <button
                        onClick={() => setShowSqlModal(false)}
                        style={{ padding: '8px 14px', background: '#1c1d24', color: '#f0f0f4', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Work Experience Timeline</h1>
                <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
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
                  style={{ padding: '10px 18px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add Experience
                </button>
              )}
            </div>

            {/* FORM */}
            {(isCreatingExp || editingExp) && (
              <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                  {editingExp ? 'Edit Experience' : 'New Experience Item'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Role / Title</label>
                    <input
                      type="text"
                      value={expFormData.role || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, role: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Company &amp; Location</label>
                    <input
                      type="text"
                      value={expFormData.company || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Dates</label>
                    <input
                      type="text"
                      value={expFormData.dates || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, dates: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
                    <input
                      type="checkbox"
                      id="currentRoleCheckbox"
                      checked={expFormData.current || false}
                      onChange={(e) => setExpFormData({ ...expFormData, current: e.target.checked })}
                    />
                    <label htmlFor="currentRoleCheckbox" style={{ fontSize: '13px', cursor: 'pointer' }}>Current active position</label>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Description</label>
                    <textarea
                      rows={3}
                      value={expFormData.description || ''}
                      onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Skills &amp; Tags (comma separated)</label>
                    <input
                      type="text"
                      value={expTagsInput}
                      onChange={(e) => setExpTagsInput(e.target.value)}
                      placeholder="UI Design, User Flows, Figma, Design Systems"
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '18px', display: 'flex', gap: '12px' }}>
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
                    style={{ padding: '8px 18px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Save Experience
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingExp(false);
                      setEditingExp(null);
                    }}
                    style={{ padding: '8px 18px', background: '#1a1b22', color: '#8e8ea0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experience.map((item) => (
                <div key={item.id} style={{ padding: '20px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{item.role}</h3>
                      {item.current && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(243, 112, 33, 0.2)', color: '#f37021', fontWeight: 700 }}>CURRENT</span>
                      )}
                    </div>
                    <div style={{ color: '#8e8ea0', fontSize: '13px', marginTop: '2px' }}>{item.company} · {item.dates}</div>
                    <p style={{ color: '#c4c4d0', fontSize: '13px', marginTop: '8px', maxWidth: '700px' }}>{item.description}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {item.tags.map((t, i) => (
                        <span key={i} style={{ padding: '2px 8px', background: '#1a1b22', borderRadius: '4px', fontSize: '11px', color: '#8e8ea0' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingExp(item);
                        setExpFormData(item);
                        setExpTagsInput(item.tags.join(', '));
                        setIsCreatingExp(false);
                      }}
                      style={{ padding: '6px 12px', background: '#1a1b22', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f4', borderRadius: '4px', cursor: 'pointer' }}
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
                      style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}
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
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Education &amp; Languages</h1>
              <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                Academic degree information, listed spoken languages, and communication skills.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{edu.title}</h3>
                      <div style={{ color: '#8e8ea0', fontSize: '13px', marginTop: '4px' }}>{edu.institution} · {edu.location}</div>
                      <p style={{ color: '#c4c4d0', fontSize: '13px', marginTop: '8px' }}>{edu.description}</p>
                    </div>
                    <span style={{ padding: '4px 10px', background: '#1a1b22', borderRadius: '4px', fontSize: '12px', color: '#f37021', fontWeight: 600 }}>
                      {edu.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {edu.tags.map((t, idx) => (
                      <span key={idx} style={{ padding: '3px 8px', background: '#101115', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '11px', color: '#8e8ea0' }}>
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
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Media Asset Library</h1>
              <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                Images and videos used across home, projects, and case study pages.
              </p>
            </div>

            <div style={{ padding: '24px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Add New Asset Link</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', marginBottom: '6px' }}>Asset Name / Label</label>
                  <input
                    type="text"
                    value={newMediaName}
                    onChange={(e) => setNewMediaName(e.target.value)}
                    placeholder="e.g. Dashboard preview screenshot"
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', marginBottom: '6px' }}>Image or Video URL</label>
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="/assets/media/... or https://..."
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
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
                  style={{ padding: '10px 20px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Add Asset
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {media.map((item) => (
                <div key={item.id} style={{ background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '140px', background: '#0a0a0c', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      alt={item.name}
                      src={item.url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/media/home-media-03-d6c887bed8af.webp';
                      }}
                    />
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f4' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#8e8ea0', marginTop: '2px', wordBreak: 'break-all' }}>{item.url}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(item.url);
                          showNotice('Copied URL to clipboard');
                        }}
                        style={{ padding: '4px 8px', background: '#1a1b22', border: '1px solid rgba(255,255,255,0.08)', color: '#8e8ea0', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => {
                          deleteMedia(item.id);
                          showNotice('Deleted asset');
                        }}
                        style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
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
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>SEO &amp; Open Graph Metadata</h1>
              <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                Search engine optimization, social cards, and crawl instructions.
              </p>
            </div>

            <div style={{ padding: '28px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Site Title</label>
                  <input
                    type="text"
                    value={settings.seo.title}
                    onChange={(e) => updateSettings({ seo: { ...settings.seo, title: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.seo.description}
                    onChange={(e) => updateSettings({ seo: { ...settings.seo, description: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Canonical URL</label>
                  <input
                    type="text"
                    value={settings.seo.canonicalUrl}
                    onChange={(e) => updateSettings({ seo: { ...settings.seo, canonicalUrl: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Open Graph Image URL</label>
                  <input
                    type="text"
                    value={settings.seo.ogImage}
                    onChange={(e) => updateSettings({ seo: { ...settings.seo, ogImage: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => showNotice('SEO metadata updated successfully.')}
                  style={{ padding: '10px 24px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
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
