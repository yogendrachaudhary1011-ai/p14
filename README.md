# Yogendra Chaudhary — UI/UX & Product Designer Portfolio (React Application)

This repository contains the complete portfolio and dynamic admin CMS for Yogendra Chaudhary, rewritten as a modern React application powered by Vite, TypeScript, and state persistence.

## Features

- **Public Portfolio**:
  - **Homepage (`/`)**: Hero section with interactive 3D ID Card stage and lanyard physics, typography reveal, filterable selected work grid, and sticky about/experience panel with media.
  - **Selected Work (`/projects`)**: Full portfolio gallery with category filtering (`All`, `Product Design`, `Design Practice`).
  - **About (`/about`)**: Detailed background, career journey, experience timeline, and education/language credentials.
  - **7 Case Studies**:
    - `waroong-app`: Numira Accounting & Business Management Software
    - `taman-safari-digital-map`: SOMTU Website (87 screens, 81 component variants, interactive prototype)
    - `sdd-website-revamp`: The Vedic Sewa service platform
    - `enterprise-asset-maintenance`: Workflow Design for Complex Software
    - `dana-study-case`: Usability Testing & Iteration
    - `sdd-marketing-archive`: Reusable UI & Design Systems (interactive carousels & video reels)
    - `pti-brand-foundation`: Developer Handoff & Collaboration (component states & design tokens)
  - **Dynamic Case Study Engine**: Supports any newly created projects from the CMS.

- **Admin CMS (`/admin`)**:
  - Dedicated admin portal with secure authentication.
  - Full CRUD operations for projects, case study metadata, and media covers.
  - Experience timeline manager with current role indicators and skill tags.
  - Education and language credentials manager.
  - Profile and site settings editor (brand name, role, email, phone, location, availability).
  - Media asset library with URL copy and preview.
  - SEO and Open Graph metadata editor.
  - Client and storage persistence with instant UI synchronization.

## Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler & Dev Server**: Vite 8
- **Icons & Fonts**: Plus Jakarta Sans, DM Mono, DM Sans, Inter, Material Symbols Rounded
- **Styling**: Tailored bespoke design system preserved from original portfolio specifications

## Scripts

- `npm run dev`: Runs Vite development server on `0.0.0.0:3000`.
- `npm run build`: Builds the production bundle with Vite.
- `npm run preview`: Previews the production build on `0.0.0.0:3000`.
- `npm run lint`: Verifies lint status.

## Supabase setup

The admin panel stores the complete portfolio (site settings, projects, experience, education, and media references) in `public.portfolio_state` as one atomic snapshot.

1. Run [`supabase/migrations/20261030_portfolio_state.sql`](supabase/migrations/20261030_portfolio_state.sql) in the Supabase SQL Editor.
2. In Supabase Authentication, disable public sign-ups and create the administrator account. The `/admin` sign-in uses that account's email and password.
3. Keep the project's URL and anon key configured in the app. The anon key is public; RLS allows public reads and restricts writes to signed-in Supabase users.

The supplied project's tables were absent when this setup was checked, so the SQL migration must be run before cloud saves can succeed. Local browser storage remains a startup cache; the dashboard reports the cloud connection status after it verifies the database.

