import React from 'react';
import { BulletListBlock as BulletListBlockType } from '../../../types';

interface BulletListBlockProps {
  block: BulletListBlockType;
}

export const BulletListBlock: React.FC<BulletListBlockProps> = ({ block }) => {
  return (
    <div className="w-full min-w-0 p-5 sm:p-6 md:p-7 rounded-[8px] bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-3.5 my-3 sm:my-4 shadow-sm">
      {block.title && (
        <h4 className="text-white text-base sm:text-lg md:text-xl font-semibold font-['Plus_Jakarta_Sans'] leading-snug border-b border-white/10 pb-2.5 break-words">
          {block.title}
        </h4>
      )}
      <div className="w-full flex flex-col gap-2.5 pt-1">
        {block.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 text-zinc-400 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans'] leading-relaxed break-words"
          >
            <span className="text-[#ff853a] select-none text-base leading-none mt-1 shrink-0">•</span>
            <span className="min-w-0 flex-1">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
