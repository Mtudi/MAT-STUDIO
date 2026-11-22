# MAT-STUDIO Project Inventory
Updated: 2026-11-22

## Linked GitHub repositories

| Repository | Visibility | Audit result |
|---|---|---|
| MAT-STUDIO | Public | Main product repository: seven project folders, Xi root app, experiments, Motion Atelier 3D Studio, local MCP bridge, API routes and docs. |
| MAT-CORE | Private | Internal library for research, reusable code, AI, UI/UX, animation, security, chess and music; also contains the MATUDI AI Engine source. |
| matudi-ai-workspace | Private | Empty except for README; no deployable source found. |
| Mat | Public | Empty repository; no deployable source found. |

The other linked GitHub identity returned no repositories.

## MAT-STUDIO applications

| Project | Source | Verified source functionality | Route |
|---|---|---|---|
| Xi Personal AI | Root `index.html`, `api/xi-auth.js`, `api/xi-chat.js` | Owner-authenticated AI engine bridge, local conversations, optional Gemini key mode. Secure engine use requires owner login. | `/` |
| Xi Workspace (legacy UI snapshot) | `projects/ai-workspace/index.html` | Static Xi — Personal AI UI prototype with legacy `/api/chat` and `/api/supabase-config` references; not the separate MATUDI AI Workspace. Preserved for reference. | legacy UI only |
| MATUDI AI Workspace (private) | `Mtudi/matudi-ai-workspace` | Separate from Xi. GitHub repository currently contains only `README.md` (21 bytes); no `package.json`, `src/`, `server.ts`, Firebase config or deployable app source. The earlier 38-file source archive was not found in the current Library. | private, read-only audit |
| Chess Lab | `projects/chess-lab/index.html` | Main branch: chess.js legal move handling, history, undo/reset/flip, promotion and FEN/PGN copy. PR #10 adds Stockfish 19 lite analysis, PGN import/download and move review. Browser checks cover UCI/WASM and mobile; latest Vercel preview is blocked by the daily quota. | `/projects/chess-lab/index.html` |
| MATSONG Crimson Edition | `projects/matsong/index.html` | PR #12 promotes a richer Crimson Edition to the canonical path, reuses the existing IndexedDB database and archives the previous HTML. Adds Spotify PKCE refresh, catalog search, Premium Web Playback, favorites, official embed fallback and Media Session. Local audio remains device-only. | `/projects/matsong/index.html` |
| MATUDI DEUTSCH | `projects/deutsch/index.html` | 71-word Arabic-supported A1 path with 8 original units, grammar explanations, listening/reading checks, writing/speaking models, spaced review and a 60-minute daily checklist. Public preview: https://sharable.link/t5cevsdg. GitHub Actions static and Playwright browser checks passed before merge. | `/projects/deutsch/index.html` |
| MATUDI Christmas | `projects/christmas/index.html` | PR #13 adds local draft save/restore/clear, Arabic-safe share links, shared-card mode, client-side Canvas PNG export and accessibility/mobile refinements. | `/projects/christmas/index.html` |
| MATUDI Portfolio | `projects/portfolio/index.html` | PR #13 redesigns the portfolio with a responsive light/dark layout, six evidence-based project cards, accessible category filters and GitHub contact path. | `/projects/portfolio/index.html` |
| Motion Atelier 3D Studio | `Motion Atelier 3D Studio.html` | Browser 3D studio with character, animation, pose, face and physics/view controls. | `/Motion%20Atelier%203D%20Studio.html` |

## Experiments and local tools

- **Xi Legacy (index (3).html):** alternate earlier Xi build using a viewer-supplied Gemini API key and local video-file analysis. Keep it archived; do not present it as the current secure-server workspace.

- **Xi ChatGPT Edition:** archived standalone experiment. Outside its Claude-hosted context, Gemini mode needs the viewer's own API key.
- **MATSONG Next:** separate `matsong-next` branch; newer discovery UI and Spotify Web Playback SDK experiment. Spotify redirect registration and Premium playback require verification before promotion.
- **Motion Atelier AI Bridge:** local MCP server in `bridge/`; runs on the user's computer and connects an MCP client to the open editor. Not a hosted web app.
- **Motion Atelier Open-Source Toolchain:** `motion-toolchain.html`; catalog of ten specialist animation tools, official documentation, verified media/data hand-offs, and adapter priorities. A public browser preview is available at https://sharable.link/jf22dpsr.
- Development branches: `xi-cloud-integration`, `xi-design-only`, `xi-supabase-chat`. These are development lines, not separate products.

## Active release candidates

- **Chess Lab — PR #10:** https://github.com/Mtudi/MAT-STUDIO/pull/10 — Stockfish/PGN upgrades; CI covers engine/WASM and mobile.
- **Xi Workspace — PR #11:** https://github.com/Mtudi/MAT-STUDIO/pull/11 — UX/API security changes; static, API and browser CI.
- **MATSONG — PR #12:** https://github.com/Mtudi/MAT-STUDIO/pull/12 — database migration, Spotify integration and regression tests; real Premium playback remains a post-deploy gate.
- **Christmas + Portfolio — PR #13:** https://github.com/Mtudi/MAT-STUDIO/pull/13 — draft/share/PNG export and portfolio redesign; browser tests pass for draft persistence, Arabic-safe sharing, PNG export, portfolio/Hub filters, theme persistence and mobile layout.
- **Motion Atelier — PR #14:** https://github.com/Mtudi/MAT-STUDIO/pull/14 — custom clip JSON export/import, input validation and accessible controls; WebGL/SwiftShader browser tests pass for custom clip JSON export/import, validation, persistence, keyboard playback and mobile layout.
- **Xi public landing — PR #15:** https://github.com/Mtudi/MAT-STUDIO/pull/15 — crimson public overview, owner-only access explanation and responsive browser checks; preview: https://sharable.link/9m2vmt6e.
- Vercel's free API deployment quota requires a 24-hour wait. No more deployments or CLI workarounds should be attempted until it resets.

## Internal infrastructure

- **MATUDI AI Engine:** server-side API in private MAT-CORE. It requires a Bearer token and configured origin policy; it is not a public end-user app.
- **MAT-CORE:** private internal library. Its contents and credentials must not be published.

## Other Vercel deployments

- **IM MAT Chess Arena:** public Vercel deployment; no matching source repository was found in the linked GitHub account.
- **Motion Atelier Lab:** separate Vercel deployment with SSO protection; distinct from the GitHub-hosted 3D Studio HTML.
- **Tuqa Focus Garden:** separate Vercel deployment with SSO protection; no matching source repository found.
- Earlier showcase attempts created duplicate preview projects. Canonical project links should point to the MAT-STUDIO production routes, not to incomplete duplicates.

## Security and quality notes

- Vercel `READY` confirms deployment completion only; it does not prove every feature works.
- The Supabase `ai_conversations` and `ai_messages` tables have RLS enabled. Policies scope rows to `auth.uid() = user_id` or ownership through the conversation row.
- Supabase Auth logs show a successful anonymous login on 2026-11-20 after earlier `anonymous_provider_disabled` errors.
- Supabase security advisors still warn that anonymous users can access their own rows under these policies and that leaked-password protection is disabled. Keep ownership checks; review password protection separately.
- Private repositories, provider keys, owner passwords and server tokens must remain private/server-side.
