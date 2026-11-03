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
  MousePointerClick,
  Compass,
  Layers,
  Copy,
  ClipboardPaste,
  Pipette,
  Code,
  Smartphone,
  Monitor,
  Info,
  AppWindow
} from 'lucide-react';

export function sanitizeColorInput(raw: string, allowRgba = true): string | null {
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
  const sanitized = sanitizeColorInput(val, false);
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
  allowRgba = true,
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
        showFeedback('Invalid color');
      }
    } catch {
      showFeedback('Press Ctrl+V');
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
        {description && <span className="text-[10px] text-zinc-500 line-clamp-1">{description}</span>}
      </div>

      <div className="flex items-center gap-2">
        {/* Color picker trigger button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center cursor-pointer shadow-inner transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: safeHexForPicker }}
            title="Click to open visual color picker"
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
          title="Paste color from clipboard"
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

  // Sub-tabs for organized, zero-overwhelm editing
  const [editorSection, setEditorSection] = useState<'presets' | 'header' | 'text' | 'buttons' | 'navigation' | 'surfaces' | 'json'>('header');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(theme, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(theme, null, 2));
  }, [theme]);

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

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed !== 'object' || !parsed) {
        setJsonError('JSON must be a valid theme object');
        return;
      }
      setJsonError(null);
      onChange({
        ...parsed,
        preset: 'custom'
      });
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const renderHeaderTalkButtonControls = (contextLabel = "Site Header") => (
    <div className="sm:col-span-2 p-4 rounded-xl bg-zinc-950/80 border border-white/10 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-[#b8ff57] font-semibold tracking-wider flex items-center gap-1.5">
              <span>Header &ldquo;Let&apos;s Talk&rdquo; CTA Button</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
              {contextLabel}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Configure the top-right CTA button color specifically for this project (sharp rectangular button matching landing page).
          </p>
        </div>

        {/* Quick Style Presets for the Let's Talk button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              handleFieldChange('headerContactBtnBg', resolved.accentColor);
              handleFieldChange('headerContactBtnBorder', resolved.accentColor);
              handleFieldChange('headerContactBtnText', '#050505');
            }}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-mono text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Set button fill to current project accent color"
          >
            <Sparkles size={11} className="text-[#ff853a]" />
            <span>Match Accent</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleFieldChange('headerContactBtnBg', '#b8ff57');
              handleFieldChange('headerContactBtnBorder', '#b8ff57');
              handleFieldChange('headerContactBtnText', '#050505');
            }}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-mono text-[#b8ff57] transition-colors cursor-pointer"
            title="Reset to default neon lime"
          >
            Neon Lime
          </button>
          <button
            type="button"
            onClick={() => {
              handleFieldChange('headerContactBtnBg', '#18181b');
              handleFieldChange('headerContactBtnBorder', resolved.accentColor);
              handleFieldChange('headerContactBtnText', resolved.accentColor);
            }}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
            title="Dark surface with accent outline and text"
          >
            Dark Outline
          </button>
          <button
            type="button"
            onClick={() => {
              handleFieldChange('headerContactBtnBg', '#ffffff');
              handleFieldChange('headerContactBtnBorder', '#ffffff');
              handleFieldChange('headerContactBtnText', '#000000');
            }}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-mono text-white transition-colors cursor-pointer"
            title="Monochrome pure white button"
          >
            Pure White
          </button>
        </div>
      </div>

      {/* Button Color Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ColorHexField
          label="Button Fill (Background)"
          description="Fill color of 'Let's Talk' header CTA"
          value={resolved.headerContactBtnBg}
          fallbackHex="#b8ff57"
          placeholder="#b8ff57 or #8be28b"
          allowRgba={true}
          swatches={[
            { name: 'Neon Lime', hex: '#b8ff57' },
            { name: 'Mint Accent', hex: '#8be28b' },
            { name: 'Warm Amber', hex: '#ff853a' },
            { name: 'Indigo Accent', hex: '#6366f1' },
            { name: 'Pure White', hex: '#ffffff' },
            { name: 'Dark Surface', hex: '#18181b' },
            { name: 'Transparent', hex: 'transparent' }
          ]}
          onChange={(val) => handleFieldChange('headerContactBtnBg', val)}
        />
        <ColorHexField
          label="Button Text & Arrow Color"
          description="Label text & icon color inside button"
          value={resolved.headerContactBtnText}
          fallbackHex="#050505"
          placeholder="#050505 or #ffffff"
          allowRgba={true}
          swatches={[
            { name: 'Pitch Dark', hex: '#050505' },
            { name: 'Pure Black', hex: '#000000' },
            { name: 'Pure White', hex: '#ffffff' },
            { name: 'Neon Lime', hex: '#b8ff57' },
            { name: 'Mint Accent', hex: '#8be28b' },
            { name: 'Warm Amber', hex: '#ff853a' }
          ]}
          onChange={(val) => handleFieldChange('headerContactBtnText', val)}
        />
        <ColorHexField
          label="Button Border Stroke"
          description="Stroke outline of the header button"
          value={resolved.headerContactBtnBorder}
          fallbackHex="#b8ff57"
          placeholder="#b8ff57 or transparent"
          allowRgba={true}
          swatches={[
            { name: 'Neon Lime', hex: '#b8ff57' },
            { name: 'Match Accent', hex: resolved.accentColor },
            { name: 'Subtle White', hex: 'rgba(255, 255, 255, 0.20)' },
            { name: 'Solid White', hex: '#ffffff' },
            { name: 'Transparent', hex: 'transparent' }
          ]}
          onChange={(val) => handleFieldChange('headerContactBtnBorder', val)}
        />
      </div>

      {/* Live Preview Strip for this specific button */}
      <div className="p-3 rounded-lg bg-black/60 border border-white/10 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono font-medium text-zinc-300">
            Real-Time Button Result:
          </span>
          <span className="text-[10px] text-zinc-500">
            Rendered with sharp 0px radius matching landing page header CTA
          </span>
        </div>

        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.055em] transition-all select-none shadow-sm"
          style={{
            backgroundColor: resolved.headerContactBtnBg,
            color: resolved.headerContactBtnText,
            borderColor: resolved.headerContactBtnBorder,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '0px'
          }}
        >
          <span>LET&apos;S TALK</span>
          <span className="material-symbols-rounded" style={{ fontSize: '13px', lineHeight: 1, color: 'inherit' }}>
            arrow_outward
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6 text-white">
      {/* Top Header Banner with Action Buttons */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
            style={{ backgroundColor: resolved.cardBackground, color: resolved.accentColor }}
          >
            <Palette size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-bold text-base tracking-tight">Project Detail Page Styling Studio</h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border"
                style={{
                  backgroundColor: `${resolved.accentColor}20`,
                  color: resolved.accentColor,
                  borderColor: `${resolved.accentColor}50`
                }}
              >
                {currentPreset === 'custom' ? 'Custom Studio' : THEME_PRESETS.find((p) => p.id === currentPreset)?.name}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              Full control over site header, text colors, button states, navigation outline, card surfaces, and dividers for &ldquo;{projectTitle}&rdquo;.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          {onOpenLivePreview && (
            <button
              type="button"
              onClick={onOpenLivePreview}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 active:scale-95"
            >
              <Eye size={14} />
              <span>Full Page Preview</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 active:scale-95"
            title="Reset to default theme values"
          >
            <RefreshCw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs to easily jump between styling layers */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-950/80 border border-white/10 overflow-x-auto scrollbar-none">
        {[
          { id: 'header', label: 'Site Header Theme', icon: AppWindow, count: '8 Styles' },
          { id: 'text', label: 'All Text Colors', icon: Type, count: '12 Colors' },
          { id: 'buttons', label: 'Buttons & CTAs', icon: MousePointerClick, count: '6 Styles' },
          { id: 'navigation', label: 'Nav & Badges', icon: Compass, count: '7 Elements' },
          { id: 'surfaces', label: 'Surfaces & Layout', icon: Layers, count: 'Colors & Radius' },
          { id: 'presets', label: 'Theme Presets', icon: Sparkles, count: THEME_PRESETS.length },
          { id: 'json', label: 'Theme JSON', icon: Code, count: 'Import/Export' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = editorSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setEditorSection(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#ff853a]' : 'text-zinc-500'} />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.2 rounded bg-zinc-900 border border-white/5">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Grid: Controls on Left, Real-Time Dynamic Simulation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* TAB: SITE HEADER THEME */}
          {editorSection === 'header' && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AppWindow size={16} className="text-[#ff853a]" />
                    <span>Customize Site Header for this Project</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Customize the top sticky site navigation header specifically when viewing &ldquo;{projectTitle}&rdquo;.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
                  Header Bar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Header Background */}
                <ColorHexField
                  label="Header Background Fill"
                  description="Top header bar background color"
                  value={resolved.headerBg}
                  fallbackHex="rgba(8, 8, 8, 0.85)"
                  placeholder="rgba(8, 8, 8, 0.85) or #000000"
                  allowRgba={true}
                  swatches={[
                    { name: 'Dark Frosted', hex: 'rgba(8, 8, 8, 0.85)' },
                    { name: 'Pitch Black', hex: '#000000' },
                    { name: 'Zinc 950', hex: '#09090b' },
                    { name: 'Warm Charcoal', hex: '#0e0c0a' },
                    { name: 'Transparent', hex: 'transparent' }
                  ]}
                  onChange={(val) => handleFieldChange('headerBg', val)}
                />

                {/* Header Border Color */}
                <ColorHexField
                  label="Header Bottom Border"
                  description="Bottom separator border of the header"
                  value={resolved.headerBorderColor}
                  fallbackHex="rgba(255, 255, 255, 0.08)"
                  placeholder="rgba(255, 255, 255, 0.08)"
                  allowRgba={true}
                  swatches={[
                    { name: 'Subtle Line', hex: 'rgba(255, 255, 255, 0.08)' },
                    { name: 'Subtle Accent', hex: `${resolved.accentColor}35` },
                    { name: 'Transparent', hex: 'transparent' }
                  ]}
                  onChange={(val) => handleFieldChange('headerBorderColor', val)}
                />

                {/* Navigation Links Text */}
                <ColorHexField
                  label="Nav Links Text Color"
                  description="Color of Home, Work, About, Resume links"
                  value={resolved.headerNavTextColor}
                  fallbackHex="rgba(245, 245, 240, 0.65)"
                  placeholder="rgba(245, 245, 240, 0.65) or #a1a1aa"
                  allowRgba={true}
                  swatches={[
                    { name: 'Muted White', hex: 'rgba(245, 245, 240, 0.65)' },
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Zinc 400', hex: '#a1a1aa' }
                  ]}
                  onChange={(val) => handleFieldChange('headerNavTextColor', val)}
                />

                {/* Active Navigation Link Highlight */}
                <ColorHexField
                  label="Active Nav Link Highlight"
                  description="Color of currently active page/link in header"
                  value={resolved.headerNavActiveColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('headerNavActiveColor', val)}
                />

                {/* Availability Badge Text */}
                <ColorHexField
                  label="Availability Badge Text"
                  description="Availability status label in header actions"
                  value={resolved.headerAvailabilityText}
                  fallbackHex="rgba(245, 245, 240, 0.65)"
                  placeholder="rgba(245, 245, 240, 0.65)"
                  allowRgba={true}
                  swatches={[
                    { name: 'Muted White', hex: 'rgba(245, 245, 240, 0.65)' },
                    { name: 'Mint Accent', hex: '#8be28b' },
                    { name: 'Pure White', hex: '#ffffff' }
                  ]}
                  onChange={(val) => handleFieldChange('headerAvailabilityText', val)}
                />

                {/* Availability Badge Background */}
                <ColorHexField
                  label="Availability Badge Background"
                  description="Background container for availability text"
                  value={resolved.headerAvailabilityBg}
                  fallbackHex="transparent"
                  placeholder="transparent or rgba(255,255,255,0.05)"
                  allowRgba={true}
                  swatches={[
                    { name: 'Transparent', hex: 'transparent' },
                    { name: 'Subtle Surface', hex: 'rgba(255, 255, 255, 0.05)' },
                    { name: 'Dark Zinc', hex: '#18181b' }
                  ]}
                  onChange={(val) => handleFieldChange('headerAvailabilityBg', val)}
                />

                {/* Dedicated Header Let's Talk CTA Button Controls */}
                {renderHeaderTalkButtonControls("Header Tab")}
              </div>
            </div>
          )}

          {/* TAB 1: PRESET PALETTES */}
          {editorSection === 'presets' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex items-start gap-2.5">
                <Info size={16} className="text-[#ff853a] shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Click any curated theme preset below to apply an expertly harmonized color palette. You can immediately fine-tune any individual text or button color after selecting a preset.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = currentPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 cursor-pointer group ${
                        isSelected
                          ? 'border-white/40 ring-2 ring-white/20 shadow-lg'
                          : 'border-white/10 hover:border-white/25 hover:translate-y-[-2px]'
                      }`}
                      style={{ backgroundColor: preset.theme.cardBackground }}
                    >
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: preset.theme.backgroundColor }}
                            title="Canvas Background"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: preset.theme.cardBackground }}
                            title="Card Surface"
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
                            className="w-5 h-5 rounded-full flex items-center justify-center text-black shadow-xs"
                            style={{ backgroundColor: preset.theme.accentColor }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm" style={{ color: preset.theme.textColor }}>
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
          )}

          {/* TAB 2: ALL TEXT COLORS */}
          {editorSection === 'text' && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Type size={16} className="text-[#ff853a]" />
                    <span>Every Text Color Layer</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Customize titles, narrative copy, metadata labels, card content, and quotes individually.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
                  Typography Colors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hero Title (H1) */}
                <ColorHexField
                  label="Hero Project Title (H1)"
                  description="Top main project title"
                  value={resolved.heroTitleColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Soft Cream', hex: '#fefce8' },
                    { name: 'Mint Accent', hex: '#8be28b' },
                    { name: 'Warm Amber', hex: '#ff853a' },
                    { name: 'Pitch Dark', hex: '#09090b' }
                  ]}
                  onChange={(val) => handleFieldChange('heroTitleColor', val)}
                />

                {/* Hero Subtitle */}
                <ColorHexField
                  label="Hero Subtitle & Lead"
                  description="Right-hand narrative lead in hero header"
                  value={resolved.heroSubtitleColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Zinc 200', hex: '#e4e4e7' },
                    { name: 'Slate 300', hex: '#cbd5e1' },
                    { name: 'Muted Zinc', hex: '#a1a1aa' }
                  ]}
                  onChange={(val) => handleFieldChange('heroSubtitleColor', val)}
                />

                {/* Section Headings */}
                <ColorHexField
                  label="Section Chapter Headings"
                  description="01. The Problem, Key Decisions, Solution, etc."
                  value={resolved.sectionHeadingColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Mint Hue', hex: '#8be28b' },
                    { name: 'Electric Rose', hex: '#f43f5e' },
                    { name: 'Tangerine', hex: '#ff853a' }
                  ]}
                  onChange={(val) => handleFieldChange('sectionHeadingColor', val)}
                />

                {/* Body Paragraphs */}
                <ColorHexField
                  label="Body Paragraphs & Intros"
                  description="Narrative paragraphs and overview intro text"
                  value={resolved.bodyTextColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Zinc 200', hex: '#e4e4e7' },
                    { name: 'Slate 300', hex: '#cbd5e1' },
                    { name: 'Stone 300', hex: '#d6d3d1' }
                  ]}
                  onChange={(val) => handleFieldChange('bodyTextColor', val)}
                />

                {/* Metadata Column Labels */}
                <ColorHexField
                  label="Metadata Column Labels"
                  description="Left column headings: 'My Role', 'Duration', 'Deliverables'"
                  value={resolved.metadataLabelColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Mint Accent', hex: '#8be28b' },
                    { name: 'Warm Amber', hex: '#ff853a' },
                    { name: 'Zinc 300', hex: '#d4d4d8' }
                  ]}
                  onChange={(val) => handleFieldChange('metadataLabelColor', val)}
                />

                {/* Metadata Column Values */}
                <ColorHexField
                  label="Metadata Detail Values"
                  description="Right column content: 'Product Designer', '3 Months'"
                  value={resolved.metadataValueColor}
                  fallbackHex="#a1a1aa"
                  placeholder="#a1a1aa"
                  swatches={[
                    { name: 'Zinc 400', hex: '#a1a1aa' },
                    { name: 'Slate 400', hex: '#94a3b8' },
                    { name: 'Stone 400', hex: '#a8a29e' },
                    { name: 'Zinc 300', hex: '#d4d4d8' }
                  ]}
                  onChange={(val) => handleFieldChange('metadataValueColor', val)}
                />

                {/* Card Titles */}
                <ColorHexField
                  label="Card Titles & Headers"
                  description="Titles inside decision cards, comparison headers, card grids"
                  value={resolved.cardTitleColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Mint Accent', hex: '#8be28b' },
                    { name: 'Soft Cream', hex: '#fefce8' },
                    { name: 'Tangerine', hex: '#ff853a' }
                  ]}
                  onChange={(val) => handleFieldChange('cardTitleColor', val)}
                />

                {/* Card Text & Learnings */}
                <ColorHexField
                  label="Card Content & Learnings"
                  description="Descriptions, bullet lists, constraints inside cards"
                  value={resolved.cardTextColor}
                  fallbackHex="#a1a1aa"
                  placeholder="#a1a1aa"
                  swatches={[
                    { name: 'Zinc 400', hex: '#a1a1aa' },
                    { name: 'Zinc 300', hex: '#d4d4d8' },
                    { name: 'Slate 300', hex: '#cbd5e1' },
                    { name: 'White', hex: '#ffffff' }
                  ]}
                  onChange={(val) => handleFieldChange('cardTextColor', val)}
                />

                {/* Bullet List Text */}
                <ColorHexField
                  label="Bullet List Text"
                  description="Text inside bullet list sections and constraint lists"
                  value={resolved.bulletTextColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Zinc 200', hex: '#e4e4e7' },
                    { name: 'Slate 300', hex: '#cbd5e1' }
                  ]}
                  onChange={(val) => handleFieldChange('bulletTextColor', val)}
                />

                {/* Blockquote Text */}
                <ColorHexField
                  label="Blockquote Text"
                  description="Quote content text inside quote blocks"
                  value={resolved.quoteTextColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Soft Cream', hex: '#fefce8' },
                    { name: 'Zinc 200', hex: '#e4e4e7' }
                  ]}
                  onChange={(val) => handleFieldChange('quoteTextColor', val)}
                />

                {/* Blockquote Author */}
                <ColorHexField
                  label="Blockquote Author & Role"
                  description="Author citation line under blockquotes"
                  value={resolved.quoteAuthorColor}
                  fallbackHex="#a1a1aa"
                  placeholder="#a1a1aa"
                  swatches={[
                    { name: 'Zinc 400', hex: '#a1a1aa' },
                    { name: 'Slate 400', hex: '#94a3b8' },
                    { name: 'Stone 400', hex: '#a8a29e' }
                  ]}
                  onChange={(val) => handleFieldChange('quoteAuthorColor', val)}
                />

                {/* Master Fallback Text */}
                <ColorHexField
                  label="Master Fallback Text"
                  description="Default fallback text color across unspecified areas"
                  value={resolved.textColor}
                  fallbackHex="#ffffff"
                  placeholder="#ffffff"
                  swatches={[
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Off-White', hex: '#fafaf9' },
                    { name: 'Dark Slate', hex: '#0f172a' }
                  ]}
                  onChange={(val) => handleFieldChange('textColor', val)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: BUTTONS & CTAS */}
          {editorSection === 'buttons' && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MousePointerClick size={16} className="text-[#ff853a]" />
                    <span>Buttons &amp; Interactive CTAs</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Configure backgrounds, text colors, and borders for primary actions, secondary buttons, and footer links.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
                  Button Elements
                </span>
              </div>

              {/* Dedicated Header Let's Talk CTA Button Controls */}
              {renderHeaderTalkButtonControls("Buttons Tab")}

              {/* Primary Button Group */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/10 flex flex-col gap-3">
                <span className="text-xs font-mono uppercase text-[#ff853a] font-semibold tracking-wider">
                  Primary Button (e.g. &ldquo;Live Project&rdquo; CTA)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ColorHexField
                    label="Background Color"
                    description="Primary button fill"
                    value={resolved.primaryButtonBg}
                    fallbackHex="#8be28b"
                    placeholder="#8be28b"
                    swatches={QUICK_ACCENT_COLORS}
                    onChange={(val) => handleFieldChange('primaryButtonBg', val)}
                  />
                  <ColorHexField
                    label="Text Color"
                    description="Primary button label"
                    value={resolved.primaryButtonText}
                    fallbackHex="#000000"
                    placeholder="#000000"
                    swatches={[
                      { name: 'Black', hex: '#000000' },
                      { name: 'White', hex: '#ffffff' },
                      { name: 'Dark Slate', hex: '#09090b' }
                    ]}
                    onChange={(val) => handleFieldChange('primaryButtonText', val)}
                  />
                  <ColorHexField
                    label="Border Color"
                    description="Stroke outline"
                    value={resolved.primaryButtonBorder}
                    fallbackHex="transparent"
                    placeholder="transparent or #ffffff"
                    swatches={[
                      { name: 'None', hex: 'transparent' },
                      { name: 'Subtle White', hex: 'rgba(255,255,255,0.2)' },
                      { name: 'Accent Stroke', hex: resolved.accentColor }
                    ]}
                    onChange={(val) => handleFieldChange('primaryButtonBorder', val)}
                  />
                </div>
              </div>

              {/* Secondary / Outline Button Group */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/10 flex flex-col gap-3">
                <span className="text-xs font-mono uppercase text-zinc-300 font-semibold tracking-wider">
                  Secondary Button (e.g. &ldquo;View Figma File&rdquo; outline)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ColorHexField
                    label="Background Color"
                    description="Secondary button fill"
                    value={resolved.secondaryButtonBg}
                    fallbackHex="transparent"
                    placeholder="transparent or #18181b"
                    swatches={[
                      { name: 'Transparent', hex: 'transparent' },
                      { name: 'Dark Surface', hex: '#18181b' },
                      { name: 'Subtle Accent', hex: `${resolved.accentColor}15` }
                    ]}
                    onChange={(val) => handleFieldChange('secondaryButtonBg', val)}
                  />
                  <ColorHexField
                    label="Text Color"
                    description="Secondary button label"
                    value={resolved.secondaryButtonText}
                    fallbackHex="#ffffff"
                    placeholder="#ffffff"
                    swatches={[
                      { name: 'White', hex: '#ffffff' },
                      { name: 'Mint Accent', hex: '#8be28b' },
                      { name: 'Warm Amber', hex: '#ff853a' }
                    ]}
                    onChange={(val) => handleFieldChange('secondaryButtonText', val)}
                  />
                  <ColorHexField
                    label="Border Color"
                    description="Stroke border"
                    value={resolved.secondaryButtonBorder}
                    fallbackHex="rgba(255, 255, 255, 0.40)"
                    placeholder="rgba(255, 255, 255, 0.40)"
                    swatches={[
                      { name: 'White 40%', hex: 'rgba(255, 255, 255, 0.40)' },
                      { name: 'Solid White', hex: '#ffffff' },
                      { name: 'Accent Line', hex: resolved.accentColor }
                    ]}
                    onChange={(val) => handleFieldChange('secondaryButtonBorder', val)}
                  />
                </div>
              </div>

              {/* Back to Projects & Next Project Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorHexField
                  label="Back to Projects Nav Link"
                  description="Top &amp; bottom back button text and arrow"
                  value={resolved.backButtonTextColor}
                  fallbackHex="#a1a1aa"
                  placeholder="#a1a1aa"
                  swatches={[
                    { name: 'Zinc 400', hex: '#a1a1aa' },
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Mint Accent', hex: '#8be28b' }
                  ]}
                  onChange={(val) => handleFieldChange('backButtonTextColor', val)}
                />

                <ColorHexField
                  label="Next Project Action &amp; Arrow"
                  description="Bottom next project teaser label ('View Next Project →')"
                  value={resolved.nextProjectAccentColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('nextProjectAccentColor', val)}
                />

                <ColorHexField
                  label="Next Project Title Text"
                  description="Title of next project in footer teaser"
                  value={resolved.nextProjectTextColor}
                  fallbackHex="#a1a1aa"
                  placeholder="#a1a1aa"
                  swatches={[
                    { name: 'Zinc 400', hex: '#a1a1aa' },
                    { name: 'Zinc 300', hex: '#d4d4d8' },
                    { name: 'Pure White', hex: '#ffffff' }
                  ]}
                  onChange={(val) => handleFieldChange('nextProjectTextColor', val)}
                />

                <ColorHexField
                  label="Next Project Card Background"
                  description="Surface fill of the footer next project teaser"
                  value={resolved.nextProjectCardBg}
                  fallbackHex="rgba(139, 226, 139, 0.06)"
                  placeholder="rgba(139, 226, 139, 0.06)"
                  swatches={[
                    { name: 'Subtle Mint', hex: 'rgba(139, 226, 139, 0.06)' },
                    { name: 'Dark Surface', hex: '#18181b' },
                    { name: 'Subtle White', hex: 'rgba(255, 255, 255, 0.05)' }
                  ]}
                  onChange={(val) => handleFieldChange('nextProjectCardBg', val)}
                />
              </div>
            </div>
          )}

          {/* TAB 4: NAVIGATION, BADGES & NUMBERS */}
          {editorSection === 'navigation' && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Compass size={16} className="text-[#ff853a]" />
                    <span>Navigation Outline &amp; Badges</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Customize the sticky Table of Contents outline, chapter badges, and metadata tags.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
                  Navigation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nav Inactive Links */}
                <ColorHexField
                  label="Table of Contents Links (Inactive)"
                  description="Inactive chapter link text in left sticky outline"
                  value={resolved.navTextColor}
                  fallbackHex="#a1a1aa"
                  placeholder="#a1a1aa"
                  swatches={[
                    { name: 'Zinc 400', hex: '#a1a1aa' },
                    { name: 'Zinc 500', hex: '#71717a' },
                    { name: 'Slate 400', hex: '#94a3b8' }
                  ]}
                  onChange={(val) => handleFieldChange('navTextColor', val)}
                />

                {/* Nav Active Link */}
                <ColorHexField
                  label="Table of Contents Link (Active)"
                  description="Currently read chapter highlighted text"
                  value={resolved.navActiveTextColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('navActiveTextColor', val)}
                />

                {/* Nav Active Indicator Bar */}
                <ColorHexField
                  label="Active Nav Indicator Underline"
                  description="Animated underline bar under active chapter link"
                  value={resolved.navActiveIndicatorColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('navActiveIndicatorColor', val)}
                />

                {/* Chapter Number Indicator Text */}
                <ColorHexField
                  label="Chapter Number (01, 02) Text"
                  description="Numeric indicator beside section title (e.g. 01, 02)"
                  value={resolved.chapterNumberColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('chapterNumberColor', val)}
                />

                {/* Chapter Number Indicator Background */}
                <ColorHexField
                  label="Chapter Number Badge Background"
                  description="Small background pill behind 01 / 02 index"
                  value={resolved.chapterNumberBg}
                  fallbackHex="#000000"
                  placeholder="#000000"
                  swatches={[
                    { name: 'Pitch Black', hex: '#000000' },
                    { name: 'Zinc 900', hex: '#18181b' },
                    { name: 'Subtle Accent', hex: `${resolved.accentColor}25` }
                  ]}
                  onChange={(val) => handleFieldChange('chapterNumberBg', val)}
                />

                {/* Top Case Study Badge Text */}
                <ColorHexField
                  label="Top Badge Text (e.g. 'Case Study · 2026')"
                  description="Text in top hero right corner pill"
                  value={resolved.badgeTextColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('badgeTextColor', val)}
                />

                {/* Top Case Study Badge Background */}
                <ColorHexField
                  label="Top Badge Background Pill"
                  description="Background of top right case study badge"
                  value={resolved.badgeBgColor}
                  fallbackHex="rgba(139, 226, 139, 0.12)"
                  placeholder="rgba(139, 226, 139, 0.12)"
                  swatches={[
                    { name: 'Subtle Mint', hex: 'rgba(139, 226, 139, 0.12)' },
                    { name: 'Subtle Amber', hex: 'rgba(255, 133, 58, 0.12)' },
                    { name: 'Transparent', hex: 'transparent' }
                  ]}
                  onChange={(val) => handleFieldChange('badgeBgColor', val)}
                />

                {/* Top Case Study Badge Border */}
                <ColorHexField
                  label="Top Badge Border Stroke"
                  description="Stroke around the top right case study badge"
                  value={resolved.badgeBorderColor}
                  fallbackHex="rgba(139, 226, 139, 0.35)"
                  placeholder="rgba(139, 226, 139, 0.35)"
                  swatches={[
                    { name: 'Subtle Mint', hex: 'rgba(139, 226, 139, 0.35)' },
                    { name: 'Subtle Amber', hex: 'rgba(255, 133, 58, 0.35)' },
                    { name: 'Transparent', hex: 'transparent' }
                  ]}
                  onChange={(val) => handleFieldChange('badgeBorderColor', val)}
                />
              </div>
            </div>
          )}

          {/* TAB 5: SURFACES, CARDS & LAYOUT */}
          {editorSection === 'surfaces' && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-[#ff853a]" />
                    <span>Surfaces, Dividers &amp; Accents</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Configure page canvas background, card surfaces, border strokes, and divider lines.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
                  Surfaces &amp; Lines
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Page Background */}
                <ColorHexField
                  label="Page Canvas Background"
                  description="Root background of case study view"
                  value={resolved.backgroundColor}
                  fallbackHex="#000000"
                  placeholder="#000000"
                  swatches={QUICK_BG_COLORS}
                  onChange={(val) => handleFieldChange('backgroundColor', val)}
                />

                {/* Card Surface Background */}
                <ColorHexField
                  label="Card Surface Background"
                  description="Cards, decision items, and comparison blocks"
                  value={resolved.cardBackground}
                  fallbackHex="#18181b"
                  placeholder="#18181b"
                  swatches={[
                    { name: 'Zinc 900', hex: '#18181b' },
                    { name: 'Slate 900', hex: '#0f172a' },
                    { name: 'Stone 900', hex: '#1c1917' },
                    { name: 'Pitch Black', hex: '#09090b' },
                    { name: 'Pure White', hex: '#ffffff' }
                  ]}
                  onChange={(val) => handleFieldChange('cardBackground', val)}
                />

                {/* Card Border Color */}
                <ColorHexField
                  label="Card Border Stroke"
                  description="Stroke outline of cards and blocks"
                  value={resolved.cardBorderColor}
                  fallbackHex="rgba(255, 255, 255, 0.08)"
                  placeholder="rgba(255, 255, 255, 0.08)"
                  swatches={[
                    { name: 'Subtle White (8%)', hex: 'rgba(255, 255, 255, 0.08)' },
                    { name: 'Zinc 800', hex: '#27272a' },
                    { name: 'Zinc 700', hex: '#3f3f46' },
                    { name: 'Accent Glow', hex: `${resolved.accentColor}30` }
                  ]}
                  onChange={(val) => handleFieldChange('cardBorderColor', val)}
                />

                {/* Section Divider Line Color */}
                <ColorHexField
                  label="Section Divider Line Color"
                  description="Separator line strokes under each chapter and hero"
                  value={resolved.dividerColor}
                  fallbackHex="rgba(255, 255, 255, 0.20)"
                  placeholder="rgba(255, 255, 255, 0.20)"
                  swatches={[
                    { name: 'Subtle White (20%)', hex: 'rgba(255, 255, 255, 0.20)' },
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Subtle Accent', hex: `${resolved.accentColor}55` }
                  ]}
                  onChange={(val) => handleFieldChange('dividerColor', val)}
                />

                {/* Bullet Dot & Decorator Accent */}
                <ColorHexField
                  label="Bullet Dot &amp; Decorator Accent"
                  description="Bullet points, quote left border, and key indicators"
                  value={resolved.bulletDotColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => {
                    handleFieldChange('bulletDotColor', val);
                    handleFieldChange('quoteBorderColor', val);
                  }}
                />

                {/* Scroll Progress Bar Color */}
                <ColorHexField
                  label="Scroll Reading Progress Bar Color"
                  description="Top animated reading scroll progress indicator"
                  value={resolved.progressBarColor}
                  fallbackHex="#8be28b"
                  placeholder="#8be28b"
                  swatches={QUICK_ACCENT_COLORS}
                  onChange={(val) => handleFieldChange('progressBarColor', val)}
                />
              </div>

              {/* Typography & Proportions Section */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  Typography, Radius &amp; Atmosphere
                </span>

                {/* Font Family */}
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-2">Font Family</label>
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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

                {/* Title Size Scale */}
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-2">Hero Title Scale</label>
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          resolved.titleSize === scale.id
                            ? 'bg-zinc-800 border-[#ff853a] text-white shadow-xs'
                            : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <div className="text-xs font-medium">{scale.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{scale.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Title Layout (Stacked vs Split) */}
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-2">Hero Title Layout</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        id: 'stacked',
                        label: 'Stacked (Desktop & Mobile Same)',
                        detail: 'Title on top, subtitle below — consistent full-width flow across all viewports'
                      },
                      {
                        id: 'split',
                        label: 'Split Columns (Desktop Row)',
                        detail: 'Title on the left, subtitle aligned to bottom right on desktop'
                      }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleFieldChange('heroLayout', item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          resolved.heroLayout === item.id
                            ? 'bg-zinc-800 border-[#ff853a] text-white shadow-xs'
                            : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <div className="text-xs font-medium flex items-center justify-between">
                          <span>{item.label}</span>
                          {resolved.heroLayout === item.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff853a]" />
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1 leading-normal">{item.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Corner Radius */}
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-2">Card Corner Radius</label>
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          resolved.cardRadius === r.id
                            ? 'bg-zinc-800 border-[#ff853a] text-white shadow-xs'
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

                {/* Pattern & Progress Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-2">
                      Background Atmospheric Pattern
                    </label>
                    <select
                      value={resolved.backgroundPattern}
                      onChange={(e) => handleFieldChange('backgroundPattern', e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs outline-none focus:border-[#ff853a]"
                    >
                      <option value="none">Clean Solid (No Pattern — Clean Frame)</option>
                      <option value="dots">Subtle Dot Matrix</option>
                      <option value="glow">Ambient Accent Glow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-2">
                      Reading Scroll Indicator
                    </label>
                    <div className="flex items-center gap-3 h-10">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          checked={resolved.showProgressBar}
                          onChange={(e) => handleFieldChange('showProgressBar', e.target.checked)}
                          className="rounded bg-zinc-950 border-white/20 text-[#ff853a] focus:ring-0"
                        />
                        <span>Enable top reading scroll bar</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: THEME JSON IMPORT/EXPORT */}
          {editorSection === 'json' && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code size={16} className="text-[#ff853a]" />
                    <span>Theme JSON Code</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Export your custom design theme or paste an existing JSON config to load it immediately.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(jsonText);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Copy JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyJson}
                    className="px-3 py-1.5 rounded-lg bg-[#ff853a] hover:bg-[#ff9554] text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Apply JSON</span>
                  </button>
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono">
                  {jsonError}
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setJsonError(null);
                }}
                rows={16}
                className="w-full p-3.5 rounded-xl bg-zinc-950 border border-white/10 text-emerald-400 font-mono text-xs outline-none focus:border-[#ff853a] focus:ring-1 focus:ring-[#ff853a]/30 resize-y"
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE THEME SIMULATOR (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Eye size={13} className="text-[#ff853a]" />
              <span>Real-Time Theme Simulation</span>
            </span>
            {/* Viewport switch */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'} transition-colors cursor-pointer`}
                title="Desktop View"
              >
                <Monitor size={13} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'} transition-colors cursor-pointer`}
                title="Mobile View"
              >
                <Smartphone size={13} />
              </button>
            </div>
          </div>

          {/* Interactive Simulation Frame */}
          <div
            className={`w-full rounded-2xl border shadow-2xl transition-all relative overflow-hidden flex flex-col ${
              previewDevice === 'mobile' ? 'max-w-[340px] mx-auto' : ''
            }`}
            style={{
              backgroundColor: resolved.backgroundColor,
              color: resolved.bodyTextColor,
              borderColor: resolved.cardBorderColor,
              fontFamily: FONT_MAP[resolved.fontFamily]
            }}
          >
            {/* Top Reading Progress Bar Simulation */}
            {resolved.showProgressBar && (
              <div className="w-full h-[3px] bg-white/5 relative shrink-0">
                <div
                  className="h-full w-3/5"
                  style={{
                    backgroundColor: resolved.progressBarColor,
                    boxShadow: `0 0 10px ${resolved.progressBarColor}80`
                  }}
                />
              </div>
            )}

            {/* TOP SITE HEADER SIMULATION (shows real header customization) */}
            <div
              className="w-full px-4 py-3 flex items-center justify-between border-b transition-colors relative z-20 backdrop-blur-md"
              style={{
                backgroundColor: resolved.headerBg,
                borderColor: resolved.headerBorderColor
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold" style={{ color: resolved.headerNavActiveColor }}>
                  YC
                </span>
                <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-wider">
                  <span style={{ color: resolved.headerNavActiveColor }} className="font-semibold">Home</span>
                  <span style={{ color: resolved.headerNavTextColor }}>Work</span>
                  <span style={{ color: resolved.headerNavTextColor }}>About</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    color: resolved.headerAvailabilityText,
                    backgroundColor: resolved.headerAvailabilityBg !== 'transparent' ? resolved.headerAvailabilityBg : `${resolved.headerBorderColor}`,
                    borderColor: resolved.headerBorderColor
                  }}
                >
                  Available
                </span>
                <span
                  className="text-[9px] font-mono font-medium uppercase px-2.5 py-1 tracking-[0.055em] flex items-center gap-1 transition-all"
                  style={{
                    backgroundColor: resolved.headerContactBtnBg,
                    color: resolved.headerContactBtnText,
                    borderColor: resolved.headerContactBtnBorder,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '0px'
                  }}
                >
                  <span>LET&apos;S TALK</span>
                  <span className="material-symbols-rounded" style={{ fontSize: '11px', lineHeight: 1, color: 'inherit' }}>
                    arrow_outward
                  </span>
                </span>
              </div>
            </div>

            {/* Atmospheric Background Pattern Simulation */}
            {resolved.backgroundPattern === 'dots' && (
              <div
                className="absolute inset-0 opacity-15 pointer-events-none select-none"
                style={{
                  backgroundImage: `radial-gradient(${resolved.accentColor} 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
            )}
            {resolved.backgroundPattern === 'glow' && (
              <div
                className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ backgroundColor: resolved.accentColor }}
              />
            )}

            {/* Inner Content Area */}
            <div className="p-5 flex flex-col gap-4 relative z-10 max-h-[720px] overflow-y-auto">
              {/* Back Bar & Tag Badge */}
              <div
                className="flex items-center justify-between gap-2 pb-3 border-b"
                style={{ borderColor: resolved.dividerColor }}
              >
                <span
                  className="text-xs flex items-center gap-1 cursor-pointer font-medium hover:opacity-80 transition-opacity"
                  style={{ color: resolved.backButtonTextColor }}
                >
                  <span>←</span>
                  <span>Back to All Projects</span>
                </span>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded border"
                  style={{
                    color: resolved.badgeTextColor,
                    backgroundColor: resolved.badgeBgColor,
                    borderColor: resolved.badgeBorderColor
                  }}
                >
                  Case Study · 2026
                </span>
              </div>

              {/* Hero Title & Subtitle */}
              {resolved.heroLayout === 'split' ? (
                <div className="flex items-end justify-between gap-3">
                  <h2
                    className="font-bold uppercase tracking-tight break-words text-lg sm:text-xl flex-1"
                    style={{ color: resolved.heroTitleColor }}
                  >
                    {projectTitle || 'PROJECT TITLE'}
                  </h2>
                  <p className="text-[11px] leading-relaxed max-w-[170px] text-right" style={{ color: resolved.heroSubtitleColor }}>
                    Strategic design system & workflow.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <h2
                    className="font-bold uppercase tracking-tight break-words text-xl sm:text-2xl"
                    style={{ color: resolved.heroTitleColor }}
                  >
                    {projectTitle || 'PROJECT TITLE'}
                  </h2>
                  <p className="text-xs leading-relaxed" style={{ color: resolved.heroSubtitleColor }}>
                    Strategic design system and end-to-end user workflow architecture.
                  </p>
                </div>
              )}

              {/* Metadata Spec Table */}
              <div className="p-3 rounded-lg flex flex-col gap-2" style={{ backgroundColor: `${resolved.cardBackground}80` }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium" style={{ color: resolved.metadataLabelColor }}>Role:</span>
                  <span style={{ color: resolved.metadataValueColor }}>Product &amp; UI/UX Designer</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium" style={{ color: resolved.metadataLabelColor }}>Duration:</span>
                  <span style={{ color: resolved.metadataValueColor }}>3 Months</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium" style={{ color: resolved.metadataLabelColor }}>Deliverables:</span>
                  <span style={{ color: resolved.metadataValueColor }}>Design System, Prototypes</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border shadow-sm"
                  style={{
                    backgroundColor: resolved.primaryButtonBg,
                    color: resolved.primaryButtonText,
                    borderColor: resolved.primaryButtonBorder,
                    borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                  }}
                >
                  Live Project
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: resolved.secondaryButtonBg,
                    color: resolved.secondaryButtonText,
                    borderColor: resolved.secondaryButtonBorder,
                    borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                  }}
                >
                  View Figma File
                </button>
              </div>

              {/* Section Divider */}
              <div className="w-full h-0.5 my-1" style={{ backgroundColor: resolved.dividerColor }} />

              {/* Chapter Section Simulation */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-tight" style={{ color: resolved.sectionHeadingColor }}>
                    01. The Problem
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: resolved.chapterNumberColor,
                      backgroundColor: resolved.chapterNumberBg
                    }}
                  >
                    01 / 12
                  </span>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: resolved.bodyTextColor }}>
                  Section introduction narrative explaining customer challenges, requirements, and discovery findings.
                </p>

                {/* Sample Card */}
                <div
                  className="p-3.5 border transition-all flex flex-col gap-1.5"
                  style={{
                    backgroundColor: resolved.cardBackground,
                    borderColor: resolved.cardBorderColor,
                    borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                  }}
                >
                  <div className="text-xs font-semibold" style={{ color: resolved.cardTitleColor }}>
                    Intuitive Interface Workflow
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: resolved.cardTextColor }}>
                    High-contrast components and accessible color hierarchy tailored for quick decision making.
                  </div>
                </div>

                {/* Sample Bullet List Item */}
                <div className="flex items-start gap-2 text-xs pt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{
                      backgroundColor: resolved.bulletDotColor,
                      boxShadow: `0 0 6px ${resolved.bulletDotColor}80`
                    }}
                  />
                  <span style={{ color: resolved.bulletTextColor }}>
                    Consistent tokens across Figma styles and production components.
                  </span>
                </div>

                {/* Sample Blockquote */}
                <div
                  className="p-3 border-l-2 flex flex-col gap-1 my-1"
                  style={{
                    borderLeftColor: resolved.quoteBorderColor,
                    backgroundColor: resolved.cardBackground,
                    borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                  }}
                >
                  <span className="text-xs italic" style={{ color: resolved.quoteTextColor }}>
                    &ldquo;The component architecture reduced our onboarding ramp time by 40%.&rdquo;
                  </span>
                  <span className="text-[10px]" style={{ color: resolved.quoteAuthorColor }}>
                    VP of Product · Enterprise Client
                  </span>
                </div>

                {/* Table of Contents Simulation Link */}
                <div className="pt-2 flex flex-col gap-1 border-t" style={{ borderColor: `${resolved.dividerColor}40` }}>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Table of Contents:</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className="font-medium relative pb-0.5"
                      style={{ color: resolved.navActiveTextColor }}
                    >
                      01. The Problem
                      <span
                        className="absolute bottom-0 left-0 w-full h-0.5 rounded-full"
                        style={{ backgroundColor: resolved.navActiveIndicatorColor }}
                      />
                    </span>
                    <span style={{ color: resolved.navTextColor }}>02. Key Decisions</span>
                    <span style={{ color: resolved.navTextColor }}>03. Solution</span>
                  </div>
                </div>

                {/* Next Project Teaser Simulation */}
                <div
                  className="p-3 rounded-lg border mt-2 flex items-center justify-between transition-all"
                  style={{
                    backgroundColor: resolved.nextProjectCardBg,
                    borderColor: resolved.nextProjectCardBorder,
                    borderRadius: CARD_RADIUS_MAP[resolved.cardRadius]
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold" style={{ color: resolved.nextProjectAccentColor }}>
                      View Next Project →
                    </span>
                    <span className="text-xs truncate" style={{ color: resolved.nextProjectTextColor }}>
                      Pilar Brand Identity System
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
