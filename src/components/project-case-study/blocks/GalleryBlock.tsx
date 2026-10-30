import React from 'react';
import { GalleryBlockItem } from '../../../types';

interface GalleryBlockProps {
  block: GalleryBlockItem;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ block }) => {
  const columns = block.columns || 2;
  const colClass = columns === 3 ? 'grid-cols-1 md:grid-cols-3' : columns === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div data-cols={columns} className={`w-full case-study-card-grid grid ${colClass} gap-4 my-2`}>
      {block.images.map((img, idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <div className="rounded-[5px] overflow-hidden border border-white/10 bg-zinc-950 flex justify-center items-center">
            <img
              src={img.url}
              alt={img.alt || `Gallery item ${idx + 1}`}
              className="w-full h-auto object-cover max-h-[500px]"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/181c26/ffffff?text=Gallery+Asset';
              }}
            />
          </div>
          {img.caption && (
            <span className="text-zinc-500 text-xs font-mono">{img.caption}</span>
          )}
        </div>
      ))}
    </div>
  );
};
