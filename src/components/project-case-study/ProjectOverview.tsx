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
          <div className="w-full flex flex-col justify-center items-start gap-3 sm:gap-4">
            {/* My Role */}
            {role && (
              <div className="w-full flex flex-col sm:flex-row justify-start items-start sm:items-baseline gap-1 sm:gap-6 py-1">
                <span className="w-36 sm:w-48 md:w-52 shrink-0 text-white text-base sm:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
                  My Role:
                </span>
                <span className="flex-1 text-left text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-6">
                  {role}
                </span>
              </div>
            )}

            {/* Duration */}
            {duration && (
              <div className="w-full flex flex-col sm:flex-row justify-start items-start sm:items-baseline gap-1 sm:gap-6 py-1">
                <span className="w-36 sm:w-48 md:w-52 shrink-0 text-white text-base sm:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
                  Duration:
                </span>
                <span className="flex-1 text-left text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-6">
                  {duration}
                </span>
              </div>
            )}

            {/* Deliverables */}
            {deliverables && deliverables.length > 0 && (
              <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-1 sm:gap-6 py-1">
                <span className="w-36 sm:w-48 md:w-52 shrink-0 text-white text-base sm:text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
                  Deliverables:
                </span>
                <div className="flex-1 text-left flex flex-col gap-1.5">
                  {deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-6 text-left"
                    >
                      {item}
                    </div>
                  ))}
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
