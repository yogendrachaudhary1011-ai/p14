import { VisitorActivity, VisitorLog, VisitorPageVisit } from '../types';
import { getSupabase } from '../supabase';
import { safeStorage } from './storage';

const VISITOR_LOGS_STORAGE_KEY = 'yc_portfolio_visitor_logs_v1';
const SESSION_ID_STORAGE_KEY = 'yc_visitor_session_id_v1';
const SESSION_IP_STORAGE_KEY = 'yc_visitor_ip_v1';
const MAX_LOCAL_VISITOR_LOGS = 200;
const MAX_PAGES_PER_SESSION = 50;
const MAX_ACTIVITIES_PER_SESSION = 100;

let activeSession: VisitorLog | null = null;
let sessionInitPromise: Promise<VisitorLog> | null = null;
let syncTimer: number | null = null;
let hasInsertedBasicFallback = false;
let rpcUnsupported = false;
let recordedVideos = new Set<string>();
let recordedIdCardInteraction = false;

interface NavigatorUADataBrand {
  brand: string;
  version: string;
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: {
    brands?: NavigatorUADataBrand[];
    platform?: string;
    mobile?: boolean;
  };
  brave?: {
    isBrave?: () => Promise<boolean>;
  };
}

export async function detectBrowserName(): Promise<string> {
  if (typeof navigator === 'undefined') return 'Unknown';

  const nav = navigator as NavigatorWithUAData;
  const ua = nav.userAgent || '';

  try {
    if (nav.brave?.isBrave && (await nav.brave.isBrave())) {
      const chromeMatch = ua.match(/Chrome\/(\d+)/);
      return chromeMatch ? `Brave ${chromeMatch[1]}` : 'Brave';
    }
  } catch {
    // Ignore Brave detection errors
  }

  const brands = nav.userAgentData?.brands || [];
  const brandMatch = (needle: string) =>
    brands.find((b) => b.brand.toLowerCase().includes(needle.toLowerCase()));

  const edgeBrand = brandMatch('Microsoft Edge');
  if (edgeBrand) return edgeBrand.version ? `Edge ${edgeBrand.version}` : 'Edge';

  const operaBrand = brandMatch('Opera');
  if (operaBrand) return operaBrand.version ? `Opera ${operaBrand.version}` : 'Opera';

  if (/EdgA?\/(\d+)/i.test(ua)) {
    const match = ua.match(/EdgA?\/(\d+)/i);
    return match ? `Edge ${match[1]}` : 'Edge';
  }
  if (/OPR\/(\d+)/i.test(ua)) {
    const match = ua.match(/OPR\/(\d+)/i);
    return match ? `Opera ${match[1]}` : 'Opera';
  }
  if (/SamsungBrowser\/(\d+)/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/(\d+)/i);
    return match ? `Samsung Internet ${match[1]}` : 'Samsung Internet';
  }
  if (/Firefox\/(\d+)/i.test(ua) || /FxiOS\/(\d+)/i.test(ua)) {
    const match = ua.match(/(?:Firefox|FxiOS)\/(\d+)/i);
    return match ? `Firefox ${match[1]}` : 'Firefox';
  }
  if (/CriOS\/(\d+)/i.test(ua)) {
    const match = ua.match(/CriOS\/(\d+)/i);
    return match ? `Chrome ${match[1]}` : 'Chrome';
  }
  if (/Chrome\/(\d+)/i.test(ua) && !/Chromium/i.test(ua)) {
    const match = ua.match(/Chrome\/(\d+)/i);
    return match ? `Chrome ${match[1]}` : 'Chrome';
  }
  if (/Safari\/[\d.]+/i.test(ua) && /Version\/(\d+)/i.test(ua)) {
    const match = ua.match(/Version\/(\d+)/i);
    return match ? `Safari ${match[1]}` : 'Safari';
  }
  if (/Safari/i.test(ua)) return 'Safari';

  return 'Unknown Browser';
}

export function detectOsAndDevice(): { osName: string; deviceType: string } {
  if (typeof navigator === 'undefined') {
    return { osName: 'Unknown', deviceType: 'Desktop' };
  }

  const nav = navigator as NavigatorWithUAData;
  const ua = nav.userAgent || '';
  const platform = nav.userAgentData?.platform || nav.platform || '';

  let osName = 'Unknown';
  if (/Android/i.test(ua)) osName = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1)) osName = 'iOS';
  else if (/Win/i.test(platform) || /Windows/i.test(ua)) osName = 'Windows';
  else if (/Mac/i.test(platform) || /Macintosh|Mac OS X/i.test(ua)) osName = 'macOS';
  else if (/CrOS/i.test(ua)) osName = 'ChromeOS';
  else if (/Linux/i.test(platform) || /Linux/i.test(ua)) osName = 'Linux';

  let deviceType = 'Desktop';
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    deviceType = 'Tablet';
  } else if (nav.userAgentData?.mobile || /Mobi|Android|iPhone|iPod/i.test(ua)) {
    deviceType = 'Mobile';
  }

  return { osName, deviceType };
}

function generateId(prefix = 'vis'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreateSessionId(): string {
  try {
    const existing = window.sessionStorage?.getItem(SESSION_ID_STORAGE_KEY);
    if (existing) return existing;
    const next = generateId('sess');
    window.sessionStorage?.setItem(SESSION_ID_STORAGE_KEY, next);
    return next;
  } catch {
    return generateId('sess');
  }
}

async function fetchPublicIpSilently(): Promise<string> {
  try {
    const cachedIp = window.sessionStorage?.getItem(SESSION_IP_STORAGE_KEY);
    if (cachedIp && cachedIp !== 'Unavailable') return cachedIp;
  } catch {
    // Ignore sessionStorage errors
  }

  const endpoints = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json'
  ];

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      window.clearTimeout(timer);
      if (!response.ok) continue;
      const json = (await response.json()) as { ip?: string };
      if (json?.ip && typeof json.ip === 'string') {
        const cleaned = json.ip.trim();
        try {
          window.sessionStorage?.setItem(SESSION_IP_STORAGE_KEY, cleaned);
        } catch {
          // Ignore sessionStorage errors
        }
        return cleaned;
      }
    } catch {
      window.clearTimeout(timer);
    }
  }

  return 'Unavailable';
}

export function formatPageLabel(path: string): string {
  const clean = (path || '/').trim();
  if (clean === '/' || clean === '') return 'Home';
  if (clean === '/#work') return 'Selected Work';
  if (clean === '/#about') return 'About Section';
  if (clean === '/projects' || clean === '/work') return 'All Projects';
  if (clean === '/about') return 'About';
  const slug = clean.replace(/^\/+/, '').split('#')[0];
  return slug ? slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Home';
}

export function normalizeVisitorLog(raw: any): VisitorLog {
  const visitedAt = raw?.visitedAt || raw?.visited_at || new Date().toISOString();
  const pagePath = raw?.pagePath || raw?.page_path || '/';
  const rawPages = Array.isArray(raw?.pagesVisited)
    ? raw.pagesVisited
    : Array.isArray(raw?.pages_visited)
    ? raw.pages_visited
    : [];
  const pagesVisited: VisitorPageVisit[] =
    rawPages.length > 0
      ? rawPages
          .filter((p: any) => p && typeof p.path === 'string')
          .map((p: any) => ({
            path: p.path,
            label: typeof p.label === 'string' && p.label ? p.label : formatPageLabel(p.path),
            visitedAt: p.visitedAt || visitedAt
          }))
      : [{ path: pagePath, label: formatPageLabel(pagePath), visitedAt }];

  const rawActivities = Array.isArray(raw?.activities) ? raw.activities : [];
  const activities: VisitorActivity[] = rawActivities
    .filter((a: any) => a && typeof a.action === 'string')
    .map((a: any) => ({
      type: a.type || 'click',
      action: a.action,
      detail: typeof a.detail === 'string' ? a.detail : undefined,
      pagePath: typeof a.pagePath === 'string' ? a.pagePath : pagePath,
      at: a.at || visitedAt
    }));

  return {
    id: String(raw?.id || raw?.sessionId || raw?.session_id || generateId('vis')),
    sessionId: String(raw?.sessionId || raw?.session_id || raw?.id || generateId('sess')),
    ipAddress: raw?.ipAddress || raw?.ip_address || 'Unavailable',
    browserName: raw?.browserName || raw?.browser_name || 'Unknown',
    osName: raw?.osName || raw?.os_name || 'Unknown',
    deviceType: raw?.deviceType || raw?.device_type || 'Desktop',
    pagePath,
    pagesVisited,
    activities,
    timezone: raw?.timezone || 'UTC',
    referrer: raw?.referrer || '',
    visitedAt,
    lastActiveAt: raw?.lastActiveAt || raw?.last_active_at || visitedAt
  };
}

export function getLocalVisitorLogs(): VisitorLog[] {
  try {
    const raw = safeStorage.getItem(VISITOR_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeVisitorLog);
  } catch {
    return [];
  }
}

function upsertLocalVisitorLog(entry: VisitorLog): void {
  try {
    const existing = getLocalVisitorLogs();
    const filtered = existing.filter((item) => item.sessionId !== entry.sessionId && item.id !== entry.id);
    const updated = [entry, ...filtered].slice(0, MAX_LOCAL_VISITOR_LOGS);
    safeStorage.setItem(VISITOR_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearLocalVisitorLogs(): void {
  safeStorage.removeItem(VISITOR_LOGS_STORAGE_KEY);
  activeSession = null;
}

async function ensureSession(initialPath: string): Promise<VisitorLog> {
  if (activeSession) return activeSession;
  if (sessionInitPromise) return sessionInitPromise;

  sessionInitPromise = (async () => {
    const sessionId = getOrCreateSessionId();
    const existing = getLocalVisitorLogs().find((item) => item.sessionId === sessionId);
    if (existing) {
      activeSession = existing;
      if (activeSession.ipAddress === 'Unavailable') {
        void fetchPublicIpSilently().then((ip) => {
          if (activeSession && ip !== 'Unavailable') {
            activeSession = { ...activeSession, ipAddress: ip };
            upsertLocalVisitorLog(activeSession);
            scheduleSupabaseSync();
          }
        });
      }
      return activeSession;
    }

    const [ipAddress, browserName] = await Promise.all([
      fetchPublicIpSilently(),
      detectBrowserName()
    ]);
    const { osName, deviceType } = detectOsAndDevice();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date().toISOString();
    const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';

    activeSession = {
      id: generateId('vis'),
      sessionId,
      ipAddress,
      browserName,
      osName,
      deviceType,
      pagePath: initialPath || '/',
      pagesVisited: [],
      activities: [],
      timezone,
      referrer,
      visitedAt: now,
      lastActiveAt: now
    };
    upsertLocalVisitorLog(activeSession);
    return activeSession;
  })();

  try {
    return await sessionInitPromise;
  } finally {
    sessionInitPromise = null;
  }
}

async function syncSessionToSupabase(): Promise<void> {
  if (!activeSession) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const snapshot = activeSession;

  if (!rpcUnsupported) {
    try {
      const { error } = await supabase.rpc('upsert_visitor_session', {
        p_session_id: snapshot.sessionId,
        p_ip_address: snapshot.ipAddress,
        p_browser_name: snapshot.browserName,
        p_os_name: snapshot.osName,
        p_device_type: snapshot.deviceType,
        p_page_path: snapshot.pagePath,
        p_pages_visited: snapshot.pagesVisited,
        p_activities: snapshot.activities,
        p_timezone: snapshot.timezone,
        p_referrer: snapshot.referrer,
        p_visited_at: snapshot.visitedAt,
        p_last_active_at: snapshot.lastActiveAt
      });

      if (!error) return;

      const msg = error.message || '';
      if (
        error.code === '42883' ||
        error.code === 'PGRST202' ||
        msg.includes('upsert_visitor_session')
      ) {
        rpcUnsupported = true;
      } else {
        return;
      }
    } catch {
      return;
    }
  }

  // Fallback for legacy table without upsert_visitor_session RPC
  if (rpcUnsupported && !hasInsertedBasicFallback) {
    hasInsertedBasicFallback = true;
    try {
      await supabase.from('visitor_logs').insert({
        ip_address: snapshot.ipAddress,
        browser_name: snapshot.browserName,
        os_name: snapshot.osName,
        device_type: snapshot.deviceType,
        page_path: snapshot.pagePath,
        timezone: snapshot.timezone,
        referrer: snapshot.referrer,
        visited_at: snapshot.visitedAt
      });
    } catch {
      // Ignore fallback insert failures
    }
  }
}

function scheduleSupabaseSync(immediate = false): void {
  if (typeof window === 'undefined') return;
  if (syncTimer !== null) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }
  if (immediate) {
    void syncSessionToSupabase();
    return;
  }
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void syncSessionToSupabase();
  }, 900);
}

/**
 * Silently records each public page visit in the current visitor session
 * without requesting any browser permissions.
 */
export async function recordVisitorPageVisit(pagePath = '/', pageLabel?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const cleanPath = (pagePath || '/').trim() || '/';
  if (cleanPath.startsWith('/admin')) return;

  try {
    const session = await ensureSession(cleanPath);
    const now = new Date().toISOString();
    const resolvedLabel = pageLabel || formatPageLabel(cleanPath);
    const lastPage = session.pagesVisited[session.pagesVisited.length - 1];
    const isInitialLanding = session.pagesVisited.length === 0;

    if (!lastPage || lastPage.path !== cleanPath) {
      const nextPages = [
        ...session.pagesVisited,
        { path: cleanPath, label: resolvedLabel, visitedAt: now }
      ].slice(-MAX_PAGES_PER_SESSION);

      const nextActivities = [
        ...session.activities,
        {
          type: (isInitialLanding ? 'visit' : 'page') as VisitorActivity['type'],
          action: isInitialLanding ? 'Landed on website' : 'Visited page',
          detail: resolvedLabel,
          pagePath: cleanPath,
          at: now
        }
      ].slice(-MAX_ACTIVITIES_PER_SESSION);

      activeSession = {
        ...session,
        pagesVisited: nextPages,
        activities: nextActivities,
        lastActiveAt: now
      };
      upsertLocalVisitorLog(activeSession);
      scheduleSupabaseSync(isInitialLanding);
    }
  } catch {
    // Silent capture should never disrupt the visitor experience
  }
}

/**
 * Records an in-site visitor activity (clicking links, case studies, filters, tabs, video play, etc.)
 * into the active visitor session without prompting for permissions.
 */
export async function trackVisitorActivity(
  type: VisitorActivity['type'],
  action: string,
  detail?: string,
  pagePath?: string
): Promise<void> {
  if (typeof window === 'undefined') return;
  const activePath =
    pagePath ||
    `${window.location.pathname || '/'}${window.location.hash || ''}` ||
    '/';
  if (activePath.startsWith('/admin')) return;

  try {
    const session = await ensureSession(activePath);
    const now = new Date().toISOString();
    const cleanedDetail = detail?.replace(/\s+/g, ' ').trim().slice(0, 120) || undefined;
    const lastActivity = session.activities[session.activities.length - 1];

    if (
      lastActivity &&
      lastActivity.action === action &&
      lastActivity.detail === cleanedDetail &&
      lastActivity.pagePath === activePath &&
      Math.abs(new Date(now).getTime() - new Date(lastActivity.at).getTime()) < 800
    ) {
      return;
    }

    const nextActivities = [
      ...session.activities,
      {
        type,
        action,
        detail: cleanedDetail,
        pagePath: activePath,
        at: now
      }
    ].slice(-MAX_ACTIVITIES_PER_SESSION);

    activeSession = {
      ...session,
      activities: nextActivities,
      lastActiveAt: now
    };
    upsertLocalVisitorLog(activeSession);
    scheduleSupabaseSync(false);
  } catch {
    // Never interrupt user interactions
  }
}

function getReadableControlLabel(el: Element): string {
  const aria = el.getAttribute('aria-label')?.trim();
  const rawText = el.textContent?.replace(/\s+/g, ' ').trim() || '';
  const cleanedText = rawText.replace(/arrow_outward|arrow_back|arrow_forward|open_in_new|south_east/gi, '').trim();
  return cleanedText || aria || '';
}

/**
 * Installs delegated DOM listeners on public pages to record visitor clicks,
 * filters, section navigation, external links, and media playback.
 */
export function installVisitorActivityListeners(): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {};
  }

  const handleClick = (event: MouseEvent) => {
    if ((window.location.pathname || '/').startsWith('/admin')) return;
    const target = event.target as Element | null;
    if (!target) return;

    const interactive = target.closest('a, button, [role="button"]');
    if (!interactive) return;

    const currentRoute = `${window.location.pathname || '/'}${window.location.hash || ''}`;
    const label = getReadableControlLabel(interactive);

    if (interactive.matches('a')) {
      const anchor = interactive as HTMLAnchorElement;
      const hrefAttr = anchor.getAttribute('href') || '';
      const hrefLower = hrefAttr.toLowerCase();

      if (anchor.classList.contains('project-card')) {
        const projectTitle = anchor.querySelector('h3')?.textContent?.trim() || label;
        void trackVisitorActivity('click', 'Opened Case Study', projectTitle, currentRoute);
        return;
      }

      if (hrefLower.startsWith('mailto:') || hrefLower.includes('mail.google.com')) {
        void trackVisitorActivity('click', 'Clicked Email / Contact', label || 'Email', currentRoute);
        return;
      }

      if (hrefLower.includes('behance.net')) {
        void trackVisitorActivity('click', 'Opened Behance Profile', label || 'Behance', currentRoute);
        return;
      }

      if (hrefLower.includes('linkedin.com')) {
        void trackVisitorActivity('click', 'Opened LinkedIn Profile', label || 'LinkedIn', currentRoute);
        return;
      }

      if (hrefLower.includes('figma.com')) {
        void trackVisitorActivity('click', 'Opened Figma File', label || 'Figma', currentRoute);
        return;
      }

      if (
        hrefLower.endsWith('.pdf') ||
        hrefLower.includes('cv') ||
        hrefLower.includes('resume') ||
        label.toLowerCase().includes('resume')
      ) {
        void trackVisitorActivity('click', 'Opened Resume / CV', label || 'Resume PDF', currentRoute);
        return;
      }

      if (label.toLowerCase().includes('certificate')) {
        void trackVisitorActivity('click', 'Viewed Certificate', label, currentRoute);
        return;
      }

      if (interactive.closest('.hero-actions')) {
        void trackVisitorActivity('section', 'Clicked Hero Action', label, currentRoute);
        return;
      }

      if (anchor.getAttribute('aria-label')?.startsWith('View Next Project') || anchor.getAttribute('aria-label')?.includes(':')) {
        const nextTitle = anchor.getAttribute('aria-label') || label;
        if (hrefAttr.startsWith('/')) {
          void trackVisitorActivity('click', 'Clicked Next Project', nextTitle, currentRoute);
          return;
        }
      }

      if (hrefLower.startsWith('http://') || hrefLower.startsWith('https://')) {
        try {
          const parsed = new URL(hrefAttr);
          if (parsed.origin !== window.location.origin) {
            void trackVisitorActivity('click', 'Clicked External Link', label || parsed.hostname, currentRoute);
            return;
          }
        } catch {
          // Ignore invalid URL
        }
      }

      return;
    }

    // Button actions
    if (interactive.closest('.filter-row')) {
      void trackVisitorActivity('filter', 'Filtered Projects', label, currentRoute);
      return;
    }

    if (interactive.closest('.about-visual-status')) {
      void trackVisitorActivity('section', 'Switched About Tab', label, currentRoute);
      return;
    }

    if (interactive.closest('nav[aria-label="Case Study Table of Contents"]')) {
      void trackVisitorActivity('section', 'Viewed Case Study Section', label, currentRoute);
      return;
    }

    const ariaLabel = interactive.getAttribute('aria-label') || '';
    if (ariaLabel === 'Previous slide' || ariaLabel === 'Next slide' || ariaLabel.startsWith('Go to slide')) {
      void trackVisitorActivity('media', 'Browsed Case Study Carousel', ariaLabel, currentRoute);
      return;
    }

    if (interactive.id === 'menu') {
      void trackVisitorActivity('click', 'Toggled Navigation Menu', undefined, currentRoute);
      return;
    }

    if (label) {
      void trackVisitorActivity('click', 'Clicked Button', label, currentRoute);
    }
  };

  const handlePlay = (event: Event) => {
    if ((window.location.pathname || '/').startsWith('/admin')) return;
    const video = event.target as HTMLVideoElement | null;
    if (!video || video.tagName !== 'VIDEO') return;
    // Only record user-initiated or unmuted plays, or initial about video watch once
    const videoLabel = video.getAttribute('aria-label') || video.currentSrc || 'Video';
    if (recordedVideos.has(videoLabel)) return;
    recordedVideos.add(videoLabel);
    const currentRoute = `${window.location.pathname || '/'}${window.location.hash || ''}`;
    void trackVisitorActivity('media', 'Viewed About Video', videoLabel, currentRoute);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (recordedIdCardInteraction) return;
    if ((window.location.pathname || '/').startsWith('/admin')) return;
    const target = event.target as Element | null;
    if (target?.closest('.id-card')) {
      recordedIdCardInteraction = true;
      const currentRoute = `${window.location.pathname || '/'}${window.location.hash || ''}`;
      void trackVisitorActivity('click', 'Interacted with Hero ID Card', 'Dragged / inspected card', currentRoute);
    }
  };

  const handlePageHide = () => {
    if ((window.location.pathname || '/').startsWith('/admin')) return;
    if (syncTimer !== null) {
      window.clearTimeout(syncTimer);
      syncTimer = null;
      void syncSessionToSupabase();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      handlePageHide();
    }
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('play', handlePlay, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  window.addEventListener('pagehide', handlePageHide);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('play', handlePlay, true);
    document.removeEventListener('pointerdown', handlePointerDown, true);
    window.removeEventListener('pagehide', handlePageHide);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
