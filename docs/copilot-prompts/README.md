# PROCTO — GitHub Copilot Prompt Library

This folder contains ready-to-copy Copilot prompts for generating pages and components for the PROCTO app.

How to use
- Open one of the files (they are plain TSX files that contain only a large comment block describing the prompt).
- Copy the entire comment block (including /* ... */) and paste it into a new, empty `.tsx` file in your Next.js app (for example, `apps/web/src/app/auth/page.tsx`).
- Then invoke GitHub Copilot / Copilot Chat or use the comment block as instructions to generate the component implementation.

Files
- `auth-prompt.tsx` — Scalable auth page prompt (Sign In / Sign Up / Forgot Password)
- `dashboard-prompt.tsx` — Student Dashboard prompt with charts and widgets
- `homepage-prompt.tsx` — Full homepage prompt (in-order sections)
- `about-prompt.tsx` — About page prompt

Notes
- These files are intentionally comment-only so you can copy the prompt directly into a new TSX file.
- Do not commit secrets or environment variables to the repo. Use `.env` files locally.
