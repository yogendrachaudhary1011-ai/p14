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
        <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight mt-4 mb-2 break-words">
          {block.text}
        </h3>
      );
    }
    if (level === 4) {
      return (
        <h4 className="text-white text-base sm:text-lg md:text-xl font-semibold font-['Plus_Jakarta_Sans'] mt-2 mb-1 break-words">
          {block.text}
        </h4>
      );
    }
    return (
      <h3 className="text-white text-lg sm:text-xl md:text-2xl font-semibold font-['Plus_Jakarta_Sans'] tracking-tight mt-3 mb-2 break-words">
        {block.text}
      </h3>
    );
  }

  // Paragraph
  return (
    <div className={`w-full flex flex-col justify-start items-start ${block.highlight ? 'text-[#ff853a]' : 'text-white'}`}>
      <p className="text-base sm:text-lg md:text-xl font-normal font-['Plus_Jakarta_Sans'] leading-relaxed md:leading-7 break-words">
        {block.text}
      </p>
    </div>
  );
};
