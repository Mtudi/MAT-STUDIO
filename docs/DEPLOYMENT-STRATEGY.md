# MAT-STUDIO Multi-Platform Deployment Strategy
Updated: 2026-11-22

## Goal
Preserve every existing project URL and source while distributing hosting workloads across providers. Vercel remains canonical. Railway is a secondary deployment for the audited Xi frontend + Node API adapter. Render is connected to ChatGPT, but its currently accessible workspace returns zero services; no Render deployment has been created. Cloudflare Pages and Netlify are not configured.

## Provider state
| Workload | Primary | Secondary | Verified state |
|---|---|---|---|
| Xi UI + owner API | Existing Vercel MAT-STUDIO | Railway `mat-studio-production.up.railway.app` | Railway service online, 1/1 replica, no active alerts. Internal `/healthz` passed. Public URL tests and owner auth/chat remain unverified. |
| MATUDI AI Engine | Existing Vercel `matudi-ai-engine` | None | Keep credentials and AI Engine on Vercel. |
| Project pages (AI Workspace, Chess Lab, MATSONG, Deutsch, Christmas, Portfolio, Motion Atelier) | Existing Vercel routes/projects | Railway static paths only after route tests | Source files exist in the repository; do not promote alternate URLs without browser and asset-path checks. |
| Render | Not assigned | Candidate only | Connected workspace currently contains zero listed services. No duplicate service created. |

## Canonical project paths in GitHub `xi-design-only`
- Xi: `/`
- AI Workspace: `/projects/ai-workspace/index.html`
- Chess Lab: `/projects/chess-lab/index.html`
- MATSONG: `/projects/matsong/index.html`
- Deutsch A1: `/projects/deutsch/index.html`
- Christmas: `/projects/christmas/index.html`
- Portfolio: `/projects/portfolio/index.html`
- Motion Atelier 3D Studio: `/Motion%20Atelier%203D%20Studio.html`

## Routing and quota policy
1. GitHub is the source of truth; deploy only audited commits and intended application paths.
2. Keep all existing Vercel projects, domains and production deployments active. Do not delete, disable, repoint or bulk-remap them.
3. Use Railway as a secondary host for selected static previews and Node-compatible workloads when Vercel quotas are constrained.
4. Keep AI Engine on existing Vercel until a separately audited and secured replacement is ready.
5. Do not create a deployment for every edit. Batch verified changes and run smoke tests first.
6. A provider is not a valid failover target until its public HTTPS URLs, paths, API routes, auth, integrations and mobile layout have been tested.
7. No automatic cross-provider failover or shared load-balancing router currently exists. Fallback means a separately tested URL and deliberate operator switch.
8. Render is connected but its chosen workspace currently lists no services. Do not create duplicates until the correct workspace/resource strategy is confirmed.
9. Never silently migrate existing projects or infer that a provider is connected merely from its presence in the plugin directory.

## Railway service configuration
- Project: `MAT-STUDIO`
- Service: `mat-studio`
- URL: `https://mat-studio-production.up.railway.app`
- Source: `Mtudi/MAT-STUDIO`, branch `xi-design-only`
- Start command: `npm start`
- Health check: `/healthz`
- `MATUDI_ENGINE_URL=https://matudi-ai-engine.vercel.app`

### Required private Railway variables
Before Xi owner login/chat can be tested, set these through Railway's private Variables UI:
- `MATUDI_ENGINE_TOKEN`
- `MAT_STUDIO_CHAT_PASSWORD`

Use the current trusted values from the existing Vercel project environment. Do not paste them into chat, GitHub, issues, code or client-side HTML. Encrypted Vercel secret payloads are not plaintext and must not be copied.

## Health and deployment notes
- Latest Railway deployment `d4d00bf8-b2ff-460b-8f1f-399c3693a2ad` is SUCCESS.
- Latest environment status: `mat-studio` online, 1 running replica, 0 crashed, 0 warnings, 0 criticals, 0 recent failures.
- Railway build logs included early start retries (`npm: command not found`) before runtime became ready; the final internal `/healthz` check succeeded. Treat health as process-level only, not full route/auth success.
- Public Railway path checks were not completed from the execution runtime due external DNS resolution failure.
- There is a separate staged Railway service `omniroute` with related variables and volume still in a pending patch. It is not MAT-STUDIO and was not committed or deployed. Leave it alone until explicitly audited; do not accidentally approve the staged patch as part of this project.
- Render list_services returned zero services for the currently connected workspace. No Render resources were created.

## Release checklist
- [ ] Confirm exact source branch and commit.
- [ ] Run static HTML and inline-JS checks.
- [ ] Run project-specific browser smoke tests.
- [ ] Confirm all existing Vercel project URLs are unchanged.
- [ ] Check Railway public HTTPS root and all intended project paths.
- [ ] Test owner authentication and chat after private secrets are configured.
- [ ] Test backend, storage, media and provider integrations separately.
- [ ] Check mobile layout and browser console.
- [ ] Record provider, commit, URL and test results.
- [ ] Promote an alternate URL only after all checks pass.

## Do not claim
- Do not claim automatic traffic failover/load balancing.
- Do not claim Railway owner login or AI chat works before secrets are set and end-to-end tested.
- Do not claim Render hosts an app until a service is deployed and tested.
- Do not equate internal Railway healthcheck with public internet reachability.


## Automated verification added — 2026-11-22
- Added `npm test` using Node's built-in test runner; no third-party test dependencies.
- Added GitHub Actions workflow `.github/workflows/quality.yml` for pushes and pull requests.
- Latest run for commit `3715c589040302f3aeb472325eab037e1b041c2b`: **10 tests passed, 0 failed**.
- Coverage: health endpoint, Xi root HTML and headers, all seven known project page paths, directory-to-index routing (including Xi/MATSONG/Chess Lab/Portfolio), HEAD behavior, unsupported methods, encoded path-traversal rejection, owner auth state, signed HttpOnly owner session, and chat rejection without owner session.
- Fixed Railway static serving so project directory URLs resolve to their `index.html`; added common media/manifest MIME types.
- Switched Railway start command from `npm start` to `node server.js` to avoid unnecessary npm startup dependency. Node remains selected by root `package.json`.
- Railway latest source build is being deployed from `xi-design-only` at `3715c589040302f3aeb472325eab037e1b041c2b`; verify its final status before calling the new version live.
- Public domain is still not independently reachable from this execution environment's browser/DNS tooling; internal Railway health and GitHub CI do not substitute for an external public HTTP smoke test.
