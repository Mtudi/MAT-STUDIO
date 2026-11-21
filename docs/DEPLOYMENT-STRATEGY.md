# MAT-STUDIO Multi-Platform Deployment Strategy
Updated: 2026-11-21

## Goal
Preserve every existing project URL and source while distributing hosting workloads across providers. Vercel remains the canonical production provider; Railway is a live secondary deployment for the MAT-STUDIO static application and Node compatibility layer. Future providers may be added only after their deployment and domain paths are verified.

## Current provider assignments

| Workload | Primary | Secondary / fallback | Notes |
|---|---|---|---|
| Xi Personal AI UI and owner API | Existing Vercel `mat-studio` | Railway `mat-studio-production.up.railway.app` | Railway needs the owner password and engine token entered through its private Variables UI before owner login/chat can be considered functional. |
| MATUDI AI Engine | Existing Vercel `matudi-ai-engine` | None configured | Keep engine and its server-side Gemini credentials on Vercel. Do not copy encrypted Vercel secrets or expose tokens in Git. |
| AI Workspace | Existing Vercel project/routes | Railway static mirror | Guest/cloud sync and chat require the existing backend configuration; static HTML availability is not feature verification. |
| Chess Lab, MATSONG, Deutsch, Christmas, Portfolio, Motion Atelier | Existing Vercel canonical routes | Railway static mirror | The same GitHub commit can serve the project subpaths on Railway. Validate each app before promoting any alternate URL. |
| Public project showcase | Existing sharable.link showcase | Existing Vercel showcase project | Keep the public share link stable; do not repoint it without a verified replacement. |
| MATUDI AI Engine private source / MAT-CORE | Private repository and existing provider | No public mirror | Never deploy private source or credentials to a public static host. |

## Canonical project paths
- Xi Personal AI: `/`
- AI Workspace: `/projects/ai-workspace/index.html`
- Chess Lab: `/projects/chess-lab/index.html`
- MATSONG: `/projects/matsong/index.html`
- Deutsch A1: `/projects/deutsch/index.html`
- Christmas: `/projects/christmas/index.html`
- Portfolio: `/projects/portfolio/index.html`
- Motion Atelier 3D Studio: `/Motion%20Atelier%203D%20Studio.html`

## Routing and quota policy
1. GitHub is the source of truth. A provider must deploy an audited commit and the intended project path.
2. Keep Vercel production deployments and domains active. Do not delete, disable, or repoint existing projects as a quota-saving shortcut.
3. Use Railway for secondary previews, static delivery, and Node-compatible workloads when Vercel build/deployment quotas are constrained.
4. Keep the AI Engine on its existing Vercel deployment until a separately audited secure replacement exists. Railway frontend requests continue to use the configured engine URL.
5. Do not create a new deployment for every small edit. Batch verified changes, run static/browser checks, then deploy once.
6. A provider is not an active failover target until its public URL, project paths, API paths, auth flow, and mobile layout have been tested. Railway's internal healthcheck alone proves only that the Node process is healthy.
7. Do not claim automatic traffic failover or load balancing: no shared custom-domain routing, health-based DNS, or cross-provider request router is configured yet. Current fallback is a separately available alternate URL and a deliberate operator switch.
8. Add Cloudflare Pages or Netlify only when their account connection, build settings, and real deployment checks are complete. Do not assume they are connected or silently create duplicate deployments.

## Railway environment prerequisites
The Railway service `MAT-STUDIO / mat-studio` currently has:
- `MATUDI_ENGINE_URL=https://matudi-ai-engine.vercel.app`
- Health check: `/healthz`
- Start command: `npm start`

Before Xi owner login/chat can be tested on Railway, add these values privately in Railway service Variables:
- `MATUDI_ENGINE_TOKEN`
- `MAT_STUDIO_CHAT_PASSWORD`

Use the existing values from the trusted Vercel project environment. Never paste secrets into GitHub, issue comments, chat messages, or client-side HTML. Do not attempt to retrieve or copy encrypted secret payloads.

## Release checklist
- [ ] Confirm the intended source branch and commit.
- [ ] Run the repository static HTML/inline-JavaScript quality workflow.
- [ ] Run project-specific browser smoke tests where available.
- [ ] Confirm all canonical Vercel routes remain unchanged.
- [ ] Confirm Railway `/healthz` and every required static path over public HTTPS.
- [ ] Test backend, authentication, storage, and provider integrations separately from static page loading.
- [ ] Check mobile layout and browser console for the changed project.
- [ ] Record provider, commit SHA, URL, and test result in the release notes.
- [ ] Promote an alternate provider only after the above checks pass.

## Current limitations
- Railway is deployed and its platform healthcheck passed, but public path-by-path browser checks have not yet been confirmed.
- Xi Railway secrets have not been transferred; owner login/chat are not verified there.
- The alternate Railway URL is not wired as automatic failover for existing Vercel domains.
- Cloudflare Pages and Netlify are not configured as deploy targets yet.
