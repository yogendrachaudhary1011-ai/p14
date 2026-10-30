import React from 'react';
import { BulletListBlock as BulletListBlockType } from '../../../types';

interface BulletListBlockProps {
  block: BulletListBlockType;
}

export const BulletListBlock: React.FC<BulletListBlockProps> = ({ block }) => {
  return (
    <div className="w-full min-w-0 flex flex-col gap-3.5 my-2">
      {block.title && (
        <div className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6">
          {block.title}
        </div>
      )}
      <div className="w-full flex flex-col gap-2.5">
        {block.items.map((item, idx) => (
          <div
            key={idx}
            className="text-zinc-500 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5 break-words"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
