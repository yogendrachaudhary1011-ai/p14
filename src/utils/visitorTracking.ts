import { VisitorLog } from '../types';
import { getSupabase } from '../supabase';
import { safeStorage } from './storage';

const VISITOR_LOGS_STORAGE_KEY = 'yc_portfolio_visitor_logs_v1';
const MAX_LOCAL_VISITOR_LOGS = 200;

let hasRecordedCurrentLoad = false;

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

async function fetchPublicIpSilently(): Promise<string> {
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
        return json.ip.trim();
      }
    } catch {
      window.clearTimeout(timer);
    }
  }

  return 'Unavailable';
}

export function getLocalVisitorLogs(): VisitorLog[] {
  try {
    const raw = safeStorage.getItem(VISITOR_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalVisitorLog(entry: VisitorLog): void {
  try {
    const existing = getLocalVisitorLogs();
    const updated = [entry, ...existing].slice(0, MAX_LOCAL_VISITOR_LOGS);
    safeStorage.setItem(VISITOR_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearLocalVisitorLogs(): void {
  safeStorage.removeItem(VISITOR_LOGS_STORAGE_KEY);
}

/**
 * Silently collects visitor timestamp, public IP, and browser name without
 * triggering any browser permission prompts.
 */
export async function recordVisitorVisit(pagePath = '/'): Promise<void> {
  if (typeof window === 'undefined' || hasRecordedCurrentLoad) return;
  if (pagePath.startsWith('/admin')) return;

  hasRecordedCurrentLoad = true;

  try {
    const [ipAddress, browserName] = await Promise.all([
      fetchPublicIpSilently(),
      detectBrowserName()
    ]);

    const { osName, deviceType } = detectOsAndDevice();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const visitedAt = new Date().toISOString();
    const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';

    const logEntry: VisitorLog = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `vis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ipAddress,
      browserName,
      osName,
      deviceType,
      pagePath: pagePath || '/',
      timezone,
      referrer,
      visitedAt
    };

    saveLocalVisitorLog(logEntry);

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('visitor_logs').insert({
        ip_address: logEntry.ipAddress,
        browser_name: logEntry.browserName,
        os_name: logEntry.osName,
        device_type: logEntry.deviceType,
        page_path: logEntry.pagePath,
        timezone: logEntry.timezone,
        referrer: logEntry.referrer,
        visited_at: logEntry.visitedAt
      });
    }
  } catch {
    // Silent capture should never disrupt the visitor experience
  }
}
