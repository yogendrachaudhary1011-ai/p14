import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { IdCard } from '../components/home/IdCard';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { settings, projects, experience, education, isAdmin } = usePortfolio();
  const [filter, setFilter] = useState<'all' | 'product' | 'archive'>('all');
  const [activeAboutTab, setActiveAboutTab] = useState<'about-profile' | 'about-experience' | 'about-education'>('about-profile');

  const filteredProjects = projects
    .filter(p => p.status === 'published')
    .filter(p => filter === 'all' || p.category === filter)
    .sort((a, b) => a.order - b.order);

  const heroWords = [
    'A', 'UI/UX', 'and', 'Product', 'Designer', 'focused', 'on', 'intuitive', 'software',
    'interfaces,', 'reusable', 'components,', 'and', 'user-centered', 'workflows—turning',
    'complex', 'product', 'requirements', 'into', 'clear,', 'usable', 'experiences', 'that',
    'people', 'can', 'navigate', 'with', 'confidence.'
  ];

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-view route-entered" data-page="home" id="homeView">
      <div id="homePage">
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero-inner">
            <div className="hero-kicker eyebrow">Portfolio / UI/UX &amp; Product Design</div>
            <h1 aria-label="Yogendra Chaudhary — UI/UX & Product Designer" className="hero-title hero-title-static">
              <span className="static-title">
                <span className="hero-title-line hero-title-line--one hero-title-line--name">
                  <span className="hero-name-word">YOGENDRA</span>
                  <span className="hero-name-word">CHAUDHARY</span>
                </span>
                <span className="hero-title-line hero-title-line--two">UI/UX <i aria-hidden="true">—</i></span>
                <span className="hero-title-line hero-title-line--three">
                  <b><span>PRODUCT</span><span>DESIGNER</span></b>
                </span>
              </span>
            </h1>

            <p className="hero-copy" id="heroCopy">
              {heroWords.map((word, idx) => (
                <span
                  key={idx}
                  className="copy-word"
                  style={{ '--word-delay': `${(0.34 + idx * 0.055).toFixed(3)}s` } as React.CSSProperties}
                >
                  {word}{' '}
                </span>
              ))}
            </p>

            <div className="hero-actions">
              <a
                className="button primary"
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo('about');
                }}
              >
                Get to Know Me{' '}
                <span aria-hidden="true" className="arrow material-symbols-rounded material-arrow-icon">
                  south_east
                </span>
              </a>
              <a
                className="button secondary"
                href="/projects"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/projects');
                }}
              >
                Work Overview{' '}
                <span aria-hidden="true" className="arrow material-symbols-rounded material-arrow-icon">
                  south_east
                </span>
              </a>
            </div>
          </div>

          <IdCard />
        </section>

        {/* WORK SECTION */}
        <section className="section" id="work">
          <div className="shell">
            <div className="work-top">
              <div>
                <span className="eyebrow">Selected work</span>
                <h2 className="display work-title">SELECTED WORK</h2>
              </div>
              <div className="work-top-side">
                <p className="work-intro">
                  Product design work across business software, web experiences, and service platforms.
                </p>
                {projects.length > 0 && (
                  <div aria-label="Filter selected work" className="filter-row" role="group">
                    <button
                      aria-pressed={filter === 'all'}
                      className={`filter ${filter === 'all' ? 'is-active' : ''}`}
                      onClick={() => setFilter('all')}
                      type="button"
                    >
                      All
                    </button>
                    <button
                      aria-pressed={filter === 'product'}
                      className={`filter ${filter === 'product' ? 'is-active' : ''}`}
                      onClick={() => setFilter('product')}
                      type="button"
                    >
                      Product Design
                    </button>
                    <button
                      aria-pressed={filter === 'archive'}
                      className={`filter ${filter === 'archive' ? 'is-active' : ''}`}
                      onClick={() => setFilter('archive')}
                      type="button"
                    >
                      Design Practice
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
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f4' }}>No projects currently published</h3>
                <p style={{ color: '#8e8ea0', fontSize: '14px', maxWidth: '440px', margin: '8px auto 20px', lineHeight: 1.6 }}>
                  All previous projects have been permanently removed. New case studies can be created anytime via the Admin CMS.
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
                    + Open CMS to Add Project
                  </button>
                )}
              </div>
            ) : (
              <div aria-live="polite" className="projects-grid" id="projectsGrid">
                {filteredProjects.map((project) => (
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
                        <span className="media-note">{project.mediaNote}</span>
                        <span aria-hidden="true" className="media-action material-symbols-rounded material-arrow-icon">
                          arrow_outward
                        </span>
                        <img
                          alt={project.title}
                          className={`project-cover ${project.coverClass || ''}`}
                          decoding="async"
                          loading="lazy"
                          src={project.coverImage}
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
        </section>

        {/* ABOUT SECTION */}
        <section className="section about" id="about">
          <div className="shell">
            <div className="about-journey">
              <div className="about-media-stack">
                <aside
                  aria-label="Profile media for Yogendra"
                  className="about-visual about-sticky-visual has-about-media"
                  role="img"
                >
                  <video
                    aria-hidden="true"
                    autoPlay
                    className="about-visual-media"
                    loop
                    muted
                    playsInline
                    poster="/assets/media/home-media-11-2c67061de865.webp"
                    src="/assets/media/home-media-10-7f38a3b02f4c.webm"
                  ></video>
                  <div className="about-visual-caption">Yogendra / flows → interfaces → products</div>
                  <nav aria-label="About section shortcuts" className="about-visual-status">
                    <button
                      className={activeAboutTab === 'about-profile' ? 'is-active' : ''}
                      onClick={() => {
                        setActiveAboutTab('about-profile');
                        handleScrollTo('about-profile');
                      }}
                      type="button"
                    >
                      01 / About
                    </button>
                    <button
                      className={activeAboutTab === 'about-experience' ? 'is-active' : ''}
                      onClick={() => {
                        setActiveAboutTab('about-experience');
                        handleScrollTo('about-experience');
                      }}
                      type="button"
                    >
                      02 / Experience
                    </button>
                    <button
                      className={activeAboutTab === 'about-education' ? 'is-active' : ''}
                      onClick={() => {
                        setActiveAboutTab('about-education');
                        handleScrollTo('about-education');
                      }}
                      type="button"
                    >
                      03 / Education &amp; Languages
                    </button>
                  </nav>
                </aside>

                <a
                  aria-label="Download Yogendra Chaudhary CV"
                  className="about-cv-button"
                  href={settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Download CV</span>
                  <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
                    download
                  </span>
                </a>
              </div>

              <div className="about-scroll-content">
                <section className="about-panel about-profile-panel" id="about-profile">
                  <span className="eyebrow orange">About me</span>
                  <h2 className="display display-lg" style={{ marginTop: '19px' }}>
                    A UI/UX and Product Designer focused on clear software experiences.
                  </h2>
                  <p className="lead">
                    I design intuitive software interfaces, reusable UI components, and user-centered workflows. My process combines interaction design, usability testing, and close developer collaboration to make complex products easier to understand and use.
                  </p>
                </section>

                <section className="about-panel about-experience-panel" id="about-experience">
                  <div className="about-panel-head">
                    <span className="eyebrow">Experience</span>
                    <h3 className="display display-md">Experience</h3>
                  </div>
                  <div className="timeline about-timeline">
                    {experience.filter(e => e.visible).map((item) => (
                      <article key={item.id} className={`timeline-item ${item.current ? 'current' : ''}`}>
                        {item.current && (
                          <>
                            <span className="timeline-present-label">CURRENT</span>
                            <span aria-hidden="true" className="timeline-present-pulse"></span>
                          </>
                        )}
                        <div className="timeline-meta">
                          <div className="timeline-date">{item.dates}</div>
                          {item.duration && (
                            <span aria-label="Employment duration" className="timeline-duration">
                              {item.duration}
                            </span>
                          )}
                        </div>
                        <div className="timeline-title">
                          <h3>{item.role}</h3>
                          <span>{item.company}</span>
                        </div>
                        <p className="timeline-desc">
                          {item.headline && <b>{item.headline} </b>}
                          {item.description}
                        </p>
                        <div className="tag-row">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="tag skill">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="about-panel about-education-panel" id="about-education">
                  <div className="about-panel-head">
                    <span className="eyebrow orange">Education &amp; Languages</span>
                    <h3 className="display display-md">Education &amp; Languages</h3>
                  </div>
                  <div className="education-list">
                    {education.filter(e => e.visible).map((edu) => (
                      <article key={edu.id} className="education-item">
                        <div className="education-main">
                          <h3>{edu.title}</h3>
                          <div className="education-institution">{edu.institution}</div>
                          <p className="education-desc">{edu.description}</p>
                          <div className="tag-row">
                            {edu.tags.map((t, idx) => (
                              <span key={idx} className="tag">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="education-aside">
                          <div className="education-badge">{edu.status}</div>
                          <div className="education-dates">{edu.dates}</div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
