import React from 'react';

interface ProjectOverviewProps {
  heroImage: string;
  heroImageAlt?: string;
  introduction?: string;
  role?: string;
  duration?: string;
  deliverables?: string[];
  figmaUrl?: string;
  figmaButtonText?: string;
  externalProjectUrl?: string;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  heroImage,
  heroImageAlt,
  introduction,
  role,
  duration,
  deliverables,
  figmaUrl,
  figmaButtonText,
  externalProjectUrl
}) => {
  return (
    <div className="w-full max-w-[1399.13px] px-4 sm:px-6 md:px-8 lg:px-0 flex flex-col justify-center items-center gap-8 sm:gap-12 md:gap-16 relative z-10">
      {/* Big Hero Image */}
      <div className="w-full rounded-[6px] md:rounded-[8px] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 flex justify-center items-center aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] max-h-[728px]">
        <img
          src={heroImage || 'https://placehold.co/1539x728/111317/ffffff?text=Case+Study+Hero'}
          alt={heroImageAlt || 'Hero visual'}
          className="w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/1539x728/111317/ffffff?text=Case+Study+Hero';
          }}
        />
      </div>

      {/* Intro Narrative and Metadata Spec */}
      <div className="w-full flex flex-col justify-start items-start gap-8 sm:gap-12">
        {/* Intro Paragraph */}
        {introduction && (
          <div className="w-full">
            <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-normal font-['Plus_Jakarta_Sans'] leading-relaxed md:leading-9 max-w-5xl">
              {introduction}
            </p>
          </div>
        )}

        {/* Metadata Table */}
        <div className="w-full max-w-3xl flex flex-col justify-center items-start gap-6 sm:gap-8">
          <div className="w-full flex flex-col justify-center items-start gap-4 sm:gap-5">
            {/* My Role */}
            {role && (
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-white/20 pb-3 sm:pb-4 gap-1">
                  <span className="text-white text-base sm:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6 shrink-0">
                    My Role:
                  </span>
                  <span className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-5 sm:text-right">
                    {role}
                  </span>
                </div>
              </div>
            )}

            {/* Duration */}
            {duration && (
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-white/20 pb-3 sm:pb-4 gap-1">
                  <span className="text-white text-base sm:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6 shrink-0">
                    Duration:
                  </span>
                  <span className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-5 sm:text-right">
                    {duration}
                  </span>
                </div>
              </div>
            )}

            {/* Deliverables */}
            {deliverables && deliverables.length > 0 && (
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start border-b border-white/20 pb-3 sm:pb-4 gap-2">
                  <span className="text-white text-base sm:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6 shrink-0">
                    Deliverables:
                  </span>
                  <div className="text-left sm:text-right flex flex-col gap-1.5 sm:max-w-md">
                    {deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-5"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Figma & External Project */}
          <div className="w-full flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            {figmaUrl && (
              <a
                href={figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-[4px] border-[1.60px] border-white text-white text-sm sm:text-base md:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6 hover:bg-white hover:text-black transition-all cursor-pointer text-center"
              >
                <span>{figmaButtonText || 'View Figma File'}</span>
                <span className="material-symbols-rounded text-sm ml-2">open_in_new</span>
              </a>
            )}

            {externalProjectUrl && (
              <a
                href={externalProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-[4px] bg-white text-black text-sm sm:text-base md:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6 hover:bg-zinc-200 transition-all cursor-pointer text-center"
              >
                <span>Live Project URL</span>
                <span className="material-symbols-rounded text-sm ml-2">arrow_outward</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Thin white divider before content sections */}
      <div className="w-full h-0.5 bg-white opacity-80 my-2" />
    </div>
  );
};
