import { checkFirestore, checkStorage, firestoreDatabaseId, config } from '../lib/firebase.js';

async function doctor() {
  console.log('=== YOGENDRA CMS SYSTEM DIAGNOSTICS ===');
  console.log(`Active Project: ${config.projectId}`);
  console.log(`Firestore Database ID: ${firestoreDatabaseId}`);
  console.log(`Storage Bucket: ${config.storageBucket}`);

  console.log('\nChecking connectivity...');
  const dbOk = await checkFirestore();
  console.log(`Firestore: ${dbOk ? '✓ Connected & operational' : '✗ Unreachable'}`);

  const storageOk = await checkStorage();
  console.log(`Storage: ${storageOk ? '✓ Connected' : 'ℹ Falling back to Firestore binary storage'}`);

  console.log('\nDiagnostic complete.');
  process.exit(dbOk ? 0 : 1);
}

doctor();
