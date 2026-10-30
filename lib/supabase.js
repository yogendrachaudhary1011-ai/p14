const COLLECTIONS = new Set([
  'site_settings', 'pages', 'projects', 'experience', 'education',
  'navigation', 'social_links', 'admin_users', 'sessions', 'media',
  'backups', 'system_metadata'
]);

export const db = Object.freeze({ provider: 'supabase' });
export const supabaseProjectUrl = process.env.SUPABASE_URL || '';
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const mediaBucket = process.env.SUPABASE_MEDIA_BUCKET || 'portfolio-media';

function requireConfig() {
  if (!supabaseProjectUrl || !secretKey) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment.');
  }
  return { url: supabaseProjectUrl.replace(/\/+$/, ''), key: secretKey };
}

function assertCollection(name) {
  if (!COLLECTIONS.has(name)) throw new Error('Unsupported data collection: ' + name);
}

function headers(extra = {}) {
  const { key } = requireConfig();
  return { apikey: key, Authorization: 'Bearer ' + key, ...extra };
}

async function requestJson(resource, { method = 'GET', body, prefer, storage = false } = {}) {
  const { url } = requireConfig();
  const endpoint = storage
    ? url + '/storage/v1/' + resource.replace(/^\/+/, '')
    : url + '/rest/v1/' + resource.replace(/^\/+/, '');
  const requestHeaders = headers(body === undefined ? {} : { 'Content-Type': 'application/json' });
  if (prefer) requestHeaders.Prefer = prefer;
  const response = await fetch(endpoint, {
    method,
    headers: requestHeaders,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error('Supabase request failed (' + response.status + '): ' + text.slice(0, 400));
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function tableQuery(params = {}) {
  return 'app_documents?' + new URLSearchParams(params).toString();
}

export function doc(_database, collectionName, id) {
  assertCollection(collectionName);
  return { collectionName, id: String(id) };
}

export function collection(_database, collectionName) {
  assertCollection(collectionName);
  return { collectionName, filters: [], ordering: null, maxResults: null };
}

export function where(field, operator, value) {
  return { kind: 'where', field, operator, value };
}

export function orderBy(field, direction = 'asc') {
  return { kind: 'orderBy', field, direction };
}

export function limit(value) {
  return { kind: 'limit', value: Number(value) };
}

export function query(collectionRef, ...constraints) {
  const result = {
    collectionName: collectionRef.collectionName,
    filters: [...(collectionRef.filters || [])],
    ordering: collectionRef.ordering || null,
    maxResults: collectionRef.maxResults || null
  };
  for (const constraint of constraints.flat()) {
    if (constraint?.kind === 'where') result.filters.push(constraint);
    if (constraint?.kind === 'orderBy') result.ordering = constraint;
    if (constraint?.kind === 'limit') result.maxResults = constraint.value;
  }
  return result;
}

class DocumentSnapshot {
  constructor(id, data) {
    this.id = id;
    this._data = data;
  }
  exists() { return this._data !== undefined && this._data !== null; }
  data() { return this._data; }
}

class QuerySnapshot {
  constructor(rows) {
    this.docs = rows.map(row => new DocumentSnapshot(row.id, row.data));
    this.empty = this.docs.length === 0;
    this.size = this.docs.length;
  }
  forEach(callback) { this.docs.forEach(callback); }
}

export async function getDoc(reference) {
  const rows = await requestJson(tableQuery({
    select: 'id,data',
    collection_name: 'eq.' + reference.collectionName,
    id: 'eq.' + reference.id,
    limit: '1'
  }));
  return new DocumentSnapshot(rows?.[0]?.id, rows?.[0]?.data);
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function setDoc(reference, data, options = {}) {
  const current = options.merge ? ((await getDoc(reference)).data() || {}) : {};
  const value = options.merge ? deepMerge(current, data) : data;
  const record = {
    collection_name: reference.collectionName,
    id: reference.id,
    data: value,
    updated_at: new Date().toISOString()
  };
  await requestJson(tableQuery({ on_conflict: 'collection_name,id' }), {
    method: 'POST',
    body: record,
    prefer: 'resolution=merge-duplicates,return=minimal'
  });
}

export async function updateDoc(reference, changes) {
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) throw new Error('Document not found: ' + reference.collectionName + '/' + reference.id);
  const data = { ...snapshot.data(), ...changes };
  await requestJson(tableQuery({
    collection_name: 'eq.' + reference.collectionName,
    id: 'eq.' + reference.id
  }), {
    method: 'PATCH',
    body: { data, updated_at: new Date().toISOString() },
    prefer: 'return=minimal'
  });
}

export async function deleteDoc(reference) {
  await requestJson(tableQuery({
    collection_name: 'eq.' + reference.collectionName,
    id: 'eq.' + reference.id
  }), { method: 'DELETE', prefer: 'return=minimal' });
}

function readField(object, field) {
  return String(field).split('.').reduce((value, key) => value?.[key], object);
}

function matchesFilter(data, filter) {
  const left = readField(data, filter.field);
  const right = filter.value;
  switch (filter.operator) {
    case '==':
    case '===': return left === right;
    case '!=':
    case '!==': return left !== right;
    case '>': return left > right;
    case '>=': return left >= right;
    case '<': return left < right;
    case '<=': return left <= right;
    case 'array-contains': return Array.isArray(left) && left.includes(right);
    default: throw new Error('Unsupported query operator: ' + filter.operator);
  }
}

export async function getDocs(reference) {
  const collectionName = reference.collectionName;
  assertCollection(collectionName);
  const rows = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const page = await requestJson(tableQuery({
      select: 'id,data',
      collection_name: 'eq.' + collectionName,
      order: 'id.asc',
      limit: String(pageSize),
      offset: String(offset)
    }));
    rows.push(...(page || []));
    if (!page || page.length < pageSize) break;
    offset += pageSize;
  }
  let filtered = rows.filter(row =>
    (reference.filters || []).every(filter => matchesFilter(row.data || {}, filter))
  );
  const ordering = reference.ordering;
  if (ordering) {
    const sign = ordering.direction === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const left = readField(a.data || {}, ordering.field);
      const right = readField(b.data || {}, ordering.field);
      if (left === undefined || left === null) return right === undefined || right === null ? 0 : 1;
      if (right === undefined || right === null) return -1;
      if (left < right) return -1 * sign;
      if (left > right) return 1 * sign;
      return 0;
    });
  }
  if (Number.isFinite(reference.maxResults) && reference.maxResults >= 0) {
    filtered = filtered.slice(0, reference.maxResults);
  }
  return new QuerySnapshot(filtered);
}

export function writeBatch() {
  const operations = [];
  return {
    set(reference, data, options = {}) {
      operations.push({ op: 'set', collection: reference.collectionName, id: reference.id, data, merge: Boolean(options.merge) });
    },
    update(reference, data) {
      operations.push({ op: 'update', collection: reference.collectionName, id: reference.id, data });
    },
    delete(reference) {
      operations.push({ op: 'delete', collection: reference.collectionName, id: reference.id });
    },
    async commit() {
      if (!operations.length) return;
      await requestJson('rpc/cms_apply_document_batch', {
        method: 'POST',
        body: { p_operations: operations },
        prefer: 'return=minimal'
      });
    }
  };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export async function checkSupabase() {
  try {
    await requestJson(tableQuery({ select: 'id', limit: '1' }));
    return true;
  } catch (error) {
    console.error('[Supabase] Database connectivity check failed:', error.message);
    return false;
  }
}

export async function checkSupabaseStorage() {
  try {
    await requestJson('bucket/' + encodeURIComponent(mediaBucket), { storage: true });
    return true;
  } catch (error) {
    console.warn('[Supabase] Storage bucket check failed:', error.message);
    return false;
  }
}

function encodeObjectPath(path) {
  return String(path).split('/').map(encodeURIComponent).join('/');
}

export function getPublicStorageUrl(path) {
  const { url } = requireConfig();
  return url + '/storage/v1/object/public/' + encodeURIComponent(mediaBucket) + '/' + encodeObjectPath(path);
}

export async function uploadStorageObject(path, bytes, mimeType) {
  const { url } = requireConfig();
  const response = await fetch(url + '/storage/v1/object/' + encodeURIComponent(mediaBucket) + '/' + encodeObjectPath(path), {
    method: 'POST',
    headers: headers({ 'Content-Type': mimeType || 'application/octet-stream', 'x-upsert': 'true' }),
    body: Buffer.from(bytes)
  });
  const text = await response.text();
  if (!response.ok) throw new Error('Supabase Storage upload failed (' + response.status + '): ' + text.slice(0, 400));
  return getPublicStorageUrl(path);
}

export async function deleteStorageObject(path) {
  await requestJson('object/' + encodeURIComponent(mediaBucket), {
    method: 'DELETE',
    storage: true,
    body: { prefixes: [String(path)] }
  });
}

export async function downloadStorageObject(path) {
  const { url } = requireConfig();
  const response = await fetch(url + '/storage/v1/object/' + encodeURIComponent(mediaBucket) + '/' + encodeObjectPath(path), {
    headers: headers()
  });
  if (!response.ok) throw new Error('Supabase Storage download failed (' + response.status + ').');
  return Buffer.from(await response.arrayBuffer());
}
