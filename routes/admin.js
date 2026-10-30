import express from 'express';
import multer from 'multer';
import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  writeBatch,
  checkSupabase,
  checkSupabaseStorage
} from '../lib/supabase.js';
import { 
  loginUser, 
  validateSession, 
  destroySession, 
  changeAdminPassword, 
  requireAuthMiddleware,
  getSessionCookieOptions,
  getClearCookieOptions
} from '../lib/auth.js';
import { 
  processUploadedFile, 
  replaceMediaItem,
  deleteMediaItem, 
  checkMediaUsage 
} from '../lib/media.js';
import { invalidateCache } from '../lib/renderer.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  // Vercel serverless request bodies are limited to roughly 4.5 MB.
  limits: { fileSize: 4 * 1024 * 1024 }
});
const uploadFile = (req, res, next) => upload.single('file')(req, res, err => {
  if (!err) return next();
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File exceeds the 4 MB upload limit. Large images are optimized in the CMS before upload.' });
  }
  return res.status(400).json({ error: `Could not read the uploaded file: ${err.message}` });
});

// ==================== AUTHENTICATION ====================

const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const { token, user } = await loginUser(username, password, clientIp);

    // Set secure HTTP-only session cookie named __session (standard for Cloud Run / App Hosting proxies)
    const cookieOpts = getSessionCookieOptions(req);
    res.cookie('__session', token, cookieOpts);
    // Backward compatibility with previous cookie name
    res.cookie('cms_session', token, cookieOpts);

    res.json({ success: true, user, token });
  } catch (err) {
    const status = err.status || (err.isDatabaseError ? 503 : 401);
    res.status(status).json({ error: err.message });
  }
};

const handleLogout = async (req, res) => {
  try {
    const token = req.cookies?.__session || req.cookies?.cms_session || req.headers.authorization?.replace(/^Bearer\s+/, '');
    if (token) {
      await destroySession(token);
    }
    const clearOpts = getClearCookieOptions(req);
    res.clearCookie('__session', clearOpts);
    res.clearCookie('cms_session', clearOpts);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleMe = async (req, res) => {
  try {
    const token = req.cookies?.__session || req.cookies?.cms_session || req.headers.authorization?.replace(/^Bearer\s+/, '');
    if (!token) {
      return res.json({ authenticated: false });
    }

    const session = await validateSession(token);
    if (!session) {
      return res.json({ authenticated: false });
    }

    res.json({ 
      authenticated: true, 
      user: { username: session.username, role: session.role } 
    });
  } catch (err) {
    res.status(500).json({ authenticated: false, error: err.message });
  }
};

const handleChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    await changeAdminPassword(req.adminUser.username, oldPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({ error: err.message });
  }
};

router.post('/admin/login', handleLogin);
router.post('/auth/login', handleLogin);

router.post('/admin/logout', handleLogout);
router.post('/auth/logout', handleLogout);

router.get('/admin/me', handleMe);
router.get('/auth/me', handleMe);

router.post('/admin/change-password', requireAuthMiddleware, handleChangePassword);
router.post('/auth/change-password', requireAuthMiddleware, handleChangePassword);

// ==================== DASHBOARD / OVERVIEW ====================

router.get('/admin/overview', requireAuthMiddleware, async (req, res) => {
  try {
    const [projSnap, expSnap, eduSnap, mediaSnap, backupSnap] = await Promise.all([
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'experience')),
      getDocs(collection(db, 'education')),
      getDocs(collection(db, 'media')),
      getDocs(collection(db, 'backups'))
    ]);

    const isDbConnected = await checkSupabase();
    const isStorageConnected = await checkStorage();

    res.json({
      stats: {
        projectsCount: projSnap.size,
        experienceCount: expSnap.size,
        educationCount: eduSnap.size,
        mediaCount: mediaSnap.size,
        backupsCount: backupSnap.size
      },
      health: {
        databaseConnected: isDbConnected,
        storageConnected: isStorageConnected,
        writesAllowed: isDbConnected
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SITE SETTINGS ====================

router.get('/admin/settings', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'general'));
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(snap.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/settings', requireAuthMiddleware, async (req, res) => {
  try {
    const settingsData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'site_settings', 'general'), settingsData, { merge: true });
    invalidateCache();
    res.json({ success: true, data: settingsData });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

// ==================== PAGE CONTENT ====================

router.get('/admin/pages/:pageId', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDoc(doc(db, 'pages', req.params.pageId));
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(snap.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/pages/:pageId', requireAuthMiddleware, async (req, res) => {
  try {
    const pageData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'pages', req.params.pageId), pageData, { merge: true });
    invalidateCache();
    res.json({ success: true, data: pageData });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

// ==================== PROJECTS CRUD ====================

router.get('/admin/projects', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'projects'), orderBy('order', 'asc')));
    const projects = [];
    snap.forEach(d => projects.push({ id: d.id, ...d.data() }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/projects', requireAuthMiddleware, async (req, res) => {
  try {
    const { title, slug, summary, category, order, status, coverImage, year, mediaNote, categoryLabel } = req.body;
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    const projId = cleanSlug;

    // Check if exists
    const existing = await getDoc(doc(db, 'projects', projId));
    if (existing.exists()) {
      return res.status(400).json({ error: `Project with slug '${cleanSlug}' already exists` });
    }

    const projectData = {
      id: projId,
      title,
      slug: cleanSlug,
      summary: summary || '',
      category: category || 'product',
      categoryLabel: categoryLabel || (category === 'archive' ? 'Design Practice' : 'Product Case Study'),
      mediaNote: mediaNote || 'Product design',
      year: year || '2026',
      order: Number(order) || 10,
      status: status || 'published',
      featured: req.body.featured || false,
      coverImage: coverImage || 'assets/media/home-media-03-d6c887bed8af.webp',
      caseStudy: req.body.caseStudy || {},
      coverClass: `cover-${cleanSlug}`,
      route: `/${cleanSlug}`,
      customTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'projects', projId), projectData);
    invalidateCache();
    res.json({ success: true, project: projectData });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

router.put('/admin/projects/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const projRef = doc(db, 'projects', req.params.id);
    const snap = await getDoc(projRef);
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatePayload = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    delete updatePayload.id;

    await updateDoc(projRef, updatePayload);
    invalidateCache();
    res.json({ success: true, message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

router.delete('/admin/projects/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const projRef = doc(db, 'projects', req.params.id);
    const snap = await getDoc(projRef);
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await deleteDoc(projRef);
    invalidateCache();
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: `Supabase delete failed: ${err.message}` });
  }
});

router.post('/admin/projects/reorder', requireAuthMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const batch = writeBatch(db);
    for (const item of items) {
      const ref = doc(db, 'projects', item.id);
      batch.update(ref, { order: Number(item.order), updatedAt: new Date().toISOString() });
    }

    await batch.commit();
    invalidateCache();
    res.json({ success: true, message: 'Projects reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: `Supabase batch write failed: ${err.message}` });
  }
});

// ==================== EXPERIENCE CRUD ====================

router.get('/admin/experience', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'experience'), orderBy('order', 'asc')));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/experience', requireAuthMiddleware, async (req, res) => {
  try {
    const id = `exp-${Date.now()}`;
    const expData = {
      id,
      role: req.body.role || '',
      company: req.body.company || '',
      dates: req.body.dates || '',
      duration: req.body.duration || '',
      current: req.body.current || false,
      headline: req.body.headline || '',
      description: req.body.description || '',
      tags: req.body.tags || [],
      order: Number(req.body.order) || 10,
      visible: req.body.visible !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'experience', id), expData);
    invalidateCache();
    res.json({ success: true, item: expData });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

router.put('/admin/experience/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const ref = doc(db, 'experience', req.params.id);
    const payload = { ...req.body, updatedAt: new Date().toISOString() };
    delete payload.id;
    await updateDoc(ref, payload);
    invalidateCache();
    res.json({ success: true, message: 'Experience item updated' });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

router.delete('/admin/experience/:id', requireAuthMiddleware, async (req, res) => {
  try {
    await deleteDoc(doc(db, 'experience', req.params.id));
    invalidateCache();
    res.json({ success: true, message: 'Experience item deleted' });
  } catch (err) {
    res.status(500).json({ error: `Supabase delete failed: ${err.message}` });
  }
});

// ==================== EDUCATION CRUD ====================

router.get('/admin/education', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'education'), orderBy('order', 'asc')));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/education', requireAuthMiddleware, async (req, res) => {
  try {
    const id = `edu-${Date.now()}`;
    const eduData = {
      id,
      title: req.body.title || '',
      institution: req.body.institution || '',
      location: req.body.location || '',
      dates: req.body.dates || '',
      status: req.body.status || '',
      program: req.body.program || '',
      year: req.body.year || '',
      description: req.body.description || '',
      tags: req.body.tags || [],
      order: Number(req.body.order) || 10,
      visible: req.body.visible !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'education', id), eduData);
    invalidateCache();
    res.json({ success: true, item: eduData });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

router.put('/admin/education/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const ref = doc(db, 'education', req.params.id);
    const payload = { ...req.body, updatedAt: new Date().toISOString() };
    delete payload.id;
    await updateDoc(ref, payload);
    invalidateCache();
    res.json({ success: true, message: 'Education item updated' });
  } catch (err) {
    res.status(500).json({ error: `Supabase write failed: ${err.message}` });
  }
});

router.delete('/admin/education/:id', requireAuthMiddleware, async (req, res) => {
  try {
    await deleteDoc(doc(db, 'education', req.params.id));
    invalidateCache();
    res.json({ success: true, message: 'Education item deleted' });
  } catch (err) {
    res.status(500).json({ error: `Supabase delete failed: ${err.message}` });
  }
});

// ==================== NAVIGATION & SOCIALS ====================

router.get('/admin/navigation', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'navigation'), orderBy('order', 'asc')));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/navigation', requireAuthMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Items array expected' });

    const batch = writeBatch(db);
    for (const item of items) {
      const itemRef = doc(db, 'navigation', item.id || `nav-${Date.now()}`);
      batch.set(itemRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
    }
    await batch.commit();
    invalidateCache();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/socials', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'social_links'), orderBy('order', 'asc')));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/socials', requireAuthMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Items array expected' });

    const batch = writeBatch(db);
    for (const item of items) {
      const itemRef = doc(db, 'social_links', item.id || `soc-${Date.now()}`);
      batch.set(itemRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
    }
    await batch.commit();
    invalidateCache();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MEDIA LIBRARY ====================

router.get('/admin/media', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc')));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/media/upload', requireAuthMiddleware, uploadFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const isResume = req.body.isResume === 'true' || req.body.category === 'resume';
    const metadata = await processUploadedFile(req.file, {
      alt: req.body.alt,
      category: req.body.category,
      isResume
    });

    invalidateCache();
    res.json({ success: true, media: metadata });
  } catch (err) {
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

router.post('/admin/media/:id/replace', requireAuthMiddleware, uploadFile, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No replacement file uploaded' });
    const media = await replaceMediaItem(req.params.id, req.file);
    invalidateCache();
    res.json({ success: true, media });
  } catch (err) {
    res.status(400).json({ error: `Image replacement failed: ${err.message}` });
  }
});

router.put('/admin/media/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const { alt, name, category } = req.body;
    const ref = doc(db, 'media', req.params.id);
    await updateDoc(ref, {
      alt: alt || '',
      name: name || '',
      category: category || 'uploads',
      updatedAt: new Date().toISOString()
    });
    invalidateCache();
    res.json({ success: true, message: 'Media metadata updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/media/:id', requireAuthMiddleware, async (req, res) => {
  try {
    await deleteMediaItem(req.params.id);
    invalidateCache();
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== VERSION HISTORY / BACKUPS ====================

router.get('/admin/backups', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, 'backups'), orderBy('createdAt', 'desc')));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/backups', requireAuthMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    const [settingsSnap, homeSnap, projSnap, expSnap, eduSnap] = await Promise.all([
      getDoc(doc(db, 'site_settings', 'general')),
      getDoc(doc(db, 'pages', 'home')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'experience')),
      getDocs(collection(db, 'education'))
    ]);

    const backupId = `backup-${Date.now()}`;
    const backupData = {
      id: backupId,
      note: note || 'Manual snapshot',
      createdAt: new Date().toISOString(),
      createdBy: req.adminUser.username,
      data: {
        settings: settingsSnap.data() || {},
        homePage: homeSnap.data() || {},
        projects: projSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        experience: expSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        education: eduSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    };

    await setDoc(doc(db, 'backups', backupId), backupData);
    res.json({ success: true, message: 'Snapshot created', backup: backupData });
  } catch (err) {
    res.status(500).json({ error: `Backup failed: ${err.message}` });
  }
});

router.post('/admin/backups/:id/restore', requireAuthMiddleware, async (req, res) => {
  try {
    const snap = await getDoc(doc(db, 'backups', req.params.id));
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const { data } = snap.data();
    if (!data) return res.status(400).json({ error: 'Invalid backup format' });

    if (data.settings) {
      await setDoc(doc(db, 'site_settings', 'general'), data.settings);
    }
    if (data.homePage) {
      await setDoc(doc(db, 'pages', 'home'), data.homePage);
    }
    if (Array.isArray(data.projects)) {
      for (const p of data.projects) {
        await setDoc(doc(db, 'projects', p.id), p);
      }
    }

    invalidateCache();
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (err) {
    res.status(500).json({ error: `Restore failed: ${err.message}` });
  }
});

export default router;


