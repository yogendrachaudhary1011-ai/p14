import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch,
  serverTimestamp,
  Bytes
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config = {};
try {
  const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn('[Firebase] Warning reading config file:', e.message);
}

// Support FIRESTORE_DATABASE_ID env var, default to config.firestoreDatabaseId or ai-studio-pf11-...
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || 
  config.firestoreDatabaseId || 
  'ai-studio-pf11-f733d483-d6eb-49d4-b39f-52d8a40fba86';

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  projectId: config.projectId || process.env.FIREBASE_PROJECT_ID,
  apiKey: config.apiKey || process.env.FIREBASE_API_KEY,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
  appId: config.appId
});

export const db = getFirestore(app, firestoreDatabaseId);
export const storage = getStorage(app);
export { firestoreDatabaseId, config };

// Check Firestore connectivity
export async function checkFirestore() {
  try {
    const testRef = doc(db, 'system_metadata', 'ping');
    await setDoc(testRef, { lastPing: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase] Firestore connectivity check failed:', err.message);
    return false;
  }
}

// Check Storage connectivity
export async function checkStorage() {
  try {
    const testRef = ref(storage, '_health/test.txt');
    const data = new Uint8Array(Buffer.from('ping'));
    await uploadBytes(testRef, data);
    return true;
  } catch (err) {
    return false;
  }
}

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Bytes
};
