import React from 'react';
import { TwoColumnComparisonBlock as TwoColumnComparisonBlockType } from '../../../types';

interface TwoColumnComparisonBlockProps {
  block: TwoColumnComparisonBlockType;
}

export const TwoColumnComparisonBlock: React.FC<TwoColumnComparisonBlockProps> = ({ block }) => {
  return (
    <div className="w-full flex flex-col gap-[5px] md:gap-3 my-2">
      {/* Row 1: First Attempt & Problem */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-[5px] md:gap-3">
        {/* First Attempt */}
        <div className="p-5 bg-zinc-900 rounded-[5px] flex flex-col justify-start items-start gap-2.5 border-l-2 border-red-500/40">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
            First Attempt:
          </div>
          <div className="text-zinc-400 text-xs md:text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed">
            {block.firstAttempt}
          </div>
        </div>

        {/* Problem */}
        <div className="p-5 bg-zinc-900 rounded-[5px] flex flex-col justify-start items-start gap-2.5 border-l-2 border-red-500/40">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
            Problem:
          </div>
          <div className="text-zinc-400 text-xs md:text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed">
            {block.problem}
          </div>
        </div>
      </div>

      {/* Row 2: Fix & Learning */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-[5px] md:gap-3">
        {/* Fix */}
        <div className="p-5 bg-zinc-900 rounded-[5px] flex flex-col justify-start items-start gap-2.5 border-l-2 border-emerald-500/50">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
            Fix:
          </div>
          <div className="text-zinc-400 text-xs md:text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed">
            {block.fix}
          </div>
        </div>

        {/* Learning */}
        <div className="p-5 bg-zinc-900 rounded-[5px] flex flex-col justify-start items-start gap-2.5 border-l-2 border-[#ff853a]/60">
          <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
            Learning:
          </div>
          <div className="text-zinc-400 text-xs md:text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed">
            {block.learning}
          </div>
        </div>
      </div>
    </div>
  );
};
