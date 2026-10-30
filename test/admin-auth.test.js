import http from 'http';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Admin Authentication System Tests ---');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Initial State: /api/admin/me without credentials
    const meInitial = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/me',
      method: 'GET'
    });
    assert(meInitial.statusCode === 200, 'GET /api/admin/me returns 200');
    assert(meInitial.json?.authenticated === false, 'GET /api/admin/me returns authenticated: false when logged out');

    // 2. Protected Route without session returns 401
    const protectedInitial = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/overview',
      method: 'GET'
    });
    assert(protectedInitial.statusCode === 401, 'Protected route /api/admin/overview returns 401 when unauthenticated');

    // 3. Login with wrong password returns 401
    const wrongLogin = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'Zane Wick', password: 'WrongPassword123' });
    assert(wrongLogin.statusCode === 401, 'Login with wrong password returns 401');
    assert(wrongLogin.json?.error === 'Invalid username or password', 'Returns proper invalid credentials error message');

    // 4. Login with correct credentials: Zane Wick / Zane@123
    const correctLogin = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'Zane Wick', password: 'Zane@123' });

    assert(correctLogin.statusCode === 200, 'Login with Zane Wick / Zane@123 returns 200');
    assert(correctLogin.json?.success === true, 'Login response has success: true');
    assert(correctLogin.json?.user?.username === 'Zane Wick', 'Login returns user username "Zane Wick"');

    // Check Set-Cookie header contains __session
    const rawCookies = correctLogin.headers['set-cookie'] || [];
    const sessionCookieStr = rawCookies.find(c => c.startsWith('__session='));
    assert(!!sessionCookieStr, 'Set-Cookie contains __session cookie');
    assert(sessionCookieStr?.includes('HttpOnly'), '__session cookie is HttpOnly');
    assert(sessionCookieStr?.includes('Path=/'), '__session cookie path is /');
    assert(sessionCookieStr?.toLowerCase().includes('samesite=lax'), '__session cookie sameSite is Lax');

    // Extract cookie value for subsequent requests
    const cookieHeader = sessionCookieStr ? sessionCookieStr.split(';')[0] : '';

    // 5. Verify /api/admin/me with session cookie
    const meVerified = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/me',
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    assert(meVerified.statusCode === 200, 'GET /api/admin/me with session returns 200');
    assert(meVerified.json?.authenticated === true, 'GET /api/admin/me confirms authenticated: true');
    assert(meVerified.json?.user?.username === 'Zane Wick', 'Active user matches "Zane Wick"');

    // 6. Access protected routes with session cookie
    const overviewRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    assert(overviewRes.statusCode === 200, 'GET /api/admin/overview returns 200 with active session');
    assert(overviewRes.json?.stats !== undefined, 'Overview returns stats');

    const settingsRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/settings',
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    assert(settingsRes.statusCode === 200, 'GET /api/admin/settings returns 200 with active session');

    const projectsRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/projects',
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    assert(projectsRes.statusCode === 200, 'GET /api/admin/projects returns 200 with active session');
    assert(Array.isArray(projectsRes.json), 'Projects returns array');

    // 7. Logout clears session
    const logoutRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/logout',
      method: 'POST',
      headers: { 'Cookie': cookieHeader }
    });
    assert(logoutRes.statusCode === 200, 'POST /api/admin/logout returns 200');
    const logoutCookies = logoutRes.headers['set-cookie'] || [];
    const clearedSession = logoutCookies.find(c => c.startsWith('__session=;'));
    assert(!!clearedSession, 'Logout clears __session cookie');

    // 8. Verify session is invalidated after logout
    const postLogoutProtected = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    assert(postLogoutProtected.statusCode === 401, 'Protected route returns 401 after logout');

    const postLogoutMe = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/me',
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    assert(postLogoutMe.json?.authenticated === false, 'GET /api/admin/me returns authenticated: false after logout');

    console.log(`\n--- Test Summary: ${passCount} passed, ${failCount} failed ---`);
    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
