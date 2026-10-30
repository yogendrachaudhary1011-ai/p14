import React, { useState } from 'react';
import { CarouselBlockItem } from '../../../types';

interface CarouselBlockProps {
  block: CarouselBlockItem;
}

export const CarouselBlock: React.FC<CarouselBlockProps> = ({ block }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = block.slides || [];

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
      <div className="relative w-full rounded-[5px] overflow-hidden bg-neutral-900 border border-white/10 aspect-[16/10] max-h-[660px] flex items-center justify-center group">
        <img
          key={currentIndex}
          src={currentSlide.url}
          alt={currentSlide.alt || currentSlide.title || `Slide ${currentIndex + 1}`}
          className="w-full h-full object-contain md:object-cover transition-all duration-500 ease-out animate-cs-fade-in"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/884x660/161922/ffffff?text=Design+System+Component';
          }}
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
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-rounded text-xl">chevron_left</span>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-rounded text-xl">chevron_right</span>
            </button>

            {/* Pagination dots matching Figma pill shape */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-7 px-3 bg-black/40 hover:bg-black/70 rounded-[50px] inline-flex justify-center items-center gap-1.5 backdrop-blur-md border border-white/10 transition-all">
              {slides.map((_, idx) => (
                <button
                  key={idx}
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
