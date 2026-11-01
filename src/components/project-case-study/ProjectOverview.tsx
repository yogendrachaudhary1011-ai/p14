import React from 'react';
import { MediaPreview } from '../MediaPreview';
import { DeliverableGroup } from '../../types';

interface ProjectOverviewProps {
  heroImage: string;
  heroImageAlt?: string;
  introduction?: string;
  role?: string;
  duration?: string;
  deliverables?: string[];
  deliverableGroups?: DeliverableGroup[];
  figmaUrl?: string;
  figmaButtonText?: string;
  externalProjectUrl?: string;
  copy: Record<string, string>;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  heroImage,
  heroImageAlt,
  introduction,
  role,
  duration,
  deliverables,
  deliverableGroups,
  figmaUrl,
  figmaButtonText,
  externalProjectUrl,
  copy
}) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col justify-center items-center gap-8 sm:gap-12 md:gap-16 relative z-10 box-border">
      {/* Big Hero Image with reveal and hover depth */}
      <div className="w-full rounded-none md:rounded-[6px] overflow-hidden bg-zinc-950 flex justify-center items-center aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] max-h-[728px] max-w-full animate-cs-image-reveal group">
        <MediaPreview
          src={heroImage || 'https://placehold.co/1539x728/111317/ffffff?text=Case+Study+Hero'}
          alt={heroImageAlt || 'Hero visual'}
          className="w-full h-full object-cover"
          loading="eager"
          fallbackSrc="https://placehold.co/1539x728/111317/ffffff?text=Case+Study+Hero"
        />
      </div>

      {/* Intro Narrative and Metadata Spec */}
      <div className="w-full flex flex-col justify-start items-start gap-10 sm:gap-14">
        {/* Intro Paragraph */}
        {introduction && (
          <div className="w-full max-w-full animate-cs-slide-up-delay-1">
            <p className="w-full text-white text-lg sm:text-xl font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed sm:leading-7 break-words [text-wrap:pretty]">
              {introduction}
            </p>
          </div>
        )}

        {/* Metadata Table matching the reference two-column alignment */}
        <div className="w-full max-w-[700px] flex flex-col justify-center items-start gap-8 animate-cs-slide-up-delay-2">
          <div className="w-full flex flex-col justify-center items-start gap-12">
            {/* My Role */}
            {role && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-[24rem_minmax(0,1fr)] items-start gap-2 sm:gap-5 group">
                <div className="w-48 sm:w-52 shrink-0 text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 group-hover:text-zinc-200 transition-colors">
                  {copy.roleLabel}
                </div>
                <div className="w-full min-w-0 text-zinc-500 text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5">
                  {role}
                </div>
              </div>
            )}

            {/* Duration */}
            {duration && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-[24rem_minmax(0,1fr)] items-start gap-2 sm:gap-5 group">
                <div className="w-48 sm:w-52 shrink-0 text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 group-hover:text-zinc-200 transition-colors">
                  {copy.durationLabel}
                </div>
                <div className="w-full min-w-0 text-zinc-500 text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5">
                  {duration}
                </div>
              </div>
            )}

            {/* One aligned “What I Designed” row, with every group item in the right column */}
            {(() => {
              const groups = (deliverableGroups?.length
                ? deliverableGroups
                : deliverables?.length
                  ? [{ id: 'legacy-deliverables', label: copy.deliverablesLabel || 'Deliverables', items: deliverables }]
                  : []);
              const items = groups
                .flatMap((group) => group.items)
                .flatMap((item) => String(item ?? '').replace(/\\\\n/g, '\\n').replace(/\\/n/gi, '\\n').split(/\\r?\\n/))
                .map((item) => item.trim())
                .filter(Boolean);
              const label = copy.deliverablesLabel && copy.deliverablesLabel.toLowerCase() !== 'deliverables'
                ? copy.deliverablesLabel
                : 'What I Designed';
              return items.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-[24rem_minmax(0,1fr)] items-start gap-2 sm:gap-5 group">
                  <div className="w-48 sm:w-52 shrink-0 text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">{label}</div>
                  <ul className="w-full min-w-0 flex flex-col gap-4 pl-4">
                    {items.map((item, index) => (
                      <li key={'deliverable-' + index} className="flex items-start gap-3 text-zinc-500 text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">
                        <span aria-hidden="true" className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
                        <span className="min-w-0 flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}

          </div>

          {/* Action Buttons: Figma & External Project with micro-interaction hover */}
          <div className="w-full flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 pt-1">
            {figmaUrl && (
              <a
                href={figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-4 rounded-sm border-[1.60px] border-white text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 hover:bg-white hover:text-black hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-center group"
              >
                <span>{figmaButtonText || copy.figmaButton}</span>
                <span className="material-symbols-rounded text-sm ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">open_in_new</span>
              </a>
            )}

            {externalProjectUrl && (
              <a
                href={externalProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-4 rounded-sm bg-white text-black text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 hover:bg-zinc-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-center group shadow-md hover:shadow-white/10"
              >
                <span>{copy.liveProjectButton}</span>
                <span className="material-symbols-rounded text-sm ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">arrow_outward</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Thin white divider before content sections matching Figma with expand animation */}
      <div className="w-full h-0.5 bg-white my-4 animate-cs-expand-line" />
    </div>
  );
};

