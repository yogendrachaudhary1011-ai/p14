import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { initialSiteSettings } from '../data/initialData';
import { IdCard } from '../components/home/IdCard';
import { getGmailComposeUrl } from '../utils/emailUtils';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { settings, projects, experience, education, isAdmin } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  const contactEmail = settings.email || 'yogendrachaudhary2061@gmail.com';
  const sections = { ...initialSiteSettings.homeSections, ...(settings.homeSections || {}) };
  const aboutSections = { ...initialSiteSettings.aboutSections, ...(settings.aboutSections || {}) };
  const aboutOrder = settings.aboutSectionOrder || initialSiteSettings.aboutSectionOrder;
  const aboutVideo = settings.aboutVideo || '/assets/media/about-profile-video.mp4';
  const [filter, setFilter] = useState<'all' | 'product' | 'archive'>('all');
  const [activeAboutTab, setActiveAboutTab] = useState<'about-profile' | 'about-experience' | 'about-education'>('about-profile');

  const filteredProjects = projects
    .filter(p => p.status === 'published')
    .filter(p => filter === 'all' || p.category === filter)
    .sort((a, b) => a.order - b.order);

  const phraseGroups = [copy.heroDescription];

  // Calculate cumulative words and delays
  let currentDelay = 0.34;
  const renderedPhrases = phraseGroups.map((phrase, groupIdx) => {
    const words = phrase.split(/\s+/).filter(Boolean);
    const wordsWithDelay = words.map((word) => {
      const delay = currentDelay;
      currentDelay += 0.055;
      return { word, delay };
    });
    return {
      id: groupIdx + 1,
      phrase,
      words: wordsWithDelay
    };
  });

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // 1. Sync title role width with name width
    const syncHomeRoleWidth = () => {
      const home = document.getElementById('homeView');
      const name = home?.querySelector('.hero-title-line--name');
      if (!home || !name) return;
      const width = Math.ceil(name.getBoundingClientRect().width);
      if (width > 0) home.style.setProperty('--home-name-line-width', `${width}px`);
    };

    const runSync = () => requestAnimationFrame(() => requestAnimationFrame(syncHomeRoleWidth));
    if (document.fonts?.ready) {
      document.fonts.ready.then(runSync);
    }
    runSync();
    window.addEventListener('resize', runSync, { passive: true });
    window.addEventListener('orientationchange', runSync, { passive: true });

    // 2. Scroll effects: hero scroll parallax, timeline progress
    const handleScroll = () => {
      // Hero scroll parallax
      const hero = document.getElementById('home');
      if (hero) {
        const progress = Math.max(0, Math.min(1, window.scrollY / (hero.offsetHeight * 0.9)));
        hero.style.setProperty('--hero-scroll', progress.toFixed(3));
      }

      // Experience timeline dynamic line
      const aboutTimeline = document.querySelector('.about-timeline') as HTMLElement | null;
      if (aboutTimeline) {
        const rect = aboutTimeline.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const trackTop = 11;
        const trackBottom = 0;
        const trackHeight = Math.max(0, rect.height - trackTop - trackBottom);
        const headerHeight = 72;
        const shrinkEndLine = Math.max(headerHeight + 24, viewportHeight * 0.12);
        const fullHoldLine = Math.max(headerHeight + 132, Math.min(viewportHeight * 0.27, 220));
        const presentPoint = rect.top + trackTop;
        const fillRatio =
          presentPoint >= fullHoldLine
            ? 1
            : Math.max(0, Math.min(1, (presentPoint - shrinkEndLine) / (fullHoldLine - shrinkEndLine)));
        const scrollProgress = trackHeight * fillRatio;
        aboutTimeline.style.setProperty('--timeline-progress', `${scrollProgress.toFixed(1)}px`);

        const items = document.querySelectorAll('.about-timeline > .timeline-item');
        let activeIndex = -1;
        items.forEach((item, index) => {
          const itemRect = item.getBoundingClientRect();
          const hasPassed = itemRect.top < viewportHeight * 0.9;
          item.classList.toggle('is-revealed', hasPassed);
          if (hasPassed) activeIndex = index;
        });
        items.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex));
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. About panels active tab intersection observer
    const aboutPanels = document.querySelectorAll('.about-panel[id]');
    const aboutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id as 'about-profile' | 'about-experience' | 'about-education';
            setActiveAboutTab(id);
          }
        });
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0.06 }
    );
    aboutPanels.forEach((panel) => aboutObserver.observe(panel));

    // 4. Reveal on scroll observer
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

    // 5. Parallax on project cards
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const cards = document.querySelectorAll('.project-card');
    const cleanupFns: Array<() => void> = [];

    if (!reduceMotion) {
      cards.forEach((card) => {
        const onCardMove = (e: Event) => {
          const event = e as PointerEvent;
          if (window.matchMedia('(hover: none)').matches) return;
          const rect = (card as HTMLElement).getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
          (card as HTMLElement).style.setProperty('--card-x', `${x.toFixed(2)}px`);
          (card as HTMLElement).style.setProperty('--card-y', `${y.toFixed(2)}px`);
        };
        const onCardLeave = () => {
          (card as HTMLElement).style.setProperty('--card-x', '0px');
          (card as HTMLElement).style.setProperty('--card-y', '0px');
        };
        card.addEventListener('pointermove', onCardMove as EventListener, { passive: true });
        card.addEventListener('pointerleave', onCardLeave);
        cleanupFns.push(() => {
          card.removeEventListener('pointermove', onCardMove as EventListener);
          card.removeEventListener('pointerleave', onCardLeave);
        });
      });
    }

    return () => {
      window.removeEventListener('resize', runSync);
      window.removeEventListener('orientationchange', runSync);
      window.removeEventListener('scroll', handleScroll);
      aboutObserver.disconnect();
      revealObserver.disconnect();
      cleanupFns.forEach((fn) => fn());
    };
  }, [projects, experience]);

  return (
    <div className="page-view route-entered" data-page="home" id="homeView">
      <div id="homePage" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* HERO SECTION */}
        <section className="hero" id="home" style={{ display: sections.hero ? undefined : 'none', order: (settings.homeSectionOrder || initialSiteSettings.homeSectionOrder).indexOf('hero') }}>
          <div className="hero-inner">
            <h1 aria-label={`${copy.heroFirstName} ${copy.heroLastName} — ${copy.heroRole}`} className="hero-title hero-title-static">
              <span className="static-title">
                <span className="hero-title-line hero-title-line--one hero-title-line--name portfolio-v3-title-line">
                  <span className="hero-name-word">{copy.heroFirstName}</span>
                </span>
                <span className="hero-title-line hero-title-line--two portfolio-v3-title-line">
                  {copy.heroLastName} <span className="portfolio-v3-dash" aria-hidden="true"></span>
                </span>
                <span className="hero-title-line hero-title-line--three portfolio-v3-title-line portfolio-v3-title-line--role">
                  {copy.heroRole.split(/\s+/).map((word, index) => <span key={index}>{word}</span>)}
                </span>
              </span>
            </h1>

            <p className="hero-copy" id="heroCopy" aria-label={phraseGroups.join(' ')}>
              {renderedPhrases.map((group) => (
                <span
                  key={group.id}
                  className="highlight-phrase"
                  tabIndex={0}
                  data-highlight-phrase={group.id}
                >
                  {group.words.map((item, idx) => (
                    <span
                      key={idx}
                      className="copy-word"
                      style={{ '--word-delay': `${item.delay.toFixed(3)}s` } as React.CSSProperties}
                    >
                      {item.word}{' '}
                    </span>
                  ))}
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
                {copy.heroAboutButton}{' '}
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
                {copy.heroWorkButton}{' '}
                <span aria-hidden="true" className="arrow material-symbols-rounded material-arrow-icon">
                  south_east
                </span>
              </a>
            </div>
          </div>

          <IdCard />
        </section>

        {/* WORK SECTION */}
        <section className="section" id="work" data-reveal style={{ display: sections.work ? undefined : 'none', order: (settings.homeSectionOrder || initialSiteSettings.homeSectionOrder).indexOf('work') }}>
          <div className="shell">
            <div className="work-top">
              <div>
                <h2 className="display work-title">{copy.workHeading}</h2>
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
                      {copy.filterAll}
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
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f4' }}>{copy.emptyProjectsHeading}</h3>
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
              <div aria-live="polite" className="projects-grid" id="projectsGrid" data-active-filter={filter}>
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
        <section className="section about" id="about" data-reveal style={{ display: sections.about ? undefined : 'none', order: (settings.homeSectionOrder || initialSiteSettings.homeSectionOrder).indexOf('about') }}>
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
                    poster="/assets/media/about-profile-poster.png"
                    src={aboutVideo}
                  >
                    <source src={aboutVideo} type="video/mp4" />
                  </video>
                  <div className="about-visual-footer">
                    <div className="about-visual-caption">{copy.aboutCaption}</div>
                    <nav aria-label="About section shortcuts" className="about-visual-status">
                      <button
                        className={activeAboutTab === 'about-profile' ? 'is-active' : ''}
                        onClick={() => {
                          setActiveAboutTab('about-profile');
                          handleScrollTo('about-profile');
                        }}
                        type="button"
                      >
                        {copy.aboutNavAbout}
                      </button>
                      <button
                        className={activeAboutTab === 'about-experience' ? 'is-active' : ''}
                        onClick={() => {
                          setActiveAboutTab('about-experience');
                          handleScrollTo('about-experience');
                        }}
                        type="button"
                      >
                        {copy.aboutNavExperience}
                      </button>
                      <button
                        className={activeAboutTab === 'about-education' ? 'is-active' : ''}
                        onClick={() => {
                          setActiveAboutTab('about-education');
                          handleScrollTo('about-education');
                        }}
                        type="button"
                      >
                        {copy.aboutNavEducation}
                      </button>
                    </nav>
                  </div>
                </aside>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <a
                    aria-label="View Yogendra Chaudhary resume"
                    className="about-cv-button"
                    href={settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{copy.viewResume}</span>
                    <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
                      open_in_new
                    </span>
                  </a>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a
                      aria-label="Yogendra on Behance"
                      className="about-cv-button"
                      style={{ minHeight: '40px', padding: '0 12px', fontSize: '11px', textDecoration: 'none' }}
                      href={(settings.behanceUrl && settings.behanceUrl.includes('yogendrachaudhary1')) ? settings.behanceUrl : 'https://www.behance.net/yogendrachaudhary1'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{copy.behance}</span>
                      <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon" style={{ fontSize: '14px' }}>
                        arrow_outward
                      </span>
                    </a>
                    <a
                      aria-label="Yogendra on LinkedIn"
                      className="about-cv-button"
                      style={{ minHeight: '40px', padding: '0 12px', fontSize: '11px', textDecoration: 'none' }}
                      href={settings.linkedinUrl ? (settings.linkedinUrl.startsWith('http') ? settings.linkedinUrl : `https://${settings.linkedinUrl}`) : 'https://www.linkedin.com/in/yogendrach'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{copy.linkedIn}</span>
                      <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon" style={{ fontSize: '14px' }}>
                        arrow_outward
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="about-scroll-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <section className="about-panel about-profile-panel" id="about-profile" style={{ display: aboutSections.profile ? undefined : 'none', order: aboutOrder.indexOf('profile') }}>
                  <h2 className="display display-lg">{copy.aboutHeading}</h2>
                  <p className="lead">
                    {settings.aboutIntro ?? initialSiteSettings.aboutIntro}
                  </p>
                  <p style={{ marginTop: '16px', color: '#8e8ea0', lineHeight: 1.7 }}>
                    Based in {settings.location || initialSiteSettings.location}, {settings.aboutDetails ?? initialSiteSettings.aboutDetails}
                  </p>
                </section>

                <section className="about-panel about-experience-panel" id="about-experience" style={{ display: aboutSections.experience ? undefined : 'none', order: aboutOrder.indexOf('experience') }}>
                  <div className="about-panel-head">
                    <h3 className="display display-md">{copy.experienceHeading}</h3>
                  </div>
                  <div className="timeline about-timeline">
                    {experience.filter(e => e.visible).map((item) => (
                      <article key={item.id} className={`timeline-item ${item.current ? 'current' : ''}`}>
                        {item.current && (
                          <>
                            <span className="timeline-present-label">{copy.currentLabel}</span>
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
                        {!!(item.certificates?.length || (item.id === experience.find((entry) => entry.visible)?.id && settings.certificates?.length)) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                            {(item.certificates ?? (item.id === experience.find((entry) => entry.visible)?.id ? settings.certificates : []) ?? []).map((certificate) => (
                              <a key={certificate.id} className="about-cv-button" href={certificate.url} target="_blank" rel="noopener noreferrer" style={{ minHeight: '40px', textDecoration: 'none' }}>
                                <span>{certificate.title} · View certificate</span>
                                <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">open_in_new</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>

                <section className="about-panel about-education-panel" id="about-education" style={{ display: aboutSections.education ? undefined : 'none', order: aboutOrder.indexOf('education') }}>
                  <div className="about-panel-head">
                    <h3 className="display display-md">{copy.educationHeading}</h3>
                  </div>
                  <div className="education-list">
                    {education.filter(e => e.visible).map((edu) => (
                      <article key={edu.id} className="education-item">
                        <div className="education-main">
                          <h3>{edu.title}</h3>
                          <div className="education-institution">{edu.institution}{edu.location ? ` · ${edu.location}` : ''}</div>
                          <p className="education-desc">{edu.description}</p>
                          <div className="tag-row">
                            {edu.tags.map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
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

        {/* BOTTOM CONNECT CTA SECTION */}
        <section className="connect-fill" style={{ display: sections.connect ? undefined : 'none', order: (settings.homeSectionOrder || initialSiteSettings.homeSectionOrder).indexOf('connect') }}>
          <a
            aria-label={`Let's connect by email at ${contactEmail}`}
            className="connect-fill-link"
            href={getGmailComposeUrl(contactEmail)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="connect-fill-inner">
              <span className="connect-fill-copy">
                <span className="connect-fill-label">{copy.connectHeading}</span>
                <span className="connect-fill-email">Email me at {contactEmail}</span>
              </span>
              <span aria-hidden="true" className="connect-fill-arrow">
                arrow_outward
              </span>
            </div>
          </a>
        </section>
      </div>
    </div>
  );
};

