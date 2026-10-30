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
    <div className="w-full flex flex-col items-center relative z-10 pt-4">
      {/* Top back navigation bar */}
      <div className="w-full max-w-[1399.13px] px-4 md:px-0 pt-4 pb-6 flex justify-between items-center">
        <button
          onClick={() => (onNavigate ? onNavigate('/projects') : window.history.back())}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium py-1.5 px-3 rounded hover:bg-white/5 cursor-pointer"
        >
          <span className="material-symbols-rounded text-lg">arrow_back</span>
          <span>Back to All Projects</span>
        </button>
        <div className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
          Case Study {year ? `· ${year}` : ''}
        </div>
      </div>

      {/* Hero Title & Subtitle flex row */}
      <div className="w-full max-w-[1399.13px] px-4 md:px-0 py-6 flex flex-col justify-between items-center">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6">
          {/* Big Project Title */}
          <div className="w-full lg:w-[699.56px] flex flex-col justify-center items-start">
            <h1 className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-['Plus_Jakarta_Sans'] leading-none tracking-tight uppercase">
              {title}
            </h1>
          </div>

          {/* Right Subtitle */}
          {subtitle && (
            <div className="w-full lg:w-[559.65px] pb-2 lg:pb-5 flex flex-col justify-start items-start">
              <p className="text-white text-lg sm:text-xl font-normal font-['Plus_Jakarta_Sans'] leading-7">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Thin white divider from Figma */}
        <div className="w-full h-0.5 bg-white opacity-90 my-2" />
      </div>
    </div>
  );
};
