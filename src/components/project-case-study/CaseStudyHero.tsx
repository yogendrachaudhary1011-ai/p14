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
      <div className="w-full max-w-[1399.13px] px-4 sm:px-6 md:px-8 lg:px-0 pt-2 sm:pt-4 pb-4 sm:pb-6 flex justify-between items-center gap-2">
        <button
          onClick={() => (onNavigate ? onNavigate('/projects') : window.history.back())}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-medium py-1.5 px-2.5 sm:px-3 rounded hover:bg-white/5 cursor-pointer"
        >
          <span className="material-symbols-rounded text-base sm:text-lg">arrow_back</span>
          <span>Back to All Projects</span>
        </button>
        <div className="text-[11px] sm:text-xs font-mono tracking-wider text-zinc-500 uppercase shrink-0">
          Case Study {year ? `· ${year}` : ''}
        </div>
      </div>

      {/* Hero Title & Subtitle flex row */}
      <div className="w-full max-w-[1399.13px] px-4 sm:px-6 md:px-8 lg:px-0 py-3 sm:py-6 flex flex-col justify-between items-center">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6 pb-4 sm:pb-6">
          {/* Big Project Title */}
          <div className="w-full lg:w-[650px] xl:w-[700px] flex flex-col justify-center items-start">
            <h1 className="text-white text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-['Plus_Jakarta_Sans'] leading-[0.95] tracking-tight uppercase break-words hyphens-auto w-full">
              {title}
            </h1>
          </div>

          {/* Right Subtitle */}
          {subtitle && (
            <div className="w-full lg:w-[480px] xl:w-[560px] pb-1 lg:pb-4 flex flex-col justify-start items-start">
              <p className="text-zinc-300 text-sm sm:text-base md:text-lg lg:text-xl font-normal font-['Plus_Jakarta_Sans'] leading-relaxed sm:leading-7">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Thin white divider */}
        <div className="w-full h-0.5 bg-white opacity-80 my-2" />
      </div>
    </div>
  );
};
