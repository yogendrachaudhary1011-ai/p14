import crypto from 'crypto';
import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  uploadStorageObject,
  deleteStorageObject,
  downloadStorageObject
} from './supabase.js';

export async function processUploadedFile(file, options = {}) {
  if (!file) throw new Error('No file provided');
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml', 'application/pdf', 'video/mp4', 'video/webm'
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('File type ' + file.mimetype + ' is not permitted.');
  }

  const id = 'media-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = 'uploads/' + Date.now() + '-' + safeName;
  const isResume = options.isResume || (file.mimetype === 'application/pdf' && options.category === 'resume');
  const finalUrl = await uploadStorageObject(storagePath, file.buffer, file.mimetype);
  const now = new Date().toISOString();

  const metadata = {
    id,
    name: file.originalname,
    url: finalUrl,
    storagePath,
    storageType: 'supabase_storage',
    mimeType: file.mimetype,
    size: file.size,
    alt: options.alt || file.originalname,
    category: isResume ? 'resume' : (options.category || 'uploads'),
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'media', id), metadata);
  if (isResume) {
    await updateDoc(doc(db, 'site_settings', 'general'), {
      resumeUrl: finalUrl,
      updatedAt: now
    });
  }
  return metadata;
}

export async function getMediaBlob(id) {
  const snapshot = await getDoc(doc(db, 'media', id));
  if (!snapshot.exists()) return null;
  const media = snapshot.data();
  if (!media.storagePath) return null;
  return {
    buffer: await downloadStorageObject(media.storagePath),
    mimeType: media.mimeType || 'application/octet-stream',
    name: media.name
  };
}

export async function deleteMediaItem(id) {
  const mediaDoc = await getDoc(doc(db, 'media', id));
  if (!mediaDoc.exists()) throw new Error('Media item not found');
  const mediaData = mediaDoc.data();
  const inUse = await checkMediaUsage(mediaData.url);
  if (inUse.length > 0) throw new Error('Cannot delete media: it is currently used in ' + inUse.join(', '));

  if (mediaData.storageType === 'supabase_storage' && mediaData.storagePath) {
    await deleteStorageObject(mediaData.storagePath);
  }
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
  const storagePath = 'uploads/' + Date.now() + '-' + safeName;
  const finalUrl = await uploadStorageObject(storagePath, file.buffer, file.mimetype);
  try {
    await replaceMediaReferences(previous.url, finalUrl);
    const metadata = {
      ...previous,
      id,
      name: file.originalname,
      url: finalUrl,
      storagePath,
      storageType: 'supabase_storage',
      mimeType: file.mimetype,
      size: file.size,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(mediaRef, metadata);
    if (previous.storageType === 'supabase_storage' && previous.storagePath) {
      await deleteStorageObject(previous.storagePath).catch(error => {
        console.warn('[Media] Could not remove replaced Supabase Storage object:', error.message);
      });
    }
    return metadata;
  } catch (error) {
    await deleteStorageObject(storagePath).catch(() => {});
    throw error;
  }
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
  const settingsSnap = await getDoc(doc(db, 'site_settings', 'general'));
  if (settingsSnap.exists()) {
    const settings = settingsSnap.data();
    if (settings.resumeUrl === url) usedIn.push('Resume Link');
    if (settings.seo?.ogImage === url) usedIn.push('SEO OpenGraph Image');
  }

  const homeSnap = await getDoc(doc(db, 'pages', 'home'));
  if (homeSnap.exists()) {
    const home = homeSnap.data();
    if (home.idCard?.photo === url) usedIn.push('Homepage ID Card');
    if (home.aboutSection?.videoSrc === url) usedIn.push('About Video');
    if (home.aboutSection?.videoPoster === url) usedIn.push('About Video Poster');
  }

  const projectsSnap = await getDocs(collection(db, 'projects'));
  projectsSnap.forEach(snapshot => {
    const project = snapshot.data();
    if (project.coverImage === url) usedIn.push('Project "' + project.title + '" Cover');
  });
  return usedIn;
}
