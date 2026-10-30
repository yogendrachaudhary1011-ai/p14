import crypto from 'crypto';
import {
  db,
  doc,
  getDoc,
  setDoc
} from './firebase.js';

const INTEGRATION_REF = doc(db, 'site_integrations', 'google_drive');
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DEFAULT_REDIRECT_URI = 'https://p14-olive.vercel.app/api/admin/google-drive/callback';
let cachedAccessToken = null;

function oauthConfig() {
  return {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    encryptionKey: process.env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY,
    redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || DEFAULT_REDIRECT_URI
  };
}

export function getGoogleDriveSetupStatus() {
  const config = oauthConfig();
  return {
    configured: Boolean(config.clientId && config.clientSecret && config.encryptionKey),
    redirectUri: config.redirectUri
  };
}

function assertConfigured() {
  const config = oauthConfig();
  if (!config.clientId || !config.clientSecret || !config.encryptionKey) {
    throw new Error('Google Drive is not configured. Add the three Google Drive secrets in Vercel, then redeploy.');
  }
  const key = Buffer.from(config.encryptionKey, 'base64');
  if (key.length !== 32) throw new Error('GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  return { ...config, key };
}

export function createGoogleDriveState() {
  return crypto.randomBytes(32).toString('hex');
}

export function getGoogleDriveAuthorizationUrl(state) {
  const config = assertConfigured();
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: DRIVE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state
  }).toString();
  return url.toString();
}

export async function completeGoogleDriveAuthorization(code) {
  const config = assertConfigured();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    })
  });
  const tokenData = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(tokenData.error_description || tokenData.error || 'Google authorization could not be completed.');
  if (!tokenData.refresh_token) throw new Error('Google did not return a refresh token. Disconnect this app in Google Account permissions and connect again.');

  const encryptedRefreshToken = encryptToken(tokenData.refresh_token, config.key);
  await setDoc(INTEGRATION_REF, {
    connected: true,
    encryptedRefreshToken,
    connectedAt: new Date().toISOString(),
    folderId: '',
    folderName: 'P14 Website Media'
  });
  cachedAccessToken = null;
  await ensureDriveFolder();
}

export async function getGoogleDriveStatus() {
  const setup = getGoogleDriveSetupStatus();
  if (!setup.configured) return { configured: false, connected: false, redirectUri: setup.redirectUri };
  const snap = await getDoc(INTEGRATION_REF);
  const data = snap.exists() ? snap.data() : {};
  return {
    configured: true,
    connected: data.connected === true && Boolean(data.encryptedRefreshToken),
    folderName: data.folderName || 'P14 Website Media',
    redirectUri: setup.redirectUri
  };
}

async function getAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.value;
  const config = assertConfigured();
  const snap = await getDoc(INTEGRATION_REF);
  if (!snap.exists() || !snap.data().encryptedRefreshToken) throw new Error('Google Drive is not connected. Open Media Library and connect your Google account.');
  const refreshToken = decryptToken(snap.data().encryptedRefreshToken, config.key);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await response.json().catch(() => ({}));
  if (!response.ok || !tokenData.access_token) {
    if (tokenData.error === 'invalid_grant') cachedAccessToken = null;
    throw new Error(tokenData.error_description || tokenData.error || 'Could not refresh Google Drive access. Reconnect the Google account.');
  }
  cachedAccessToken = { value: tokenData.access_token, expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000 };
  return cachedAccessToken.value;
}

async function driveFetch(url, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  if (response.status === 401) cachedAccessToken = null;
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    let message = detail;
    try { message = JSON.parse(detail).error?.message || detail; } catch {}
    throw new Error(`Google Drive request failed (${response.status}): ${message || response.statusText}`);
  }
  return response;
}

async function ensureDriveFolder() {
  const snap = await getDoc(INTEGRATION_REF);
  const integration = snap.data() || {};
  if (integration.folderId) return integration.folderId;
  const response = await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'P14 Website Media',
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  const folder = await response.json();
  await setDoc(INTEGRATION_REF, { ...integration, connected: true, folderId: folder.id, folderName: folder.name });
  return folder.id;
}

export async function uploadDriveFile(file, mediaId) {
  const folderId = await ensureDriveFolder();
  const boundary = `p14-${crypto.randomBytes(12).toString('hex')}`;
  const metadata = JSON.stringify({
    name: file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'),
    mimeType: file.mimetype,
    parents: [folderId],
    appProperties: { p14MediaId: mediaId }
  });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${file.mimetype}\r\n\r\n`),
    file.buffer,
    Buffer.from(`\r\n--${boundary}--`)
  ]);
  const response = await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
  const result = await response.json();
  if (!result.id) throw new Error('Google Drive saved the file without returning its ID.');
  return result;
}

export async function getDriveFileContent(fileId) {
  const response = await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`);
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    mimeType: response.headers.get('content-type') || 'application/octet-stream'
  };
}

export async function deleteDriveFile(fileId) {
  if (!fileId) return;
  await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' });
}

function encryptToken(token, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    value: encrypted.toString('base64')
  };
}

function decryptToken(encrypted, key) {
  if (!encrypted?.iv || !encrypted?.tag || !encrypted?.value) throw new Error('Google Drive authorization is incomplete. Reconnect the Google account.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.value, 'base64')),
    decipher.final()
  ]).toString('utf8');
}

