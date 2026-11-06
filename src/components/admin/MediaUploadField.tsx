import React, { useMemo, useRef, useState } from 'react';
import { ImagePlus, Upload, Crop, Sparkles } from 'lucide-react';
import { MediaAsset } from '../../types';
import { MediaPreview } from '../MediaPreview';
import { ImageCropPanZoomModal } from './ImageCropPanZoomModal';
import { compressAndOptimizeImage, isThumbnailLabelOrName } from '../../utils/media';

interface MediaUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onUploadMedia?: (file: File, isThumbnail?: boolean) => Promise<MediaAsset>;
  mediaLibrary?: MediaAsset[];
  label?: string;
  cropAspectRatio?: '21:9' | '16:9' | '16:10' | '4:3' | '1:1';
  isThumbnail?: boolean;
}

/** A visual media picker with live pan, zoom, crop-bleed visualization and direct upload. */
export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  value,
  onChange,
  onUploadMedia,
  mediaLibrary = [],
  label = 'Image',
  cropAspectRatio = '16:9',
  isThumbnail
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const directInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identify whether this field is a thumbnail (cover / card / listing)
  const isThumb = isThumbnail ?? isThumbnailLabelOrName(label);

  // Crop / Pan / Zoom modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSource, setCropImageSource] = useState<string>('');
  const [pendingFileName, setPendingFileName] = useState<string>(isThumb ? 'cropped-thumb.webp' : 'cropped-image.png');

  const images = useMemo(() => mediaLibrary.filter((asset) => (asset.mimeType || '').startsWith('image/')), [mediaLibrary]);

  // Handler for direct file upload (skipping crop modal)
  const handleDirectUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      // Compress ONLY thumbnail images; non-thumbnails retain full uncompressed visual fidelity
      const { file: optimizedFile, dataUrl } = await compressAndOptimizeImage(file, { isThumbnail: isThumb });

      if (onUploadMedia) {
        try {
          const asset = await onUploadMedia(optimizedFile, isThumb);
          onChange(asset.url);
          return;
        } catch (uploadErr) {
          console.warn('Cloud upload failed, falling back to optimized local data URI:', uploadErr);
          if (dataUrl) {
            onChange(dataUrl);
            return;
          }
          throw uploadErr;
        }
      } else if (dataUrl) {
        onChange(dataUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
      if (directInputRef.current) directInputRef.current.value = '';
    }
  };

  // Handler for file selected for cropping & pan/zoom before upload
  const handleFileForCropping = (file?: File) => {
    if (!file) return;
    const ext = isThumb ? '-thumb.webp' : '-framed.png';
    setPendingFileName(file.name.replace(/\.[^/.]+$/, '') + ext);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropImageSource(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  // Callback when crop and pan/zoom is applied
  const handleApplyCropped = async (dataUrl: string, blob: Blob) => {
    if (onUploadMedia) {
      setUploading(true);
      try {
        const fileType = isThumb ? (blob.type || 'image/webp') : 'image/png';
        const file = new File([blob], pendingFileName, { type: fileType });
        const asset = await onUploadMedia(file, isThumb);
        onChange(asset.url);
      } catch (err) {
        // Fallback to data URL if upload fails so user's work is not lost
        onChange(dataUrl);
        setError(err instanceof Error ? err.message : 'Upload failed; applied locally.');
      } finally {
        setUploading(false);
      }
    } else {
      onChange(dataUrl);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 min-w-0 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Upload & Choose Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {onUploadMedia && (
          <>
            {/* Input for Upload with Pan/Zoom & Crop */}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(event) => handleFileForCropping(event.currentTarget.files?.[0])}
            />

            {/* Input for Quick Direct Upload */}
            <input
              ref={directInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(event) => void handleDirectUpload(event.currentTarget.files?.[0])}
            />

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={uploading}
                onClick={() => directInputRef.current?.click()}
                title={isThumb ? "Upload and compress thumbnail for fast card grid loading" : "Upload original image with full uncompressed fidelity"}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                  isThumb
                    ? 'border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-white'
                    : 'border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-white'
                }`}
              >
                {uploading ? <Upload size={14} className="animate-pulse" /> : <Upload size={14} />}
                <span>
                  {uploading
                    ? 'Uploading…'
                    : isThumb
                    ? `Upload ${label} (Compressed Thumbnail)`
                    : `Upload ${label} (Original / Any Height)`}
                </span>
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                title="Optional: Crop, pan or zoom before uploading"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-2 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <Crop size={14} />
                <span>Crop / Frame</span>
              </button>
            </div>
          </>
        )}

        {/* Existing Assets Dropdown */}
        {images.length > 0 && (
          <select
            value={images.some((asset) => asset.url === value) ? value : ''}
            onChange={(event) => event.target.value && onChange(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 cursor-pointer"
          >
            <option value="">Choose from library ({images.length} images)</option>
            {images.map((asset) => (
              <option key={asset.id} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Image Preview with Pan/Zoom & Crop Action */}
      {value ? (
        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-zinc-950 group">
          <div className="min-h-[140px] max-h-[320px] bg-black/70 flex items-center justify-center p-2">
            <MediaPreview src={value} alt={label} className="max-h-[300px] w-auto max-w-full object-contain rounded" />
          </div>

          {/* Action overlay buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCropImageSource(value);
                setCropModalOpen(true);
              }}
              title="Pan, zoom, and reframe this image so it fits without getting cropped"
              className="inline-flex items-center gap-1 rounded-md bg-black/80 hover:bg-[#ff853a] border border-white/15 hover:border-transparent px-2.5 py-1 text-[11px] font-medium text-white transition-all cursor-pointer shadow-md"
            >
              <Crop size={12} />
              <span>Pan &amp; Zoom</span>
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-md bg-black/80 hover:bg-red-600 px-2 py-1 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-transparent"
            >
              Remove
            </button>
          </div>

          <div className="p-2 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="truncate max-w-[200px] font-mono text-[10px]">{value.split('/').pop()}</span>
            <button
              type="button"
              onClick={() => {
                setCropImageSource(value);
                setCropModalOpen(true);
              }}
              className="text-[#ff9a5b] hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
            >
              <Sparkles size={11} />
              <span>Preview framing / crop cut-off</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-zinc-500">
          No image selected. Click &ldquo;Adjust &amp; Upload&rdquo; to pan, zoom, and check crop cut-offs before publishing.
        </p>
      )}

      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

      {/* Interactive Modal */}
      <ImageCropPanZoomModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageUrl={cropImageSource}
        imageTitle={`Frame ${label}`}
        defaultAspectRatio={cropAspectRatio}
        onApplyCrop={handleApplyCropped}
        isThumbnail={isThumb}
      />
    </div>
  );
};
