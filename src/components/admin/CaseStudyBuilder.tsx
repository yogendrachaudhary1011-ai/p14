import React, { useMemo, useRef, useState } from 'react';
import {
  CaseStudySection,
  CaseStudyBlock,
  SectionType,
  CaseStudyBlockType,
  MediaAsset,
  DecisionDetail
} from '../../types';
import { createDefaultSection, createDefaultBlock } from '../../utils/caseStudyUtils';
import { MediaPreview } from '../MediaPreview';
import { Upload } from 'lucide-react';
import { MediaUploadField } from './MediaUploadField';
import { BufferedTextInput, BufferedTextarea } from './BufferedTextField';

interface CaseStudyBuilderProps {
  sections: CaseStudySection[];
  onChange: (updatedSections: CaseStudySection[]) => void;
  mediaLibrary?: MediaAsset[];
  onUploadMedia?: (file: File, isThumbnail?: boolean) => Promise<MediaAsset>;
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

  // Section visibility filtering & delete confirmation safety
  const [sectionFilter, setSectionFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [sectionToDelete, setSectionToDelete] = useState<CaseStudySection | null>(null);

  const visibleCount = useMemo(() => sections.filter((s) => s.visible).length, [sections]);
  const hiddenCount = useMemo(() => sections.filter((s) => !s.visible).length, [sections]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) || sections[0],
    [sections, selectedSectionId]
  );

  const sectionImageLabel = useMemo(() => {
    if (!selectedSection) return 'Section images';
    switch (selectedSection.type) {
      case 'problem': return 'Problem image';
      case 'keyDecisions': return 'Key Decisions image';
      case 'solution': return 'Solution image';
      case 'designSystem': return 'Design System images';
      case 'product': return 'Product images';
      default: return `${selectedSection.navigationLabel || 'Section'} images`;
    }
  }, [selectedSection]);

  const selectedSectionImageCount = useMemo(() => {
    return (selectedSection?.blocks || []).reduce((count, block) => {
      if (block.type === 'image' || block.type === 'fullWidthImage') return count + (block.url ? 1 : 0);
      if (block.type === 'gallery') return count + block.images.length;
      if (block.type === 'carousel') return count + block.slides.filter((slide) => !slide.url.includes('placehold.co')).length;
      if (block.type === 'productShowcase') return count + block.screens.filter((screen) => !screen.url.includes('placehold.co')).length;
      if (block.type === 'decisionList') return count + (block.image ? 1 : 0);
      return count;
    }, 0);
  }, [selectedSection?.blocks]);

  const handleUpdateSection = (sectionId: string, updates: Partial<CaseStudySection>) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s));
    onChange(updated);
  };

  const handleToggleSectionVisibility = (sectionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;
    const nextVisible = !target.visible;
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, visible: nextVisible } : s));
    onChange(updated);
  };

  const handleSetAllVisibility = (visible: boolean) => {
    const updated = sections.map((s) => ({ ...s, visible }));
    onChange(updated);
  };

  const handleAddSection = () => {
    const newSec = createDefaultSection(newSectionType, sections.length + 1);
    const updated = [...sections, newSec];
    onChange(updated);
    setSelectedSectionId(newSec.id);
  };

  const promptDeleteSection = (section: CaseStudySection, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSectionToDelete(section);
  };

  const executeDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      setSectionToDelete(null);
      return;
    }
    const updated = sections.filter((s) => s.id !== sectionId);
    onChange(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || '');
    }
    setSectionToDelete(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    if (target) {
      promptDeleteSection(target);
    } else {
      executeDeleteSection(sectionId);
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
  const handleAddBlock = (blockType?: CaseStudyBlockType) => {
    if (!selectedSection) return;
    const typeToUse = blockType || newBlockType;
    const newBlk = createDefaultBlock(typeToUse);
    const updatedBlocks = [...(selectedSection.blocks || []), newBlk];
    handleUpdateSection(selectedSection.id, { blocks: updatedBlocks });
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<CaseStudyBlock>) => {
    if (!selectedSection) return;
    const updatedBlocks = (selectedSection.blocks || []).map((b) =>
      b.id === blockId ? ({ ...b, ...updates } as CaseStudyBlock) : b
    );
    handleUpdateSection(selectedSection.id, { blocks: updatedBlocks });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!selectedSection) return;
    const updatedBlocks = (selectedSection.blocks || []).filter((b) => b.id !== blockId);
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
    const fileList = Array.from(files);
    const results = await Promise.allSettled(
      fileList.map((file) => onUploadMedia(file).then((asset) => ({ asset, fileName: file.name })))
    );

    const uploaded: MediaAsset[] = [];
    const failures: string[] = [];
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        uploaded.push(res.value.asset);
      } else {
        const fileName = fileList[idx]?.name || `File ${idx + 1}`;
        failures.push(`${fileName}: ${res.reason instanceof Error ? res.reason.message : 'Upload failed'}`);
      }
    });
    if (uploaded.length) {
      const imageAssets = uploaded.filter((asset) =>
        asset.mimeType?.toLowerCase().startsWith('image/') ||
        /\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(`${asset.url} ${asset.name}`)
      );
      const blocks = [...(selectedSection.blocks || [])];
      if (selectedSection.type === 'designSystem') {
        let carousel = blocks.find((block) => block.type === 'carousel');
        if (!carousel) {
          carousel = { id: `blk-${Date.now()}-carousel`, type: 'carousel', slides: [] };
          blocks.push(carousel);
        }
        if (carousel.type === 'carousel') {
          const realSlides = (carousel.slides || []).filter((slide) => slide.url?.trim() && !slide.url.includes('placehold.co'));
          const slides = [...realSlides, ...imageAssets.map((asset, index) => ({
            url: asset.url,
            title: asset.name || `Design system image ${realSlides.length + index + 1}`,
            alt: asset.name || `Design system image ${realSlides.length + index + 1}`
          }))];
          const at = blocks.findIndex((block) => block.id === carousel?.id);
          blocks[at] = { ...carousel, slides };
        }
      } else if (selectedSection.type === 'keyDecisions') {
        const decisionBlockIndex = blocks.findIndex((block) => block.type === 'decisionList');
        if (decisionBlockIndex >= 0 && blocks[decisionBlockIndex].type === 'decisionList') {
          const decisionBlock = blocks[decisionBlockIndex];
          blocks[decisionBlockIndex] = {
            ...decisionBlock,
            image: imageAssets[0]?.url || decisionBlock.image,
            imageAlt: imageAssets[0]?.name || decisionBlock.imageAlt
          };
        } else if (imageAssets[0]) {
          blocks.push({
            id: `blk-${Date.now()}-decisions`,
            type: 'decisionList',
            decisions: [],
            image: imageAssets[0].url,
            imageAlt: imageAssets[0].name
          });
        }
        const extraImages = imageAssets.slice(1).map((asset) => ({
          id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'fullWidthImage' as const,
          url: asset.url,
          alt: asset.name
        }));
        const currentDecisionIndex = blocks.findIndex((block) => block.type === 'decisionList');
        blocks.splice(currentDecisionIndex < 0 ? blocks.length : currentDecisionIndex, 0, ...extraImages);
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
        <div className="lg:col-span-4 flex flex-col gap-2.5 bg-zinc-900/60 p-3 rounded-[8px] border border-white/10 max-h-[760px] overflow-y-auto">
          {/* Header with Title, Count and Quick Bulk Actions */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <span>Sections</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                {visibleCount}/{sections.length} visible
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {hiddenCount > 0 ? (
                <button
                  type="button"
                  onClick={() => handleSetAllVisibility(true)}
                  className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium cursor-pointer transition-colors"
                  title="Enable all sections"
                >
                  Enable all
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetAllVisibility(false)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 font-medium cursor-pointer transition-colors"
                  title="Disable all sections"
                >
                  Disable all
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs: All / Enabled / Disabled */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-md border border-white/5 text-[11px]">
            <button
              type="button"
              onClick={() => setSectionFilter('all')}
              className={`py-1 px-1.5 rounded font-medium transition-colors cursor-pointer text-center ${
                sectionFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({sections.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('visible')}
              className={`py-1 px-1.5 rounded font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
                sectionFilter === 'visible'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-xs border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Enabled ({visibleCount})
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('hidden')}
              className={`py-1 px-1.5 rounded font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
                sectionFilter === 'hidden'
                  ? 'bg-amber-500/20 text-amber-300 shadow-xs border border-amber-500/30'
                  : 'text-zinc-400 hover:text-amber-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Disabled ({hiddenCount})
            </button>
          </div>

          {/* Section List */}
          {sections.map((sec, idx) => {
            const isSelected = selectedSection?.id === sec.id;
            const matchesFilter =
              sectionFilter === 'all' ||
              (sectionFilter === 'visible' && sec.visible) ||
              (sectionFilter === 'hidden' && !sec.visible);

            if (!matchesFilter) return null;

            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-2 relative ${
                  isSelected
                    ? sec.visible
                      ? 'bg-zinc-800 border-[#ff853a]'
                      : 'bg-zinc-800 border-amber-500/70'
                    : sec.visible
                      ? 'bg-zinc-950/60 border-white/5 hover:border-white/20'
                      : 'bg-zinc-950/30 border-dashed border-zinc-700/60 opacity-70 hover:opacity-100 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        sec.visible ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-900/80 text-zinc-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-sm font-medium truncate ${
                        sec.visible ? 'text-white' : 'text-zinc-400 line-through decoration-zinc-600'
                      }`}
                    >
                      {sec.navigationLabel || sec.heading}
                    </span>
                  </div>

                  {/* Interactive Visibility Pill Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSectionVisibility(sec.id, e)}
                    title={sec.visible ? 'Section is enabled · Click to disable' : 'Section is disabled · Click to enable'}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                      sec.visible
                        ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700/60'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sec.visible ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    <span>{sec.visible ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-white/5">
                  <span className="font-mono text-[10px] uppercase text-[#ff853a]">
                    {sec.type} · {sec.blocks?.length || 0} blocks
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Dedicated Visibility Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSectionVisibility(sec.id, e)}
                      title={sec.visible ? 'Disable section (hide from project detail without deleting)' : 'Enable section (show on project detail)'}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        sec.visible
                          ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15'
                          : 'text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800'
                      }`}
                      aria-label={sec.visible ? 'Disable Section' : 'Enable Section'}
                    >
                      <span className="material-symbols-rounded text-base">
                        {sec.visible ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>

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
                      onClick={(e) => promptDeleteSection(sec, e)}
                      title="Delete Section (or disable instead)"
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
            {onUploadMedia && (
              <section className="rounded-xl border-2 border-[#ff853a]/50 bg-[#ff853a]/[0.08] p-4 sm:p-5 shadow-lg shadow-[#ff853a]/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-white text-sm font-bold">{sectionImageLabel}</h4>
                    <p className="text-zinc-300 text-xs mt-1">
                      {selectedSection.type === 'designSystem'
                        ? 'Select multiple images to add them as Design System carousel slides.'
                        : selectedSection.type === 'product'
                          ? 'Select one or more images. They will stack vertically at the same size as images in other sections.'
                          : `Choose an image file to upload directly to Supabase and attach it to ${selectedSection.navigationLabel || selectedSection.heading}.`}
                    </p>
                    <p className="text-[#ffb17d] text-[11px] mt-2">{selectedSectionImageCount} image{selectedSectionImageCount === 1 ? '' : 's'} attached to this section</p>
                  </div>
                  <input ref={sectionMediaInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple className="hidden" onChange={(event) => void handleSectionMediaUpload(event.target.files)} />
                  <button type="button" disabled={uploadingSectionMedia} onClick={() => sectionMediaInputRef.current?.click()} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff853a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#ff721a] disabled:opacity-60">
                    <Upload size={16} />{uploadingSectionMedia ? 'Uploading…' : `Upload ${sectionImageLabel}`}
                  </button>
                </div>
                {sectionUploadMessage && <p role="status" className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-100">{sectionUploadMessage}</p>}
              </section>
            )}

            {/* Prominent Section Visibility Status Banner */}
            <div
              className={`p-3.5 sm:p-4 rounded-[8px] border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                selectedSection.visible
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-amber-950/25 border-amber-500/40'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`material-symbols-rounded text-2xl shrink-0 p-1.5 rounded-lg ${
                    selectedSection.visible
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedSection.visible ? 'visibility' : 'visibility_off'}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-bold">
                      {selectedSection.visible ? 'Section Enabled' : 'Section Disabled'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        selectedSection.visible
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedSection.visible ? 'Visible on Project Page' : 'Hidden from Project Page'}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs mt-1">
                    {selectedSection.visible
                      ? 'Visitors can see this section and click it in the sidebar table-of-contents navigation.'
                      : 'This section is hidden from the project detail page and navigation. All blocks, text, and images are safely kept.'}
                  </p>
                </div>
              </div>

              {/* Direct Enable / Disable Action Button */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleUpdateSection(selectedSection.id, { visible: !selectedSection.visible })}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm ${
                    selectedSection.visible
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/10'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <span className="material-symbols-rounded text-base">
                    {selectedSection.visible ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{selectedSection.visible ? 'Disable Section' : 'Enable Section'}</span>
                </button>
              </div>
            </div>

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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => promptDeleteSection(selectedSection)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer transition-colors"
                    title="Delete or disable this section"
                  >
                    <span className="material-symbols-rounded text-sm">delete</span>
                    <span>Delete Section</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Sidebar Navigation Label
                  </label>
                  <BufferedTextInput
                    type="text"
                    value={selectedSection.navigationLabel}
                    onCommit={(value) => handleUpdateSection(selectedSection.id, { navigationLabel: value })}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                    placeholder="e.g. The Problem"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Section Display Heading (Uppercase)
                  </label>
                  <BufferedTextInput
                    type="text"
                    value={selectedSection.heading}
                    onCommit={(value) => handleUpdateSection(selectedSection.id, { heading: value })}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                    placeholder="e.g. THE PROBLEM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Intro Narrative / Hook (Optional)
                </label>
                <BufferedTextarea
                  rows={2}
                  value={selectedSection.intro || ''}
                  onCommit={(value) => handleUpdateSection(selectedSection.id, { intro: value })}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-sm"
                  placeholder="Key summary or takeaway for this section..."
                />
              </div>
            </div>

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
                    <option value="bulletList">Bullet List</option>
                    <option value="quote">Pull Quote</option>
                    <option value="cta">Action Button (CTA)</option>
                    <option value="divider">White Thin Divider</option>
                    <option value="spacer">Spacer</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleAddBlock()}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center justify-center gap-1 cursor-pointer border border-white/10 shrink-0"
                  >
                    <span className="material-symbols-rounded text-sm">add</span>
                    <span>Insert Block</span>
                  </button>
                </div>
              </div>

              {/* Quick Add Block Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">QUICK INSERT:</span>
                <button
                  type="button"
                  onClick={() => handleAddBlock('fullWidthImage')}
                  className="px-2.5 py-1 rounded-md bg-[#ff853a]/15 hover:bg-[#ff853a]/25 text-[#ff853a] border border-[#ff853a]/30 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-rounded text-xs">image</span>
                  <span>+ Image Block</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock('cardGrid')}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  + Card Grid
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock('decisionList')}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  + Decision Cards
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock('twoColumnComparison')}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  + First Attempt &amp; Fix
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock('carousel')}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  + Slide Carousel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBlock('bulletList')}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  + Bullet List
                </button>
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
                          <BufferedTextarea
                            rows={3}
                            value={block.text}
                            onCommit={(value) => handleUpdateBlock(block.id, { text: value })}
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
                          <BufferedTextInput
                            type="text"
                            value={block.text}
                            onCommit={(value) => handleUpdateBlock(block.id, { text: value })}
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
                          <MediaUploadField value={block.url} onChange={(url) => handleUpdateBlock(block.id, { url })} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label="section image" isThumbnail={false} />
                          <div className="flex items-center gap-3">
                            <BufferedTextInput
                              type="text"
                              value={block.alt || ''}
                              onCommit={(value) => handleUpdateBlock(block.id, { alt: value })}
                              className="flex-1 px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                              placeholder="Alt text description..."
                            />
                            <BufferedTextInput
                              type="text"
                              value={block.caption || ''}
                              onCommit={(value) => handleUpdateBlock(block.id, { caption: value })}
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
                              <MediaUploadField value={image.url} onChange={(url) => { const images = url ? block.images.map((item, itemIndex) => itemIndex === index ? { ...item, url } : item) : block.images.filter((_, itemIndex) => itemIndex !== index); handleUpdateBlock(block.id, { images }); }} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label={`gallery image ${index + 1}`} isThumbnail={false} />
                              <BufferedTextInput type="text" value={image.alt || ''} onCommit={(value) => { const images = [...block.images]; images[index] = { ...images[index], alt: value }; handleUpdateBlock(block.id, { images }); }} className="w-full rounded bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white" placeholder="Image description for accessibility..." />
                              <BufferedTextInput type="text" value={image.caption || ''} onCommit={(value) => { const images = [...block.images]; images[index] = { ...images[index], caption: value }; handleUpdateBlock(block.id, { images }); }} className="w-full rounded bg-zinc-950 border border-white/10 px-3 py-2 text-xs text-white" placeholder="Optional image caption" />
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
                                  <BufferedTextInput
                                    type="text"
                                    value={card.title}
                                    onCommit={(value) => {
                                      const newCards = [...block.cards];
                                      newCards[cIdx] = { ...newCards[cIdx], title: value };
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
                                <BufferedTextInput
                                  type="text"
                                  value={card.badge || ''}
                                  onCommit={(value) => {
                                    const newCards = [...block.cards];
                                    newCards[cIdx] = { ...newCards[cIdx], badge: value };
                                    handleUpdateBlock(block.id, { cards: newCards });
                                  }}
                                  className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                  placeholder="Optional badge or label..."
                                />
                                <BufferedTextarea
                                  rows={2}
                                  value={card.desc || ''}
                                  onCommit={(value) => {
                                    const newCards = [...block.cards];
                                    newCards[cIdx] = { ...newCards[cIdx], desc: value };
                                    handleUpdateBlock(block.id, { cards: newCards });
                                  }}
                                  className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                  placeholder="Card body text..."
                                />
                                <BufferedTextarea
                                  rows={Math.min(6, Math.max(2, card.items?.length || 2))}
                                  value={(card.items || []).join('\n')}
                                  onCommit={(value) => {
                                    const newCards = [...block.cards];
                                    newCards[cIdx] = {
                                      ...newCards[cIdx],
                                      items: value.split('\n').map((item) => item.trim()).filter(Boolean)
                                    };
                                    handleUpdateBlock(block.id, { cards: newCards });
                                  }}
                                  className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                  placeholder="Optional bullet points, one per line..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'twoColumnComparison' && (
                        <div className="flex flex-col gap-3 text-xs">
                          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                            Card Headings &amp; Descriptions (Customize any title or leave blank for defaults)
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded bg-zinc-900/80 border border-white/5 flex flex-col gap-2">
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Card 1 Title</label>
                                <BufferedTextInput
                                  type="text"
                                  value={block.firstAttemptTitle || ''}
                                  onCommit={(value) => handleUpdateBlock(block.id, { firstAttemptTitle: value })}
                                  placeholder="First Attempt:"
                                  className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-white/10 text-white font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Content</label>
                                <BufferedTextarea
                                  rows={2}
                                  value={block.firstAttempt}
                                  onCommit={(value) => handleUpdateBlock(block.id, { firstAttempt: value })}
                                  className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white"
                                  placeholder="What was tried first..."
                                />
                              </div>
                            </div>

                            <div className="p-3 rounded bg-zinc-900/80 border border-white/5 flex flex-col gap-2">
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Card 2 Title</label>
                                <BufferedTextInput
                                  type="text"
                                  value={block.problemTitle || ''}
                                  onCommit={(value) => handleUpdateBlock(block.id, { problemTitle: value })}
                                  placeholder="Problem"
                                  className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-white/10 text-white font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Content</label>
                                <BufferedTextarea
                                  rows={2}
                                  value={block.problem}
                                  onCommit={(value) => handleUpdateBlock(block.id, { problem: value })}
                                  className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white"
                                  placeholder="What failed or was confusing..."
                                />
                              </div>
                            </div>

                            <div className="p-3 rounded bg-zinc-900/80 border border-white/5 flex flex-col gap-2">
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Card 3 Title</label>
                                <BufferedTextInput
                                  type="text"
                                  value={block.fixTitle || ''}
                                  onCommit={(value) => handleUpdateBlock(block.id, { fixTitle: value })}
                                  placeholder="Fix:"
                                  className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-white/10 text-white font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Content</label>
                                <BufferedTextarea
                                  rows={2}
                                  value={block.fix}
                                  onCommit={(value) => handleUpdateBlock(block.id, { fix: value })}
                                  className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white"
                                  placeholder="How it was resolved..."
                                />
                              </div>
                            </div>

                            <div className="p-3 rounded bg-zinc-900/80 border border-white/5 flex flex-col gap-2">
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Card 4 Title</label>
                                <BufferedTextInput
                                  type="text"
                                  value={block.learningTitle || ''}
                                  onCommit={(value) => handleUpdateBlock(block.id, { learningTitle: value })}
                                  placeholder="Learning:"
                                  className="w-full px-2 py-1.5 rounded bg-zinc-950 border border-white/10 text-white font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-zinc-400 font-mono text-[11px] block mb-1">Content</label>
                                <BufferedTextarea
                                  rows={2}
                                  value={block.learning}
                                  onCommit={(value) => handleUpdateBlock(block.id, { learning: value })}
                                  className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white"
                                  placeholder="Key architectural takeaway..."
                                />
                              </div>
                            </div>
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
                                    constraint: '',
                                    whatIDid: '',
                                    why: '',
                                    details: [
                                      { label: 'Constraint', text: 'Specific challenge faced.' },
                                      { label: 'What I did', text: 'What was built or designed.' },
                                      { label: 'Why', text: 'Why this solved the user problem.' }
                                    ]
                                  }
                                ];
                                handleUpdateBlock(block.id, { decisions: updated });
                              }}
                              className="px-2 py-1 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700"
                            >
                              + Add Decision
                            </button>
                          </div>

                          <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                            <label className="mb-2 block text-xs font-medium text-zinc-300">Image asset</label>
                            <MediaUploadField
                              value={block.image || ''}
                              onChange={(image) => handleUpdateBlock(block.id, { image })}
                              onUploadMedia={onUploadMedia}
                              mediaLibrary={mediaLibrary}
                              label="Key Decisions image"
                              isThumbnail={false}
                            />
                            <BufferedTextInput
                              type="text"
                              value={block.imageAlt || ''}
                              onCommit={(value) => handleUpdateBlock(block.id, { imageAlt: value })}
                              className="mt-3 w-full rounded bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-white"
                              placeholder="Image description for accessibility..."
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            {block.decisions?.map((dec, dIdx) => {
                              const details: DecisionDetail[] = dec.details ?? [
                                { label: dec.constraintLabel ?? 'Constraint', text: dec.constraint || '' },
                                { label: dec.whatIDidLabel ?? 'What I did', text: dec.whatIDid || '' },
                                { label: dec.whyLabel ?? 'Why', text: dec.why || '' }
                              ];
                              const updateDetails = (nextDetails: DecisionDetail[]) => {
                                const cloned = [...block.decisions];
                                cloned[dIdx] = { ...cloned[dIdx], details: nextDetails };
                                handleUpdateBlock(block.id, { decisions: cloned });
                              };
                              return (
                              <div
                                key={dIdx}
                                className="p-3 rounded bg-zinc-900 border border-white/5 flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-center">
                                  <BufferedTextInput
                                    type="text"
                                    value={dec.title}
                                    onCommit={(value) => {
                                      const cloned = [...block.decisions];
                                      cloned[dIdx] = { ...cloned[dIdx], title: value };
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
                                <div className="flex flex-col gap-2">
                                  {details.map((detail, detailIndex) => (
                                    <div key={detailIndex} className="rounded border border-white/5 bg-zinc-950/50 p-2.5 flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <BufferedTextInput
                                          type="text"
                                          value={detail.label}
                                          onCommit={(value) => updateDetails(details.map((item, index) => index === detailIndex ? { ...item, label: value } : item))}
                                          className="min-w-0 flex-1 px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                          placeholder="Optional label — leave blank to hide"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => updateDetails(details.filter((_, index) => index !== detailIndex))}
                                          className="text-zinc-500 hover:text-red-400 text-xs px-2"
                                          aria-label={`Remove detail ${detailIndex + 1}`}
                                        >Remove detail</button>
                                      </div>
                                      <BufferedTextarea
                                        rows={2}
                                        value={detail.text}
                                        onCommit={(value) => updateDetails(details.map((item, index) => index === detailIndex ? { ...item, text: value } : item))}
                                        className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                        placeholder="Detail text..."
                                      />
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => updateDetails([...details, { label: '', text: '' }])}
                                    className="self-start rounded border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
                                  >+ Add detail</button>
                                </div>
                              </div>
                              );
                            })}
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
                                    title: ''
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
                                key={sl.url || `${sl.title || 'slide'}-${sIdx}`}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded bg-zinc-900 border border-white/5"
                              >
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <img
                                    src={sl.url}
                                    alt="Thumb"
                                    className="w-12 h-10 object-cover rounded bg-black shrink-0"
                                  />
                                  <BufferedTextInput
                                    type="text"
                                    value={sl.alt || sl.title || ''}
                                    onCommit={(value) => {
                                      const cloned = [...block.slides];
                                      cloned[sIdx] = { ...cloned[sIdx], alt: value, title: value };
                                      handleUpdateBlock(block.id, { slides: cloned });
                                    }}
                                    className="flex-1 sm:w-40 px-2 py-1 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                                    placeholder="Image description (optional)..."
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
                                <div className="w-full flex-1"><MediaUploadField value={sl.url} onChange={(url) => { const cloned = url ? block.slides.map((item, itemIndex) => itemIndex === sIdx ? { ...item, url } : item) : block.slides.filter((_, itemIndex) => itemIndex !== sIdx); handleUpdateBlock(block.id, { slides: cloned }); }} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label={`design system image ${sIdx + 1}`} isThumbnail={false} /></div>
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
                          <div>
                            <label className="text-zinc-400 font-mono text-[11px] block mb-1">
                              Showcase Header / Subtitle (Optional)
                            </label>
                            <BufferedTextInput
                              type="text"
                              value={block.subtitle || ''}
                              onCommit={(value) => handleUpdateBlock(block.id, { subtitle: value })}
                              placeholder="Desktop (1440px) &amp; Mobile (428px) Workflows"
                              className="w-full px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            />
                            <span className="text-[10px] text-zinc-500 mt-0.5 block">
                              Displayed above the screen track alongside screen count.
                            </span>
                          </div>

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
                                  <BufferedTextInput
                                    type="text"
                                    value={scr.label || ''}
                                    onCommit={(value) => {
                                      const cloned = [...block.screens];
                                      cloned[scIdx] = { ...cloned[scIdx], label: value };
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
                                <div className="w-full flex-1"><MediaUploadField value={scr.url} onChange={(url) => { const cloned = url ? block.screens.map((item, itemIndex) => itemIndex === scIdx ? { ...item, url } : item) : block.screens.filter((_, itemIndex) => itemIndex !== scIdx); handleUpdateBlock(block.id, { screens: cloned }); }} onUploadMedia={onUploadMedia} mediaLibrary={mediaLibrary} label={`product screen ${scIdx + 1}`} isThumbnail={false} /></div>
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
                          <BufferedTextInput
                            type="text"
                            value={block.title || ''}
                            onCommit={(value) => handleUpdateBlock(block.id, { title: value })}
                            className="px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Optional list title (e.g. Constraints:)..."
                          />
                          <BufferedTextarea
                            rows={3}
                            value={block.items?.join('\n') || ''}
                            onCommit={(value) =>
                              handleUpdateBlock(block.id, {
                                items: value.split('\n').filter((l) => l.trim().length > 0)
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="One bullet item per line..."
                          />
                        </div>
                      )}

                      {block.type === 'quote' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <BufferedTextarea
                            rows={2}
                            value={block.quote}
                            onCommit={(value) => handleUpdateBlock(block.id, { quote: value })}
                            className="md:col-span-3 px-3 py-2 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Quote text..."
                          />
                          <BufferedTextInput
                            type="text"
                            value={block.author || ''}
                            onCommit={(value) => handleUpdateBlock(block.id, { author: value })}
                            className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Author..."
                          />
                          <BufferedTextInput
                            type="text"
                            value={block.role || ''}
                            onCommit={(value) => handleUpdateBlock(block.id, { role: value })}
                            className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Role / Title..."
                          />
                        </div>
                      )}

                      {block.type === 'cta' && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <BufferedTextInput
                            type="text"
                            value={block.label}
                            onCommit={(value) => handleUpdateBlock(block.id, { label: value })}
                            className="w-full sm:w-48 px-2 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs"
                            placeholder="Button label..."
                          />
                          <BufferedTextInput
                            type="text"
                            value={block.url}
                            onCommit={(value) => handleUpdateBlock(block.id, { url: value })}
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

      {/* Safe Section Removal Modal: Disable vs Permanently Delete */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-white/15 p-6 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <span className="material-symbols-rounded text-2xl">visibility_off</span>
              </div>
              <div>
                <h3 className="text-base font-bold">Remove or Disable Section?</h3>
                <p className="text-xs text-zinc-400">
                  {sectionToDelete.navigationLabel || sectionToDelete.heading}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Do you want to <strong className="text-white">disable</strong> this section to hide it from visitors on the live project page, or <strong className="text-red-400">delete it permanently</strong>?
            </p>

            <div className="rounded-lg bg-black/40 border border-white/10 p-3 text-[11px] text-zinc-400">
              <span className="text-[#ff9a5b] font-semibold">Tip:</span> Disabling hides this section and its sidebar link without losing any of your {sectionToDelete.blocks?.length || 0} blocks, text, or images. You can re-enable it anytime with one click!
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  handleUpdateSection(sectionToDelete.id, { visible: false });
                  setSectionToDelete(null);
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span className="material-symbols-rounded text-sm">visibility_off</span>
                <span>Disable Instead (Hide without deleting)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeDeleteSection(sectionToDelete.id)}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-medium cursor-pointer"
                >
                  Delete Permanently
                </button>
                <button
                  type="button"
                  onClick={() => setSectionToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

