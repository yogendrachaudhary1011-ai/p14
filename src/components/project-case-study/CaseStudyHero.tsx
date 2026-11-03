import React from 'react';
import { ProjectTheme } from '../../types';
import { TITLE_SIZE_CLASSES } from '../../utils/themePresets';

interface CaseStudyHeroProps {
  title: string;
  subtitle?: string;
  year?: string;
  badgeLabel?: string;
  backButtonText?: string;
  titleSize?: ProjectTheme['titleSize'];
  copy: Record<string, string>;
}

export const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({
  title,
  subtitle,
  year,
  badgeLabel,
  backButtonText,
  titleSize = 'normal',
  copy
}) => {
  const sizeClasses = TITLE_SIZE_CLASSES[titleSize] || TITLE_SIZE_CLASSES.normal;

  return (
    <div className="w-full flex flex-col items-center relative z-10 pt-2 sm:pt-4">
      {/* Top back navigation bar */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-2 sm:pt-4 pb-4 sm:pb-6 flex justify-between items-center gap-2 box-border animate-cs-fade-in">
        <a
          href="/#work"
          className="inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm font-medium py-1.5 px-2.5 sm:px-3 rounded hover:bg-white/5 hover:-translate-x-1 cursor-pointer"
          style={{ color: 'var(--cs-muted, #a1a1aa)' }}
        >
          <span className="material-symbols-rounded text-base sm:text-lg">arrow_back</span>
          <span>{backButtonText || copy.backToProjects}</span>
        </a>
        <div
          className="text-[11px] sm:text-xs font-mono tracking-wider uppercase shrink-0 font-semibold"
          style={{ color: 'var(--cs-accent, #8be28b)' }}
        >
          {badgeLabel || copy.caseStudyLabel} {year ? `· ${year}` : ''}
        </div>
      </div>

      {/* Hero Title & Subtitle flex row matching Figma spec */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 flex flex-col justify-between items-center box-border">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-4 sm:pb-6">
          {/* Big Project Title */}
          <div className="w-full lg:max-w-[700px] flex-1 flex flex-col justify-center items-start">
            <h1
              className={`text-white font-bold uppercase tracking-tight break-words hyphens-auto w-full animate-cs-slide-up ${sizeClasses}`}
              style={{ color: 'var(--cs-text, #ffffff)' }}
            >
              {title}
            </h1>
          </div>

          {/* Right Subtitle */}
          {subtitle && (
            <div className="w-full lg:max-w-[560px] pb-1 lg:pb-5 flex flex-col justify-start items-start animate-cs-slide-up-delay-1">
              <p
                className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed sm:leading-7 [text-wrap:pretty]"
                style={{ color: 'var(--cs-text, #ffffff)' }}
              >
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Crisp divider matching theme with expand animation */}
        <div
          className="w-full h-0.5 my-3 animate-cs-expand-line"
          style={{ backgroundColor: 'var(--cs-divider, rgba(255, 255, 255, 0.2))' }}
        />
      </div>
    </div>
  );
};

