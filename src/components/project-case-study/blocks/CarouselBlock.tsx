import React, { useEffect, useRef, useState } from 'react';
import { CarouselBlockItem } from '../../../types';
import { MediaPreview } from '../../MediaPreview';

interface CarouselBlockProps {
  block: CarouselBlockItem;
}

export const CarouselBlock: React.FC<CarouselBlockProps> = ({ block }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const slides = (block.slides || []).filter((slide) => slide.url?.trim());
  const slideKey = slides.map((slide) => slide.url).join('|');

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(0, slides.length - 1)));
  }, [slideKey, slides.length]);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const outgoingSlide = outgoingIndex === null ? null : slides[outgoingIndex];

  const changeSlide = async (nextIndex: number, direction: 'next' | 'prev') => {
    if (isPreparing || outgoingIndex !== null || nextIndex === currentIndex || slides.length < 2) return;
    setIsPreparing(true);

    const nextSlide = slides[nextIndex];
    const image = new Image();
    image.src = nextSlide.url;
    try {
      await Promise.race([
        image.decode(),
        new Promise((resolve) => setTimeout(resolve, 400))
      ]);
    } catch {
      // Let the normal image fallback handle failed assets.
    }



    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    setSlideDirection(direction);
    setIsTransitioning(false);
    setOutgoingIndex(currentIndex);
    setCurrentIndex(nextIndex);
    setIsPreparing(false);

    // Give the incoming and outgoing positions a paint before starting the motion.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsTransitioning(true));
    });

    transitionTimer.current = window.setTimeout(() => {
      setOutgoingIndex(null);
      setIsTransitioning(false);
      transitionTimer.current = null;
    }, 340);
  };

  const nextSlide = () => void changeSlide(currentIndex < slides.length - 1 ? currentIndex + 1 : 0, 'next');
  const prevSlide = () => void changeSlide(currentIndex > 0 ? currentIndex - 1 : slides.length - 1, 'prev');

  return (
    <div className="my-3 w-full overflow-hidden border border-white/10 bg-[#0b0d0b] shadow-[0_24px_70px_rgba(0,0,0,.24)]">
      <div
        className="relative isolate h-[420px] w-full overflow-hidden bg-[#080a08] sm:h-[520px] lg:h-[620px]"
      >
        {outgoingSlide && (
          <MediaPreview
            key={'outgoing-' + outgoingIndex}
            src={outgoingSlide.url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              transition: 'transform 280ms cubic-bezier(0.22, 0.72, 0.18, 1)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: isTransitioning ? `translate3d(${slideDirection === 'next' ? '-100%' : '100%'}, 0, 0)` : 'translate3d(0, 0, 0)'
            }}
            loading="eager"
          />
        )}
        <MediaPreview
          key={currentIndex}
          src={currentSlide.url}
          alt={currentSlide.alt || currentSlide.title || `Slide ${currentIndex + 1}`}
          className="absolute inset-0 z-[1] h-full w-full object-contain"
          style={{
            transition: 'transform 280ms cubic-bezier(0.22, 0.72, 0.18, 1)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: outgoingSlide && !isTransitioning
              ? `translate3d(${slideDirection === 'next' ? '100%' : '-100%'}, 0, 0)`
              : 'translate3d(0, 0, 0)'
          }}
          loading={outgoingSlide ? 'eager' : 'lazy'}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              disabled={isPreparing || outgoingIndex !== null}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 p-0 text-white shadow-lg backdrop-blur-md transition duration-200 hover:border-[#b9fc56] hover:bg-[#b9fc56] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9fc56] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-75 touch-manipulation sm:left-6 sm:h-12 sm:w-12"
            >
              <span aria-hidden="true" className="material-symbols-rounded block text-[22px] leading-none">arrow_back</span>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              disabled={isPreparing || outgoingIndex !== null}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 p-0 text-white shadow-lg backdrop-blur-md transition duration-200 hover:border-[#b9fc56] hover:bg-[#b9fc56] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9fc56] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-75 touch-manipulation sm:right-6 sm:h-12 sm:w-12"
            >
              <span aria-hidden="true" className="material-symbols-rounded block text-[22px] leading-none">arrow_forward</span>
            </button>
          </>
        )}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-2 backdrop-blur-md" aria-label="Choose a slide">
            {slides.map((slide, idx) => (
              <button
                key={slide.url + '-' + idx}
                type="button"
                onClick={() => void changeSlide(idx, idx >= currentIndex ? 'next' : 'prev')}
                disabled={isPreparing || outgoingIndex !== null}
                aria-label={'Go to slide ' + (idx + 1)}
                aria-current={currentIndex === idx ? 'true' : undefined}
                className={'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9fc56] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait ' + (currentIndex === idx ? 'w-7 bg-[#b9fc56]' : 'w-1.5 bg-white/45 hover:bg-white')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
