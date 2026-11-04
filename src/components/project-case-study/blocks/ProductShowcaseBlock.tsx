import React, { useRef } from 'react';
import { ProductShowcaseBlockItem } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface ProductShowcaseBlockProps {
  block: ProductShowcaseBlockItem;
}

export const ProductShowcaseBlock: React.FC<ProductShowcaseBlockProps> = ({ block }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const screens = (block.screens || [])
    .map((screen, idx) => {
      if (typeof screen === 'string') {
        const url = (screen as string).trim();
        return url ? { url, label: `Screen #${idx + 1}`, device: 'desktop' as const } : null;
      }
      if (screen && typeof screen === 'object') {
        const url = (screen.url || (screen as any).src || '').trim();
        return url ? { url, label: screen.label || `Screen #${idx + 1}`, device: screen.device || 'desktop' } : null;
      }
      return null;
    })
    .filter((s): s is { url: string; label: string; device: 'desktop' | 'mobile' } => s !== null);

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
        <span
          className="text-xs font-mono tracking-wider uppercase cs-muted"
          style={{ color: 'var(--cs-muted, #71717a)' }}
        >
          {block.subtitle || 'Desktop (1440px) & Mobile (428px) Workflows'} · {screens.length} Screens
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
          >
            <span className="material-symbols-rounded text-sm">arrow_back</span>
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
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
                isMobile ? 'w-[76vw] sm:w-[300px] md:w-[320px]' : 'w-[84vw] sm:w-[380px] md:w-[440px]'
              } max-w-[440px] h-[480px] sm:h-[540px] md:h-[580px] rounded-[10px] overflow-hidden border border-white/10 bg-zinc-950 flex flex-col shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-white/30 hover:shadow-[0_24px_48px_rgba(0,0,0,0.85)]`}
              style={{
                backgroundColor: 'var(--cs-card-bg, #09090b)',
                borderColor: 'var(--cs-card-border, rgba(255, 255, 255, 0.1))'
              }}
            >
              {/* Device Frame Top Bar */}
              <div
                className="px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between text-xs font-mono select-none"
                style={{
                  borderBottomColor: 'var(--cs-card-border, rgba(255, 255, 255, 0.1))'
                }}
              >
                <span
                  className="truncate pr-2 font-medium"
                  style={{ color: 'var(--cs-heading, #ffffff)' }}
                >
                  {screen.label || `Screen #${idx + 1}`}
                </span>
                <span
                  className="shrink-0 text-[10px] px-2 py-0.5 rounded font-mono font-medium border"
                  style={{
                    color: 'var(--cs-accent-text, #8be28b)',
                    backgroundColor: 'color-mix(in srgb, var(--cs-accent, #8be28b) 12%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--cs-accent, #8be28b) 25%, transparent)'
                  }}
                >
                  {isMobile ? '428 px' : '1440 px'}
                </span>
              </div>

              {/* Scrollable screen interior */}
              <div className="flex-1 overflow-y-auto bg-black p-1 scrollbar-thin scrollbar-thumb-zinc-800">
                <MediaPreview
                  src={screen.url}
                  alt={screen.label || `Product Screen ${idx + 1}`}
                  className="w-full h-auto object-contain rounded-sm"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

