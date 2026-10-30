import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  db,
  collection,
  getDocs,
  setDoc,
  uploadStorageObject,
  getPublicStorageUrl
} from '../lib/supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const collections = [
  'site_settings', 'pages', 'projects', 'experience', 'education',
  'navigation', 'social_links', 'admin_users', 'media', 'backups',
  'system_metadata'
];

function fromFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('bytesValue' in value) return { __bytesBase64: value.bytesValue };
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue.fields || {});
  return null;
}

function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

function documentId(document) {
  return document.name.split('/').pop();
}

async function fetchCollection(collectionName) {
  const rows = [];
  let pageToken = '';
  do {
    const url = new URL(
      'https://firestore.googleapis.com/v1/projects/' +
      encodeURIComponent(config.projectId) +
      '/databases/' +
      encodeURIComponent(config.firestoreDatabaseId || '(default)') +
      '/documents/' +
      encodeURIComponent(collectionName)
    );
    url.searchParams.set('pageSize', '1000');
    url.searchParams.set('key', config.apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Could not read source collection ' + collectionName + ' (HTTP ' + response.status + ').');
    }
    const result = await response.json();
    for (const document of result.documents || []) {
      rows.push({ id: documentId(document), data: fromFirestoreFields(document.fields) });
    }
    pageToken = result.nextPageToken || '';
  } while (pageToken);
  return rows;
}

function replaceUrlsDeep(value, replacements) {
  if (typeof value === 'string') return replacements.get(value) || value;
  if (Array.isArray(value)) return value.map(item => replaceUrlsDeep(item, replacements));
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      if (child && typeof child === 'object' && child.__bytesBase64) {
        result[key] = child;
      } else {
        result[key] = replaceUrlsDeep(child, replacements);
      }
    }
    return result;
  }
  return value;
}

async function readBinaryBlob(blobId) {
  const url = new URL(
    'https://firestore.googleapis.com/v1/projects/' +
    encodeURIComponent(config.projectId) +
    '/databases/' +
    encodeURIComponent(config.firestoreDatabaseId || '(default)') +
    '/documents/media_blobs/' +
    encodeURIComponent(blobId)
  );
  url.searchParams.set('key', config.apiKey);
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not read legacy binary media ' + blobId + ' (HTTP ' + response.status + ').');
  const document = await response.json();
  const encoded = document.fields?.data?.bytesValue;
  if (!encoded) throw new Error('Legacy binary media ' + blobId + ' did not contain a byte payload.');
  return {
    bytes: Buffer.from(encoded, 'base64'),
    mimeType: document.fields?.mimeType?.stringValue || 'application/octet-stream',
    name: document.fields?.name?.stringValue || blobId
  };
}

async function migrateMedia(mediaRows) {
  const replacements = new Map();
  for (const row of mediaRows) {
    const media = row.data || {};
    if (media.storageType !== 'firebase_storage' && media.storageType !== 'firestore_binary') continue;

    const storagePath = media.storagePath || ('uploads/' + row.id);
    let bytes;
    if (media.storageType === 'firestore_binary') {
      const binary = await readBinaryBlob(row.id);
      bytes = binary.bytes;
      media.mimeType = media.mimeType || binary.mimeType;
      media.name = media.name || binary.name;
    } else {
      const response = await fetch(media.url);
      if (!response.ok) {
        throw new Error('Could not download a legacy media file for record ' + row.id + ' (HTTP ' + response.status + ').');
      }
      bytes = Buffer.from(await response.arrayBuffer());
    }

    const newUrl = await uploadStorageObject(storagePath, bytes, media.mimeType || 'application/octet-stream');
    if (media.url) replacements.set(media.url, newUrl);
    if (media.storageType === 'firestore_binary') replacements.set('/api/media/blob/' + row.id, newUrl);
    media.url = newUrl;
    media.storagePath = storagePath;
    media.storageType = 'supabase_storage';
    row.data = media;
    console.log('Migrated media record ' + row.id);
  }
  return replacements;
}

for (const collectionName of collections) {
  const destination = await getDocs(collection(db, collectionName));
  if (!destination.empty && process.env.SUPABASE_IMPORT_OVERWRITE !== 'true') {
    throw new Error(
      'Supabase collection ' + collectionName + ' already has data. ' +
      'Review the target or set SUPABASE_IMPORT_OVERWRITE=true to replace matching records.'
    );
  }
}

const source = {};
for (const collectionName of collections) {
  source[collectionName] = await fetchCollection(collectionName);
  console.log('Read ' + source[collectionName].length + ' records from ' + collectionName);
}

const mediaReplacements = await migrateMedia(source.media || []);
for (const collectionName of collections) {
  for (const row of source[collectionName]) {
    row.data = replaceUrlsDeep(row.data, mediaReplacements);
    await setDoc({ collectionName, id: row.id }, row.data);
  }
  console.log('Imported ' + source[collectionName].length + ' records into ' + collectionName);
}

console.log('Firebase data copied to Supabase. Existing Firebase records and files were left untouched.');
console.log('Admin sessions were intentionally not copied; current sessions must sign in again.');
