import React from 'react';
import { TwoColumnComparisonBlock as TwoColumnComparisonBlockType } from '../../../types';

interface TwoColumnComparisonBlockProps {
  block: TwoColumnComparisonBlockType;
}

export const TwoColumnComparisonBlock: React.FC<TwoColumnComparisonBlockProps> = ({ block }) => {
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6 my-3 sm:my-4">
      {/* Row 1: First Attempt & Problem */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* First Attempt */}
        <div className="w-full h-full min-w-0 p-5 sm:p-6 bg-zinc-900/90 rounded-[8px] flex flex-col justify-start items-start gap-3 border-l-4 border-l-red-500/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="text-white text-base sm:text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-6">
            First Attempt:
          </div>
          <div className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-relaxed break-words">
            {block.firstAttempt}
          </div>
        </div>

        {/* Problem */}
        <div className="w-full h-full min-w-0 p-5 sm:p-6 bg-zinc-900/90 rounded-[8px] flex flex-col justify-start items-start gap-3 border-l-4 border-l-red-500/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="text-white text-base sm:text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-6">
            Problem:
          </div>
          <div className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-relaxed break-words">
            {block.problem}
          </div>
        </div>
      </div>

      {/* Row 2: Fix & Learning */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Fix */}
        <div className="w-full h-full min-w-0 p-5 sm:p-6 bg-zinc-900/90 rounded-[8px] flex flex-col justify-start items-start gap-3 border-l-4 border-l-emerald-500/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="text-white text-base sm:text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-6">
            Fix:
          </div>
          <div className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-relaxed break-words">
            {block.fix}
          </div>
        </div>

        {/* Learning */}
        <div className="w-full h-full min-w-0 p-5 sm:p-6 bg-zinc-900/90 rounded-[8px] flex flex-col justify-start items-start gap-3 border-l-4 border-l-[#ff853a]/70 border border-white/10 hover:border-white/20 transition-all">
          <div className="text-white text-base sm:text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-6">
            Learning:
          </div>
          <div className="text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-relaxed break-words">
            {block.learning}
          </div>
        </div>
      </div>
    </div>
  );
};
