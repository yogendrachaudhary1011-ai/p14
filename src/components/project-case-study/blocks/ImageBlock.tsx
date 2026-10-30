import React from 'react';
import { ImageBlockItem } from '../../../types';

interface ImageBlockProps {
  block: ImageBlockItem;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const isFull = block.type === 'fullWidthImage';

  return (
    <div className={`w-full flex flex-col gap-2 my-2 ${isFull ? 'max-w-none' : 'max-w-4xl'}`}>
      <div className="w-full rounded-[5px] overflow-hidden border border-white/10 bg-zinc-950 flex justify-center items-center">
        <img
          src={block.url || 'https://placehold.co/1079x660/111418/ffffff?text=Image+Unavailable'}
          alt={block.alt || 'Case study illustration'}
          className="w-full h-auto object-cover max-h-[660px]"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/1079x660/111418/ffffff?text=Image+Asset';
          }}
        />
      </div>
      {block.caption && (
        <span className="text-zinc-500 text-xs font-mono tracking-wide px-1">
          {block.caption}
        </span>
      )}
    </div>
  );
};
