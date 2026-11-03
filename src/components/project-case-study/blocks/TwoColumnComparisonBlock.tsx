import React from 'react';
import { TwoColumnComparisonBlock as TwoColumnComparisonBlockType } from '../../../types';

interface TwoColumnComparisonBlockProps {
  block: TwoColumnComparisonBlockType;
  copy: Record<string, string>;
}

export const TwoColumnComparisonBlock: React.FC<TwoColumnComparisonBlockProps> = ({ block, copy }) => {
  return (
    <div className="w-full flex flex-col gap-2.5 my-2">
      {/* 4 Cards matching Figma: First Attempt, Problem, Fix, Learning */}
      <div data-cols="2" className="w-full case-study-card-grid grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* First Attempt */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div
            className="text-lg font-normal leading-6"
            style={{ color: 'var(--cs-card-title, #ffffff)' }}
          >
            {copy.comparisonFirstAttempt}
          </div>
          <div
            className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 break-words"
            style={{ color: 'var(--cs-card-text, #a1a1aa)' }}
          >
            {block.firstAttempt}
          </div>
        </div>

        {/* Problem */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div
            className="text-lg font-normal leading-6"
            style={{ color: 'var(--cs-card-title, #ffffff)' }}
          >
            {copy.comparisonProblem}
          </div>
          <div
            className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 break-words"
            style={{ color: 'var(--cs-card-text, #a1a1aa)' }}
          >
            {block.problem}
          </div>
        </div>
      </div>

      <div data-cols="2" className="w-full case-study-card-grid grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Fix */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div
            className="text-lg font-normal leading-6"
            style={{ color: 'var(--cs-card-title, #ffffff)' }}
          >
            {copy.comparisonFix}
          </div>
          <div
            className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 break-words"
            style={{ color: 'var(--cs-card-text, #a1a1aa)' }}
          >
            {block.fix}
          </div>
        </div>

        {/* Learning */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div
            className="text-lg font-normal leading-6"
            style={{ color: 'var(--cs-card-title, #ffffff)' }}
          >
            {copy.comparisonLearning}
          </div>
          <div
            className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 break-words"
            style={{ color: 'var(--cs-card-text, #a1a1aa)' }}
          >
            {block.learning}
          </div>
        </div>
      </div>
    </div>
  );
};
