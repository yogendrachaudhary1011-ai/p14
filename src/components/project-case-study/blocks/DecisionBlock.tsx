import React from 'react';
import { DecisionListBlock } from '../../../types';

interface DecisionBlockProps {
  block: DecisionListBlock;
}

export const DecisionBlock: React.FC<DecisionBlockProps> = ({ block }) => {
  return (
    <div className="w-full flex flex-col gap-8 my-2">
      {block.image && (
        <div className="w-full rounded-[5px] overflow-hidden border border-white/10 bg-zinc-950">
          <img
            src={block.image}
            alt={block.imageAlt || 'Key architecture decision diagram'}
            className="w-full h-auto object-cover max-h-[660px]"
            loading="lazy"
          />
        </div>
      )}

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {block.decisions.map((decision, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-start items-start gap-4 p-6 rounded-[5px] bg-zinc-950/70 border border-white/5 hover:border-white/10 transition-colors"
          >
            <h4 className="text-white text-lg md:text-xl font-normal font-['Plus_Jakarta_Sans'] leading-6 border-b border-white/10 pb-3 w-full">
              {decision.title}
            </h4>

            <div className="w-full flex flex-col gap-3.5">
              {/* Constraint */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4 opacity-70 uppercase tracking-wide">
                  {decision.constraintLabel || 'Constraint:'}
                </span>
                <p className="text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans'] leading-5">
                  {decision.constraint}
                </p>
              </div>

              {/* What I did */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4 opacity-70 uppercase tracking-wide">
                  {decision.whatIDidLabel || 'What I did:'}
                </span>
                <p className="text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans'] leading-5">
                  {decision.whatIDid}
                </p>
              </div>

              {/* Why */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4 opacity-70 uppercase tracking-wide text-[#ff853a]">
                  {decision.whyLabel || 'Why:'}
                </span>
                <p className="text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans'] leading-5">
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
