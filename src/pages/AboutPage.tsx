import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { initialSiteSettings } from '../data/initialData';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings, experience, education } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  const aboutSections = { ...initialSiteSettings.aboutSections, ...(settings.aboutSections || {}) };
  const aboutOrder = settings.aboutSectionOrder || initialSiteSettings.aboutSectionOrder;
  const [activeAboutTab, setActiveAboutTab] = useState<'about-profile' | 'about-experience' | 'about-education'>('about-profile');

  const handleScrollTo = (id: 'about-profile' | 'about-experience' | 'about-education') => {
    setActiveAboutTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-view route-entered" data-page="about" id="aboutView">
      <main id="aboutPage" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px' }}>
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
                  src="/assets/media/about-profile-video.mp4"
                >
                  <source src="/assets/media/about-profile-video.mp4" type="video/mp4" />
                </video>
                <div className="about-visual-footer">
                  <div className="about-visual-caption">{copy.aboutCaption}</div>
                  <nav aria-label="About section shortcuts" className="about-visual-status">
                    <button className={activeAboutTab === 'about-profile' ? 'is-active' : ''} onClick={() => handleScrollTo('about-profile')} type="button">{copy.aboutNavAbout}</button>
                    <button className={activeAboutTab === 'about-experience' ? 'is-active' : ''} onClick={() => handleScrollTo('about-experience')} type="button">{copy.aboutNavExperience}</button>
                    <button className={activeAboutTab === 'about-education' ? 'is-active' : ''} onClick={() => handleScrollTo('about-education')} type="button">{copy.aboutNavEducation}</button>
                  </nav>
                </div>
              </aside>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <a
                  aria-label="Download Yogendra Chaudhary CV"
                  className="about-cv-button"
                  href={settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{copy.downloadCv}</span>
                  <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
                    download
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
                <h1 className="display display-lg">{copy.aboutHeading}</h1>
                <p className="lead">
                  {settings.aboutIntro ?? initialSiteSettings.aboutIntro}
                </p>
                <p style={{ marginTop: '16px', color: '#8e8ea0', lineHeight: 1.7 }}>
                  Based in {settings.location || initialSiteSettings.location}, {settings.aboutDetails ?? initialSiteSettings.aboutDetails}
                </p>
              </section>

              <section className="about-panel about-experience-panel" id="about-experience" style={{ display: aboutSections.experience ? undefined : 'none', order: aboutOrder.indexOf('experience'), marginTop: '48px' }}>
                <div className="about-panel-head">
                  <h2 className="display display-md">{copy.experienceHeading}</h2>
                </div>
                <div className="timeline about-timeline" style={{ marginTop: '24px' }}>
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
                    </article>
                  ))}
                </div>
              </section>

              <section className="about-panel about-education-panel" id="about-education" style={{ display: aboutSections.education ? undefined : 'none', order: aboutOrder.indexOf('education'), marginTop: '48px' }}>
                <div className="about-panel-head">
                  <h2 className="display display-md">{copy.educationHeading}</h2>
                </div>
                <div className="education-list" style={{ marginTop: '24px' }}>
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
      </main>
    </div>
  );
};

