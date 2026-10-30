import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings, experience, education } = usePortfolio();

  return (
    <div className="page-view route-entered" data-page="about" id="aboutView">
      <main id="aboutPage" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px' }}>
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
              Back to Overview
            </a>
          </div>

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
                <h1 className="display display-lg" style={{ marginTop: '19px' }}>
                  A UI/UX and Product Designer focused on clear software experiences.
                </h1>
                <p className="lead" style={{ marginTop: '16px' }}>
                  I design intuitive software interfaces, reusable UI components, and user-centered workflows. My process combines interaction design, usability testing, and close developer collaboration to make complex products easier to understand and use.
                </p>
                <p style={{ marginTop: '16px', color: '#8e8ea0', lineHeight: 1.7 }}>
                  Based in Kathmandu, Nepal, I work on multi-step workflows, enterprise software, service platforms, and responsive design systems. My focus is on making product states visible, actions safe, and component handoff precise.
                </p>
              </section>

              <section className="about-panel about-experience-panel" id="about-experience" style={{ marginTop: '48px' }}>
                <div className="about-panel-head">
                  <span className="eyebrow">Work Experience</span>
                  <h2 className="display display-md">Experience</h2>
                </div>
                <div className="timeline about-timeline" style={{ marginTop: '24px' }}>
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

              <section className="about-panel about-education-panel" id="about-education" style={{ marginTop: '48px' }}>
                <div className="about-panel-head">
                  <span className="eyebrow orange">Education &amp; Languages</span>
                  <h2 className="display display-md">Education &amp; Languages</h2>
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
