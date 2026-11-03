import { ProjectTheme } from '../types';

export interface ThemePresetDefinition {
  id: 'default' | 'cyberpunk' | 'amber' | 'emerald' | 'minimal' | 'rose' | 'light';
  name: string;
  tagline: string;
  theme: Required<Omit<ProjectTheme, 'preset'>>;
}

export const DEFAULT_THEME: Required<Omit<ProjectTheme, 'preset'>> = {
  backgroundColor: '#000000',
  textColor: '#ffffff',
  headingColor: '#ffffff',
  bodyTextColor: '#ffffff',
  mutedTextColor: '#a1a1aa',
  cardTitleColor: '#ffffff',
  cardTextColor: '#a1a1aa',
  accentTextColor: '#8be28b',
  navTextColor: '#a1a1aa',
  buttonTextColor: '#ffffff',
  accentColor: '#8be28b',
  cardBackground: '#18181b',
  cardBorderColor: 'rgba(255, 255, 255, 0.08)',
  dividerColor: 'rgba(255, 255, 255, 0.20)',
  fontFamily: 'plus-jakarta',
  titleSize: 'normal',
  cardRadius: 'subtle',
  backgroundPattern: 'grid',
  showProgressBar: true
};

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'default',
    name: 'Obsidian Neon',
    tagline: 'Signature editorial dark aesthetic with neon mint accents',
    theme: { ...DEFAULT_THEME }
  },
  {
    id: 'cyberpunk',
    name: 'Midnight Indigo',
    tagline: 'Cosmic slate dark theme with electric indigo and violet highlights',
    theme: {
      backgroundColor: '#070b14',
      textColor: '#f8fafc',
      headingColor: '#f8fafc',
      bodyTextColor: '#cbd5e1',
      mutedTextColor: '#94a3b8',
      cardTitleColor: '#f8fafc',
      cardTextColor: '#94a3b8',
      accentTextColor: '#818cf8',
      navTextColor: '#94a3b8',
      buttonTextColor: '#ffffff',
      accentColor: '#6366f1',
      cardBackground: '#0f172a',
      cardBorderColor: 'rgba(99, 102, 241, 0.25)',
      dividerColor: 'rgba(99, 102, 241, 0.35)',
      fontFamily: 'inter',
      titleSize: 'normal',
      cardRadius: 'rounded',
      backgroundPattern: 'glow',
      showProgressBar: true
    }
  },
  {
    id: 'amber',
    name: 'Warm Espresso & Amber',
    tagline: 'Deep roasted charcoal with warm tangerine flame glow',
    theme: {
      backgroundColor: '#0d0b08',
      textColor: '#fafaf9',
      headingColor: '#fafaf9',
      bodyTextColor: '#e7e5e4',
      mutedTextColor: '#a8a29e',
      cardTitleColor: '#fafaf9',
      cardTextColor: '#a8a29e',
      accentTextColor: '#ff853a',
      navTextColor: '#a8a29e',
      buttonTextColor: '#ffffff',
      accentColor: '#ff853a',
      cardBackground: '#1c1917',
      cardBorderColor: 'rgba(255, 133, 58, 0.22)',
      dividerColor: 'rgba(255, 133, 58, 0.35)',
      fontFamily: 'plus-jakarta',
      titleSize: 'normal',
      cardRadius: 'subtle',
      backgroundPattern: 'dots',
      showProgressBar: true
    }
  },
  {
    id: 'emerald',
    name: 'Deep Forest & Jade',
    tagline: 'Sophisticated botanical dark surface with vivid emerald luster',
    theme: {
      backgroundColor: '#030d08',
      textColor: '#f0fdf4',
      headingColor: '#f0fdf4',
      bodyTextColor: '#bbf7d0',
      mutedTextColor: '#86efac',
      cardTitleColor: '#f0fdf4',
      cardTextColor: '#86efac',
      accentTextColor: '#10b981',
      navTextColor: '#86efac',
      buttonTextColor: '#ffffff',
      accentColor: '#10b981',
      cardBackground: '#062218',
      cardBorderColor: 'rgba(16, 185, 129, 0.25)',
      dividerColor: 'rgba(16, 185, 129, 0.35)',
      fontFamily: 'plus-jakarta',
      titleSize: 'normal',
      cardRadius: 'subtle',
      backgroundPattern: 'grid',
      showProgressBar: true
    }
  },
  {
    id: 'minimal',
    name: 'Monochrome Pitch',
    tagline: 'Architectural gallery black with stark silver and white contrast',
    theme: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      headingColor: '#ffffff',
      bodyTextColor: '#e4e4e7',
      mutedTextColor: '#71717a',
      cardTitleColor: '#ffffff',
      cardTextColor: '#a1a1aa',
      accentTextColor: '#f4f4f5',
      navTextColor: '#71717a',
      buttonTextColor: '#000000',
      accentColor: '#f4f4f5',
      cardBackground: '#121215',
      cardBorderColor: 'rgba(255, 255, 255, 0.12)',
      dividerColor: 'rgba(255, 255, 255, 0.30)',
      fontFamily: 'inter',
      titleSize: 'large',
      cardRadius: 'sharp',
      backgroundPattern: 'none',
      showProgressBar: true
    }
  },
  {
    id: 'rose',
    name: 'Crimson Noir',
    tagline: 'Deep velvet cherry with vibrant electric rose highlights',
    theme: {
      backgroundColor: '#0d0509',
      textColor: '#fff1f2',
      headingColor: '#fff1f2',
      bodyTextColor: '#fecdd3',
      mutedTextColor: '#fda4af',
      cardTitleColor: '#fff1f2',
      cardTextColor: '#fda4af',
      accentTextColor: '#f43f5e',
      navTextColor: '#fda4af',
      buttonTextColor: '#ffffff',
      accentColor: '#f43f5e',
      cardBackground: '#1c0b13',
      cardBorderColor: 'rgba(244, 63, 94, 0.25)',
      dividerColor: 'rgba(244, 63, 94, 0.35)',
      fontFamily: 'plus-jakarta',
      titleSize: 'normal',
      cardRadius: 'rounded',
      backgroundPattern: 'glow',
      showProgressBar: true
    }
  },
  {
    id: 'light',
    name: 'Editorial Paper (Light)',
    tagline: 'Bright crisp editorial magazine canvas with royal cobalt accents',
    theme: {
      backgroundColor: '#f8f9fa',
      textColor: '#09090b',
      headingColor: '#09090b',
      bodyTextColor: '#1e293b',
      mutedTextColor: '#64748b',
      cardTitleColor: '#09090b',
      cardTextColor: '#52525b',
      accentTextColor: '#2563eb',
      navTextColor: '#64748b',
      buttonTextColor: '#ffffff',
      accentColor: '#2563eb',
      cardBackground: '#ffffff',
      cardBorderColor: 'rgba(9, 9, 11, 0.10)',
      dividerColor: 'rgba(9, 9, 11, 0.18)',
      fontFamily: 'plus-jakarta',
      titleSize: 'normal',
      cardRadius: 'rounded',
      backgroundPattern: 'grid',
      showProgressBar: true
    }
  }
];

export const QUICK_ACCENT_COLORS = [
  { name: 'Neon Mint', hex: '#8be28b' },
  { name: 'Tangerine Flame', hex: '#ff853a' },
  { name: 'Electric Indigo', hex: '#6366f1' },
  { name: 'Vivid Emerald', hex: '#10b981' },
  { name: 'Electric Rose', hex: '#f43f5e' },
  { name: 'Cyan Pulse', hex: '#06b6d4' },
  { name: 'Goldenrod Amber', hex: '#f59e0b' },
  { name: 'Royal Cobalt', hex: '#2563eb' },
  { name: 'Pure Platinum', hex: '#f4f4f5' }
];

export const QUICK_BG_COLORS = [
  { name: 'Pitch Black', hex: '#000000' },
  { name: 'Charcoal Noir', hex: '#0a0a0c' },
  { name: 'Cosmic Slate', hex: '#070b14' },
  { name: 'Warm Espresso', hex: '#0d0b08' },
  { name: 'Deep Forest', hex: '#030d08' },
  { name: 'Velvet Plum', hex: '#0d0509' },
  { name: 'Editorial Off-White', hex: '#f8f9fa' }
];

export function resolveProjectTheme(theme?: ProjectTheme): Required<Omit<ProjectTheme, 'preset'>> {
  if (!theme) return { ...DEFAULT_THEME };

  let base = { ...DEFAULT_THEME };
  if (theme.preset && theme.preset !== 'custom') {
    const foundPreset = THEME_PRESETS.find((p) => p.id === theme.preset);
    if (foundPreset) {
      base = { ...foundPreset.theme };
    }
  }

  const masterText = theme.textColor || base.textColor;
  const masterMuted = theme.mutedTextColor || base.mutedTextColor;

  return {
    backgroundColor: theme.backgroundColor || base.backgroundColor,
    textColor: masterText,
    headingColor: theme.headingColor || masterText || base.headingColor,
    bodyTextColor: theme.bodyTextColor || masterText || base.bodyTextColor,
    mutedTextColor: masterMuted,
    cardTitleColor: theme.cardTitleColor || theme.headingColor || masterText || base.cardTitleColor,
    cardTextColor: theme.cardTextColor || masterMuted || base.cardTextColor,
    accentTextColor: theme.accentTextColor || theme.accentColor || base.accentTextColor,
    navTextColor: theme.navTextColor || masterMuted || base.navTextColor,
    buttonTextColor: theme.buttonTextColor || base.buttonTextColor,
    accentColor: theme.accentColor || base.accentColor,
    cardBackground: theme.cardBackground || base.cardBackground,
    cardBorderColor: theme.cardBorderColor || base.cardBorderColor,
    dividerColor: theme.dividerColor || base.dividerColor,
    fontFamily: theme.fontFamily || base.fontFamily,
    titleSize: theme.titleSize || base.titleSize,
    cardRadius: theme.cardRadius || base.cardRadius,
    backgroundPattern: theme.backgroundPattern || base.backgroundPattern,
    showProgressBar: theme.showProgressBar !== undefined ? theme.showProgressBar : base.showProgressBar
  };
}

export const FONT_MAP: Record<NonNullable<ProjectTheme['fontFamily']>, string> = {
  'plus-jakarta': "'Plus Jakarta Sans', sans-serif",
  'dm-sans': "'DM Sans', sans-serif",
  'inter': "'Inter', sans-serif",
  'serif': "Georgia, Cambria, 'Times New Roman', serif",
  'mono': "'DM Mono', monospace"
};

export const TITLE_SIZE_CLASSES: Record<NonNullable<ProjectTheme['titleSize']>, string> = {
  compact: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]',
  normal: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]',
  large: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.08]',
  oversized: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[1.05]'
};

export const CARD_RADIUS_MAP: Record<NonNullable<ProjectTheme['cardRadius']>, string> = {
  sharp: '0px',
  subtle: '6px',
  rounded: '12px',
  pill: '24px'
};
