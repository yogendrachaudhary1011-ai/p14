import crypto from 'crypto';
import { 
  db, 
  storage, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  collection, 
  getDocs, 
  Bytes 
} from './firebase.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firestore documents have a 1 MiB ceiling. Leave room for field metadata and
// Firestore's document encoding when Storage is unavailable.
const FIRESTORE_BINARY_LIMIT = 700 * 1024;

export async function processUploadedFile(file, options = {}) {
  if (!file) throw new Error('No file provided');

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'video/mp4',
    'video/webm'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not permitted.`);
  }

  const id = `media-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `uploads/${Date.now()}-${safeName}`;
  const isResume = options.isResume || file.mimetype === 'application/pdf' && options.category === 'resume';

  let finalUrl = '';
  let storageType = 'firebase_storage';

  // Try Firebase Storage first
  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
      customMetadata: { originalName: safeName }
    });
    finalUrl = await getDownloadURL(storageRef);
    console.log('[Media] Successfully uploaded to Firebase Storage:', finalUrl);
  } catch (storageErr) {
    console.warn('[Media] Firebase Storage bucket unavailable. Storing binary in Firestore:', storageErr.message);
    if (file.size > FIRESTORE_BINARY_LIMIT) {
      throw new Error('Image storage is unavailable and this file is too large for the fallback store. Choose an image under 700 KB; large video and PDF uploads need Firebase Storage enabled.');
    }
    // Safe Firebase Firestore binary fallback
    storageType = 'firestore_binary';
    const blobRef = doc(db, 'media_blobs', id);
    await setDoc(blobRef, {
      data: Bytes.fromUint8Array(file.buffer),
      mimeType: file.mimetype,
      name: safeName,
      createdAt: new Date().toISOString()
    });
    finalUrl = `/api/media/blob/${id}`;
  }

  // Create metadata record in Firestore
  const mediaDocRef = doc(db, 'media', id);
  const metadata = {
    id,
    name: file.originalname,
    url: finalUrl,
    storagePath,
    storageType,
    mimeType: file.mimetype,
    size: file.size,
    alt: options.alt || file.originalname,
    category: isResume ? 'resume' : (options.category || 'uploads'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(mediaDocRef, metadata);

  // If this was a resume upload, immediately update the site_settings.resumeUrl
  if (isResume) {
    const { updateDoc } = await import('./firebase.js');
    await updateDoc(doc(db, 'site_settings', 'general'), {
      resumeUrl: finalUrl,
      updatedAt: new Date().toISOString()
    });
  }

  return metadata;
}

export async function getMediaBlob(id) {
  const blobDoc = await getDoc(doc(db, 'media_blobs', id));
  if (!blobDoc.exists()) return null;
  const data = blobDoc.data();
  return {
    buffer: data.data.toUint8Array(),
    mimeType: data.mimeType || 'application/octet-stream',
    name: data.name
  };
}

export async function deleteMediaItem(id) {
  const mediaDoc = await getDoc(doc(db, 'media', id));
  if (!mediaDoc.exists()) {
    throw new Error('Media item not found');
  }

  const mediaData = mediaDoc.data();

  // Check if media is in use
  const inUse = await checkMediaUsage(mediaData.url);
  if (inUse.length > 0) {
    throw new Error(`Cannot delete media: it is currently used in ${inUse.join(', ')}`);
  }

  // Delete from storage
  if (mediaData.storageType === 'firebase_storage') {
    try {
      const storageRef = ref(storage, mediaData.storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('[Media] Could not delete from Firebase Storage:', e.message);
    }
  } else if (mediaData.storageType === 'firestore_binary') {
    try {
      await deleteDoc(doc(db, 'media_blobs', id));
    } catch (e) {
      // ignore
    }
  }

  // Delete metadata document
  await deleteDoc(doc(db, 'media', id));
  return true;
}

export async function replaceMediaItem(id, file) {
  if (!file) throw new Error('No replacement file provided');
  if (!file.mimetype.startsWith('image/')) throw new Error('Replacement must be an image file');

  const mediaRef = doc(db, 'media', id);
  const mediaSnap = await getDoc(mediaRef);
  if (!mediaSnap.exists()) throw new Error('Media item not found');
  const previous = mediaSnap.data();
  if (!previous.mimeType?.startsWith('image/')) throw new Error('Only image assets can be replaced');

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `uploads/${Date.now()}-${safeName}`;
  let finalUrl = '';
  let storageType = 'firebase_storage';

  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
      customMetadata: { originalName: safeName }
    });
    finalUrl = await getDownloadURL(storageRef);
  } catch (storageErr) {
    console.warn('[Media] Firebase Storage unavailable during replacement; using Firestore binary:', storageErr.message);
    if (file.size > FIRESTORE_BINARY_LIMIT) {
      throw new Error('Image storage is unavailable and this replacement is too large for the fallback store. Choose an image under 700 KB.');
    }
    storageType = 'firestore_binary';
    await setDoc(doc(db, 'media_blobs', id), {
      data: Bytes.fromUint8Array(file.buffer),
      mimeType: file.mimetype,
      name: safeName,
      createdAt: new Date().toISOString()
    });
    finalUrl = `/api/media/blob/${id}`;
  }

  await replaceMediaReferences(previous.url, finalUrl);

  const metadata = {
    ...previous,
    id,
    name: file.originalname,
    url: finalUrl,
    storagePath,
    storageType,
    mimeType: file.mimetype,
    size: file.size,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(mediaRef, metadata);

  if (previous.storageType === 'firebase_storage' && previous.storagePath) {
    try {
      await deleteObject(ref(storage, previous.storagePath));
    } catch (err) {
      console.warn('[Media] Could not remove replaced image from Firebase Storage:', err.message);
    }
  } else if (previous.storageType === 'firestore_binary' && storageType !== 'firestore_binary') {
    await deleteDoc(doc(db, 'media_blobs', id)).catch(() => {});
  }

  return metadata;
}

async function replaceMediaReferences(oldUrl, newUrl) {
  if (!oldUrl || oldUrl === newUrl) return;

  const [settingsSnap, homeSnap, projectsSnap] = await Promise.all([
    getDoc(doc(db, 'site_settings', 'general')),
    getDoc(doc(db, 'pages', 'home')),
    getDocs(collection(db, 'projects'))
  ]);
  const writes = [];
  const scheduleChangedFields = (documentRef, data) => {
    const replaced = replaceUrlDeep(data, oldUrl, newUrl);
    const changes = {};
    for (const [key, value] of Object.entries(replaced)) {
      if (JSON.stringify(value) !== JSON.stringify(data[key])) changes[key] = value;
    }
    if (Object.keys(changes).length) writes.push(updateDoc(documentRef, changes));
  };

  if (settingsSnap.exists()) scheduleChangedFields(doc(db, 'site_settings', 'general'), settingsSnap.data());
  if (homeSnap.exists()) scheduleChangedFields(doc(db, 'pages', 'home'), homeSnap.data());
  projectsSnap.forEach(projectSnap => scheduleChangedFields(doc(db, 'projects', projectSnap.id), projectSnap.data()));

  await Promise.all(writes);
}

function replaceUrlDeep(value, oldUrl, newUrl) {
  if (value === oldUrl) return newUrl;
  if (Array.isArray(value)) return value.map(item => replaceUrlDeep(item, oldUrl, newUrl));
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceUrlDeep(child, oldUrl, newUrl)]));
  }
  return value;
}

export async function checkMediaUsage(url) {
  const usedIn = [];
  try {
    const settingsSnap = await getDoc(doc(db, 'site_settings', 'general'));
    if (settingsSnap.exists()) {
      const s = settingsSnap.data();
      if (s.resumeUrl === url) usedIn.push('Resume Link');
      if (s.seo?.ogImage === url) usedIn.push('SEO OpenGraph Image');
    }

    const homeSnap = await getDoc(doc(db, 'pages', 'home'));
    if (homeSnap.exists()) {
      const h = homeSnap.data();
      if (h.idCard?.photo === url) usedIn.push('Homepage ID Card');
      if (h.aboutSection?.videoSrc === url) usedIn.push('About Video');
      if (h.aboutSection?.videoPoster === url) usedIn.push('About Video Poster');
    }

    const projSnap = await getDocs(collection(db, 'projects'));
    projSnap.forEach(d => {
      const p = d.data();
      if (p.coverImage === url) usedIn.push(`Project "${p.title}" Cover`);
    });
  } catch (err) {
    console.warn('[Media] Error checking media usage:', err.message);
  }
  return usedIn;
}


