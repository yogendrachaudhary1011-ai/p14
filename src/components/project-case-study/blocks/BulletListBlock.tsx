import React from 'react';
import { BulletListBlock as BulletListBlockType } from '../../../types';

interface BulletListBlockProps {
  block: BulletListBlockType;
}

export const BulletListBlock: React.FC<BulletListBlockProps> = ({ block }) => {
  return (
    <div className="w-full min-w-0 flex flex-col gap-3.5 my-2">
      {block.title && (
        <div
          className="text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 cs-heading"
          style={{ color: 'var(--cs-heading, #ffffff)' }}
        >
          {block.title}
        </div>
      )}
      <div className="w-full flex flex-col gap-3">
        {block.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 text-sm sm:text-base font-normal leading-relaxed break-words group"
            style={{ color: 'var(--cs-bullet-text, var(--cs-body, #ffffff))' }}
          >
            <span
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 shrink-0 transition-transform duration-200 group-hover:scale-125"
              style={{
                backgroundColor: 'var(--cs-bullet-dot, var(--cs-accent, #8be28b))',
                boxShadow: '0 0 8px var(--cs-bullet-dot, rgba(139,226,139,0.5))'
              }}
              aria-hidden="true"
            />
            <span className="flex-1 min-w-0">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
