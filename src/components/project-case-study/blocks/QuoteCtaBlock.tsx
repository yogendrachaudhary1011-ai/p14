import React from 'react';
import { QuoteBlockItem, CtaBlockItem, DividerBlockItem, SpacerBlockItem } from '../../../types';

export const QuoteBlock: React.FC<{ block: QuoteBlockItem }> = ({ block }) => {
  return (
    <div
      className="w-full my-4 p-4 sm:p-6 md:p-8 rounded-[5px] bg-zinc-950 border-l-4 flex flex-col gap-3"
      style={{
        borderLeftColor: 'var(--cs-accent, #8be28b)',
        backgroundColor: 'var(--cs-card-bg, #09090b)'
      }}
    >
      <blockquote
        className="text-lg sm:text-xl md:text-2xl font-normal font-sans italic leading-relaxed break-words"
        style={{ color: 'var(--cs-heading, #ffffff)' }}
      >
        “{block.quote}”
      </blockquote>
      {(block.author || block.role) && (
        <div
          className="text-xs sm:text-sm font-sans flex flex-wrap items-center gap-2"
          style={{ color: 'var(--cs-muted, #a1a1aa)' }}
        >
          {block.author && (
            <span className="font-semibold" style={{ color: 'var(--cs-heading, #ffffff)' }}>
              {block.author}
            </span>
          )}
          {block.author && block.role && <span className="opacity-40">·</span>}
          {block.role && <span>{block.role}</span>}
        </div>
      )}
    </div>
  );
};

export const CtaBlock: React.FC<{ block: CtaBlockItem }> = ({ block }) => {
  const isPrimary = block.style !== 'outline';
  return (
    <div className="w-full my-4 flex justify-start items-center">
      <a
        href={block.url}
        target={block.isExternal ? '_blank' : '_self'}
        rel={block.isExternal ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-[5px] text-sm sm:text-base font-medium font-sans transition-all text-center max-w-full break-words shadow-md hover:-translate-y-0.5"
        style={
          isPrimary
            ? {
                backgroundColor: 'var(--cs-accent, #ffffff)',
                color: 'var(--cs-btn-text, #000000)'
              }
            : {
                borderWidth: '1.6px',
                borderStyle: 'solid',
                borderColor: 'var(--cs-divider, rgba(255,255,255,0.4))',
                color: 'var(--cs-heading, #ffffff)'
              }
        }
      >
        <span>{block.label}</span>
        {block.isExternal && <span className="material-symbols-rounded text-sm">open_in_new</span>}
      </a>
    </div>
  );
};

export const DividerBlock: React.FC<{ block: DividerBlockItem }> = () => {
  return (
    <div
      className="w-full h-0.5 my-6"
      style={{ backgroundColor: 'var(--cs-divider, rgba(255, 255, 255, 0.2))' }}
    />
  );
};

export const SpacerBlock: React.FC<{ block: SpacerBlockItem }> = ({ block }) => {
  const heightClass = block.height === 'sm' ? 'h-6' : block.height === 'lg' ? 'h-20' : 'h-12';
  return <div className={`w-full ${heightClass}`} />;
};

