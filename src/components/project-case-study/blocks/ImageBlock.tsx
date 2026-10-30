import React from 'react';
import { ImageBlockItem } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface ImageBlockProps {
  block: ImageBlockItem;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const isFull = block.type === 'fullWidthImage';

  return (
    <div className={`w-full flex flex-col gap-2 my-2 ${isFull ? 'max-w-none' : 'max-w-4xl'}`}>
      <div className="w-full rounded-[5px] overflow-hidden bg-neutral-900 flex justify-center items-center aspect-[16/10] max-h-[660px] group">
        <MediaPreview
          src={block.url || 'https://placehold.co/1079x660/111418/ffffff?text=Image+Unavailable'}
          alt={block.alt || 'Case study illustration'}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          loading="lazy"
          fallbackSrc="https://placehold.co/1079x660/111418/ffffff?text=Image+Asset"
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
