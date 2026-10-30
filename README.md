# Yogendra Chaudhary — UI/UX & Product Designer Portfolio & CMS

This repository contains the complete portfolio and dynamic admin CMS for Yogendra Chaudhary, backed by Firebase Cloud Firestore.

## Architecture

- **Public Frontend**: High-performance, pixel-perfect static HTML/CSS/JavaScript with full animation fidelity, responsive layouts, and zero client-side layout shifts (no FOUC).
- **Server-Side Content Binding**: Fast Node.js Express server using Cheerio to bind published Firestore snapshot data into canonical templates on request with in-memory caching.
- **Persistence Layer**: Google Cloud Firestore (`ai-studio-pf11-f733d483-d6eb-49d4-b39f-52d8a40fba86`) as the authoritative production source of truth. No local JSON files or SQLite fallbacks.
- **Media Management**: Resilient media engine supporting Cloud Storage and native Firestore binary chunks (`media_blobs`) with live preview, usage reference checks, and alt-text editing.
- **Admin CMS**: Dedicated full-page dashboard at `/admin` (never an overlay on the public site) with secure bcrypt authentication, rate limiting, and full CRUD for projects, experience, education, navigation, resume, SEO, and backups.

## Getting Started

### Initial Admin Credentials
- **Username**: `Zane Wick`
- **Password**: `Zane@123`

The initial password hash is stored server-side in Firestore. Passwords can be updated at any time in **Admin > Security**.

### Available Scripts
- `npm run dev`: Starts the Node.js server on `0.0.0.0:3000`.
- `npm start`: Production server start.
- `npm test`: Runs the automated CMS acceptance test suite (auth, validation, CRUD, persistence, route checks).
- `npm run doctor`: Runs connectivity diagnostics for Firestore and Storage.
- `npm run seed`: Idempotently seeds the database from the current frontend baseline if not already initialized.

## Key Endpoints
- `/`: Dynamic public homepage
- `/about`: Dynamic about profile and experience
- `/projects`: Dynamic selected work showcase
- `/admin`: Dedicated admin CMS dashboard and login
- `/healthz` & `/api/health`: Health status reporting active database and connection state
- `/api/auth/*`: Session authentication, logout, and password management
- `/api/admin/*`: Protected CMS CRUD operations
- `/api/media/blob/:id`: Live binary asset streaming

## Deployment

The application is pre-configured for **Firebase App Hosting**:
- `apphosting.yaml` configures Node 22, memory, concurrency, and environment variables.
- `firebase.json` binds Firestore rules and indexes.
- `firestore.rules` and `storage.rules` secure database and bucket access.
