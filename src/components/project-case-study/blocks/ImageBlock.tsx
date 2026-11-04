import React from 'react';
import { ImageBlockItem } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface ImageBlockProps {
  block: ImageBlockItem;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const imageUrl = block.url?.trim() || '';
  if (!imageUrl) return null;
  const isFull = block.type === 'fullWidthImage';

  return (
    <div className={`w-full flex flex-col gap-2 my-2 ${isFull ? 'max-w-none' : 'max-w-4xl mx-auto'}`}>
      <div className="w-full min-h-[220px] sm:min-h-[340px] rounded-[5px] overflow-hidden bg-neutral-900/40 flex justify-center items-center group">
        <MediaPreview
          src={imageUrl}
          alt={block.alt || 'Case study illustration'}
          className="w-full h-auto max-w-full object-contain block rounded-[5px]"
          loading="lazy"
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

