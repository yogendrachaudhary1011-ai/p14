import React from 'react';
import { DecisionListBlock } from '../../../types';

interface DecisionBlockProps {
  block: DecisionListBlock;
}

export const DecisionBlock: React.FC<DecisionBlockProps> = ({ block }) => {
  return (
    <div className="w-full flex flex-col gap-6 my-2">
      {block.image && (
        <div className="w-full rounded-[5px] overflow-hidden bg-neutral-900 group">
          <img
            src={block.image}
            alt={block.imageAlt || 'Key architecture decision diagram'}
            className="w-full h-auto object-cover max-h-[660px] transition-transform duration-500 ease-out group-hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
      )}

      <div data-cols="2" className="w-full case-study-card-grid grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {block.decisions.map((decision, idx) => (
          <div
            key={idx}
            className="w-full h-full min-w-0 flex flex-col justify-start items-start gap-4 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 cs-interactive-card"
          >
            <h4 className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 border-b border-white/10 pb-3 w-full break-words">
              {decision.title}
            </h4>

            <div className="w-full flex flex-col gap-3">
              {/* Constraint / Problem */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4">
                  {decision.constraintLabel || 'Constraint:'}
                </span>
                <p className="text-zinc-500 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5 break-words">
                  {decision.constraint}
                </p>
              </div>

              {/* What I did */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4">
                  {decision.whatIDidLabel || 'What I did:'}
                </span>
                <p className="text-zinc-500 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5 break-words">
                  {decision.whatIDid}
                </p>
              </div>

              {/* Why */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4">
                  {decision.whyLabel || 'Why'}
                </span>
                <p className="text-zinc-500 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5 break-words">
                  {decision.why}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
