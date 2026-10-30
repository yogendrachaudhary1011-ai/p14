import React, { useRef } from 'react';
import { ProductShowcaseBlockItem } from '../../../types';

interface ProductShowcaseBlockProps {
  block: ProductShowcaseBlockItem;
}

export const ProductShowcaseBlock: React.FC<ProductShowcaseBlockProps> = ({ block }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const screens = block.screens || [];

  if (screens.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 my-2">
      {/* Scroll navigation arrows for desktop */}
      <div className="flex justify-between items-center px-1">
        <span className="text-zinc-500 text-xs font-mono tracking-wider uppercase">
          {block.subtitle || 'Desktop (1440px) & Mobile (428px) Workflows'} · {screens.length} Screens
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-rounded text-sm">arrow_back</span>
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-rounded text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent flex gap-6 scroll-smooth"
      >
        {screens.map((screen, idx) => {
          const isMobile = screen.device === 'mobile';
          return (
            <div
              key={idx}
              className={`shrink-0 ${
                isMobile ? 'w-[280px] sm:w-[320px]' : 'w-[360px] sm:w-[440px]'
              } h-[580px] rounded-[10px] overflow-hidden border border-white/10 bg-zinc-950 flex flex-col shadow-2xl transition-transform hover:-translate-y-1`}
            >
              {/* Device Frame Top Bar */}
              <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono select-none">
                <span className="truncate pr-2 font-medium text-white">{screen.label || `Screen #${idx + 1}`}</span>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-[#ff853a]">
                  {isMobile ? '428 px' : '1440 px'}
                </span>
              </div>

              {/* Scrollable screen interior */}
              <div className="flex-1 overflow-y-auto bg-black p-1 scrollbar-thin scrollbar-thumb-zinc-800">
                <img
                  src={screen.url}
                  alt={screen.label || `Product Screen ${idx + 1}`}
                  className="w-full h-auto object-cover rounded-sm"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/554x1200/181c25/ffffff?text=Product+Screen';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
