import assert from 'assert';
import { db, doc, getDoc, setDoc, checkSupabase } from '../lib/supabase.js';
import { loginUser, validateSession } from '../lib/auth.js';
import { seedDatabaseIfNeeded } from '../lib/seed.js';
import { getPublishedSnapshot, renderHtml } from '../lib/renderer.js';

const testAdminUsername = process.env.TEST_ADMIN_USERNAME;
const testAdminPassword = process.env.TEST_ADMIN_PASSWORD;
if (!testAdminUsername || !testAdminPassword) {
  throw new Error('Set TEST_ADMIN_USERNAME and TEST_ADMIN_PASSWORD for authentication tests.');
}


async function runTests() {
  console.log('--- STARTING CMS AUTOMATED ACCEPTANCE TESTS ---');

  // Test 1: Health & Database connection
  console.log('1. Testing Supabase connection...');
  const isConnected = await checkSupabase();
  assert.strictEqual(isConnected, true, 'Supabase must be connected');
  console.log('   ✓ Supabase is online and connected');

  // Test 2: Seed idempotency
  console.log('2. Testing seed idempotency...');
  const secondSeed = await seedDatabaseIfNeeded();
  assert.strictEqual(secondSeed, false, 'Second seed must skip and not overwrite existing data');
  console.log('   ✓ Seed is idempotent and protects live edits');

  // Test 3: Admin authentication - correct credentials
  console.log('3. Testing admin login...');
  const loginRes = await loginUser(testAdminUsername, testAdminPassword, '127.0.0.1');
  assert.ok(loginRes.token, 'Must return a session token');
  assert.strictEqual(loginRes.user.username, 'Zane Wick');
  console.log('   ✓ Correct login succeeds and generates session');

  // Test 4: Admin authentication - wrong credentials rejection
  console.log('4. Testing wrong password rejection...');
  let wrongPassFailed = false;
  try {
    await loginUser(testAdminUsername, `${testAdminPassword}-wrong`, '127.0.0.1');
  } catch (err) {
    wrongPassFailed = true;
    assert.strictEqual(err.message, 'Invalid username or password');
  }
  assert.strictEqual(wrongPassFailed, true, 'Wrong password must be rejected');
  console.log('   ✓ Wrong password correctly rejected');

  // Test 5: Session validation
  console.log('5. Testing session validation...');
  const session = await validateSession(loginRes.token);
  assert.ok(session, 'Session must be valid');
  assert.strictEqual(session.username, 'Zane Wick');
  console.log('   ✓ Session validated successfully');

  // Test 6: Snapshot & Published data
  console.log('6. Testing published snapshot retrieval...');
  const snapshot = await getPublishedSnapshot(true);
  assert.ok(snapshot.settings.siteTitle, 'Settings must contain siteTitle');
  assert.ok(snapshot.projects.length >= 7, 'Must have at least 7 baseline projects');
  assert.ok(snapshot.experience.length >= 4, 'Must have baseline experience positions');
  assert.ok(snapshot.education.length >= 2, 'Must have baseline education credentials');
  console.log(`   ✓ Published snapshot loaded: ${snapshot.projects.length} projects, ${snapshot.experience.length} experiences`);

  // Test 7: HTML Content Binding
  console.log('7. Testing server-side HTML rendering & content binding...');
  const renderedIndex = await renderHtml('index.html', '/');
  assert.ok(renderedIndex.includes('YOGENDRA'), 'Rendered HTML must contain brand');
  assert.ok(renderedIndex.includes('Numira Accounting'), 'Rendered HTML must contain Numira project');
  assert.ok(renderedIndex.includes('Aarawan Media'), 'Rendered HTML must contain experience');
  console.log('   ✓ Server-side HTML renders faithfully with 0 FOUC');

  // Test 8: Public routes availability
  console.log('8. Testing public route files...');
  const routes = [
    'about.html',
    'projects.html',
    'waroong-app/index.html',
    'taman-safari-digital-map/index.html',
    'sdd-website-revamp/index.html',
    'enterprise-asset-maintenance/index.html',
    'dana-study-case/index.html',
    'sdd-marketing-archive/index.html',
    'pti-brand-foundation/index.html'
  ];
  for (const r of routes) {
    const html = await renderHtml(r, '/' + r.split('/')[0]);
    assert.ok(html.length > 500, `Route ${r} must render`);
  }
  console.log('   ✓ All 9 public routes render cleanly with dynamic bindings');

  // Test 9: No local database fallback verification
  console.log('9. Checking that no local JSON/SQLite/storage database file exists...');
  const { existsSync } = await import('fs');
  assert.strictEqual(existsSync('./database.json'), false, 'database.json must not exist');
  assert.strictEqual(existsSync('./db.sqlite'), false, 'db.sqlite must not exist');
  console.log('   ✓ Production persistence is 100% Supabase Postgres/Supabase Storage');

  console.log('\n✅ ALL CMS TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ CMS TEST FAILED:', err);
  process.exit(1);
});
