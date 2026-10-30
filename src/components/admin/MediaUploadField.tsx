import React, { useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { MediaAsset } from '../../types';
import { MediaPreview } from '../MediaPreview';

interface MediaUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onUploadMedia?: (file: File) => Promise<MediaAsset>;
  mediaLibrary?: MediaAsset[];
  label?: string;
}

/** A visual media picker that uploads straight to Supabase or reuses an existing asset. */
export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  value,
  onChange,
  onUploadMedia,
  mediaLibrary = [],
  label = 'Image'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const images = mediaLibrary.filter((asset) => (asset.mimeType || '').startsWith('image/'));

  const upload = async (file?: File) => {
    if (!file || !onUploadMedia) return;
    setUploading(true);
    setError(null);
    try {
      const asset = await onUploadMedia(file);
      onChange(asset.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2.5 min-w-0">
      <div className="flex flex-col sm:flex-row gap-2">
        {onUploadMedia && (
          <>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={(event) => void upload(event.currentTarget.files?.[0])} />
            <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#ff853a]/35 bg-[#ff853a]/10 px-3 py-2 text-xs font-semibold text-[#ffb17d] hover:bg-[#ff853a]/20 disabled:opacity-60">
              {uploading ? <Upload size={14} className="animate-pulse" /> : <ImagePlus size={14} />}
              {uploading ? 'Uploading…' : `Upload ${label.toLowerCase()}`}
            </button>
          </>
        )}
        {images.length > 0 && (
          <select value={images.some((asset) => asset.url === value) ? value : ''} onChange={(event) => event.target.value && onChange(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
            <option value="">Choose an uploaded image</option>
            {images.map((asset) => <option key={asset.id} value={asset.url}>{asset.name}</option>)}
          </select>
        )}
      </div>
      {value ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
          <div className="aspect-video"><MediaPreview src={value} alt={label} className="h-full w-full object-cover" /></div>
          <button type="button" onClick={() => onChange('')} className="absolute right-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[10px] text-white hover:bg-red-600">Remove image</button>
        </div>
      ) : <p className="text-[11px] text-zinc-500">No image selected. Upload one or choose from your uploaded images.</p>}
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    </div>
  );
};
