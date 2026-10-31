import React from 'react';
import { CardGridBlock as CardGridBlockType } from '../../../types';

interface CardGridBlockProps {
  block: CardGridBlockType;
}

export const CardGridBlock: React.FC<CardGridBlockProps> = ({ block }) => {
  const cards = block.cards || [];
  const cardCount = cards.length;
  const targetCols = block.columns || (cardCount === 2 ? 2 : cardCount >= 3 ? 3 : 2);

  // Decide responsive grid class based on column setting and card count
  let gridColsClass = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';
  if (cardCount === 1) {
    gridColsClass = 'grid-cols-1';
  } else if (targetCols === 2 || cardCount === 2) {
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else if (targetCols === 4 || cardCount === 4) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';
  }

  return (
    <div
      data-cols={targetCols}
      className={`w-full case-study-card-grid grid ${gridColsClass} gap-4 sm:gap-5 my-2`}
    >
      {cards.map((card, idx) => {
        const isLastOddInTwoCols =
          targetCols === 2 && cardCount % 2 === 1 && idx === cardCount - 1;

        return (
          <div
            key={idx}
            className={`w-full h-full min-w-0 p-5 bg-zinc-900 rounded-[5px] border border-transparent hover:border-white/20 flex flex-col justify-start items-start gap-2.5 cs-interactive-card self-stretch ${
              isLastOddInTwoCols ? 'md:col-span-2' : ''
            }`}
          >
            {card.badge && (
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/70 px-2 py-0.5 rounded bg-zinc-800">
                {card.badge}
              </span>
            )}
            <div className="w-full flex flex-col justify-start items-start">
              <h4 className="text-white text-lg font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-6 break-words">
                {card.title}
              </h4>
            </div>
            {card.desc && (
              <div className="w-full flex flex-col justify-start items-start">
                <p className="text-zinc-500 text-xs sm:text-sm font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-4 sm:leading-5 break-words">
                  {card.desc}
                </p>
              </div>
            )}
            {card.items && card.items.length > 0 && (
              <div className="w-full flex flex-col justify-start items-start gap-2 pt-1">
                {card.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-start gap-2 text-zinc-500 text-sm sm:text-base font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-5 break-words"
                  >
                    <span className="text-white/40 select-none text-sm leading-none mt-1 shrink-0">•</span>
                    <span className="min-w-0 flex-1">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
