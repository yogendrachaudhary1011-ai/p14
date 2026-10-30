import { getSupabase } from '../supabase';
import { Project, SiteSettings, ExperienceItem, EducationItem, MediaAsset } from '../types';

export interface PortfolioSnapshot {
  settings: SiteSettings;
  projects: Project[];
  experience: ExperienceItem[];
  education: EducationItem[];
  media: MediaAsset[];
}

export interface PortfolioLoadResult {
  snapshot: PortfolioSnapshot | null;
  connected: boolean;
  error?: string;
}

/** Loads the complete portfolio from its single cloud snapshot row. */
export async function fetchPortfolioSnapshot(): Promise<PortfolioLoadResult> {
  const supabase = getSupabase();
  if (!supabase) return { snapshot: null, connected: false, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase
      .from('portfolio_state')
      .select('data')
      .eq('id', 'primary')
      .maybeSingle();

    if (error) return { snapshot: null, connected: false, error: error.message };
    if (!data) return { snapshot: null, connected: true };

    const stored = data.data as Partial<PortfolioSnapshot> & SiteSettings;
    // Accept the older site_settings payload as well, so a migration does not discard it.
    const snapshot: PortfolioSnapshot = {
      settings: ('settings' in stored ? stored.settings : stored) as SiteSettings,
      projects: Array.isArray(stored.projects) ? stored.projects : [],
      experience: Array.isArray(stored.experience) ? stored.experience : [],
      education: Array.isArray(stored.education) ? stored.education : [],
      media: Array.isArray(stored.media) ? stored.media : []
    };
    return { snapshot, connected: true };
  } catch (error) {
    return { snapshot: null, connected: false, error: error instanceof Error ? error.message : 'Unknown Supabase error.' };
  }
}

/** Saves settings and every editable collection atomically in one cloud row. */
export async function savePortfolioSnapshot(snapshot: PortfolioSnapshot): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };

  try {
    const { error } = await supabase.from('portfolio_state').upsert({
      id: 'primary',
      data: snapshot,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown Supabase error.' };
  }
}

export function subscribeToPortfolioSnapshot(onUpdate: (snapshot: PortfolioSnapshot) => void): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('portfolio_state_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_state' }, async () => {
      const result = await fetchPortfolioSnapshot();
      if (result.snapshot) onUpdate(result.snapshot);
    })
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}

/**
 * Transforms a Supabase row to a client Project object
 */
export function mapRowToProject(row: any): Project {
  return {
    id: row.id,
    title: row.title || 'Untitled Project',
    slug: row.slug,
    shortSummary: row.short_summary || row.hero_subtitle || '',
    heroSubtitle: row.hero_subtitle || row.short_summary || '',
    introduction: row.introduction || row.summary || '',
    summary: row.summary || row.introduction || '',
    category: row.category || 'product',
    categoryLabel: row.category_label || 'Case Study',
    mediaNote: row.media_note || '',
    coverImage: row.cover_image || '/assets/media/home-media-04-f775f2921176.webp',
    heroImage: row.hero_image || (row.cover_image ? { url: row.cover_image, alt: row.title } : undefined),
    year: row.year || '2026',
    order: row.display_order ?? row.order ?? 1,
    displayOrder: row.display_order ?? row.order ?? 1,
    status: row.status || 'published',
    featured: row.featured ?? true,
    route: row.route || `/${row.slug}`,
    role: row.role || 'UI/UX & Product Designer',
    duration: row.duration || '1 Month',
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
    figmaUrl: row.figma_url || 'https://www.figma.com',
    figmaButtonText: row.figma_button_text || 'View Figma File',
    externalProjectUrl: row.external_project_url || '',
    sections: row.sections || [],
    problem: row.problem,
    challenge: row.challenge,
    insights: row.insights,
    keyDecisions: row.key_decisions,
    seo: row.seo || {
      title: `${row.title || 'Project'} — Yogendra Chaudhary`,
      description: row.short_summary || 'UI/UX Case Study',
      image: row.cover_image || '/og-rizka-portfolio.jpg'
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Transforms a client Project object to a Supabase database row
 */
export function mapProjectToRow(project: Partial<Project>): any {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    short_summary: project.shortSummary || project.heroSubtitle || '',
    hero_subtitle: project.heroSubtitle || project.shortSummary || '',
    introduction: project.introduction || project.summary || '',
    summary: project.summary || project.introduction || '',
    category: project.category || 'product',
    category_label: project.categoryLabel || 'Case Study',
    cover_image: project.coverImage || (project.heroImage ? project.heroImage.url : ''),
    hero_image: project.heroImage || null,
    year: project.year || '2026',
    display_order: project.order ?? project.displayOrder ?? 1,
    status: project.status || 'published',
    featured: project.featured ?? true,
    route: project.route || `/${project.slug}`,
    role: project.role || 'UI/UX & Product Designer',
    duration: project.duration || '1 Month',
    deliverables: project.deliverables || [],
    figma_url: project.figmaUrl || '',
    figma_button_text: project.figmaButtonText || 'View Figma File',
    external_project_url: project.externalProjectUrl || '',
    sections: project.sections || [],
    problem: project.problem || null,
    challenge: project.challenge || null,
    insights: project.insights || null,
    key_decisions: project.keyDecisions || null,
    seo: project.seo || null,
    updated_at: new Date().toISOString()
  };
}

/**
 * Fetches all projects from Supabase
 */
export async function fetchProjectsFromSupabase(): Promise<Project[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetch projects error:', error.message);
      return null;
    }

    if (!data) return [];
    return data.map(mapRowToProject);
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Upserts a single project to Supabase
 */
export async function saveProjectToSupabase(project: Project): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const row = mapProjectToRow(project);
    const { error } = await supabase
      .from('projects')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Supabase save project error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase save failed:', err);
    return false;
  }
}

/**
 * Deletes a project from Supabase
 */
export async function deleteProjectFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete project error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete failed:', err);
    return false;
  }
}

/**
 * Real-time subscription to Supabase project table changes
 */
export function subscribeToSupabaseProjects(onUpdate: (projects: Project[]) => void): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('projects_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        async () => {
          const fresh = await fetchProjectsFromSupabase();
          if (fresh) onUpdate(fresh);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase subscription warning:', err);
    return null;
  }
}

/**
 * Fetches site settings from Supabase
 */
export async function fetchSettingsFromSupabase(): Promise<SiteSettings | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 'primary')
      .maybeSingle();

    if (error || !data) return null;
    return data.data as SiteSettings;
  } catch {
    return null;
  }
}

/**
 * Saves site settings to Supabase
 */
export async function saveSettingsToSupabase(settings: SiteSettings): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'primary',
        data: settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}

/** Uploads an image or video to the public portfolio-media bucket. */
export async function uploadMediaToSupabase(file: File): Promise<{ url: string | null; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { url: null, error: 'Supabase is not configured.' };

  const allowedTypes = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'video/mp4', 'video/webm'
  ]);
  if (!allowedTypes.has(file.type)) {
    return { url: null, error: 'Choose a JPG, PNG, WebP, GIF, AVIF, MP4, or WebM file.' };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { url: null, error: 'Files must be 50 MB or smaller.' };
  }

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError.message);
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('portfolio-media')
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err) {
    console.warn('Upload to Supabase Storage failed:', err);
    return { url: null, error: err instanceof Error ? err.message : 'Upload failed.' };
  }
}

