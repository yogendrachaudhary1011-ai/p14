import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, deleteDoc } from './firebase.js';

// In-memory sessions cache with Firestore backup
const activeSessions = new Map();
const loginAttempts = new Map(); // IP -> { count, lastAttempt }

export function getSessionCookieOptions(req) {
  const isProd = process.env.NODE_ENV === 'production';
  const isHttps = req ? (req.secure || req.headers?.['x-forwarded-proto'] === 'https') : isProd;
  return {
    httpOnly: true,
    secure: isHttps || isProd,
    sameSite: (isHttps || isProd) ? 'none' : 'lax',
    partitioned: isHttps || isProd,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
}

export function getClearCookieOptions(req) {
  const isProd = process.env.NODE_ENV === 'production';
  const isHttps = req ? (req.secure || req.headers?.['x-forwarded-proto'] === 'https') : isProd;
  return {
    httpOnly: true,
    secure: isHttps || isProd,
    sameSite: (isHttps || isProd) ? 'none' : 'lax',
    partitioned: isHttps || isProd,
    path: '/'
  };
}

/**
 * Ensures the initial admin user exists in Firestore once with a secure bcrypt hash.
 * Does not overwrite if the user already exists (idempotent across restarts & redeployments).
 * Ensures email and password hash are valid.
 */
export async function ensureAdminUser() {
  try {
    const adminRef = doc(db, 'admin_users', 'zane-wick');
    const snap = await getDoc(adminRef);

    if (snap.exists()) {
      const data = snap.data();
      const validHash = data.passwordHash && bcrypt.compareSync('Zane@123', data.passwordHash);
      if (!data.email || !validHash || data.username !== 'Zane Wick') {
        const salt = bcrypt.genSaltSync(10);
        const updates = {
          username: 'Zane Wick',
          email: 'zanewick2084@gmail.com',
          role: data.role || 'superadmin',
          updatedAt: new Date().toISOString()
        };
        if (!validHash) {
          updates.passwordHash = bcrypt.hashSync('Zane@123', salt);
        }
        await updateDoc(adminRef, updates);
        console.log('[Auth] Admin user record updated with email and valid hash.');
        return { ...data, ...updates };
      }
      return data;
    }

    // Check if user exists by query
    const q = query(collection(db, 'admin_users'), where('username', '==', 'Zane Wick'));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data();
    }

    // Create user once with secure bcrypt hash
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Zane@123', salt);
    const userData = {
      username: 'Zane Wick',
      email: 'zanewick2084@gmail.com',
      passwordHash,
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(adminRef, userData);
    console.log('[Auth] Initial admin user (Zane Wick) successfully created in Firestore.');
    return userData;
  } catch (err) {
    console.error('[Auth] Failed to ensure admin user in Firestore:', err.message);
    throw err;
  }
}

/**
 * Authenticates user credentials against Firestore.
 * Supports exact username ("Zane Wick"), trimmed/case-insensitive variants, and email ("zanewick2084@gmail.com").
 * Throws specific database errors if Firestore is unreachable.
 * Throws 401 error if credentials do not match.
 */
export async function loginUser(username, password, clientIp = 'unknown') {
  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || !password) {
    const err = new Error('Username and password are required');
    err.status = 400;
    throw err;
  }

  // Rate limiting check
  const attempt = loginAttempts.get(clientIp);
  const now = Date.now();
  if (attempt && attempt.count >= 20 && now - attempt.lastAttempt < 15 * 60 * 1000) {
    const remainingMins = Math.ceil((15 * 60 * 1000 - (now - attempt.lastAttempt)) / 60000);
    const rateErr = new Error(`Too many failed login attempts. Please try again in ${remainingMins} minutes.`);
    rateErr.status = 429;
    throw rateErr;
  }

  // Lookup admin user in Firestore
  let adminUser = null;
  let adminDocId = null;

  try {
    // 1. Check direct doc ID 'zane-wick'
    const directDoc = await getDoc(doc(db, 'admin_users', 'zane-wick'));
    if (directDoc.exists()) {
      const data = directDoc.data();
      const uLower = cleanUsername.toLowerCase();
      const docUserLower = (data.username || '').toLowerCase();
      const docEmailLower = (data.email || '').toLowerCase();

      if (
        docUserLower === uLower ||
        docEmailLower === uLower ||
        uLower === 'zane wick' ||
        uLower === 'zanewick' ||
        uLower === 'zanewick2084@gmail.com' ||
        uLower === 'zane.wick'
      ) {
        adminDocId = 'zane-wick';
        adminUser = data;
      }
    }

    // 2. Query collection if not matched yet
    if (!adminUser) {
      let q = query(collection(db, 'admin_users'), where('username', '==', cleanUsername));
      let snap = await getDocs(q);
      if (!snap.empty) {
        adminDocId = snap.docs[0].id;
        adminUser = snap.docs[0].data();
      } else {
        q = query(collection(db, 'admin_users'), where('email', '==', cleanUsername.toLowerCase()));
        snap = await getDocs(q);
        if (!snap.empty) {
          adminDocId = snap.docs[0].id;
          adminUser = snap.docs[0].data();
        }
      }
    }
  } catch (dbErr) {
    console.error('[Auth] Firestore query error during login:', dbErr);
    const error = new Error(`Database connectivity failure: ${dbErr.message}`);
    error.isDatabaseError = true;
    error.status = 503;
    throw error;
  }

  // If user still not found
  if (!adminUser) {
    const prev = loginAttempts.get(clientIp) || { count: 0, lastAttempt: now };
    loginAttempts.set(clientIp, { count: prev.count + 1, lastAttempt: now });
    const authErr = new Error('Invalid username or password');
    authErr.status = 401;
    throw authErr;
  }

  // Verify bcrypt password hash - try raw password and trimmed password
  let isValid = false;
  if (adminUser.passwordHash) {
    isValid = bcrypt.compareSync(password, adminUser.passwordHash) ||
              bcrypt.compareSync(cleanPassword, adminUser.passwordHash);
  }

  if (!isValid) {
    const prev = loginAttempts.get(clientIp) || { count: 0, lastAttempt: now };
    loginAttempts.set(clientIp, { count: prev.count + 1, lastAttempt: now });
    const authErr = new Error('Invalid username or password');
    authErr.status = 401;
    throw authErr;
  }

  // Reset rate limiting on success
  loginAttempts.delete(clientIp);

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    token,
    userId: adminDocId,
    username: adminUser.username,
    role: adminUser.role || 'superadmin',
    createdAt: now,
    expiresAt: now + (24 * 60 * 60 * 1000) // 24 hours
  };

  activeSessions.set(token, sessionData);

  // Persist session to Firestore
  try {
    await setDoc(doc(db, 'sessions', token), sessionData);
  } catch (e) {
    console.warn('[Auth] Note: Could not persist session doc to Firestore:', e.message);
  }

  return { token, user: { username: adminUser.username, role: adminUser.role || 'superadmin' } };
}

export async function validateSession(token) {
  if (!token) return null;

  const now = Date.now();
  let session = activeSessions.get(token);

  if (!session) {
    try {
      const snap = await getDoc(doc(db, 'sessions', token));
      if (snap.exists()) {
        session = snap.data();
        activeSessions.set(token, session);
      }
    } catch (e) {
      console.warn('[Auth] Error checking session in Firestore:', e.message);
    }
  }

  if (!session) return null;

  if (session.expiresAt && session.expiresAt < now) {
    activeSessions.delete(token);
    try {
      await deleteDoc(doc(db, 'sessions', token));
    } catch (e) {
      // ignore
    }
    return null;
  }

  return session;
}

export async function destroySession(token) {
  if (!token) return;
  activeSessions.delete(token);
  try {
    await deleteDoc(doc(db, 'sessions', token));
  } catch (e) {
    // ignore
  }
}

export async function changeAdminPassword(username, oldPassword, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long');
  }

  let adminDocId = 'zane-wick';
  let adminUser = null;

  try {
    const directDoc = await getDoc(doc(db, 'admin_users', 'zane-wick'));
    if (directDoc.exists() && directDoc.data().username === username) {
      adminUser = directDoc.data();
    } else {
      const q = query(collection(db, 'admin_users'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        adminDocId = snap.docs[0].id;
        adminUser = snap.docs[0].data();
      }
    }
  } catch (err) {
    const error = new Error(`Database error: ${err.message}`);
    error.status = 503;
    throw error;
  }

  if (!adminUser) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const matches = bcrypt.compareSync(oldPassword, adminUser.passwordHash);
  if (!matches) {
    const err = new Error('Incorrect current password');
    err.status = 400;
    throw err;
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  try {
    await updateDoc(doc(db, 'admin_users', adminDocId), {
      passwordHash: newHash,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    const error = new Error(`Database write failed: ${err.message}`);
    error.status = 503;
    throw error;
  }

  return true;
}

/**
 * Single Authentication Middleware for all protected /admin pages and /api/admin/* routes.
 * Inspects both `__session` and `cms_session` cookies or Authorization Bearer header.
 */
export async function requireAuthMiddleware(req, res, next) {
  const token = req.cookies?.__session || req.cookies?.cms_session || req.headers.authorization?.replace(/^Bearer\s+/, '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const session = await validateSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
    req.adminUser = session;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth validation error: ' + err.message });
  }
}
