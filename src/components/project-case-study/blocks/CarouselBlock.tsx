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
    <div className="w-full my-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0b] shadow-[0_24px_70px_rgba(0,0,0,.24)]">
      <div className="relative isolate w-full overflow-hidden bg-[#080a08]">
        <MediaPreview
          key={currentIndex}
          src={currentSlide.url}
          alt={currentSlide.alt || currentSlide.title || `Slide ${currentIndex + 1}`}
          className="block h-auto w-full object-contain transition-all duration-500 ease-out animate-cs-fade-in"
          loading="lazy"
          fallbackSrc="https://placehold.co/884x660/161922/ffffff?text=Design+System+Component"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 p-0 text-white shadow-lg backdrop-blur-md transition duration-200 hover:border-[#b9fc56] hover:bg-[#b9fc56] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9fc56] focus-visible:ring-offset-2 focus-visible:ring-offset-black touch-manipulation sm:left-6 sm:h-12 sm:w-12"
            >
              <span aria-hidden="true" className="material-symbols-rounded block text-[22px] leading-none">arrow_back</span>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 p-0 text-white shadow-lg backdrop-blur-md transition duration-200 hover:border-[#b9fc56] hover:bg-[#b9fc56] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9fc56] focus-visible:ring-offset-2 focus-visible:ring-offset-black touch-manipulation sm:right-6 sm:h-12 sm:w-12"
            >
              <span aria-hidden="true" className="material-symbols-rounded block text-[22px] leading-none">arrow_forward</span>
            </button>
          </>
        )}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-2 backdrop-blur-md" aria-label="Choose a slide">
          {slides.map((slide, idx) => (
            <button
              key={slide.url + "-" + idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={"Go to slide " + (idx + 1)}
              aria-current={currentIndex === idx ? "true" : undefined}
              className={"h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9fc56] focus-visible:ring-offset-2 focus-visible:ring-offset-black " + (currentIndex === idx ? "w-7 bg-[#b9fc56]" : "w-1.5 bg-white/45 hover:bg-white")}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
