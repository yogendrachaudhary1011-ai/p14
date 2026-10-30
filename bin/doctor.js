import { checkSupabase, checkSupabaseStorage, supabaseProjectUrl } from '../lib/supabase.js';

async function doctor() {
  console.log('=== YOGENDRA CMS SYSTEM DIAGNOSTICS ===');
  console.log('Supabase project: ' + (supabaseProjectUrl || 'not configured'));
  console.log('\nChecking connectivity...');
  const dbOk = await checkSupabase();
  console.log('Supabase database: ' + (dbOk ? 'connected and operational' : 'unreachable'));

  const storageOk = await checkSupabaseStorage();
  console.log('Supabase Storage: ' + (storageOk ? 'connected' : 'unavailable'));

  console.log('\nDiagnostic complete.');
  process.exit(dbOk ? 0 : 1);
}

doctor();
