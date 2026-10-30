import React from 'react';
import { GalleryBlockItem } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface GalleryBlockProps {
  block: GalleryBlockItem;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ block }) => {
  const columns = block.columns || 2;
  const colClass = columns === 3 ? 'grid-cols-1 md:grid-cols-3' : columns === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div data-cols={columns} className={`w-full case-study-card-grid grid ${colClass} gap-4 my-2`}>
      {block.images.map((img, idx) => (
        <div key={idx} className="flex flex-col gap-1.5 group">
          <div className="rounded-[5px] overflow-hidden border border-white/10 bg-zinc-950 flex justify-center items-center transition-all duration-300 group-hover:border-white/30 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
            <MediaPreview
              src={img.url}
              alt={img.alt || `Gallery item ${idx + 1}`}
              className="w-full h-auto object-cover max-h-[500px]"
              loading="lazy"
              fallbackSrc="https://placehold.co/800x600/181c26/ffffff?text=Gallery+Asset"
            />
          </div>
          {img.caption && (
            <span className="text-zinc-500 text-xs font-mono transition-colors group-hover:text-zinc-400">{img.caption}</span>
          )}
        </div>
      ))}
    </div>
  );
};

