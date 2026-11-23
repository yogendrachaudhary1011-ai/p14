import React from 'react';
import { ParagraphBlock, HeadingBlock } from '../../../types';

interface TextBlockProps {
  block: ParagraphBlock | HeadingBlock;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block }) => {
  if (block.type === 'heading') {
    const level = block.level || 3;
    if (level === 2) {
      return (
        <h3
          className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-[1.2] mt-4 mb-2 break-words"
          style={{ color: 'var(--cs-heading, #ffffff)' }}
        >
          {block.text}
        </h3>
      );
    }
    if (level === 4) {
      return (
        <h4
          className="text-base sm:text-lg md:text-xl font-semibold leading-[1.35] mt-2 mb-1 break-words"
          style={{ color: 'var(--cs-heading, #ffffff)' }}
        >
          {block.text}
        </h4>
      );
    }
    return (
      <h3
        className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight leading-[1.25] mt-3 mb-2 break-words"
        style={{ color: 'var(--cs-heading, #ffffff)' }}
      >
        {block.text}
      </h3>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start items-start">
      <p
        className="text-base sm:text-lg font-normal leading-[1.65] break-words [text-wrap:pretty]"
        style={{ color: 'var(--cs-body, #ffffff)' }}
      >
        {block.text}
      </p>
    </div>
  );
};
