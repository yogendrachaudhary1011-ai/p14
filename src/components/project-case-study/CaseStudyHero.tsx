import React from 'react';

interface CaseStudyHeroProps {
  title: string;
  subtitle?: string;
  year?: string;
  onNavigate?: (path: string) => void;
}

export const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({
  title,
  subtitle,
  year,
  onNavigate
}) => {
  return (
    <div className="w-full flex flex-col items-center relative z-10 pt-2 sm:pt-4">
      {/* Top back navigation bar */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-2 sm:pt-4 pb-4 sm:pb-6 flex justify-between items-center gap-2 box-border animate-cs-fade-in">
        <button
          onClick={() => (onNavigate ? onNavigate('/projects') : window.history.back())}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-zinc-400 hover:text-white transition-all duration-200 text-xs sm:text-sm font-medium py-1.5 px-2.5 sm:px-3 rounded hover:bg-white/5 hover:-translate-x-1 cursor-pointer"
        >
          <span className="material-symbols-rounded text-base sm:text-lg">arrow_back</span>
          <span>Back to All Projects</span>
        </button>
        <div className="text-[11px] sm:text-xs font-mono tracking-wider text-zinc-500 uppercase shrink-0">
          Case Study {year ? `· ${year}` : ''}
        </div>
      </div>

      {/* Hero Title & Subtitle flex row matching Figma spec */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 flex flex-col justify-between items-center box-border">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-4 sm:pb-6">
          {/* Big Project Title */}
          <div className="w-full lg:max-w-[700px] flex-1 flex flex-col justify-center items-start">
            <h1 className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-['Plus_Jakarta_Sans',sans-serif] leading-[1.05] sm:leading-[179.20px] uppercase tracking-tight break-words hyphens-auto w-full animate-cs-slide-up">
              {title}
            </h1>
          </div>

          {/* Right Subtitle */}
          {subtitle && (
            <div className="w-full lg:max-w-[560px] pb-1 lg:pb-5 flex flex-col justify-start items-start animate-cs-slide-up-delay-1">
              <p className="text-white text-base sm:text-lg lg:text-xl font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed sm:leading-7 [text-wrap:pretty]">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Crisp white divider matching Figma with expand animation */}
        <div className="w-full h-0.5 bg-white my-3 animate-cs-expand-line" />
      </div>
    </div>
  );
};
