import React from 'react';
import { CardGridBlock as CardGridBlockType } from '../../../types';

interface CardGridBlockProps {
  block: CardGridBlockType;
}

export const CardGridBlock: React.FC<CardGridBlockProps> = ({ block }) => {
  const columns = block.columns || 3;
  
  // Decide responsive grid class
  let gridColsClass = 'grid-cols-1 md:grid-cols-3';
  if (columns === 2) {
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else if (columns === 4) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
  }

  return (
    <div className={`w-full grid ${gridColsClass} gap-[5px] md:gap-2 my-2`}>
      {block.cards.map((card, idx) => (
        <div
          key={idx}
          className="flex-1 p-5 bg-zinc-900 rounded-[5px] flex flex-col justify-start items-start gap-2.5 transition-colors hover:bg-zinc-800/80"
        >
          {card.badge && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff853a] px-2 py-0.5 rounded bg-zinc-800">
              {card.badge}
            </span>
          )}
          <div className="w-full flex flex-col justify-start items-start">
            <h4 className="text-white text-lg font-normal font-['Plus_Jakarta_Sans'] leading-6">
              {card.title}
            </h4>
          </div>
          {card.desc && (
            <div className="w-full flex flex-col justify-start items-start">
              <p className="text-zinc-400 text-xs md:text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed">
                {card.desc}
              </p>
            </div>
          )}
          {card.items && card.items.length > 0 && (
            <div className="w-full flex flex-col justify-start items-start gap-2 pt-1">
              {card.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2 text-zinc-400 text-sm md:text-base font-normal font-['Plus_Jakarta_Sans'] leading-snug">
                  <span className="text-zinc-600 select-none">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
