import React from 'react';
import { QuoteBlockItem, CtaBlockItem, DividerBlockItem, SpacerBlockItem } from '../../../types';

export const QuoteBlock: React.FC<{ block: QuoteBlockItem }> = ({ block }) => {
  return (
    <div
      className="w-full my-4 p-4 sm:p-6 md:p-8 border-l-4 flex flex-col gap-3 transition-all"
      style={{
        borderLeftColor: 'var(--cs-quote-border, var(--cs-accent, #8be28b))',
        backgroundColor: 'var(--cs-card-bg, #09090b)',
        borderRadius: 'var(--cs-card-radius, 6px)'
      }}
    >
      <blockquote
        className="text-lg sm:text-xl md:text-2xl font-normal italic leading-relaxed break-words"
        style={{ color: 'var(--cs-quote-text, var(--cs-heading, #ffffff))' }}
      >
        “{block.quote}”
      </blockquote>
      {(block.author || block.role) && (
        <div
          className="text-xs sm:text-sm flex flex-wrap items-center gap-2"
          style={{ color: 'var(--cs-quote-author, var(--cs-muted, #a1a1aa))' }}
        >
          {block.author && (
            <span className="font-semibold" style={{ color: 'var(--cs-quote-author, var(--cs-heading, #ffffff))' }}>
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
        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium transition-all text-center max-w-full break-words shadow-md hover:-translate-y-0.5 border"
        style={
          isPrimary
            ? {
                backgroundColor: 'var(--cs-btn-primary-bg, var(--cs-accent, #ffffff))',
                color: 'var(--cs-btn-primary-text, var(--cs-btn-text, #000000))',
                borderColor: 'var(--cs-btn-primary-border, transparent)',
                borderRadius: 'var(--cs-card-radius, 6px)'
              }
            : {
                backgroundColor: 'var(--cs-btn-secondary-bg, transparent)',
                borderWidth: '1.6px',
                borderStyle: 'solid',
                borderColor: 'var(--cs-btn-secondary-border, var(--cs-divider, rgba(255,255,255,0.4)))',
                color: 'var(--cs-btn-secondary-text, var(--cs-heading, #ffffff))',
                borderRadius: 'var(--cs-card-radius, 6px)'
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

