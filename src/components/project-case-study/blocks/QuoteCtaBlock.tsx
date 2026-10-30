import React from 'react';
import { QuoteBlockItem, CtaBlockItem, DividerBlockItem, SpacerBlockItem } from '../../../types';

export const QuoteBlock: React.FC<{ block: QuoteBlockItem }> = ({ block }) => {
  return (
    <div className="w-full my-4 p-6 md:p-8 rounded-[5px] bg-zinc-950 border-l-4 border-[#ff853a] flex flex-col gap-3">
      <blockquote className="text-white text-xl md:text-2xl font-normal font-['Plus_Jakarta_Sans'] italic leading-relaxed">
        “{block.quote}”
      </blockquote>
      {(block.author || block.role) && (
        <div className="text-zinc-400 text-sm font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          {block.author && <span className="font-semibold text-white">{block.author}</span>}
          {block.author && block.role && <span className="text-zinc-600">·</span>}
          {block.role && <span>{block.role}</span>}
        </div>
      )}
    </div>
  );
};

export const CtaBlock: React.FC<{ block: CtaBlockItem }> = ({ block }) => {
  const isPrimary = block.style !== 'outline';
  return (
    <div className="w-full my-4 flex justify-start items-center">
      <a
        href={block.url}
        target={block.isExternal ? '_blank' : '_self'}
        rel={block.isExternal ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-[5px] text-base font-medium font-['Plus_Jakarta_Sans'] transition-all ${
          isPrimary
            ? 'bg-white text-black hover:bg-zinc-200'
            : 'border-[1.60px] border-white text-white hover:bg-white hover:text-black'
        }`}
      >
        <span>{block.label}</span>
        {block.isExternal && <span className="material-symbols-rounded text-sm">open_in_new</span>}
      </a>
    </div>
  );
};

export const DividerBlock: React.FC<{ block: DividerBlockItem }> = () => {
  return <div className="w-full h-0.5 bg-white/20 my-6" />;
};

export const SpacerBlock: React.FC<{ block: SpacerBlockItem }> = ({ block }) => {
  const heightClass = block.height === 'sm' ? 'h-6' : block.height === 'lg' ? 'h-20' : 'h-12';
  return <div className={`w-full ${heightClass}`} />;
};
