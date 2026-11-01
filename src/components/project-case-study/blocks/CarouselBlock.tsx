import React, { useEffect, useState } from 'react';
import { CarouselBlockItem } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface CarouselBlockProps {
  block: CarouselBlockItem;
}

export const CarouselBlock: React.FC<CarouselBlockProps> = ({ block }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = (block.slides || []).filter((slide) => slide.url?.trim());
  const slideKey = slides.map((slide) => slide.url).join('|');

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(0, slides.length - 1)));
  }, [slideKey, slides.length]);

  if (slides.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="w-full my-2 flex flex-col gap-3">
      {/* Container matching Figma styling: dark neutral backdrop, rounded, framed */}
      <div className="relative isolate w-full rounded-[5px] overflow-hidden bg-neutral-900 border border-white/10 aspect-[16/10] max-h-[660px] flex items-center justify-center group">
        <MediaPreview
          key={currentIndex}
          src={currentSlide.url}
          alt={currentSlide.alt || currentSlide.title || `Slide ${currentIndex + 1}`}
          className="w-full h-full object-contain md:object-cover transition-all duration-500 ease-out animate-cs-fade-in"
          loading="lazy"
          fallbackSrc="https://placehold.co/884x660/161922/ffffff?text=Design+System+Component"
        />

        {/* Title overlay in top corner if available */}
        {currentSlide.title && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded bg-black/70 backdrop-blur-md text-white text-xs font-mono border border-white/10 select-none transition-all">
            {currentSlide.title} ({currentIndex + 1} / {slides.length})
          </div>
        )}

        {/* Chevron buttons */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute z-20 left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/95 text-white flex items-center justify-center backdrop-blur-md border border-white/30 transition-colors duration-200 cursor-pointer opacity-100 pointer-events-auto touch-manipulation"
            >
              <span className="material-symbols-rounded text-xl">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute z-20 right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/95 text-white flex items-center justify-center backdrop-blur-md border border-white/30 transition-colors duration-200 cursor-pointer opacity-100 pointer-events-auto touch-manipulation"
            >
              <span className="material-symbols-rounded text-xl">chevron_right</span>
            </button>

            {/* Pagination dots matching Figma pill shape */}
            <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 h-7 px-3 bg-black/60 rounded-[50px] inline-flex justify-center items-center gap-1.5 backdrop-blur-md border border-white/20 pointer-events-auto">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-[5px] transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-5 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

