import React from 'react';
import { CaseStudySection as CaseStudySectionType, CaseStudyBlock } from '../../types';
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
    <section id={section.id} className="w-full max-w-[1200px] flex flex-col justify-start items-start gap-7 scroll-mt-28">
      {/* Section Header */}
      <div className="w-full flex justify-between items-center border-b border-white/20 pb-4">
        <div className="flex-1 flex flex-col justify-start items-start">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] leading-tight md:leading-[57.20px] uppercase tracking-tight">
            {section.heading}
          </h2>
        </div>
        {/* Subtle indicator from Figma */}
        <div className="w-20 h-6 flex items-center justify-end opacity-25 select-none font-mono text-xs text-white">
          <span>{formattedIndex} / {section.type.toUpperCase().slice(0, 10)}</span>
        </div>
      </div>

      {/* Intro narrative if specified */}
      {section.intro && (
        <div className="w-full flex flex-col justify-start items-start">
          <p className="text-white text-lg sm:text-xl font-normal font-['Plus_Jakarta_Sans'] leading-6 md:leading-7">
            {section.intro}
          </p>
        </div>
      )}

      {/* Blocks sequence */}
      <div className="w-full flex flex-col gap-6">
        {section.blocks && section.blocks.map((block) => renderBlock(block))}
      </div>

      {/* Thin divider under section */}
      <div className="w-full h-0.5 bg-white opacity-80 my-4" />
    </section>
  );
};
