YOGENDRA PORTFOLIO — FRONTEND-ONLY AI STUDIO HANDOFF

This package intentionally contains ONLY the approved public portfolio frontend plus this handoff documentation.

Included:
- index.html
- about.html
- projects.html
- all existing project/case-study pages
- assets/site.css
- all public JavaScript interactions/animations
- all media assets
- Yogendra_Chaudhary_CV.pdf
- GOOGLE_AI_STUDIO_MASTER_PROMPT.txt

Intentionally removed:
- backend/server code
- database files
- Supabase configuration/integration
- admin/CMS files
- API routes
- CMS runtime/injection code
- local persistence code
- deployment configuration from the old backend

The public frontend files were copied byte-for-byte from the supplied portfolio package. The design, content, interactions, animations, styles, routes, and assets have not been rewritten in this cleanup.

GOOGLE AI STUDIO WORKFLOW
1. Create/choose a clean GitHub repository.
2. Put the CONTENTS of this folder at the repository root. index.html should be visible at the root.
3. Push to GitHub.
4. Import the repository into Google AI Studio Build mode.
5. Open GOOGLE_AI_STUDIO_MASTER_PROMPT.txt.
6. Paste the ENTIRE prompt into AI Studio as one request.
7. Let AI Studio complete the implementation and run its checks.
8. Before deployment, verify the public site visually against the original frontend.
9. Verify /admin and Supabase persistence using the acceptance tests in the prompt.

Do not merge old backend/admin/database files back into this repository. The purpose of this package is to give AI Studio a clean frontend source of truth and force it to build the dynamic system from scratch.
