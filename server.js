import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/admin.js';
import { ensureAdminUser } from './lib/auth.js';
import { renderHtml, renderDynamicCaseStudy, getPublishedSnapshot } from './lib/renderer.js';
import { seedDatabaseIfNeeded } from './lib/seed.js';
import { checkFirestore, checkStorage, firestoreDatabaseId, config } from './lib/firebase.js';
import { getDriveMediaContent, getMediaBlob } from './lib/media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable trust proxy for Cloud Run and secure cookies
app.set('trust proxy', 1);

// Body parsing and cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Redirect unpkg fallback requests to the CDN
app.use((req, res, next) => {
  if (req.path.includes('unpkg.com')) {
    const unpkgPath = req.url.substring(req.url.indexOf('unpkg.com') + 'unpkg.com'.length);
    return res.redirect(301, `https://unpkg.com${unpkgPath}`);
  }
  next();
});

// Health check endpoints
app.get(['/healthz', '/api/health'], async (req, res) => {
  const isDbConnected = await checkFirestore();
  const isStorageConnected = await checkStorage();

  res.json({
    status: isDbConnected ? 'ok' : 'degraded',
    server: 'running',
    activeProject: config.projectId || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0706919729',
    firestoreDatabaseId,
    firestoreConnected: isDbConnected,
    storageAvailable: isStorageConnected,
    cmsWritesAllowed: isDbConnected,
    timestamp: new Date().toISOString()
  });
});

// Serve media blobs stored in resilient Firestore binary storage
app.get('/api/media/blob/:id', async (req, res) => {
  try {
    const blob = await getMediaBlob(req.params.id);
    if (!blob) {
      return res.status(404).send('Asset not found');
    }
    res.setHeader('Content-Type', blob.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(blob.buffer));
  } catch (err) {
    res.status(500).send('Error retrieving media asset');
  }
});

// Public site media is streamed through the app so Drive files can remain private.
app.get('/api/media/drive/:id', async (req, res) => {
  try {
    const asset = await getDriveMediaContent(req.params.id);
    if (!asset) return res.status(404).send('Asset not found');
    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Length', asset.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(asset.buffer);
  } catch (err) {
    console.error('[Google Drive] Could not serve media:', err.message);
    res.status(502).send('Media storage temporarily unavailable');
  }
});

// Mount admin API endpoints
app.use('/api', adminRoutes);

// Dedicated Full-Page Admin CMS application
app.get(['/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Canonical existing project case studies mapping
const canonicalCaseStudies = {
  'waroong-app': 'waroong-app/index.html',
  'taman-safari-digital-map': 'taman-safari-digital-map/index.html',
  'sdd-website-revamp': 'sdd-website-revamp/index.html',
  'enterprise-asset-maintenance': 'enterprise-asset-maintenance/index.html',
  'dana-study-case': 'dana-study-case/index.html',
  'sdd-marketing-archive': 'sdd-marketing-archive/index.html',
  'pti-brand-foundation': 'pti-brand-foundation/index.html'
};

// Public Pages with Dynamic Server-Side Content Binding
app.get('/', async (req, res, next) => {
  try {
    const html = await renderHtml('index.html', '/');
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

app.get(['/about', '/about.html'], async (req, res, next) => {
  try {
    const html = await renderHtml('about.html', '/about');
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

app.get(['/projects', '/projects.html'], async (req, res, next) => {
  try {
    const html = await renderHtml('projects.html', '/projects');
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

// Serve case study routes with dynamic content binding
for (const [slug, templatePath] of Object.entries(canonicalCaseStudies)) {
  const handler = async (req, res, next) => {
    try {
      const html = await renderHtml(templatePath, `/${slug}`);
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.send(html);
    } catch (err) {
      next(err);
    }
  };

  app.get(`/${slug}`, handler);
  app.get(`/${slug}/`, handler);
  app.get(`/${slug}/index.html`, handler);
}

// Dynamic Project Route for newly created projects from Admin CMS
app.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;
  try {
    const snapshot = await getPublishedSnapshot();
    const project = (snapshot.projects || []).find(p => p.slug === slug);

    if (project) {
      if (canonicalCaseStudies[slug]) {
        const html = await renderHtml(canonicalCaseStudies[slug], `/${slug}`);
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        return res.send(html);
      }
      const html = await renderDynamicCaseStudy(project);
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.send(html);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Serve static assets, images, media, css, js
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Fallback to dynamic homepage
app.use(async (req, res) => {
  try {
    const html = await renderHtml('index.html', '/');
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send(html);
  } catch (err) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Boot and seed
app.listen(PORT, HOST, async () => {
  console.log(`Portfolio server with CMS running at http://${HOST}:${PORT}`);
  try {
    await ensureAdminUser();
    await seedDatabaseIfNeeded();
  } catch (e) {
    console.warn('[Bootstrap] Startup check completed:', e.message);
  }
});

