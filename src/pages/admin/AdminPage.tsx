import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project, ExperienceItem, EducationItem } from '../../types';

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
    login,
    logout,
    updateSettings,
    addProject,
    updateProject,
    deleteProject,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Projects &amp; Case Studies</h1>
                <p style={{ color: '#8e8ea0', fontSize: '14px', marginTop: '4px' }}>
                  Manage portfolio case studies, visibility, metadata, and custom routes.
                </p>
              </div>
              {!isCreatingProject && !editingProject && (
                <button
                  onClick={() => {
                    setIsCreatingProject(true);
                    setProjectFormData({
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
                  }}
                  style={{ padding: '10px 18px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Create New Project
                </button>
              )}
            </div>

            {/* CREATE / EDIT FORM */}
            {(isCreatingProject || editingProject) && (
              <div style={{ padding: '28px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                  {editingProject ? `Edit: ${editingProject.title}` : 'Add New Portfolio Project'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Project Title</label>
                    <input
                      type="text"
                      value={projectFormData.title || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>URL Slug</label>
                    <input
                      type="text"
                      value={projectFormData.slug || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, slug: e.target.value })}
                      placeholder="e.g. mobile-banking-redesign"
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Category</label>
                    <select
                      value={projectFormData.category || 'product'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, category: e.target.value as any })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    >
                      <option value="product">Product Design</option>
                      <option value="archive">Design Practice</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Category Label</label>
                    <input
                      type="text"
                      value={projectFormData.categoryLabel || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, categoryLabel: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Cover Image URL</label>
                    <input
                      type="text"
                      value={projectFormData.coverImage || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, coverImage: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Year</label>
                    <input
                      type="text"
                      value={projectFormData.year || '2026'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, year: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Hero Subtitle (Appears beside large title)</label>
                    <textarea
                      rows={2}
                      value={projectFormData.heroSubtitle || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, heroSubtitle: e.target.value })}
                      placeholder="e.g. A case study on designing the complete web and mobile experience..."
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>My Role</label>
                    <input
                      type="text"
                      value={projectFormData.role || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, role: e.target.value })}
                      placeholder="e.g. UI/UX & Product Designer"
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Duration</label>
                    <input
                      type="text"
                      value={projectFormData.duration || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, duration: e.target.value })}
                      placeholder="e.g. 1 Month"
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Figma File URL</label>
                    <input
                      type="text"
                      value={projectFormData.figmaUrl || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, figmaUrl: e.target.value })}
                      placeholder="https://www.figma.com/file/..."
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Deliverables (1 per line)</label>
                    <textarea
                      rows={3}
                      value={Array.isArray(projectFormData.deliverables) ? projectFormData.deliverables.join('\n') : (projectFormData.deliverables || '')}
                      onChange={(e) => setProjectFormData({ ...projectFormData, deliverables: e.target.value.split('\n').filter(Boolean) as any })}
                      placeholder="87 screens and states in Figma&#10;81 component variants&#10;Desktop (1440 px) and mobile (428 px)"
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8e8ea0', textTransform: 'uppercase', marginBottom: '6px' }}>Lead Summary / Project Overview</label>
                    <textarea
                      rows={3}
                      value={projectFormData.summary || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, summary: e.target.value })}
                      placeholder="Overview paragraph describing the organization, goals, and design scope..."
                      style={{ width: '100%', padding: '10px 12px', background: '#101115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#f0f0f4' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      if (!projectFormData.title || !projectFormData.slug) {
                        alert('Title and Slug are required');
                        return;
                      }
                      if (editingProject) {
                        updateProject(editingProject.id, projectFormData);
                        showNotice(`Updated project: ${projectFormData.title}`);
                        setEditingProject(null);
                      } else {
                        addProject(projectFormData as any);
                        showNotice(`Created new project: ${projectFormData.title}`);
                        setIsCreatingProject(false);
                      }
                    }}
                    style={{ padding: '10px 20px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Save Project
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingProject(false);
                      setEditingProject(null);
                    }}
                    style={{ padding: '10px 20px', background: '#1a1b22', color: '#8e8ea0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* PROJECTS LIST TABLE */}
            {projects.length === 0 ? (
              <div style={{ padding: '40px', background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ color: '#8e8ea0', fontSize: '14px' }}>No projects in CMS. All projects were removed.</p>
                <button
                  onClick={() => setIsCreatingProject(true)}
                  style={{ marginTop: '12px', padding: '8px 16px', background: '#f37021', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Create First Project
                </button>
              </div>
            ) : (
            <div style={{ background: '#131418', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Permanently delete all projects? This cannot be undone.')) {
                      deleteAllProjects();
                      showNotice('All projects permanently deleted.');
                    }
                  }}
                  style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Delete All Projects Permanently
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#181920', color: '#8e8ea0' }}>
                    <th style={{ padding: '14px 20px' }}>Project</th>
                    <th style={{ padding: '14px 20px' }}>Category</th>
                    <th style={{ padding: '14px 20px' }}>Slug / Route</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr key={proj.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            alt=""
                            src={proj.coverImage}
                            style={{ width: '44px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#f0f0f4' }}>{proj.title}</div>
                            <div style={{ fontSize: '11px', color: '#8e8ea0' }}>{proj.year}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#8e8ea0' }}>{proj.categoryLabel}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#f37021' }}>{proj.route}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: proj.status === 'published' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: proj.status === 'published' ? '#10b981' : '#f59e0b' }}>
                          {proj.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setProjectFormData(proj);
                            setIsCreatingProject(false);
                          }}
                          style={{ padding: '6px 12px', background: '#1a1b22', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f4', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete project "${proj.title}"?`)) {
                              deleteProject(proj.id);
                              showNotice(`Deleted ${proj.title}`);
                            }
                          }}
                          style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
