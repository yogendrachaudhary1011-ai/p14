# Yogendra Chaudhary — UI/UX & Product Designer Portfolio & CMS

This repository contains the public portfolio and admin CMS. The application stores CMS records in Supabase Postgres and uploaded media in Supabase Storage.

## Architecture

- **Public frontend**: Static HTML, CSS, and JavaScript pages with responsive layouts and animations.
- **Server-side content binding**: Node.js and Express bind published CMS records into canonical page templates.
- **Database**: Supabase Postgres stores CMS documents as JSONB records, preserving the portfolio's flexible case-study content.
- **Media**: Supabase Storage holds public portfolio assets. Upload and delete operations are performed by the server.
- **Admin CMS**: A dedicated dashboard at `/admin` manages projects, experience, education, navigation, resume, SEO, media, and backups.

## Configuration

Set these values in the server environment:

- `SUPABASE_URL`: the Supabase project URL.
- `SUPABASE_SECRET_KEY`: a server-only Supabase secret key. Do not put it in browser code or commit it.
- `SUPABASE_MEDIA_BUCKET`: optional; defaults to `portfolio-media`.
- `INITIAL_ADMIN_PASSWORD`: required only when the initial admin record is created.
- `TEST_ADMIN_USERNAME` and `TEST_ADMIN_PASSWORD`: used by the CMS acceptance tests.

The Supabase secret key must stay on the server. Supabase documents that secret keys bypass row-level security and must not be exposed to users or committed to source control: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

## Database setup and data migration

1. Create or select a Supabase project.
2. Apply `supabase/migrations/20261030000000_initial_portfolio_schema.sql` in that project's SQL editor. It creates the private CMS data table, a server-only batch function, and the public media bucket.
3. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the server environment.
4. Run `npm run migrate:supabase` once to copy existing Firestore CMS records and uploaded media. The migration leaves Firebase data untouched and does not copy active login sessions.
5. Verify the portfolio, admin sign-in, and media library before removing the old Firebase configuration or project.

The import refuses to overwrite destination data unless `SUPABASE_IMPORT_OVERWRITE=true` is explicitly set. Keep a copy of the source until the Supabase deployment is confirmed.

## Available scripts

- `npm run dev`: Start the server locally.
- `npm start`: Start the production server.
- `npm run doctor`: Check Supabase database and Storage connectivity.
- `npm run seed`: Seed baseline CMS data only when the database has not already been initialized.
- `npm run migrate:supabase`: Copy current Firestore records and media into Supabase.
- `npm test`: Run the CMS acceptance suite.

## Key endpoints

- `/`: Homepage
- `/about`: About page
- `/projects`: Selected work
- `/admin`: Admin CMS
- `/healthz` and `/api/health`: Database and Storage status
- `/api/auth/*`: Admin authentication
- `/api/admin/*`: Protected CMS operations
- `/api/media/blob/:id`: Legacy media URL compatibility through Supabase Storage
