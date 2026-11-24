import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { initialSiteSettings } from '../data/initialData';
import { getInstantFallbackSvg } from '../utils/media';
import { useCompressedLandingImage } from '../utils/landingMediaCompression';

const ProjectGridCover: React.FC<{
  src?: string;
  title: string;
  coverClass?: string;
  index: number;
}> = ({ src, title, coverClass, index }) => {
  const compressedSrc = useCompressedLandingImage(src, 900);
  return (
    <img
      alt={title}
      className={`project-cover ${coverClass || ''}`}
      decoding="async"
      loading={index < 2 ? 'eager' : 'lazy'}
      fetchPriority="auto"
      width={900}
      height={1200}
      src={compressedSrc || getInstantFallbackSvg(title)}
      onError={(e) => {
        if (src && e.currentTarget.src !== src && !e.currentTarget.dataset.originalTried) {
          e.currentTarget.dataset.originalTried = '1';
          e.currentTarget.src = src;
          return;
        }
        e.currentTarget.src = getInstantFallbackSvg(title);
      }}
    />
  );
};

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { projects, isAdmin, settings } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  const [filter, setFilter] = useState<'all' | 'product' | 'archive'>('all');

  const publishedProjects = useMemo(
    () => projects.filter((p) => p.status === 'published'),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    return publishedProjects
      .filter((p) => filter === 'all' || p.category === filter)
      .sort((a, b) => a.order - b.order);
  }, [publishedProjects, filter]);

  return (
    <div className="page-view route-entered" data-page="projects" id="projectsView">
      <main id="projectsPage" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px' }}>
        <div className="shell">
          <div className="case-backbar" style={{ marginBottom: '32px' }}>
            <a
              className="case-back"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
            >
              <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
                arrow_back
              </span>{' '}
              {copy.backToOverview}
            </a>
          </div>

          <div className="work-top">
            <div>
              <span className="eyebrow orange">{copy.workHeading}</span>
              <h1 className="display work-title" style={{ marginTop: '12px' }}>
                {copy.workHeading}
              </h1>
            </div>
            <div className="work-top-side">
              <p className="work-intro">
                {copy.workDescription}
              </p>
              {projects.length > 0 && (
                <div aria-label="Filter selected work" className="filter-row" role="group">
                  <button
                    aria-pressed={filter === 'all'}
                    className={`filter ${filter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setFilter('all')}
                    type="button"
                  >
                    {copy.filterAll} ({publishedProjects.length})
                  </button>
                  <button
                    aria-pressed={filter === 'product'}
                    className={`filter ${filter === 'product' ? 'is-active' : ''}`}
                    onClick={() => setFilter('product')}
                    type="button"
                  >
                    {copy.filterProduct}
                  </button>
                  <button
                    aria-pressed={filter === 'archive'}
                    className={`filter ${filter === 'archive' ? 'is-active' : ''}`}
                    onClick={() => setFilter('archive')}
                    type="button"
                  >
                    {copy.filterArchive}
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div
              style={{
                marginTop: '48px',
                padding: '60px 32px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.12)',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>📁</div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f4' }}>{copy.emptyProjectsHeading}</h2>
              <p style={{ color: '#8e8ea0', fontSize: '14px', maxWidth: '440px', margin: '8px auto 20px', lineHeight: 1.6 }}>
                {copy.emptyProjectsDescription}
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin')}
                  style={{
                    padding: '10px 20px',
                    background: '#f37021',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {copy.emptyProjectsButton}
                </button>
              )}
            </div>
          ) : (
            <div aria-live="polite" className="projects-grid" id="projectsGrid" style={{ marginTop: '40px' }}>
              {filteredProjects.map((project, index) => (
                <article key={project.id} className="project" data-category={project.category}>
                  <a
                    aria-label={`Open ${project.title} case study`}
                    className="project-card"
                    href={project.route}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(project.route);
                    }}
                  >
                    <div className="project-media">
                      <span aria-hidden="true" className="media-action material-symbols-rounded material-arrow-icon">
                        arrow_outward
                      </span>
                      <ProjectGridCover
                        src={project.coverImage}
                        title={project.title}
                        coverClass={project.coverClass}
                        index={index}
                      />
                    </div>
                    <div className="project-copy">
                      <div className="project-meta">
                        <span>{project.categoryLabel}</span>
                        <span>{project.year}</span>
                      </div>
                      <h3>{project.title}</h3>
                      <p>
                        <strong>{project.summary}</strong>
                      </p>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
