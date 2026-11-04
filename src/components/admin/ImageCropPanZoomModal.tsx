import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw,
  Check,
  X,
  Grid,
  Eye,
  Sparkles,
  Layers,
  AlertTriangle,
  Scissors
} from 'lucide-react';

interface ImageCropPanZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
  defaultAspectRatio?: 'original' | '21:9' | '16:9' | '16:10' | '4:3' | '1:1';
  onApplyCrop: (croppedDataUrl: string, blob: Blob) => Promise<void> | void;
}

export const ImageCropPanZoomModal: React.FC<ImageCropPanZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle = 'Adjust Image Framing',
  defaultAspectRatio = 'original',
  onApplyCrop
}) => {
  const [aspectRatio, setAspectRatio] = useState<'original' | '21:9' | '16:9' | '16:10' | '4:3' | '1:1'>(defaultAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showCropCutoff, setShowCropCutoff] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState<'#000000' | '#09090b' | '#181923'>('#000000');
  const [isRendering, setIsRendering] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync default aspect ratio when opened
  useEffect(() => {
    if (isOpen) {
      setAspectRatio(defaultAspectRatio);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, defaultAspectRatio]);

  // Load natural dimensions of the image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Compute aspect ratio value
  const getAspectNumeric = useCallback(() => {
    if (aspectRatio === 'original' && naturalDimensions && naturalDimensions.height > 0) {
      return naturalDimensions.width / naturalDimensions.height;
    }
    switch (aspectRatio) {
      case '21:9':
        return 21 / 9;
      case '16:10':
        return 16 / 10;
      case '4:3':
        return 4 / 3;
      case '1:1':
        return 1;
      case '16:9':
      default:
        return 16 / 9;
    }
  }, [aspectRatio, naturalDimensions]);

  // Calculate crop coverage percentage
  const cropStats = useMemo(() => {
    if (!naturalDimensions) {
      return { percentRetained: 100, isCropped: false };
    }
    const frameAspect = getAspectNumeric();
    const imgAspect = naturalDimensions.width / naturalDimensions.height;

    let coverageX = 1;
    let coverageY = 1;

    if (imgAspect > frameAspect) {
      // Image is wider than frame
      const widthFactor = (imgAspect / frameAspect) * zoom;
      coverageX = widthFactor > 1 ? 1 / widthFactor : 1;
      coverageY = zoom > 1 ? 1 / zoom : 1;
    } else {
      // Image is taller than frame
      const heightFactor = (frameAspect / imgAspect) * zoom;
      coverageY = heightFactor > 1 ? 1 / heightFactor : 1;
      coverageX = zoom > 1 ? 1 / zoom : 1;
    }

    const percentRetained = Math.min(100, Math.max(1, Math.round(coverageX * coverageY * 100)));
    const isCropped = percentRetained < 98;

    return { percentRetained, isCropped };
  }, [naturalDimensions, getAspectNumeric, zoom]);

  // Pointer drag events for intuitive panning
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(3.5, Math.max(0.35, Number((prev + delta).toFixed(2)))));
  };

  // Quick preset: Fit Entire Image without any cropping (Letterboxed)
  const handleFitEntireImage = () => {
    if (!naturalDimensions) return;
    const aspect = getAspectNumeric();
    const imgAspect = naturalDimensions.width / naturalDimensions.height;
    let targetZoom = 1;
    if (imgAspect > aspect) {
      // Wider than frame: fit width so height shrinks to fit
      targetZoom = aspect / imgAspect;
    } else {
      // Taller than frame: fit height so width shrinks to fit
      targetZoom = imgAspect / aspect;
    }
    setZoom(Number(Math.max(0.35, targetZoom * 0.98).toFixed(2)));
    setPan({ x: 0, y: 0 });
  };

  // Quick preset: Fill Frame (Cover center)
  const handleFillFrame = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Render and apply crop to Canvas
  const handleApply = async () => {
    if (!imageUrl) return;
    setIsRendering(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
        img.src = imageUrl;
      });

      const aspect = getAspectNumeric();
      // High-res export dimensions
      const outputWidth = Math.min(2560, Math.max(1600, img.naturalWidth));
      const outputHeight = Math.round(outputWidth / aspect);

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // Fill background (for letterbox/contain)
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Base scaling
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawW: number;
      let drawH: number;

      if (imgAspect > aspect) {
        // Image is wider than crop box
        drawH = outputHeight * zoom;
        drawW = drawH * imgAspect;
      } else {
        // Image is taller than crop box
        drawW = outputWidth * zoom;
        drawH = drawW / imgAspect;
      }

      // Container scale multiplier
      const containerW = containerRef.current?.clientWidth || 600;
      const scaleMultiplier = outputWidth / containerW;

      const drawX = (outputWidth - drawW) / 2 + pan.x * scaleMultiplier;
      const drawY = (outputHeight - drawH) / 2 + pan.y * scaleMultiplier;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Generate WebP blob & data url
      const dataUrl = canvas.toDataURL('image/webp', 0.92);

      await new Promise<void>((resolve) => {
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              await onApplyCrop(dataUrl, blob);
            }
            resolve();
          },
          'image/webp',
          0.92
        );
      });

      onClose();
    } catch (err) {
      console.error('Cropping error:', err);
    } finally {
      setIsRendering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-cs-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-[#12131a] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#181923]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f37021]/15 text-[#f37021] flex items-center justify-center">
              <Scissors size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                <span>{imageTitle}</span>
                <span className="text-[11px] font-mono font-normal text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {aspectRatio}
                </span>
              </h3>
              <p className="text-zinc-400 text-xs">
                Pan, zoom, or scale to fit so key content doesn&apos;t get cropped. Cutoff areas are shown dimmed outside the frame.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar: Aspect Ratios, Presets, Crop Indicator */}
        <div className="px-5 py-3 border-b border-white/10 bg-[#0d0e14] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Aspect Ratios */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-400 font-mono text-[11px] mr-1">FRAME RATIO:</span>
            {(['original', '16:9', '16:10', '4:3', '1:1', '21:9'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => {
                  setAspectRatio(ratio);
                  setPan({ x: 0, y: 0 });
                }}
                className={`px-2.5 py-1 rounded-md font-mono text-xs cursor-pointer transition-all ${
                  aspectRatio === ratio
                    ? 'bg-[#f37021] text-white font-bold shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
                }`}
              >
                {ratio === 'original' ? 'Original (Full)' : ratio}
              </button>
            ))}
          </div>

          {/* Quick Fit Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleFitEntireImage}
              title="Scale down so 100% of image is preserved inside the frame (zero cropping)"
              className="px-3 py-1.5 rounded-md bg-[#8be28b]/15 hover:bg-[#8be28b]/25 border border-[#8be28b]/30 text-[#8be28b] font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Minimize2 size={13} />
              <span>Fit Entire Image (No Crop)</span>
            </button>

            <button
              type="button"
              onClick={handleFillFrame}
              title="Fill the entire frame (standard center cover)"
              className="px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Maximize2 size={13} className="text-zinc-400" />
              <span>Fill Frame</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              title="Reset position & zoom"
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas Container with Dimmed Cutoff Bleed */}
        <div className="flex-1 min-h-[360px] sm:min-h-[420px] bg-[#070709] p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
          {/* Crop Cutoff Bleed Indicator & Stats Bar */}
          <div className="w-full max-w-[720px] flex items-center justify-between mb-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              {cropStats.isCropped ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <span>~{100 - cropStats.percentRetained}% cropped outside frame ({cropStats.percentRetained}% visible)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                  <Check size={12} className="text-emerald-400 shrink-0" />
                  <span>100% visible · Zero content cropped</span>
                </span>
              )}

              {naturalDimensions && (
                <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">
                  Original: {naturalDimensions.width} × {naturalDimensions.height} px
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCropCutoff(!showCropCutoff)}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Eye size={12} className={showCropCutoff ? 'text-[#f37021]' : 'text-zinc-500'} />
                <span>{showCropCutoff ? 'Cutoff Area: Dimmed' : 'Cutoff Area: Hidden'}</span>
              </button>
            </div>
          </div>

          {/* Active Frame Boundary Box */}
          <div
            ref={containerRef}
            style={{
              aspectRatio: aspectRatio.replace(':', '/'),
              backgroundColor
            }}
            className="w-full max-w-[720px] max-h-[380px] relative rounded-lg border-2 border-[#f37021] cursor-grab active:cursor-grabbing flex items-center justify-center"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* Box-shadow overlay dimming out-of-frame cutoff content while keeping it visible */}
            {showCropCutoff ? (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  boxShadow: '0 0 0 9999px rgba(5, 5, 8, 0.76)'
                }}
              />
            ) : null}

            {/* The Draggable & Scalable Image inside the frame */}
            <div className={`w-full h-full relative ${showCropCutoff ? 'overflow-visible' : 'overflow-hidden rounded-lg'}`}>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop target"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                  maxWidth: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Rule of Thirds Guide Grid */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20 rounded-lg overflow-hidden">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div />
              </div>
            )}

            {/* Corner Crop Marks for Framing Accuracy */}
            <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />

            {/* Center Crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
              <div className="w-4 h-px bg-white/50" />
              <div className="w-px h-4 bg-white/50 absolute" />
            </div>

            {/* Live output frame tag */}
            <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded bg-black/85 backdrop-blur-sm text-[10px] text-zinc-300 font-mono flex items-center gap-1.5 pointer-events-none border border-white/10 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021] animate-pulse" />
              <span>Visible Output Frame ({aspectRatio})</span>
            </div>
          </div>

          {/* Quick instructions floating badge */}
          <div className="absolute top-3 right-4 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 text-[11px] text-zinc-400 pointer-events-none flex items-center gap-1.5 z-20">
            <Move size={12} className="text-[#f37021]" />
            <span>Drag to pan · Scroll or slider to zoom</span>
          </div>
        </div>

        {/* Bottom Interactive Controls (Zoom Slider & Action Buttons) */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#12131a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Zoom Slider and Background color choice */}
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <ZoomOut size={16} className="text-zinc-500 shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400 font-medium">Zoom Level</span>
                <span className="text-white font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.35"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#f37021]"
              />
            </div>
            <ZoomIn size={16} className="text-zinc-500 shrink-0" />

            {/* Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                showGrid
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-transparent text-zinc-500 border-white/5 hover:text-white'
              }`}
              title="Toggle rule of thirds grid"
            >
              <Grid size={15} />
            </button>

            {/* Letterbox Background selector (for contain fit) */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-3">
              <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">BG:</span>
              {(['#000000', '#09090b', '#181923'] as const).map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBackgroundColor(bg)}
                  style={{ backgroundColor: bg }}
                  className={`w-5 h-5 rounded-full border cursor-pointer transition-all ${
                    backgroundColor === bg ? 'border-[#f37021] scale-110' : 'border-white/20'
                  }`}
                  title={`Background: ${bg}`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isRendering}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isRendering}
              className="px-5 py-2.5 rounded-lg bg-[#f37021] hover:bg-[#ff7e33] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#f37021]/25 transition-all disabled:opacity-50"
            >
              {isRendering ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Applying Framing…</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Save Framing &amp; Apply</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
