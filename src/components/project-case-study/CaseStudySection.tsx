import React from 'react';
import { CaseStudySection as CaseStudySectionType, CaseStudyBlock } from '../../types';
import { useInView } from '../../hooks/useInView';
import { TextBlock } from './blocks/TextBlock';
import { CardGridBlock } from './blocks/CardGridBlock';
import { DecisionBlock } from './blocks/DecisionBlock';
import { TwoColumnComparisonBlock } from './blocks/TwoColumnComparisonBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { CarouselBlock } from './blocks/CarouselBlock';
import { ProductShowcaseBlock } from './blocks/ProductShowcaseBlock';
import { BulletListBlock } from './blocks/BulletListBlock';
import { QuoteBlock, CtaBlock, DividerBlock, SpacerBlock } from './blocks/QuoteCtaBlock';

interface CaseStudySectionProps {
  section: CaseStudySectionType;
  index: number;
}

export const CaseStudySection: React.FC<CaseStudySectionProps> = ({ section, index }) => {
  const [sectionRef, isInView] = useInView<HTMLElement>({
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px',
    triggerOnce: true
  });

  if (!section.visible) return null;

  const renderBlock = (block: CaseStudyBlock) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        return <TextBlock key={block.id} block={block} />;
      case 'cardGrid':
        return <CardGridBlock key={block.id} block={block} />;
      case 'decisionList':
        return <DecisionBlock key={block.id} block={block} />;
      case 'twoColumnComparison':
        return <TwoColumnComparisonBlock key={block.id} block={block} />;
      case 'image':
      case 'fullWidthImage':
        return <ImageBlock key={block.id} block={block} />;
      case 'gallery':
        return <GalleryBlock key={block.id} block={block} />;
      case 'carousel':
        return <CarouselBlock key={block.id} block={block} />;
      case 'productShowcase':
        return <ProductShowcaseBlock key={block.id} block={block} />;
      case 'bulletList':
        return <BulletListBlock key={block.id} block={block} />;
      case 'quote':
        return <QuoteBlock key={block.id} block={block} />;
      case 'cta':
        return <CtaBlock key={block.id} block={block} />;
      case 'divider':
        return <DividerBlock key={block.id} block={block} />;
      case 'spacer':
        return <SpacerBlock key={block.id} block={block} />;
      default:
        return null;
    }
  };

  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <section
      ref={sectionRef}
      id={section.id}
      className={`w-full max-w-[1200px] flex flex-col justify-start items-stretch gap-7 scroll-mt-28 min-w-0 cs-reveal-section ${
        isInView ? 'cs-revealed' : ''
      }`}
    >
      {/* Section Header matching Figma: text-5xl font-bold uppercase leading-[57.20px] with right indicator */}
      <div className="w-full flex justify-between items-center gap-4">
        <div className="flex-1 flex flex-col justify-start items-start min-w-0">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold font-['Plus_Jakarta_Sans',sans-serif] leading-tight md:leading-[57.20px] uppercase tracking-tight break-words">
            {section.heading}
          </h2>
        </div>
        {/* Subtle indicator from Figma */}
        <div className="flex h-6 items-center justify-end opacity-40 hover:opacity-100 transition-opacity select-none font-mono text-xs text-white shrink-0">
          <div className="w-16 h-px relative bg-white/40 flex items-center justify-center">
            <span className="text-[10px] bg-black px-1 font-semibold">{formattedIndex}</span>
          </div>
        </div>
      </div>

      {/* Intro narrative if specified matching Figma text-xl leading-6 */}
      {section.intro && (
        <div className="w-full flex flex-col justify-start items-start">
          <p className="text-white text-lg sm:text-xl font-normal font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed sm:leading-7 break-words [text-wrap:pretty]">
            {section.intro}
          </p>
        </div>
      )}

      {/* Blocks sequence */}
      <div className="w-full min-w-0 flex flex-col gap-6">
        {section.blocks && section.blocks.map((block) => renderBlock(block))}
      </div>

      {/* Crisp white divider under section matching Figma */}
      <div
        className={`w-full h-0.5 bg-white my-6 origin-left transition-transform duration-700 ease-out ${
          isInView ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </section>
  );
};
