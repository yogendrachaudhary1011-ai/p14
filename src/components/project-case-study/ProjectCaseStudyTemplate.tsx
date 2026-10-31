import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '../../types';
import { normalizeProjectSections } from '../../utils/caseStudyUtils';
import { CaseStudyHero } from './CaseStudyHero';
import { ProjectOverview } from './ProjectOverview';
import { SectionNavigation } from './SectionNavigation';
import { CaseStudySection } from './CaseStudySection';
import { usePortfolio } from '../../context/PortfolioContext';
import { initialSiteSettings } from '../../data/initialData';

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
  const { settings } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  // Normalize project sections
  const sections = useMemo(() => normalizeProjectSections(project), [project]);

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
            onClick={() => onNavigate && onNavigate('/projects')}
            className="px-6 py-2.5 rounded bg-white text-black font-medium text-sm hover:bg-zinc-200 cursor-pointer"
          >
            Back to All Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white font-sans flex flex-col items-center selection:bg-[#8be28b] selection:text-black">
      {/* Sleek Top Reading Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[2.5px] z-50 pointer-events-none bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-transparent via-[#8be28b] to-transparent transition-all duration-150 ease-out shadow-[0_0_10px_rgba(139,226,139,0.65)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Admin preview banner */}
      {isAdminPreview && (
        <div className="w-full bg-[#ff853a]/20 border-b border-[#ff853a]/40 text-[#ff853a] text-xs font-mono py-2 px-4 text-center tracking-wider sticky top-0 z-50 backdrop-blur-md">
          PREVIEW MODE · This is a live preview of &ldquo;{project.title}&rdquo; ({project.status})
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto relative bg-black flex flex-col justify-start items-center box-border animate-cs-fade-in">
        {/* Decorative Grid Lines matching Figma spec */}
        <div className="w-full h-[735.20px] left-0 top-[1px] absolute opacity-5 pointer-events-none select-none overflow-hidden">
          <div className="w-px h-[735.20px] left-[7%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-px h-[735.20px] left-[21%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-px h-[735.20px] left-[35%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-px h-[735.20px] left-[50%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-px h-[735.20px] left-[64%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-px h-[735.20px] left-[78%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-px h-[735.20px] left-[92%] top-0 absolute bg-gradient-to-b from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[52px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[157px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[262px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[367px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[472px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[577px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
          <div className="w-full h-px left-0 top-[682px] absolute bg-gradient-to-r from-white/0 via-white via 23% to-black/0" />
        </div>

        {/* Hero Section */}
        <CaseStudyHero
          title={project.title}
          subtitle={subtitle}
          year={project.year}
          onNavigate={onNavigate}
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
          figmaUrl={project.figmaUrl}
          figmaButtonText={project.figmaButtonText}
          externalProjectUrl={project.externalProjectUrl}
          copy={copy}
        />

        {/* Two-Column Case Study Section with Left Sticky Navigation */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-12 lg:gap-16 relative pb-28 pt-4 box-border">
          {/* Left Table of Contents Nav */}
          <SectionNavigation
            sections={navSections}
            activeSection={activeSection}
            onSelectSection={scrollToSection}
            copy={copy}
          />

          {/* Right Column: Case Study Sections */}
          <main className="w-full min-w-0 flex-1 max-w-[1200px] flex flex-col gap-12 sm:gap-16 lg:gap-20 self-stretch">
            {sections.map((section, idx) => (
              <CaseStudySection key={section.id} section={section} index={idx} copy={copy} />
            ))}

            {/* Bottom Footer Navigation Bar inside Case Study */}
            <div className="pt-12 pb-16 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-6">
              <button
                onClick={() => (onNavigate ? onNavigate('/projects') : window.history.back())}
                className="inline-flex items-center gap-2 text-white hover:text-[#8be28b] transition-all duration-200 hover:-translate-x-1.5 text-base font-medium cursor-pointer group"
              >
                <span className="material-symbols-rounded transition-transform duration-200 group-hover:-translate-x-1">arrow_back</span>
                <span>{copy.backToProjects}</span>
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-all duration-200 hover:-translate-y-1 text-sm cursor-pointer group"
              >
                <span>{copy.backToTop}</span>
                <span className="material-symbols-rounded transition-transform duration-200 group-hover:-translate-y-1">arrow_upward</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

