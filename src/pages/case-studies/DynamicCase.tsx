import React from 'react';
import { Project } from '../../types';

interface DynamicCaseProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const DynamicCase: React.FC<DynamicCaseProps> = ({ project, onNavigate }) => {
  return (
    <div className="page-view route-entered" data-page="dynamic-case">
      <div className="case-main" style={{ paddingTop: '100px', minHeight: '80vh', paddingBottom: '80px' }}>
        <div className="case-backbar">
          <div className="shell">
            <a
              className="case-back"
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/projects');
              }}
            >
              <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
                arrow_back
              </span>{' '}
              Back to Selected Work
            </a>
          </div>
        </div>

        <section className="case-hero work-hero" style={{ position: 'relative', overflow: 'hidden' }}>
          {project.coverImage && (
            <div aria-hidden="true" className="work-hero-media hero-has-asset">
              <img
                alt={project.title}
                className="hero-asset-image"
                src={project.coverImage}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <div className="shell grid">
            <div className="case-hero-copy">
              <span className="case-stage-label">
                <span className="case-stage-type">{project.categoryLabel || 'Case Study'}</span>
                <i aria-hidden="true" className="case-stage-separator">·</i>
                <span className="case-stage-status">{project.year || '2026'}</span>
              </span>
              <h1>{project.title}</h1>
              <p className="lead">{project.summary}</p>
            </div>
            <dl className="case-hero-meta portfolio-hero-meta-grid">
              <div><dt>Project</dt><dd>{project.title}</dd></div>
              <div><dt>Category</dt><dd>{project.category === 'product' ? 'Product Design' : 'Design Practice'}</dd></div>
              <div><dt>Year</dt><dd>{project.year}</dd></div>
              <div><dt>Status</dt><dd>{project.status}</dd></div>
            </dl>
          </div>
        </section>

        <section className="case-section case-story-section">
          <div className="shell case-story-grid">
            <div className="case-story-head">
              <h2>Project Overview</h2>
              <p>{project.mediaNote || 'Case study overview and design highlights'}</p>
            </div>
            <div className="case-story-content">
              <p className="lead">{project.summary}</p>

              {project.contentBlocks && project.contentBlocks.length > 0 ? (
                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {project.contentBlocks.map((block) => (
                    <div key={block.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                      {block.title && <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#f37021' }}>{block.title}</h3>}
                      {block.text && <p style={{ color: '#8e8ea0', lineHeight: 1.7 }}>{block.text}</p>}
                      {block.imageUrl && (
                        <figure style={{ marginTop: '16px' }}>
                          <img
                            alt={block.imageCaption || 'Project visual'}
                            src={block.imageUrl}
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}
                          />
                          {block.imageCaption && (
                            <figcaption style={{ fontSize: '12px', color: '#5c5c6e', marginTop: '6px' }}>
                              {block.imageCaption}
                            </figcaption>
                          )}
                        </figure>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#f0f0f4', marginBottom: '8px' }}>Design Practice &amp; Methodology</h3>
                  <p style={{ color: '#8e8ea0', lineHeight: 1.6 }}>
                    This project was created through the portfolio CMS. It incorporates state-aware interaction patterns, clear hierarchy, and design specifications prepared for developer handoff.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* EXPLORE OTHER PROJECTS */}
        <section aria-labelledby="dynamic-other-projects" className="case-explore">
          <div className="shell">
            <div className="case-explore-top">
              <div>
                <span className="eyebrow">Continue exploring</span>
                <h2 id="dynamic-other-projects">Explore other projects.</h2>
              </div>
              <a
                className="case-explore-home"
                href="/projects"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/projects');
                }}
              >
                All selected work{' '}
                <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
                  arrow_outward
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
