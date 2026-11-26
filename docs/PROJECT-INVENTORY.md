# MAT-STUDIO Project Inventory
Updated: 2026-11-27

## Linked GitHub repositories

| Repository | Visibility | Audit result |
|---|---|---|
| MAT-STUDIO | Public | Main product repository: eight project folders, Xi root app, experiments, Motion Atelier 3D Studio, local MCP bridge, API routes and docs. |
| MAT-CORE | Private | Internal library for research, reusable code, AI, UI/UX, animation, security, chess and music; also contains the MATUDI AI Engine source. |
| matudi-ai-workspace | Private | Empty except for README; no deployable source found. |
| Mat | Public | Empty repository; no deployable source found. |

The other linked GitHub identity returned no repositories.

## MAT-STUDIO applications

| Project | Source | Verified source functionality | Route |
|---|---|---|---|
| Xi Personal AI | Root `index.html`, `api/xi-auth.js`, `api/xi-chat.js` | Owner-authenticated AI engine bridge, local conversations, optional Gemini key mode. Secure engine use requires owner login. | `/` |
| MATUDI AI Workspace | `projects/ai-workspace/index.html`, root API routes | Guest login, optional email login, streamed OpenRouter chat, local history, optional Supabase cloud sync and optional direct Gemini provider. | `/projects/ai-workspace/index.html` |
| Chess Lab | `projects/chess-lab/index.html` | Main branch: chess.js legal move handling, history, undo/reset/flip, promotion and FEN/PGN copy. PR #9 proposes Stockfish analysis, PGN import/download and move-by-move review; browser tests are running, production preview pending. | `/projects/chess-lab/index.html` |
| MATSONG Crimson Edition | `projects/matsong/index.html` | Local audio import, IndexedDB library, queue, favorites, shuffle/repeat/volume and Spotify share-link embeds and account/profile connection; hosted preview: https://sharable.link/89k1u749. Not a licensed Spotify streaming catalogue. | `/projects/matsong/index.html` |
| MATUDI DEUTSCH | `projects/deutsch/index.html` | 71-word Arabic-supported A1 path with 8 original units, grammar explanations, listening/reading checks, writing/speaking models, spaced review and a 60-minute daily checklist. Public preview: https://sharable.link/t5cevsdg. GitHub Actions static and Playwright browser checks passed before merge. | `/projects/deutsch/index.html` |
| MATUDI Christmas | `projects/christmas/index.html` | Greeting-card editor, themes, live preview, share URL, copy/share and print. | `/projects/christmas/index.html` |
| MATUDI Portfolio | `projects/portfolio/index.html` | Personal portfolio with introduction, focus, selected work and approach. | `/projects/portfolio/index.html` |
| Motion Atelier 3D Studio | `Motion Atelier 3D Studio.html` | Browser 3D studio with character, animation, pose, face and physics/view controls. | `/Motion%20Atelier%203D%20Studio.html` |
| BUGATTI — Pour l'Éternité | `projects/bugatti-atelier/index.html` | Independent Tourbillon concept with cinematic storytelling, published engineering facts, responsive navigation and visual paint/material selectors. Playwright CI smoke passed on 2026-11-26; physical-device and image-host checks remain pending. | [Public concept preview](https://sharable.link/vax7b4wr) |

## Experiments and local tools

- **Xi Legacy (index (3).html):** alternate earlier Xi build using a viewer-supplied Gemini API key and local video-file analysis. Keep it archived; do not present it as the current secure-server workspace.

- **Xi ChatGPT Edition:** archived standalone experiment. Outside its Claude-hosted context, Gemini mode needs the viewer's own API key.
- **MATSONG Next:** separate `matsong-next` branch; newer discovery UI and Spotify Web Playback SDK experiment. Spotify redirect registration and Premium playback require verification before promotion.
- **Motion Atelier AI Bridge:** local MCP server in `bridge/`; runs on the user's computer and connects an MCP client to the open editor. Not a hosted web app.
- **Motion Atelier Open-Source Toolchain:** `motion-toolchain.html`; catalog of ten specialist animation tools, official documentation, verified media/data hand-offs, and adapter priorities. A public browser preview is available at https://sharable.link/jf22dpsr.
- Development branches: `xi-cloud-integration`, `xi-design-only`, `xi-supabase-chat`. These are development lines, not separate products.

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
