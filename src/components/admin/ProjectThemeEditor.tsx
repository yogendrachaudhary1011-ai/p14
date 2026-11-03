import React, { useState, useEffect, useRef } from 'react';
import { ProjectTheme } from '../../types';
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  QUICK_ACCENT_COLORS,
  QUICK_BG_COLORS,
  resolveProjectTheme,
  FONT_MAP,
  CARD_RADIUS_MAP,
  TITLE_SIZE_CLASSES
} from '../../utils/themePresets';
import {
  Palette,
  Check,
  RefreshCw,
  Eye,
  Sparkles,
  SlidersHorizontal,
  Type,
  Box,
  Grid,
  Copy,
  ClipboardPaste,
  Pipette
} from 'lucide-react';

export function sanitizeColorInput(raw: string, allowRgba = false): string | null {
  if (!raw) return null;
  let text = raw.trim();

  // Strip CSS property prefixes like "color:", "background:", ";", and quotes
  text = text.replace(/^[a-z-]+:\s*/i, '').replace(/;+$/, '').replace(/['"]/g, '').trim();

  // Handle rgb / rgba
  const rgbMatch = text.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbMatch) {
    if (allowRgba && rgbMatch[4] !== undefined) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${rgbMatch[4]})`;
    }
    const r = Math.min(255, parseInt(rgbMatch[1], 10)).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(rgbMatch[2], 10)).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(rgbMatch[3], 10)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toLowerCase();
  }

  // Handle rgba if allowed
  if (allowRgba && /^rgba?\(/i.test(text)) {
    return text;
  }

  // Strip all non-hex characters except '#'
  let hexOnly = text.replace(/[^a-fA-F0-9#]/g, '');
  if (!hexOnly.startsWith('#')) {
    hexOnly = `#${hexOnly}`;
  }

  // 3-digit hex #abc -> #aabbcc
  if (/^#[0-9a-fA-F]{3}$/i.test(hexOnly)) {
    const r = hexOnly[1];
    const g = hexOnly[2];
    const b = hexOnly[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  // 6-digit hex #abcdef
  if (/^#[0-9a-fA-F]{6}$/i.test(hexOnly)) {
    return hexOnly.toLowerCase();
  }

  // 8-digit hex #rrggbbaa (take RGB)
  if (/^#[0-9a-fA-F]{8}$/i.test(hexOnly)) {
    return hexOnly.toLowerCase();
  }

  return hexOnly.length > 1 ? hexOnly : null;
}

function toSafeHex(val: string, fallback = '#8be28b'): string {
  if (!val) return fallback;
  const sanitized = sanitizeColorInput(val);
  if (sanitized && /^#[0-9a-fA-F]{6}$/i.test(sanitized)) {
    return sanitized.toLowerCase();
  }
  return fallback;
}

interface ColorHexFieldProps {
  label: string;
  description?: string;
  value: string;
  fallbackHex: string;
  placeholder?: string;
  allowRgba?: boolean;
  swatches?: Array<{ name: string; hex: string }>;
  onChange: (val: string) => void;
}

const ColorHexField: React.FC<ColorHexFieldProps> = ({
  label,
  description,
  value,
  fallbackHex,
  placeholder,
  allowRgba = false,
  swatches,
  onChange
}) => {
  const [localText, setLocalText] = useState(value);
  const [feedback, setFeedback] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalText(value);
  }, [value]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1600);
  };

  const handleApply = (raw: string) => {
    const clean = sanitizeColorInput(raw, allowRgba);
    if (clean) {
      setLocalText(clean);
      onChange(clean);
      return clean;
    }
    return null;
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    const clean = handleApply(pasted);
    if (clean) {
      e.preventDefault();
      showFeedback('Pasted!');
    }
  };

  const handlePasteButtonClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showFeedback('Clipboard empty');
        return;
      }
      const clean = handleApply(text);
      if (clean) {
        showFeedback('Pasted!');
      } else {
        showFeedback('Invalid color code');
      }
    } catch {
      showFeedback('Press Ctrl+V to paste');
    }
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showFeedback('Copied!');
    } catch {
      showFeedback('Copy failed');
    }
  };

  const safeHexForPicker = toSafeHex(value, fallbackHex);

  return (
    <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/10 flex flex-col gap-2.5 transition-all hover:border-white/20">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase text-zinc-300 font-semibold tracking-wider">
          {label}
        </label>
        {description && <span className="text-[10px] text-zinc-500">{description}</span>}
      </div>

      <div className="flex items-center gap-2">
        {/* Color picker trigger button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center cursor-pointer shadow-inner transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: safeHexForPicker }}
            title="Click to open color picker"
          >
            <Pipette size={14} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-white/90" />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={safeHexForPicker}
            onChange={(e) => {
              setLocalText(e.target.value);
              onChange(e.target.value);
            }}
            className="sr-only"
            aria-label={`${label} color picker`}
          />
        </div>

        {/* Monospace Hex Input with auto-paste formatting */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={localText}
            onChange={(e) => {
              setLocalText(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value.trim())) {
                onChange(e.target.value.trim().toLowerCase());
              }
            }}
            onPaste={handlePasteEvent}
            onBlur={() => {
              const clean = handleApply(localText);
              if (!clean) {
                setLocalText(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply(localText);
              }
            }}
            placeholder={placeholder || '#000000'}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white font-mono text-xs focus:border-[#ff853a] focus:ring-1 focus:ring-[#ff853a]/30 transition-all outline-none"
          />
        </div>

        {/* 1-Click Paste from Clipboard Button */}
        <button
          type="button"
          onClick={handlePasteButtonClick}
          className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95"
          title="Paste color hex code from clipboard"
        >
          <ClipboardPaste size={13} className="text-[#ff853a]" />
          <span className="hidden sm:inline">Paste</span>
        </button>

        {/* 1-Click Copy Button */}
        <button
          type="button"
          onClick={handleCopyClick}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white cursor-pointer transition-all shrink-0 active:scale-95"
          title="Copy current color code"
        >
          {feedback === 'Copied!' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>

      {/* Helpful feedback badge or hint */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>Paste any hex code (e.g. #ff853a or ff853a)</span>
        {feedback && (
          <span className="text-[#8be28b] font-semibold flex items-center gap-1">
            <Check size={11} strokeWidth={3} />
            <span>{feedback}</span>
          </span>
        )}
      </div>

      {/* Quick Swatches if provided */}
      {swatches && swatches.length > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          <span className="text-[10px] font-mono text-zinc-500 mr-1">Quick:</span>
          {swatches.map((s) => (
            <button
              key={s.hex}
              type="button"
              onClick={() => {
                setLocalText(s.hex);
                onChange(s.hex);
              }}
              className="w-4 h-4 rounded-full border border-black/40 hover:scale-125 transition-transform cursor-pointer shadow-xs"
              style={{ backgroundColor: s.hex }}
              title={`${s.name} (${s.hex})`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ProjectThemeEditorProps {
  theme: ProjectTheme;
  onChange: (updatedTheme: ProjectTheme) => void;
  projectTitle: string;
  onOpenLivePreview?: () => void;
}

export const ProjectThemeEditor: React.FC<ProjectThemeEditorProps> = ({
  theme,
  onChange,
  projectTitle,
  onOpenLivePreview
}) => {
  const resolved = resolveProjectTheme(theme);
  const currentPreset = theme.preset || 'default';

  const handlePresetSelect = (presetId: typeof THEME_PRESETS[number]['id']) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    onChange({
      ...found.theme,
      preset: presetId
    });
  };

  const handleFieldChange = <K extends keyof ProjectTheme>(key: K, value: ProjectTheme[K]) => {
    onChange({
      ...theme,
      [key]: value,
      preset: 'custom'
    });
  };

  const handleResetToDefault = () => {
    onChange({
      ...DEFAULT_THEME,
      preset: 'default'
    });
  };

  return (
    <div className="w-full flex flex-col gap-8 text-white">
      {/* Header Info & Quick Actions */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
            style={{ backgroundColor: resolved.cardBackground, color: resolved.accentColor }}
          >
            <Palette size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base">Custom Case Study Theme</h3>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border"
                style={{
                  backgroundColor: `${resolved.accentColor}20`,
                  color: resolved.accentColor,
                  borderColor: `${resolved.accentColor}50`
                }}
              >
                {currentPreset === 'custom' ? 'Custom Style' : THEME_PRESETS.find((p) => p.id === currentPreset)?.name}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">
              Personalize colors, card radii, typography, and patterns specifically for &ldquo;{projectTitle}&rdquo;. Other projects remain unaffected.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {onOpenLivePreview && (
            <button
              type="button"
              onClick={onOpenLivePreview}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <Eye size={14} />
              <span>Preview Detail Page</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            title="Reset to default theme"
          >
            <RefreshCw size={13} />
            <span>Reset Theme</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PRESET PALETTES */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5 tracking-wider">
            <Sparkles size={13} className="text-[#ff853a]" />
            <span>Theme Presets (One-Click Application)</span>
          </label>
          <span className="text-[11px] text-zinc-500">Click a preset to apply all coordinated styles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'border-white/40 ring-2 ring-white/20 shadow-lg'
                    : 'border-white/10 hover:border-white/25 hover:translate-y-[-2px]'
                }`}
                style={{ backgroundColor: preset.theme.cardBackground }}
              >
                {/* Visual Swatch Strip */}
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                      style={{ backgroundColor: preset.theme.backgroundColor }}
                      title="Background"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                      style={{ backgroundColor: preset.theme.cardBackground }}
                      title="Card Background"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-xs ring-1 ring-white/20"
                      style={{ backgroundColor: preset.theme.accentColor }}
                      title="Accent Color"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                      style={{ backgroundColor: preset.theme.textColor }}
                      title="Text Color"
                    />
                  </div>

                  {isSelected && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                      style={{ backgroundColor: preset.theme.accentColor }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div>
                  <div
                    className="font-bold text-sm"
                    style={{ color: preset.theme.textColor }}
                  >
                    {preset.name}
                  </div>
                  <p
                    className="text-[11px] line-clamp-2 mt-0.5 leading-relaxed"
                    style={{ color: preset.theme.mutedTextColor }}
                  >
                    {preset.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: LIVE PREVIEW & FINE-TUNING SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: GRANULAR CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Comprehensive Text & Typography Colors */}
          <div className="p-5 rounded-xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Type size={16} className="text-[#ff853a]" />
                  <span>Customize All Text Colors</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Paste any hex code or click &ldquo;Paste&rdquo; from clipboard to customize each specific text type.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-950 border border-white/10">
                Text Colors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Heading Color */}
              <ColorHexField
                label="Headings & Main Title"
                description="Hero H1 title, chapter headings (H2, H3, H4)"
                value={resolved.headingColor}
                fallbackHex="#ffffff"
                placeholder="#ffffff"
                swatches={[
                  { name: 'Pure White', hex: '#ffffff' },
                  { name: 'Soft Cream', hex: '#fefce8' },
                  { name: 'Off-White', hex: '#fafaf9' },
                  { name: 'Light Slate', hex: '#f8fafc' },
                  { name: 'Deep Black', hex: '#09090b' }
                ]}
                onChange={(val) => handleFieldChange('headingColor', val)}
              />

              {/* Body & Narrative Paragraphs */}
              <ColorHexField
                label="Body Paragraphs & Summary"
                description="Intro narrative, section intros, paragraph copy"
                value={resolved.bodyTextColor}
                fallbackHex="#ffffff"
                placeholder="#ffffff"
                swatches={[
                  { name: 'Pure White', hex: '#ffffff' },
                  { name: 'Soft Silver', hex: '#e4e4e7' },
                  { name: 'Slate 200', hex: '#e2e8f0' },
                  { name: 'Muted Zinc', hex: '#d4d4d8' },
                  { name: 'Dark Slate', hex: '#1e293b' }
                ]}
                onChange={(val) => handleFieldChange('bodyTextColor', val)}
              />

              {/* Muted Metadata Labels */}
              <ColorHexField
                label="Metadata & Subtitle Labels"
                description="Role, duration, deliverables, captions, footnotes"
                value={resolved.mutedTextColor}
                fallbackHex="#a1a1aa"
                placeholder="#a1a1aa"
                swatches={[
                  { name: 'Zinc 400', hex: '#a1a1aa' },
                  { name: 'Slate 400', hex: '#94a3b8' },
                  { name: 'Stone 400', hex: '#a8a29e' },
                  { name: 'Zinc 500', hex: '#71717a' },
                  { name: 'Dark Gray', hex: '#52525b' }
                ]}
                onChange={(val) => handleFieldChange('mutedTextColor', val)}
              />

              {/* Card Titles */}
              <ColorHexField
                label="Card Titles & Headers"
                description="Titles inside cards, decisions, and comparisons"
                value={resolved.cardTitleColor}
                fallbackHex="#ffffff"
                placeholder="#ffffff"
                swatches={[
                  { name: 'Pure White', hex: '#ffffff' },
                  { name: 'Soft Silver', hex: '#f4f4f5' },
                  { name: 'Mint Accent', hex: '#8be28b' },
                  { name: 'Amber Accent', hex: '#ff853a' },
                  { name: 'Deep Black', hex: '#09090b' }
                ]}
                onChange={(val) => handleFieldChange('cardTitleColor', val)}
              />

              {/* Card Body Text */}
              <ColorHexField
                label="Card Content & Bullet Text"
                description="Descriptions, bullet lists, constraints & learnings"
                value={resolved.cardTextColor}
                fallbackHex="#a1a1aa"
                placeholder="#a1a1aa"
                swatches={[
                  { name: 'Zinc 400', hex: '#a1a1aa' },
                  { name: 'Zinc 300', hex: '#d4d4d8' },
                  { name: 'Slate 400', hex: '#94a3b8' },
                  { name: 'Stone 400', hex: '#a8a29e' },
                  { name: 'Dark Slate', hex: '#475569' }
                ]}
                onChange={(val) => handleFieldChange('cardTextColor', val)}
              />

              {/* Accent Numbers & Badges */}
              <ColorHexField
                label="Accent Numbers & Badges"
                description="Chapter numbers (01, 02), tag pills, active nav item"
                value={resolved.accentTextColor}
                fallbackHex="#8be28b"
                placeholder="#8be28b"
                swatches={QUICK_ACCENT_COLORS}
                onChange={(val) => handleFieldChange('accentTextColor', val)}
              />

              {/* Table of Contents Nav Links */}
              <ColorHexField
                label="Table of Contents Links"
                description="Inactive navigation link text in sticky outline"
                value={resolved.navTextColor}
                fallbackHex="#a1a1aa"
                placeholder="#a1a1aa"
                swatches={[
                  { name: 'Zinc 400', hex: '#a1a1aa' },
                  { name: 'Zinc 500', hex: '#71717a' },
                  { name: 'Slate 400', hex: '#94a3b8' },
                  { name: 'Pure White', hex: '#ffffff' }
                ]}
                onChange={(val) => handleFieldChange('navTextColor', val)}
              />

              {/* Button Action Text */}
              <ColorHexField
                label="Primary Button Text"
                description="Text inside primary buttons (Figma / Live link)"
                value={resolved.buttonTextColor}
                fallbackHex="#ffffff"
                placeholder="#ffffff"
                swatches={[
                  { name: 'Pitch Black', hex: '#000000' },
                  { name: 'Pure White', hex: '#ffffff' },
                  { name: 'Deep Slate', hex: '#0f172a' }
                ]}
                onChange={(val) => handleFieldChange('buttonTextColor', val)}
              />
            </div>
          </div>

          {/* Card 2: Canvas, Surfaces, Card Borders & Accents */}
          <div className="p-5 rounded-xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#ff853a]" />
                  <span>Surfaces, Accents & Dividers</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Control the background canvas, card surfaces, borders, and accent line styling.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-950 border border-white/10">
                Surfaces
              </span>
            </div>

            {/* Quick Accent Swatches */}
            <div>
              <span className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Quick Accent Palette
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_ACCENT_COLORS.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => {
                      handleFieldChange('accentColor', swatch.hex);
                      handleFieldChange('accentTextColor', swatch.hex);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-white/10 hover:border-white/30 text-xs transition-all cursor-pointer"
                    title={swatch.name}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-zinc-300 text-[11px]">{swatch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Accent Color */}
              <ColorHexField
                label="Primary Accent Color"
                description="Scroll progress indicator, button background, glow"
                value={resolved.accentColor}
                fallbackHex="#8be28b"
                placeholder="#8be28b"
                swatches={QUICK_ACCENT_COLORS}
                onChange={(val) => handleFieldChange('accentColor', val)}
              />

              {/* Page Background Color */}
              <ColorHexField
                label="Page Background"
                description="Root canvas background"
                value={resolved.backgroundColor}
                fallbackHex="#000000"
                placeholder="#000000"
                swatches={QUICK_BG_COLORS}
                onChange={(val) => handleFieldChange('backgroundColor', val)}
              />

              {/* Card Surface Background */}
              <ColorHexField
                label="Card Surface Background"
                description="Panels, cards & dialog surfaces"
                value={resolved.cardBackground}
                fallbackHex="#18181b"
                placeholder="#18181b"
                swatches={[
                  { name: 'Zinc 900', hex: '#18181b' },
                  { name: 'Slate 900', hex: '#0f172a' },
                  { name: 'Stone 900', hex: '#1c1917' },
                  { name: 'Pure Black', hex: '#09090b' },
                  { name: 'Clean White', hex: '#ffffff' }
                ]}
                onChange={(val) => handleFieldChange('cardBackground', val)}
              />

              {/* Card Border Color */}
              <ColorHexField
                label="Card Border Color"
                description="Card stroke & interactive hover states"
                value={resolved.cardBorderColor}
                fallbackHex="#27272a"
                placeholder="rgba(255, 255, 255, 0.08) or #27272a"
                allowRgba={true}
                swatches={[
                  { name: 'Subtle White', hex: '#ffffff1a' },
                  { name: 'Zinc 800', hex: '#27272a' },
                  { name: 'Zinc 700', hex: '#3f3f46' },
                  { name: 'Subtle Black', hex: '#0000001a' }
                ]}
                onChange={(val) => handleFieldChange('cardBorderColor', val)}
              />

              {/* Section Divider Line Color (Span full width) */}
              <div className="sm:col-span-2">
                <ColorHexField
                  label="Section Divider Line Color"
                  description="Chapter and section separator line strokes"
                  value={resolved.dividerColor}
                  fallbackHex="#ffffff"
                  placeholder="rgba(255, 255, 255, 0.20) or #ffffff"
                  allowRgba={true}
                  swatches={[
                    { name: 'Subtle White', hex: '#ffffff33' },
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Subtle Accent', hex: `${resolved.accentColor}55` },
                    { name: 'Subtle Dark', hex: '#00000033' }
                  ]}
                  onChange={(val) => handleFieldChange('dividerColor', val)}
                />
              </div>
            </div>
          </div>

          {/* Typography & Layout Controls */}
          <div className="p-5 rounded-xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Type size={15} className="text-[#ff853a]" />
                <span>Typography & Proportions</span>
              </h4>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Heading & Body Font Family
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'plus-jakarta', label: 'Plus Jakarta Sans', sample: 'Modern Tech' },
                  { id: 'inter', label: 'Inter', sample: 'Neutral Geometric' },
                  { id: 'dm-sans', label: 'DM Sans', sample: 'Clean Humanist' },
                  { id: 'serif', label: 'Editorial Serif', sample: 'Luxury Editorial' },
                  { id: 'mono', label: 'DM Mono', sample: 'Technical Code' }
                ].map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleFieldChange('fontFamily', font.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      resolved.fontFamily === font.id
                        ? 'bg-zinc-800 border-[#ff853a] text-white shadow-xs'
                        : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-semibold">{font.label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{font.sample}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Scale */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Hero Title Size Scale
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'compact', label: 'Compact', detail: '3XL to 6XL' },
                  { id: 'normal', label: 'Balanced (Default)', detail: '4XL to 7XL' },
                  { id: 'large', label: 'Impactful', detail: '5XL to 8XL' },
                  { id: 'oversized', label: 'Oversized', detail: '6XL to 9XL' }
                ].map((scale) => (
                  <button
                    key={scale.id}
                    type="button"
                    onClick={() => handleFieldChange('titleSize', scale.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      resolved.titleSize === scale.id
                        ? 'bg-zinc-800 border-[#ff853a] text-white'
                        : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-medium">{scale.label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{scale.detail}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Corner Radius */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Card Corner Radius
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'sharp', label: 'Sharp', radius: '0px' },
                  { id: 'subtle', label: 'Subtle', radius: '6px' },
                  { id: 'rounded', label: 'Rounded', radius: '12px' },
                  { id: 'pill', label: 'Soft Pill', radius: '24px' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleFieldChange('cardRadius', r.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                      resolved.cardRadius === r.id
                        ? 'bg-zinc-800 border-[#ff853a] text-white'
                        : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-xs font-medium">{r.label}</span>
                    <span
                      className="w-4 h-4 border border-zinc-500 bg-white/10"
                      style={{ borderRadius: r.radius }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Background Pattern & Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                  Atmospheric Background Pattern
                </label>
                <select
                  value={resolved.backgroundPattern}
                  onChange={(e) => handleFieldChange('backgroundPattern', e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-zinc-950 border border-white/10 text-white text-xs"
                >
                  <option value="grid">Blueprint Architectural Grid</option>
                  <option value="dots">Subtle Dot Matrix</option>
                  <option value="glow">Ambient Accent Glow</option>
                  <option value="none">Clean Solid (No Pattern)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                  Reading Scroll Progress Bar
                </label>
                <div className="flex items-center gap-3 h-9">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={resolved.showProgressBar}
                      onChange={(e) => handleFieldChange('showProgressBar', e.target.checked)}
                      className="rounded bg-zinc-950 border-white/20 text-[#ff853a] focus:ring-0"
                    />
                    <span>Show top scroll accent indicator</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW CARD (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Eye size={13} className="text-[#ff853a]" />
              <span>Real-Time Theme Preview</span>
            </span>
            <span className="text-[10px] text-zinc-500">Live render of all text &amp; styling</span>
          </div>

          {/* Interactive Preview Container styled exactly according to theme settings */}
          <div
            className="w-full rounded-xl p-6 border shadow-2xl transition-all relative overflow-hidden"
            style={{
              backgroundColor: resolved.backgroundColor,
              color: resolved.bodyTextColor,
              borderColor: resolved.cardBorderColor,
              fontFamily: FONT_MAP[resolved.fontFamily]
            }}
          >
            {/* Top progress simulation */}
            {resolved.showProgressBar && (
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/5">
                <div
                  className="h-full w-2/3"
                  style={{
                    backgroundColor: resolved.accentColor,
                    boxShadow: `0 0 10px ${resolved.accentColor}80`
                  }}
                />
              </div>
            )}

            {/* Pattern Simulation */}
            {resolved.backgroundPattern === 'grid' && (
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(var(--cs-text)_1px,transparent_1px)] [background-size:16px_16px]" />
            )}
            {resolved.backgroundPattern === 'glow' && (
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ backgroundColor: resolved.accentColor }}
              />
            )}

            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10 mb-5">
              <span className="text-xs flex items-center gap-1 opacity-80" style={{ color: resolved.mutedTextColor }}>
                <span>←</span>
                <span>Back to All Projects</span>
              </span>
              <span
                className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${resolved.accentColor}20`,
                  color: resolved.accentTextColor
                }}
              >
                Case Study · 2026
              </span>
            </div>

            {/* Hero Title & Subtitle Preview */}
            <div className="flex flex-col gap-2 mb-6">
              <h2
                className="font-bold uppercase tracking-tight break-words text-2xl sm:text-3xl"
                style={{ color: resolved.headingColor }}
              >
                {projectTitle || 'PROJECT TITLE'}
              </h2>
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{ color: resolved.bodyTextColor }}
              >
                Sample case study narrative showcasing how custom heading and body colors render crisply together.
              </p>
              {/* Sample Metadata Row */}
              <div className="flex items-center gap-3 text-xs pt-2 flex-wrap">
                <span style={{ color: resolved.headingColor }} className="font-semibold">Role:</span>
                <span style={{ color: resolved.mutedTextColor }}>Product Designer</span>
                <span className="opacity-30">·</span>
                <span style={{ color: resolved.headingColor }} className="font-semibold">Duration:</span>
                <span style={{ color: resolved.mutedTextColor }}>3 Months</span>
              </div>
            </div>

            {/* Divider Preview */}
            <div
              className="w-full h-0.5 mb-6"
              style={{ backgroundColor: resolved.dividerColor }}
            />

            {/* Sample Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: resolved.headingColor }}>
                  01. The Problem
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: resolved.accentTextColor,
                    backgroundColor: `${resolved.accentColor}20`
                  }}
                >
                  01 / 12
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: resolved.bodyTextColor }}>
                Section introduction narrative explaining the customer workflow challenges.
              </p>

              {/* Sample Card */}
              <div
                className="p-4 border transition-all flex flex-col gap-1.5"
                style={{
                  backgroundColor: resolved.cardBackground,
                  borderColor: resolved.cardBorderColor,
                  borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                }}
              >
                <div className="text-xs font-semibold" style={{ color: resolved.cardTitleColor }}>
                  Audience needs a clear path
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: resolved.cardTextColor }}>
                  Primary actions are highlighted with consistent tokens and responsive bottom sheets.
                </div>
              </div>

              {/* Sample Nav Link & Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs cursor-pointer flex items-center gap-1" style={{ color: resolved.navTextColor }}>
                  <span>Jump to: 02. The Solution</span>
                  <span>→</span>
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{
                      backgroundColor: resolved.accentColor,
                      color: resolved.buttonTextColor,
                      borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                    }}
                  >
                    Primary Action
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs border transition-all"
                    style={{
                      borderColor: resolved.cardBorderColor,
                      color: resolved.headingColor,
                      borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                    }}
                  >
                    View Figma File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
