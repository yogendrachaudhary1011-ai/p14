import React, { useRef, useState } from 'react';
import {
  CaseStudySection,
  CaseStudyBlock,
  SectionType,
  CaseStudyBlockType,
  MediaAsset
} from '../../types';
import { createDefaultSection, createDefaultBlock } from '../../utils/caseStudyUtils';
import { MediaPreview } from '../MediaPreview';
import { Upload } from 'lucide-react';
import { MediaUploadField } from './MediaUploadField';

interface CaseStudyBuilderProps {
  sections: CaseStudySection[];
  onChange: (updatedSections: CaseStudySection[]) => void;
  mediaLibrary?: MediaAsset[];
  onUploadMedia?: (file: File) => Promise<MediaAsset>;
}

export const CaseStudyBuilder: React.FC<CaseStudyBuilderProps> = ({
  sections,
  onChange,
  mediaLibrary = [],
  onUploadMedia
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => sections[0]?.id || '');
  const [newSectionType, setNewSectionType] = useState<SectionType>('problem');
  const [newBlockType, setNewBlockType] = useState<CaseStudyBlockType>('paragraph');
  const [uploadingSectionMedia, setUploadingSectionMedia] = useState(false);
  const [sectionUploadMessage, setSectionUploadMessage] = useState<string | null>(null);
  const sectionMediaInputRef = useRef<HTMLInputElement>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const selectedSectionImageCount = (selectedSection?.blocks || []).reduce((count, block) => {
    if (block.type === 'image' || block.type === 'fullWidthImage') return count + (block.url ? 1 : 0);
    if (block.type === 'gallery') return count + block.images.length;
    if (block.type === 'carousel') return count + block.slides.filter((slide) => !slide.url.includes('placehold.co')).length;
    if (block.type === 'productShowcase') return count + block.screens.filter((screen) => !screen.url.includes('placehold.co')).length;
    return count;
  }, 0);

  const handleUpdateSection = (sectionId: string, updates: Partial<CaseStudySection>) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s));
    onChange(updated);
  };

  const handleAddSection = () => {
    const newSec = createDefaultSection(newSectionType, sections.length + 1);
    const updated = [...sections, newSec];
    onChange(updated);
    setSelectedSectionId(newSec.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      return;
    }
    const updated = sections.filter((s) => s.id !== sectionId);
    onChange(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || '');
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;
    const duplicated: CaseStudySection = {
      ...target,
      id: `${target.type}-${Date.now()}`,
      navigationLabel: `${target.navigationLabel} (Copy)`,
      heading: `${target.heading} (COPY)`,
      order: sections.length + 1,
      blocks: target.blocks.map((b) => ({ ...b, id: `blk-${Date.now()}-${Math.random()}` }))
    };
    const updated = [...sections, duplicated];
    onChange(updated);
    setSelectedSectionId(duplicated.id);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const cloned = [...sections];
    const temp = cloned[idx];
    cloned[idx] = cloned[swapIdx];
    cloned[swapIdx] = temp;

    // Reassign orders
    const reordered = cloned.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
  };

  // Block handlers for selected section
  const handleAddBlock = () => {
    if (!selectedSection) return;
    const newBlk = createDefaultBlock(newBlockType);
    const updatedBlocks = [...(selectedSection.blocks || []), newBlk];
    handleUpdateSection(selectedSection.id, { blocks: updatedBlocks });
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<CaseStudyBlock>) => {
    if (!selectedSection) return;
    const updatedBlocks = selectedSection.blocks.map((b) =>
      b.id === blockId ? ({ ...b, ...updates } as CaseStudyBlock) : b
    );
    handleUpdateSection(selectedSection.id, { blocks: updatedBlocks });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!selectedSection) return;
    const updatedBlocks = selectedSection.blocks.filter((b) => b.id !== blockId);
    handleUpdateSection(selectedSection.id, { blocks: updatedBlocks });
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!selectedSection) return;
    const blocks = selectedSection.blocks || [];
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === blocks.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const cloned = [...blocks];
    const temp = cloned[idx];
    cloned[idx] = cloned[swapIdx];
    cloned[swapIdx] = temp;

    handleUpdateSection(selectedSection.id, { blocks: cloned });
  };

  const handleSectionMediaUpload = async (files: FileList | null) => {
    if (!selectedSection || !files?.length || !onUploadMedia) return;
    setUploadingSectionMedia(true);
    setSectionUploadMessage(null);
    const uploaded: MediaAsset[] = [];
    const failures: string[] = [];
    for (const file of Array.from(files)) {
      try {
        uploaded.push(await onUploadMedia(file));
      } catch (error) {
        failures.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }
    if (uploaded.length) {
      const imageAssets = uploaded.filter((asset) => asset.mimeType.startsWith('image/'));
      const blocks = [...(selectedSection.blocks || [])];
      if (selectedSection.type === 'designSystem') {
        let carousel = blocks.find((block) => block.type === 'carousel');
        if (!carousel) {
          carousel = { id: `blk-${Date.now()}-carousel`, type: 'carousel', slides: [] };
          blocks.push(carousel);
        }
        if (carousel.type === 'carousel') {
          const realSlides = carousel.slides.filter((slide) => !slide.url.includes('placehold.co'));
          const slides = [...realSlides, ...imageAssets.map((asset, index) => ({
            url: asset.url,
            title: asset.name || `Design system image ${realSlides.length + index + 1}`,
            alt: asset.name || `Design system image ${realSlides.length + index + 1}`
          }))];
          const at = blocks.findIndex((block) => block.id === carousel?.id);
          blocks[at] = { ...carousel, slides };
        }
      } else if (selectedSection.type === 'product') {
        let showcase = blocks.find((block) => block.type === 'productShowcase');
        if (!showcase) {
          showcase = { id: `blk-${Date.now()}-showcase`, type: 'productShowcase', screens: [] };
          blocks.push(showcase);
        }
        if (showcase.type === 'productShowcase') {
          const realScreens = showcase.screens.filter((screen) => !screen.url.includes('placehold.co'));
          const screens = [...realScreens, ...imageAssets.map((asset, index) => ({
            url: asset.url,
            label: asset.name || `Product screen ${realScreens.length + index + 1}`,
            device: (realScreens.length + index) % 2 === 0 ? 'desktop' as const : 'mobile' as const
          }))];
          const at = blocks.findIndex((block) => block.id === showcase?.id);
          blocks[at] = { ...showcase, screens };
        }
      } else {
        blocks.push(...imageAssets.map((asset) => ({
          id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'fullWidthImage' as const,
          url: asset.url,
          alt: asset.name
        })));
      }
      handleUpdateSection(selectedSection.id, { blocks });
      const skipped = uploaded.length - imageAssets.length;
      setSectionUploadMessage(`${imageAssets.length} image${imageAssets.length === 1 ? '' : 's'} uploaded to Supabase and added to ${selectedSection.navigationLabel || selectedSection.heading}.${skipped ? ` ${skipped} non-image file${skipped === 1 ? '' : 's'} skipped.` : ''}${failures.length ? ` ${failures.join(' · ')}` : ''}`);
    } else {
      setSectionUploadMessage(failures.join(' · ') || 'No images were uploaded.');
    }
    setUploadingSectionMedia(false);
    if (sectionMediaInputRef.current) sectionMediaInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-6 font-['Plus_Jakarta_Sans']">
      {/* Top Section Navigator & Add Section Bar */}
      <div className="p-4 rounded-[8px] bg-zinc-900 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-white font-semibold text-base">Case Study Section Tree</h3>
          <p className="text-zinc-400 text-xs">
            Manage the ordered chapters and visual blocks of this case study.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <select
            value={newSectionType}
            onChange={(e) => setNewSectionType(e.target.value as SectionType)}
            className="px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs flex-1 sm:flex-initial"
          >
            <option value="problem">The Problem</option>
            <option value="challenge">My Challenge</option>
            <option value="insights">Insights (The aha moment)</option>
            <option value="keyDecisions">Key Decisions &amp; Why?</option>
            <option value="solution">Solution</option>
            <option value="whyItWorks">Why this approach works</option>
            <option value="whatDidNotWork">What didn’t work</option>
            <option value="designSystem">Design System Carousel</option>
            <option value="product">The Product Showcase</option>
            <option value="learnings">Learnings</option>
            <option value="whatIdDoDifferently">What I&apos;d do differently</option>
            <option value="constraints">Constraints</option>
            <option value="custom">Custom Chapter</option>
          </select>

          <button
            type="button"
            onClick={handleAddSection}
            className="px-3 py-2 rounded bg-[#ff853a] hover:bg-[#ff721a] text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <span className="material-symbols-rounded text-sm">add</span>
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column builder: Left Section list, Right Block editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Ordered Sections List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2 bg-zinc-900/60 p-3 rounded-[8px] border border-white/10 max-h-[720px] overflow-y-auto">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
            Sections ({sections.length})
          </div>

          {sections.map((sec, idx) => {
            const isSelected = selectedSection?.id === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-zinc-800 border-[#ff853a]'
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                      {idx + 1}
                    </span>
                    <span className="text-white text-sm font-medium truncate">
                      {sec.navigationLabel || sec.heading}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      sec.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {sec.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-white/5">
                  <span className="font-mono text-[10px] uppercase text-[#ff853a]">
                    {sec.type} · {sec.blocks?.length || 0} blocks
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleMoveSection(sec.id, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-sm">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSection(sec.id, 'down')}
                      disabled={idx === sections.length - 1}
                      title="Move Down"
                      className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-sm">arrow_downward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateSection(sec.id)}
                      title="Duplicate Section"
                      className="p-1 hover:text-[#ff853a] cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-sm">content_copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id)}
                      title="Delete Section"
                      className="p-1 hover:text-red-400 cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Active Section Editor + Blocks sequence (8 cols) */}
        {selectedSection ? (
          <div className="lg:col-span-8 flex flex-col gap-6 bg-zinc-900/40 p-3 sm:p-5 rounded-[8px] border border-white/10 min-w-0">
            {/* Section Header Configuration */}
            <div className="p-3 sm:p-4 rounded-[6px] bg-zinc-950 border border-white/10 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-xs font-mono uppercase text-[#ff853a] px-2 py-0.5 rounded bg-zinc-900 shrink-0">
                    {selectedSection.type}
                  </span>
                  <span className="text-white font-semibold text-sm sm:text-base break-words">
                    Editing: {selectedSection.navigationLabel}
                  </span>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedSection.visible}
                    onChange={(e) => handleUpdateSection(selectedSection.id, { visible: e.target.checked })}
                    className="accent-[#ff853a]"
                  />
                  <span>Show in Case Study</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Sidebar Navigation Label
                  </label>
                  <input
                    type="text"
                    value={selectedSection.navigationLabel}
                    onChange={(e) =>
                      handleUpdateSection(selectedSection.id, { navigationLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                    placeholder="e.g. The Problem"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Section Display Heading (Uppercase)
                  </label>
                  <input
                    type="text"
                    value={selectedSection.heading}
                    onChange={(e) => handleUpdateSection(selectedSection.id, { heading: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                    placeholder="e.g. THE PROBLEM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Intro Narrative / Hook (Optional)
                </label>
                <textarea
                  rows={2}
                  value={selectedSection.intro || ''}
                  onChange={(e) => handleUpdateSection(selectedSection.id, { intro: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                  placeholder="Key summary or takeaway for this section..."
                />
              </div>
            </div>

            {onUploadMedia && (
              <section className="rounded-xl border border-[#ff853a]/25 bg-[#ff853a]/[0.05] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-white text-sm font-semibold">Images for {selectedSection.navigationLabel || selectedSection.heading}</h4>
                    <p className="text-zinc-400 text-xs mt-1">
                      {selectedSection.type === 'designSystem' ? 'Upload multiple component and token images. They are added as carousel slides.' : selectedSection.type === 'product' ? 'Upload multiple product screens. They are added to the product showcase.' : 'Upload images for this section. They are added as full-width images in this section only.'}
                    </p>
                    <p className="text-[#ffb17d] text-[11px] mt-2">{selectedSectionImageCount} image{selectedSectionImageCount === 1 ? '' : 's'} currently assigned to this section · saved with this project</p>
                  </div>
                  <input ref={sectionMediaInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple className="hidden" onChange={(event) => void handleSectionMediaUpload(event.target.files)} />
                  <button type="button" disabled={uploadingSectionMedia} onClick={() => sectionMediaInputRef.current?.click()} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff853a] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#ff721a] disabled:opacity-60">
                    <Upload size={14} />{uploadingSectionMedia ? 'Uploading…' : 'Upload to this section'}
                  </button>
                </div>
                {sectionUploadMessage && <p role="status" className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-200">{sectionUploadMessage}</p>}
              </section>
            )}

            {/* Blocks List */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider font-mono">
                  Content Blocks ({selectedSection.blocks?.length || 0})
                </h4>

                {/* Add Block Dropdown */}
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <select
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value as CaseStudyBlockType)}
                    className="px-2.5 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs flex-1 sm:flex-initial"
                  >
                    <option value="paragraph">Paragraph Text</option>
                    <option value="heading">Subsection Heading</option>
                    <option value="cardGrid">2/3-Column Card Grid</option>
                    <option value="decisionList">Decision Cards (Constraint/What/Why)</option>
                    <option value="twoColumnComparison">First Attempt &amp; Fix Comparison</option>
                    <option value="fullWidthImage">Full-Width Image</option>
                    <option value="gallery">Image Gallery Grid</option>
                    <option value="carousel">Interactive Slide Carousel</option>
                    <option value="productShowcase">Product Mobile &amp; Desktop Showcase</option>
                    <option value="bulletList">Bullet List</option>
                    <option value="quote">Pull Quote</option>
                    <option value="cta">Action Button (CTA)</option>
                    <option value="divider">White Thin Divider</option>
                    <option value="spacer">Spacer</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddBlock}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center justify-center gap-1 cursor-pointer border border-white/10 shrink-0"
                  >
                    <span className="material-symbols-rounded text-sm">add</span>
                    <span>Insert Block</span>
                  </button>
                </div>
              </div>

              {/* Blocks Array */}
              {selectedSection.blocks && selectedSection.blocks.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {selectedSection.blocks.map((block, bIdx) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-[6px] bg-zinc-950 border border-white/10 flex flex-col gap-3"
                    >
                      {/* Block bar: Type, controls */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                            #{bIdx + 1}
                          </span>
                          <span className="text-xs font-mono uppercase text-[#ff853a]">
                            {block.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(block.id, 'up')}
                            disabled={bIdx === 0}
                            title="Move Up"
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <span className="material-symbols-rounded text-sm">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(block.id, 'down')}
                            disabled={bIdx === selectedSection.blocks.length - 1}
                            title="Move Down"
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <span className="material-symbols-rounded text-sm">arrow_downward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(block.id)}
                            title="Delete Block"
                            className="p-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                          >
                            <span className="material-symbols-rounded text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Block Form Inputs based on block.type */}
                      {block.type === 'paragraph' && (
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={3}
                            value={block.text}
                            onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                            className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                            placeholder="Paragraph narrative content..."
                          />
                          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!block.highlight}
                              onChange={(e) => handleUpdateBlock(block.id, { highlight: e.target.checked })}
                              className="accent-[#ff853a]"
                            />
                            <span>Highlight text with orange accent</span>
                          </label>
                        </div>
                      )}

                      {block.type === 'heading' && (
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={block.text}
                            onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                            className="flex-1 px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                            placeholder="Heading text..."
                          />
                          <select
                            value={block.level || 3}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, { level: Number(e.target.value) as 2 | 3 | 4 })
                            }
                            className="px-2 py-2 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                          >
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                            <option value={4}>H4</option>
                          </select>
                        </div>
                      )}

                      {(block.type === 'image' || block.type === 'fullWidthImage') && (
                        <div className="flex flex-col gap-3">
                          <MediaUploadField value={block.url} onChange={(url) => handleUpdateBlock(block.id, { url })} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label="section image" />
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={block.alt || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { alt: e.target.value })}
                              className="flex-1 px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                              placeholder="Alt text description..."
                            />
                            <input
                              type="text"
                              value={block.caption || ''}
                              onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                              className="flex-1 px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                              placeholder="Optional caption..."
                            />
                          </div>
                          {block.url && (
                            <MediaPreview
                              src={block.url}
                              alt="Media preview"
                              className="w-32 h-20 object-cover rounded border border-white/10"
                            />
                          )}
                        </div>
                      )}

                      {block.type === 'gallery' && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Gallery images ({block.images.length})</span>
                            <select value={block.columns || 2} onChange={(event) => handleUpdateBlock(block.id, { columns: Number(event.target.value) as 2 | 3 | 4 })} className="rounded bg-zinc-900 border border-white/10 px-2 py-1 text-xs text-white">
                              <option value={2}>2 columns</option><option value={3}>3 columns</option><option value={4}>4 columns</option>
                            </select>
                          </div>
                          {block.images.map((image, index) => (
                            <div key={`${block.id}-image-${index}`} className="rounded-lg border border-white/10 bg-zinc-900/60 p-3 flex flex-col gap-3">
                              <div className="flex items-center justify-between"><span className="text-xs font-medium text-white">Image {index + 1}</span><button type="button" onClick={() => handleUpdateBlock(block.id, { images: block.images.filter((_, itemIndex) => itemIndex !== index) })} className="text-xs text-red-300 hover:text-red-200">Remove</button></div>
                              <MediaUploadField value={image.url} onChange={(url) => { const images = [...block.images]; images[index] = { ...images[index], url }; handleUpdateBlock(block.id, { images }); }} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label={`gallery image ${index + 1}`} />
                              <input type="text" value={image.caption || ''} onChange={(event) => { const images = [...block.images]; images[index] = { ...images[index], caption: event.target.value }; handleUpdateBlock(block.id, { images }); }} className="w-full rounded bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white" placeholder="Optional image caption" />
                            </div>
                          ))}
                          <button type="button" onClick={() => handleUpdateBlock(block.id, { images: [...block.images, { url: '', alt: '', caption: '' }] })} className="self-start rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800">+ Add another image</button>
                        </div>
                      )}

                      {block.type === 'cardGrid' && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Cards ({block.cards?.length || 0})</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={block.columns || 3}
                                onChange={(e) =>
                                  handleUpdateBlock(block.id, {
                                    columns: Number(e.target.value) as 2 | 3 | 4
                                  })
                                }
                                className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                              >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedCards = [
                                    ...(block.cards || []),
                                    { title: 'New Card', desc: 'Card description here.' }
                                  ];
                                  handleUpdateBlock(block.id, { cards: updatedCards });
                                }}
                                className="px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700"
                              >
                                + Add Card
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {block.cards?.map((card, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2.5 rounded bg-zinc-900 border border-white/5 flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-center">
                                  <input
                                    type="text"
                                    value={card.title}
                                    onChange={(e) => {
                                      const newCards = [...block.cards];
                                      newCards[cIdx] = { ...newCards[cIdx], title: e.target.value };
                                      handleUpdateBlock(block.id, { cards: newCards });
                                    }}
                                    className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs font-semibold flex-1 mr-2"
                                    placeholder="Card title..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCards = block.cards.filter((_, i) => i !== cIdx);
                                      handleUpdateBlock(block.id, { cards: newCards });
                                    }}
                                    className="text-zinc-500 hover:text-red-400 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={card.desc || ''}
                                  onChange={(e) => {
                                    const newCards = [...block.cards];
                                    newCards[cIdx] = { ...newCards[cIdx], desc: e.target.value };
                                    handleUpdateBlock(block.id, { cards: newCards });
                                  }}
                                  className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                  placeholder="Card body text..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'twoColumnComparison' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-zinc-400 font-mono block mb-1">First Attempt</label>
                            <textarea
                              rows={2}
                              value={block.firstAttempt}
                              onChange={(e) => handleUpdateBlock(block.id, { firstAttempt: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-mono block mb-1">Problem</label>
                            <textarea
                              rows={2}
                              value={block.problem}
                              onChange={(e) => handleUpdateBlock(block.id, { problem: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-mono block mb-1">Fix</label>
                            <textarea
                              rows={2}
                              value={block.fix}
                              onChange={(e) => handleUpdateBlock(block.id, { fix: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-mono block mb-1">Learning</label>
                            <textarea
                              rows={2}
                              value={block.learning}
                              onChange={(e) => handleUpdateBlock(block.id, { learning: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'decisionList' && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">
                              Decisions ({block.decisions?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [
                                  ...(block.decisions || []),
                                  {
                                    title: 'New Architecture Decision',
                                    constraint: 'Specific challenge faced.',
                                    whatIDid: 'What was built or designed.',
                                    why: 'Why this solved the user problem.'
                                  }
                                ];
                                handleUpdateBlock(block.id, { decisions: updated });
                              }}
                              className="px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700"
                            >
                              + Add Decision
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            {block.decisions?.map((dec, dIdx) => (
                              <div
                                key={dIdx}
                                className="p-3 rounded bg-zinc-900 border border-white/5 flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-center">
                                  <input
                                    type="text"
                                    value={dec.title}
                                    onChange={(e) => {
                                      const cloned = [...block.decisions];
                                      cloned[dIdx] = { ...cloned[dIdx], title: e.target.value };
                                      handleUpdateBlock(block.id, { decisions: cloned });
                                    }}
                                    className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs font-semibold flex-1 mr-2"
                                    placeholder="Decision title..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cloned = block.decisions.filter((_, i) => i !== dIdx);
                                      handleUpdateBlock(block.id, { decisions: cloned });
                                    }}
                                    className="text-zinc-500 hover:text-red-400 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <label className="text-zinc-400 font-mono block mb-0.5">Constraint</label>
                                    <textarea
                                      rows={2}
                                      value={dec.constraint}
                                      onChange={(e) => {
                                        const cloned = [...block.decisions];
                                        cloned[dIdx] = { ...cloned[dIdx], constraint: e.target.value };
                                        handleUpdateBlock(block.id, { decisions: cloned });
                                      }}
                                      className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 font-mono block mb-0.5">What I Did</label>
                                    <textarea
                                      rows={2}
                                      value={dec.whatIDid}
                                      onChange={(e) => {
                                        const cloned = [...block.decisions];
                                        cloned[dIdx] = { ...cloned[dIdx], whatIDid: e.target.value };
                                        handleUpdateBlock(block.id, { decisions: cloned });
                                      }}
                                      className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[#ff853a] font-mono block mb-0.5">Why</label>
                                    <textarea
                                      rows={2}
                                      value={dec.why}
                                      onChange={(e) => {
                                        const cloned = [...block.decisions];
                                        cloned[dIdx] = { ...cloned[dIdx], why: e.target.value };
                                        handleUpdateBlock(block.id, { decisions: cloned });
                                      }}
                                      className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'carousel' && (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400">
                              Carousel Slides ({block.slides?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [
                                  ...(block.slides || []),
                                  {
                                    url: '',
                                    title: 'Component Spec'
                                  }
                                ];
                                handleUpdateBlock(block.id, { slides: updated });
                              }}
                              className="px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700"
                            >
                              + Add Slide
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            {block.slides?.map((sl, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded bg-zinc-900 border border-white/5"
                              >
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <img
                                    src={sl.url}
                                    alt="Thumb"
                                    className="w-12 h-10 object-cover rounded bg-black shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={sl.title || ''}
                                    onChange={(e) => {
                                      const cloned = [...block.slides];
                                      cloned[sIdx] = { ...cloned[sIdx], title: e.target.value };
                                      handleUpdateBlock(block.id, { slides: cloned });
                                    }}
                                    className="flex-1 sm:w-40 px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                    placeholder="Title label..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cloned = block.slides.filter((_, i) => i !== sIdx);
                                      handleUpdateBlock(block.id, { slides: cloned });
                                    }}
                                    className="text-zinc-500 hover:text-red-400 text-xs px-2 sm:hidden ml-auto cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="w-full flex-1"><MediaUploadField value={sl.url} onChange={(url) => { const cloned = [...block.slides]; cloned[sIdx] = { ...cloned[sIdx], url }; handleUpdateBlock(block.id, { slides: cloned }); }} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label={`design system image ${sIdx + 1}`} /></div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cloned = block.slides.filter((_, i) => i !== sIdx);
                                    handleUpdateBlock(block.id, { slides: cloned });
                                  }}
                                  className="hidden sm:inline-block text-zinc-500 hover:text-red-400 text-xs px-2 shrink-0 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'productShowcase' && (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400">
                              Product Screens ({block.screens?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [
                                  ...(block.screens || []),
                                  {
                                    url: '',
                                    label: 'New Workflow View',
                                    device: 'desktop' as const
                                  }
                                ];
                                handleUpdateBlock(block.id, { screens: updated });
                              }}
                              className="px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700 cursor-pointer"
                            >
                              + Add Screen
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            {block.screens?.map((scr, scIdx) => (
                              <div
                                key={scIdx}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded bg-zinc-900 border border-white/5"
                              >
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <img
                                    src={scr.url}
                                    alt="Thumb"
                                    className="w-10 h-12 object-cover rounded bg-black shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={scr.label || ''}
                                    onChange={(e) => {
                                      const cloned = [...block.screens];
                                      cloned[scIdx] = { ...cloned[scIdx], label: e.target.value };
                                      handleUpdateBlock(block.id, { screens: cloned });
                                    }}
                                    className="flex-1 sm:w-36 px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                    placeholder="Flow name..."
                                  />
                                  <select
                                    value={scr.device || 'desktop'}
                                    onChange={(e) => {
                                      const cloned = [...block.screens];
                                      cloned[scIdx] = {
                                        ...cloned[scIdx],
                                        device: e.target.value as 'desktop' | 'mobile'
                                      };
                                      handleUpdateBlock(block.id, { screens: cloned });
                                    }}
                                    className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs shrink-0"
                                  >
                                    <option value="desktop">1440 px</option>
                                    <option value="mobile">428 px</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cloned = block.screens.filter((_, i) => i !== scIdx);
                                      handleUpdateBlock(block.id, { screens: cloned });
                                    }}
                                    className="text-zinc-500 hover:text-red-400 text-xs px-2 sm:hidden ml-auto cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="w-full flex-1"><MediaUploadField value={scr.url} onChange={(url) => { const cloned = [...block.screens]; cloned[scIdx] = { ...cloned[scIdx], url }; handleUpdateBlock(block.id, { screens: cloned }); }} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label={`product screen ${scIdx + 1}`} /></div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cloned = block.screens.filter((_, i) => i !== scIdx);
                                    handleUpdateBlock(block.id, { screens: cloned });
                                  }}
                                  className="hidden sm:inline-block text-zinc-500 hover:text-red-400 text-xs px-2 shrink-0 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'bulletList' && (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                            className="px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Optional list title (e.g. Constraints:)..."
                          />
                          <textarea
                            rows={3}
                            value={block.items?.join('\n') || ''}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, {
                                items: e.target.value.split('\n').filter((l) => l.trim().length > 0)
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="One bullet item per line..."
                          />
                        </div>
                      )}

                      {block.type === 'quote' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <textarea
                            rows={2}
                            value={block.quote}
                            onChange={(e) => handleUpdateBlock(block.id, { quote: e.target.value })}
                            className="md:col-span-3 px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Quote text..."
                          />
                          <input
                            type="text"
                            value={block.author || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { author: e.target.value })}
                            className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Author..."
                          />
                          <input
                            type="text"
                            value={block.role || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { role: e.target.value })}
                            className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Role / Title..."
                          />
                        </div>
                      )}

                      {block.type === 'cta' && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <input
                            type="text"
                            value={block.label}
                            onChange={(e) => handleUpdateBlock(block.id, { label: e.target.value })}
                            className="w-full sm:w-48 px-2 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Button label..."
                          />
                          <input
                            type="text"
                            value={block.url}
                            onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                            className="flex-1 px-2 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="URL link..."
                          />
                          <select
                            value={block.style || 'primary'}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, { style: e.target.value as 'primary' | 'outline' })
                            }
                            className="px-2 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs shrink-0"
                          >
                            <option value="primary">Solid Button</option>
                            <option value="outline">Outline Button</option>
                          </select>
                        </div>
                      )}

                      {block.type === 'divider' && (
                        <div className="text-xs text-zinc-500 font-mono">
                          Render: Thin white decorative section divider
                        </div>
                      )}

                      {block.type === 'spacer' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 font-mono">Height:</span>
                          <select
                            value={block.height || 'md'}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, { height: e.target.value as 'sm' | 'md' | 'lg' })
                            }
                            className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                          >
                            <option value="sm">Small (24px)</option>
                            <option value="md">Medium (48px)</option>
                            <option value="lg">Large (80px)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded bg-zinc-950 border border-dashed border-white/10 text-center text-zinc-500 text-xs">
                  No blocks in this chapter yet. Click &ldquo;Insert Block&rdquo; above to start adding content.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-zinc-500 bg-zinc-900/20 rounded-[8px] border border-white/10">
            Select or create a section to begin editing blocks.
          </div>
        )}
      </div>
    </div>
  );
};
