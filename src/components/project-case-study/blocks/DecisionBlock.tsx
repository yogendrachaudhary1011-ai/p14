import React from 'react';
import { DecisionListBlock } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface DecisionBlockProps {
  block: DecisionListBlock;
  copy: Record<string, string>;
}

export const DecisionBlock: React.FC<DecisionBlockProps> = ({ block, copy }) => {
  return (
    <div className="w-full flex flex-col gap-6 my-2">
      {block.image && (
        <div className="w-full rounded-none overflow-visible bg-neutral-900/20 group">
          <MediaPreview
            src={block.image}
            alt={block.imageAlt || 'Key architecture decision diagram'}
            className="w-full h-auto object-contain rounded-none max-h-[800px]"
            containerClassName="w-full block rounded-none overflow-visible"
            loading="lazy"
          />
        </div>
      )}

      <div data-cols="2" className="w-full case-study-card-grid grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {block.decisions.map((decision, idx) => {
          const details = decision.details ?? [
            { label: decision.constraintLabel ?? copy.decisionConstraint, text: decision.constraint || '' },
            { label: decision.whatIDidLabel ?? copy.decisionAction, text: decision.whatIDid || '' },
            { label: decision.whyLabel ?? copy.decisionWhy, text: decision.why || '' }
          ];
          return (
          <div
            key={idx}
            className="w-full h-full min-w-0 flex flex-col justify-start items-start gap-4 p-5 border cs-interactive-card transition-all"
            style={{
              backgroundColor: 'var(--cs-card-bg, #18181b)',
              borderColor: 'var(--cs-card-border, rgba(255, 255, 255, 0.08))',
              borderRadius: 'var(--cs-card-radius, 6px)'
            }}
          >
            <h4
              className="text-lg font-normal leading-6 border-b border-white/10 pb-3 w-full break-words"
              style={{ color: 'var(--cs-card-title, #ffffff)' }}
            >
              {decision.title}
            </h4>

            <div className="w-full flex flex-col gap-3">
              {details.filter((detail) => detail.label?.trim() || detail.text?.trim()).map((detail, detailIndex) => (
                <div key={detailIndex} className="flex flex-col gap-1">
                  {detail.label?.trim() && (
                    <span
                      className="text-xs font-normal leading-4 font-mono uppercase tracking-wider"
                      style={{ color: 'var(--cs-meta-label, var(--cs-heading, #ffffff))' }}
                    >
                      {detail.label}
                    </span>
                  )}
                  {detail.text?.trim() && (
                    <p
                      className="text-sm sm:text-base font-normal leading-5 break-words"
                      style={{ color: 'var(--cs-card-text, #a1a1aa)' }}
                    >
                      {detail.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};


