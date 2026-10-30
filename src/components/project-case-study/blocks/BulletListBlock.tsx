import React from 'react';
import { BulletListBlock as BulletListBlockType } from '../../../types';

interface BulletListBlockProps {
  block: BulletListBlockType;
}

export const BulletListBlock: React.FC<BulletListBlockProps> = ({ block }) => {
  return (
    <div className="w-full flex flex-col gap-3 my-2">
      {block.title && (
        <h4 className="text-white text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
          {block.title}
        </h4>
      )}
      <div className="w-full flex flex-col gap-2.5">
        {block.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-zinc-400 text-base font-normal font-['Plus_Jakarta_Sans'] leading-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff853a] mt-2 shrink-0"></span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
