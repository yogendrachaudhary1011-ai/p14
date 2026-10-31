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
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">
            {copy.comparisonFirstAttempt}
          </div>
          <div className="text-zinc-500 text-xs sm:text-sm font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4 sm:leading-5 break-words">
            {block.firstAttempt}
          </div>
        </div>

        {/* Problem */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">
            {copy.comparisonProblem}
          </div>
          <div className="text-zinc-500 text-xs sm:text-sm font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4 sm:leading-5 break-words">
            {block.problem}
          </div>
        </div>
      </div>

      <div data-cols="2" className="w-full case-study-card-grid grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Fix */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">
            {copy.comparisonFix}
          </div>
          <div className="text-zinc-500 text-xs sm:text-sm font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4 sm:leading-5 break-words">
            {block.fix}
          </div>
        </div>

        {/* Learning */}
        <div className="w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">
            {copy.comparisonLearning}
          </div>
          <div className="text-zinc-500 text-xs sm:text-sm font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4 sm:leading-5 break-words">
            {block.learning}
          </div>
        </div>
      </div>
    </div>
  );
};
