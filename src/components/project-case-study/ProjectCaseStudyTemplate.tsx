import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../../types';
import { normalizeProjectSections } from '../../utils/caseStudyUtils';
import { CaseStudyHero } from './CaseStudyHero';
import { ProjectOverview } from './ProjectOverview';
import { SectionNavigation } from './SectionNavigation';
import { CaseStudySection } from './CaseStudySection';
import { usePortfolio } from '../../context/PortfolioContext';
import { initialSiteSettings } from '../../data/initialData';
import { resolveProjectTheme, FONT_MAP, CARD_RADIUS_MAP } from '../../utils/themePresets';

interface ProjectCaseStudyTemplateProps {
  project: Project;
  onNavigate?: (path: string) => void;
  isAdminPreview?: boolean;
}

export const ProjectCaseStudyTemplate: React.FC<ProjectCaseStudyTemplateProps> = ({
  project,
  onNavigate,
  isAdminPreview = false
}) => {
  const { settings, projects } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  // Normalize project sections
  const sections = useMemo(() => normalizeProjectSections(project), [project]);
  const orderedPublishedProjects = useMemo(
    () => [...projects]
      .filter((item) => item.status === 'published' || (isAdminPreview && item.id === project.id))
      .sort((a, b) => a.order - b.order),
    [projects, isAdminPreview, project.id]
  );
  const currentProjectIndex = orderedPublishedProjects.findIndex((item) => item.id === project.id);
  const nextProject = orderedPublishedProjects.length > 1 && currentProjectIndex >= 0
    ? orderedPublishedProjects[(currentProjectIndex + 1) % orderedPublishedProjects.length]
    : undefined;

  // Dynamic navigation items computed from visible sections matching Figma 10 outline items
  const navSections = useMemo(
    () =>
      sections
        .filter((s) => s.visible && s.id !== 'why-works' && s.id !== 'differently')
        .map((s) => ({
          id: s.id,
          label: s.navigationLabel
        })),
    [sections]
  );

  const [activeSection, setActiveSection] = useState<string>(() => {
    return navSections[0]?.id || '';
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track active section and reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      if (navSections.length === 0) return;
      // Change the active item only once a section reaches the content reading line.
      // Using offsetTop + a fixed scroll offset switched the nav before the section appeared.
      const readingLine = 140;
      let currentSection = navSections[0]?.id || '';
      for (const section of navSections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.top <= readingLine) currentSection = section.id;
        if (bounds.top <= readingLine && bounds.bottom > readingLine) {
          currentSection = section.id;
          break;
        }
      }
      setActiveSection((previous) => previous === currentSection ? previous : currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navSections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const heroImageSrc = project.heroImage?.url || project.coverImage || '/assets/media/home-media-04-f775f2921176.webp';
  const heroImageAlt = project.heroImage?.alt || project.title;
  const subtitle = project.heroSubtitle || project.shortSummary;
  const introText = project.introduction || project.summary;

  // Status check: if draft and not admin preview
  if (project.status === 'draft' && !isAdminPreview) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="p-8 rounded-[10px] bg-zinc-950 border border-white/10 max-w-md flex flex-col items-center gap-4">
          <span className="material-symbols-rounded text-4xl text-[#ff853a]">lock</span>
          <h2 className="text-2xl font-bold">Project Under Review</h2>
          <p className="text-zinc-400 text-sm">
            This project case study is currently saved as a draft and is undergoing refinement.
          </p>
          <button
            onClick={() => window.location.assign('/#work')}
            className="px-6 py-2.5 rounded bg-white text-black font-medium text-sm hover:bg-zinc-200 cursor-pointer"
          >
            Back to All Projects
          </button>
        </div>
      </div>
    );
  }

  const resolvedTheme = useMemo(() => resolveProjectTheme(project.theme), [project.theme]);

  const themeStyles = useMemo(() => {
    return {
      backgroundColor: resolvedTheme.backgroundColor,
      color: resolvedTheme.bodyTextColor,
      '--cs-bg': resolvedTheme.backgroundColor,
      '--cs-heading': resolvedTheme.headingColor,
      '--cs-hero-title': resolvedTheme.heroTitleColor,
      '--cs-hero-subtitle': resolvedTheme.heroSubtitleColor,
      '--cs-section-heading': resolvedTheme.sectionHeadingColor,
      '--cs-body': resolvedTheme.bodyTextColor,
      '--cs-muted': resolvedTheme.mutedTextColor,
      '--cs-meta-label': resolvedTheme.metadataLabelColor,
      '--cs-meta-val': resolvedTheme.metadataValueColor,
      '--cs-card-title': resolvedTheme.cardTitleColor,
      '--cs-card-text': resolvedTheme.cardTextColor,
      '--cs-bullet-text': resolvedTheme.bulletTextColor,
      '--cs-bullet-dot': resolvedTheme.bulletDotColor,
      '--cs-quote-text': resolvedTheme.quoteTextColor,
      '--cs-quote-author': resolvedTheme.quoteAuthorColor,
      '--cs-quote-border': resolvedTheme.quoteBorderColor,
      '--cs-nav-text': resolvedTheme.navTextColor,
      '--cs-nav-active-text': resolvedTheme.navActiveTextColor,
      '--cs-nav-active-indicator': resolvedTheme.navActiveIndicatorColor,
      '--cs-accent-text': resolvedTheme.accentTextColor,
      '--cs-chapter-num': resolvedTheme.chapterNumberColor,
      '--cs-chapter-bg': resolvedTheme.chapterNumberBg,
      '--cs-badge-text': resolvedTheme.badgeTextColor,
      '--cs-badge-bg': resolvedTheme.badgeBgColor,
      '--cs-badge-border': resolvedTheme.badgeBorderColor,
      '--cs-back-btn': resolvedTheme.backButtonTextColor,
      '--cs-btn-text': resolvedTheme.buttonTextColor,
      '--cs-btn-primary-bg': resolvedTheme.primaryButtonBg,
      '--cs-btn-primary-text': resolvedTheme.primaryButtonText,
      '--cs-btn-primary-border': resolvedTheme.primaryButtonBorder,
      '--cs-btn-secondary-bg': resolvedTheme.secondaryButtonBg,
      '--cs-btn-secondary-text': resolvedTheme.secondaryButtonText,
      '--cs-btn-secondary-border': resolvedTheme.secondaryButtonBorder,
      '--cs-next-card-bg': resolvedTheme.nextProjectCardBg,
      '--cs-next-card-border': resolvedTheme.nextProjectCardBorder,
      '--cs-next-text': resolvedTheme.nextProjectTextColor,
      '--cs-next-accent': resolvedTheme.nextProjectAccentColor,
      '--cs-text': resolvedTheme.bodyTextColor,
      '--cs-accent': resolvedTheme.accentColor,
      '--cs-card-bg': resolvedTheme.cardBackground,
      '--cs-card-border': resolvedTheme.cardBorderColor,
      '--cs-divider': resolvedTheme.dividerColor,
      '--cs-progress-bar': resolvedTheme.progressBarColor,
      '--cs-card-radius': CARD_RADIUS_MAP[resolvedTheme.cardRadius],
      fontFamily: FONT_MAP[resolvedTheme.fontFamily]
    } as React.CSSProperties;
  }, [resolvedTheme]);

  return (
    <div
      className="w-full flex flex-col items-center dynamic-case-themed"
      style={themeStyles}
    >
      {/* Sleek Top Reading Scroll Progress Bar */}
      {resolvedTheme.showProgressBar && (
        <div className="fixed top-0 left-0 w-full h-[2.5px] z-50 pointer-events-none bg-white/5">
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${scrollProgress}%`,
              backgroundColor: resolvedTheme.progressBarColor,
              boxShadow: `0 0 10px ${resolvedTheme.progressBarColor}80`
            }}
          />
        </div>
      )}

      {/* Admin preview banner */}
      {isAdminPreview && (
        <div className="w-full bg-[#ff853a]/20 border-b border-[#ff853a]/40 text-[#ff853a] text-xs font-mono py-2 px-4 text-center tracking-wider sticky top-0 z-50 backdrop-blur-md">
          PREVIEW MODE · This is a live preview of &ldquo;{project.title}&rdquo; ({project.status})
        </div>
      )}

      {/* Main Container */}
      <div
        className="w-full max-w-full mx-auto relative flex flex-col justify-start items-center box-border animate-cs-fade-in"
        style={{ backgroundColor: resolvedTheme.backgroundColor }}
      >
        {/* Atmospheric Background Patterns */}


        {resolvedTheme.backgroundPattern === 'dots' && (
          <div
            className="w-full h-[735.20px] left-0 top-0 absolute opacity-15 pointer-events-none select-none"
            style={{
              backgroundImage: `radial-gradient(${resolvedTheme.accentColor} 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
        )}

        {resolvedTheme.backgroundPattern === 'glow' && (
          <div
            className="w-[600px] h-[600px] max-w-full rounded-full blur-[140px] opacity-20 pointer-events-none select-none absolute -top-40 right-10"
            style={{ backgroundColor: resolvedTheme.accentColor }}
          />
        )}

        {/* Hero Section */}
        <CaseStudyHero
          title={project.title}
          subtitle={subtitle}
          year={project.year}
          titleSize={resolvedTheme.titleSize}
          copy={copy}
        />

        {/* Project Overview (Hero Image + Metadata + Links) */}
        <ProjectOverview
          heroImage={heroImageSrc}
          heroImageAlt={heroImageAlt}
          introduction={introText}
          role={project.role}
          duration={project.duration}
          deliverables={project.deliverables}
          deliverableGroups={project.deliverableGroups}
          figmaUrl={project.figmaUrl}
          figmaButtonText={project.figmaButtonText}
          externalProjectUrl={project.externalProjectUrl}
          copy={copy}
        />

        {/* Two-Column Case Study Section with Left Sticky Navigation */}
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-12 lg:gap-16 relative pb-28 pt-4 box-border">
          {/* Left Table of Contents Nav */}
          <SectionNavigation
            sections={navSections}
            activeSection={activeSection}
            onSelectSection={scrollToSection}
            copy={copy}
          />

          {/* Right Column: Case Study Sections */}
          <main className="w-full min-w-0 flex-1 max-w-full flex flex-col gap-12 sm:gap-16 lg:gap-20 self-stretch">
            {sections.map((section, idx) => (
              <CaseStudySection key={section.id} section={section} index={idx} copy={copy} />
            ))}

            {/* Bottom Footer Navigation Bar inside Case Study */}
            <div
              className="pt-12 pb-16 border-t flex flex-col sm:flex-row justify-between items-center gap-6"
              style={{ borderColor: 'var(--cs-divider, rgba(255, 255, 255, 0.2))' }}
            >
              <button
                onClick={() => window.location.assign('/#work')}
                className="inline-flex items-center gap-2 transition-all duration-200 hover:-translate-x-1.5 text-base font-medium cursor-pointer group"
                style={{ color: 'var(--cs-back-btn, #ffffff)' }}
              >
                <span className="material-symbols-rounded transition-transform duration-200 group-hover:-translate-x-1">arrow_back</span>
                <span>{copy.backToProjects}</span>
              </button>
              <div className="flex flex-col-reverse sm:flex-row items-center gap-5">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-1 text-sm cursor-pointer group"
                  style={{ color: 'var(--cs-muted, #a1a1aa)' }}
                >
                  <span>{copy.backToTop}</span>
                  <span className="material-symbols-rounded transition-transform duration-200 group-hover:-translate-y-1">arrow_upward</span>
                </button>
                {nextProject && (
                  <a
                    href={nextProject.route}
                    aria-label={`${copy.viewNextProject}: ${nextProject.title}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (onNavigate) onNavigate(nextProject.route);
                      else window.location.assign(nextProject.route);
                    }}
                    className="group inline-flex flex-col items-end gap-1 px-5 py-3 text-right transition-all border"
                    style={{
                      backgroundColor: 'var(--cs-next-card-bg, rgba(139, 226, 139, 0.06))',
                      borderColor: 'var(--cs-next-card-border, rgba(139, 226, 139, 0.35))',
                      borderRadius: 'var(--cs-card-radius, 8px)'
                    }}
                  >
                    <span
                      className="inline-flex items-center gap-2 text-sm font-semibold"
                      style={{ color: 'var(--cs-next-accent, #8be28b)' }}
                    >
                      {copy.viewNextProject}
                      <span className="material-symbols-rounded transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                    </span>
                    <span
                      className="max-w-64 truncate text-xs"
                      style={{ color: 'var(--cs-next-text, #a1a1aa)' }}
                    >
                      {nextProject.title}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

