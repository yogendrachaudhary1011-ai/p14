import { checkSupabase, checkSupabaseStorage, supabaseProjectUrl, supabaseConfig } from '../lib/supabase.js';

async function doctor() {
  console.log('=== YOGENDRA CMS SYSTEM DIAGNOSTICS ===');
  console.log(`Active Project: ${supabaseConfig.projectId}`);
  console.log(`Supabase project: ${supabaseProjectUrl || 'not configured'}`);
  console.log(`Storage Bucket: ${supabaseConfig.storageBucket}`);

  console.log('\nChecking connectivity...');
  const dbOk = await checkSupabase();
  console.log(`Supabase database: ${dbOk ? '✓ Connected & operational' : '✗ Unreachable'}`);

  const storageOk = await checkSupabaseStorage();
  console.log(`Storage: ${storageOk ? '✓ Connected' : '✗ Supabase Storage unavailable'}`);

  console.log('\nDiagnostic complete.');
  process.exit(dbOk ? 0 : 1);
}

doctor();
