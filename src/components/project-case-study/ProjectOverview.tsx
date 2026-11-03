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
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col justify-center items-center gap-8 sm:gap-12 md:gap-16 relative z-10 box-border">
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
      <div className="w-full max-w-full flex flex-col justify-start items-start gap-10 sm:gap-14">
        {/* Intro Paragraph */}
        {introduction && (
          <div className="w-full max-w-full animate-cs-slide-up-delay-1">
            <p
              className="w-full text-lg sm:text-xl font-normal leading-relaxed sm:leading-7 break-words [text-wrap:pretty]"
              style={{ color: 'var(--cs-body, #ffffff)' }}
            >
              {introduction}
            </p>
          </div>
        )}

        {/* Metadata Table covering full screen width */}
        <div className="w-full max-w-full flex flex-col justify-center items-start gap-8 animate-cs-slide-up-delay-2">
          <div className="w-full flex flex-col justify-center items-start gap-6">
            {/* My Role */}
            {role && (
              <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-6 group">
                <div
                  className="w-48 sm:w-60 shrink-0 text-lg font-normal leading-6 transition-colors"
                  style={{ color: 'var(--cs-heading, #ffffff)' }}
                >
                  {copy.roleLabel}
                </div>
                <div
                  className="w-full flex-1 text-base font-normal leading-relaxed"
                  style={{ color: 'var(--cs-muted, #a1a1aa)' }}
                >
                  {role}
                </div>
              </div>
            )}

            {/* Duration */}
            {duration && (
              <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-6 group">
                <div
                  className="w-48 sm:w-60 shrink-0 text-lg font-normal leading-6 transition-colors"
                  style={{ color: 'var(--cs-heading, #ffffff)' }}
                >
                  {copy.durationLabel}
                </div>
                <div
                  className="w-full flex-1 text-base font-normal leading-relaxed"
                  style={{ color: 'var(--cs-muted, #a1a1aa)' }}
                >
                  {duration}
                </div>
              </div>
            )}

            {/* Editable overview lists */}
            {(deliverableGroups?.length ? deliverableGroups : deliverables?.length ? [{ id: 'legacy-deliverables', label: copy.deliverablesLabel || 'Deliverables', items: deliverables }] : [])
              .filter((group) => group.items.length > 0)
              .map((group) => (
                <div key={group.id} className="w-full flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-6 group">
                  <div
                    className="w-48 sm:w-60 shrink-0 text-lg font-normal leading-6"
                    style={{ color: 'var(--cs-heading, #ffffff)' }}
                  >
                    {group.label}
                  </div>
                  <div className="w-full flex-1 flex flex-col gap-2.5">
                    {group.items.map((item, index) => (
                      <div
                        key={index}
                        className="w-full text-base font-normal leading-relaxed break-words"
                        style={{ color: 'var(--cs-muted, #a1a1aa)' }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

          </div>

          {/* Action Buttons: Figma & External Project with micro-interaction hover */}
          <div className="w-full flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 pt-1">
            {figmaUrl && (
              <a
                href={figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-4 rounded-sm border-[1.60px] text-lg font-normal leading-6 hover:bg-white hover:text-black hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-center group"
                style={{
                  borderColor: 'var(--cs-divider, rgba(255, 255, 255, 0.5))',
                  color: 'var(--cs-heading, #ffffff)'
                }}
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
                className="inline-flex items-center justify-center px-6 py-4 rounded-sm text-lg font-normal leading-6 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-center group shadow-md"
                style={{
                  backgroundColor: 'var(--cs-accent, #ffffff)',
                  color: 'var(--cs-btn-text, #000000)'
                }}
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

